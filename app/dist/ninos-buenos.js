(() => {
'use strict';
const data=window.NINOS_BUENOS,$=s=>document.querySelector(s);
const grid=$('#nb-grid');if(!data||!grid)return;
const search=$('#nb-search'),count=$('#nb-count'),empty=$('#nb-empty'),toast=$('#nb-toast');
let filter='all',toastTimer=0;
const files=new Map();
const fold=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const fmtTime=s=>`0:${String(s).padStart(2,'0')}`;
const downloadName=item=>`${item.id}-la-aldea-de-santa.mp4`;
const icon={
  down:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4h2v9.2l3.6-3.6 1.4 1.4-6 6-6-6 1.4-1.4 3.6 3.6zM5 18h14v2H5z"/></svg>',
  share:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7l-6.7 3.4a3 3 0 1 0 0 3.2L15 17a3 3 0 1 0 3-1z"/></svg>',
  copy:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h11v13h-2V5H8zM4 7h11v14H4zm2 2v10h7V9z"/></svg>'
};
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function card(item){
  const el=document.createElement('article');el.className='nb-card';el.dataset.id=item.id;
  el.innerHTML=`<div class="nb-media"><video controls playsinline preload="none" data-src="${item.src}#t=${item.special?2:5}" aria-label="Video de Santa: ${esc(item.label)}"></video><span class="nb-tag">${item.special?'Especial':'Con su nombre'} · ${fmtTime(item.duration)}</span></div>
<div class="nb-body"><h3>${esc(item.label)}</h3><p class="nb-title">${esc(item.title)}</p><p class="nb-hashtags">${data.hashtags.slice(0,2).join(' ')} <span>+${data.hashtags.length-2}</span></p>
<div class="nb-actions"><button type="button" class="button small nb-share" data-act="share">${icon.share}<span>Compartir</span></button><a class="button small outline" data-act="download" href="${item.src}" download="${downloadName(item)}">${icon.down}<span>Descargar</span></a><button type="button" class="nb-copy" data-act="copy">${icon.copy}<span>Copiar título y hashtags</span></button></div>
<p class="nb-size">${item.mb.toLocaleString('es-PE')} MB · MP4 vertical para TikTok, Reels y Shorts</p></div>`;
  return el;
}
const cards=data.items.map(item=>{const el=card(item);grid.append(el);return el;});
const byId=new Map(data.items.map(i=>[i.id,i]));

/* Carga la vista previa solo cuando la tarjeta se acerca a la pantalla. */
const io='IntersectionObserver' in window?new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){const v=e.target;v.src=v.dataset.src;v.preload='metadata';io.unobserve(v);}},{rootMargin:'300px'}):null;
for(const v of grid.querySelectorAll('video')){if(io)io.observe(v);else{v.src=v.dataset.src;v.preload='metadata';}}
grid.addEventListener('play',e=>{for(const v of grid.querySelectorAll('video'))if(v!==e.target)v.pause();},true);

function apply(){
  const q=fold(search.value.trim());let shown=0;
  cards.forEach((el,i)=>{const it=data.items[i],ok=(filter==='all'||(filter==='special')===it.special)&&(!q||fold(it.label+' '+it.title).includes(q));el.hidden=!ok;if(ok)shown++;});
  count.textContent=shown===1?'1 video listo para compartir':`${shown} videos listos para compartir`;empty.hidden=shown>0;
}
search.addEventListener('input',apply);
for(const b of document.querySelectorAll('[data-nb-filter]'))b.addEventListener('click',()=>{filter=b.dataset.nbFilter;for(const o of document.querySelectorAll('[data-nb-filter]'))o.setAttribute('aria-pressed',String(o===b));apply();});
apply();

function showToast(text){toast.textContent=text;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.hidden=true;},4200);}
async function copy(text){
  try{await navigator.clipboard.writeText(text);return true;}catch{}
  const t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');t.style.cssText='position:fixed;opacity:0';document.body.append(t);t.select();let ok=false;try{ok=document.execCommand('copy');}catch{}t.remove();return ok;
}
async function getFile(item){
  if(files.has(item.id))return files.get(item.id);
  const r=await fetch(item.src);if(!r.ok)throw new Error('No se pudo descargar el video. Revisa tu conexión.');
  const f=new File([await r.blob()],downloadName(item),{type:'video/mp4'});files.set(item.id,f);return f;
}
function triggerDownload(item){const a=document.createElement('a');a.href=item.src;a.download=downloadName(item);document.body.append(a);a.click();a.remove();}

async function share(item,btn){
  const label=btn.querySelector('span');
  const copied=await copy(item.caption);
  if(!navigator.canShare||!navigator.share){
    triggerDownload(item);
    showToast(copied?'Video descargado y título copiado. Súbelo en TikTok o Instagram y pega el título.':'Video descargado. Copia el título y súbelo a tu red social.');
    return;
  }
  const cached=files.has(item.id);
  btn.disabled=true;label.textContent='Preparando…';
  try{
    const file=await getFile(item);
    if(!navigator.canShare({files:[file]})){triggerDownload(item);showToast('Tu celular no permite compartir videos directamente: lo descargamos y el título ya está copiado.');return;}
    await navigator.share({files:[file],title:item.title,text:item.caption});
    showToast('¡Listo! Si la app no muestra el título, pégalo: ya está copiado.');
  }catch(e){
    if(e&&e.name==='AbortError')return;
    if(e&&e.name==='NotAllowedError'&&!cached){label.textContent='Toca otra vez';btn.classList.add('ready');showToast('El video está listo. Toca «Compartir» otra vez para elegir TikTok, Instagram o WhatsApp.');return;}
    showToast(e?.message||'No se pudo compartir. Usa «Descargar» y pega el título copiado.');
  }finally{btn.disabled=false;if(!btn.classList.contains('ready'))label.textContent='Compartir';}
}

grid.addEventListener('click',async e=>{
  const el=e.target.closest('[data-act]');if(!el)return;
  const item=byId.get(el.closest('.nb-card').dataset.id);
  if(el.dataset.act==='share'){el.classList.remove('ready');share(item,el);}
  else if(el.dataset.act==='copy'){showToast(await copy(item.caption)?'Título y hashtags copiados ✨':'No se pudo copiar. Mantén presionado el título para copiarlo.');}
  else if(el.dataset.act==='download'){copy(item.caption).then(ok=>{if(ok)showToast('Descargando… El título y los hashtags ya están copiados para pegarlos al publicar.');});}
});
window.addEventListener('aldea:navigate',()=>{if($('#ninos-buenos').hidden)for(const v of grid.querySelectorAll('video'))v.pause();});
})();
