/* Videollamada simulada con Santa: todo ocurre en este dispositivo.
   La cámara frontal solo se muestra en pantalla; no se graba ni se envía. */
(() => {
'use strict';
const $=s=>document.querySelector(s);
const RATE=44100,RING_TIMEOUT=35000;
const catalog=window.SANTA_NAME_AUDIO||[],speech=window.SANTA_LIST_SPEECH,stardust=window.SANTA_STARDUST;
const SCENES={
  original:{src:'assets/lista-video/santa-polvo.mp4',poster:'assets/lista-video/poster.jpg',cover:'assets/lista-video/santa-polvo-cover.jpg'},
  bolsita:{src:'assets/lista-video/santa-bolsita.mp4',poster:'assets/lista-video/santa-bolsita.jpg',cover:'assets/lista-video/santa-bolsita-cover.jpg'},
  destellos:{src:'assets/lista-video/santa-destellos.mp4',poster:'assets/lista-video/santa-destellos.jpg',cover:'assets/lista-video/santa-destellos-cover.jpg'},
  luna:{src:'assets/lista-video/santa-luna.mp4',poster:'assets/lista-video/santa-luna.jpg',cover:'assets/lista-video/santa-luna-cover.jpg'},
  guirnaldas:{src:'assets/lista-video/santa-guirnaldas.mp4',poster:'assets/lista-video/santa-guirnaldas.jpg',cover:'assets/lista-video/santa-guirnaldas-cover.jpg'}
};
const form=$('#vc-form');if(!form)return;
const nameInput=$('#vc-name'),nameStatus=$('#vc-name-status'),showName=$('#vc-show-name'),sayName=$('#vc-say-name'),profileSel=$('#vc-profile'),sceneSel=$('#vc-scene'),delaySel=$('#vc-delay'),formStatus=$('#vc-status'),startBtn=$('#vc-start'),cancelBtn=$('#vc-cancel');
const screen=$('#vc-screen'),santa=$('#vc-santa'),bg=$('#vc-bg'),selfBox=$('#vc-self-box'),selfVideo=$('#vc-self'),selfOff=$('#vc-self-off'),canvas=$('#vc-name-canvas'),c2d=canvas.getContext('2d'),caption=$('#vc-caption'),timerEl=$('#vc-timer'),toast=$('#vc-toast');
const answerBtn=$('#vc-answer'),declineBtn=$('#vc-decline'),hangupBtn=$('#vc-hangup'),camBtn=$('#vc-cam'),speakerBtn=$('#vc-speaker'),againBtn=$('#vc-again'),closeBtn=$('#vc-close');
const DEFAULT_STATUS=formStatus.textContent;
let helper=null,ctx=null,ringBus=null,ringTimer=0,missTimer=0,delayTimer=0,clockTimer=0,toastTimer=0,endTimer=0,raf=0;
let stream=null,source=null,gain=null,session=0,plan=null,audioStart=0,connectedAt=0,lastFocus=null;
const loadHelper=()=>helper?Promise.resolve(helper):import('./call-audio.mjs').then(m=>(helper=m));
const typed=()=>nameInput.value.trim().normalize('NFC').replace(/\s+/g,' ');
const recordingFor=v=>v&&speech?speech.find(catalog,v)||null:null;

/* ---------- Formulario ---------- */
function nameState(){
  const v=typed(),rec=recordingFor(v);
  sayName.disabled=!rec;sayName.closest('label').classList.toggle('is-disabled',!rec);
  nameStatus.dataset.state=rec?'ok':v?'missing':'';
  nameStatus.textContent=rec?`Santa dirá «${rec.name}» con su propia voz.`:v?'Este nombre no tiene grabación: aparecerá en pantalla y Santa saludará sin decirlo en voz alta.':'Elige uno de los nombres grabados o escribe cualquier nombre para mostrarlo en pantalla.';
}
nameInput.addEventListener('input',nameState);nameState();

function unlockAudio(){
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  if(!ctx)ctx=new AC();
  if(ctx.state!=='running')ctx.resume().catch(()=>{});
  // Un sonido mudo dentro del gesto desbloquea el audio en iOS.
  try{const b=ctx.createBuffer(1,1,22050),s=ctx.createBufferSource();s.buffer=b;s.connect(ctx.destination);s.start();}catch{}
  return ctx;
}

async function buildAudio(rec,profileId,withVoice){
  const m=await loadHelper(),profile=m.CALL_PROFILES.find(p=>p.id===profileId)||m.CALL_PROFILES[0];
  const useName=!!(withVoice&&rec&&/^assets\/nombres\/[a-zA-Z0-9-]+\.wav$/.test(rec.src));
  const get=async path=>{const r=await fetch(new URL(path,document.baseURI));if(!r.ok)throw new Error('No se pudo cargar la voz de Santa. Revisa tu conexión.');return m.pcm(new Uint8Array(await r.arrayBuffer()));};
  const paths=['assets/llamadas/hola.wav','assets/llamadas/'+profile.body,'assets/llamadas/'+profile.music];if(useName)paths.push(rec.src);
  const [hello,body,music,name]=await Promise.all(paths.map(get));
  const lead=.7;let voice,nameDur=.9;
  if(useName){const trimmed=name.subarray(Math.min(name.length-1,Math.max(0,Math.round((rec.lead||0)*RATE))));nameDur=trimmed.length/RATE;voice=m.join([lead,hello,.10,trimmed,.15,body]);}
  else voice=m.join([lead,hello,.35,body]);
  const samples=m.mix(voice,music,0);
  if(!ctx)throw new Error('Este navegador no puede reproducir el audio de la llamada.');
  const buffer=ctx.createBuffer(1,samples.length,RATE);buffer.copyToChannel?buffer.copyToChannel(samples,0):buffer.getChannelData(0).set(samples);
  return {buffer,nameAt:lead+hello.length/RATE+.10,nameDur:Math.max(.4,Math.min(1.2,nameDur))};
}

form.addEventListener('submit',e=>{
  e.preventDefault();
  const v=typed();
  if(!v){nameInput.focus();formStatus.textContent='Escribe el nombre del niño o niña para preparar la videollamada.';return;}
  unlockAudio();
  const rec=recordingFor(v),scene=SCENES[sceneSel.value]||SCENES.original;
  plan={name:v,rec,scene,showName:showName.checked,withVoice:sayName.checked&&!!rec,profile:profileSel.value};
  schedule(Number(delaySel.value)||0);
});

function schedule(delay){
  const id=++session;clearTimeout(delayTimer);
  plan.audio=buildAudio(plan.rec,plan.profile,plan.withVoice);plan.audio.catch(()=>{});
  santa.src=plan.scene.src;santa.poster=plan.scene.poster;santa.load();
  if(delay>0){
    startBtn.disabled=true;cancelBtn.hidden=false;
    let left=delay;const tick=()=>{formStatus.textContent=`La videollamada de Santa sonará en ${left} s. Entrega el celular a ${plan.name}.`;};tick();
    delayTimer=setInterval(()=>{if(id!==session)return clearInterval(delayTimer);if(--left<=0){clearInterval(delayTimer);incoming(id);}else tick();},1000);
  }else incoming(id);
}
cancelBtn.addEventListener('click',()=>{++session;clearInterval(delayTimer);resetForm();formStatus.textContent='Llamada programada cancelada.';});
function resetForm(){startBtn.disabled=false;cancelBtn.hidden=true;}

/* ---------- Tono de llamada (sintetizado, original) ---------- */
function bell(t,f,dur,vol){
  const o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),g2=ctx.createGain();
  o.type='sine';o.frequency.value=f;o2.type='triangle';o2.frequency.value=f*2.005;g2.gain.value=.18;
  o.connect(g);o2.connect(g2).connect(g);g.connect(ringBus);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05);
}
function ringCycle(){
  if(!ctx||!ringBus)return;
  const t=ctx.currentTime+.05,notes=[1318.5,1760,1568,2093,0,1318.5,1760,1568,2637];
  notes.forEach((f,i)=>{if(f)bell(t+i*.15,f,.55,.2);});
  if(navigator.userActivation?.hasBeenActive!==false)try{navigator.vibrate?.([450,250,450]);}catch{}
}
function startRing(){
  if(!ctx)return;stopRing();
  ringBus=ctx.createGain();ringBus.gain.value=.9;ringBus.connect(ctx.destination);
  ringCycle();ringTimer=setInterval(ringCycle,2800);
}
function stopRing(){
  clearInterval(ringTimer);ringTimer=0;if(navigator.userActivation?.hasBeenActive!==false)try{navigator.vibrate?.(0);}catch{}
  if(ringBus&&ctx){const bus=ringBus;bus.gain.setTargetAtTime(0,ctx.currentTime,.04);setTimeout(()=>bus.disconnect(),400);}
  ringBus=null;
}

/* ---------- Pantalla de la llamada ---------- */
function setState(s){screen.dataset.state=s;}
function openScreen(){
  if(screen.hidden){lastFocus=document.activeElement;screen.hidden=false;document.body.classList.add('vc-open');}
}
function incoming(id){
  if(id!==session)return;
  resetForm();formStatus.textContent=DEFAULT_STATUS;
  for(const img of screen.querySelectorAll('.vc-avatar img'))img.src=plan.scene.cover;
  bg.src=plan.scene.poster;
  $('#vc-incoming-label').textContent='Videollamada entrante…';
  canvas.classList.remove('faded');c2d.clearRect(0,0,canvas.width,canvas.height);caption.hidden=true;
  selfBox.dataset.cam='off';selfOff.textContent='Activando cámara…';
  setCamButton(true);setSpeakerButton(false);hideToast();
  openScreen();setState('ringing');
  santa.muted=true;santa.play().catch(()=>{});
  if(ctx&&ctx.state!=='running')ctx.resume().catch(()=>{});
  startRing();
  clearTimeout(missTimer);missTimer=setTimeout(()=>{if(id===session&&screen.dataset.state==='ringing')finish('missed');},RING_TIMEOUT);
  requestAnimationFrame(()=>answerBtn.focus({preventScroll:true}));
}

answerBtn.addEventListener('click',()=>{if(screen.dataset.state==='ringing')answer();});
declineBtn.addEventListener('click',()=>{if(screen.dataset.state==='ringing')finish('declined');});
hangupBtn.addEventListener('click',()=>finish('ended'));
againBtn.addEventListener('click',()=>{if(!plan)return;unlockAudio();schedule(0);});
closeBtn.addEventListener('click',closeScreen);

async function answer(){
  const id=session;
  stopRing();clearTimeout(missTimer);unlockAudio();
  try{const fs=screen.requestFullscreen||screen.webkitRequestFullscreen;if(fs&&matchMedia('(pointer:coarse)').matches)fs.call(screen,{navigationUI:'hide'})?.catch?.(()=>{});}catch{}
  setState('connecting');timerEl.textContent='Conectando…';
  santa.currentTime=0;santa.play().catch(()=>{});
  const camera=startCamera(id);
  let audio;
  try{audio=await plan.audio;}catch(e){if(id!==session)return;showToast(e.message||'No se pudo preparar la llamada.');setTimeout(()=>{if(id===session)finish('failed');},2600);return;}
  await Promise.race([camera,new Promise(r=>setTimeout(r,2500))]);
  if(id!==session||screen.dataset.state!=='connecting')return;
  connect(id,audio);
}

async function startCamera(id){
  stopCamera();
  if(!navigator.mediaDevices?.getUserMedia){selfOff.textContent='Cámara no disponible';showToast('Este navegador no permite usar la cámara. La llamada sigue sin tu imagen.');return;}
  try{
    const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:640}},audio:false});
    if(id!==session||screen.hidden){s.getTracks().forEach(t=>t.stop());return;}
    stream=s;selfVideo.srcObject=s;await selfVideo.play().catch(()=>{});
    selfBox.dataset.cam=camBtn.dataset.off==='true'?'off':'on';selfOff.textContent='Cámara apagada';
    if(camBtn.dataset.off==='true')s.getVideoTracks().forEach(t=>t.enabled=false);
  }catch(e){
    if(id!==session)return;
    selfOff.textContent='Cámara bloqueada';
    showToast(e&&e.name==='NotAllowedError'?'Permite el acceso a la cámara para verte en la llamada.':'No se pudo encender la cámara frontal.');
  }
}
function stopCamera(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}selfVideo.srcObject=null;}

function connect(id,audio){
  setState('incall');
  source=ctx.createBufferSource();source.buffer=audio.buffer;
  gain=ctx.createGain();gain.gain.value=speakerBtn.dataset.off==='true'?0:1;
  source.connect(gain).connect(ctx.destination);
  audioStart=ctx.currentTime+.08;source.start(audioStart);
  source.onended=()=>{if(id===session&&screen.dataset.state==='incall')endTimer=setTimeout(()=>{if(id===session)finish('ended');},1400);};
  connectedAt=Date.now();updateClock();clockTimer=setInterval(updateClock,500);
  if(plan.showName){caption.textContent='✨ '+plan.name;}
  const revealAt=audio.nameAt-.04,fadeAt=audio.nameAt+7;
  const loop=()=>{
    if(id!==session||screen.dataset.state!=='incall')return;
    const t=ctx.currentTime-audioStart;
    if(plan.showName){
      c2d.clearRect(0,0,canvas.width,canvas.height);
      if(t<fadeAt+1.5)stardust.draw(c2d,plan.name,t,revealAt,audio.nameDur,{immediate:true,size:250,maxWidth:900,y:400});
      if(t>fadeAt&&!canvas.classList.contains('faded')){canvas.classList.add('faded');caption.hidden=false;}
    }
    raf=requestAnimationFrame(loop);
  };
  raf=requestAnimationFrame(loop);
}
const fmt=ms=>{const s=Math.floor(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
function updateClock(){timerEl.textContent=fmt(Date.now()-connectedAt);}

function teardown(){
  stopRing();clearTimeout(missTimer);clearInterval(clockTimer);clearTimeout(endTimer);cancelAnimationFrame(raf);
  if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();source=null;}
  if(gain){gain.disconnect();gain=null;}
  stopCamera();santa.pause();
  try{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else if(document.webkitFullscreenElement)document.webkitExitFullscreen();}catch{}
}
function finish(reason){
  if(screen.hidden)return;
  const wasConnected=screen.dataset.state==='incall';
  ++session;teardown();hideToast();
  const titles={ended:'Llamada finalizada',declined:'Llamada rechazada',missed:'Llamada perdida',failed:'No se pudo conectar'};
  $('#vc-end-title').textContent=titles[reason]||titles.ended;
  $('#vc-end-detail').textContent=wasConnected?`Santa Claus · ${fmt(Date.now()-connectedAt)}`:reason==='missed'?'Santa Claus intentó llamarte':'Santa Claus · Polo Norte';
  againBtn.textContent=reason==='ended'?'Volver a llamar':'Devolver la llamada';
  setState('ended');
  requestAnimationFrame(()=>againBtn.focus({preventScroll:true}));
}
function closeScreen(){
  ++session;teardown();hideToast();
  screen.hidden=true;document.body.classList.remove('vc-open');
  santa.removeAttribute('src');santa.load();
  resetForm();
  (lastFocus&&document.contains(lastFocus)?lastFocus:startBtn).focus({preventScroll:true});
}

/* ---------- Controles ---------- */
function setCamButton(on){camBtn.dataset.off=String(!on);camBtn.setAttribute('aria-label',on?'Apagar cámara':'Encender cámara');}
function setSpeakerButton(muted){speakerBtn.dataset.off=String(muted);speakerBtn.setAttribute('aria-label',muted?'Activar el sonido de Santa':'Silenciar a Santa');}
camBtn.addEventListener('click',()=>{
  const on=camBtn.dataset.off==='true';setCamButton(on);
  if(stream){stream.getVideoTracks().forEach(t=>t.enabled=on);selfBox.dataset.cam=on?'on':'off';selfOff.textContent='Cámara apagada';}
  else if(on&&screen.dataset.state==='incall')startCamera(session);
});
speakerBtn.addEventListener('click',()=>{const muted=speakerBtn.dataset.off!=='true';setSpeakerButton(muted);if(gain&&ctx)gain.gain.setTargetAtTime(muted?0:1,ctx.currentTime,.03);});

function showToast(text){toast.textContent=text;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(hideToast,5000);}
function hideToast(){clearTimeout(toastTimer);toast.hidden=true;}

/* Recuadro de la cámara: se arrastra y se acomoda en la esquina más cercana. */
let drag=null;
selfBox.addEventListener('pointerdown',e=>{
  const r=selfBox.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,r};
  selfBox.setPointerCapture(e.pointerId);selfBox.classList.add('dragging');
});
selfBox.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;selfBox.style.transform=`translate(${dx}px,${dy}px)`;
});
const endDrag=e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const cx=drag.r.left+drag.r.width/2+(e.clientX-drag.x),cy=drag.r.top+drag.r.height/2+(e.clientY-drag.y);
  selfBox.classList.remove('dragging');selfBox.style.transform='';
  if(drag.moved)selfBox.dataset.corner=(cy<innerHeight/2?'t':'b')+(cx<innerWidth/2?'l':'r');
  drag=null;
};
selfBox.addEventListener('pointerup',endDrag);selfBox.addEventListener('pointercancel',endDrag);

document.addEventListener('keydown',e=>{
  if(screen.hidden)return;
  if(e.key==='Escape'){e.preventDefault();const s=screen.dataset.state;if(s==='ringing')finish('declined');else if(s==='ended')closeScreen();else finish('ended');}
  if(e.key==='Tab'){const f=[...screen.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled);if(!f.length)return;const i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus();}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus();}}
});
window.addEventListener('aldea:navigate',()=>{if($('#llamadas').hidden){++session;clearInterval(delayTimer);resetForm();if(!screen.hidden)closeScreen();}});
window.addEventListener('pagehide',()=>{if(!screen.hidden)teardown();});
})();
