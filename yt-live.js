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
  es:{noche:'Nochebuena · Santa visita a',nocheTk:'🛷 ¡Santa ya salió del Polo Norte y está repartiendo regalos por el mundo!',from:'EN VIVO DESDE EL POLO NORTE',hora:'Hora en la aldea',h:'horas',m:'min',s:'seg',recent:'Santa acaba de nombrar',playing:'♪ Suena:',ep:'Estreno',noEp:'Ese episodio todavía no está listo. Mientras tanto se transmite la lista de los buenos.',all:'Todos los episodios',start:'▶ Iniciar transmisión con sonido',blocked:'El navegador pide un clic para activar el sonido. En OBS suena solo.'},
  en:{noche:'Christmas Eve · Santa visits',nocheTk:'🛷 Santa has left the North Pole and is delivering gifts around the world!',from:'LIVE FROM THE NORTH POLE',hora:'Village time',h:'hours',m:'min',s:'sec',recent:'Santa just named',playing:'♪ Now playing:',ep:'Premiere',noEp:'That episode is not ready yet. Meanwhile, the nice list is streaming.',all:'All episodes',start:'▶ Start stream with sound',blocked:'The browser needs a click to turn the sound on. In OBS it plays by itself.'},
  pt:{noche:'Noite de Natal · Papai Noel visita',nocheTk:'🛷 O Papai Noel já saiu do Polo Norte e está entregando presentes pelo mundo!',from:'AO VIVO DO POLO NORTE',hora:'Hora na vila',h:'horas',m:'min',s:'seg',recent:'O Papai Noel acabou de dizer',playing:'♪ Tocando:',ep:'Estreia',noEp:'Esse episódio ainda não está pronto. Enquanto isso, a lista dos bonzinhos está no ar.',all:'Todos os episódios',start:'▶ Iniciar transmissão com som',blocked:'O navegador pede um clique para ativar o som. No OBS toca sozinho.'}
};
let lang=STR[params.get('lang')]?params.get('lang'):'es';
if(params.get('obs')==='1')document.body.classList.add('obs');
const EMBED=params.get('embed')==='1';if(EMBED)document.body.classList.add('embed');   // dentro de la web: los botones están fuera

/* ---------- Escenario a escala de la ventana ---------- */
/* Sin OBS y fuera de la web, los controles van en una barra debajo de la pantalla de transmisión. */
const bar=()=>document.body.classList.contains('obs')||EMBED?0:($('#yt-controls')?.offsetHeight||0);
function fit(){const h=innerHeight-bar();stage.style.setProperty('--s',Math.min(innerWidth/W,h/H));stage.style.top=(h/2)+'px';}
addEventListener('resize',fit);fit();
if(window.ResizeObserver)new ResizeObserver(fit).observe($('#yt-controls'));

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
const mk=list=>(list||[]).filter(i=>i.src&&i.duration>0).map(i=>({...i,src:V&&i.srcV?i.srcV:i.src,repeat:1,span:i.duration}));
/* Orden aleatorio pero igual para todos (semilla fija): varias vueltas barajadas, sin repetir el mismo video seguido. */
const mix=(list,seed,rounds=6)=>{if(list.length<3)return list;let x=seed>>>0;const r=()=>(x=(x*1664525+1013904223)>>>0)/4294967296,out=[];
  for(let k=0;k<rounds;k++){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    if(out.length&&out.at(-1).src===a[0].src)a.push(a.shift());out.push(...a);}
  return out;};
const LAP=mix(mk(all.laponia),20261128),NB=mix(mk(all.nochebuena?.videos),20261224);
let mode='lista',current=-1;
const titleOf=it=>it['title_'+lang]||it.title;
/* Dos videos: mientras uno se ve, el siguiente ya se carga, y el cambio cae justo al empezar cada nombre. */
const video2=$('#yt-video2');let act=video,idle=video2;
function showVid(el){video.classList.toggle('off',el!==video);video2.classList.toggle('off',el!==video2);}
function syncLista(){
  const list=mode==='musica'?LAP:mode==='nochebuena'?NB:items;   // en el quiz, Santa sigue de fondo
  if(!['lista','quiz','musica','nochebuena'].includes(mode)||!list.length)return;
  const pos=channelAt(list);
  if(pos.index!==current){
    current=pos.index;
    const ready=idle.dataset.src===pos.item.src&&idle.readyState>=2,el=ready?idle:act;
    if(!ready){el.src=pos.item.src;el.dataset.src=pos.item.src;}
    el.loop=pos.item.repeat>1;el.muted=true;
    const go=()=>{el.currentTime=channelAt(list).offset;el.play().catch(()=>{});};
    if(el.readyState>=1)go();else el.addEventListener('loadedmetadata',go,{once:true});
    if(el!==act){idle=act;act=el;}
    showVid(act);idle.pause();
    $('#yt-title').textContent=titleOf(pos.item);
  }else if(act.readyState>=2&&Math.abs(act.currentTime-pos.offset)>.3&&pos.offset>.3&&pos.offset<pos.item.duration-.3)act.currentTime=pos.offset;
  if(pos.left<3){const nx=list[(pos.index+1)%list.length];if(nx.src!==act.dataset.src&&idle.dataset.src!==nx.src){idle.src=nx.src;idle.dataset.src=nx.src;idle.muted=true;idle.load();}}
  if(act.paused&&act.readyState>=2&&!act.ended)act.play().catch(()=>{});
}

/* ---------- Episodio 1: Santa habla, subtítulos palabra por palabra ---------- */
/* Episodios: horizontal.episodio1, episodio2… · ?modo=episodio3 o ?modo=episodios (todos seguidos y luego la lista). */
const EPS=Object.keys(cfg).filter(k=>/^episodio\d+$/.test(k)&&(cfg[k].videos||[]).some(v=>v.src)).sort((a,b)=>parseInt(a.slice(8))-parseInt(b.slice(8)));
let ep={videos:[]},epVideos=[],epQueue=[],epI=0,lines=[];
const isEp=()=>mode==='episodio';
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
  if(!it){if(epQueue.length){loadEpisode(epQueue.shift());return;}startLista();return;}
  lines=makeLines(it.palabras||[]);
  video.loop=false;video.muted=false;video.volume=1;video.src=it.src;bgVideo.src=it.src;
  video.play().catch(()=>{video.muted=true;video.play().catch(()=>{});});bgVideo.play().catch(()=>{});
  $('#yt-ep-title').textContent=ep['titulo_'+lang]||ep.titulo||'';
  $('#yt-title').textContent=it.titulo||'';
  const next=epVideos[i+1];if(next)fetch(next.src).catch(()=>{});   // precarga la parte siguiente
}
video.addEventListener('loadedmetadata',()=>{stage.classList.toggle('vertical-src',!V&&isEp()&&video.videoWidth<video.videoHeight);});
video.addEventListener('ended',()=>{if(isEp())playEpisode(epI+1);});
function captions(){
  const box=$('#yt-captions');
  if(!isEp()||!lines.length){box.hidden=true;return;}
  const t=video.currentTime,line=lines.find(l=>t>=l.a-.25&&t<=l.b+.7);
  if(!line){box.hidden=true;return;}
  box.hidden=false;
  const html=line.ws.map(w=>`<span class="${t>=w.a?(t<w.b+.05?'on now':'on'):''}">${esc(w.w)}</span>`).join(' ');
  if(box.innerHTML!==html)box.innerHTML=html;
  if(!bgVideo.paused&&Math.abs(bgVideo.currentTime-t)>.3)bgVideo.currentTime=t;
}
(function capLoop(){captions();requestAnimationFrame(capLoop);})();

/* ---------- Quiz, cuentos y solo música ---------- */
const QUIZ=window.SANTA_QUIZ||[],STORIES=window.SANTA_STORIES||[],CARDS=window.SANTA_CHRISTMAS_CARDS||[];
const AUDIO_STORIES=(all.cuentosAudio||[]).filter(c=>c.src);
const show=$('#yt-show');let showTimer=0,showAudio=null,actx=null;
const SCENES={village:'aldea-luces.webp',cabin:'cabana-cuentos.webp',reindeer:'renos-establo.webp',correo:'santa-correo.webp',mirador:'santa-mirador.webp',bosque:'santa-bosque.webp'};
const CAT={renos:'Renos',duendes:'Duendes',ciudades:'Ciudades',tradiciones:'Tradiciones',matematico:'Matemática',verbal:'Palabras',biblia:'Biblia',ciencias:'Ciencias',geografia:'Geografía',historia:'Historia',vida:'Vida diaria',cultura:'Cultura'};
const Y={es:{quiz:'Quiz navideño',chat:'¡Escribe A, B o C en el chat!',ok:'¡Respuesta correcta!',story:'Cuento de la aldea',page:(a,b)=>`Página ${a} de ${b}`,music:'Música de la aldea',listen:'🔊 Escucha el cuento'},
         en:{quiz:'Christmas quiz',chat:'Write A, B or C in the chat!',ok:'Correct answer!',story:'Village story',page:(a,b)=>`Page ${a} of ${b}`,music:'Village music',listen:'🔊 Listen to the story'},
         pt:{quiz:'Quiz de Natal',chat:'Escreva A, B ou C no chat!',ok:'Resposta certa!',story:'Conto da vila',page:(a,b)=>`Página ${a} de ${b}`,music:'Música da vila',listen:'🔊 Ouça o conto'}};
const rng=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const quizOrder=(()=>{const r=rng(20261127),a=QUIZ.map((_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;})();
function chime(){if(!soundOn)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const t=actx.currentTime;[1047,1319,1568].forEach((f,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=f;g.gain.setValueAtTime(.0001,t+i*.1);g.gain.exponentialRampToValueAtTime(.18,t+i*.1+.02);g.gain.exponentialRampToValueAtTime(.0001,t+i*.1+.8);o.connect(g).connect(actx.destination);o.start(t+i*.1);o.stop(t+i*.1+.9);});}catch{}}
/* Quiz: una pregunta cada 20 s (14 s para responder y 6 s para ver la respuesta), igual para todos. */
/* Narrador del quiz: voz del navegador (la mejor en español que haya: en Edge, «Jorge»/«Dalia» naturales).
   Dentro de la web, quien habla es la página (tiene el permiso del clic); aquí solo se le pide. */
let narr=params.get('narrador')!=='0';
function bestVoice(){
  const vs=(window.speechSynthesis?.getVoices?.()||[]).filter(v=>/^es([-_]|$)/i.test(v.lang));
  const score=v=>(/natural|online|neural/i.test(v.name)?6:0)+(/google/i.test(v.name)?3:0)+(/mx|us|419/i.test(v.lang)?2:/es[-_]es/i.test(v.lang)?1:0)+(/jorge|pablo|alvaro|álvaro|raul|raúl|diego|gerardo|male|hombre/i.test(v.name)?1:0);
  return vs.sort((a,b)=>score(b)-score(a))[0]||null;
}
function say(text,pitch=.95){
  if(!soundOn||!narr||!text)return;
  duckFor(Math.min(16,text.split(/\s+/).length*.42+1));
  if(EMBED&&parent!==window){parent.postMessage({yt:'speak',text,pitch},'*');return;}
  const s=window.speechSynthesis;if(!s)return;
  s.cancel();const u=new SpeechSynthesisUtterance(text),v=bestVoice();if(v)u.voice=v;u.lang=v?.lang||'es-MX';u.rate=1;u.pitch=pitch;s.speak(u);
}
function hush(){try{window.speechSynthesis?.cancel();}catch{}if(EMBED&&parent!==window)parent.postMessage({yt:'speak-stop'},'*');}
window.speechSynthesis?.getVoices?.();
/* Partidas: 60 s de presentador y luego 10 preguntas. Cada pregunta dura lo que necesita:
   lectura (según sus palabras) + 8 s para responder + respuesta y explicación (según sus palabras).
   El calendario es igual en todas las pantallas: todos ven la misma pregunta en el mismo segundo. */
const HOSTS=window.SANTA_QUIZ_HOST||null,PER=10,HOST=HOSTS?.duracion||60000,THINK=8000;
const wc=x=>String(x||'').split(/\s+/).filter(Boolean).length;
const READ=q=>Math.max(5,(wc(q.question)+wc([q.answer,...q.wrong].join(' '))+6)*.42+2.5)*1000;
const ANS=q=>Math.max(7,(wc(q.answer)+wc(q.explanation)+7)*.42+4)*1000;
const SCHED=(()=>{const rounds=[];let t=0;const n=Math.floor(QUIZ.length/PER);
  for(let r=0;r<n;r++){const st=t;t+=HOST;const qs=[];
    for(let i=0;i<PER;i++){const q=QUIZ[quizOrder[r*PER+i]],sh=READ(q)+THINK,d=sh+ANS(q);qs.push({s:t,show:sh,d});t+=d;}
    rounds.push({s:st,qs});}
  return {rounds,total:t};})();
function quizPos(now){
  const R=SCHED.rounds,c=Math.floor(now/SCHED.total),p=now%SCHED.total;let lo=0,hi=R.length-1;
  while(lo<hi){const m=(lo+hi+1)>>1;if(R[m].s<=p)lo=m;else hi=m-1;}
  const r=R[lo],round=c*R.length+lo,startAbs=c*SCHED.total+r.s,prevAbs=lo>0?c*SCHED.total+R[lo-1].s:(c-1)*SCHED.total+R[R.length-1].s;
  if(p-r.s<HOST)return {host:true,round,pos:p-r.s,startAbs,prevAbs};
  let qn=r.qs.findIndex(x=>p>=x.s&&p<x.s+x.d);if(qn<0)qn=PER-1;const x=r.qs[qn];
  return {host:false,round,qn,t:p-x.s,show:x.show,k:lo*PER+qn};
}
let quizIdx=-1,quizQ=null,quizOpts=[],hostKey='',hostSaid=-1;
function partidaDelDia(now,round){const d=new Date(now),m=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();return round-quizPos(m).round+1;}
let champs=[],champSeen=new Set(),champPending=[],scoreWatch=false;
let champT=null;
function scoreRow(r,old){if(!r||champSeen.has(r.id))return;champSeen.add(r.id);champs.unshift(r);champs.length=Math.min(champs.length,8);if(old)return;
  champPending.push(r);clearTimeout(champT);champT=setTimeout(()=>{const list=champPending.splice(0);if(!list.length)return;
    popShow({cls:'champ',title:'🏆 Campeones de la partida',html:`<div class="ys-pop-champs">${list.map(x=>`<span>${esc(x.nombre)} <b>${x.puntaje}/10</b>${x.lugar?` <small>📍 ${esc(x.lugar)}</small>`:''}</span>`).join('')}</div>`,speech:champText(list,8)});},1500);}
/* Avisos al aire (campeones, frases y preguntas de /admin): uno tras otro, se ven y se leen en voz alta */
let popQ=[],popBusy=false,msgWatch=false;
const speakMs=t=>HOSTS?.dur?HOSTS.dur(t):Math.round((String(t).split(/\s+/).length*.43+2.2)*1000);
function popShow(it){popQ.push(it);if(!popBusy)popNext();}
function popNext(){const it=popQ.shift();if(!it){popBusy=false;return;}popBusy=true;
  const el=document.createElement('div');el.className='ys-pop ys-pop-'+it.cls;
  el.innerHTML=`<div class="ys-pop-card"><span class="ys-chip">${esc(it.title)}</span>${it.html}${it.foot?`<p class="ys-pop-foot">${esc(it.foot)}</p>`:''}</div>`;
  stage.append(el);say(it.speech);const ms=Math.max(9000,speakMs(it.speech)+(it.extra||3000));
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>{el.remove();popNext();},600);},ms);}
function msgRow(r){const preg=r.tipo==='pregunta',t=String(r.texto||'').trim();if(!t)return;
  popShow(preg?{cls:'preg',title:'❓ Pregunta para el público',html:`<p class="ys-pop-text">${esc(t)}</p>`,foot:'¡Respondan en los comentarios!',speech:`Pregunta para el público: ${t} ¡Respondan en los comentarios!`,extra:12000}
    :{cls:'frase',title:'💬 Mensaje de la aldea',html:`<p class="ys-pop-text">${esc(t)}</p>`,speech:t});}
function startMsgWatch(){if(!msgWatch&&window.ALDEA_DB?.configured&&window.ALDEA_DB.watchMessages){msgWatch=true;window.ALDEA_DB.watchMessages(msgRow).catch(()=>{msgWatch=false;});}}
function startScoreWatch(){if(!scoreWatch&&window.ALDEA_DB?.configured&&window.ALDEA_DB.watchScores){scoreWatch=true;window.ALDEA_DB.watchScores(scoreRow).catch(()=>{scoreWatch=false;});}}
function champText(list,max=6){const t=list.slice(0,max).map(r=>`${r.nombre}${r.lugar?`, desde ${r.lugar},`:''} con ${r.puntaje} de 10`);
  const mas=list.length-t.length,y=mas?`; y a ${mas===1?'1 campeón más':mas+' campeones más'}: ¡miren sus nombres en pantalla!`:'.';
  return `¡Campeones de la partida! Felicidades a ${mas||t.length<2?t.join('; a '):t.slice(0,-1).join('; a ')+' y a '+t.at(-1)}${y} ¡Los estamos escuchando y Santa está muy orgulloso!`;}
function startElfWatch(){if(!elfWatch&&window.ALDEA_DB?.configured&&window.ALDEA_DB.watchElf){elfWatch=true;window.ALDEA_DB.watchElf(elfRow).catch(()=>{elfWatch=false;});}}
function renderBand(){
  let band=$('#yt-names');
  if(!band){band=document.createElement('div');band.id='yt-names';band.className='ys-names';
    band.innerHTML=`<b></b><div class="ys-names-track"></div><div class="ys-archive"><span class="ys-archive-ico">📖</span><span><strong>Archivo mágico de Santa</strong><em></em></span></div>`;stage.append(band);}
  band.hidden=mode!=='quiz';if(band.hidden)return;
  band.querySelector('.ys-archive em').textContent=`${archived} ${archived===1?'carta guardada':'cartas guardadas'}`;
  const lab=band.querySelector('b'),track=band.querySelector('.ys-names-track');
  // Los nombres enviados desde /admin pasan UNA sola vez; después vuelve el pedido de regalitos.
  if(bandPass){if(bandKey!=='pass')bandKey='pass';return;}
  if(bandQ.length&&!letterBusy){const list=bandQ.splice(0);bandPass=true;bandKey='pass';lab.textContent='📜 ¡Ya están en la Lista de los buenos!';
    const items=list.map(r=>`<span class="new">✨ ${esc(r.nombre)}${r.lugar?` <small>(${esc(r.lugar)})</small>`:''}</span>`).join('<i>✦</i>');
    track.innerHTML=`<div class="ys-names-move once">${items}</div>`;const mv=track.querySelector('.ys-names-move');
    const dist=mv.scrollWidth+track.clientWidth;mv.style.setProperty('--from',track.clientWidth+'px');mv.style.animationDuration=Math.max(8,dist/170)+'s';
    mv.addEventListener('animationend',()=>{bandPass=false;bandKey='';renderBand();},{once:true});return;}
  const ph=BAND_EMPTY[Math.floor(Date.now()/9000)%BAND_EMPTY.length],k='empty'+ph;if(bandKey===k)return;bandKey=k;
  lab.textContent='🎁 Lista de los buenos';track.innerHTML=`<p class="ys-names-empty">${esc(ph)}</p>`;
}
function quizTick(){
  if(!QUIZ.length||!SCHED.rounds.length)return;
  startElfWatch();startScoreWatch();renderBand();
  const now=Date.now(),P=quizPos(now),L=Y[lang],num=partidaDelDia(now,P.round);
  if(P.host&&HOSTS){
    const conHora=Math.floor(P.startAbs/3600000)!==Math.floor(P.prevAbs/3600000),plan=HOSTS.build(P.round,num,conHora),key='h'+P.round,pos=P.pos;
    if(hostKey!==key){
      hostKey=key;quizIdx=-1;hostSaid=-1;
      show.innerHTML=`<div class="ys-quiz ys-host"><span class="ys-chip">🎅 Sabelín · ${esc(L.quiz)} · Partida ${num}</span><p class="ys-kind"></p><p class="ys-line"></p><div class="ys-score">🏆 ¿Cuántas acertaste? Escríbelo en los comentarios: <b>__ / 10</b></div><div class="ys-champs" hidden></div><p class="ys-chat ys-start"></p></div>`;
    }
    let idx=-1;for(let i=0;i<plan.length;i++)if(pos>=plan[i].t)idx=i;
    const line=show.querySelector('.ys-line');
    if(line&&idx>=0&&line.dataset.i!==String(idx)){
      const it=plan[idx],slot=(plan[idx+1]?.t??HOST)-it.t,champNow=false&&slot,text=champNow?champText(champPending.splice(0),Math.max(1,Math.floor((slot/1000-7)/4.5))):typeof it.texto==='function'?it.texto():it.texto;
      line.dataset.i=idx;line.textContent=text;show.querySelector('.ys-kind').textContent=champNow?'🏆 Campeones de la partida':HOSTS.tipos[it.tipo]||'';
      line.classList.remove('in');void line.offsetWidth;line.classList.add('in');
      if(pos-it.t<1500&&hostSaid!==idx){hostSaid=idx;say(text);}
    }
    const ch=show.querySelector('.ys-champs'),sc=show.querySelector('.ys-score');
    if(ch){const recent=champs.filter(r=>Date.now()-new Date(r.creado).getTime()<15*60000),k=recent.map(r=>r.id).join(',');
      if(ch.dataset.k!==k){ch.dataset.k=k;ch.hidden=!recent.length;sc.hidden=!!recent.length;ch.innerHTML=`<strong>🏆 Campeones de la partida</strong>${recent.map(r=>`<span>${esc(r.nombre)} <b>${r.puntaje}/10</b>${r.lugar?` <small>${esc(r.lugar)}</small>`:''}</span>`).join('')}`;}}
    const left=Math.ceil((HOST-pos)/1000),st=show.querySelector('.ys-start');
    if(st)st.textContent=`⏱ La partida ${num} empieza en ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;
    return;
  }
  if(P.host)return;
  const {qn,t,show:QSHOW}=P,k=P.round*PER+qn;
  if(k!==quizIdx){
    quizIdx=k;hostKey='';const q=QUIZ[quizOrder[P.k]],r=rng(P.k*7919+13);
    const opts=[q.answer,...q.wrong].map(o=>[r(),o]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);quizQ=q;quizOpts=opts;
    if(t<4000)say(`Pregunta ${qn+1}. ${q.question} ${opts.map((o,i)=>`${'ABCD'[i]}: ${o}.`).join(' ')}`);
    show.innerHTML=`<div class="ys-quiz"><span class="ys-chip">🎯 Partida ${num} · Pregunta ${qn+1} de ${PER} · ${esc(CAT[q.category]||q.category)}</span><h2>${esc(q.question)}</h2><ol class="ys-opts">${opts.map((o,i)=>`<li data-ok="${o===q.answer}"><b>${'ABCD'[i]}</b><span>${esc(o)}</span></li>`).join('')}</ol><div class="ys-timer"><i></i><span></span></div><p class="ys-expl"><strong>${esc(L.ok)}</strong> ${esc(q.explanation||'')}</p><p class="ys-chat">${esc(L.chat)}</p></div>`;
  }
  const box=show.firstElementChild;if(!box||box.classList.contains('ys-host'))return;
  let ban=box.querySelector('.ys-banner');const showBan=now%300000<15000;
  if(showBan&&!ban){ban=document.createElement('p');ban.className='ys-banner';ban.textContent='📝 ¿Enviamos la actualización de los nombres a Santa? 🎁 Apóyame con tu regalito y forma parte de la Lista de los buenos';box.prepend(ban);}
  else if(!showBan&&ban)ban.remove();
  box.querySelector('.ys-timer span').textContent=t<QSHOW?Math.ceil((QSHOW-t)/1000):'✓';
  box.querySelector('.ys-timer i').style.width=Math.max(0,(QSHOW-t)/QSHOW*100)+'%';
  if(t>=QSHOW&&!box.classList.contains('reveal')){box.classList.add('reveal');chime();
    if(quizQ&&t<QSHOW+2500){const i=quizOpts.indexOf(quizQ.answer);setTimeout(()=>say(`¡La respuesta correcta es la ${'ABCD'[i]}: ${quizQ.answer}! ${quizQ.explanation||''}`),600);}}
}
/* Solo música: las 25 tarjetas pasan cada 12 s con movimiento suave, igual para todos. */
let slideIdx=-1;
function musicTick(){
  if(!CARDS.length)return;
  const k=Math.floor(Date.now()/12000);
  if(k!==slideIdx){
    slideIdx=k;const c=CARDS[k%CARDS.length],el=document.createElement('div');el.className='ys-slide';
    el.innerHTML=`<div class="ys-bg" style="background-image:url('${esc(c.image)}')"></div><img class="ys-card" src="${esc(c.image)}" alt=""><div class="ys-text"><small>🎵 ${esc(Y[lang].music)}</small><h2>${esc(c.title)}</h2><p>${esc(c.phrase)}</p><span class="ys-song"></span></div>`;
    show.append(el);requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('on')));
    const old=[...show.children].slice(0,-1);setTimeout(()=>old.forEach(o=>o.remove()),1700);
  }
  const s=show.lastElementChild?.querySelector('.ys-song'),txt=bgLoaded>=0&&seq[bgI]?`${X[lang].playing} ${seq[bgI].title}`:'';
  if(s&&s.textContent!==txt)s.textContent=txt;
}
/* Cuentos: página por página al ritmo de lectura (o con su audio, si es un cuento en audio). */
let storyQueue=[];
function storyPagesFor(s,name,g){
  const who=name||'Nico',boy=g!=='girl',ch=s.id%2,nino=boy?'un niño':'una niña';
  return [`Aquella tarde, ${who}, ${nino} de siete años, miró el cielo desde su casa. Una chispa dorada cruzó la ventana y dejó una invitación: «Te esperamos en La aldea de Santa». En un abrir y cerrar de ojos, un sendero nevado apareció entre faroles y tejados iluminados.`,
    `${s.discovery} Santa saludó a ${who} con una sonrisa y le invitó a observar con atención. En aquella aldea, las mejores aventuras empezaban con una pregunta.`,
    `${s.problem} ${who} pensó un momento. Había dos caminos posibles: «${s.choices[0]}» o «${s.choices[1]}». ¿Qué elegirías tú? ¡Escríbelo en el chat!`,
    `${who} eligió: «${s.choices[ch]}». ${s.outcomes[ch]} Santa acompañó la decisión, dejando espacio para que todos aportaran una idea.`,
    `${s.ending} ${who} comprendió que no hacía falta una varita para hacer algo bueno. A veces una decisión pequeña podía cambiar una tarde entera.`,
    `Antes de regresar a casa, Santa abrió su bolsito rojo. Una pizca de polvo de estrellas escribió «${who}» en el cielo. «Lleva esta historia contigo —dijo— y mañana busca una nueva ocasión para ayudar».`];
}
function storyCard(img,title,kicker,text){
  show.innerHTML=`<div class="ys-story"><div class="ys-bg" style="background-image:url('${esc(img)}')"></div><img class="ys-card" src="${esc(img)}" alt=""><div class="ys-text"><small>📖 ${esc(kicker)}</small><h2>${esc(title)}</h2><p class="ys-page">${text}</p></div></div>`;
}
/* Cuento en audio: a un lado el avatar narrador (habla cuando suena la voz y queda quieto en las pausas)
   o, si el cuento tiene «imagenes», una película de imágenes con movimiento y transiciones; al otro lado el texto palabra por palabra. */
const AV=all.cuentoAvatar||null;
function audioStory(a){
  const words=a.palabras||[],lines=words.length?makeLines(words):[],imgs=(a.imagenes||[]).filter(x=>x[1]);
  const speech=[];for(const w of words){const l=speech.at(-1);if(l&&w[0]-l[1]<.8)l[1]=Math.max(l[1],w[1]);else speech.push([w[0],w[1]]);}
  const av=AV?.hablando?.length?`<div class="ys-av${imgs.length?' mini':''}"><video class="ys-av-idle" src="${esc(AV.quieto||AV.hablando[0])}" muted loop playsinline autoplay></video>${AV.hablando.map((v,i)=>`<video class="ys-av-talk" data-i="${i}" src="${esc(v)}" muted loop playsinline preload="auto"></video>`).join('')}</div>`:'';
  const left=imgs.length?`<div class="ys-film"><img class="ys-film-a" alt=""><img class="ys-film-b" alt=""><div class="ys-film-glow"></div><div class="ys-film-dust"></div>${av}</div>`
    :av?`<div class="ys-av-frame">${av}</div>`:`<img class="ys-card" src="${esc(a.imagen||'assets/cabana-cuentos.webp')}" alt="">`;
  const bg=imgs[0]?.[1]||a.imagen||'assets/cabana-cuentos.webp';
  show.innerHTML=`<div class="ys-story ys-astory${imgs.length?' film':''}"><div class="ys-bg" style="background-image:url('${esc(bg)}')"></div>${left}<div class="ys-text"><small>📖 ${esc(Y[lang].story)}</small><h2>${esc(a.titulo)}</h2><p class="ys-page">${esc(Y[lang].listen)}</p><div class="ys-prog"><i></i></div></div></div>`;
  const root=show.querySelector('.ys-astory'),page=root.querySelector('.ys-page'),prog=root.querySelector('.ys-prog i');
  let imgI=-1,flip=false,talking=null,talkN=0;
  const setImg=i=>{if(i===imgI||i<0)return;imgI=i;flip=!flip;const on=root.querySelector(flip?'.ys-film-a':'.ys-film-b'),off=root.querySelector(flip?'.ys-film-b':'.ys-film-a');
    on.src=imgs[i][1];on.className=(flip?'ys-film-a':'ys-film-b')+' on kb'+(i%4);off.classList.remove('on');root.querySelector('.ys-bg').style.backgroundImage=`url('${imgs[i][1]}')`;
    const nx=imgs[i+1];if(nx){const pre=new Image();pre.src=nx[1];}};
  const setTalk=on=>{if(!AV||on===talking)return;talking=on;const vids=[...root.querySelectorAll('.ys-av-talk')];
    if(on){const v=vids[talkN++%vids.length];for(const x of vids)x.classList.toggle('on',x===v);v.play().catch(()=>{});}else for(const x of vids){x.classList.remove('on');setTimeout(()=>{if(!x.classList.contains('on'))x.pause();},400);}};
  if(imgs.length)setImg(0);
  showAudio=new Audio(a.src);showAudio.volume=1;showAudio.play().catch(()=>{});
  showAudio.addEventListener('timeupdate',()=>{const t=showAudio.currentTime;
    if(showAudio.duration)prog.style.width=(t/showAudio.duration*100)+'%';
    if(imgs.length){let k=0;for(let i=0;i<imgs.length;i++)if(t>=imgs[i][0])k=i;setImg(k);}
    setTalk(speech.some(x=>t>=x[0]-.1&&t<=x[1]+.15));
    const l=lines.find(x=>t>=x.a-.25&&t<=x.b+.7);if(l)page.innerHTML=l.ws.map(w=>`<span class="${t>=w.a?(t<w.b+.05?'on now':'on'):''}">${esc(w.w)}</span>`).join(' ');});
  showAudio.addEventListener('ended',()=>{setTalk(false);nextStory();});base=.1;vol();
}
function nextStory(){
  clearTimeout(showTimer);showAudio?.pause();showAudio=null;
  const item=storyQueue.shift();if(item===undefined){startLista();return;}
  const name=($('#yt-story-name')?.value||params.get('nombre')||'').trim().slice(0,20),g=params.get('genero')||'boy';
  if(typeof item==='string'&&item.startsWith('a')){   // cuento en audio
    const a=AUDIO_STORIES[Number(item.slice(1))];if(!a){nextStory();return;}
    audioStory(a);return;
  }
  const s=STORIES[Number(item)]||STORIES[0],pages=storyPagesFor(s,name,g);let i=0;base=.32;vol();
  const page=()=>{
    const img='assets/'+SCENES[i===0?'village':i===5?'mirador':s.scene];
    storyCard(img,s.title,`${Y[lang].story} · ${Y[lang].page(i+1,pages.length)}`,esc(pages[i]));
    const words=pages[i].split(/\s+/).length;showTimer=setTimeout(()=>{i++;if(i<pages.length)page();else nextStory();},Math.max(10,words*.42+4)*1000);
  };page();
}
/* Actualización de los nombres: Estelvia, la guardiana de las cartas, lee en vivo los nombres que llegan
   desde el panel privado (nombre completo y lugar), durante 3 minutos, y luego vuelve el quiz. */
const ELF=all.duende||{},ELF_MS=180000,ELF_SLOT=13000;
const ELF_INTRO=['¡Hola, hola! Soy Estelvia, la guardiana de las cartas, y la duende encargada de enviar los nombres a Santa Claus. ¡Empieza la actualización de los nombres!',
  '¡Atención, Polo Norte! Aquí Estelvia, desde la Gran Oficina Postal. Voy a leer los nombres que me escriben y los enviaré directo a Santa.'];
const ELF_BONITO=['Tu nombre ya brilla en la gran lista de Santa.','Santa va a sonreír muchísimo cuando lo lea.','Que la magia de la Navidad llene tu casa de alegría.',
  'Sigue siendo bondadoso, que Santa lo nota todo.','Tu nombre ya va volando hacia el Polo Norte en mi bolso de cartas viajeras.','Los renos ya conocen tu nombre.',
  'Recuerda: las pequeñas buenas acciones iluminan el mundo entero.','Elarina lo guardará con cariño en el pergamino dorado.'];
const ELF_RELLENO=['¿Quieres que tu nombre llegue hoy a Santa? Escribe tu nombre completo y desde dónde nos ves en los comentarios.',
  'Una pequeña carta puede guardar un universo de sueños. ¡Escríbanme sus nombres!','Recuerden portarse bien, ayudar en casa y abrazar mucho a la familia.',
  'Cada nombre que me escriben lo llevo con cuidado en mi bolso de cartas viajeras.','¡Qué lindo es ver tantos niños de toda Latinoamérica! Escriban su país en el chat.',
  'Santa me pidió que no se me escape ningún nombre. ¡Escríbanlos con su ciudad!','Ser amable es la magia más poderosa del mundo. ¡Nunca lo olviden!'];
let elfQ=[],elfSeen=new Set(),elfWatch=false,elfT0=0,elfIdx=-1,elfLast=-1,elfN=Math.floor(Math.random()*8);
let elfBand=[],bandKey='',letterQ=[],letterBusy=false,bandT0=Date.now(),archived=0;
const BAND_EMPTY=['🎁 Apóyame con tu regalito y forma parte de la Lista de los buenos','✨ Cada regalito suma tu nombre a la Lista de los buenos de Santa',
  '💛 Con tu regalito, tu nombre pasará por aquí en letras doradas','🎅 Envía un regalito y Estelvia llevará tu nombre a Santa Claus'];
let bandQ=[],bandPass=false;
function playLetter(r){
  if(mode!=='quiz')return;letterQ.push(r);if(letterBusy)return;
  const next=()=>{const it=letterQ.shift();if(!it||mode!=='quiz'){letterBusy=false;return;}letterBusy=true;
    const band=$('#yt-names'),el=document.createElement('div');el.className='ys-letter';band?.classList.add('busy');
    const dx=V?415:790,dy=V?170:135,rnd=(a,b)=>a+Math.random()*(b-a);
    let stars='';for(let i=0;i<18;i++)stars+=`<i class="ys-spark" style="left:${rnd(28,72)}%;top:${rnd(5,85)}%;animation-delay:${rnd(0,1.2).toFixed(2)}s;font-size:${rnd(18,38)|0}px">✦</i>`;
    let trail='';for(let k=1;k<=9;k++){const f=k/10;trail+=`<i class="ys-trail" style="--x:${(f*dx)|0}px;--y:${(-4*190*f*(1-f)+dy*f*f)|0}px;animation-delay:${(4.42+f*1.9).toFixed(2)}s">✦</i>`;}
    el.style.setProperty('--dx',dx+'px');el.style.setProperty('--dy',dy+'px');
    el.innerHTML=`<div class="ys-sparks">${stars}</div><div class="ys-halo"></div><p class="ys-letter-name">${esc(it.nombre)}</p>${it.lugar?`<p class="ys-letter-place">📍 ${esc(it.lugar)}</p>`:''}${trail}<div class="ys-fly"><div class="ys-env"><span class="ys-paper">${esc(it.nombre)}</span><span class="ys-env-front"></span><span class="ys-env-flap"></span><span class="ys-env-seal">✦</span><span class="ys-ring"></span></div></div>`;
    stage.append(el);
    setTimeout(()=>{archived++;bandKey='';renderBand();const a=band?.querySelector('.ys-archive');if(a){a.classList.remove('got');void a.offsetWidth;a.classList.add('got');}},5900);
    setTimeout(()=>{el.remove();band?.classList.remove('busy');next();},6900);};
  next();
}
const elfRead=(()=>{try{return new Set(JSON.parse(localStorage.getItem('aldea-elf-leidos')||'[]'));}catch{return new Set();}})();
function markRead(id){elfRead.add(id);try{localStorage.setItem('aldea-elf-leidos',JSON.stringify([...elfRead].slice(-400)));}catch{}}
function elfRow(r,old){if(!r||elfSeen.has(r.id))return;elfSeen.add(r.id);elfBand.unshift(r);elfBand.length=Math.min(elfBand.length,15);
  if(!old||Date.now()-new Date(r.creado).getTime()<180000){bandQ.push(r);if(mode==='quiz')renderBand();}
  if(Date.now()-new Date(r.creado).getTime()<60000&&Date.now()-bandT0>3000)playLetter(r);else archived++;if(old&&(elfRead.has(r.id)||new Date(r.creado).getTime()<Date.now()-600000))return;elfQ.push(r);}
function startElf(){
  stopShow();mode='duende';elfT0=Date.now();elfIdx=-1;elfLast=-1;
  stage.classList.remove('episode','vertical-src');stage.classList.add('show','show-duende');show.hidden=false;$('#yt-ep').hidden=true;namer?.stop();
  video.pause();video2.pause();base=.3;vol();
  if(ELF.video){video.loop=true;video.muted=true;video.src=ELF.video;video.classList.remove('off');video.play().catch(()=>{});}
  show.innerHTML=`<div class="ys-elf">${ELF.video?'':`<div class="ys-bg" style="background-image:url('${esc(ELF.imagen||'assets/santa-correo.webp')}')"></div>`}<div class="ys-elf-card"><span class="ys-chip">📜 Estelvia · Guardiana de las cartas</span><h2>Actualización de los nombres para Santa</h2><p class="ys-elf-name"></p><p class="ys-elf-place"></p><p class="ys-elf-line"></p><p class="ys-chat ys-elf-left"></p></div></div>`;
  startElfWatch();renderMode('duende');elfTick();
}
function elfTick(){
  if(mode!=='duende')return;
  const t=Date.now()-elfT0,slot=Math.floor(t/ELF_SLOT);
  if(t>=ELF_MS){route('quiz');return;}
  const left=Math.ceil((ELF_MS-t)/1000),lf=show.querySelector('.ys-elf-left');if(lf)lf.textContent=`⏱ Volvemos al quiz en ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;
  if(slot===elfLast)return;elfLast=slot;
  const nm=show.querySelector('.ys-elf-name'),pl=show.querySelector('.ys-elf-place'),ln=show.querySelector('.ys-elf-line');if(!nm)return;
  let text;
  if(slot===0){nm.textContent='✨';pl.textContent='';text=ELF_INTRO[Math.floor(Math.random()*ELF_INTRO.length)];}
  else if(elfQ.length){const r=elfQ.shift();markRead(r.id);const lugar=(r.lugar||'').trim(),bonito=ELF_BONITO[(elfN++)%ELF_BONITO.length];
    nm.textContent=r.nombre;pl.textContent=lugar?`📍 ${lugar}`:'';
    text=lugar?`¡Recibí el nombre de ${r.nombre}, que nos ve desde ${lugar}! ${bonito}`:`¡Recibí el nombre de ${r.nombre}! ${bonito}`;}
  else{nm.textContent='📜';pl.textContent='';text=ELF_RELLENO[slot%ELF_RELLENO.length];}
  ln.textContent=text;nm.classList.remove('in');void nm.offsetWidth;nm.classList.add('in');
  say(text,1.3);
}
function startNoche(){
  stopShow();mode='nochebuena';current=-1;act=video;idle=video2;video.dataset.src='';stage.classList.remove('episode','vertical-src');stage.classList.add('noche');
  bgVideo.pause();bgVideo.removeAttribute('src');$('#yt-ep').hidden=true;base=.5;vol();
  namer?.setLabel(X[lang].noche);namer?.start();namer?.setSound(soundOn);syncLista();renderMode('nochebuena');refreshTicker(true);
}
function stopShow(){const nb=$('#yt-names');if(nb)nb.hidden=true;if(mode==='duende'){video.pause();video.removeAttribute('src');video.loop=false;}hush();hostKey='';clearTimeout(showTimer);clearTimeout(phraseT);phrase?.pause();stage.classList.remove('noche');namer?.setLabel('');showAudio?.pause();showAudio=null;show.innerHTML='';show.hidden=true;quizIdx=-1;slideIdx=-1;stage.classList.remove('show','show-quiz','show-musica','show-tarjetas','show-cuento','show-duende');}
function startShow(kind,arg){
  stopShow();if(isEp()){video.pause();}bgVideo.pause();bgVideo.removeAttribute('src');
  mode=kind;stage.classList.remove('episode','vertical-src');stage.classList.add('show','show-'+(kind==='cuentos'?'cuento':kind));show.hidden=false;$('#yt-ep').hidden=true;
  namer?.stop();
  if(kind==='quiz'){refreshTicker(true);current=-1;act=video;idle=video2;video.dataset.src='';base=.45;vol();syncLista();quizTick();}
  else if(kind!=='musica'){video.pause();video2.pause();}
  if(kind==='tarjetas'){base=.85;vol();musicTick();}
  if(kind==='musica'){current=-1;act=video;idle=video2;video.dataset.src='';base=.85;vol();syncLista();laponiaTick();}
  if(kind==='cuento'||kind==='cuentos'){mode='cuento';storyQueue=kind==='cuentos'?[...AUDIO_STORIES.map((_,i)=>'a'+i),...STORIES.map(s=>s.id)]:[arg??'0'];nextStory();}
  renderMode(kind);
}
setInterval(()=>{if(mode==='duende')elfTick();else if(mode==='quiz')quizTick();else if(mode==='tarjetas')musicTick();else if(mode==='musica')laponiaTick();else if(mode==='nochebuena')nocheTick();},250);
/* Música · Laponia: paisajes de Laponia con la canción que suena. */
function laponiaTick(){
  if(!show.firstElementChild)show.innerHTML=`<div class="ys-now"><small>🎵 ${esc(Y[lang].music)}</small><strong class="ys-song"></strong></div>`;
  const s=show.querySelector('.ys-song'),txt=bgLoaded>=0&&seq[bgI]?seq[bgI].title:'';if(s&&s.textContent!==txt)s.textContent=txt;
}
/* Nochebuena: Santa vuela y dice nombres; cada 4 minutos cuenta su secreto (los nombres siguen escritos en el cielo). */
const phrase=all.nochebuena?.frase?new Audio(all.nochebuena.frase):null;let phraseSlot=-1,phraseT=0;
function nocheTick(){
  if(!phrase||!soundOn)return;
  const slot=Math.floor(Date.now()/10000);
  if(slot%24===0&&phraseSlot!==slot){phraseSlot=slot;namer?.setSound(false);phrase.currentTime=0;phrase.play().catch(()=>{});duckFor(19);
    clearTimeout(phraseT);phraseT=setTimeout(()=>{if(mode==='nochebuena'&&soundOn)namer?.setSound(true);},19500);}
}
function route(m,arg){
  if(m==='lista')startLista();else if(/^episodio/.test(m))startEpisode(m);
  else if(m==='quiz'||m==='musica'||m==='tarjetas')startShow(m);else if(m==='nochebuena')startNoche();else if(m==='duende')startElf();
  else if(m==='cuento')startShow('cuento',arg??$('#yt-story').value);else if(m==='cuentos')startShow('cuentos');
  else startLista();
}

/* ---------- Modos ---------- */
let soundOn=false;
function startLista(){
  stopShow();
  mode='lista';current=-1;act=video;idle=video2;video.dataset.src='';stage.classList.remove('episode','vertical-src');bgVideo.pause();bgVideo.removeAttribute('src');
  $('#yt-ep').hidden=true;base=.5;vol();
  namer?.start();namer?.setSound(soundOn);syncLista();renderMode();
}
function loadEpisode(key){ep=cfg[key];epVideos=(ep.videos||[]).filter(v=>v.src);playEpisode(0);}
function startEpisode(which='episodio1'){
  stopShow();
  const keys=which==='episodios'?EPS.slice():EPS.includes(which)?[which]:[];
  if(!keys.length){$('#yt-note').textContent=X[lang].noEp;startLista();return;}
  epQueue=keys;ep=cfg[epQueue.shift()];epVideos=ep.videos.filter(v=>v.src);
  mode='episodio';act=video;idle=video2;showVid(video);video2.pause();video2.removeAttribute('src');video2.dataset.src='';stage.classList.add('episode');$('#yt-ep').hidden=false;
  namer?.stop();base=0;vol();   // el audio del episodio ya trae su propia música de fondo
  playEpisode(0);renderMode(which);
}
let modeKey='lista';
function renderMode(key){
  modeKey=key||(isEp()?modeKey:'lista');
  for(const b of $$('[data-modo]'))b.setAttribute('aria-pressed',String(b.dataset.modo===modeKey));
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
  if(isEp())$('#yt-ep-title').textContent=ep['titulo_'+lang]||ep.titulo||'';
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
  let big=$('#yt-big');if(!big){big=document.createElement('div');big.id='yt-big';big.className='yt-big';big.innerHTML='<span class="yt-big-ico">🎄</span><b></b><i></i><span class="yt-big-time"></span><em></em>';stage.append(big);}
  big.querySelector('b').textContent=d.xmas?'🎁':d.days;big.querySelector('i').textContent=d.xmas?T.xmas:(d.days===1?'día para Navidad':'días para Navidad');
  big.querySelector('.yt-big-time').textContent=`${p2(d.h)}:${p2(d.m)}:${p2(d.s)}`;big.querySelector('em').textContent=`🕒 ${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}`;
  $('#yt-mini').textContent=`🎄 ${d.xmas?T.xmas:T.days(d.days)} · ${p2(d.h)}:${p2(d.m)}:${p2(d.s)}   🕒 ${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}`;
}
const move=$('#yt-move');let pending=null;
function tickerText(){const T=STR[lang],d=countdown(),list=T.ticker(d.xmas?-1:d.days);if(mode==='nochebuena')list.unshift(X[lang].nocheTk);if(mode==='quiz'&&HOSTS?.cintillo)list.unshift(...HOSTS.cintillo);if(recent.length)list.splice(1,0,`${T.recent} ${recent.join(' · ')}`);return list.join('     ✦     ');}
function applyTicker(t){move.innerHTML=`<span>${esc(t)}</span><span>${esc(t)}</span>`;move.style.animationDuration=Math.max(36,Math.round(t.length*.24))+'s';}
move.addEventListener('animationiteration',()=>{if(pending){applyTicker(pending);pending=null;}});
function refreshTicker(force){const t=tickerText();if(force||!move.childElementCount)applyTicker(t);else pending=t;}

/* ---------- Controles ---------- */
const controls=$('#yt-controls');let hideT=0;
function showControls(){controls.classList.remove('hide');clearTimeout(hideT);if(soundOn)hideT=setTimeout(()=>controls.classList.add('hide'),3000);}
addEventListener('mousemove',showControls);addEventListener('touchstart',showControls,{passive:true});
function enableSound(){
  soundOn=true;
  musicPlay().then(()=>{$('#yt-start').hidden=true;$('#yt-note').textContent='';showControls();tell('sound-on');}).catch(()=>{$('#yt-start').hidden=false;$('#yt-note').textContent=X[lang].blocked;tell('sound-blocked');tapToStart();});
  if(mode==='lista'||mode==='nochebuena')namer?.setSound(true);
  if(isEp()){video.muted=false;video.play().catch(()=>{});}
}
$('#yt-start').addEventListener('click',enableSound);
const narrBtn=$('#yt-narr');if(narrBtn){const paint=()=>{narrBtn.textContent=narr?'🗣 Narrador: sí':'🗣 Narrador: no';narrBtn.setAttribute('aria-pressed',String(narr));};paint();narrBtn.addEventListener('click',()=>{narr=!narr;if(!narr)hush();paint();});}
/* Con ?obs=1 no hay controles: si el navegador bloquea el sonido, un aviso grande pide un toque (OBS no lo necesita). */
function tapToStart(){
  if(!document.body.classList.contains('obs')||$('#yt-tap'))return;
  const b=document.createElement('button');b.id='yt-tap';b.type='button';b.className='yt-tap';b.textContent=X[lang].start;
  b.addEventListener('click',()=>{b.remove();enableSound();});document.body.append(b);
}
function mute(){hush();soundOn=false;wanted=false;bg.pause();namer?.setSound(false);video.muted=true;tell('sound-off');}
/* Dentro de la web, los botones de fuera mandan órdenes a esta pantalla. */
function tell(state){if(EMBED&&parent!==window)parent.postMessage({yt:state},'*');}
addEventListener('message',e=>{
  const desde=(parent!==window&&e.source===parent)||(window.opener&&e.source===window.opener);
  if(!desde||!e.data||typeof e.data.cmd!=='string')return;   // solo obedece a la página que la contiene o al panel que la abrió
  const d=e.data;
  if(d.cmd==='sound')enableSound();else if(d.cmd==='mute')mute();
  else if(d.cmd==='lista')startLista();else if(d.cmd==='episodio')startEpisode(typeof d.which==='string'?d.which:'episodio1');
  else if(['quiz','musica','tarjetas','cuentos','nochebuena','duende'].includes(d.cmd))route(d.cmd);
  else if(d.cmd==='narrador'){narr=!!d.on;if(!narr)hush();}
  else if(d.cmd==='lang'&&STR[d.lang]){lang=d.lang;namer?.setLang(lang);texts();renderMode();}
});
for(const b of $$('[data-lang]'))b.addEventListener('click',()=>{lang=b.dataset.lang;namer?.setLang(lang);texts();renderMode();});
$('#yt-eps').innerHTML=EPS.map(k=>`<button type="button" data-modo="${k}">🎬 ${esc(cfg[k].corto||('Episodio '+k.slice(8)))}</button>`).join('')+(EPS.length>1?`<button type="button" data-modo="episodios">🎬 ${esc(X[lang].all)}</button>`:'');
$('#yt-story').innerHTML=[...AUDIO_STORIES.map((a,i)=>`<option value="a${i}">🔊 ${esc(a.titulo)}</option>`),...STORIES.map(s=>`<option value="${s.id}">${esc(s.title)}</option>`)].join('');
if(params.get('nombre'))$('#yt-story-name').value=params.get('nombre');
for(const b of $$('[data-modo]'))b.addEventListener('click',()=>route(b.dataset.modo));
$('#yt-full').addEventListener('click',()=>{const el=document.documentElement;(el.requestFullscreen||el.webkitRequestFullscreen)?.call(el);});
addEventListener('keydown',e=>{if(e.target.matches?.('input,select,textarea'))return;if(e.key==='f')$('#yt-full').click();if(e.key==='e')startEpisode('episodios');if(e.key==='l')startLista();if(e.key==='q')route('quiz');if(e.key==='m')route('musica');if(e.key==='t')route('tarjetas');if(e.key==='n')route('nochebuena');if(e.key==='a')route('duende');if(e.key==='c')route('cuentos');});

/* ---------- Arranque ---------- */
setInterval(tick,1000);setInterval(syncLista,250);
setInterval(()=>refreshTicker(),60000);
texts();
checkFeatured().then(()=>{
  const hoy=new Date(),navidad=hoy.getMonth()===11&&(hoy.getDate()===24||hoy.getDate()===25);
  route(params.get('modo')||(navidad?'nochebuena':'lista'),params.get('cuento')||undefined);
  const watchAll=()=>{startScoreWatch();startMsgWatch();};watchAll();setTimeout(watchAll,3000);
  enableSound();   // en OBS suena solo; en el navegador, si lo bloquea, aparece el botón
});
})();
