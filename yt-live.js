(() => {
'use strict';
/* Transmisión para OBS: horizontal (YouTube, 1920 × 1080, en-vivo-youtube.html) o vertical
   (TikTok, 1080 × 1920, en-vivo-vertical.html: <body data-formato="vertical">).
   - Lista de los buenos: los mismos nombres, voz de Santa y polvo de estrellas que el vertical,
     con los videos de Santa con su bolsa en 16:9 (sin sonido, como en el vertical).
   - Música: la canción destacada suena primero y vuelve entre cada canción de la lista general.
   - Episodio 1: videos de Santa hablando con su propio audio y subtítulos palabra por palabra;
     al terminar, sigue la lista de los buenos.
   - Contador a Navidad, hora digital en tiempo real, fecha, nombres leídos y cintillo. */
const kit=window.ALDEA_LIVE_KIT,all=window.ALDEA_LIVE||{},cfg=all.horizontal||{};
if(!kit)return;
const {STR,countdown,channelAt,p2,esc,fmtN}=kit;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const params=new URLSearchParams(location.search);
const stage=$('#yt-stage'),video=$('#yt-video'),bgVideo=$('#yt-bg');
const V=document.body.dataset.formato==='vertical',W=V?1080:1920,H=V?1920:1080;
stage.classList.toggle('vertical',V);

const X={
  es:{from:'EN VIVO DESDE EL POLO NORTE',hora:'Hora en la aldea',h:'horas',m:'min',s:'seg',recent:'Santa acaba de nombrar',playing:'♪ Suena:',ep:'Estreno',noEp:'Los videos del episodio 1 todavía no están en la carpeta. Mientras tanto se transmite la lista de los buenos.',start:'▶ Iniciar transmisión con sonido',blocked:'El navegador pide un clic para activar el sonido. En OBS suena solo.'},
  en:{from:'LIVE FROM THE NORTH POLE',hora:'Village time',h:'hours',m:'min',s:'sec',recent:'Santa just named',playing:'♪ Now playing:',ep:'Premiere',noEp:'The episode 1 videos are not in the folder yet. Meanwhile, the nice list is streaming.',start:'▶ Start stream with sound',blocked:'The browser needs a click to turn the sound on. In OBS it plays by itself.'},
  pt:{from:'AO VIVO DO POLO NORTE',hora:'Hora na vila',h:'horas',m:'min',s:'seg',recent:'O Papai Noel acabou de dizer',playing:'♪ Tocando:',ep:'Estreia',noEp:'Os vídeos do episódio 1 ainda não estão na pasta. Enquanto isso, a lista dos bonzinhos está no ar.',start:'▶ Iniciar transmissão com som',blocked:'O navegador pede um clique para ativar o som. No OBS toca sozinho.'}
};
let lang=STR[params.get('lang')]?params.get('lang'):'es';
if(params.get('obs')==='1')document.body.classList.add('obs');

/* ---------- Escenario a escala de la ventana ---------- */
function fit(){stage.style.setProperty('--s',Math.min(innerWidth/W,innerHeight/H));}
addEventListener('resize',fit);fit();

/* ---------- Música: destacada, otra, destacada, otra… ---------- */
const general=(all.musica||[]).filter(t=>t.src);
const featured=!V&&cfg.musicaDestacada?.src?cfg.musicaDestacada:null;   // la canción destacada es del horizontal
let seq=general.slice();
const bg=new Audio();bg.preload='auto';
let bgI=0,bgLoaded=-1,base=.5,duck=1,fade=1,duckTimer=0,wanted=false,lastT=-1,stuck=0,featuredOk=false;
function buildSeq(){
  seq=featuredOk?general.flatMap(t=>[featured,t]):general.slice();
  if(!seq.length&&featuredOk)seq=[featured];
}
async function checkFeatured(){
  if(!featured)return;
  try{const r=await fetch(featured.src,{method:'HEAD'});featuredOk=r.ok;}catch{featuredOk=false;}
  buildSeq();
}
function vol(){const t=seq[bgI%seq.length]||{gain:1};bg.volume=Math.max(0,Math.min(1,base*(t.gain||1)*duck*fade));}
function load(i){if(!seq.length)return;bgI=((i%seq.length)+seq.length)%seq.length;bg.src=seq[bgI].src;bgLoaded=bgI;fade=0;$('#yt-music').textContent=`${X[lang].playing} ${seq[bgI].title}`;}
bg.addEventListener('timeupdate',()=>{const left=bg.duration-bg.currentTime;fade=Math.max(0,Math.min(1,bg.currentTime/1.5,Number.isFinite(left)?left/2:1));vol();});
bg.addEventListener('ended',()=>{load(bgI+1);vol();bg.play().catch(()=>{});});
bg.addEventListener('error',()=>{if(bgLoaded<0)return;if(seq[bgI]===featured){featuredOk=false;const next=general.indexOf(seq[bgI+1]);buildSeq();load(Math.max(0,next));}else load(bgI+1);bg.play().catch(()=>{});});
function musicPlay(){wanted=true;if(bgLoaded<0)load(0);vol();return bg.play();}
function duckFor(sec){duck=.6;vol();clearTimeout(duckTimer);duckTimer=setTimeout(()=>{duck=1;duckTimer=0;vol();},Math.max(.5,sec)*1000);}
setInterval(()=>{   // vigilante: reanuda si se pausó y salta si se trabó
  if(!wanted||!seq.length)return;
  if(bg.ended){load(bgI+1);bg.play().catch(()=>{});stuck=0;return;}
  if(bg.paused){bg.play().catch(()=>{});return;}
  if(Math.abs(bg.currentTime-lastT)<.05){if(++stuck>=8){load(bgI+1);bg.play().catch(()=>{});stuck=0;}}else stuck=0;
  lastT=bg.currentTime;vol();
},1000);

/* ---------- Lista de los buenos (voz + polvo de estrellas en el cielo ancho) ---------- */
const recent=[];
const namer=window.ALDEA_LIVE_NAMES?.create({canvas:$('#yt-sky'),onSpeak:duckFor,
  layout:V?null:{scale:1.4,x:204,y:-40,headerY:110,nameY:300,size:170,maxWidth:1000},
  onName:name=>{if(recent[0]===name)return;recent.unshift(name);recent.splice(5);renderRecent();refreshTicker();}});
namer?.setLang(lang);
function renderRecent(){$('#yt-recent').innerHTML=recent.map(n=>`<li>${esc(n)}</li>`).join('');}

/* ---------- Videos de Santa sincronizados con la hora (todos ven lo mismo) ---------- */
const items=((V?all.playlist:cfg.playlist)||[]).filter(i=>i.src&&i.duration>0).map(i=>({...i,repeat:Math.max(1,i.repeat||1),span:i.duration*Math.max(1,i.repeat||1)}));
let mode='lista',current=-1;
const titleOf=it=>it['title_'+lang]||it.title;
function syncLista(){
  if(mode!=='lista'||!items.length)return;
  const pos=channelAt(items);
  if(pos.index!==current){
    current=pos.index;video.loop=true;video.muted=true;video.src=pos.item.src;
    video.addEventListener('loadedmetadata',()=>{video.currentTime=channelAt(items).offset;video.play().catch(()=>{});},{once:true});
    $('#yt-title').textContent=titleOf(pos.item);
  }else if(video.readyState>=2&&Math.abs(video.currentTime-pos.offset)>1.5&&pos.offset>.5&&pos.offset<pos.item.duration-.5)video.currentTime=pos.offset;
  if(video.paused&&video.readyState>=2)video.play().catch(()=>{});
}

/* ---------- Episodio 1: Santa habla, subtítulos palabra por palabra ---------- */
const ep=cfg.episodio1||{videos:[]};
const epVideos=(ep.videos||[]).filter(v=>v.src);
let epI=0,lines=[];
function makeLines(words){
  const out=[];let cur=[];
  for(let i=0;i<words.length;i++){
    const [a,b,w]=words[i],gap=i?a-words[i-1][1]:0;
    if(cur.length&&(cur.length>=8||gap>.8)){out.push(cur);cur=[];}
    cur.push({a,b,w});
    if(/[.!?¡¿…]$/.test(w)&&cur.length>=3){out.push(cur);cur=[];}
  }
  if(cur.length)out.push(cur);
  return out.map(ws=>({a:ws[0].a,b:ws[ws.length-1].b,ws}));
}
function playEpisode(i){
  epI=i;const it=epVideos[i];
  if(!it){startLista();return;}
  lines=makeLines(it.palabras||[]);
  video.loop=false;video.muted=false;video.volume=1;video.src=it.src;bgVideo.src=it.src;
  video.play().catch(()=>{video.muted=true;video.play().catch(()=>{});});bgVideo.play().catch(()=>{});
  $('#yt-ep-title').textContent=ep['titulo_'+lang]||ep.titulo||'';
  $('#yt-title').textContent=it.titulo||'';
}
video.addEventListener('loadedmetadata',()=>{stage.classList.toggle('vertical-src',!V&&mode==='episodio1'&&video.videoWidth<video.videoHeight);});
video.addEventListener('ended',()=>{if(mode==='episodio1')playEpisode(epI+1);});
function captions(){
  const box=$('#yt-captions');
  if(mode!=='episodio1'||!lines.length){box.hidden=true;return;}
  const t=video.currentTime,line=lines.find(l=>t>=l.a-.25&&t<=l.b+.7);
  if(!line){box.hidden=true;return;}
  box.hidden=false;
  const html=line.ws.map(w=>`<span class="${t>=w.a?(t<w.b+.05?'on now':'on'):''}">${esc(w.w)}</span>`).join(' ');
  if(box.innerHTML!==html)box.innerHTML=html;
  if(!bgVideo.paused&&Math.abs(bgVideo.currentTime-t)>.3)bgVideo.currentTime=t;
}
(function capLoop(){captions();requestAnimationFrame(capLoop);})();

/* ---------- Modos ---------- */
let soundOn=false;
function startLista(){
  mode='lista';current=-1;stage.classList.remove('episode','vertical-src');bgVideo.pause();bgVideo.removeAttribute('src');
  $('#yt-ep').hidden=true;base=.5;vol();
  namer?.start();namer?.setSound(soundOn);syncLista();renderMode();
}
function startEpisode(){
  if(!epVideos.length){$('#yt-note').textContent=X[lang].noEp;startLista();return;}
  mode='episodio1';stage.classList.add('episode');$('#yt-ep').hidden=false;
  namer?.stop();base=.14;vol();   // la música queda suave debajo de la voz de Santa
  playEpisode(0);renderMode();
}
function renderMode(){
  for(const b of $$('[data-modo]'))b.setAttribute('aria-pressed',String(b.dataset.modo===mode));
  for(const b of $$('[data-lang]'))b.setAttribute('aria-pressed',String(b.dataset.lang===lang));
}

/* ---------- Textos, contador y reloj ---------- */
function texts(){
  const T=STR[lang],x=X[lang];
  document.documentElement.lang=lang==='pt'?'pt-BR':lang;
  $('#yt-live').textContent=T.live;$('#yt-tag').textContent=T.live;$('#yt-from').textContent=x.from;
  $('#yt-lh').textContent=x.h;$('#yt-lm').textContent=x.m;$('#yt-ls').textContent=x.s;
  $('#yt-hora-label').textContent=x.hora;$('#yt-recent-label').textContent=x.recent;
  $('#yt-kicker').textContent=T.kickerLista;$('#yt-ep-kicker').textContent=x.ep;$('#yt-start').textContent=x.start;
  if(mode==='lista'&&items.length)$('#yt-title').textContent=titleOf(channelAt(items).item);
  if(mode==='episodio1')$('#yt-ep-title').textContent=ep['titulo_'+lang]||ep.titulo||'';
  if(bgLoaded>=0)$('#yt-music').textContent=`${x.playing} ${seq[bgI].title}`;
  refreshTicker(true);tick();
}
function tick(){
  const T=STR[lang],d=countdown(),now=new Date();
  $('#yt-faltan').textContent=d.xmas?'':T.faltan;
  $('#yt-days').textContent=d.xmas?T.xmas:T.days(d.days);
  $('#yt-h').textContent=p2(d.h);$('#yt-m').textContent=p2(d.m);$('#yt-s').textContent=p2(d.s);
  $('#yt-clock').textContent=`${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}`;
  const date=now.toLocaleDateString(T.loc,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  $('#yt-date').textContent=date.charAt(0).toLocaleUpperCase(T.loc)+date.slice(1);
  $('#yt-read').textContent='✨ '+T.namesRead(fmtN(window.ALDEA_LIVE_NAMES?.namesToday?.()||0,T.loc));
}
const move=$('#yt-move');let pending=null;
function tickerText(){const T=STR[lang],d=countdown(),list=T.ticker(d.xmas?-1:d.days);if(recent.length)list.splice(1,0,`${T.recent} ${recent.join(' · ')}`);return list.join('     ✦     ');}
function applyTicker(t){move.innerHTML=`<span>${esc(t)}</span><span>${esc(t)}</span>`;move.style.animationDuration=Math.max(36,Math.round(t.length*.24))+'s';}
move.addEventListener('animationiteration',()=>{if(pending){applyTicker(pending);pending=null;}});
function refreshTicker(force){const t=tickerText();if(force||!move.childElementCount)applyTicker(t);else pending=t;}

/* ---------- Controles ---------- */
const controls=$('#yt-controls');let hideT=0;
function showControls(){controls.classList.remove('hide');clearTimeout(hideT);if(soundOn)hideT=setTimeout(()=>controls.classList.add('hide'),3000);}
addEventListener('mousemove',showControls);addEventListener('touchstart',showControls,{passive:true});
function enableSound(){
  soundOn=true;
  musicPlay().then(()=>{$('#yt-start').hidden=true;$('#yt-note').textContent='';showControls();}).catch(()=>{$('#yt-start').hidden=false;$('#yt-note').textContent=X[lang].blocked;});
  if(mode==='lista')namer?.setSound(true);
  if(mode==='episodio1'){video.muted=false;video.play().catch(()=>{});}
}
$('#yt-start').addEventListener('click',enableSound);
for(const b of $$('[data-lang]'))b.addEventListener('click',()=>{lang=b.dataset.lang;namer?.setLang(lang);texts();renderMode();});
for(const b of $$('[data-modo]'))b.addEventListener('click',()=>{if(b.dataset.modo==='episodio1')startEpisode();else startLista();});
$('#yt-full').addEventListener('click',()=>{const el=document.documentElement;(el.requestFullscreen||el.webkitRequestFullscreen)?.call(el);});
addEventListener('keydown',e=>{if(e.key==='f')$('#yt-full').click();if(e.key==='e')startEpisode();if(e.key==='l')startLista();});

/* ---------- Arranque ---------- */
setInterval(()=>{tick();syncLista();},1000);
setInterval(()=>refreshTicker(),60000);
texts();
checkFeatured().then(()=>{
  if(params.get('modo')==='episodio1')startEpisode();else startLista();
  enableSound();   // en OBS suena solo; en el navegador, si lo bloquea, aparece el botón
});
})();
