(() => {
  'use strict';
  const $=s=>document.querySelector(s), form=$('#lv-form'), name=$('#lv-name'), source=$('#lv-source');
  const canvas=$('#lv-canvas'),ctx=canvas.getContext('2d'),status=$('#lv-status'),progress=$('#lv-progress');
  const voice=$('#lv-voice'),voicePlayer=$('#lv-voice-preview'),music=$('#lv-music'),musicPlayer=$('#lv-music-preview');
  const speechTools=window.SANTA_LIST_SPEECH,voices=speechTools.voices;
  const tracks=window.SANTA_MUSIC,scene=$('#lv-scene');
  const DURATION=12,FPS=24,FRAMES=DURATION*FPS;
  const nameCatalog=window.SANTA_NAME_AUDIO, nameStatus=$('#lv-name-status'), namePlayer=$('#lv-name-preview');
  const nameRecording=()=>speechTools.find(nameCatalog,text());
  const revealAt=()=>speech?.revealAt??0;
  const writeSeconds=()=>speech?.writeDuration??1;
  let speech=null,speechPromise=null,speechKey='',speechJob=0,playJob=0;
  const scenes={
    original:{src:'assets/lista-video/santa-polvo.mp4',poster:'assets/lista-video/poster.jpg',cover:'assets/lista-video/santa-polvo-cover.jpg'},
    bolsita:{src:'assets/lista-video/santa-bolsita.mp4',poster:'assets/lista-video/santa-bolsita.jpg',cover:'assets/lista-video/santa-bolsita-cover.jpg'},
    destellos:{src:'assets/lista-video/santa-destellos.mp4',poster:'assets/lista-video/santa-destellos.jpg',cover:'assets/lista-video/santa-destellos-cover.jpg'},
    luna:{src:'assets/lista-video/santa-luna.mp4',poster:'assets/lista-video/santa-luna.jpg',cover:'assets/lista-video/santa-luna-cover.jpg'},
    guirnaldas:{src:'assets/lista-video/santa-guirnaldas.mp4',poster:'assets/lista-video/santa-guirnaldas.jpg',cover:'assets/lista-video/santa-guirnaldas-cover.jpg'}
  };
  let sceneJob=0;
  const selectedScene=()=>scenes[scene.value];
  const frameCanvas=document.createElement('canvas');frameCanvas.width=720;frameCanvas.height=1280;const frameContext=frameCanvas.getContext('2d');let frameTime=-1;
  let busy=false,playing=false,raf=0,job=0,worker=null,promise=null,blob=null,url='',filename='';
  let poster=null,cover=null,previewVoice=null,previewMusic=null;
  const text=()=>name.value.trim().normalize('NFC');
  const selectedMusic=()=>tracks.find(t=>t.id===music.value);
  const portrait=window.SANTA_PORTRAIT.attach('lv',()=>{invalidate();});
  function overlay(c,t,mediaFrame){
    c.save();const g=c.createLinearGradient(0,0,0,680);g.addColorStop(0,'#101c492b');g.addColorStop(1,'#101c4900');c.fillStyle=g;c.fillRect(0,0,1080,680);
    c.textAlign='center';c.font='700 55px Georgia,serif';c.shadowColor='#1c103a';c.shadowBlur=12;c.fillStyle='#fff1b9';c.fillText('Lista de los buenos',540,125);c.restore();
    window.SANTA_STARDUST.draw(c,text(),t,revealAt(),writeSeconds(),{immediate:true});portrait.draw(c,t,revealAt(),mediaFrame);
  }
  function draw(t=0){ctx.clearRect(0,0,1080,1920);if(source.readyState>=2&&!source.ended&&!source.seeking&&source.currentTime!==frameTime){frameContext.drawImage(source,0,0,720,1280);frameTime=source.currentTime;}if(frameTime>=0)ctx.drawImage(frameCanvas,0,0,1080,1920);else if(poster)ctx.drawImage(poster,0,0,1080,1920);overlay(ctx,t);}
  function stop(){++playJob;voicePlayer.pause();namePlayer.pause();musicPlayer.pause();cancelAnimationFrame(raf);playing=false;source.pause();portrait.pause();for(const a of [previewVoice,previewMusic])if(a)a.pause();previewVoice=null;previewMusic=null;$('#lv-play').textContent='Ver mi animación';}
  function invalidate(){stop();blob=null;window.SANTA_VIDEO_SHARE.update('lv',null,'');if(url)URL.revokeObjectURL(url);url='';$('#lv-result').pause();$('#lv-result').removeAttribute('src');$('#lv-result').hidden=true;status.textContent='Prepara tu nuevo video con el nombre elegido.';draw();}
  function changeScene(){
    invalidate();const id=++sceneJob,clip=selectedScene();poster=null;cover=null;frameTime=-1;
    $('#lv-loading').textContent='Preparando el video de Santa…';$('#lv-loading').hidden=false;
    source.src=clip.src;source.poster=clip.poster;source.load();draw();
    for(const button of form.querySelectorAll('[data-lv-scene]'))button.setAttribute('aria-pressed',String(button.dataset.lvScene===scene.value));
    const im=new Image();im.onload=()=>{if(id!==sceneJob)return;poster=im;draw();$('#lv-loading').hidden=true;};im.src=clip.poster;
    const coverImage=new Image();coverImage.onload=()=>{if(id===sceneJob)cover=coverImage;};coverImage.src=clip.cover;
    status.textContent='Escena seleccionada. Escribe el nombre y mira tu animación.';
  }
  function syncLabel(){if(speech)$('#lv-sync').textContent=`Santa termina «es» en ${speech.revealAt.toLocaleString('es-PE',{maximumFractionDigits:2})} s: aparece «${text()}» y su voz empieza justo después, en ${speech.nameAt.toLocaleString('es-PE',{maximumFractionDigits:2})} s.`;}
  function prepareSpeech(){
    const recording=nameRecording();if(!recording)return Promise.reject(new Error('Elige un nombre que tenga una grabación disponible.'));
    const key=voice.value+'|'+recording.src;if(key===speechKey&&speechPromise){syncLabel();return speechPromise;}
    speechKey=key;const id=++speechJob;if(speech?.url)URL.revokeObjectURL(speech.url);speech=null;voicePlayer.pause();voicePlayer.removeAttribute('src');voicePlayer.load();
    speechPromise=speechTools.prepare(voice.value,recording,bytes).then(result=>{
      if(id!==speechJob)return null;
      speech={...result,key,url:URL.createObjectURL(new Blob([result.data],{type:'audio/wav'}))};voicePlayer.src=speech.url;syncLabel();return speech;
    }).catch(e=>{if(id===speechJob){speechPromise=null;speechKey='';nameStatus.dataset.state='missing';nameStatus.textContent='No se pudo cargar la grabación. Revisa tu conexión y vuelve a intentarlo.';}throw e;});return speechPromise;
  }
  function audioState(autoGender=false){
    const recording=nameRecording();if(autoGender&&recording)voice.value=recording.gender;
    voicePlayer.pause();namePlayer.pause();musicPlayer.pause();
    const track=selectedMusic();musicPlayer.hidden=!track;if(track)musicPlayer.src=track.src;else musicPlayer.removeAttribute('src');
    if(recording){
      namePlayer.src=recording.src;namePlayer.hidden=false;nameStatus.dataset.state='found';nameStatus.textContent=`Grabación encontrada: ${recording.name}. Santa dirá únicamente este nombre después de «es».`;
      $('#lv-sync').textContent='Preparando la voz del nombre justo después de «es»…';
      prepareSpeech().catch(()=>{});
    }else{
      ++speechJob;speechKey='';speechPromise=null;if(speech?.url)URL.revokeObjectURL(speech.url);speech=null;
      voicePlayer.src=voices[voice.value];namePlayer.removeAttribute('src');namePlayer.hidden=true;
      nameStatus.dataset.state=text()?'missing':'';nameStatus.textContent=text()?`No hay una grabación exacta de «${text()}». Elige un nombre de las sugerencias. Su portada sí está disponible.`:`Escribe un nombre para buscarlo entre las ${nameCatalog.length} grabaciones disponibles.`;
      $('#lv-sync').textContent='La animación del nombre y su voz comenzarán juntas después del anuncio de Santa.';
    }
  }
  function valid(requireRecording=false){if(!portrait.ready()){status.textContent="Espera a que termine de cargar la foto.";return false;}if(!text()){name.value='';name.reportValidity();return false;}if(!form.reportValidity())return false;if(requireRecording&&!nameRecording()){nameStatus.textContent=`No hay una grabación exacta de «${text()}». Elige un nombre de las sugerencias para generar el video con voz.`;name.focus();return false;}return true;}
  async function play(){
    if(playing){stop();draw();return;}if(busy||!valid(true))return;
    stop();const playIntent=playJob;voicePlayer.pause();namePlayer.pause();musicPlayer.pause();
    let announcement;
    try{announcement=await prepareSpeech();}catch(e){status.textContent=e.message;return;}
    if(!announcement||announcement.key!==speechKey||playIntent!==playJob)return;
    source.currentTime=0;source.muted=true;
    previewVoice=new Audio(announcement.url);const track=selectedMusic();if(track){previewMusic=new Audio(track.src);previewMusic.volume=.20;}
    playing=true;$('#lv-play').textContent='Detener animación';
    const audioClock=speechTools.clock(previewVoice);
    portrait.reset();const calls=[source.play(),previewVoice.play()];if(previewMusic)calls.push(previewMusic.play());
    Promise.all(calls).catch(()=>{stop();status.textContent='No se pudo iniciar la vista previa. Toca de nuevo o genera el MP4 descargable.';});
    function frame(now){if(!playing||playIntent!==playJob)return;const t=audioClock.time(now);portrait.syncPreview(t,revealAt());draw(t);if(t<DURATION)raf=requestAnimationFrame(frame);else{stop();draw(DURATION);status.textContent='Santa termina «es», revela el nombre y lo pronuncia justo después. Puedes descargar y compartir el video.';}}raf=requestAnimationFrame(frame);
  }
  function lock(v){busy=v;for(const el of form.querySelectorAll('input,select,button'))el.disabled=v;for(const id of ['lv-play','lv-export','lv-image'])$('#'+id).disabled=v;$('#lv-cancel').hidden=!v;progress.hidden=!v;}
  function save(b,file){const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=file;a.click();setTimeout(()=>URL.revokeObjectURL(u),60000);}
  const canvasBlob=(c,type='image/png')=>new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('No se pudo crear la imagen.')),type,.94));
  async function bytes(path){const r=await fetch(path);if(!r.ok)throw new Error('No se pudo cargar el video o el audio. Revisa tu conexión.');return new Uint8Array(await r.arrayBuffer());}
  async function engine(id){
    if(!promise)promise=(async()=>{const {FFmpeg}=await import('./vendor/ffmpeg/index.js');if(id!==job)throw new Error('Cancelado');worker=new FFmpeg();const ff=worker;const parts=await Promise.all([1,2].map(i=>bytes(`vendor/ffmpeg/core-${i}.bin`)));if(id!==job)throw new Error('Cancelado');const wasm=URL.createObjectURL(new Blob(parts,{type:'application/wasm'}));try{await ff.load({coreURL:new URL('vendor/ffmpeg/ffmpeg-core.js',document.baseURI).href,wasmURL:wasm});}finally{URL.revokeObjectURL(wasm);}return ff;})();return promise;
  }
  async function exportVideo(){
    if(busy||!valid(true))return;if(blob){save(blob,filename);return;}stop();voicePlayer.pause();namePlayer.pause();musicPlayer.pause();const id=++job;lock(true);progress.value=0;status.textContent='Preparando el video de Santa…';
    try{
      const [ff,clip,announcement]=await Promise.all([engine(id),bytes(selectedScene().src),prepareSpeech()]);if(id!==job)return;
      const track=selectedMusic();await ff.writeFile('santa-original.mp4',clip);if(!announcement)throw new Error('La grabación cambió. Vuelve a intentarlo.');await ff.writeFile('voz.wav',announcement.data);if(track)await ff.writeFile('musica.mp3',await bytes(track.src));
      const layer=document.createElement('canvas');layer.width=720;layer.height=810;const c=layer.getContext('2d');
      for(let i=0;i<FRAMES;i++){if(id!==job)return;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,720,810);c.setTransform(2/3,0,0,2/3,0,0);await portrait.seekAt(i/FPS,revealAt());overlay(c,i/FPS);await ff.writeFile(`letra-${String(i).padStart(3,'0')}.png`,new Uint8Array(await (await canvasBlob(layer)).arrayBuffer()));if(i%FPS===0){progress.value=i/FRAMES*30;status.textContent='Preparando el nombre como polvo de estrellas…';}}
      if(id!==job)return;ff.on('progress',d=>{if(id===job){progress.value=Math.min(99,30+d.time/(DURATION*1000000)*70);status.textContent=`Creando tu video… ${Math.floor(progress.value)} %`;}});
      const args=['-i','santa-original.mp4','-framerate',String(FPS),'-i','letra-%03d.png','-i','voz.wav'];if(track)args.push('-i','musica.mp3');
      let filter='[0:v]tpad=stop_mode=clone:stop_duration=5,fps=24,setsar=1[bg];[bg][1:v]overlay=0:0:shortest=1:format=auto,format=yuv420p[v];[2:a]apad,atrim=duration=12[voice]';
      filter+=track?';[3:a]volume=0.20,atrim=duration=12,afade=t=out:st=11:d=1[music];[voice][music]amix=inputs=2:duration=longest:normalize=0[a]':';[voice]anull[a]';
      args.push('-filter_complex',filter,'-map','[v]','-map','[a]','-t',String(DURATION),'-c:v','libx264','-preset','ultrafast','-crf','22','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','lista-buenos.mp4');
      const result=await ff.exec(args,240000);if(id!==job)return;if(result!==0)throw new Error('No se pudo terminar el video. Inténtalo de nuevo.');
      blob=new Blob([await ff.readFile('lista-buenos.mp4')],{type:'video/mp4'});filename='Lista-de-los-buenos-'+text().replace(/[^\p{L}\p{N}-]/gu,'-')+'-'+scene.value+'.mp4';url=URL.createObjectURL(blob);$('#lv-result').src=url;$('#lv-result').hidden=false;window.SANTA_VIDEO_SHARE.update('lv',blob,filename);progress.value=100;status.textContent='¡Video listo! Santa pronuncia únicamente tu nombre después de «es», sincronizado con las letras doradas. Descárgalo o compártelo.';save(blob,filename);
    }catch(e){if(id===job)status.textContent=e.message||'No se pudo crear el video.';}
    finally{if(id===job){worker?.terminate();worker=null;promise=null;lock(false);}}
  }
  for(const track of tracks)music.append(new Option(track.title,track.id));music.append(new Option('Sin música','none'));
  scene.addEventListener('change',changeScene);
  for(const button of form.querySelectorAll('[data-lv-scene]'))button.addEventListener('click',()=>{if(busy||scene.value===button.dataset.lvScene)return;scene.value=button.dataset.lvScene;changeScene();});
  for(const label of [...new Set(nameCatalog.flatMap(r=>[r.name,...(r.aliases||[])]))].sort((a,b)=>a.localeCompare(b,'es'))) $('#lv-name-options').append(new Option(label,label));
  for(const el of [voice,music])el.addEventListener('change',()=>{audioState();invalidate();});
  name.addEventListener('input',()=>{audioState(true);invalidate();canvas.setAttribute('aria-label',`Santa en movimiento. Nombre que se revelará: ${text()||'por completar'}.`);});
  form.addEventListener('submit',e=>{e.preventDefault();if(valid(true)){invalidate();status.textContent='Tu nombre grabado está preparado. Toca Ver mi animación para escuchar el anuncio y únicamente ese nombre.';}});
  $('#lv-play').addEventListener('click',play);$('#lv-export').addEventListener('click',exportVideo);
  $('#lv-cancel').addEventListener('click',()=>{++job;worker?.terminate();worker=null;promise=null;lock(false);status.textContent='Video cancelado. Puedes volver a intentarlo.';});
  $('#lv-image').addEventListener('click',async()=>{if(!valid())return;if(!cover){status.textContent='Espera a que cargue la escena.';return;}stop();const c=document.createElement('canvas');c.width=1080;c.height=1920;const cc=c.getContext('2d');cc.drawImage(cover,0,0,1080,1920);overlay(cc,DURATION);save(await canvasBlob(c),'Portada-'+text()+'-'+scene.value+'.png');});
  source.addEventListener('loadeddata',()=>{$('#lv-loading').hidden=true;draw();});source.addEventListener('error',()=>{$('#lv-loading').textContent='No se pudo cargar el video. Revisa tu conexión y recarga la página.';});
  window.addEventListener('aldea:navigate',()=>{stop();draw();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();draw();}});
  changeScene();
  audioState();
})();
