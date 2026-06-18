import { spawn } from 'node:child_process';
import process from 'node:process';
import puppeteer from 'puppeteer';
const PORT=5193;
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--port',String(PORT),'--strictPort'],{stdio:['ignore','pipe','inherit'],detached:true});
await new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('vite timeout')),30000);vite.stdout.on('data',d=>{if(d.toString().includes('ready in')||d.toString().includes('Local:')){clearTimeout(t);setTimeout(res,800);}});});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl']});
try{
  const page=await browser.newPage();
  await page.setViewport({width:1600,height:900,deviceScaleFactor:1.5});
  page.on('pageerror',e=>console.log('PAGE ERROR:',e.message));
  page.on('console',m=>console.log('PAGE:',m.text()));
  // Build a clean isolated test harness page that imports the module fresh.
  const testJs = `
    import * as THREE from '/node_modules/.vite/deps/three.js?import';
  `;
  // simpler: navigate to a tiny inline module via data isn't allowed for imports.
  // Instead use the existing preview but then drive update() manually after disabling its loop is hard.
  // So: go to a blank page that imports scene+events+particles directly.
  await page.goto('http://localhost:'+PORT+'/previews/particles.html',{waitUntil:'networkidle2',timeout:60000});
  await page.waitForFunction('window.__ready === true',{timeout:60000});
  const info = await page.evaluate(()=>{
    // Stop the page rAF chaos by reading immediately, then manually re-derive
    // a clean state: clear by reading internal? We can't. Instead, just report
    // the raw CPU pool via a debug hook if present.
    const pts = window.__fx.points;
    const g = pts.geometry;
    const pos = g.getAttribute('position');
    const n = g.drawRange.count;
    const sample=[];
    for(let k=0;k<Math.min(n,5);k++) sample.push([+pos.array[k*3].toFixed(2),+pos.array[k*3+1].toFixed(2),+pos.array[k*3+2].toFixed(2)]);
    return {n, sample, geomType: g.type, posCount: pos.count, itemSize: pos.itemSize};
  });
  console.log('RAW:', JSON.stringify(info));
}finally{await browser.close();try{process.kill(-vite.pid,'SIGKILL');}catch{}}
process.exit(0);
