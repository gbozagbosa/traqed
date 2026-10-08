// First real Composio tool call: connect one app for one user, then run one read-only tool.
//
//   npm run composio -- <toolkit>                       # connect + list candidate tools
//   npm run composio -- <toolkit> <TOOL_SLUG> ['{...}'] # run a tool with JSON arguments
import { Composio } from "@composio/core";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: rely on variables already in the environment.
}

const [toolkit, toolSlug, rawArgs = "{}"] = process.argv.slice(2);
const userId = process.env.COMPOSIO_TEST_USER_ID;

if (!toolkit) throw new Error("Usage: npm run composio -- <toolkit> [TOOL_SLUG] ['{json args}']");
if (!process.env.COMPOSIO_API_KEY) throw new Error("COMPOSIO_API_KEY is not set");
if (!userId) throw new Error("COMPOSIO_TEST_USER_ID is not set");

const composio = new Composio();
const session = await composio.create(userId);

// Connect the app if this user hasn't yet. Composio hosts the OAuth flow and returns a Connect Link.
const { items } = await session.toolkits({ toolkits: [toolkit] });
const state = items.find((t) => t.slug === toolkit);
if (!state) throw new Error(`Unknown toolkit "${toolkit}"`);
if (!state.isNoAuth && !state.connection?.isActive) {
  const request = await session.authorize(toolkit);
  console.log(`Open this link to connect ${state.name}:\n  ${request.redirectUrl}\nWaiting for authorization…`);
  await request.waitForConnection();
}
console.log(`${state.name} connected for user ${userId}`);

if (!toolSlug) {
  // Tool slugs are discovered at runtime, never guessed.
  const found = await session.search({ query: `read-only lookup in ${state.name}`, toolkits: [toolkit] });
  const slugs = [...new Set(found.results.flatMap((r) => [...r.primaryToolSlugs, ...r.relatedToolSlugs]))];
  console.log(`Candidate tools:\n  ${slugs.join("\n  ")}\nRe-run with one of them to execute it.`);
  process.exit(0);
}

const result = await session.execute(toolSlug, JSON.parse(rawArgs));
console.log(`logId: ${result.logId}`);
if (result.error) throw new Error(`${toolSlug} failed: ${result.error}`);
console.log(JSON.stringify(result.data, null, 2).slice(0, 2000));
