(() => {
'use strict';
/* Canal «Santa en vivo» (público) y panel del creador (modo presentador para transmitir).
   Sobre el video: panel con cuenta regresiva a Navidad, fecha, hora y nombres leídos (en tiempo real)
   y un cintillo de noticias que se desplaza. Idiomas: español, inglés y portugués (Brasil). */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const cfg=window.ALDEA_LIVE||{playlist:[]}, pay=window.ALDEA_PAY, cardMusic=window.SANTA_MUSIC||[];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const items=cfg.playlist.filter(i=>i.src&&i.duration>0).map(i=>({...i,repeat:Math.max(1,i.repeat||1),span:i.duration*Math.max(1,i.repeat||1)}));
/* Estado «en vivo»: valores de live-data.js, reemplazados por el interruptor de /admin (Supabase). */
const ttUrl=u=>u?`https://www.tiktok.com/@${encodeURIComponent(String(u).trim().replace(/^@/,''))}/live`:'';
const ytId=v=>{v=String(v||'').trim();const m=v.match(/(?:youtu\.be\/|[?&]v=|\/live\/|\/embed\/|\/shorts\/)([\w-]{11})/);return m?m[1]:/^[\w-]{11}$/.test(v)?v:'';};
const liveState={liveNow:!!cfg.liveNow,tiktokUser:cfg.tiktokUser||'',youtube:cfg.youtubeLiveId||''};
let tiktokUrl=ttUrl(liveState.tiktokUser);
/* Retransmisión: los saludos grabados de «Niños buenos», consecutivos y con su propio audio. */
const retrans=(window.NINOS_BUENOS?.items||[]).filter(it=>cfg.retransmision?.[it.id]>0).map(it=>({src:it.src,label:it.label.replace(/ · versión \d+$/,''),special:it.special,duration:cfg.retransmision[it.id],repeat:1,span:cfg.retransmision[it.id]}));
const CHANNELS={lista:items,retrans};
const totalOf=list=>list.reduce((s,i)=>s+i.span,0);
const liveMusic=cfg.musica?.length?cfg.musica:cardMusic.map(m=>({src:m.src,title:m.title,gain:1}));

/* ---------- Textos en tres idiomas ---------- */
const fmtN=(n,loc)=>Number(n).toLocaleString(loc);
const STR={
  es:{loc:'es-PE',fmtV:'▯ Vertical',fmtH:'▭ Horizontal',hSound:'🔊 Activar sonido',hMute:'🔇 Silenciar',hList:'🔴 Lista de los buenos',hEp:'🎬 Episodio 1',hFull:'⛶ Pantalla completa',hOpen:'Abrir aparte ↗',eyebrow:'DESDE EL POLO NORTE · AHORA MISMO',h2:'Santa <em>en vivo.</em>',intro:'Mira a Santa en su aldea a cualquier hora. Cuando Santa transmite en TikTok, aquí aparece el botón para entrar a su en vivo y saludarlo.',
    tabLista:'🔴 Lista de los buenos',tabRetrans:'📺 Retransmisión: saludos de Santa',langLabel:'Idioma de la lista:',live:'EN VIVO',replay:'RETRANSMISIÓN',kickerLista:'Ahora en la aldea',kickerRetrans:'Saludo grabado de Santa',
    soundOff:'🔇 Silenciar',soundLista:'🔊 Activar sonido · Santa lee los nombres',soundRetrans:'🔊 Activar sonido del saludo',full:'⛶ Pantalla completa',next:'A continuación',addName:'¿Quieres que Santa diga tu nombre? Escríbelo aquí',
    readToday:n=>`✨ Santa ya leyó ${n} nombres hoy`,approved:n=>n==='1'?'1 nombre en la lista de hoy':`${n} niños y niñas en la lista de hoy`,recorded:n=>`${n} nombres en la lista de los buenos`,
    noteEs:n=>`Solo los ${n} nombres grabados con la voz de Santa en español.`,noteOther:'Versión aparte, sin mezclarse con la voz en español.',
    faltan:'Faltan para Navidad',days:d=>d===1?'1 día':`${d} días`,xmas:'¡Feliz Navidad!',namesRead:n=>`${n} nombres leídos hoy`,greeting:x=>`Saludo de Santa para ${x}`,said:x=>`Santa nombra a ${x}`,
    askTitle:'¿Quieres que Santa salude a tu niño o niña en el en vivo?',askText:'Pide su saludo personalizado. Con tu autorización, Santa puede mostrarlo durante la transmisión.',askBtn:'Pedir su saludo',
    tiktokText:'Santa está transmitiendo ahora mismo. ¡Entra, salúdalo y escribe el nombre de tu niño o niña en el chat!',tiktokBtn:'Ver a Santa en TikTok LIVE',tiktokBadge:'EN VIVO EN TIKTOK',
    share:'Invita a tu familia a ver a Santa en vivo',shareText:'🎅🔴 Santa está en vivo desde el Polo Norte. ¡Míralo aquí!',recent:'Santa acaba de nombrar a:',
    ticker:d=>[d>0?`🎄 Faltan ${d===1?'1 día':d+' días'} para Navidad`:d===0?'🎄 ¡Mañana es Navidad!':'🎄 ¡Feliz Navidad desde la aldea de Santa!','🎅 Bienvenidos al canal en vivo de La aldea de Santa','✨ Escribe tu nombre en la web y Santa lo leerá en vivo','📬 Envía tu carta al Polo Norte desde la pestaña Gratis','🎁 Juega gratis «Regalos en los techos»','💬 Pide tu saludo personalizado de Santa por WhatsApp']},
  en:{loc:'en-US',fmtV:'▯ Vertical',fmtH:'▭ Horizontal',hSound:'🔊 Turn on sound',hMute:'🔇 Mute',hList:'🔴 Nice list',hEp:'🎬 Episode 1',hFull:'⛶ Full screen',hOpen:'Open separately ↗',eyebrow:'FROM THE NORTH POLE · RIGHT NOW',h2:'Santa <em>live.</em>',intro:"Watch Santa in his village any time. When Santa streams on TikTok, a button appears here to join his live and say hi.",
    tabLista:"🔴 Santa's Nice List",tabRetrans:'📺 Replay: greetings from Santa',langLabel:'List language:',live:'LIVE',replay:'REPLAY',kickerLista:'Now in the village',kickerRetrans:"Santa's recorded greeting",
    soundOff:'🔇 Mute',soundLista:'🔊 Turn on sound · Santa reads the names',soundRetrans:'🔊 Turn on greeting sound',full:'⛶ Full screen',next:'Up next',addName:'Want Santa to say your name? Write it here',
    readToday:n=>`✨ Santa has read ${n} names today`,approved:n=>n==='1'?'1 name on today\'s list':`${n} children on today's list`,recorded:n=>`${n} names on the nice list`,
    noteEs:n=>`Only the ${n} names recorded in Santa's Spanish voice.`,noteOther:'Separate version, never mixed with the Spanish voice.',
    faltan:'Until Christmas',days:d=>d===1?'1 day':`${d} days`,xmas:'Merry Christmas!',namesRead:n=>`${n} names read today`,greeting:x=>`Santa's greeting for ${x}`,said:x=>`Santa names ${x}`,
    askTitle:'Want Santa to greet your child on the live?',askText:'Order a personalized greeting. With your permission, Santa can show it during the stream.',askBtn:'Order a greeting',
    tiktokText:'Santa is streaming right now. Join, say hi and write your child\'s name in the chat!',tiktokBtn:'Watch Santa on TikTok LIVE',tiktokBadge:'LIVE ON TIKTOK',
    share:'Invite your family to watch Santa live',shareText:'🎅🔴 Santa is live from the North Pole. Watch here!',recent:'Santa just named:',
    ticker:d=>[d>0?`🎄 ${d===1?'1 day':d+' days'} until Christmas`:d===0?'🎄 Christmas is tomorrow!':'🎄 Merry Christmas from Santa\'s village!',"🎅 Welcome to Santa's village live channel",'✨ Write your name on the site and Santa will read it live','📬 Send your letter to the North Pole from the Free tab','🎁 Play «Gifts on the Rooftops» for free','💬 Order a personalized greeting from Santa on WhatsApp']},
  pt:{loc:'pt-BR',fmtV:'▯ Vertical',fmtH:'▭ Horizontal',hSound:'🔊 Ativar som',hMute:'🔇 Silenciar',hList:'🔴 Lista dos bonzinhos',hEp:'🎬 Episódio 1',hFull:'⛶ Tela cheia',hOpen:'Abrir à parte ↗',eyebrow:'DO POLO NORTE · AGORA MESMO',h2:'Papai Noel <em>ao vivo.</em>',intro:'Veja o Papai Noel na sua vila a qualquer hora. Quando ele transmitir no TikTok, aqui aparece o botão para entrar na live e dizer oi.',
    tabLista:'🔴 Lista dos bonzinhos',tabRetrans:'📺 Reprise: saudações do Papai Noel',langLabel:'Idioma da lista:',live:'AO VIVO',replay:'REPRISE',kickerLista:'Agora na vila',kickerRetrans:'Saudação gravada do Papai Noel',
    soundOff:'🔇 Silenciar',soundLista:'🔊 Ativar som · Papai Noel lê os nomes',soundRetrans:'🔊 Ativar som da saudação',full:'⛶ Tela cheia',next:'A seguir',addName:'Quer que o Papai Noel diga seu nome? Escreva aqui',
    readToday:n=>`✨ O Papai Noel já leu ${n} nomes hoje`,approved:n=>n==='1'?'1 nome na lista de hoje':`${n} crianças na lista de hoje`,recorded:n=>`${n} nomes na lista dos bonzinhos`,
    noteEs:n=>`Somente os ${n} nomes gravados na voz do Papai Noel em espanhol.`,noteOther:'Versão separada, nunca misturada com a voz em espanhol.',
    faltan:'Faltam para o Natal',days:d=>d===1?'1 dia':`${d} dias`,xmas:'Feliz Natal!',namesRead:n=>`${n} nomes lidos hoje`,greeting:x=>`Saudação do Papai Noel para ${x}`,said:x=>`Papai Noel diz ${x}`,
    askTitle:'Quer que o Papai Noel cumprimente seu filho na live?',askText:'Peça uma saudação personalizada. Com sua autorização, o Papai Noel pode mostrá-la durante a transmissão.',askBtn:'Pedir saudação',
    tiktokText:'O Papai Noel está transmitindo agora. Entre, diga oi e escreva o nome da criança no chat!',tiktokBtn:'Ver o Papai Noel no TikTok LIVE',tiktokBadge:'AO VIVO NO TIKTOK',
    share:'Convide sua família para ver o Papai Noel ao vivo',shareText:'🎅🔴 O Papai Noel está ao vivo do Polo Norte. Assista aqui!',recent:'O Papai Noel acabou de dizer:',
    ticker:d=>[d>0?`🎄 Faltam ${d===1?'1 dia':d+' dias'} para o Natal`:d===0?'🎄 Amanhã é Natal!':'🎄 Feliz Natal da vila do Papai Noel!','🎅 Bem-vindos ao canal ao vivo da Vila do Papai Noel','✨ Escreva seu nome no site e o Papai Noel vai lê-lo ao vivo','📬 Envie sua carta ao Polo Norte na aba Grátis','🎁 Jogue grátis «Presentes nos telhados»','💬 Peça sua saudação personalizada do Papai Noel pelo WhatsApp']}
};
const titleOf=(it,l)=>it.label?(it.special?it.label:STR[l].greeting(l==='es'?it.label:window.ALDEA_LIVE_NAMES?.plain?.(it.label)||it.label)):(it['title_'+l]||it.title);

/* Cuenta regresiva a Navidad con la hora del dispositivo. */
function countdown(now=new Date()){
  const xmas=now.getMonth()===11&&now.getDate()===25;
  const year=now.getFullYear()+(now.getMonth()===11&&now.getDate()>25?1:0);
  const s=xmas?0:Math.max(0,Math.ceil((new Date(year,11,25)-now)/1000));
  return {xmas,days:Math.floor(s/86400),h:Math.floor(s%86400/3600),m:Math.floor(s%3600/60),s:s%60};
}
const p2=n=>String(n).padStart(2,'0');

/* Panel sobre el video + cintillo animado (sirve para el canal y para el modo presentador). */
function mountOverlay(host,getLang){
  const el=document.createElement('div');el.className='live-overlay';el.setAttribute('aria-hidden','true');
  el.innerHTML='<div class="lo-hud"><small class="lo-faltan"></small><strong class="lo-days"></strong><span class="lo-time"></span><span class="lo-date"></span><span class="lo-names"></span></div><div class="live-ticker"><span class="lt-tag"></span><div class="lt-track"><div class="lt-move"></div></div></div>';
  host.append(el);
  const q=s=>el.querySelector(s),move=q('.lt-move');let recent=[],extra='',pending=null;
  function text(){const T=STR[getLang()],d=countdown(),list=T.ticker(d.xmas?-1:d.days);if(recent.length)list.splice(1,0,`${T.recent} ${recent.join(' · ')}`);if(extra)list.unshift(extra);return list.join('     ✦     ');}
  function apply(t){move.innerHTML=`<span>${esc(t)}</span><span>${esc(t)}</span>`;move.style.animationDuration=Math.max(28,Math.round(t.length*.22))+'s';}
  move.addEventListener('animationiteration',()=>{if(pending){apply(pending);pending=null;}});
  function refreshTicker(force){const t=text();if(force||!move.childElementCount)apply(t);else pending=t;}
  function tick(){
    const l=getLang(),T=STR[l],d=countdown(),now=new Date(),names=window.ALDEA_LIVE_NAMES?.namesToday?.()||0;
    q('.lo-faltan').textContent=d.xmas?'':T.faltan;
    q('.lo-days').textContent=d.xmas?T.xmas:T.days(d.days);
    q('.lo-time').textContent=d.xmas?'🎄':`${p2(d.h)}:${p2(d.m)}:${p2(d.s)}`;
    const date=now.toLocaleDateString(T.loc,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    q('.lo-date').textContent=date.charAt(0).toLocaleUpperCase(T.loc)+date.slice(1);
    q('.lo-names').textContent='✨ '+T.namesRead(fmtN(names,T.loc));
    q('.lt-tag').textContent=T.live;
  }
  refreshTicker(true);tick();
  const minute=setInterval(()=>refreshTicker(),60000);
  return {el,tick,addName(n){if(recent[0]===n)return;recent=[n,...recent.filter(x=>x!==n)].slice(0,6);refreshTicker();},setExtra(t){if(t===extra)return;extra=t;refreshTicker();},relang(){refreshTicker(true);tick();},destroy(){clearInterval(minute);el.remove();}};
}

/* Posición del canal según la hora: todos los visitantes ven lo mismo al mismo tiempo. */
function channelAt(list,ms=Date.now()){
  let t=(ms/1000)%totalOf(list);
  for(let i=0;i<list.length;i++){if(t<list[i].span)return {index:i,item:list[i],offset:t%list[i].duration,left:list[i].span-t};t-=list[i].span;}
  return {index:0,item:list[0],offset:0,left:list[0].span};
}
/* Piezas compartidas con la transmisión horizontal para YouTube (en-vivo-youtube.html). */
window.ALDEA_LIVE_KIT={STR,countdown,channelAt,titleOf,p2,esc,fmtN};
const pref={get(k,d){try{return localStorage.getItem(k)||d;}catch{return d;}},set(k,v){try{localStorage.setItem(k,v);}catch{}}};
let mode=pref.get('aldea-live-mode','lista');if(!CHANNELS[mode]?.length)mode='lista';
function guessLang(){
  const saved=pref.get('aldea-live-lang','');if(STR[saved])return saved;
  const nav=(navigator.language||'').toLowerCase();
  if(pay?.country?.().id==='br'||nav.startsWith('pt'))return 'pt';
  if(nav.startsWith('en'))return 'en';
  return 'es';
}
let lang=guessLang();

/* ---------- Música de fondo: volumen igualado, transición suave y baja cuando habla Santa ---------- */
/* Todas las canciones en orden, una tras otra; al terminar la última, vuelve a empezar. */
const bg=new Audio();bg.preload='auto';
let bgIndex=0,bgLoaded=-1,duck=1,fade=1,duckTimer=0,bgBase=.5;
function bgVol(){const t=liveMusic[bgIndex%liveMusic.length]||{gain:1};bg.volume=Math.max(0,Math.min(1,bgBase*(t.gain||1)*duck*fade));}
bg.addEventListener('timeupdate',()=>{const left=bg.duration-bg.currentTime;fade=Math.max(0,Math.min(1,bg.currentTime/1.5,Number.isFinite(left)?left/2:1));bgVol();});
function loadTrack(i){bgIndex=((i%liveMusic.length)+liveMusic.length)%liveMusic.length;bg.src=liveMusic[bgIndex].src;bgLoaded=bgIndex;fade=0;}
bg.addEventListener('ended',()=>{loadTrack(bgIndex+1);bgVol();bg.play().catch(()=>{});});
bg.addEventListener('error',()=>{if(bgLoaded>=0){loadTrack(bgIndex+1);bg.play().catch(()=>{});}});   // si una canción falla, pasa a la siguiente
function startBg(){if(!liveMusic.length)return;if(bgLoaded<0)loadTrack(bgIndex);bgVol();bg.play().catch(()=>{});}
function duckFor(sec){duck=.6;bgVol();clearTimeout(duckTimer);duckTimer=setTimeout(()=>{duck=1;duckTimer=0;bgVol();},Math.max(.5,sec)*1000);}
/* Vigilante: si el celular pausó la música (cambio de canción en segundo plano, corte de red,
   bloqueo de pantalla), la reanuda; si se trabó, pasa a la siguiente canción. */
let bgWanted=false,bgLastTime=-1,bgStuck=0;
function ensureBg(){
  if(!bgWanted||!liveMusic.length||document.hidden)return;
  if(bgLoaded<0){startBg();return;}
  if(bg.ended){loadTrack(bgIndex+1);bgVol();bg.play().catch(()=>{});bgStuck=0;return;}
  if(bg.paused){bgVol();bg.play().catch(()=>{});return;}
  if(Math.abs(bg.currentTime-bgLastTime)<.05){if(++bgStuck>=8){loadTrack(bgIndex+1);bgVol();bg.play().catch(()=>{});bgStuck=0;}}else bgStuck=0;
  bgLastTime=bg.currentTime;
  if(duck<1&&!duckTimer){duck=1;}
  bgVol();
}
setInterval(ensureBg,1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)ensureBg();});
const bgPlay=()=>{bgWanted=true;startBg();};
const bgStop=()=>{bgWanted=false;bg.pause();};

/* ---------- Canal público ---------- */
const root=$('#en-vivo');
let channelTimer=0,current=-1,soundOn=false,overlay=null,namer=null;
function playBg(){if(!soundOn)return;bgBase=.5;bgPlay();}
function buildChannel(){
  if(!root)return;
  root.innerHTML=`<div class="wrap"><div class="section-heading"><div><p class="eyebrow" data-s="eyebrow"></p><h2 id="live-heading" data-h="h2"></h2></div><p data-s="intro"></p></div>
<div class="live-format" role="group" aria-label="Formato"><button type="button" data-fmt="v" data-s="fmtV"></button><button type="button" data-fmt="h" data-s="fmtH"></button></div>
<div class="live-h" id="live-h" hidden><div class="live-modes" role="tablist" aria-label="Qué ver"><button type="button" role="tab" data-hcmd="lista" aria-selected="true" data-s="hList"></button><button type="button" role="tab" data-hcmd="nochebuena">🎄 Nochebuena</button><button type="button" role="tab" data-hcmd="quiz">🎯 Quiz</button><button type="button" role="tab" data-hcmd="cuentos">📖 Cuentos</button><button type="button" role="tab" data-hcmd="musica">🎵 Música</button><button type="button" role="tab" data-hcmd="episodio" data-s="hEp"></button></div><div class="live-h-frame"><iframe id="live-h-frame" title="Santa en vivo · horizontal" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe></div><div class="live-h-bar"><button type="button" class="button small" id="live-h-sound" data-s="hSound"></button><span class="live-h-lang" role="group" aria-label="Idioma"><button type="button" data-hlang="es">ES</button><button type="button" data-hlang="en">EN</button><button type="button" data-hlang="pt">PT</button></span><button type="button" class="button outline small" id="live-h-full" data-s="hFull"></button><a class="button outline small" id="live-h-open" target="_blank" rel="noopener" data-s="hOpen"></a></div></div>
<div class="live-v" id="live-v"><div class="live-modes" role="tablist" aria-label="Canal"><button type="button" role="tab" data-mode="lista" data-s="tabLista"></button><button type="button" role="tab" data-mode="retrans" data-s="tabRetrans"></button><button type="button" role="tab" data-show="nochebuena">🎄 Nochebuena</button><button type="button" role="tab" data-show="quiz">🎯 Quiz</button><button type="button" role="tab" data-show="cuentos">📖 Cuentos</button><button type="button" role="tab" data-show="musica">🎵 Música</button></div>
<div class="live-vshow" id="live-vshow" hidden><div class="live-v-frame"><iframe id="live-v-frame" title="Santa en vivo · vertical" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe></div><div class="live-h-bar"><button type="button" class="button small" id="live-v-sound">🔇 Silenciar</button><button type="button" class="button outline small" id="live-v-full">⛶ Pantalla completa</button></div></div>
<div class="live-layout"><div class="live-player" id="live-player"><video id="live-video" muted playsinline autoplay loop preload="auto" aria-label="Canal en vivo de Santa"></video><canvas id="live-sky" class="live-sky" width="1080" height="1920" aria-hidden="true"></canvas><p class="sr-only" id="live-name-said" aria-live="polite"></p><span class="live-badge" id="live-badge"><i></i><b></b></span><span class="live-clock" id="live-clock"></span><div class="live-lower"><small id="live-kicker"></small><strong id="live-now"></strong></div></div>
<div class="live-side panel"><div class="live-lang" id="live-lang" role="group" aria-label="Idioma de la lista"><span data-s="langLabel"></span><button type="button" data-lang="es">🇪🇸 Español · voz de Santa</button><button type="button" data-lang="en">🇺🇸 English</button><button type="button" data-lang="pt">🇧🇷 Português</button></div><p class="fine" id="live-lang-note"></p><div class="live-tiktok" id="live-tiktok" hidden><span class="live-badge static"><i></i><b data-s="tiktokBadge"></b></span><p data-s="tiktokText"></p><a class="button" id="live-tiktok-link" target="_blank" rel="noopener noreferrer" data-s="tiktokBtn"></a></div>
<div class="live-buttons"><button type="button" class="button" id="live-sound"></button><button type="button" class="button outline" id="live-full" data-s="full"></button></div>
<div class="live-list"><strong id="live-list-count"></strong><span id="live-list-source"></span><button type="button" class="button green small" id="live-add-name" data-s="addName"></button></div>
<h3 data-s="next"></h3><ol class="live-next" id="live-next"></ol>
<div class="notice live-ask"><strong data-s="askTitle"></strong><p data-s="askText"></p><a class="button green small" href="#pedido" data-s="askBtn"></a></div></div></div>
</div><div class="live-youtube" id="live-youtube" hidden></div></div>`;
  root.querySelector('.wrap').append(pay.shareBar({heading:STR[lang].share,text:STR[lang].shareText,hash:'#en-vivo'}));
  overlay=mountOverlay($('#live-player'),()=>lang);
  $('#live-sound').addEventListener('click',()=>{soundOn=!soundOn;applyAudio();});
  $('#live-add-name').addEventListener('click',()=>{const chip=$('#kid-chip');if(chip)chip.click();else location.hash='gratis';});
  if(window.ALDEA_LIVE_NAMES){namer=window.ALDEA_LIVE_NAMES.create({canvas:$('#live-sky'),onName:(name)=>{$('#live-name-said').textContent=STR[lang].said(name);overlay?.addName(name);updateListInfo();},onSpeak:duckFor});namer.setLang(lang);}
  for(const b of $$('[data-mode]'))b.addEventListener('click',()=>setMode(b.dataset.mode));
  for(const b of $$('[data-lang]'))b.addEventListener('click',()=>setLang(b.dataset.lang));
  if(!retrans.length)$('[data-mode="retrans"]').hidden=true;
  renderTexts();renderMode();
  for(const b of $$('[data-show]'))b.addEventListener('click',()=>setShow(b.dataset.show));
  $('#live-v-sound').addEventListener('click',()=>{vSound=!vSound;vSend({cmd:vSound?'sound':'mute'});$('#live-v-sound').textContent=vSound?'🔇 Silenciar':'🔊 Activar sonido';});
  $('#live-v-full').addEventListener('click',()=>{const el=$('.live-v-frame');(el.requestFullscreen||el.webkitRequestFullscreen)?.call(el);});
  for(const b of $$('[data-fmt]'))b.addEventListener('click',()=>setFmt(b.dataset.fmt));
  $('#live-h-sound').addEventListener('click',()=>hSend({cmd:hSound?'mute':'sound'}));
  for(const b of $$('[data-hcmd]'))b.addEventListener('click',()=>{hSend({cmd:b.dataset.hcmd});for(const x of $$('[data-hcmd]'))x.setAttribute('aria-selected',String(x===b));});
  for(const b of $$('[data-hlang]'))b.addEventListener('click',()=>{setLang(b.dataset.hlang);hSoundBtn();});
  $('#live-h-full').addEventListener('click',()=>{const el=$('.live-h-frame');(el.requestFullscreen||el.webkitRequestFullscreen)?.call(el);});
  setFmt(fmt);
  $('#live-full').addEventListener('click',()=>{const p=$('#live-player');(p.requestFullscreen||p.webkitRequestFullscreen)?.call(p);});
}
let fmt=pref.get('aldea-live-fmt','')||(matchMedia('(min-width:900px)').matches?'h':'v'),pageOn=false;
const hUrl=(ep,embed=true)=>`en-vivo-youtube.html?lang=${lang}${ep?'&modo=episodio1':''}${embed?'&embed=1':''}`;
let hSound=false;
const hSend=msg=>$('#live-h-frame')?.contentWindow?.postMessage(msg,'*');   // solo órdenes (quiz, sonido…), sin datos privados
function hSoundBtn(){const b=$('#live-h-sound');if(b)b.textContent=STR[lang][hSound?'hMute':'hSound'];for(const x of $$('[data-hlang]'))x.setAttribute('aria-pressed',String(x.dataset.hlang===lang));}
function narrVoice(){const vs=(window.speechSynthesis?.getVoices?.()||[]).filter(v=>/^es([-_]|$)/i.test(v.lang));const sc=v=>(/natural|online|neural/i.test(v.name)?6:0)+(/google/i.test(v.name)?3:0)+(/mx|us|419/i.test(v.lang)?2:/es[-_]es/i.test(v.lang)?1:0)+(/jorge|pablo|alvaro|álvaro|raul|raúl|diego|gerardo|male|hombre/i.test(v.name)?1:0);return vs.sort((a,b)=>sc(b)-sc(a))[0]||null;}
window.speechSynthesis?.getVoices?.();
window.addEventListener('message',e=>{if(!e.data?.yt||(e.source!==$('#live-h-frame')?.contentWindow&&e.source!==$('#live-v-frame')?.contentWindow))return;
  if(e.data.yt==='speak'&&typeof e.data.text==='string'){const s=window.speechSynthesis;if(!s)return;s.cancel();const u=new SpeechSynthesisUtterance(e.data.text.slice(0,600)),v=narrVoice();if(v)u.voice=v;u.lang=v?.lang||'es-MX';u.pitch=.95;s.speak(u);return;}
  if(e.data.yt==='speak-stop'){window.speechSynthesis?.cancel();return;}hSound=e.data.yt==='sound-on';hSoundBtn();});
let vShow=null,vSound=true;
const vSend=msg=>$('#live-v-frame')?.contentWindow?.postMessage(msg,'*');
function setShow(m){
  const frame=$('#live-v-frame');
  for(const b of $$('[data-show]'))b.setAttribute('aria-selected',String(b.dataset.show===m));
  if(m)for(const b of $$('[data-mode]'))b.setAttribute('aria-selected','false');
  if(fmt==='h'){if(m)hSend({cmd:m});return;}
  vShow=m;$('#live-vshow').hidden=!m;root.querySelector('.live-layout').hidden=!!m;
  if(m){stopChannel();vSound=true;$('#live-v-sound').textContent='🔇 Silenciar';frame.onload=()=>vSend({cmd:'sound'});frame.src=`en-vivo-vertical.html?lang=${lang}&modo=${m}&embed=1`;}
  else{frame.removeAttribute('src');frame.src='about:blank';if(pageOn)startChannel();renderMode();}
}
function setFmt(next,ep){
  if(vShow&&next==='h')setShow(null);
  fmt=next;pref.set('aldea-live-fmt',fmt);
  for(const b of $$('[data-fmt]'))b.setAttribute('aria-pressed',String(b.dataset.fmt===fmt));
  const h=fmt==='h',frame=$('#live-h-frame');
  $('#live-h').hidden=!h;$('#live-v').hidden=h;
  $('#live-h-open').href=hUrl(false,false);hSound=false;hSoundBtn();
  for(const x of $$('[data-hcmd]'))x.setAttribute('aria-selected',String(x.dataset.hcmd===(ep?'episodio':'lista')));
  if(h&&pageOn){stopChannel();const url=hUrl(ep);const cur=frame.getAttribute('src')||'';if(ep||!cur||cur==='about:blank')frame.src=url;}
  else{frame.removeAttribute('src');frame.src='about:blank';if(pageOn)startChannel();}
}
function renderTexts(){
  const T=STR[lang];
  for(const el of root.querySelectorAll('[data-s]')){const v=T[el.dataset.s];if(typeof v==='string')el.textContent=v;}
  for(const el of root.querySelectorAll('[data-h]'))el.innerHTML=T[el.dataset.h];
  root.lang=lang==='pt'?'pt-BR':lang;
  const sh=root.querySelector('.ap-share-title');if(sh)sh.textContent=T.share;
}
/* Audio: en la lista, SOLO la voz de la lista (el video de Santa va siempre sin sonido, para no
   cruzarse con su audio en inglés). En la retransmisión, solo el audio propio de cada saludo grabado. */
function applyAudio(){
  const v=$('#live-video');if(!v)return;
  const lista=mode==='lista',T=STR[lang];
  v.muted=lista?true:!soundOn;
  namer?.setSound(lista&&soundOn);
  if(lista&&soundOn)playBg();else bgStop();
  $('#live-sound').textContent=soundOn?T.soundOff:lista?T.soundLista:T.soundRetrans;
}
function renderMode(){
  const T=STR[lang];
  for(const b of $$('[data-mode]'))b.setAttribute('aria-selected',String(b.dataset.mode===mode));
  for(const b of $$('[data-lang]'))b.setAttribute('aria-pressed',String(b.dataset.lang===lang));
  const lista=mode==='lista';
  $('#live-lang').hidden=!lista;$('.live-list').hidden=!lista;$('#live-lang-note').hidden=!lista;
  const size=window.ALDEA_LIVE_NAMES?.catalogSize||0;
  $('#live-lang-note').textContent=lang==='es'?T.noteEs(fmtN(size,T.loc)):T.noteOther;
  if(lang!=='es')window.ALDEA_LIVE_NAMES?.langStatus?.(lang).then(s=>{if(lang!=='es')$('#live-lang-note').textContent=`${T.noteOther} ${s.label}`;});
  $('#live-badge b').textContent=lista?T.live:T.replay;
  $('#live-badge').classList.toggle('replay',!lista);
  $('#live-kicker').textContent=lista?T.kickerLista:T.kickerRetrans;
  $('#live-video').loop=lista;
  current=-1;syncChannel();updateListInfo();
}
function setMode(next){
  if(vShow){setShow(null);if(next===mode)return;}
  if(!CHANNELS[next]?.length||next===mode)return;
  mode=next;pref.set('aldea-live-mode',mode);
  if(mode==='lista')namer?.start();else namer?.stop();
  renderMode();applyAudio();
}
function setLang(next){
  if(!STR[next]||next===lang)return;
  lang=next;pref.set('aldea-live-lang',lang);namer?.setLang(lang);renderTexts();renderMode();applyAudio();overlay?.relang();if(fmt==='h'&&pageOn){$('#live-h-frame').src=hUrl(false);hSound=false;}$('#live-h-open').href=hUrl(false,false);hSoundBtn();
}
function syncChannel(){
  const v=$('#live-video'),list=CHANNELS[mode];if(!v||!list.length)return;
  const pos=channelAt(list),key=mode+':'+pos.index+':'+lang;
  if(key!==current){
    if(!current||String(current).split(':').slice(0,2).join(':')!==mode+':'+pos.index){v.src=pos.item.src;v.addEventListener('loadedmetadata',()=>{v.currentTime=channelAt(CHANNELS[mode]).offset;v.play().catch(()=>{});},{once:true});}
    current=key;
    $('#live-now').textContent=titleOf(pos.item,lang);
    const next=[];for(let k=1;k<=4;k++)next.push(titleOf(list[(pos.index+k)%list.length],lang));
    $('#live-next').innerHTML=next.map(t=>`<li>${esc(t)}</li>`).join('');
  }else if(v.readyState>=2&&Math.abs(v.currentTime-pos.offset)>1.5&&pos.offset>.5&&pos.offset<pos.item.duration-.5){v.currentTime=pos.offset;}
  if(v.paused&&v.readyState>=2&&!v.ended)v.play().catch(()=>{});
  $('#live-clock').textContent=new Date().toLocaleTimeString(STR[lang].loc,{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  overlay?.tick();
}
function updateListInfo(){
  const n=window.ALDEA_LIVE_NAMES;if(!n)return;
  const T=STR[lang],c=$('#live-list-count'),s=$('#live-list-source');
  if(c)c.textContent=T.readToday(fmtN(n.namesToday(),T.loc));
  if(s)s.textContent=n.count?(n.source==='aprobados'?T.approved(fmtN(n.count,T.loc)):T.recorded(fmtN(n.count,T.loc))):'';
}
window.addEventListener('aldea:live-names',updateListInfo);
function startChannel(){if(channelTimer||!items.length)return;current=-1;syncChannel();channelTimer=setInterval(syncChannel,1000);if(mode==='lista')namer?.start();applyAudio();updateListInfo();}
function stopChannel(){clearInterval(channelTimer);channelTimer=0;const v=$('#live-video');if(v){v.pause();}bgStop();namer?.stop();}

/* Cartel global y botones cuando Santa está en vivo en TikTok y/o YouTube */
let ytShown='';
function applyLive(){
  tiktokUrl=ttUrl(liveState.tiktokUser);
  const yt=liveState.liveNow?ytId(liveState.youtube):'',tt=liveState.liveNow&&tiktokUrl;
  const box=$('#live-tiktok');if(box){box.hidden=!tt;if(tt)$('#live-tiktok-link').href=tiktokUrl;}
  const ybox=$('#live-youtube');
  if(ybox&&yt!==ytShown){ytShown=yt;ybox.hidden=!yt;ybox.innerHTML=yt?`<h3>🔴 Santa en vivo en YouTube</h3><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(yt)}" title="Directo de Santa en YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe><p><a class="button small" href="https://www.youtube.com/watch?v=${encodeURIComponent(yt)}" target="_blank" rel="noopener noreferrer">Ver en YouTube y escribir en el chat</a></p>`:'';}
  document.querySelector('.live-banner')?.remove();
  if(!tt&&!yt)return;
  const where=tt&&yt?'TikTok y YouTube':tt?'TikTok':'YouTube';
  const b=document.createElement('a');b.className='live-banner';b.href=tt?tiktokUrl:`https://www.youtube.com/watch?v=${encodeURIComponent(yt)}`;b.target='_blank';b.rel='noopener noreferrer';
  b.innerHTML=`<i></i><strong>Santa está EN VIVO en ${where}</strong><span>Entrar ahora →</span>`;
  document.body.prepend(b);
}
async function loadLiveStatus(){
  const db=window.ALDEA_DB;if(!db?.configured||!db.liveStatus)return;
  try{const st=await db.liveStatus();if(st){Object.assign(liveState,st);applyLive();}}catch{}
}
function liveBanner(){applyLive();document.addEventListener('DOMContentLoaded',()=>{loadLiveStatus();setInterval(loadLiveStatus,120000);});}

/* ---------- Panel del creador ---------- */
const panel=$('#creador');
const queue=[];   // {kind:'client'|'santa', url, name, title, consent, file}
let presenter=null,pIndex=-1,pOrder=[],pTimer=0,pMusic=true,pNames=true,pLang='es',hideTimer=0;
const baseName=f=>{const words=f.name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').replace(/\b(saludo|video|para|de|santa|final|mp4)\b/gi,' ').replace(/\s+\d+$/,'').trim().split(/\s+/).filter(Boolean);return words.length?words.map(w=>w[0].toUpperCase()+w.slice(1)).join(' '):f.name.replace(/\.[^.]+$/,'');};
function buildCreator(){
  if(!panel)return;
  panel.innerHTML=`<div class="wrap"><div class="section-heading"><div><p class="eyebrow">SOLO PARA TI · CREADOR</p><h2 id="creator-heading">Panel del <em>creador.</em></h2></div><p>Prepara tu en vivo: la cola de saludos de tus clientes, los videos de Santa y el modo presentador para transmitir en TikTok o YouTube.</p></div>
<div class="cr-grid">
<div class="panel cr-card cr-wide"><h3>🎬 Modo presentador</h3><p>Reproduce a pantalla completa los saludos de tus clientes intercalados con videos de Santa, con el cartel «EN VIVO», la cuenta regresiva, la fecha, la hora, el cintillo de noticias y el nombre de cada niño o niña en pantalla.</p><div class="cr-row"><button type="button" class="button" id="cr-start">▶ Abrir modo presentador</button><label class="vc-check"><input type="checkbox" id="cr-music" checked>Música navideña en los videos de Santa</label><label class="vc-check"><input type="checkbox" id="cr-names" checked>Santa lee la lista de los buenos (voz + polvo de estrellas)</label><label>Idioma<select id="cr-lang"><option value="es">Español</option><option value="en">English</option><option value="pt">Português</option></select></label></div>
<details><summary>Cómo transmitirlo en TikTok o YouTube</summary><ol class="cr-steps"><li><strong>TikTok LIVE Studio (PC):</strong> agrega una fuente «Captura de ventana» y elige esta ventana del navegador. Pon el modo presentador en pantalla completa.</li><li><strong>OBS (TikTok con clave de transmisión o YouTube):</strong> agrega «Captura de ventana» o «Navegador», y en «Audio» incluye el sonido del escritorio.</li><li><strong>Desde el celular:</strong> abre el modo presentador y usa «Compartir pantalla» en el en vivo de TikTok, si tu cuenta lo permite.</li><li><strong>YouTube en horizontal:</strong> en OBS agrega una fuente «Navegador» con la dirección de <code>en-vivo-youtube.html</code>, tamaño 1920 × 1080, y marca «Controlar audio mediante OBS». Así salen el video, la voz de Santa y la música sin abrir ventanas.</li><li>Cuando estés en vivo, avísame para activar el cartel «Santa está EN VIVO» en la web con tu usuario de TikTok.</li></ol><p class="fine">TikTok pide requisitos para hacer LIVE (por ejemplo, un mínimo de seguidores y ser mayor de edad).</p></details></div>
<div class="panel cr-card cr-wide cr-share"><h3>📡 Compartir la transmisión en TikTok y YouTube</h3><p>Todo gratis con <strong>OBS Studio</strong>: carga estas páginas a pantalla completa y las envía a tu cuenta. Una página web no puede iniciar un LIVE por sí sola: TikTok y YouTube lo exigen así.</p>
<div class="cr-share-grid">
<div><h4>1 · Abre tus cuentas</h4><div class="cr-row"><a class="button" href="https://www.youtube.com/live_dashboard" target="_blank" rel="noopener noreferrer">▶ YouTube Studio · En vivo</a><a class="button" href="https://www.tiktok.com/studio/download" target="_blank" rel="noopener noreferrer">♪ TikTok LIVE Studio</a><a class="button outline small" href="https://www.tiktok.com/login" target="_blank" rel="noopener noreferrer">Iniciar sesión en TikTok</a></div></div>
<div><h4>2 · Programas gratis</h4><div class="cr-row"><a class="button outline small" href="https://obsproject.com/download" target="_blank" rel="noopener noreferrer">OBS Studio</a><a class="button outline small" href="https://obsproject.com/forum/resources/aitum-vertical.1715/" target="_blank" rel="noopener noreferrer">Plugin vertical + horizontal (Aitum Vertical)</a><a class="button outline small" href="https://obsproject.com/forum/resources/multiple-rtmp-outputs-plugin.964/" target="_blank" rel="noopener noreferrer">Plugin para transmitir a las dos a la vez</a></div></div>
</div>
<h4>3 · Elige qué transmitir y abre la ventana (TikTok LIVE Studio: «Captura de ventana»)</h4>
<div class="cr-pick"><label>¿Qué quieres transmitir?<select id="cr-win-mode"><option value="lista">🔴 Lista de los buenos</option><option value="nochebuena">🎄 Nochebuena (Santa vuela y dice nombres)</option><option value="quiz">🎯 Quiz navideño</option><option value="cuento">📖 Un cuento</option><option value="cuentos">📚 Todos los cuentos seguidos</option><option value="musica">🎵 Música · Laponia</option><option value="tarjetas">🖼 Música · Tarjetas</option><option value="episodio1">🎬 Episodio 1 + lista</option><option value="episodios">🎬 Todos los episodios + lista</option></select></label>
<label class="cr-story" hidden>Cuento<select id="cr-win-story"></select></label><label class="cr-story" hidden>Protagonista <span class="optional">opcional, un niño del chat</span><input id="cr-win-name" maxlength="20" placeholder="Ej. Valentina"></label><label class="cr-story" hidden>Es<select id="cr-win-gender"><option value="girl">Niña</option><option value="boy">Niño</option></select></label></div>
<div class="cr-row"><button type="button" class="button" data-win="v">▯ Abrir vertical 9:16 (TikTok)</button><button type="button" class="button" data-win="h">▭ Abrir horizontal 16:9 (YouTube)</button><button type="button" class="button outline small" id="cr-win-copy">Copiar enlace para OBS</button></div><p class="fine">Se abre una ventana con la medida justa, sin botones encima: la transmisión se ve completa. Toca la ventana una vez para activar el sonido y elige esa ventana en «Captura de ventana».</p>
<h4>Enlaces para OBS (fuente «Navegador»)</h4><div class="cr-links" id="cr-links"></div>
<h4>4 · Avisa en la web que estás en vivo</h4><div class="cr-row"><a class="button green" href="admin.html#transmision" target="_blank" rel="noopener">🔴 Encender «Santa está EN VIVO»</a><button type="button" class="button outline" id="cr-share-live">Compartir el en vivo con las familias</button></div>
<details><summary>Paso a paso en OBS</summary><ol class="cr-steps">
<li><strong>Escena horizontal (YouTube):</strong> en OBS, <em>Ajustes → Video</em>: 1920 × 1080. Agrega una fuente <em>Navegador</em>, pega el enlace horizontal, ancho 1920, alto 1080 y marca <em>Controlar audio mediante OBS</em>.</li>
<li><strong>YouTube:</strong> <em>Ajustes → Emisión → Servicio: YouTube → Conectar cuenta</em> (inicias sesión con tu cuenta de Google). Pulsa <em>Iniciar transmisión</em>.</li>
<li><strong>Vertical (TikTok):</strong> con el plugin Aitum Vertical aparece un segundo lienzo de 1080 × 1920. Agrega ahí otra fuente <em>Navegador</em> con el enlace vertical (ancho 1080, alto 1920).</li>
<li><strong>TikTok:</strong> si tu cuenta tiene clave de transmisión, cópiala (servidor y clave) en el plugin vertical o en <em>Multiple RTMP outputs</em>. Si no la tiene, abre el enlace vertical en TikTok LIVE Studio como <em>Captura de ventana</em> y pon la ventana a pantalla completa.</li>
<li>Así sale <strong>a la vez</strong>: horizontal en YouTube y vertical en TikTok. Luego enciende «Santa está EN VIVO» (paso 4).</li></ol>
<p class="fine">TikTok pide requisitos para hacer LIVE y para dar clave de transmisión (por ejemplo, ser mayor de edad y un mínimo de seguidores). YouTube pide verificar el canal y activar las transmisiones; la primera vez puede tardar hasta 24 horas.</p></details></div>
<div class="panel cr-card"><h3>👧 Saludos de clientes</h3><p>Agrega los videos que preparaste para cada niño o niña. Se quedan en tu dispositivo: no se suben a la web.</p><label class="cr-file">Agregar videos de clientes<input type="file" id="cr-client-files" accept="video/*" multiple></label><ul class="cr-queue" id="cr-client-list"></ul><p class="fine">Solo se muestran en vivo los saludos con la autorización de la familia marcada. En el formulario de pedido, los padres ya pueden dar ese permiso.</p></div>
<div class="panel cr-card"><h3>🎅 Videos de Santa</h3><p>Agrega videos de Santa haciendo actividades para intercalarlos en tu transmisión. Si no agregas ninguno, se usan los del canal de la web.</p><label class="cr-file">Agregar videos de Santa<input type="file" id="cr-santa-files" accept="video/*" multiple></label><ul class="cr-queue" id="cr-santa-list"></ul><p class="fine">Para que también salgan en el canal público «Santa en vivo», guárdalos en la carpeta videos/en-vivo del proyecto y avísame para agregarlos a la lista.</p></div>
<div class="panel cr-card"><h3>🔑 Verificar un código</h3><p>Escribe un código para ver a qué paquete pertenece.</p><form class="ap-code-form" id="cr-check-form"><input id="cr-check" maxlength="20" autocomplete="off" placeholder="Ej. K7Q2M9" aria-label="Código a verificar"><button class="button" type="submit">Verificar</button></form><p class="fine" id="cr-check-status" role="status"></p><p class="fine">Tus 1 500 códigos están en tu PC: <code>C:\\LA ALDEA DE SANTA\\codigos-privados\\codigos-de-acceso.csv</code>. Marca «Entregado» cada vez que des uno.</p></div>
<div class="panel cr-card"><h3>📬 Panel privado</h3><p>Lee las cartas de los niños, revisa los nombres nuevos y gestiona los códigos de acceso.</p><a class="button" href="admin.html" target="_blank" rel="noopener">Abrir el panel privado</a><p class="fine">Pide tu correo y tu contraseña de administrador de Supabase.</p></div>
<div class="panel cr-card"><h3>⚙️ Tu acceso</h3><p>Este dispositivo tiene acceso libre de creador: puedes crear, editar, descargar y compartir todo sin códigos.</p><button type="button" class="button outline small" id="cr-logout">Salir del modo creador en este dispositivo</button></div>
</div></div>`;
  $('#cr-client-files').addEventListener('change',e=>{for(const f of e.target.files)queue.push({kind:'client',file:f,url:URL.createObjectURL(f),name:baseName(f),consent:false});e.target.value='';renderQueue();});
  $('#cr-santa-files').addEventListener('change',e=>{for(const f of e.target.files)queue.push({kind:'santa',file:f,url:URL.createObjectURL(f),title:baseName(f)});e.target.value='';renderQueue();});
  $('#cr-start').addEventListener('click',openPresenter);
  const base=new URL('.',location.href).href;
  const links=[['▭ Horizontal · YouTube (1920 × 1080)','en-vivo-youtube.html?obs=1'],['▯ Vertical · TikTok (1080 × 1920)','en-vivo-vertical.html?obs=1'],['🎬 Todos los episodios + lista · horizontal','en-vivo-youtube.html?modo=episodios&obs=1'],['🎬 Todos los episodios + lista · vertical','en-vivo-vertical.html?modo=episodios&obs=1'],['🎯 Quiz · horizontal','en-vivo-youtube.html?modo=quiz&obs=1'],['🎯 Quiz · vertical','en-vivo-vertical.html?modo=quiz&obs=1'],['📖 Todos los cuentos · horizontal','en-vivo-youtube.html?modo=cuentos&obs=1'],['📖 Todos los cuentos · vertical','en-vivo-vertical.html?modo=cuentos&obs=1'],['🎵 Música · Laponia · horizontal','en-vivo-youtube.html?modo=musica&obs=1'],['🎵 Música · Laponia · vertical','en-vivo-vertical.html?modo=musica&obs=1'],['🖼 Música · Tarjetas · horizontal','en-vivo-youtube.html?modo=tarjetas&obs=1'],['🖼 Música · Tarjetas · vertical','en-vivo-vertical.html?modo=tarjetas&obs=1'],['🎄 Nochebuena (24 y 25) · horizontal','en-vivo-youtube.html?modo=nochebuena&obs=1'],['🎄 Nochebuena (24 y 25) · vertical','en-vivo-vertical.html?modo=nochebuena&obs=1']];
  $('#cr-links').innerHTML=links.map(([l,u])=>`<div class="cr-link"><span>${esc(l)}</span><input readonly value="${esc(base+u)}" aria-label="${esc(l)}"><button type="button" class="button small" data-copy>Copiar</button><a class="button outline small" href="${esc(u.replace(/[?&]obs=1/,''))}" target="_blank" rel="noopener">Ver</a></div>`).join('');
  $('#cr-links').addEventListener('click',async e=>{const b=e.target.closest('[data-copy]');if(!b)return;const inp=b.previousElementSibling;try{await navigator.clipboard.writeText(inp.value);}catch{inp.select();document.execCommand('copy');}pay.toast('Enlace copiado. Pégalo en la fuente «Navegador» de OBS.');});
  /* Selector: qué modo transmitir (y qué cuento) y abrir la ventana exacta en ese modo. */
  const stories=window.SANTA_STORIES||[],audioStories=(cfg.cuentosAudio||[]).filter(c=>c.src);
  $('#cr-win-story').innerHTML=[...audioStories.map((a,i)=>`<option value="a${i}">🔊 ${esc(a.titulo)}</option>`),...stories.map(st=>`<option value="${st.id}">${esc(st.title)}</option>`)].join('');
  const winMode=$('#cr-win-mode');
  winMode.addEventListener('change',()=>{for(const el of $$('.cr-story'))el.hidden=winMode.value!=='cuento';});
  const winUrl=v=>{const m=winMode.value,q=new URLSearchParams({obs:'1',lang:pLang});if(m!=='lista')q.set('modo',m);
    if(m==='cuento'){q.set('cuento',$('#cr-win-story').value);const n=$('#cr-win-name').value.trim();if(n){q.set('nombre',n);q.set('genero',$('#cr-win-gender').value);}}
    return `${v?'en-vivo-vertical':'en-vivo-youtube'}.html?${q}`;};
  for(const b of $$('[data-win]'))b.addEventListener('click',()=>{
    const v=b.dataset.win==='v',sh=screen.availHeight||900,sw=screen.availWidth||1600;
    let h=Math.round(sh*.9),w=Math.round(v?h*9/16:h*16/9);if(w>sw*.95){w=Math.round(sw*.95);h=Math.round(v?w*16/9:w*9/16);}
    window.open(winUrl(v),v?'santa-vertical':'santa-horizontal',`popup=yes,width=${w},height=${h}`);
  });
  $('#cr-win-copy').addEventListener('click',async()=>{const url=new URL(winUrl(false),location.href).href;try{await navigator.clipboard.writeText(url);pay.toast('Enlace horizontal copiado. Para vertical, cambia «en-vivo-youtube» por «en-vivo-vertical».');}catch{prompt('Copia este enlace:',url);}});
  $('#cr-share-live').addEventListener('click',async()=>{const url=new URL('#en-vivo',location.href).href,text=STR.es.shareText;if(navigator.share){try{await navigator.share({title:'Santa en vivo',text,url});return;}catch{}}window.open(`https://wa.me/?text=${encodeURIComponent(text+' '+url)}`,'_blank','noopener');});
  $('#cr-music').addEventListener('change',e=>{pMusic=e.target.checked;});
  $('#cr-names').addEventListener('change',e=>{pNames=e.target.checked;});
  $('#cr-lang').value=lang;pLang=lang;$('#cr-lang').addEventListener('change',e=>{pLang=e.target.value;});
  $('#cr-check-form').addEventListener('submit',async e=>{e.preventDefault();const r=await pay.lookup($('#cr-check').value,{verifyOnly:true});$('#cr-check-status').textContent=r.entry?`✓ Válido · ${r.entry.plan} · descarga: ${r.entry.features.length===4?'videos, cuentos, tarjetas y 30 libros':'videos, cuentos y tarjetas'}`:r.error;});
  $('#cr-logout').addEventListener('click',()=>{pay.clearAccess();location.hash='inicio';pay.toast('Saliste del modo creador en este dispositivo.');});
  for(const id of ['cr-client-list','cr-santa-list'])$('#'+id).addEventListener('click',e=>{
    const b=e.target.closest('[data-q]');if(!b)return;const i=Number(b.dataset.i),q=queue[i];
    if(b.dataset.q==='del'){URL.revokeObjectURL(q.url);queue.splice(i,1);}
    else{const same=queue.map((x,k)=>[x,k]).filter(([x])=>x.kind===q.kind).map(([,k])=>k),pos=same.indexOf(i),to=same[pos+(b.dataset.q==='up'?-1:1)];if(to!==undefined)[queue[i],queue[to]]=[queue[to],queue[i]];}
    renderQueue();
  });
  for(const id of ['cr-client-list','cr-santa-list'])$('#'+id).addEventListener('input',e=>{const el=e.target,i=Number(el.dataset.i);if(el.dataset.f==='name')queue[i].name=el.value;if(el.dataset.f==='title')queue[i].title=el.value;if(el.dataset.f==='consent')queue[i].consent=el.checked;});
}
function renderQueue(){
  const row=(q,i)=>`<li><div class="cr-q-main">${q.kind==='client'?`<input data-f="name" data-i="${i}" value="${esc(q.name)}" maxlength="40" aria-label="Nombre del niño o niña"><label class="vc-check"><input type="checkbox" data-f="consent" data-i="${i}" ${q.consent?'checked':''}>La familia autorizó mostrarlo en vivo</label>`:`<input data-f="title" data-i="${i}" value="${esc(q.title)}" maxlength="70" aria-label="Título del video de Santa">`}</div><div class="cr-q-actions"><button type="button" data-q="up" data-i="${i}" aria-label="Subir">↑</button><button type="button" data-q="down" data-i="${i}" aria-label="Bajar">↓</button><button type="button" data-q="del" data-i="${i}" aria-label="Quitar">✕</button></div></li>`;
  $('#cr-client-list').innerHTML=queue.map((q,i)=>q.kind==='client'?row(q,i):'').join('')||'<li class="cr-empty">Todavía no agregaste saludos.</li>';
  $('#cr-santa-list').innerHTML=queue.map((q,i)=>q.kind==='santa'?row(q,i):'').join('')||'<li class="cr-empty">Se usarán los videos del canal de la web.</li>';
}

/* Orden del presentador: saludo de cliente, video de Santa, saludo, Santa… y luego Santa en bucle. */
function buildOrder(){
  const clients=queue.filter(q=>q.kind==='client'&&q.consent);
  const santas=queue.filter(q=>q.kind==='santa').map(q=>({kind:'santa',src:q.url,title:q.title,span:null}));
  const pool=santas.length?santas:items.map(i=>({kind:'santa',src:i.src,title:i['title_'+pLang]||i.title,span:i.span}));
  const order=[];let s=0;
  for(const c of clients){order.push({kind:'client',src:c.url,name:c.name});if(pool.length)order.push(pool[s++%pool.length]);}
  if(!order.length)order.push(...pool);
  return {order,pool};
}
const P_TXT={es:{special:'Saludo especial de Santa para',now:'Ahora en la aldea',upcoming:'Próximos saludos:',chat:'¡Escribe en el chat el nombre de tu niño o niña para Santa! 🎅'},en:{special:'A special greeting from Santa for',now:'Now in the village',upcoming:'Coming up:',chat:"Write your child's name in the chat for Santa! 🎅"},pt:{special:'Saudação especial do Papai Noel para',now:'Agora na vila',upcoming:'Próximas saudações:',chat:'Escreva no chat o nome da criança para o Papai Noel! 🎅'}};
function openPresenter(){
  const skipped=queue.filter(q=>q.kind==='client'&&!q.consent).length;
  const built=buildOrder();if(!built.order.length){pay.toast('Agrega al menos un video para empezar.');return;}
  pOrder=built.order;const pool=built.pool;pIndex=-1;const PT=P_TXT[pLang];
  presenter=document.createElement('div');presenter.className='live-presenter';presenter.setAttribute('role','dialog');presenter.setAttribute('aria-label','Modo presentador');
  presenter.innerHTML=`<video id="lp-video" playsinline autoplay></video><canvas class="lp-sky" width="1080" height="1920" aria-hidden="true"></canvas><span class="live-badge"><i></i>${esc(STR[pLang].live)}</span><span class="lp-brand">La aldea de Santa</span><span class="lp-clock" id="lp-clock"></span><div class="lp-lower" id="lp-lower"><small id="lp-kicker"></small><strong id="lp-title"></strong></div>
<div class="lp-controls"><button type="button" data-lp="prev">⏮ Anterior</button><button type="button" data-lp="pause">⏯ Pausa</button><button type="button" data-lp="next">Siguiente ⏭</button><button type="button" data-lp="full">⛶ Pantalla completa</button><button type="button" data-lp="exit">✕ Salir</button></div>`;
  document.body.append(presenter);document.body.classList.add('modal-open');
  const v=presenter.querySelector('video');
  const pOverlay=mountOverlay(presenter,()=>pLang);
  const clock=setInterval(()=>{$('#lp-clock').textContent=new Date().toLocaleTimeString(STR[pLang].loc,{hour:'2-digit',minute:'2-digit',second:'2-digit'});pOverlay.tick();},1000);
  /* Durante los videos de Santa, Santa lee la lista de los buenos con voz y polvo de estrellas. */
  const pNamer=pNames&&window.ALDEA_LIVE_NAMES?window.ALDEA_LIVE_NAMES.create({canvas:presenter.querySelector('.lp-sky'),onName:n=>pOverlay.addName(n),onSpeak:duckFor}):null;
  pNamer?.setLang(pLang);pNamer?.setSound(true);
  const advance=()=>{pIndex++;if(pIndex>=pOrder.length){pOrder=pool.slice();pIndex=0;}playItem();};
  function playItem(){
    clearTimeout(pTimer);const it=pOrder[pIndex];
    const silentSanta=it.kind==='santa'&&!!pNamer; // la voz de la lista no se cruza con el audio del video
    v.loop=it.kind==='santa'&&!!it.span;v.muted=silentSanta;v.src=it.src;v.play().catch(()=>{v.muted=true;v.play().catch(()=>{});});
    if(it.kind==='santa'&&it.span)pTimer=setTimeout(advance,it.span*1000);
    $('#lp-kicker').textContent=it.kind==='client'?PT.special:PT.now;
    $('#lp-title').textContent=it.kind==='client'?it.name:it.title;
    presenter.dataset.kind=it.kind;
    if(it.kind==='santa'&&pMusic&&liveMusic.length){bgBase=.5;bgPlay();v.volume=pNamer?.25:.5;}else{bgStop();v.volume=1;}
    if(it.kind==='santa')pNamer?.start();else pNamer?.stop();
    $('#lp-lower').hidden=it.kind==='santa'&&!!pNamer;
    const upcoming=pOrder.slice(pIndex+1).filter(x=>x.kind==='client').map(x=>x.name);
    pOverlay.setExtra(upcoming.length?`${PT.upcoming} ${upcoming.join(' · ')}`:PT.chat);
  }
  v.addEventListener('ended',advance);
  const close=()=>{pNamer?.stop();clearInterval(clock);pOverlay.destroy();clearTimeout(pTimer);clearTimeout(hideTimer);bgStop();v.pause();presenter.remove();presenter=null;document.body.classList.remove('modal-open');if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});document.removeEventListener('keydown',keys);};
  presenter.addEventListener('click',e=>{const b=e.target.closest('[data-lp]');if(!b)return;const a=b.dataset.lp;
    if(a==='next')advance();else if(a==='prev'){pIndex=Math.max(-1,pIndex-2);advance();}else if(a==='pause'){if(v.paused)v.play();else v.pause();}else if(a==='full')(presenter.requestFullscreen||presenter.webkitRequestFullscreen)?.call(presenter);else if(a==='exit')close();});
  const showControls=()=>{presenter.classList.add('show-controls');clearTimeout(hideTimer);hideTimer=setTimeout(()=>presenter?.classList.remove('show-controls'),2500);};
  presenter.addEventListener('mousemove',showControls);presenter.addEventListener('touchstart',showControls,{passive:true});
  const keys=e=>{if(e.key==='Escape'&&!document.fullscreenElement)close();if(e.key==='ArrowRight')advance();if(e.key===' '){e.preventDefault();if(v.paused)v.play();else v.pause();}};
  document.addEventListener('keydown',keys);
  stopChannel();showControls();advance();
  if(skipped)pay.toast(`${skipped} saludo(s) sin autorización no se mostrarán.`);
}

/* ---------- Arranque ---------- */
buildChannel();buildCreator();liveBanner();
if(panel)renderQueue();
window.addEventListener('aldea:navigate',e=>{const page=e.detail.page;pageOn=page==='en-vivo';if(!root)return;if(pageOn)setFmt(fmt);else{stopChannel();const f=$('#live-h-frame');if(f){f.removeAttribute('src');f.src='about:blank';}if(vShow)setShow(null);}});
})();
