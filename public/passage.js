(()=>{
const motion=matchMedia('(prefers-reduced-motion:reduce)');
  const fx=document.createElement('div');fx.id='passage-fx';fx.setAttribute('aria-hidden','true');document.body.append(fx);
  let leaving=false;
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href]');if(!a||a.origin!==location.origin||a.hash||a.target||a.download||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||motion.matches)return;
    const effect=a.pathname.startsWith('/portfolio/')?'book':a.pathname.startsWith('/archive/')?'ink':a.pathname.startsWith('/skills/')?'measure':'';
    if(!effect)return;
    e.preventDefault();if(leaving)return;leaving=true;fx.className=effect;
    setTimeout(()=>location.assign(a.href),effect==='book'?400:300);
  });
  addEventListener('pageshow',()=>{leaving=false;fx.className=''});
})();
