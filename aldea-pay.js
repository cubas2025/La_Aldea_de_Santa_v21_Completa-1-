(() => {
'use strict';
/* Paquetes, países, métodos de pago, códigos de acceso y botones para compartir. */
const WA_NUMBER='51917823560', EMAIL='rolandobautistacubas3@gmail.com', YAPE='917823560', HOLDER='Rolando Bautista Cubas';
const PAYPAL_URL='https://www.paypal.com/myaccount/transfer/homepage/pay';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const siteUrl=(hash='')=>location.origin+location.pathname+hash;

const COUNTRIES=[
  ['pe','🇵🇪','Perú','PEN','yape'],['ve','🇻🇪','Venezuela','USD','crypto'],['us','🇺🇸','EE. UU.','USD','paypal'],
  ['es','🇪🇸','Europa / España','EUR','paypal'],['mx','🇲🇽','México','USD','crypto'],['co','🇨🇴','Colombia','USD','crypto'],
  ['ar','🇦🇷','Argentina','USD','crypto'],['cl','🇨🇱','Chile','USD','crypto'],['br','🇧🇷','Brasil','USD','crypto'],
  ['bo','🇧🇴','Bolivia','USD','crypto'],['ec','🇪🇨','Ecuador','USD','crypto'],['otros','🌐','Otros países','USD','paypal']
].map(([id,flag,name,currency,pay])=>({id,flag,name,currency,pay}));
const EURO_REGIONS=['ES','FR','DE','IT','PT','NL','BE','AT','IE','FI','GR','LU'];

const PACKAGES={
  combo1:{id:'combo1',name:'Combo 1',title:'Video corto + 30 libros para colorear',video:'Video corto de menos de 1 minuto',tier:3,books:'included',pen:3,intl:2.5},
  video3:{id:'video3',name:'Paquete 2',title:'Video estándar de 3 minutos',video:'Video personalizado de 3 minutos',tier:3,books:'optional',pen:3,intl:2.5,penBooks:5,intlBooks:3.5},
  video5:{id:'video5',name:'Paquete 3',title:'Video largo de 5 minutos',video:'Video personalizado de 5 minutos',tier:5,books:'optional',pen:5,intl:3.5,penBooks:7,intlBooks:4.5}
};
const GIFTS=['1 cuento personalizado con su nombre','1 tarjeta de felicitación lista para enviar a amigos y familiares'];
const FEATURES={videos:'Videos de Santa',cuentos:'Cuentos personalizados',tarjetas:'Tarjetas de felicitación',colorear:'30 libros para colorear'};
const BASE=['videos','cuentos','tarjetas'], ALL=[...BASE,'colorear'];
/* Tipos de código. Los códigos en sí (6 caracteres al azar) solo los tiene el creador;
   access-codes.js guarda únicamente sus huellas PBKDF2. */
const TYPES={
  1:{plan:'Combo 1 · video corto + 30 libros',features:ALL},
  2:{plan:'Paquete 2 · video de 3 minutos',features:BASE},
  3:{plan:'Paquete 2 + 30 libros',features:ALL},
  4:{plan:'Paquete 3 · video de 5 minutos',features:BASE},
  5:{plan:'Paquete 3 + 30 libros',features:ALL},
  9:{plan:'Creador de La aldea de Santa',features:ALL,creator:true}
};
/* Todo se puede crear y ver gratis. Descargar y compartir pide código.
   Gratis siempre: el quiz con su certificado y las 25 tarjetas de Navidad (#tarjeta-navidad). */
const GATES=[
  ['videos','#lv-export,#lv-image,#sl-video,#sl-png,#sl-pdf,#sl-share-image,#sl-share-video,#ed-download,[data-video-sharing="lv"] button,[data-video-sharing="sl"] button,[data-video-sharing="ed"] button,#ninos-buenos [data-act="share"],#ninos-buenos [data-act="download"],[data-download="qr"],[data-pdf="qr"],[data-share="qr"]'],
  ['tarjetas','[data-download="card"],[data-pdf="card"],[data-share="card"],[data-download="invite"],[data-pdf="invite"],[data-share="invite"]'],
  ['colorear','#color-download'],
  ['cuentos','#story-stage button']
];
const GATE_TEXT={
  videos:'Puedes crear y ver los videos de Santa gratis. Para descargarlos o compartirlos, activa el código de tu paquete.',
  cuentos:'Lee y escucha el cuento gratis. Para descargarlo, activa tu código: el cuento viene de regalo en todos los paquetes.',
  tarjetas:'Crea tu tarjeta gratis. Para descargarla o enviarla, activa tu código: viene de regalo en todos los paquetes.',
  colorear:'Mira los libros gratis. Para descargar el PDF necesitas el Pack de 30 Libros para Colorear (Combo 1, o agrégalo al Paquete 2 o 3).'
};
const isEditButton=b=>/Editar este video|Escuchar|Siguiente|Anterior|Volver|Elegir|Empezar|Leer/i.test(b.textContent)&&!/Descargar|Compartir|PDF/i.test(b.textContent);

const store={get(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}},del(k){try{localStorage.removeItem(k);}catch{}}};

/* País y moneda */
function guessCountry(){
  for(const lang of navigator.languages||[navigator.language||'']){
    const region=(lang.split('-')[1]||'').toUpperCase();if(!/^[A-Z]{2}$/.test(region))continue;
    const hit=COUNTRIES.find(c=>c.id===region.toLowerCase());if(hit)return hit.id;
    if(EURO_REGIONS.includes(region))return 'es';
    return 'otros';
  }
  return 'pe';
}
let countryId=store.get('aldea-country');if(!COUNTRIES.some(c=>c.id===countryId))countryId=guessCountry();
const country=()=>COUNTRIES.find(c=>c.id===countryId);
const currency=()=>country().currency;
function setCountry(id){if(id===countryId||!COUNTRIES.some(c=>c.id===id))return;countryId=id;store.set('aldea-country',id);window.dispatchEvent(new CustomEvent('aldea:country',{detail:{country:country()}}));}
const fmt=(n,cur=currency())=>cur==='PEN'?`S/ ${n.toFixed(2)}`:cur==='EUR'?`${n.toFixed(2)} €`:`US$ ${n.toFixed(2)}`;
function amount(pkgId,books,cur=currency()){const p=PACKAGES[pkgId],local=cur==='PEN',add=p.books==='optional'&&books;return local?(add?p.penBooks:p.pen):(add?p.intlBooks:p.intl);}
const booksExtra=(cur=currency())=>fmt(cur==='PEN'?2:1,cur);
const storyPrice=pen=>fmt(amount(pen===5?'video5':'video3',false));
function booksLabel(pkgId){return PACKAGES[pkgId].books==='included'?'📚 Pack Completo de 30 Libros para Colorear incluido':`+ Agregar Pack Completo de 30 Libros para Colorear (+ ${booksExtra()})`;}
function booksText(pkgId,books){return PACKAGES[pkgId].books==='included'?'Incluido en el combo':books?'Sí, agregado':'No';}
const payName=c=>c.pay==='yape'?'Yape o Plin':c.pay==='crypto'?'Binance Pay, Airtm o Takenos':'PayPal';
const whatsappUrl=text=>`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

/* Accesos */
const EMPTY=()=>({features:[],plans:[],creator:false});
let access=store.get('aldea-access');if(!access||!Array.isArray(access.features))access=EMPTY();
const hasAccess=f=>access.creator||access.features.includes(f);
const isCreator=()=>!!access.creator;
async function fingerprint(code){
  const cfg=window.ALDEA_CODES,enc=new TextEncoder();
  const key=await crypto.subtle.importKey('raw',enc.encode(code),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(cfg.salt),iterations:cfg.iterations},key,64);
  return [...new Uint8Array(bits)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function lookup(raw){
  const code=String(raw||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(!code)return {error:'Escribe tu código de acceso.'};
  if(!window.crypto?.subtle||!window.ALDEA_CODES)return {error:'Abre la web con https para activar tu código.'};
  const entry=TYPES[window.ALDEA_CODES.map[await fingerprint(code)]];
  return entry?{entry}:{error:'Ese código no es válido. Revisa que esté bien escrito (6 letras y números) o escríbenos por WhatsApp.'};
}
function grant(entry){
  access={features:[...new Set([...access.features,...entry.features])],plans:[...new Set([...(access.plans||[]),entry.plan])],creator:access.creator||!!entry.creator};
  store.set('aldea-access',access);refreshLocks();window.dispatchEvent(new CustomEvent('aldea:access',{detail:access}));
}
async function redeem(raw){
  const r=await lookup(raw);if(r.error)return {ok:false,message:r.error};
  grant(r.entry);
  return {ok:true,entry:r.entry,message:r.entry.creator?'¡Modo creador activado! Tienes acceso libre a todo en este dispositivo.':`¡Código activado! ${r.entry.plan}. Ya puedes descargar y compartir: ${r.entry.features.map(f=>FEATURES[f]).join(', ')}.`};
}
function clearAccess(){access=EMPTY();store.del('aldea-access');refreshLocks();window.dispatchEvent(new CustomEvent('aldea:access',{detail:access}));}

/* Utilidades */
let toastTimer=0;
function toast(text){const t=$('#toast');if(!t)return;t.textContent=text;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{t.hidden=true;},4500);}
async function copy(text){
  try{await navigator.clipboard.writeText(text);return true;}catch{}
  const t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');t.style.cssText='position:fixed;opacity:0';document.body.append(t);t.select();let ok=false;try{ok=document.execCommand('copy');}catch{}t.remove();return ok;
}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-copy]');if(!b)return;e.preventDefault();toast(await copy(b.dataset.copy)?`Copiado: ${b.dataset.copy}`:'No se pudo copiar. Mantén presionado el texto para copiarlo.');});

const icons={
  copy:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h11v13h-2V5H8zM4 7h11v14H4zm2 2v10h7V9z"/></svg>',
  wa:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3z"/></svg>',
  fb:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4a22 22 0 0 0-2.5-.1c-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8z"/></svg>',
  tt:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/></svg>',
  link:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a3 3 0 0 1 4.2 4.2l-2.1 2.1-1.4-1.4 2.1-2.1a1 1 0 0 0-1.4-1.4L12 13.4a1 1 0 0 1-1.4 0zm2.8-2.8a1 1 0 0 1 0 1.4l-3.5 3.5a3 3 0 0 1-4.2-4.2l2.1-2.1 1.4 1.4-2.1 2.1a1 1 0 0 0 1.4 1.4l3.5-3.5a1 1 0 0 1 1.4 0z"/></svg>'
};

/* Botones para compartir: la app, las tarjetas y el certificado del quiz. */
function shareBar({heading,text,hash='',shareKey=''}){
  const url=siteUrl(hash),el=document.createElement('div');el.className='ap-share';
  el.innerHTML=`<p class="ap-share-title">${esc(heading)}</p><div class="ap-share-buttons">
<a class="ap-sh ap-sh-wa" href="https://wa.me/?text=${encodeURIComponent(text+' '+url)}" target="_blank" rel="noopener noreferrer">${icons.wa}<span>WhatsApp</span></a>
<a class="ap-sh ap-sh-fb" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer">${icons.fb}<span>Facebook</span></a>
<button type="button" class="ap-sh ap-sh-tt" data-social>${icons.tt}<span>TikTok / Instagram</span></button>
<button type="button" class="ap-sh ap-sh-link" data-link>${icons.link}<span>Copiar enlace</span></button></div>`;
  el.querySelector('[data-link]').addEventListener('click',async()=>toast(await copy(url)?'Enlace copiado. Pégalo donde quieras compartirlo.':'No se pudo copiar el enlace.'));
  el.querySelector('[data-social]').addEventListener('click',async()=>{
    const copied=await copy(`${text} ${url} #cubas.ai #laaldeadesanta`);
    const fileButton=shareKey&&document.querySelector(`[data-share="${shareKey}"]`);
    if(fileButton&&!fileButton.closest('[hidden]')){fileButton.click();toast(copied?'Elige TikTok o Instagram. El texto con el enlace ya está copiado para pegarlo.':'Elige TikTok o Instagram en el menú de tu celular.');return;}
    if(navigator.share){try{await navigator.share({title:'La aldea de Santa',text,url});return;}catch(err){if(err.name==='AbortError')return;}}
    toast(copied?'Texto y enlace copiados. Pégalos en tu publicación, historia o biografía de TikTok o Instagram.':'Copia el enlace de la web para compartirlo.');
  });
  return el;
}

/* Métodos de pago según el país */
function methodRow(name,value,note,extra=''){return `<div class="ap-method"><div><strong>${esc(name)}</strong><span class="ap-method-value">${esc(value)}</span>${note?`<small>${esc(note)}</small>`:''}</div><button type="button" class="ap-copy" data-copy="${esc(value)}" aria-label="Copiar ${esc(name)}: ${esc(value)}">${icons.copy}<span>Copiar</span></button>${extra}</div>`;}
function renderMethods(el){
  if(!el)return;const c=country();let html='';
  if(c.pay==='yape'){
    html=`<p class="ap-methods-title">Paga en soles con Yape o Plin</p>${methodRow('Yape',YAPE,`A nombre de ${HOLDER}`)}${methodRow('Plin',YAPE,`A nombre de ${HOLDER}`)}<img class="ap-qr" src="assets/qr-yape.png" alt="Código QR de Yape de ${HOLDER}" loading="lazy" onerror="this.remove()">`;
  }else if(c.pay==='crypto'){
    html=`<p class="ap-methods-title">Paga en dólares sin comisión</p>${methodRow('Binance Pay',EMAIL,'Correo de Binance Pay · USDT o USDC')}${methodRow('Airtm',EMAIL,'Correo de Airtm')}${methodRow('Takenos',EMAIL,'Correo de Takenos')}`;
  }else{
    html=`<p class="ap-methods-title">Paga en ${c.currency==='EUR'?'euros':'dólares'} con PayPal</p>${methodRow('PayPal',EMAIL,'Elige «Enviar dinero» y pega este correo')}<a class="button ap-paypal" href="${PAYPAL_URL}" target="_blank" rel="noopener noreferrer">Pagar con PayPal · pago internacional</a>`;
  }
  el.innerHTML=html;
}

/* Candado de descargas: se puede crear y ver todo, pero descargar o compartir pide código. */
function gateFor(el){
  for(const [feature,sel] of GATES){
    const hit=el.closest(sel);if(!hit)continue;
    if(feature==='cuentos'&&!/Descargar|Compartir|PDF|Imprimir/i.test(hit.textContent))continue;
    if(hit.matches('[data-video-sharing] button')&&isEditButton(hit))continue;
    return {feature,el:hit};
  }
  return null;
}
let gateDialog=null,pending=null,bypass=false;
function buildGate(){
  gateDialog=document.createElement('dialog');gateDialog.className='ap-gate';gateDialog.setAttribute('aria-labelledby','ap-gate-title');
  gateDialog.innerHTML=`<button type="button" class="ap-gate-close" aria-label="Cerrar">×</button><span class="paywall-lock" aria-hidden="true">🔒</span><p class="eyebrow">DESCARGAR Y COMPARTIR</p><h2 id="ap-gate-title">Activa tu código</h2><p id="ap-gate-text"></p>
<form class="paywall-form" id="ap-gate-form"><label>Código de 6 caracteres<input name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="30" placeholder="Ej. K7Q2M9"></label><button type="submit" class="button">Activar</button></form><p class="paywall-status fine" id="ap-gate-status" role="status"></p>
<div class="paywall-actions"><a class="button gold" href="#paquetes" data-close>Ver paquetes y precios</a><a class="button green" href="${whatsappUrl('¡Hola, La aldea de Santa! Quiero comprar un paquete para descargar mis videos, cuentos y libros.')}" target="_blank" rel="noopener noreferrer">Pedir mi código por WhatsApp</a></div>
<p class="fine">Gratis para todos: el quiz con su certificado y las 25 tarjetas de Navidad.</p>`;
  document.body.append(gateDialog);
  gateDialog.querySelector('.ap-gate-close').addEventListener('click',()=>gateDialog.close());
  gateDialog.querySelector('[data-close]').addEventListener('click',()=>gateDialog.close());
  gateDialog.addEventListener('click',e=>{if(e.target===gateDialog)gateDialog.close();});
  gateDialog.querySelector('form').addEventListener('submit',async e=>{
    e.preventDefault();const status=$('#ap-gate-status'),btn=e.target.querySelector('button');btn.disabled=true;status.textContent='Comprobando…';
    const r=await redeem(e.target.code.value);btn.disabled=false;
    if(!r.ok){status.textContent=r.message;return;}
    if(pending&&!hasAccess(pending.feature)){status.textContent=`Tu código se activó, pero no incluye: ${FEATURES[pending.feature].toLowerCase()}. Puedes agregarlo desde «Paquetes y precios».`;return;}
    toast(r.message);gateDialog.close();e.target.code.value='';
    const target=pending?.el;pending=null;
    if(target&&document.contains(target)){bypass=true;try{target.click();}finally{bypass=false;}}
  });
}
function openGate(feature,el){
  if(!gateDialog)buildGate();pending={feature,el};
  $('#ap-gate-text').textContent=GATE_TEXT[feature];$('#ap-gate-status').textContent='';
  gateDialog.showModal();gateDialog.querySelector('input').focus();
}
document.addEventListener('click',e=>{
  if(bypass)return;const g=gateFor(e.target);if(!g||hasAccess(g.feature))return;
  e.preventDefault();e.stopImmediatePropagation();openGate(g.feature,g.el);
},true);
/* Sin código: los videos no muestran el menú de descarga del navegador y no se pueden guardar con clic derecho. */
const PROTECTED='#lista-buenos,#buenos,#ninos-buenos,#editor,#cuentos,#colorear,#tarjetas,#cumpleanos,#tarjeta-qr';
document.addEventListener('contextmenu',e=>{if(isCreator()||access.features.length)return;if(e.target.closest('video,canvas,img')&&e.target.closest(PROTECTED))e.preventDefault();});
function protectMedia(){
  const open=access.features.length>0||isCreator();
  for(const v of $$(`${PROTECTED.split(',').map(s=>s+' video').join(',')}`)){
    if(open){v.removeAttribute('controlslist');v.disablePictureInPicture=false;}else{v.setAttribute('controlslist','nodownload noplaybackrate');v.disablePictureInPicture=true;}
  }
}
function refreshLocks(){
  document.body.classList.toggle('ap-unlocked',access.features.length>0||isCreator());
  document.body.classList.toggle('ap-creator',isCreator());
  for(const a of $$('.magic-links a, .site-header nav a'))a.classList.toggle('ap-free-link',a.hash==='#juegos'||a.hash==='#tarjeta-navidad');
  protectMedia();renderAccessList();
  window.dispatchEvent(new CustomEvent('aldea:creator',{detail:{creator:isCreator()}}));
}
new MutationObserver(()=>protectMedia()).observe(document.querySelector('main')||document.body,{subtree:true,childList:true});

/* Sección «Paquetes y precios» */
let selected={pkg:'video3',books:false};
function packageCard(p){
  const art=document.createElement('article');art.className='ap-card';art.dataset.pkg=p.id;
  art.innerHTML=`<span class="ap-badge">${esc(p.name)}</span><h4>${esc(p.title)}</h4><p class="ap-price" data-price></p><p class="ap-was fine" data-alt></p>
<ul class="ap-includes"><li>🎬 ${esc(p.video)}</li>${p.books==='included'?'<li>📚 Pack Completo de 30 Libros para Colorear</li>':''}<li>🎁 De regalo: ${esc(GIFTS[0])}</li><li>🎁 De regalo: ${esc(GIFTS[1])}</li></ul>
${p.books==='optional'?'<label class="ap-books"><input type="checkbox" data-books><span data-books-label></span></label>':''}
<button type="button" class="button" data-choose aria-pressed="false">Elegir este paquete</button>`;
  art.querySelector('[data-books]')?.addEventListener('change',()=>{if(selected.pkg===p.id)selected.books=art.querySelector('[data-books]').checked;renderPrices();renderPay();});
  art.querySelector('[data-choose]').addEventListener('click',()=>{selected={pkg:p.id,books:!!art.querySelector('[data-books]')?.checked};renderPrices();renderPay();$('#ap-pay').scrollIntoView({behavior:'smooth',block:'start'});});
  return art;
}
function renderFlags(){
  for(const b of $$('[data-country]')){const on=b.dataset.country===countryId;b.setAttribute('aria-checked',String(on));b.tabIndex=on?0:-1;}
  const c=country();const note=$('#ap-currency');if(note)note.textContent=`${c.flag} ${c.name}: precios en ${c.currency==='PEN'?'soles (S/)':c.currency==='EUR'?'euros (€)':'dólares (US$)'} · pago con ${payName(c)}`;
}
function renderPrices(){
  for(const art of $$('.ap-card')){
    const id=art.dataset.pkg,box=art.querySelector('[data-books]'),books=!!box?.checked;
    art.querySelector('[data-price]').textContent=fmt(amount(id,books));
    art.querySelector('[data-alt]').textContent=currency()==='PEN'?`Internacional: ${fmt(amount(id,books,'USD'))} o ${fmt(amount(id,books,'EUR'))}`:`En Perú: ${fmt(amount(id,books,'PEN'))}`;
    const label=art.querySelector('[data-books-label]');if(label)label.textContent=booksLabel(id);
    const on=selected.pkg===id;art.classList.toggle('selected',on);const btn=art.querySelector('[data-choose]');btn.setAttribute('aria-pressed',String(on));btn.textContent=on?'✓ Paquete elegido':'Elegir este paquete';
  }
}
function receiptText(){
  const p=PACKAGES[selected.pkg],c=country(),child=($('#ap-child')?.value||'').trim();
  return ['¡Hola, La aldea de Santa! Ya hice mi pago 🎅','',`Paquete: ${p.name} · ${p.title}`,`Pack de 30 libros para colorear: ${booksText(p.id,selected.books)}`,`Regalos: ${GIFTS.join(' + ')}`,`Monto pagado: ${fmt(amount(p.id,selected.books))}`,`Método de pago: ${payName(c)}`,`País: ${c.flag} ${c.name}`,`Nombre del niño/a: ${child||'(lo escribo aquí)'}`,'','Adjunto mi comprobante. ¿Me envían mi código de acceso?'].join('\n');
}
function renderPay(){
  const box=$('#ap-summary');if(!box)return;const p=PACKAGES[selected.pkg];
  box.innerHTML=`<div><span>Paquete</span><strong>${esc(p.name)} · ${esc(p.title)}</strong></div><div><span>30 libros para colorear</span><strong>${esc(booksText(p.id,selected.books))}</strong></div><div><span>Regalos</span><strong>Cuento + tarjeta de felicitación</strong></div><div class="ap-total"><span>Total a pagar</span><strong>${esc(fmt(amount(p.id,selected.books)))}</strong></div>`;
  renderMethods($('#ap-methods'));
  $('#ap-wa').href=whatsappUrl(receiptText());
}
function renderAccessList(){
  const list=$('#ap-access-list');if(!list)return;
  list.innerHTML=Object.entries(FEATURES).map(([f,name])=>`<li class="${hasAccess(f)?'on':''}">${hasAccess(f)?'✓ Descarga activada:':'🔒 Ver gratis · descargar con código:'} ${esc(name)}</li>`).join('')+'<li class="on">✓ Gratis: quiz con certificado y las 25 tarjetas de Navidad</li>';
  $('#ap-logout').hidden=!access.features.length&&!isCreator();
  $('#ap-plans').textContent=access.plans?.length?`Activado en este dispositivo: ${access.plans.join(' · ')}`:'Todavía no activaste ningún código en este dispositivo.';
}
function buildPackages(){
  const root=$('#paquetes');if(!root)return;
  root.innerHTML=`<div class="wrap"><div class="section-heading"><div><p class="eyebrow">PAQUETES, REGALOS Y PAGO</p><h2 id="ap-heading">Elige su paquete.<br><em>Santa hace el resto.</em></h2></div><p>Todos los paquetes de video incluyen de regalo un cuento personalizado con su nombre y una tarjeta de felicitación lista para enviar.</p></div>
<a class="ap-free" href="#juegos"><span>🎁 100 % GRATIS</span><strong>El gran reto navideño + certificado descargable</strong><small>Juega, aprende y comparte tu certificado sin pagar nada →</small></a>
<h3 class="ap-step">1. ¿Desde dónde pagas?</h3><div class="ap-flags" role="radiogroup" aria-label="País o región de pago">${COUNTRIES.map(c=>`<button type="button" role="radio" data-country="${c.id}" aria-checked="false"><span class="ap-flag" aria-hidden="true">${c.flag}</span>${esc(c.name)}</button>`).join('')}</div><p class="fine" id="ap-currency" aria-live="polite"></p>
<h3 class="ap-step">2. Elige tu paquete</h3><div class="ap-packages" id="ap-packages"></div>
<div class="ap-bottom"><div class="panel ap-pay" id="ap-pay"><h3 class="ap-step">3. Paga y envía tu comprobante</h3><div class="ap-summary" id="ap-summary" aria-live="polite"></div><label>Nombre del niño o niña<input id="ap-child" maxlength="40" autocomplete="off" placeholder="Para su video, cuento y tarjeta"></label><div class="ap-methods" id="ap-methods"></div><a class="button green ap-wa" id="ap-wa" href="#" target="_blank" rel="noopener noreferrer">${icons.wa}<span>Enviar comprobante por WhatsApp</span></a><p class="fine">Se abre WhatsApp con el resumen de tu paquete, el monto exacto y el nombre del niño o niña. Adjunta la captura de tu pago y te enviamos tu código de acceso.</p><a class="ap-more" href="#pedido" id="ap-to-order">¿Quieres contarnos más detalles para el video? Completa el formulario del saludo →</a></div>
<div class="panel ap-unlock" id="ap-unlock"><h3 class="ap-step">4. Activa tu código de acceso</h3><p>Crear y ver es gratis. Con el código de 6 caracteres que te enviamos por WhatsApp puedes descargar y compartir tus videos cortos, cuentos, tarjetas y libros. Los videos de 3 minutos o más los preparamos nosotros y te los enviamos por WhatsApp.</p><form id="ap-code-form" class="ap-code-form"><input id="ap-code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="30" placeholder="Tu código" aria-label="Código de acceso"><button type="submit" class="button">Activar</button></form><p id="ap-code-status" class="fine" role="status"></p><ul class="ap-access" id="ap-access-list"></ul><p class="fine" id="ap-plans"></p><button type="button" class="button outline small" id="ap-logout" hidden>Quitar el código de este dispositivo</button></div></div></div>`;
  const grid=$('#ap-packages');for(const p of Object.values(PACKAGES))grid.append(packageCard(p));
  root.querySelector('.wrap').append(shareBar({heading:'Comparte La aldea de Santa con tu familia',text:'🎅 Mira La aldea de Santa: videos de Santa con su nombre, cuentos, tarjetas y un quiz navideño gratis con certificado.'}));
  const flags=root.querySelector('.ap-flags');
  flags.addEventListener('click',e=>{const b=e.target.closest('[data-country]');if(b)setCountry(b.dataset.country);});
  flags.addEventListener('keydown',e=>{const keys={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1};if(!keys[e.key])return;e.preventDefault();const i=COUNTRIES.findIndex(c=>c.id===countryId),next=COUNTRIES[(i+keys[e.key]+COUNTRIES.length)%COUNTRIES.length];setCountry(next.id);flags.querySelector(`[data-country="${next.id}"]`).focus();});
  $('#ap-child').addEventListener('input',()=>{$('#ap-wa').href=whatsappUrl(receiptText());});
  $('#ap-wa').addEventListener('click',()=>{$('#ap-wa').href=whatsappUrl(receiptText());});
  $('#ap-to-order').addEventListener('click',()=>window.dispatchEvent(new CustomEvent('aldea:package',{detail:{...selected}})));
  $('#ap-code-form').addEventListener('submit',async e=>{e.preventDefault();const r=await redeem($('#ap-code').value);$('#ap-code-status').textContent=r.message;if(r.ok){$('#ap-code').value='';toast(r.message);}});
  $('#ap-logout').addEventListener('click',()=>{clearAccess();$('#ap-code-status').textContent='Quitamos el código de este dispositivo.';});
  renderFlags();renderPrices();renderPay();
}

/* Compartir tarjetas, certificado y la web */
function addShareBars(){
  const spots=[
    ['.download-actions[data-output="certificate"]',{heading:'Comparte tu certificado',text:'🏅 ¡Gané mi certificado navideño en El gran reto de La aldea de Santa! Juega gratis:',hash:'#juegos',shareKey:'certificate'}],
    ['.download-actions[data-output="card"]',{heading:'Envía tu tarjeta a amigos y familiares',text:'🎄 Te comparto una tarjeta de Navidad de La aldea de Santa. Crea la tuya aquí:',hash:'#tarjetas',shareKey:'card'}],
    ['#tarjeta-navidad [data-video-sharing="nc"]',{heading:'Comparte tu tarjeta de Navidad',text:'❄ Mira mi tarjeta de Navidad con cuenta regresiva de La aldea de Santa:',hash:'#tarjeta-navidad'}],
    ['footer .footer-signature',{heading:'Comparte la aplicación',text:'🎅 Mira La aldea de Santa: videos de Santa con su nombre, cuentos, tarjetas y un quiz navideño gratis con certificado.'}]
  ];
  for(const [sel,opts] of spots){const anchor=$(sel);if(anchor&&!anchor.parentElement.querySelector('.ap-share'))anchor.after(shareBar(opts));}
}

/* Windows no dibuja banderas con emojis: cargamos solo esos símbolos de Noto Color Emoji. */
/* Solo en Windows (los celulares ya muestran banderas) y solo al abrir pestañas con banderas. */
let flagFontLink=null;
function flagFont(){
  if(flagFontLink||!/Windows/i.test(navigator.userAgent))return;
  flagFontLink=document.createElement('link');flagFontLink.rel='stylesheet';flagFontLink.href='https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap&text='+encodeURIComponent(COUNTRIES.map(c=>c.flag).join(''));document.head.append(flagFontLink);
}
(window.ALDEA_WHEN_SHOWN||((i,f)=>f()))(['paquetes','pedido','catalogo','buzon'],flagFont);

window.ALDEA_PAY={COUNTRIES,PACKAGES,GIFTS,TYPES,country,setCountry,currency,fmt,amount,storyPrice,booksLabel,booksText,payName,whatsappUrl,renderMethods,hasAccess,isCreator,lookup,redeem,clearAccess,toast,copy,shareBar};

/* Enlace secreto de creador: ?creador=TOKEN (se borra de la barra de direcciones). */
(async()=>{
  const params=new URLSearchParams(location.search),token=params.get('creador');if(!token)return;
  params.delete('creador');history.replaceState(null,'',location.pathname+(params.toString()?'?'+params:'')+location.hash);
  const r=await lookup(token);
  if(r.entry?.creator){grant(r.entry);toast('Modo creador activado en este dispositivo.');location.hash='creador';}
  else toast('El enlace de creador no es válido.');
})();

buildPackages();addShareBars();refreshLocks();
window.addEventListener('aldea:country',()=>{renderFlags();renderPrices();renderPay();});
window.addEventListener('storage',e=>{if(e.key==='aldea-access'){access=store.get('aldea-access')||{features:[],plans:[]};refreshLocks();}});
})();
