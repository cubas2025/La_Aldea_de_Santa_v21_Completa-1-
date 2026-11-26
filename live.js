(() => {
'use strict';
/* Canal «Santa en vivo» (público) y panel del creador (modo presentador para transmitir). */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const cfg=window.ALDEA_LIVE||{playlist:[]}, pay=window.ALDEA_PAY, music=window.SANTA_MUSIC||[];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const items=cfg.playlist.filter(i=>i.src&&i.duration>0).map(i=>({...i,repeat:Math.max(1,i.repeat||1),span:i.duration*Math.max(1,i.repeat||1)}));
const total=items.reduce((s,i)=>s+i.span,0);
const tiktokUrl=cfg.tiktokUser?`https://www.tiktok.com/@${encodeURIComponent(cfg.tiktokUser.replace(/^@/,''))}/live`:'';

/* Posición del canal según la hora: todos los visitantes ven lo mismo al mismo tiempo. */
function channelAt(ms=Date.now()){
  let t=(ms/1000)%total;
  for(let i=0;i<items.length;i++){if(t<items[i].span)return {index:i,item:items[i],offset:t%items[i].duration,left:items[i].span-t};t-=items[i].span;}
  return {index:0,item:items[0],offset:0,left:items[0].span};
}

/* ---------- Canal público ---------- */
const root=$('#en-vivo');
let channelTimer=0,current=-1,soundOn=false,bgIndex=0;
const bg=new Audio();bg.preload='none';bg.volume=.35;
bg.addEventListener('ended',()=>{bgIndex=(bgIndex+1)%music.length;playBg();});
function playBg(){if(!soundOn||!music.length)return;bg.src=music[bgIndex].src;bg.play().catch(()=>{});}
function buildChannel(){
  if(!root)return;
  root.innerHTML=`<div class="wrap"><div class="section-heading"><div><p class="eyebrow">DESDE EL POLO NORTE · AHORA MISMO</p><h2 id="live-heading">Santa <em>en vivo.</em></h2></div><p>Mira a Santa en su aldea a cualquier hora. Cuando Santa transmite en TikTok, aquí aparece el botón para entrar a su en vivo y saludarlo.</p></div>
<div class="live-layout"><div class="live-player" id="live-player"><video id="live-video" muted playsinline autoplay loop preload="auto" aria-label="Canal en vivo de Santa"></video><canvas id="live-sky" class="live-sky" width="1080" height="1920" aria-hidden="true"></canvas><p class="sr-only" id="live-name-said" aria-live="polite"></p><span class="live-badge"><i></i>EN VIVO</span><span class="live-clock" id="live-clock"></span><div class="live-lower"><small>Ahora en la aldea</small><strong id="live-now"></strong></div></div>
<div class="live-side panel"><div class="live-tiktok" id="live-tiktok" hidden><span class="live-badge static"><i></i>EN VIVO EN TIKTOK</span><p>Santa está transmitiendo ahora mismo. ¡Entra, salúdalo y escribe el nombre de tu niño o niña en el chat!</p><a class="button" id="live-tiktok-link" target="_blank" rel="noopener noreferrer">Ver a Santa en TikTok LIVE</a></div>
<div class="live-buttons"><button type="button" class="button" id="live-sound">🔊 Activar sonido</button><button type="button" class="button outline" id="live-full">⛶ Pantalla completa</button></div>
<div class="live-list"><strong id="live-list-count">✨ Santa ya leyó 0 nombres hoy</strong><span id="live-list-source"></span><button type="button" class="button green small" id="live-add-name">¿Quieres que Santa diga tu nombre? Escríbelo aquí</button></div>
<h3>A continuación</h3><ol class="live-next" id="live-next"></ol>
<div class="notice live-ask"><strong>¿Quieres que Santa salude a tu niño o niña en el en vivo?</strong><p>Pide su saludo personalizado. Con tu autorización, Santa puede mostrarlo durante la transmisión.</p><a class="button green small" href="#pedido">Pedir su saludo</a></div></div></div>
${cfg.youtubeLiveId?`<div class="live-youtube"><h3>Directo en YouTube</h3><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(cfg.youtubeLiveId)}" title="Directo de Santa en YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`:''}</div>`;
  root.querySelector('.wrap').append(pay.shareBar({heading:'Invita a tu familia a ver a Santa en vivo',text:'🎅🔴 Santa está en vivo desde el Polo Norte. ¡Míralo aquí!',hash:'#en-vivo'}));
  if(cfg.liveNow&&tiktokUrl){$('#live-tiktok').hidden=false;$('#live-tiktok-link').href=tiktokUrl;}
  $('#live-sound').addEventListener('click',()=>{soundOn=!soundOn;$('#live-sound').textContent=soundOn?'🔇 Silenciar':'🔊 Activar sonido · Santa lee los nombres';$('#live-video').muted=!soundOn;namer?.setSound(soundOn);if(soundOn)playBg();else bg.pause();});
  $('#live-sound').textContent='🔊 Activar sonido · Santa lee los nombres';
  $('#live-add-name').addEventListener('click',()=>{const chip=$('#kid-chip');if(chip)chip.click();else location.hash='gratis';});
  if(window.ALDEA_LIVE_NAMES)namer=window.ALDEA_LIVE_NAMES.create({canvas:$('#live-sky'),onName:(name)=>{$('#live-name-said').textContent=`Santa nombra a ${name}`;updateListInfo();}});
  $('#live-full').addEventListener('click',()=>{const p=$('#live-player');(p.requestFullscreen||p.webkitRequestFullscreen)?.call(p);});
}
function syncChannel(){
  const v=$('#live-video');if(!v||!items.length)return;
  const pos=channelAt();
  if(pos.index!==current){current=pos.index;v.src=pos.item.src;v.addEventListener('loadedmetadata',()=>{v.currentTime=channelAt().offset;v.play().catch(()=>{});},{once:true});
    $('#live-now').textContent=pos.item.title;
    const next=[];for(let k=1;k<=4;k++)next.push(items[(pos.index+k)%items.length].title);
    $('#live-next').innerHTML=next.map(t=>`<li>${esc(t)}</li>`).join('');
  }else if(v.readyState>=2&&Math.abs(v.currentTime-pos.offset)>1.5&&pos.offset>.5&&pos.offset<pos.item.duration-.5){v.currentTime=pos.offset;}
  if(v.paused&&v.readyState>=2)v.play().catch(()=>{});
  $('#live-clock').textContent=new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'});
}
let namer=null;
function updateListInfo(){
  const n=window.ALDEA_LIVE_NAMES;if(!n)return;
  const c=$('#live-list-count'),s=$('#live-list-source');
  if(c)c.textContent=`✨ Santa ya leyó ${n.namesToday().toLocaleString('es-PE')} nombres hoy`;
  if(s)s.textContent=n.count?(n.source==='aprobados'?(n.count===1?'1 nombre en la lista de hoy':`${n.count.toLocaleString('es-PE')} niños y niñas en la lista de hoy`):`${n.count.toLocaleString('es-PE')} nombres en la lista de los buenos`):'';
}
window.addEventListener('aldea:live-names',updateListInfo);
function startChannel(){if(channelTimer||!items.length)return;current=-1;syncChannel();channelTimer=setInterval(syncChannel,1000);bg.volume=.2;namer?.start();updateListInfo();}
function stopChannel(){clearInterval(channelTimer);channelTimer=0;const v=$('#live-video');if(v){v.pause();}bg.pause();namer?.stop();}

/* Cartel global cuando Santa está en vivo en TikTok */
function liveBanner(){
  if(!(cfg.liveNow&&tiktokUrl))return;
  const b=document.createElement('a');b.className='live-banner';b.href=tiktokUrl;b.target='_blank';b.rel='noopener noreferrer';
  b.innerHTML='<i></i><strong>Santa está EN VIVO en TikTok</strong><span>Entrar ahora →</span>';
  document.body.prepend(b);
}

/* ---------- Panel del creador ---------- */
const panel=$('#creador');
const queue=[];   // {kind:'client'|'santa', url, name, title, consent, file}
let presenter=null,pIndex=-1,pOrder=[],pTimer=0,pMusic=true,pNames=true,hideTimer=0;
const baseName=f=>{const words=f.name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').replace(/\b(saludo|video|para|de|santa|final|mp4)\b/gi,' ').replace(/\s+\d+$/,'').trim().split(/\s+/).filter(Boolean);return words.length?words.map(w=>w[0].toUpperCase()+w.slice(1)).join(' '):f.name.replace(/\.[^.]+$/,'');};
function buildCreator(){
  if(!panel)return;
  panel.innerHTML=`<div class="wrap"><div class="section-heading"><div><p class="eyebrow">SOLO PARA TI · CREADOR</p><h2 id="creator-heading">Panel del <em>creador.</em></h2></div><p>Prepara tu en vivo: la cola de saludos de tus clientes, los videos de Santa y el modo presentador para transmitir en TikTok o YouTube.</p></div>
<div class="cr-grid">
<div class="panel cr-card cr-wide"><h3>🎬 Modo presentador</h3><p>Reproduce a pantalla completa los saludos de tus clientes intercalados con videos de Santa, con el cartel «EN VIVO» y el nombre de cada niño o niña en pantalla.</p><div class="cr-row"><button type="button" class="button" id="cr-start">▶ Abrir modo presentador</button><label class="vc-check"><input type="checkbox" id="cr-music" checked>Música navideña en los videos de Santa</label><label class="vc-check"><input type="checkbox" id="cr-names" checked>Santa lee la lista de los buenos (voz + polvo de estrellas)</label></div>
<details><summary>Cómo transmitirlo en TikTok o YouTube</summary><ol class="cr-steps"><li><strong>TikTok LIVE Studio (PC):</strong> agrega una fuente «Captura de ventana» y elige esta ventana del navegador. Pon el modo presentador en pantalla completa.</li><li><strong>OBS (TikTok con clave de transmisión o YouTube):</strong> agrega «Captura de ventana» o «Navegador», y en «Audio» incluye el sonido del escritorio.</li><li><strong>Desde el celular:</strong> abre el modo presentador y usa «Compartir pantalla» en el en vivo de TikTok, si tu cuenta lo permite.</li><li>Cuando estés en vivo, avísame para activar el cartel «Santa está EN VIVO» en la web con tu usuario de TikTok.</li></ol><p class="fine">TikTok pide requisitos para hacer LIVE (por ejemplo, un mínimo de seguidores y ser mayor de edad).</p></details></div>
<div class="panel cr-card"><h3>👧 Saludos de clientes</h3><p>Agrega los videos que preparaste para cada niño o niña. Se quedan en tu dispositivo: no se suben a la web.</p><label class="cr-file">Agregar videos de clientes<input type="file" id="cr-client-files" accept="video/*" multiple></label><ul class="cr-queue" id="cr-client-list"></ul><p class="fine">Solo se muestran en vivo los saludos con la autorización de la familia marcada. En el formulario de pedido, los padres ya pueden dar ese permiso.</p></div>
<div class="panel cr-card"><h3>🎅 Videos de Santa</h3><p>Agrega videos de Santa haciendo actividades para intercalarlos en tu transmisión. Si no agregas ninguno, se usan los del canal de la web.</p><label class="cr-file">Agregar videos de Santa<input type="file" id="cr-santa-files" accept="video/*" multiple></label><ul class="cr-queue" id="cr-santa-list"></ul><p class="fine">Para que también salgan en el canal público «Santa en vivo», guárdalos en la carpeta videos/en-vivo del proyecto y avísame para agregarlos a la lista.</p></div>
<div class="panel cr-card"><h3>🔑 Verificar un código</h3><p>Escribe un código para ver a qué paquete pertenece.</p><form class="ap-code-form" id="cr-check-form"><input id="cr-check" maxlength="20" autocomplete="off" placeholder="Ej. K7Q2M9" aria-label="Código a verificar"><button class="button" type="submit">Verificar</button></form><p class="fine" id="cr-check-status" role="status"></p><p class="fine">Tus 1 500 códigos están en tu PC: <code>C:\\LA ALDEA DE SANTA\\codigos-privados\\codigos-de-acceso.csv</code>. Marca «Entregado» cada vez que des uno.</p></div>
<div class="panel cr-card"><h3>📬 Panel privado</h3><p>Lee las cartas de los niños, revisa los nombres nuevos y gestiona los códigos de acceso.</p><a class="button" href="admin.html" target="_blank" rel="noopener">Abrir el panel privado</a><p class="fine">Pide tu correo y tu contraseña de administrador de Supabase.</p></div>
<div class="panel cr-card"><h3>⚙️ Tu acceso</h3><p>Este dispositivo tiene acceso libre de creador: puedes crear, editar, descargar y compartir todo sin códigos.</p><button type="button" class="button outline small" id="cr-logout">Salir del modo creador en este dispositivo</button></div>
</div></div>`;
  $('#cr-client-files').addEventListener('change',e=>{for(const f of e.target.files)queue.push({kind:'client',file:f,url:URL.createObjectURL(f),name:baseName(f),consent:false});e.target.value='';renderQueue();});
  $('#cr-santa-files').addEventListener('change',e=>{for(const f of e.target.files)queue.push({kind:'santa',file:f,url:URL.createObjectURL(f),title:baseName(f)});e.target.value='';renderQueue();});
  $('#cr-start').addEventListener('click',openPresenter);
  $('#cr-music').addEventListener('change',e=>{pMusic=e.target.checked;});
  $('#cr-names').addEventListener('change',e=>{pNames=e.target.checked;});
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
  const pool=santas.length?santas:items.map(i=>({kind:'santa',src:i.src,title:i.title,span:i.span}));
  const order=[];let s=0;
  for(const c of clients){order.push({kind:'client',src:c.url,name:c.name});if(pool.length)order.push(pool[s++%pool.length]);}
  if(!order.length)order.push(...pool);
  return {order,pool};
}
function openPresenter(){
  const skipped=queue.filter(q=>q.kind==='client'&&!q.consent).length;
  const built=buildOrder();if(!built.order.length){pay.toast('Agrega al menos un video para empezar.');return;}
  pOrder=built.order;const pool=built.pool;pIndex=-1;
  presenter=document.createElement('div');presenter.className='live-presenter';presenter.setAttribute('role','dialog');presenter.setAttribute('aria-label','Modo presentador');
  presenter.innerHTML=`<video id="lp-video" playsinline autoplay></video><canvas class="lp-sky" width="1080" height="1920" aria-hidden="true"></canvas><span class="live-badge"><i></i>EN VIVO</span><span class="lp-brand">La aldea de Santa</span><div class="lp-lower" id="lp-lower"><small id="lp-kicker"></small><strong id="lp-title"></strong></div><div class="lp-ticker" id="lp-ticker"></div>
<div class="lp-controls"><button type="button" data-lp="prev">⏮ Anterior</button><button type="button" data-lp="pause">⏯ Pausa</button><button type="button" data-lp="next">Siguiente ⏭</button><button type="button" data-lp="full">⛶ Pantalla completa</button><button type="button" data-lp="exit">✕ Salir</button></div>`;
  document.body.append(presenter);document.body.classList.add('modal-open');
  const v=presenter.querySelector('video');
  /* Durante los videos de Santa, Santa lee la lista de los buenos con voz y polvo de estrellas. */
  const pNamer=pNames&&window.ALDEA_LIVE_NAMES?window.ALDEA_LIVE_NAMES.create({canvas:presenter.querySelector('.lp-sky')}):null;
  pNamer?.setSound(true);
  const advance=()=>{pIndex++;if(pIndex>=pOrder.length){pOrder=pool.slice();pIndex=0;}playItem();};
  function playItem(){
    clearTimeout(pTimer);const it=pOrder[pIndex];
    v.loop=it.kind==='santa'&&!!it.span;v.muted=false;v.src=it.src;v.play().catch(()=>{v.muted=true;v.play().catch(()=>{});});
    if(it.kind==='santa'&&it.span)pTimer=setTimeout(advance,it.span*1000);
    $('#lp-kicker').textContent=it.kind==='client'?'Saludo especial de Santa para':'Ahora en la aldea';
    $('#lp-title').textContent=it.kind==='client'?it.name:it.title;
    presenter.dataset.kind=it.kind;
    if(it.kind==='santa'&&pMusic&&music.length){bg.src=music[bgIndex%music.length].src;bg.volume=pNamer?.2:.35;bg.play().catch(()=>{});v.volume=pNamer?.25:.5;}else{bg.pause();v.volume=1;}
    if(it.kind==='santa')pNamer?.start();else pNamer?.stop();
    $('#lp-lower').hidden=it.kind==='santa'&&!!pNamer;
    const upcoming=pOrder.slice(pIndex+1).filter(x=>x.kind==='client').map(x=>x.name);
    $('#lp-ticker').textContent=upcoming.length?`Próximos saludos: ${upcoming.join(' · ')}`:'¡Escribe en el chat el nombre de tu niño o niña para Santa! 🎅';
  }
  v.addEventListener('ended',advance);
  const close=()=>{pNamer?.stop();clearTimeout(pTimer);clearTimeout(hideTimer);bg.pause();v.pause();presenter.remove();presenter=null;document.body.classList.remove('modal-open');if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});document.removeEventListener('keydown',keys);};
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
window.addEventListener('aldea:navigate',e=>{const page=e.detail.page;if(page==='en-vivo')startChannel();else stopChannel();});
})();
