const menu = document.querySelector('.mobile-menu');
const nav = document.querySelector('.site-header nav');
menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? '收起导航' : '展开导航');
});
document.addEventListener('click', event => {
  if (!event.target.closest('.more-nav')) document.querySelector('.more-nav')?.removeAttribute('open');
});
const motion = document.querySelector('.motion');
let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
try { paused = localStorage.getItem('journal-motion') === 'off' || paused; } catch {}
const updateMotion = () => {
  document.body.classList.toggle('motion-off', paused);
  motion?.setAttribute('aria-pressed', String(paused));
  motion?.setAttribute('aria-label', paused ? '开启动效' : '暂停画面动效');
};
updateMotion();
motion?.addEventListener('click', () => { paused = !paused; updateMotion(); try { localStorage.setItem('journal-motion', paused ? 'off' : 'on'); } catch {} });

const dialog = document.querySelector('#search-dialog');
const input = document.querySelector('#search-input');
const results = document.querySelector('#search-results');
document.querySelector('[data-search]')?.addEventListener('click', () => { dialog.showModal(); input.focus(); });
document.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) { const rect=dialog.getBoundingClientRect(); if(event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) dialog.close(); } });
let indexPromise;
let request = 0;
let timer;
const message = value => { results.replaceChildren(); const p=document.createElement('p'); p.className='search-empty'; p.textContent=value; results.append(p); };
message('输入关键词，搜索文章与项目。');
input?.addEventListener('input', () => {
  clearTimeout(timer);
  const current=++request;
  const query=input.value.trim();
  if(!query) return message('输入关键词，搜索文章与项目。');
  timer=setTimeout(async () => {
    message('正在搜索…');
    try {
      // This generated index deliberately omits private/encrypted article bodies.
      indexPromise ||= fetch('/journal-search.json').then(response => { if(!response.ok) throw new Error('index'); return response.json(); }).catch(error => {indexPromise=null;throw error;});
      const index=await indexPromise;
      if(current!==request) return;
      const words=query.toLocaleLowerCase().split(/\s+/);
      const matches=index.filter(entry => words.every(word => `${entry.title} ${entry.text} ${entry.label}`.toLocaleLowerCase().includes(word)));
      message(matches.length ? `找到 ${matches.length} 条结果` : '没有找到相关内容，请换一个关键词。');
      for(const entry of matches.slice(0,30)) {
        const link=document.createElement('a'); link.href=entry.url; link.className='search-result';
        const label=document.createElement('small'); label.textContent=entry.label;
        const title=document.createElement('strong'); title.textContent=entry.title;
        link.append(label,title); results.append(link);
      }
    } catch { if(current===request) message('搜索暂时无法加载，请从文章或项目栏目浏览。'); }
  },160);
});

document.querySelectorAll('[data-collection]').forEach(collection => {
  const buttons=[...collection.querySelectorAll('[data-category-filter]')];
  const tags=collection.querySelector('[data-tag-filter]');
  const items=[...collection.querySelectorAll('[data-filter-item]')];
  const apply=() => {
    const params=new URLSearchParams(location.search);
    const category=params.get('uncategorized')==='true' ? '未分类' : params.get('category') || 'all';
    const tag=params.get('tag') || '';
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.categoryFilter===category)));
    if(tags) tags.value=tag;
    let count=0;
    items.forEach(item => {
      const show=(category==='all' || item.dataset.category===category) && (!tag || JSON.parse(item.dataset.tags || '[]').includes(tag));
      item.hidden=!show;
      if(show) count++;
    });
    const counter=collection.querySelector('.result-count');
    if(counter) counter.textContent=`${count} ${collection.dataset.unit || '项'}`;
    const empty=collection.querySelector('[data-filter-empty]'); if(empty) empty.hidden=count!==0;
  };
  const set=(key,value) => { const url=new URL(location.href); url.searchParams.delete('uncategorized'); if(value && value!=='all') url.searchParams.set(key,value); else url.searchParams.delete(key); history.replaceState(null,'',url); apply(); };
  buttons.forEach(button=>button.addEventListener('click',()=>set('category',button.dataset.categoryFilter)));
  tags?.addEventListener('change',()=>set('tag',tags.value));
  window.addEventListener('popstate',apply);
  apply();
});
