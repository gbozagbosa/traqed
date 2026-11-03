const { chromium } = require('playwright'); const fs=require('fs'); const {spawn}=require('child_process');
(async()=>{
 const tl=JSON.parse(fs.readFileSync('timeline.json')); const mode=process.argv[2]||'full'; const FPS=25;
 const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1.5});
 await p.goto('file://'+__dirname+'/video.html'); await p.evaluate(t=>setTL(t),tl); await p.evaluate(()=>document.fonts.ready);
 if(mode==='preview'){ for(const t of process.argv.slice(3)){ await p.evaluate(x=>render(x),+t); await p.screenshot({path:`prev_${t}.png`}); } await b.close(); return; }
 const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-i','voice.wav','-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-preset','medium','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart','nigeria_today_3nov2026.mp4'],{stdio:['pipe','ignore','inherit']});
 const N=Math.ceil(tl.total*FPS);
 for(let i=0;i<N;i++){ await p.evaluate(x=>render(x),i/FPS); const buf=await p.screenshot({type:'jpeg',quality:90}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if(i%500===0) console.error('frame',i,'/',N); }
 ff.stdin.end(); await new Promise(r=>ff.on('close',r)); await b.close();
})();
