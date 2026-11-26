(() => {
'use strict';
/* Oculta desde el inicio las pestañas que no se están viendo (pages.js luego gestiona la navegación).
   Así el navegador no descarga imágenes ni miniaturas de secciones ocultas al abrir la web. */
(()=>{
  const main=document.querySelector('main');if(!main)return;
  let key;try{key=decodeURIComponent(location.hash.slice(1))||'inicio';}catch{key='inicio';}
  if(!document.getElementById(key)||!main.contains(document.getElementById(key)))key='inicio';
  const visible=key==='catalogo'||key==='pedido'?['catalogo','pedido']:[key];
  for(const el of main.children)el.hidden=el.classList.contains('ribbon')?key!=='inicio':!visible.includes(el.id);
})();
/* Carga bajo demanda para que la web abra rápido en celulares:
   - quiz-data.js (1500 preguntas, ≈500 KB): al entrar a la zona gratis o al quiz.
   - jsPDF y el generador de QR (≈470 KB): al entrar a secciones con PDF o QR, o al tocar sus botones. */
const loaded=new Map();
function script(src,ready){
  if(ready())return Promise.resolve();
  if(!loaded.has(src))loaded.set(src,new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src=src;s.async=true;
    s.onload=()=>resolve();s.onerror=()=>{loaded.delete(src);s.remove();reject(new Error('No se pudo cargar una parte de la aldea. Revisa tu conexión y vuelve a intentarlo.'));};
    document.head.append(s);
  }));
  return loaded.get(src);
}
if(!Array.isArray(window.SANTA_QUIZ))window.SANTA_QUIZ=[];
const quiz=()=>script('quiz-data.js',()=>window.SANTA_QUIZ.length>0).then(()=>window.dispatchEvent(new Event('aldea:quiz-ready')));
const pdf=()=>script('vendor/jspdf.js',()=>!!window.jspdf);
const qr=()=>script('vendor/qrcode.js',()=>typeof window.qrcode==='function');
window.ALDEA_LAZY={quiz,pdf,qr};
/* Ejecuta fn la primera vez que se abre una de esas pestañas (o ya, si es la actual).
   Sirve para no dibujar ni descargar imágenes de secciones que nadie está mirando. */
window.ALDEA_WHEN_SHOWN=(ids,fn)=>{
  ids=[].concat(ids);let done=false;
  const current=()=>{try{return decodeURIComponent(location.hash.slice(1))||'inicio';}catch{return 'inicio';}};
  const run=()=>{if(done)return;done=true;window.removeEventListener('aldea:navigate',on);fn();};
  const on=e=>{if(ids.includes(e.detail.page))run();};
  if(ids.includes(current()))run();else window.addEventListener('aldea:navigate',on);
};

const PDF_PAGES=['tarjetas','cuentos','colorear','cumpleanos','juegos','buenos','tarjeta-qr'];
function byRoute(){
  const page=location.hash.slice(1);
  if(page==='juegos'||page==='gratis')quiz().catch(()=>{});
  if(PDF_PAGES.includes(page))pdf().catch(()=>{});
  if(page==='tarjeta-qr')qr().catch(()=>{});
}
window.addEventListener('hashchange',byRoute);byRoute();

/* Red de seguridad: si tocan un botón de PDF antes de que la librería llegue, se espera y se repite el clic. */
const isPdfButton=el=>el.closest('[data-pdf],#sl-pdf,#color-download')||((b=>b&&/PDF/i.test(b.textContent))(el.closest('#story-stage button')));
let replaying=false;
document.addEventListener('click',e=>{
  if(replaying||window.jspdf)return;const btn=isPdfButton(e.target);if(!btn)return;
  e.preventDefault();e.stopImmediatePropagation();
  pdf().then(()=>{replaying=true;try{btn.click();}finally{replaying=false;}}).catch(err=>window.ALDEA_PAY?.toast(err.message));
},true);
document.addEventListener('submit',e=>{
  if(e.target.id!=='qr-form'||typeof window.qrcode==='function')return;
  e.preventDefault();e.stopImmediatePropagation();const form=e.target;
  Promise.all([qr(),pdf()]).then(()=>form.requestSubmit()).catch(err=>window.ALDEA_PAY?.toast(err.message));
},true);
})();
