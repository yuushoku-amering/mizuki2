if(document.body.dataset.mode==='clock'){
 const botanical=document.querySelector('#botanical-tree');
 const wrapper=document.createElement('div');wrapper.className='tree-art';botanical.parentNode.insertBefore(wrapper,botanical);wrapper.append(botanical,document.querySelector('#project-flowers'));
 const clockConfig={spring:{number:'01 / SPRING',summary:'走入真实场景，从人的行为与讲述中发现问题。',ids:['game','snack','mangrove'],positions:[[27,35],[51,25],[74,43]]},autumn:{number:'02 / AUTUMN',summary:'整理复杂线索，让数据成为可以解释的证据。',ids:['retail','model','game'],positions:[[28,38],[52,26],[74,43]]},winter:{number:'03 / WINTER',summary:'把研究者的需要，转化为清晰可用的工作流程。',ids:['vesper','melody','office'],positions:[[27,35],[51,25],[74,43]]}};
 let clockSeason='spring',selectedProject=null;
 const symbols={spring:'cherry',autumn:'ginkgo',winter:'plum'};
 const savedSeason=sessionStorage.getItem('clock-season');
 const ticks=document.querySelector('#clock-ticks');
 for(let i=0;i<60;i++){const theta=i*Math.PI/30;const outer=47,inner=i%5===0?42:45;el('line',{x1:75+Math.sin(theta)*inner,y1:75-Math.cos(theta)*inner,x2:75+Math.sin(theta)*outer,y2:75-Math.cos(theta)*outer,stroke:'currentColor','stroke-width':i%5===0?.7:.4,opacity:.4},ticks);}
 function enterProject(id){sessionStorage.setItem('clock-season',clockSeason);sessionStorage.setItem('clock-project',id);showTransition(new URL('projects/'+id+'.html#experience',root).href,clockSeason,projects[id].title);}
 function describe(id,fromUser=true){
  selectedProject=id;sessionStorage.setItem('clock-project',id);const p=projects[id];
  document.querySelectorAll('.project-flower').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.flower===id)));
  document.querySelector('#project-description').innerHTML=`<article class="case-note"><span class="note-label">SELECTED PROJECT</span><h2>${p.title}</h2><p>${p.summary}</p><div class="note-tags">${p.tags.map(x=>`<span>${x}</span>`).join('')}</div><h3>研究与实践</h3><p class="note-method">${p.method}</p><button class="open-experience">进入成果预览 <span>↗</span></button></article>`;
  document.querySelector('.open-experience').onclick=()=>enterProject(id);
  if(fromUser&&matchMedia('(max-width:700px)').matches)document.querySelector('.project-aside').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
 }
 function switchSeason(season,restore=false){
  clockSeason=season;selectedProject=null;document.body.dataset.clockSeason=season;sessionStorage.setItem('clock-season',season);const s=seasons[season],c=clockConfig[season];
  document.querySelector('#tree-season-note').textContent=s.name;document.querySelector('#season-number').textContent=c.number;document.querySelector('#capability').textContent=s.label;document.querySelector('#capability-summary').textContent=c.summary;document.querySelector('#project-count').textContent=c.ids.length+' 个项目';
  document.querySelectorAll('[data-clock]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.clock===season)));
  document.querySelector('.tree-art').classList.remove('season-changing');void document.querySelector('.tree-art').getBoundingClientRect();document.querySelector('.tree-art').classList.add('season-changing');
  document.querySelector('#project-flowers').innerHTML=c.ids.map((id,i)=>`<button class="project-flower" data-flower="${id}" aria-label="${projects[id].title}：单击说明，双击预览" aria-pressed="false" style="left:${c.positions[i][0]}%;top:${c.positions[i][1]}%;--delay:${.35+i*.1}s"><svg viewBox="-18 -18 36 36" aria-hidden="true"><use href="#${symbols[season]}" transform="scale(1.1)"/></svg><span class="node-number">${i+1}</span><span class="node-label">${projects[id].title}</span></button>`).join('');
  document.querySelectorAll('[data-flower]').forEach(n=>{n.addEventListener('click',e=>describe(n.dataset.flower,e.detail!==2));n.addEventListener('dblclick',e=>{e.preventDefault();enterProject(n.dataset.flower);});n.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();enterProject(n.dataset.flower);}});});
  document.querySelector('#project-description').innerHTML='<div class="empty-state"><h2 class="single-hint">请点击花朵，<br>单击预览，双击跳转</h2></div>';
  if(restore){const previous=sessionStorage.getItem('clock-project');if(c.ids.includes(previous))describe(previous,false);}else sessionStorage.removeItem('clock-project');
 }
 document.querySelectorAll('[data-clock]').forEach(n=>n.onclick=()=>switchSeason(n.dataset.clock));
 switchSeason(clockConfig[savedSeason]?savedSeason:'spring',true);
}
