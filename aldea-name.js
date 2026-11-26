(() => {
'use strict';
/* Nombre libre del niño o niña: se escribe una vez y se aplica en cuentos, tarjetas,
   videollamada, lista de los buenos, carta a Santa y formularios. Si no está en las
   grabaciones de Santa, igual se usa escrito. */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='aldea-kid-name';
const FIELDS=['#story-form [name="name"]','#card-form [name="to"]','#nc-name','#vc-name','#lv-name','#sl-name','#call-name','#child-name','#ap-child','#letter-name','#invite-form [name="name"]','#quiz-name','#game-name'];
const load=()=>{try{return localStorage.getItem(KEY)||'';}catch{return '';}};
const save=v=>{try{if(v)localStorage.setItem(KEY,v);else localStorage.removeItem(KEY);}catch{}};
let current=load(),syncing=false;
const clean=v=>String(v||'').replace(/\s+/g,' ').trim().slice(0,40);
function recorded(name){
  const cat=window.SANTA_NAME_AUDIO,sp=window.SANTA_LIST_SPEECH;
  if(!name||!cat||!sp?.find)return false;
  try{return !!sp.find(cat,name);}catch{return false;}
}
function statusText(name){
  if(!name)return 'Escribe su nombre una vez y lo pondremos en los cuentos, las tarjetas, la carta a Santa y la videollamada.';
  return recorded(name)?`✓ Santa tiene «${name}» grabado con su voz: lo dirá en la videollamada y en la lista de los buenos.`:`✍️ «${name}» no está en las grabaciones de Santa, pero igual lo escribiremos en los cuentos, las tarjetas, la carta y la pantalla de la videollamada.`;
}
/* Rellena los campos vacíos o los que tenían el nombre anterior. */
function apply(name,previous){
  syncing=true;
  for(const sel of FIELDS)for(const el of $$(sel)){
    if(el.dataset.kidManual==='1'&&el.value&&el.value!==previous)continue;
    if(el.value&&el.value!==previous&&el.value!==name)continue;
    if(el.value===name)continue;
    el.value=name;el.dataset.kidAuto='1';
    el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
  }
  syncing=false;
}
function setName(value){
  const name=clean(value),previous=current;if(name===current){render();return;}
  current=name;save(name);apply(name,previous);render();
  window.dispatchEvent(new CustomEvent('aldea:kid-name',{detail:{name,recorded:recorded(name)}}));
}
/* Si alguien escribe en uno de los campos, ese nombre pasa a ser el nombre de la app. */
document.addEventListener('change',e=>{
  if(syncing)return;const el=e.target;if(!(el instanceof HTMLInputElement))return;
  if(!FIELDS.some(sel=>el.matches(sel)))return;
  const v=clean(el.value);if(!v||v===current)return;
  el.dataset.kidManual='1';setName(v);
});

/* Interfaz: botón en la barra de ruta + diálogo, y tarjetas en los menús. */
let dialog=null;
function render(){
  const chip=$('#kid-chip span');if(chip)chip.textContent=current?current:'Su nombre';
  for(const box of $$('[data-kid-box]')){
    const input=box.querySelector('input');if(input&&document.activeElement!==input)input.value=current;
    const st=box.querySelector('[data-kid-status]');if(st)st.textContent=statusText(current);
  }
}
function box(title){
  const el=document.createElement('form');el.className='kid-box panel';el.dataset.kidBox='1';el.noValidate=true;
  el.innerHTML=`<label>${title}<input maxlength="40" autocomplete="off" placeholder="Escribe cualquier nombre, por ejemplo: Valentina"></label><button type="submit" class="button">Usar este nombre</button><p class="fine" data-kid-status role="status"></p>`;
  el.addEventListener('submit',e=>{e.preventDefault();setName(el.querySelector('input').value);window.ALDEA_PAY?.toast(current?`Listo: usaremos «${current}» en toda la aldea.`:'Nombre borrado.');if(dialog?.open&&el.closest('dialog'))dialog.close();});
  return el;
}
function buildUI(){
  const bar=$('.route-bar');
  if(bar&&!$('#kid-chip')){const b=document.createElement('button');b.type='button';b.id='kid-chip';b.className='kid-chip';b.setAttribute('aria-haspopup','dialog');b.innerHTML='👧 <span></span>';b.addEventListener('click',open);bar.append(b);}
  dialog=document.createElement('dialog');dialog.className='kid-dialog';dialog.setAttribute('aria-label','Nombre del niño o niña');
  const close=document.createElement('button');close.type='button';close.className='ap-gate-close';close.setAttribute('aria-label','Cerrar');close.textContent='×';close.addEventListener('click',()=>dialog.close());
  const h=document.createElement('h2');h.textContent='¿Cómo se llama?';
  dialog.append(close,h,box('Nombre del niño o niña'));dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  document.body.append(dialog);
  for(const id of ['gratis','magia']){const s=document.getElementById(id);const anchor=s?.querySelector('.section-heading');if(anchor)anchor.after(box('¿Cómo se llama tu niño o niña?'));}
}
function open(){dialog.showModal();const i=dialog.querySelector('input');i.value=current;i.focus();i.select();render();}

buildUI();render();
if(current)apply(current,'');
window.ALDEA_NAME={get:()=>current,set:setName,recorded};
})();
