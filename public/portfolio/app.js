const root = new URL(document.body.dataset.project ? '../' : './', location.href);
const asset = name => new URL('assets/' + name, root).href;
const seasons = {spring:{name:'春 · 樱花',color:'#ecc0d2',wash:'#e7d3df',symbol:'❀',label:'社会调查能力'},autumn:{name:'秋 · 银杏',color:'#e3c582',wash:'#e7d8b9',symbol:'◒',label:'数据分析能力'},winter:{name:'冬 · 雪梅',color:'#c7dcea',wash:'#d6e3eb',symbol:'❅',label:'产品交互设计能力'}};
// Shared project records drive both tree cards and standalone case pages.
const projects = {
 game:{title:'游戏付费公平感知调查',tags:['问卷设计','消费心理','量化分析'],image:'slide-6.webp',season:'spring',summary:'以大学生玩家为样本，探索游戏付费动机、消费后悔与公平感知。',question:'大学生为何为游戏付费？审美、社交和竞争动机如何影响消费体验与公平评价？',method:'结构化问卷覆盖经济、社交、心理、行为与公平感知五个维度，结合统计分析与开放回答归纳。作品集记录有效样本为54份。',finding:'项目将审美驱动与消费后的期望落差作为重点分析线索。结论应放在该课程项目的小样本与地区限制下理解。',reflection:'扩大受访群体，按游戏类型进一步划分，并补充深度访谈，核对不同动机与负面体验之间的关系。',slides:[['slide-4.webp','研究概述'],['slide-5.webp','研究框架'],['slide-6.webp','分析图表'],['slide-8.webp','反思与优化']]},
 snack:{title:'好想来消费者行为研究',tags:['问卷调查','实地观察','混合方法'],image:'slide-11.webp',season:'spring',summary:'把问卷里的消费选择与真实门店里的行为放在一起，理解大学生的零食消费场景。',question:'学生为什么走出校园购买零食？结伴、顺路与渠道选择在消费过程中如何发生联系？',method:'220份有效问卷，结合三个典型日的门店观察。对照消费频率、结伴行为、场景与商品偏好，补充自报数据无法呈现的现场细节。',finding:'作品集把零食消费嵌入日常与社交动线的特点作为核心洞察，并比较问卷偏好与现场停留之间的差异。',reflection:'区分观察窗口与长期行为，明确各比例的统计分母。将发现转为可验证的门店陈列和场景运营假设。',slides:[['slide-10.webp','研究概述'],['slide-11.webp','行为图表'],['slide-12.webp','核心洞察'],['slide-13.webp','交叉验证']]},
 mangrove:{title:'红树林社区共治研究',tags:['深度访谈','田野调查','定性研究'],image:'slide-19.webp',season:'spring',summary:'从政府、基层与村民的不同位置，理解社区保护中的公众参与机制。',question:'多方参与的治理结构中，村民为什么仍可能处于旁观位置？参与动力和反馈渠道有哪些断点？',method:'以参与式治理为视角，结合实地走访与不同主体的深度访谈，围绕动力、联系、运行、反馈与保障机制整理材料。',finding:'项目关注治理主体之间的权力与执行断层，以及村民参与空间受到限制的现象。',reflection:'在正式案例中继续补充可追溯的访谈证据、编码过程和反例，清楚区分受访者陈述与研究解释。',slides:[['slide-19.webp','定性研究概览']]},
 retail:{title:'服饰零售数据分析',tags:['数据可视化','人货场','经营分析'],image:'slide-16.webp',season:'autumn',summary:'围绕人、货、场组织零售数据，把分散指标转化为可阅读的经营线索。',question:'核心客群、商品组合与渠道分布分别呈现什么特点？哪些经营问题值得优先关注？',method:'以人货场框架组织分析，通过可视化比较客群、商品和渠道维度，并将分析结果归纳为运营建议。',finding:'作品集重点展示客群聚焦、基本盘商品与渠道布局三个方面的分析结果。',reflection:'进一步补充数据来源、指标口径和时间窗口，明确相关性分析与实际运营成效之间的区别。',slides:[['slide-15.webp','分析概述'],['slide-16.webp','人货场图表'],['slide-17.webp','仪表板与建议']]},
 model:{title:'风险预警与干预方案建模',tags:['数学建模','特征分析','成本优化'],image:'slide-20.webp',season:'autumn',summary:'MathorCup建模项目：综合多维特征，探索风险分层与约束条件下的方案优化。',question:'如何组织体质、活动能力与血常规数据，建立风险预警思路，并考虑干预成本约束？',method:'作品集记录1000例个案数据，围绕关键特征筛选、风险分层与成本优化建立建模路径。',finding:'项目展示多源特征融合与成本约束下的模型设计思路，具体表现需结合完整建模报告评估。',reflection:'明确训练与验证划分，补充模型指标、误差与适用边界。此处作为竞赛项目成果展示。',slides:[['slide-20.webp','建模方案概览']]},
 vesper:{title:'岚苔 Vesper · 用户研究工作台',tags:['产品交互','研究流程','工具设计'],image:'slide-21-renamed.jpg',season:'winter',summary:'把研究过程中“下一步做什么、为何选择这个方法”的问题，转成可以理解和操作的流程。',question:'研究者如何在材料整理、方法选择、统计分析与结果归档之间保持清晰的判断路径？',method:'围绕访谈、编码、问卷、清洗和分析等环节组织工作流，让输入、方法依据与产物保持可见。',finding:'设计重点是把研究者的判断放进流程：呈现材料与依据，让关键决定可追溯。下方提供这一思路的交互示意。',reflection:'页面中的交互组件是作品集演示，并未连接实际工作台；真实功能与完成度以实际项目验证为准。',slides:[['slide-21-renamed.jpg','产品概览'],['slide-22-renamed.jpg','设计取舍']]}
};

// Portfolio experience records, sourced from the existing project catalogue.
projects["melody"]={"title": "MelodyAiming · 节奏射击", "tags": ["交互设计", "节奏游戏", "网页开发"], "image": "melodyaiming.png", "season": "winter", "summary": "将音乐节拍与鼠标瞄准结合，让点射、跟枪、得分和连击形成可体验的反馈循环。", "question": "如何让目标出现、节奏提示和瞄准反馈协同工作，让玩家理解并进入音乐驱动的操作？", "method": "桌面浏览器 Demo 支持三首曲目、难度选择、灵敏度设置、点射与按住跟枪，以及后屏画面切换。谱面依据音频节拍和段落能量生成，再按难度筛选目标。", "finding": "通过可玩的界面呈现音乐、目标、操作与反馈之间的关系，下方可直接体验现有 Demo。", "reflection": "后续可继续评估节奏可读性、目标密度和学习成本；作品集演示以现有版本为准。", "slides": [["melodyaiming.png", "游戏界面"]]};
projects["office"]={"title": "本机 AI 协作办公室", "tags": ["协作流程", "产品交互", "本地工具"], "image": "office-preview.png", "season": "winter", "summary": "把多人讨论、任务分工与人工审阅串成可追踪的工作空间，让参与者、任务和决定保持可见。", "question": "两位 AI 共同参与项目时，如何看清谁在处理什么、在哪一步需要人决定，以及改动从何而来？", "method": "将话题时间线与工作台并排组织；围绕目标讨论、文件范围分工、审批、差异审阅与合入安排操作。", "finding": "下方提供已有的独立交互体验版，可浏览话题、试用讨论、切换工作区与茶水间，并查看工作台。", "reflection": "此处演示使用预设消息与浏览器本地状态，不连接真实 Agent，也不启动本机办公室服务。", "slides": [["office-preview.png", "办公室界面"]]};
let activeSeason = null, transitionTimer = null, busy = false;
const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
let reduced = localStorage.getItem('worldtree-reduced') === 'true' || (localStorage.getItem('worldtree-reduced') === null && reducedQuery.matches);
function applyMotion(){document.body.classList.toggle('reduced', reduced);document.body.classList.toggle('motion-override',!reduced);const btn=document.querySelector('#motion');if(btn){btn.setAttribute('aria-pressed',String(reduced));btn.textContent=reduced?'开启动画':'减弱动态';}}
applyMotion();document.querySelector('#motion')?.addEventListener('click',()=>{reduced=!reduced;localStorage.setItem('worldtree-reduced',reduced);applyMotion();});
const svgNS='http://www.w3.org/2000/svg';
function el(tag, attrs, parent){const n=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;}
let seed=232;function rand(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
function drawTree(){
 if(document.querySelector('.world-art'))return;
 const branchRoot=document.querySelector('#branches'),leafRoot=document.querySelector('#foliage');
 const configs=[['spring',705,466,355,300,250,220],['autumn',713,438,730,250,750,134],['winter',724,479,1050,330,1150,255]];
 configs.forEach(([season,x,y,cx,cy,tx,ty])=>{
  const col=seasons[season].color;
  const group=el('g',{'data-branch':season},branchRoot), canopy=el('g',{'class':'canopy','data-canopy':season},leafRoot);
  const d=`M${x} ${y} Q${cx} ${cy+60} ${tx} ${ty}`;
  el('path',{d,stroke:'#454b61','stroke-width':19,class:'tree-line'},group);
  el('path',{d,stroke:col,'stroke-width':1.2,opacity:.6,class:'tree-line'},group);
  function branch(bx,by,len,angle,width,depth){
   const ex=bx+Math.cos(angle)*len,ey=by+Math.sin(angle)*len;
   const path=el('path',{d:`M${bx} ${by} Q${bx+Math.cos(angle+.2)*len*.55} ${by+Math.sin(angle+.2)*len*.55} ${ex} ${ey}`,stroke:depth>2?'#626477':col,'stroke-width':width,opacity:depth>2?.8:.46,class:'tree-line'},group);
   if(season==='winter'&&depth>2)el('path',{d:`M${bx} ${by-3} Q${bx+Math.cos(angle+.2)*len*.55} ${by+Math.sin(angle+.2)*len*.55-4} ${ex} ${ey-3}`,stroke:'#d4e4eb','stroke-width':width*.28,opacity:.7,class:'tree-line'},group);
   if(depth===0){
    for(let j=0;j<3;j++){
     const lx=ex+(rand()-.5)*32,ly=ey+(rand()-.5)*25;
     const bloom=el('g',{transform:`translate(${lx} ${ly}) rotate(${rand()*360})`},canopy);
     const inner=el('g',{class:'bloom',style:`--delay:${rand()*.6}s`},bloom);
     if(season==='autumn'){
      el('path',{d:'M0 4 L-12 -8 Q0 -23 12 -8Z',fill:rand()>.45?'#d2b368':'#a88c57',opacity:.55+rand()*.4},inner);
      el('path',{d:'M0 4 L0 -15 M0 4 L-7 -11 M0 4 L7 -11',stroke:'#eed596','stroke-width':.45,opacity:.5},inner);
     }else{
      const r=season==='spring'?3+rand()*2:2.5+rand()*1.5;
      for(let k=0;k<5;k++)el('ellipse',{cx:Math.cos(k*1.256)*r,cy:Math.sin(k*1.256)*r,rx:r*.85,ry:r*.65,transform:`rotate(${k*72} ${Math.cos(k*1.256)*r} ${Math.sin(k*1.256)*r})`,fill:season==='spring'?(rand()>.5?'#e8bfd3':'#c58aa9'):(rand()>.5?'#bd728d':'#eee0e5'),opacity:.7+rand()*.3},inner);
      el('circle',{r:1.1,fill:'#f0d8a5'},inner);
     }
    }
   }else{
    branch(ex,ey,len*(.65+rand()*.1),angle-(.32+rand()*.3),width*.63,depth-1);
    branch(ex,ey,len*(.62+rand()*.14),angle+(.3+rand()*.35),width*.63,depth-1);
   }
  }
  if(season==='spring'){branch(540,375,120,-2.42,9,4);branch(415,315,95,-1.85,6,3);branch(320,265,90,-2.9,5,3);}
  if(season==='autumn'){branch(717,330,105,-1.55,9,4);branch(727,252,90,-2.3,6,3);branch(739,195,65,-.7,5,3);}
  if(season==='winter'){branch(876,394,116,-.55,9,4);branch(1015,325,100,-1.35,6,3);branch(1090,283,75,-.05,5,3);}
 });
 const fireflies=document.querySelector('#fireflies');for(let i=0;i<45;i++)el('circle',{cx:170+rand()*1070,cy:100+rand()*530,r:.6+rand()*1.2,fill:i%2?'#d9cd9e':'#b9dce5',opacity:.2+rand()*.4},fireflies);
}
const assignments={spring:['game','snack','mangrove'],autumn:['retail','model','game'],winter:['vesper']};
const positions={spring:[[5,54],[23,67],[41,53]],autumn:[[29,38],[55,34],[57,65]],winter:[[77,56]]};
function selectSeason(season, initial=false){
 if(activeSeason===season&&!initial){collapse();return;}
 activeSeason=season;document.body.dataset.active=season;sessionStorage.setItem('worldtree-season',season);const s=seasons[season];document.documentElement.style.setProperty('--accent',s.color);
 document.querySelector('.garden').classList.add('open');
 document.querySelectorAll('[data-season]').forEach(n=>{n.setAttribute('aria-expanded',String(n.dataset.season===season));n.querySelector('i').textContent=n.dataset.season===season?'−':'＋';});
 document.querySelectorAll('.canopy').forEach(n=>n.classList.toggle('selected',n.dataset.canopy===season));
 if(!initial){document.querySelectorAll(`[data-branch="${season}"] path`).forEach(p=>{p.style.setProperty('--length',p.getTotalLength());p.classList.remove('growing');void p.getBoundingClientRect();p.classList.add('growing');});}
 document.querySelector('#status').textContent=`${s.name} · ${s.label} · 点击果实查看案例`;
 document.querySelector('#collapse').hidden=false;
 document.querySelector('#fruits').innerHTML=`<div class="fruit-set">${assignments[season].map((id,i)=>{const p=projects[id],pos=positions[season][i];return `<a class="fruit" href="${new URL('projects/'+id+'.html',root).href}" data-project="${id}" data-from="${season}" style="left:${pos[0]}%;top:${pos[1]}%;--delay:${initial?0:.85+i*.15}s"><img src="${asset(p.image)}" alt="${p.title}项目图表" loading="eager"><div class="fruit-text"><small>${s.name} <em>↗</em></small><strong>${p.title}</strong><span>${p.tags.slice(0,2).join(' / ')}</span></div></a>`;}).join('')}</div>`;
 weather(season);
}
function weather(season){const s=seasons[season];document.querySelector('#weather').innerHTML=Array.from({length:20},(_,i)=>`<span class="particle" style="left:${(i*47)%100}%;--duration:${9+i%6}s;--delay:${-i*.9}s;font-size:${season==='winter'?8+i%5:12+i%7}px">${s.symbol}</span>`).join('');}
function collapse(){activeSeason=null;delete document.body.dataset.active;sessionStorage.removeItem('worldtree-season');document.querySelector('#fruits').innerHTML='';document.querySelector('#weather').innerHTML='';document.querySelector('.garden').classList.remove('open');document.querySelectorAll('[data-season]').forEach(n=>{n.setAttribute('aria-expanded','false');n.querySelector('i').textContent='＋';});document.querySelectorAll('.canopy').forEach(n=>n.classList.remove('selected'));document.querySelector('#collapse').hidden=true;document.querySelector('#status').textContent='选择一条主枝，唤醒一个季节';}
function showTransition(url,season,title){
 if(busy)return;busy=true;const s=seasons[season];sessionStorage.setItem('worldtree-scroll',String(scrollY));sessionStorage.setItem('worldtree-entry',season);
 const overlay=document.querySelector('#transition');overlay.style.setProperty('--wash',s.wash);overlay.style.setProperty('--accent',s.color);document.querySelector('#loading-title').textContent=title;
 document.querySelector('.bubbles').innerHTML=[-55,-15,25].map((left,i)=>`<div class="bubble" style="left:${left}vw;--delay:${i*.08}s"></div>`).join('');
 const scene=document.querySelector('.loading-scene');scene.querySelectorAll('.season-fleck').forEach(n=>n.remove());for(let i=0;i<8;i++){const n=document.createElement('span');n.className='season-fleck';n.textContent=s.symbol;n.style.cssText=`position:absolute;left:${15+i*10}%;top:${10+(i*19)%70}%;color:${season==='winter'?'#8b9fb9':'#b38696'};opacity:.45;font-size:16px`;scene.append(n);}
 overlay.classList.add('active');overlay.setAttribute('aria-hidden','false');document.querySelector('#loading-title').setAttribute('role','status');
 const go=()=>{clearTimeout(transitionTimer);location.href=url;};document.querySelector('#skip').onclick=go;transitionTimer=setTimeout(go,reduced?80:1450);
}

function addExperience(id){
 const map={melody:{url:new URL('demos/melody/index.html',root).href,label:'MelodyAiming · 可玩 Demo',note:'桌面鼠标体验，Esc 暂停。',sandbox:'allow-scripts allow-same-origin allow-pointer-lock'},office:{url:new URL('demos/office/index.html',root).href,label:'办公室 · 交互体验版',note:'预设消息演示，不连接真实 Agent。',sandbox:'allow-scripts allow-same-origin'},retail:{url:'https://demo.fanruan.com/webroot/decision/link/8aRP',label:'FineBI · 服装零售交互仪表板',note:'在线仪表板来自原作品集链接。',sandbox:null}};
 const data=map[id];if(!data)return;
 const section=document.querySelector('#experience');document.querySelector('.detail-shell').classList.add('has-live-preview');
 const box=document.createElement('div');box.className='experience-live '+id;
 box.innerHTML=`<div class="experience-bar"><span>${data.label}</span><div><a href="${data.url}" target="_blank" rel="noopener">独立窗口 ↗</a></div></div><iframe src="${data.url}" title="${data.label}" loading="lazy" ${data.sandbox?`sandbox="${data.sandbox}"`:''} allow="fullscreen; autoplay; pointer-lock" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><p class="experience-note">${data.note}</p>`;
 const tabs=section.querySelector('.slide-tabs');section.insertBefore(box,tabs);
 if(id==='melody'||id==='office'){section.querySelector('h2').textContent='体验预览';section.querySelectorAll(':scope > p:not(.eyebrow),.slide-tabs,.image-link,.preview-legend').forEach(n=>n.remove());}
}

function renderDetail(id){
 const p=projects[id];if(!p)return;document.title=p.title+' · Mizuki';const entry=sessionStorage.getItem('worldtree-entry')||p.season;document.documentElement.style.setProperty('--accent',seasons[entry]?.color||seasons[p.season].color);
 document.querySelector('#home')?.setAttribute('hidden','');const detail=document.querySelector('#detail');detail.hidden=false;
 detail.innerHTML=`<article class="detail-shell"><a class="back" href="${root.href}">← 返回世界树</a><div class="detail-top"><p class="eyebrow">SELECTED CASE / ${seasons[p.season].name}</p><h1>${p.title}</h1><p>${p.summary}</p><div class="tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div></div><div class="case-grid"><section><span class="case-number">01 / QUESTION</span><h2>从一个问题出发</h2><p>${p.question}</p></section><section><span class="case-number">02 / APPROACH</span><h2>如何展开研究</h2><p>${p.method}</p></section><section><span class="case-number">03 / INSIGHT</span><h2>看到的线索</h2><p>${p.finding}</p></section><section><span class="case-number">04 / REFLECTION</span><h2>继续追问</h2><p>${p.reflection}</p></section></div><section class="preview-section" id="experience"><p class="eyebrow">THE WORK, UP CLOSE</p><h2>成果与使用预览</h2>${id==='vesper'?`<div class="demo"><div class="demo-title">工作流交互示意 · 未连接实际工作台</div><div class="demo-steps">${['整理材料','选择方法','查看产物'].map((x,i)=>`<button data-step="${i}" aria-pressed="${i===0}">${String(i+1).padStart(2,'0')} ${x}</button>`).join('')}</div><div class="demo-output" aria-live="polite">输入 → 访谈文本与问卷材料<br>先明确研究问题，整理可供分析的证据。</div></div>`:''}<div class="slide-tabs" role="group" aria-label="选择成果预览">${p.slides.map((s,i)=>`<button data-slide="${i}" aria-pressed="${i===0}">${s[1]}</button>`).join('')}</div><a class="image-link" target="_blank" rel="noopener" href="${asset(p.slides[0][0])}"><img class="preview-image" src="${asset(p.slides[0][0])}" alt="${p.slides[0][1]}"></a><div class="preview-legend">${p.slides[0][1]} · ${p.title}</div></section><div class="detail-end"><a href="${root.href}">← 继续探索其他枝条</a><a href="${asset('portfolio.pdf')}" download>下载完整PDF ↗</a></div></article>`;
 detail.querySelectorAll('[data-slide]').forEach(btn=>btn.onclick=()=>{const [img,title]=p.slides[+btn.dataset.slide];detail.querySelector('.preview-image').src=asset(img);detail.querySelector('.preview-image').alt=title;detail.querySelector('.image-link').href=asset(img);detail.querySelector('.preview-legend').textContent=title+' · '+p.title;detail.querySelectorAll('[data-slide]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));});
 detail.querySelectorAll('[data-step]').forEach(btn=>btn.onclick=()=>{detail.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));detail.querySelector('.demo-output').innerHTML=['输入 → 访谈文本与问卷材料<br>先明确研究问题，整理可供分析的证据。','判断 → 呈现方法依据与前提条件<br>由研究者选择下一步，保留决策理由。','产物 → 分析摘要、图表与报告材料<br>让每一步有可以查看与归档的结果。'][+btn.dataset.step];});
}
if(document.body.dataset.project){renderDetail(document.body.dataset.project);addExperience(document.body.dataset.project);if(location.hash==='#experience')requestAnimationFrame(()=>document.querySelector('#experience')?.scrollIntoView());}else if(document.body.dataset.mode!=='clock'){
 drawTree();document.querySelectorAll('[data-season]').forEach(btn=>btn.addEventListener('click',()=>selectSeason(btn.dataset.season)));document.querySelector('#collapse').onclick=collapse;
 document.querySelector('#fruits').addEventListener('click',e=>{const a=e.target.closest('[data-project]');if(a&&!e.ctrlKey&&!e.metaKey){e.preventDefault();showTransition(a.href,a.dataset.from,projects[a.dataset.project].title);}});
 const previous=sessionStorage.getItem('worldtree-season');if(seasons[previous]){selectSeason(previous,true);requestAnimationFrame(()=>scrollTo(0,document.querySelector('.world-art')?0:+(sessionStorage.getItem('worldtree-scroll')||0)));}
}
addEventListener('pageshow',()=>{busy=false;const overlay=document.querySelector('#transition');overlay?.classList.remove('active');overlay?.setAttribute('aria-hidden','true');});
