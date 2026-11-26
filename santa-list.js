(() => {
  'use strict';
  const $=s=>document.querySelector(s), scenes=window.SANTA_LIST_SCENES;
  const form=$('#good-form'),canvas=$('#good-canvas'),ctx=canvas.getContext('2d');
  const name=$('#sl-name'),scene=$('#sl-scene'),list=$('#sl-list'),voice=$('#sl-voice'),action=$('#sl-action');
  const loading=$('#sl-loading'),status=$('#good-status'),progress=$('#sl-progress'),audio=$('#sl-audio');
  const musicSelect=$('#sl-music-track'),musicPlayer=$('#sl-music-preview'),tracks=window.SANTA_MUSIC;
  const selectedMusic=()=>tracks.find(track=>track.id===musicSelect.value)||tracks[0];
  function musicState(){musicPlayer.pause();$('#sl-music-controls').hidden=!$('#sl-music').checked;musicPlayer.src=selectedMusic().src;musicPlayer.setAttribute('aria-label',`Escuchar ${selectedMusic().title}`);}
  const serif='Georgia, "Times New Roman", serif',elegant='"Cormorant Garamond", Georgia, serif',sans='"DM Sans", Arial, sans-serif';
  const base=document.createElement('canvas');base.width=1080;base.height=1920;const bg=base.getContext('2d');
  const cache=new Map();let active=0,version=0,ready=false,busy=false,animating=false,raf=0,animationId=0;
  let worker=null,workerPromise=null,jobId=0,videoBlob=null,videoURL='',videoName='',previousVoice='boy';
  let previewMusic=null,previewVoice=null;
  const speechTools=window.SANTA_LIST_SPEECH,voiceFiles=speechTools.voices,nameCatalog=window.SANTA_NAME_AUDIO;
  let speech=null,speechPromise=null,speechKey='',speechJob=0;
  const nameRecording=()=>speechTools.find(nameCatalog,cleanName());
  const revealAt=()=>voice.value==='none'?4.8:(speech?.revealAt??0);
  const writeSeconds=()=>voice.value==='none'?4.2:(speech?.writeDuration??1);
  const cleanName=()=>name.value.trim().normalize('NFC');
  const title=()=>list.value==='learn'?'Lista de mal portados':'Lista de buenos';
  function safeName(text){return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9-]/gi,'-').replace(/-+/g,'-').slice(0,85)||'Santa';}
  function filename(){return `${list.value==='learn'?'Lista-de-mal-portados':'Lista-de-buenos'}-${safeName(cleanName())}-${scenes[active].id}`;}
  function getImage(src){
    if(!cache.has(src)){
      if(cache.size>=4)cache.delete(cache.keys().next().value);
      cache.set(src,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{cache.delete(src);reject(new Error('No se pudo cargar esta escena. Vuelve a elegirla o prueba otra.'));};im.src=src;}));
    }return cache.get(src);
  }
  function star(c,x,y,r,color){c.save();c.translate(x,y);c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,d=i%2?r*.24:r;c.lineTo(Math.cos(a)*d,Math.sin(a)*d);}c.closePath();c.fillStyle=color;c.fill();c.restore();}
  function centered(c,text,y,size,maxWidth,color,font=elegant,weight=700){c.font=`${weight} ${size}px ${font}`;while(c.measureText(text).width>maxWidth&&size>25)c.font=`${weight} ${--size}px ${font}`;c.textAlign='center';c.fillStyle=color;c.fillText(text,540,y);return size;}
  function wrap(c,text,y,maxWidth,size){c.font=`600 ${size}px ${elegant}`;c.fillStyle='#fff9e8';c.textAlign='center';let line='',lines=[];for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(c.measureText(next).width>maxWidth&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);lines.slice(0,3).forEach((l,i)=>c.fillText(l,540,y+i*size*1.16));}
  const portrait=window.SANTA_PORTRAIT.attach('sl',()=>{invalidate();draw();});
  function drawName(c,text,t){window.SANTA_STARDUST.draw(c,text,t,revealAt(),writeSeconds(),{size:154,maxWidth:870,y:365,immediate:voice.value!=='none'});portrait.draw(c,t,revealAt());}
  function draw(t=15){ctx.clearRect(0,0,1080,1920);ctx.drawImage(base,0,0);drawName(ctx,cleanName(),t);}
  function stopPreview(){++animationId;cancelAnimationFrame(raf);raf=0;animating=false;portrait.pause();for(const a of [previewMusic,previewVoice])if(a){a.pause();a.src='';}previewMusic=null;previewVoice=null;$('#sl-play').textContent='Ver animación de 15 segundos';}
  function invalidate(){
    window.SANTA_VIDEO_SHARE.update('sl',null,'');
    stopPreview();videoBlob=null;$('#sl-share-video').disabled=true;$('#sl-result').pause();$('#sl-result').hidden=true;$('#sl-result').removeAttribute('src');
    if(videoURL)URL.revokeObjectURL(videoURL);videoURL='';status.textContent='Tu nombre se escribe entre los destellos. Descarga una tarjeta o un video de 15 segundos.';
  }
  async function render(){
    const current=++version;ready=false;loading.hidden=false;loading.textContent='Preparando la escena de Santa…';
    try{
      await document.fonts.ready;const im=await getImage(scenes[active].image);if(current!==version)return false;
      const scale=Math.max(1080/im.width,1920/im.height);bg.clearRect(0,0,1080,1920);bg.drawImage(im,(1080-im.width*scale)/2,(1920-im.height*scale)/2,im.width*scale,im.height*scale);
      const shade=bg.createLinearGradient(0,0,0,690);shade.addColorStop(0,'#1b153546');shade.addColorStop(.48,'#1b15356b');shade.addColorStop(1,'#1b153500');bg.fillStyle=shade;bg.fillRect(0,0,1080,690);
      bg.strokeStyle='#ffe09a';bg.lineWidth=2;bg.strokeRect(34,36,1012,1848);
      bg.shadowColor='#271229';bg.shadowBlur=14;
      centered(bg,title(),155,64,900,'#fff2bd',serif,700);
      centered(bg,list.value==='learn'?'Hoy es un buen día para aprender y mejorar':'Un corazón lleno de magia navideña',472,36,920,'#fff7dc',elegant,700);
      const footer=bg.createLinearGradient(0,1670,0,1920);footer.addColorStop(0,'#27122900');footer.addColorStop(1,'#271229b0');bg.fillStyle=footer;bg.fillRect(0,1670,1080,250);
      centered(bg,'La aldea de Santa',1740,43,860,'#ffe4a3');
      if(action.value.trim())wrap(bg,action.value.trim(),1800,850,36);else centered(bg,list.value==='learn'?'Siempre puedes intentarlo de nuevo.':'Con cariño, Santa Claus',1810,37,850,'#fff7dc');
      bg.shadowBlur=0;draw();ready=true;loading.hidden=true;
      canvas.setAttribute('aria-label',`${scenes[active].title}. ${title()}.${cleanName()?' Nombre: '+cleanName()+'.':''} Polvo de estrellas esparcido en el cielo.`);return true;
    }catch(err){if(current===version)loading.textContent=err.message;return false;}
  }
  function syncLabel(){if(speech)$('#sl-audio-help').textContent=`Santa termina «es» en ${speech.revealAt.toLocaleString('es-PE',{maximumFractionDigits:2})} s: aparece «${cleanName()}» y su voz empieza justo después, en ${speech.nameAt.toLocaleString('es-PE',{maximumFractionDigits:2})} s.`;}
  function clearSpeech(){++speechJob;speechKey='';speechPromise=null;if(speech?.url)URL.revokeObjectURL(speech.url);speech=null;}
  function prepareSpeech(){
    const recording=nameRecording();if(!recording)return Promise.reject(new Error('Elige un nombre con grabación disponible o selecciona «Sin voz».'));
    const key=voice.value+'|'+recording.src;if(key===speechKey&&speechPromise){syncLabel();return speechPromise;}
    clearSpeech();speechKey=key;const id=speechJob;audio.pause();audio.removeAttribute('src');audio.load();
    speechPromise=speechTools.prepare(voice.value,recording,bytes).then(result=>{
      if(id!==speechJob)return null;
      speech={...result,key,url:URL.createObjectURL(new Blob([result.data],{type:'audio/wav'}))};audio.src=speech.url;
      syncLabel();
      return speech;
    }).catch(e=>{if(id===speechJob){speechPromise=null;speechKey='';$('#sl-audio-help').textContent=e.message;}throw e;});return speechPromise;
  }
  function audioState(autoGender=false){
    const bad=list.value==='learn',recording=nameRecording();
    for(const option of voice.options)option.disabled=bad&&option.value!=='none';
    if(bad&&voice.value!=='none'){previousVoice=voice.value;voice.value='none';}
    if(autoGender&&!bad&&voice.value!=='none'&&recording){voice.value=recording.gender;previousVoice=voice.value;}
    audio.pause();audio.hidden=voice.value==='none';
    if(voiceFiles[voice.value]&&recording){$('#sl-audio-help').textContent='Preparando el anuncio y la voz del nombre elegido…';prepareSpeech().catch(()=>{});}
    else{clearSpeech();if(voiceFiles[voice.value])audio.src=voiceFiles[voice.value];else audio.removeAttribute('src');
      $('#sl-audio-help').textContent=bad?'Las grabaciones dicen «lista de los buenos». Esta tarjeta conserva la música sin una voz que contradiga su texto.':voice.value==='none'?'El video se generará sin voz. Puedes mantener o quitar la música de fondo.':cleanName()?'No hay una grabación exacta de este nombre. Elige uno de las sugerencias o selecciona «Sin voz».':'Escribe un nombre para escuchar el anuncio seguido únicamente de su grabación.';}
  }
  function valid(requireVoice=false){if(!portrait.ready()){status.textContent="Espera a que termine de cargar la foto.";return false;}if(!cleanName()){name.value='';name.reportValidity();return false;}if(requireVoice&&voice.value!=='none'&&!nameRecording()){status.textContent='Elige un nombre con grabación disponible o selecciona «Sin voz». Tu tarjeta sí puede descargarse con cualquier nombre.';name.focus();return false;}return form.reportValidity();}
  function lock(value){busy=value;for(const n of form.querySelectorAll('input,select,button'))n.disabled=value;for(const n of $('#sl-gallery').querySelectorAll('button'))n.disabled=value;for(const id of ['sl-play','sl-video','sl-png','sl-pdf','sl-share-image'])$('#'+id).disabled=value;$('#sl-share-video').disabled=value||!videoBlob;$('#sl-cancel').hidden=!value;progress.hidden=!value;}
  function save(blob,file){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=file;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  function blobOf(c,type='image/png',quality){return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('No se pudo crear la imagen.')),type,quality));}
  async function share(blob,file,titleText){const f=new File([blob],file,{type:blob.type});if(navigator.canShare?.({files:[f]})){try{await navigator.share({files:[f],title:titleText});return;}catch(err){if(err.name==='AbortError')return;}}save(blob,file);status.textContent='Archivo descargado. Adjúntalo en TikTok, WhatsApp o tu aplicación favorita.';}
  async function preview(){
    if(animating){stopPreview();draw();return;}if(!valid(true)||busy)return;
    stopPreview();const run=animationId;musicPlayer.pause();audio.pause();
    try{
      if(!await render()||run!==animationId)return;
      const announcement=voiceFiles[voice.value]?await prepareSpeech():null;if(run!==animationId)return;
      if(voiceFiles[voice.value]&&!announcement)return;
      if(announcement)previewVoice=new Audio(announcement.url);
      if($('#sl-music').checked){previewMusic=new Audio(selectedMusic().src);previewMusic.volume=announcement ? .20 : .65;}
      const audioClock=previewVoice?speechTools.clock(previewVoice):null,start=performance.now();
      animating=true;$('#sl-play').textContent='Detener animación';portrait.reset();
      const calls=[];if(previewVoice)calls.push(previewVoice.play());if(previewMusic)calls.push(previewMusic.play());
      Promise.all(calls).catch(()=>{if(run===animationId){stopPreview();status.textContent='No se pudo iniciar el audio. Toca de nuevo o genera el MP4.';}});
      function frame(now){if(run!==animationId||!animating)return;const elapsed=audioClock?audioClock.time(now):(now-start)/1000;portrait.syncPreview(elapsed,revealAt());draw(elapsed);if(elapsed<15)raf=requestAnimationFrame(frame);else{stopPreview();draw();status.textContent='Animación terminada: el nombre aparece después de «es» y Santa pronuncia únicamente el nombre elegido.';}}raf=requestAnimationFrame(frame);
    }catch(e){if(run===animationId){stopPreview();status.textContent=e.message;}}
  }
  async function engine(job){
    if(!workerPromise)workerPromise=(async()=>{
      const {FFmpeg}=await import('./vendor/ffmpeg/index.js');if(job!==jobId)throw new Error('Cancelado');worker=new FFmpeg();const current=worker;
      const parts=await Promise.all([1,2].map(async n=>{const r=await fetch(`vendor/ffmpeg/core-${n}.bin`);if(!r.ok)throw new Error('No se pudo descargar el módulo de video. Comprueba tu conexión.');return r.arrayBuffer();}));if(job!==jobId)throw new Error('Cancelado');
      const wasmURL=URL.createObjectURL(new Blob(parts,{type:'application/wasm'}));try{await current.load({coreURL:new URL('vendor/ffmpeg/ffmpeg-core.js',document.baseURI).href,wasmURL});}finally{URL.revokeObjectURL(wasmURL);}return current;
    })();return workerPromise;
  }
  async function bytes(url){const r=await fetch(url);if(!r.ok)throw new Error('No se pudo cargar el audio. Comprueba tu conexión.');return new Uint8Array(await r.arrayBuffer());}
  async function exportVideo(){
    if(busy||!valid(true))return;if(videoBlob){save(videoBlob,videoName);return;}stopPreview();const job=++jobId;lock(true);progress.value=0;status.textContent='Preparando tu video. La primera vez se carga el módulo de exportación…';
    try{
      if(!await render())throw new Error('Espera a que cargue la escena y vuelve a intentarlo.');
      const voiceFile=voiceFiles[voice.value],musicOn=$('#sl-music').checked,musicTrack=selectedMusic();
      const announcement=voiceFile?await prepareSpeech():null;if(voiceFile&&!announcement)throw new Error('El nombre cambió. Vuelve a preparar el video.');
      musicPlayer.pause();audio.pause();
      const ff=await engine(job);if(job!==jobId)return;
      await ff.writeFile('escena.jpg',new Uint8Array(await (await blobOf(base,'image/jpeg',.94)).arrayBuffer()));
      if(voiceFile)await ff.writeFile('voz.wav',announcement.data);if(musicOn)await ff.writeFile('musica.mp3',await bytes(musicTrack.src));if(job!==jobId)return;
      const overlay=document.createElement('canvas');overlay.width=720;overlay.height=810;const oc=overlay.getContext('2d');
      // 12 writing steps per second; only the light transparent sky layer is stored.
      const frames=180;for(let i=0;i<frames;i++){
        if(job!==jobId)return;oc.setTransform(1,0,0,1,0,0);oc.clearRect(0,0,720,810);oc.setTransform(2/3,0,0,2/3,0,0);await portrait.seekAt(i/12,revealAt());drawName(oc,cleanName(),i/12);
        await ff.writeFile(`nombre-${String(i).padStart(3,'0')}.png`,new Uint8Array(await (await blobOf(overlay)).arrayBuffer()));
        if(i%12===0){progress.value=Math.round(i/frames*35);status.textContent=`Dibujando el nombre con polvo de estrellas… ${Math.round(i/frames*100)} %`;}
      }
      if(job!==jobId)return;status.textContent='Uniendo la escena, el nombre y el audio…';
      ff.on('progress',data=>{if(job!==jobId)return;progress.value=Math.min(99,35+Math.round(data.time/15000000*65));status.textContent=`Creando tu MP4 de 15 segundos… ${Math.floor(progress.value)} %`;});
      const args=['-loop','1','-framerate','24','-i','escena.jpg','-framerate','12','-i','nombre-%03d.png'];
      let filter='[0:v]scale=720:1280[bg];[bg][1:v]overlay=0:0:shortest=1:format=auto,fps=24,format=yuv420p[v]';
      if(voiceFile)args.push('-i','voz.wav');if(musicOn)args.push('-i','musica.mp3');
      if(voiceFile&&musicOn)filter+=';[2:a]apad,atrim=duration=15[voice];[3:a]volume=0.20,atrim=duration=15,afade=t=out:st=14:d=1[music];[voice][music]amix=inputs=2:duration=longest:normalize=0[a]';
      else if(voiceFile)filter+=';[2:a]apad,atrim=duration=15[a]';
      else if(musicOn)filter+=';[2:a]volume=0.65,atrim=duration=15,afade=t=out:st=14:d=1[a]';
      args.push('-filter_complex',filter,'-map','[v]');if(voiceFile||musicOn)args.push('-map','[a]','-c:a','aac','-b:a','160k');else args.push('-an');
      args.push('-t','15','-c:v','libx264','-preset','ultrafast','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart','santa.mp4');
      const result=await ff.exec(args,240000);if(job!==jobId)return;if(result!==0)throw new Error('El video no pudo terminar. Prueba de nuevo o descarga la imagen.');
      const out=await ff.readFile('santa.mp4');videoBlob=new Blob([out],{type:'video/mp4'});videoName=filename()+'.mp4';videoURL=URL.createObjectURL(videoBlob);window.SANTA_VIDEO_SHARE.update('sl',videoBlob,videoName);$('#sl-result').src=videoURL;$('#sl-result').hidden=false;progress.value=100;status.textContent='¡Tu video de 15 segundos está listo! El nombre aparece después de «es» y su grabación queda sincronizada con los destellos.';save(videoBlob,videoName);
    }catch(err){if(job===jobId)status.textContent=err.message||'No se pudo generar el video. Vuelve a intentarlo.';}
    finally{if(job===jobId){worker?.terminate();worker=null;workerPromise=null;lock(false);draw();}}
  }
  function selectScene(index){active=index;scene.value=String(index);for(const b of $('#sl-gallery').querySelectorAll('button'))b.setAttribute('aria-pressed',String(Number(b.dataset.index)===index));invalidate();render();}
  scenes.forEach((item,index)=>{
    const o=document.createElement('option');o.value=String(index);o.textContent=item.title;scene.append(o);
    const b=document.createElement('button');b.type='button';b.className='sl-scene-card';b.dataset.index=String(index);b.setAttribute('aria-pressed',String(index===0));b.setAttribute('aria-label',`Elegir escena ${item.title}`);
    const im=document.createElement('img');im.loading='lazy';im.decoding='async';im.src=item.thumb;im.alt=`Santa esparciendo polvo de estrellas: ${item.title}`;im.width=270;im.height=480;im.loading='lazy';const label=document.createElement('strong');label.textContent=item.title;b.append(im,label);b.addEventListener('click',()=>{selectScene(index);form.scrollIntoView({behavior:'smooth',block:'start'});});$('#sl-gallery').append(b);
  });
  scene.addEventListener('change',()=>selectScene(Number(scene.value)));
  name.addEventListener('input',()=>{audioState(true);invalidate();render();});
  action.addEventListener('input',()=>{invalidate();render();});
  list.addEventListener('change',()=>{if(list.value==='good'&&voice.value==='none')voice.value=previousVoice;audioState();invalidate();render();});
  voice.addEventListener('change',()=>{if(voice.value!=='none')previousVoice=voice.value;audioState();invalidate();});
  for(const track of tracks)musicSelect.append(new Option(track.title,track.id));
  musicSelect.addEventListener('change',()=>{musicState();invalidate();draw();});
  $('#sl-music').addEventListener('change',()=>{musicState();invalidate();draw();});
  form.addEventListener('submit',async e=>{e.preventDefault();if(valid()){invalidate();if(await render())status.textContent='¡Tu tarjeta está lista! Puedes ver la animación o descargarla.';}});
  $('#sl-play').addEventListener('click',preview);$('#sl-video').addEventListener('click',exportVideo);
  $('#sl-cancel').addEventListener('click',()=>{++jobId;worker?.terminate();worker=null;workerPromise=null;lock(false);draw();status.textContent='Video cancelado. Puedes intentarlo de nuevo.';});
  $('#sl-png').addEventListener('click',async()=>{if(!valid())return;stopPreview();if(await render())save(await blobOf(canvas),filename()+'.png');});
  $('#sl-pdf').addEventListener('click',async()=>{if(!valid())return;stopPreview();if(!await render())return;const doc=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4'});const h=277,w=h*9/16;doc.addImage(canvas.toDataURL('image/jpeg',.94),'JPEG',(210-w)/2,10,w,h);doc.save(filename()+'.pdf');});
  $('#sl-share-image').addEventListener('click',async()=>{if(!valid())return;stopPreview();if(await render())await share(await blobOf(canvas),filename()+'.png','Mi tarjeta de Santa');});
  $('#sl-share-video').addEventListener('click',async()=>{if(videoBlob)await share(videoBlob,videoName,'Mi video de Santa');});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&animating){stopPreview();draw();}});
  window.addEventListener('aldea:navigate',()=>{if(animating){stopPreview();draw();}});
  for(const label of [...new Set(nameCatalog.flatMap(r=>[r.name,...(r.aliases||[])]))].sort((a,b)=>a.localeCompare(b,'es')))$('#sl-name-options').append(new Option(label,label));
  musicState();audioState();(window.ALDEA_WHEN_SHOWN||((i,f)=>f()))('buenos',render);
})();
