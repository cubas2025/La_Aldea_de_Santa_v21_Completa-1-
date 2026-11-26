(() => {
  'use strict';
  const $ = s => document.querySelector(s), designs = window.SANTA_CHRISTMAS_CARDS;
  const canvas = $('#nc-canvas'), ctx = canvas.getContext('2d');
  const form = $('#nc-form'), select = $('#nc-design'), name = $('#nc-name'), phrase = $('#nc-phrase');
  const status = $('#nc-export-status'), progress = $('#nc-progress');
  const musicSelect = $('#nc-music'), musicPreview = $('#nc-music-preview');
  const tracks = window.SANTA_MUSIC;
  const selectedMusic = () => tracks.find(track => track.id === musicSelect.value);
  function musicState() {
    musicPreview.pause();
    const track = selectedMusic();
    musicPreview.hidden = !track;
    if (track) { musicPreview.src = track.src; musicPreview.setAttribute('aria-label', `Escuchar ${track.title}`); }
    else musicPreview.removeAttribute('src');
    $('#nc-music-help').textContent = track ? `${track.title}. Tu video de 15 segundos usa la parte más alegre de esta canción. Cada paisaje trae su propia música; puedes cambiarla.` : 'El video durará 15 segundos y se descargará sin sonido.';
  }
  const CLIP = 15;
  /* Título automático para compartir: cuenta regresiva + hashtags de la aldea. */
  function countdownTag(d = dateState()) {
    if (d.christmas) return '#feliznavidad';
    if (d.days === 0) return '#esnochebuena';
    return d.days === 1 ? '#falta1dia' : `#faltan${d.days}dias`;
  }
  function caption() {
    const d = dateState(), recipient = personal ? name.value.trim() : '';
    const head = d.christmas ? '🎄 ¡Feliz Navidad desde La aldea de Santa! ✨' : `🎄 ${countdownTag(d)} para Navidad ✨${recipient ? ` Para ${recipient}.` : ''}`;
    return `${head}\n${d.christmas ? '#feliznavidad ' : ''}#cubas.ai #laaldeadesanta #cubasai #navidad #santaclaus #fyp`;
  }
  function trackFor(index) { return tracks[index % tracks.length]; }
  function setDesignMusic(index) { musicSelect.value = trackFor(index).id; musicState(); }
  const serif = '"Cormorant Garamond", Georgia, serif', sans = '"DM Sans", Arial, sans-serif';
  let personal = false, automatic = true, currentDay = '', active = 0, renderVersion = 0;
  let ready = false, exporting = false, exportJob = 0, engine = null, enginePromise = null;
  let videoBlob = null, videoURL = '', videoName = '', fileBase = '', phraseIndex = 0;
  const images = new Map();
  function dateState(now = new Date()) {
    const christmas = now.getMonth() === 11 && now.getDate() === 25;
    const year = now.getFullYear() + (now.getMonth() === 11 && now.getDate() > 25 ? 1 : 0);
    const target = new Date(year, 11, 25);
    const seconds = christmas ? 0 : Math.max(0, Math.ceil((target - now) / 1000));
    const civilDay = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    return { christmas, year, days: Math.floor(seconds / 86400), hours: Math.floor(seconds % 86400 / 3600), minutes: Math.floor(seconds % 3600 / 60), seconds: seconds % 60, key: `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`, civilDay, date: now.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) };
  }
  function image(src) {
    if (!images.has(src)) {
      if (images.size >= 4) images.delete(images.keys().next().value);
      images.set(src, new Promise((resolve, reject) => {
      const im = new Image(); im.onload = () => resolve(im); im.onerror = () => { images.delete(src); reject(new Error('No se pudo cargar este paisaje. Selecciona otro o vuelve a intentarlo.')); }; im.src = src;
      }));
    }
    return images.get(src);
  }
  function fitText(text, y, size, maxWidth, color, font = serif) {
    ctx.font = `700 ${size}px ${font}`;
    while (ctx.measureText(text).width > maxWidth && size > 26) ctx.font = `700 ${--size}px ${font}`;
    ctx.fillStyle = color; ctx.fillText(text, 540, y);
  }
  function wrapText(text, y, size, maxWidth) {
    ctx.font = `600 ${size}px ${serif}`;
    const words = text.split(/\s+/), lines = []; let line = '';
    for (const word of words) { const next = line ? `${line} ${word}` : word; if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next; }
    if (line) lines.push(line);
    lines.forEach((line, i) => ctx.fillText(line, 540, y + i * size * 1.15));
    return lines.length;
  }
  function star(x, y, radius, color) {
    ctx.save(); ctx.translate(x, y); ctx.beginPath();
    for (let i = 0; i < 8; i++) { const r = i % 2 ? radius / 4 : radius; const a = i * Math.PI / 4; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.restore();
  }
  function invalidateVideo() {
    window.SANTA_VIDEO_SHARE.update('nc',null,'');
    videoBlob = null; $('#nc-share').disabled = true;
    $('#nc-result').pause(); $('#nc-result').hidden = true; $('#nc-result').removeAttribute('src');
    if (videoURL) URL.revokeObjectURL(videoURL); videoURL = '';
    status.textContent = 'Video vertical 9:16 · 720 × 1280 · 15 segundos con música.';
    shareLabel('Compartir video');
    const cap = $('#nc-caption'); if (cap) cap.value = caption();
  }
  function shareLabel(text) { const b = $('#nc-share'); if (b) b.textContent = text; }
  function liveLabel(d) {
    return d.christmas ? '¡Hoy es Navidad! Que tu día se llene de amor.' : `Faltan ${d.days} días, ${d.hours} horas, ${d.minutes} minutos y ${d.seconds} segundos para Navidad.`;
  }
  async function render() {
    const version = ++renderVersion; ready = false; $('#nc-loading').hidden = false;
    $('#nc-loading').textContent = 'Preparando tu paisaje…';
    try {
      await document.fonts.ready;
      const im = await image(designs[active].image);
      if (version !== renderVersion) return;
      const d = dateState(), design = designs[active], accent = design.accent;
      ctx.clearRect(0, 0, 1080, 1920);
      const scale = Math.max(1080 / im.width, 1920 / im.height);
      ctx.drawImage(im, (1080 - im.width * scale) / 2, (1920 - im.height * scale) / 2, im.width * scale, im.height * scale);
      const shade = ctx.createLinearGradient(0, 0, 0, 1920);
      shade.addColorStop(0, 'rgba(4,15,35,.40)'); shade.addColorStop(.16, 'rgba(4,15,35,.56)'); shade.addColorStop(.49, 'rgba(4,15,35,.63)'); shade.addColorStop(.64, 'rgba(4,15,35,0)'); shade.addColorStop(1, 'rgba(4,15,35,.17)');
      ctx.fillStyle = shade; ctx.fillRect(0, 0, 1080, 1920);
      ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.globalAlpha = .85;
      ctx.strokeRect(42, 45, 996, 1830);
      if (design.frame % 2 === 0) { ctx.lineWidth = 1; ctx.strokeRect(52, 55, 976, 1810); }
      ctx.globalAlpha = 1;
      for (const [x, y, r] of [[110,110,15],[970,110,15],[110,1810,12],[970,1810,12]]) star(x,y,r,accent);
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.shadowColor = '#081326'; ctx.shadowBlur = 14;
      fitText('La aldea de Santa', 160, 48, 830, accent);
      star(540, 220, 27, accent); star(460, 220, 8, accent); star(620, 220, 8, accent);
      if (d.christmas) {
        fitText('¡Feliz', 400, 126, 850, accent);
        fitText('Navidad!', 535, 146, 850, accent);
      } else {
        fitText(d.days === 1 ? 'Falta' : 'Faltan', 315, 68, 800, '#fff8e9');
        const gold = ctx.createLinearGradient(0, 340, 0, 540);
        gold.addColorStop(0, '#fff6d7'); gold.addColorStop(.5, accent); gold.addColorStop(1, '#dca442');
        fitText(String(d.days), 510, 220, 800, gold);
        fitText(d.days === 1 ? 'día para Navidad' : 'días para Navidad', 640, 76, 860, '#fff8e9');
        fitText(`${String(d.hours).padStart(2,'0')} h  ·  ${String(d.minutes).padStart(2,'0')} min  ·  ${String(d.seconds).padStart(2,'0')} s`, 705, 30, 800, '#fff8e9', sans);
      }
      const recipient = personal ? name.value.trim() : '';
      const messageY = recipient ? 867 : 815;
      if (recipient) fitText(`Para ${recipient}`, 800, 76, 820, accent);
      ctx.fillStyle = '#fff8e9'; wrapText(phrase.value.trim() || design.phrase, messageY, 43, 790);
      ctx.shadowBlur = 3;
      fitText(`25 de diciembre de ${d.year}`, 1725, 31, 800, '#ffffff', sans);
      fitText('Vive la magia de la Navidad', 1780, 44, 830, '#fff4cd');
      ctx.shadowBlur = 0;
      canvas.setAttribute('aria-label', `${design.title}. ${liveLabel(d)} ${recipient ? `Para ${recipient}. ` : ''}${phrase.value.trim()}`);
      $('#nc-live').textContent = liveLabel(d);
      fileBase = `navidad-${d.year}-${design.id}${recipient ? '-'+recipient.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9-]/g,'-') : ''}`;
      ready = true; $('#nc-loading').hidden = true;
    } catch (err) { if (version === renderVersion) $('#nc-loading').textContent = err.message; }
  }
  function gallerySelection() {
    for (const button of $('#nc-gallery').querySelectorAll('button')) button.setAttribute('aria-pressed', String(Number(button.dataset.design) === active));
    select.value = String(active);
  }
  function choose(index, updatePhrase = true) {
    active = index; if (updatePhrase) phrase.value = designs[index].phrase;
    setDesignMusic(index); gallerySelection(); invalidateVideo(); render();
  }
  function setMode(useName) {
    personal = useName; automatic = !useName;
    $('#nc-auto').setAttribute('aria-pressed', String(!useName)); $('#nc-personal').setAttribute('aria-pressed', String(useName));
    $('#nc-name-label').hidden = !useName; name.required = useName;
    $('#nc-mode-help').textContent = useName ? 'Escribe un nombre y elige el paisaje y la frase que más te gusten.' : 'El diseño y la frase cambian cada día. Puedes elegir otro paisaje cuando quieras.';
    if (useName) name.focus(); else { const d = dateState(); active = ((d.civilDay % 25) + 25) % 25; phrase.value = designs[active].phrase; setDesignMusic(active); gallerySelection(); }
    invalidateVideo(); render();
  }
  function save(blob, filename) {
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  function canvasBlob(type = 'image/png', quality) { return new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('No se pudo preparar la imagen.')), type, quality)); }
  function valid() { if (personal && !name.value.trim()) { name.value = ''; name.reportValidity(); return false; } return form.reportValidity(); }
  function lock(value) {
    exporting = value;
    for (const node of form.querySelectorAll('input,select,textarea,button')) node.disabled = value;
    for (const node of $('#nc-gallery').querySelectorAll('button')) node.disabled = value;
    $('#nc-video').disabled = value; $('#nc-image').disabled = value;
    $('#nc-share').disabled = value;
    $('#nc-cancel').hidden = !value; progress.hidden = !value;
  }
  async function getEngine(job) {
    if (!enginePromise) enginePromise = (async () => {
      const { FFmpeg } = await import('./vendor/ffmpeg/index.js');
      if (job !== exportJob) throw new Error('Cancelado');
      const instance = new FFmpeg(); engine = instance;
      const chunks = await Promise.all([1,2].map(async n => { const response = await fetch(`vendor/ffmpeg/core-${n}.bin`); if (!response.ok) throw new Error('No se pudo descargar el módulo de video. Comprueba tu conexión.'); return response.arrayBuffer(); }));
      if (job !== exportJob) throw new Error('Cancelado');
      const wasmURL = URL.createObjectURL(new Blob(chunks, {type:'application/wasm'}));
      try { await instance.load({coreURL:new URL('vendor/ffmpeg/ffmpeg-core.js',document.baseURI).href,wasmURL}); }
      finally { URL.revokeObjectURL(wasmURL); }
      return instance;
    })();
    return enginePromise;
  }
  async function exportVideo(download = true) {
    if (exporting || !valid()) return false;
    if (videoBlob) { if (download) save(videoBlob, videoName); return true; }
    const job = ++exportJob; lock(true); progress.value = 0;
    musicPreview.pause();
    status.textContent = 'Preparando tu MP4… La primera vez se descarga el módulo de video (32 MB).';
    try {
      await render(); if (!ready) throw new Error('Espera a que cargue tu paisaje y vuelve a intentarlo.');
      const still = new Uint8Array(await (await canvasBlob('image/jpeg', .94)).arrayBuffer());
      const track = selectedMusic(), duration = CLIP, start = track ? Math.max(0, Math.min(track.start || 0, track.duration - CLIP)) : 0;
      const [ff, music] = await Promise.all([getEngine(job),track ? fetch(track.src).then(r=>{if(!r.ok)throw new Error('No se pudo cargar la música.');return r.arrayBuffer();}) : Promise.resolve(null)]);
      if (job !== exportJob) return;
      status.textContent = 'Creando tu video… Mantén esta página abierta.';
      const onProgress = data => { if(job!==exportJob)return;progress.value=Math.max(2,Math.min(99,Math.round((data.time/1000000)/duration*100)));status.textContent=`Creando tu video… ${Math.floor(progress.value)} %`; };
      ff.on('progress', onProgress);
      await ff.writeFile('tarjeta.jpg',still); if (music) await ff.writeFile('musica.mp3',new Uint8Array(music));
      const args = ['-loop','1','-framerate','24','-i','tarjeta.jpg'];
      if (music) args.push('-ss',String(start),'-i','musica.mp3');
      args.push('-t',String(duration),'-vf',`scale=720:1280,fade=t=in:st=0:d=0.65,fade=t=out:st=${duration-1}:d=1`,'-c:v','libx264','-preset','ultrafast','-crf','23','-pix_fmt','yuv420p');
      if (music) args.push('-af',`apad,atrim=duration=${duration},afade=t=in:st=0:d=0.6,afade=t=out:st=${duration-1.5}:d=1.5`,'-c:a','aac','-b:a','160k'); else args.push('-an');
      args.push('-movflags','+faststart','navidad.mp4');
      const result = await ff.exec(args,180000);
      if (job !== exportJob) return;
      if (result !== 0) throw new Error('No se pudo terminar el MP4. Prueba de nuevo o descarga la imagen.');
      const bytes = await ff.readFile('navidad.mp4'); videoBlob = new Blob([bytes], {type:'video/mp4'});
      videoName = `${fileBase}.mp4`; videoURL = URL.createObjectURL(videoBlob);
      window.SANTA_VIDEO_SHARE.update('nc',videoBlob,videoName,caption());
      $('#nc-result').src = videoURL; $('#nc-result').hidden = false;
      progress.value = 100; status.textContent = track ? `¡Tu video de 15 segundos está listo con ${track.title}!` : '¡Tu video de 15 segundos sin sonido está listo!';
      if (download) save(videoBlob,videoName);
      return true;
    } catch (err) {
      if (job === exportJob) status.textContent = `${err.message || 'No se pudo crear el video.'} Puedes volver a intentarlo o descargar la imagen.`;
      return false;
    } finally {
      if (job === exportJob) { engine?.terminate(); engine=null;enginePromise=null;lock(false); }
    }
  }
  designs.forEach((design,index) => {
    const option = document.createElement('option'); option.value=String(index); option.textContent=design.title; select.append(option);
    const button=document.createElement('button');button.type='button';button.className='nc-design-card';button.dataset.design=String(index);button.setAttribute('aria-pressed','false');button.setAttribute('aria-label',`Elegir ${design.title}`);
    const im=document.createElement('img');im.loading='lazy';im.decoding='async';im.src=design.thumb;im.alt=design.title;im.loading='lazy';im.width=270;im.height=480;
    const title=document.createElement('strong');title.textContent=design.title;const caption=document.createElement('span');caption.textContent=design.phrase;
    button.append(im,title,caption);button.addEventListener('click',()=>{automatic=false;choose(index);$('#nc-form').scrollIntoView({behavior:'smooth',block:'start'});});$('#nc-gallery').append(button);
  });
  $('#nc-auto').addEventListener('click',()=>setMode(false));$('#nc-personal').addEventListener('click',()=>setMode(true));
  for (const track of tracks) musicSelect.append(new Option(track.title, track.id));
  musicSelect.append(new Option('Sin música', 'none'));
  musicSelect.addEventListener('change',()=>{musicState();invalidateVideo();});
  musicState();
  select.addEventListener('change',()=>{automatic=false;choose(Number(select.value));});
  for(const input of [name,phrase])input.addEventListener('input',()=>{automatic=false;invalidateVideo();render();});
  $('#nc-new-phrase').addEventListener('click',()=>{automatic=false;phraseIndex=(phraseIndex+7)%25;phrase.value=designs[phraseIndex].phrase;invalidateVideo();render();});
  form.addEventListener('submit',e=>{e.preventDefault();if(valid()){invalidateVideo();render();}});
  $('#nc-image').addEventListener('click',async()=>{if(!valid())return;await render();if(ready)save(await canvasBlob(),`${fileBase}.png`);});
  $('#nc-video').addEventListener('click',()=>exportVideo(true));
  $('#nc-cancel').addEventListener('click',()=>{++exportJob;engine?.terminate();engine=null;enginePromise=null;lock(false);status.textContent='Video cancelado. Puedes volver a intentarlo cuando quieras.';});
  /* Compartir: crea el video de 15 s si hace falta, copia el título con #faltan y abre el menú del celular. */
  const copyCaption=async()=>{const text=caption();$('#nc-caption').value=text;try{await navigator.clipboard.writeText(text);return true;}catch{const area=$('#nc-caption');area.select();try{return document.execCommand('copy');}catch{return false;}}};
  $('#nc-share').addEventListener('click',async()=>{
    if(!videoBlob){shareLabel('Creando tu video…');const ok=await exportVideo(false);if(!ok){shareLabel('Compartir video');return;}await copyCaption();shareLabel('✓ Listo: toca para compartir');status.textContent='Tu video está listo y el título ya está copiado. Toca «Compartir» para elegir TikTok, WhatsApp o Instagram.';return;}
    const copied=await copyCaption();const file=new File([videoBlob],videoName,{type:'video/mp4'});
    if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'Mi tarjeta de Navidad',text:caption()});status.textContent=copied?'¡Compartido! Si la app no muestra el título, pégalo: ya está copiado.':'¡Compartido!';return;}catch(err){if(err.name==='AbortError')return;if(err.name==='NotAllowedError'){shareLabel('✓ Listo: toca para compartir');return;}}}
    save(videoBlob,videoName);status.textContent=copied?'Video descargado y título copiado. Súbelo a TikTok o Instagram y pega el título.':'Video descargado. Puedes adjuntarlo en TikTok, WhatsApp o tu aplicación favorita.';
  });
  /* Caja con el título automático, lista para copiar. */
  const capBox=document.createElement('div');capBox.className='nc-caption-box';
  capBox.innerHTML='<label>Título para tu publicación (se copia solo al compartir)<textarea id="nc-caption" rows="3" readonly></textarea></label><button type="button" class="button outline small" id="nc-copy-caption">Copiar título y hashtags</button>';
  $('.nc-downloads').after(capBox);
  $('#nc-copy-caption').addEventListener('click',async()=>{const ok=await copyCaption();status.textContent=ok?'Título y hashtags copiados ✨':'Selecciona el título y cópialo.';});
  function tick(){if(exporting)return;const d=dateState();if(currentDay!==d.key){currentDay=d.key;if(automatic){active=((d.civilDay%25)+25)%25;phrase.value=designs[active].phrase;gallerySelection();}invalidateVideo();}if(!document.hidden)render();}
  const d=dateState();currentDay=d.key;active=((d.civilDay%25)+25)%25;phraseIndex=active;phrase.value=designs[active].phrase;setDesignMusic(active);gallerySelection();$('#nc-share').disabled=false;$('#nc-caption').value=caption();(window.ALDEA_WHEN_SHOWN||((i,f)=>f()))('tarjeta-navidad',render);
  // Refresh the card only while its section is on screen; all updates use the real clock.
  let onScreen=false;new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;if(onScreen)tick();},{rootMargin:'120px'}).observe($('#tarjeta-navidad'));
  setInterval(()=>{if(onScreen)tick();},1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&onScreen)tick();});window.addEventListener('pageshow',()=>{if(onScreen)tick();});
})();
