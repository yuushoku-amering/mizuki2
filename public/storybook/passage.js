(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const key='engawa-book-arrival';
  const sprite = new Image();sprite.src='/rain/yuling-run-cycle.webp';
  let overlay, frame=0, timer=0, leaving=false;
  function landscape(canvas, right){
    const g=canvas.getContext('2d'); canvas.width=560;canvas.height=560;
    function shape(fill,draw,stroke){
      g.beginPath();draw(g);g.fillStyle=fill;g.fill();
      if(stroke){g.strokeStyle=stroke;g.lineWidth=2.5;g.stroke();}
    }
    function hill(y,color,points){shape(color,c=>{c.moveTo(0,y);c.bezierCurveTo(...points);c.lineTo(560,560);c.lineTo(0,560);c.closePath()});}
    g.fillStyle=right?'#fff0cf':'#f6e8c9';g.fillRect(0,0,560,560);
    for(let i=0;i<1400;i++){const x=(i*443.7)%560,y=(i*i*1.37)%560;g.fillStyle=i%2?'#a9773a11':'#fffaf366';g.fillRect(x,y,1.7,1.7)}
    for(const [x,y,k] of (right?[[52,140,.56],[389,76,.70]]:[[92,90,.7],[361,135,.64]])){
      g.save();g.translate(x,y);g.scale(k,k);
      shape('#fffaf0',c=>{c.moveTo(0,19);c.quadraticCurveTo(2,4,19,8);c.bezierCurveTo(22,-18,55,-15,63,3);c.quadraticCurveTo(91,-2,95,18);c.closePath()},'#c7c5aa');g.restore()
    }
    if(right){
      for(const [i,color] of ['#b96859','#e2a55d','#dfc36c','#8fa775','#779eaa'].entries()){
        g.beginPath();g.ellipse(367,261,88-i*7,79-i*7,-.13,Math.PI,2*Math.PI);g.strokeStyle=color;g.lineWidth=7.5;g.stroke();
      }
    }
    hill(310,'#a5beb0',[133,212,339,312,560,234]);hill(351,'#7d9e91',[202,270,385,369,560,302]);
    hill(403,'#c7d2ad',[163,316,331,400,560,335]);
    if(!right){
      g.save();g.translate(155,288);
      shape('#e4d3a5',c=>c.rect(0,0,114,61),'#4c6158');
      shape('#62797c',c=>{c.moveTo(-16,5);c.lineTo(21,-35);c.lineTo(101,-29);c.lineTo(129,6);c.closePath()},'#455c59');
      g.fillStyle='#8d7761';g.fillRect(45,17,29,44);g.fillStyle='#faf0cb';g.fillRect(9,16,22,21);g.restore();
      for(const [x,y,h] of [[109,326,74],[306,319,92],[337,331,51]]){
        g.fillStyle='#826a50';g.fillRect(x-3,y-11,6,24);
        shape('#658678',c=>{c.moveTo(x-19,y-8);c.quadraticCurveTo(x-13,y-h,x,y-h);c.quadraticCurveTo(x+9,y-h+6,x+19,y-9);c.quadraticCurveTo(x,y+1,x-19,y-8)},'#5c7568');
      }
    }
    hill(445,'#e0dbb1',[135,392,385,452,560,393]);
    for(let i=0;i<47;i++){const x=(i*173)%550,y=438+(i*79)%113;g.strokeStyle='#91a07d';g.lineWidth=1.8;g.beginPath();g.moveTo(x-3,y-4);g.lineTo(x,y);g.lineTo(x+2,y-7);g.stroke()}
  }
  function ensure(){
    if(overlay)return;
    overlay=document.createElement('div');overlay.id='storybook-pass';overlay.hidden=true;
    overlay.innerHTML='<div class="veil"></div><div class="spreadfx"><div class="paper"><canvas class="land"></canvas></div><div class="paper right"><canvas class="land"></canvas><div class="traveller"><canvas class="sprite" width="42" height="56" aria-hidden="true"></canvas><div class="track" role="progressbar" aria-label="翻页进度" aria-valuemin="0" aria-valuemax="100"><i></i></div><span class="destination" role="status"></span></div></div><div class="leaf"><canvas class="land"></canvas></div></div><div class="door west"></div><div class="door east"></div>';
    document.body.append(overlay);
    overlay.querySelectorAll('.land').forEach((c,i)=>landscape(c,i===1));
  }
  function clean(){cancelAnimationFrame(frame);clearTimeout(timer);leaving=false;if(overlay){overlay.hidden=true;overlay.className='';}}
  function progress(value,elapsed){
    overlay.style.setProperty('--pass-progress',Math.round(value*100)+'%');
    overlay.querySelector('.track').setAttribute('aria-valuenow',Math.round(value*100));
    if(sprite.complete && sprite.naturalWidth){
      const c=overlay.querySelector('.sprite'),g=c.getContext('2d'),n=Math.floor(elapsed/92)%8;
      const w=sprite.naturalWidth/4,h=sprite.naturalHeight/2;
      g.clearRect(0,0,c.width,c.height);g.drawImage(sprite,(n%4)*w,Math.floor(n/4)*h,w,h,0,0,c.width,c.height);
    }
  }
  function show(mode,name,arriving=false){
    ensure();overlay.hidden=false;overlay.dataset.mode=mode;
    overlay.className=arriving?'arrive':'';
    overlay.querySelector('.destination').textContent=name;
    if(mode==='book')progress(arriving?1:0,0);
  }
  function arrive(mode,name){
    if(reduced.matches){clean();return;}
    show(mode,name,true);timer=setTimeout(clean,mode==='screen'?540:400);
  }
  function open(url,name){
    if(leaving)return;
    const dest=new URL(url,location.href);
    if(reduced.matches){location.assign(dest.href);return;}
    leaving=true;clearTimeout(timer);const mode=(dest.pathname==='/' && dest.hash!=='#home')?'screen':'book';
    show(mode,name);const start=performance.now(),duration=mode==='screen'?650:1160;
    function step(now){
      const t=Math.min(1,(now-start)/duration);
      if(mode==='book')progress(t,now-start);
      if(t<1){frame=requestAnimationFrame(step);return;}
      if(mode==='screen' && location.pathname==='/' && dest.pathname==='/' && dest.hash==='#rain-page'){
        history.pushState(null,'','#rain-page');scrollTo({top:0,behavior:'instant'});
        document.querySelector('.brand')?.focus({preventScroll:true});arrive(mode,name);return;
      }
      try{sessionStorage.setItem(key,JSON.stringify({path:dest.pathname,mode,name,time:Date.now()}));}catch{}
      location.assign(dest.href);
    }
    frame=requestAnimationFrame(step);
  }
  window.engawaPassage={open};
  function activate(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||reduced.matches)return;
    const a=e.target.closest('a[href]'), homeControl=e.target.closest('#back-to-home-btn');
    if(!a&&!homeControl)return;
    if(a&&(a.hasAttribute('download')||(a.target&&a.target!=='_self')))return;
    const dest=new URL(a?a.href:'/',location.href);
    if(dest.origin!==location.origin||!/^https?:$/.test(dest.protocol))return;
    if(location.pathname==='/' && !e.target.closest('#home'))return;
    if(dest.pathname===location.pathname&&dest.search===location.search&&dest.hash && !(location.pathname==='/'&&dest.hash==='#rain-page'))return;
    if(!dest.pathname.endsWith('/')&&!/\.html$/i.test(dest.pathname))return;
    if(a?.closest('#project-note,#catalogue')&&typeof showTransition==='function')return;
    e.preventDefault();e.stopImmediatePropagation();
    open(dest.href,(a?.textContent||'首页').replace(/[↗↘↑→]/g,'').trim().replace(/\s+/g,' ').slice(-38));
  }
  window.addEventListener('click',activate,true);
  window.addEventListener('pagehide',clean);
  window.addEventListener('pageshow',event=>{if(event.persisted)clean();});
  function restore(){
    let data;try{data=JSON.parse(sessionStorage.getItem(key));sessionStorage.removeItem(key)}catch{}
    if(data&&data.path===location.pathname&&Date.now()-data.time<20000)arrive(data.mode,data.name);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore,{once:true});else restore();
})();
