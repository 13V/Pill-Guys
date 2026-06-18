import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';
const PORT=5193, ENTRY='/previews/particles.html';
const URL=`http://localhost:${PORT}${ENTRY}`;
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--port',String(PORT),'--strictPort'],{stdio:['ignore','pipe','inherit'],detached:true});
await new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('vite timeout')),30000);vite.stdout.on('data',d=>{if(d.toString().includes('ready in')||d.toString().includes('Local:')){clearTimeout(t);setTimeout(res,800);}});});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl']});
try{
  const page=await browser.newPage();
  await page.setViewport({width:1600,height:900,deviceScaleFactor:1.5});
  page.on('pageerror',e=>console.log('PAGE ERROR:',e.message));
  await page.goto(URL,{waitUntil:'networkidle2',timeout:60000});
  await page.waitForFunction('window.__ready === true',{timeout:60000});
  await new Promise(r=>setTimeout(r,1200));
  const info=await page.evaluate(()=>{
    const pts = window.__fx && window.__fx.points;
    const out = { hasPts: !!pts };
    if (pts) {
      out.visible = pts.visible;
      out.renderOrder = pts.renderOrder;
      out.drawRange = JSON.stringify(pts.geometry.drawRange);
      out.uScale = pts.material.uniforms.uScale.value;
      // sample first few positions/alphas/sizes
      const pos = pts.geometry.getAttribute('position').array;
      const a = pts.geometry.getAttribute('aAlpha').array;
      const sz = pts.geometry.getAttribute('aSize').array;
      out.firstPos = [pos[0],pos[1],pos[2]];
      out.firstAlpha = a[0];
      out.firstSize = sz[0];
      out.blending = pts.material.blending; // 2 = Additive
    }
    return out;
  });
  console.log('PROBE:', JSON.stringify(info,null,2));
}finally{await browser.close();try{process.kill(-vite.pid,'SIGKILL');}catch{}}
process.exit(0);
