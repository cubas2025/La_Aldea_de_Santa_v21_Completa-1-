(() => {
'use strict';
/* Llamadas de Santa: prueba en el dispositivo y llamada real al celular (Cloudflare + Twilio).
   Ambas reproducen siempre: 1) duende → 2) Santa, primer audio → 3) Santa, segundo audio (call-sequence.mjs). */
const $=s=>document.querySelector(s),phone=window.libphonenumber,catalog=window.SANTA_NAME_AUDIO||[],player=$('#call-player'),status=$('#call-demo-status'),service=$('#call-service-status');
let sequence=null,step=-1,job=0,endpoint='',liveReady=false,requiresCode=false,poll=null;
const loadSequence=()=>sequence?Promise.resolve(sequence):import('./call-sequence.mjs').then(m=>(sequence=m.CALL_SEQUENCE));

const names=[...new Set(catalog.flatMap(n=>[n.name,...n.aliases||[]]))].sort((a,b)=>a.localeCompare(b,'es'));for(const name of names)$('#call-names').append(new Option(name,name));
const countries=phone.getCountries(),display=new Intl.DisplayNames(['es'],{type:'region'});countries.sort((a,b)=>display.of(a).localeCompare(display.of(b),'es'));for(const country of countries)$('#call-country').append(new Option(`${display.of(country)} (+${phone.getCountryCallingCode(country)})`,country));$('#call-country').value='PE';
const inputName=()=>$('#call-name').value.trim().normalize('NFC');

/* Pasos visibles de la secuencia */
async function renderSteps(){
  const seq=await loadSequence(),box=$('#call-steps');if(!box)return;
  box.innerHTML=seq.map((s,i)=>`<li data-step="${i}"><span>${i+1}</span>${s.label}</li>`).join('');
}
function markStep(i){for(const li of document.querySelectorAll('#call-steps li')){const n=Number(li.dataset.step);li.classList.toggle('active',n===i);li.classList.toggle('done',n<i);}}

function stop(){++job;step=-1;player.pause();player.removeAttribute('src');player.hidden=true;$('#call-stop').hidden=true;$('#call-demo').disabled=false;markStep(-1);$('#call-preview-title').textContent='Escucha cómo será la llamada';}
async function playStep(i,id){
  const seq=await loadSequence();if(id!==job)return;
  if(i>=seq.length){step=-1;$('#call-demo').disabled=false;$('#call-stop').hidden=true;markStep(seq.length);status.textContent='La prueba terminó: así suena la llamada completa.';return;}
  step=i;markStep(i);player.src=seq[i].src;player.hidden=false;
  $('#call-preview-title').textContent=i===0?'El duende llama desde el Polo Norte…':`Santa ${inputName()?'saluda a '+inputName():'está hablando'}`;
  status.textContent=`Reproduciendo ${i+1} de ${seq.length}: ${seq[i].label}.`;
  try{await player.play();}catch{status.textContent='Toca reproducir para escuchar la llamada.';}
}
player.addEventListener('ended',()=>{if(step>=0)playStep(step+1,job);});
player.addEventListener('error',()=>{if(step>=0){status.textContent='No se pudo cargar uno de los audios. Revisa tu conexión.';}});
$('#call-demo').addEventListener('click',()=>{stop();const id=job;$('#call-demo').disabled=true;$('#call-stop').hidden=false;playStep(0,id);});
$('#call-stop').addEventListener('click',()=>{stop();status.textContent='Prueba finalizada.';});
window.addEventListener('aldea:navigate',()=>{if($('#llamadas').hidden)stop();});

/* Nombre: solo informativo (la llamada usa los audios fijos de la secuencia). */
$('#call-name').addEventListener('input',()=>{const v=inputName();$('#call-name-status').textContent=v?`La llamada es para ${v}.`:'Escribe el nombre del niño o niña que recibirá la llamada.';});

/* Número */
function parsePhone(){const value=$('#call-phone').value.trim(),country=$('#call-country').value;try{const parsed=phone.parsePhoneNumberFromString(value,country);return parsed?.isValid()?parsed:null;}catch{return null;}}
function numberState(){const p=parsePhone();$('#call-number-status').textContent=p?`Número preparado: ${p.formatInternational()}`:$('#call-phone').value.trim()?'Revisa la cantidad de dígitos y el país seleccionado.':'Selecciona el país y escribe el número sin el código internacional.';}
$('#call-phone').addEventListener('input',numberState);$('#call-country').addEventListener('change',numberState);

/* Servicio real: por defecto /api/llamadas en el mismo dominio (Cloudflare). En Vercel, pon la URL de Cloudflare en calls-config.js. */
async function serviceState(){
  try{
    endpoint=String(window.SANTA_CALLS_CONFIG?.endpoint||'/api/llamadas').replace(/\/$/,'');
    const u=new URL(endpoint,location.href);if(u.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(u.hostname))return;
    endpoint=u.href.replace(/\/$/,'');
    const r=await fetch(endpoint+'/ready',{signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error();
    const v=await r.json();liveReady=v.enabled===true;requiresCode=v.requiresAccessCode===true;$('#call-code-label').hidden=!requiresCode||!liveReady;
    service.textContent=liveReady?'Servicio telefónico disponible. Completa los datos para solicitar la llamada.':'Llamadas al celular: pendientes de activación (faltan las claves de Twilio). La prueba de audio está disponible.';
  }catch{service.textContent='Llamadas al celular: pendientes de activación. Puedes escuchar la prueba en este dispositivo.';}
}
const labels={queued:'La llamada está en cola.',initiated:'El operador está iniciando la llamada.',ringing:'El teléfono está sonando.',answered:'La llamada fue atendida: habla el duende y luego Santa.',completed:'La llamada ha finalizado.',busy:'El número está ocupado.',failed:'La llamada no se pudo completar.','no-answer':'El número no respondió.',canceled:'La llamada fue cancelada.'};
$('#call-form').addEventListener('submit',async e=>{
  e.preventDefault();
  if(!liveReady){service.textContent='El servicio telefónico aún no está activado. Puedes escuchar la prueba; no se ha marcado ningún número.';return;}
  const number=parsePhone();
  if(!number){$('#call-phone').focus();service.textContent='Escribe un número válido con su país.';return;}
  if(!$('#call-consent').checked){service.textContent='Confirma que tienes autorización para llamar a este número.';return;}
  const code=$('#call-code').value;if(requiresCode&&!code){$('#call-code').focus();service.textContent='Introduce tu código de llamada.';return;}
  $('#call-live').disabled=true;service.textContent='Solicitando la llamada al servicio telefónico…';
  try{
    const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+code},body:JSON.stringify({name:inputName(),to:number.number,consent:true}),signal:AbortSignal.timeout(20000)}),v=await r.json();
    if(!r.ok)throw new Error(v.error||'El servicio no pudo aceptar la llamada.');
    service.textContent='Llamada solicitada. Contesta el teléfono: primero habla el duende y después Santa.';
    let attempts=0;clearInterval(poll);
    poll=setInterval(async()=>{
      if(++attempts>60){clearInterval(poll);$('#call-live').disabled=false;return;}
      try{const rr=await fetch(endpoint+'/'+encodeURIComponent(v.id),{headers:{Authorization:'Bearer '+code}}),state=await rr.json();if(rr.ok)service.textContent=labels[state.status]||'El operador está procesando la llamada.';if(['completed','busy','failed','no-answer','canceled'].includes(state.status)){clearInterval(poll);$('#call-live').disabled=false;}}catch{}
    },4000);
  }catch(err){$('#call-live').disabled=false;service.textContent=err.message||'No se pudo solicitar la llamada.';}
});
renderSteps();serviceState();
})();
