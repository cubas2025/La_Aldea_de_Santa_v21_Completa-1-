(() => {
'use strict';
/* «Santa lee la lista de los buenos» para el canal en vivo y el modo presentador.
   Cada 10 segundos Santa anuncia un nombre y el nombre se escribe en el cielo con polvo de estrellas,
   sincronizado con la voz. Tres idiomas, nunca mezclados:
   - es: voz grabada de Santa («El siguiente / La siguiente en la lista de los buenos es…» + nombre).
   - en: voz profesional generada (Orion) o, si falta, la voz en inglés del dispositivo.
   - pt: audios generados en portugués si existen o, si no, la voz pt-BR del dispositivo.
   - Nombres: los aprobados por el creador en /admin (Supabase). Si todavía no hay aprobados,
     se usan los nombres grabados por Santa.
   - El orden va con la hora: todos los visitantes ven el mismo nombre al mismo tiempo. */
const SLOT=10, VOICE_AT=.6, WRITE=1.5, FADE_AT=9.2;
const APPROX_ANNOUNCE={boy:4.2,girl:3.9};
const speech=window.SANTA_LIST_SPEECH, stardust=window.SANTA_STARDUST, catalog=window.SANTA_NAME_AUDIO||[];
if(!speech||!stardust)return;

/* ---------- Lista de nombres (compartida) ---------- */
const hash=s=>{let h=2166136261;for(const ch of s){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;};
let list=[],source='',loadedAt=0,loading=null;
function build(items){
  const seen=new Set(),out=[];
  for(const it of items){const key=it.name.toLocaleLowerCase('es');if(seen.has(key))continue;seen.add(key);out.push(it);}
  return out.sort((a,b)=>hash(a.name)-hash(b.name)||a.name.localeCompare(b.name,'es'));
}
async function loadList(force=false){
  if(!force&&list.length&&Date.now()-loadedAt<300000)return list;
  if(loading)return loading;
  loading=(async()=>{
    let items=[];
    if(window.ALDEA_DB?.configured){
      try{items=(await window.ALDEA_DB.liveNames()).map(r=>({name:r.nombre,rec:speech.find(catalog,r.nombre)||null}));source='aprobados';}catch{items=[];}
    }
    if(!items.length){items=catalog.map(r=>({name:r.name,rec:r}));source='grabados';}
    list=build(items);loadedAt=Date.now();loading=null;
    window.dispatchEvent(new CustomEvent('aldea:live-names',{detail:{count:list.length,source}}));
    return list;
  })();
  return loading;
}
const slotOf=ms=>Math.floor(ms/1000/SLOT);
/* Nombres al aire (enviados en vivo desde /admin): reemplazan al nombre de su turno, igual para todos. */
const onAir=new Map();let onAirStarted=false;
function startOnAir(){
  if(onAirStarted||!window.ALDEA_DB?.configured||!window.ALDEA_DB.watchOnAir)return;onAirStarted=true;
  window.ALDEA_DB.watchOnAir(r=>{const t=Number(r.turno),n=String(r.nombre||'').trim();if(!n||!Number.isFinite(t))return;onAir.set(t,n);
    for(const k of onAir.keys())if(k<slotOf(Date.now())-2)onAir.delete(k);
    window.dispatchEvent(new CustomEvent('aldea:on-air',{detail:{slot:t,name:n,foto:String(r.foto||''),lugar:String(r.lugar||'')}}));}).catch(()=>{onAirStarted=false;});
}
const itemFor=slot=>{const o=onAir.get(slot);if(o)return {name:o,rec:speech.find(catalog,o)||null};return list.length?list[((slot%list.length)+list.length)%list.length]:null;};
function namesToday(){const now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),now.getDate());return Math.floor((now-start)/1000/SLOT);}

/* ---------- Audio (WebAudio, solo si el sonido está activado) ---------- */
const bytesCache=new Map();
async function bytes(src){if(!bytesCache.has(src)){if(bytesCache.size>40)bytesCache.delete(bytesCache.keys().next().value);bytesCache.set(src,fetch(src).then(r=>{if(!r.ok)throw new Error('audio');return r.arrayBuffer();}).then(b=>new Uint8Array(b)).catch(e=>{bytesCache.delete(src);throw e;}));}return bytesCache.get(src);}
let alsoAvailable=null;
async function alsoClip(){if(alsoAvailable===null){try{const r=await fetch('assets/en-vivo/tambien.wav',{method:'HEAD'});alsoAvailable=r.ok;}catch{alsoAvailable=false;}}return alsoAvailable?'assets/en-vivo/tambien.wav':null;}

/* ---------- Idiomas con voz generada o del dispositivo (en, pt) ----------
   Audios propios (si existen, se usan solos):
     inglés:    assets/en-vivo/en/anuncio.mp3  +  assets/nombres-en/<nombre>.mp3
     portugués: assets/en-vivo/pt/anuncio.mp3  +  assets/nombres-pt/<nombre>.mp3
   El nombre se escribe sin tildes del español (Sofía → Sofia), manteniendo el nombre real. */
const slug=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const plain=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').normalize('NFC');
const LANGS={
  en:{voice:/^en([-_]|$)/i,prefer:/^en[-_]us/i,intro:"And now... the next name on Santa's nice list is...",header:"✦ Santa's Nice List ✦",ann:'assets/en-vivo/en/anuncio',dir:'assets/nombres-en',reveal:3.6,
      male:/guy|andrew|brian|christopher|eric|davis|roger|steffan|ryan|thomas|arthur|daniel|aaron|male/i,label:'inglés'},
  pt:{voice:/^pt([-_]|$)/i,prefer:/^pt[-_]br/i,intro:'E agora... o próximo nome da lista dos bonzinhos do Papai Noel é...',header:'✦ Lista dos bonzinhos ✦',ann:'assets/en-vivo/pt/anuncio',dir:'assets/nombres-pt',reveal:4.2,
      male:/antonio|ant[oô]nio|daniel|fabio|f[aá]bio|humberto|julio|j[uú]lio|nicolau|valerio|donato|duarte|male/i,label:'portugués'}
};
const headCache=new Map();
function exists(url){if(!headCache.has(url))headCache.set(url,fetch(url,{method:'HEAD'}).then(r=>r.ok).catch(()=>false));return headCache.get(url);}
async function firstExisting(base){for(const ext of ['mp3','wav'])if(await exists(`${base}.${ext}`))return `${base}.${ext}`;return null;}
async function langFiles(L,name){
  const ann=await firstExisting(L.ann);if(!ann)return null;
  const file=await firstExisting(`${L.dir}/${slug(name)}`);
  return file?{ann,file}:null;
}
/* Voz del dispositivo: la más natural disponible del idioma; nunca una de otro idioma. */
const voiceCache={};
function rankVoice(L,v){
  const n=v.name;let s=0;
  if(/natural|neural/i.test(n))s+=60;
  if(/premium|enhanced|siri/i.test(n))s+=50;
  if(/google/i.test(n))s+=40;
  if(!v.localService)s+=10;
  if(L.prefer.test(v.lang))s+=8;
  if(L.male.test(n)&&!/female/i.test(n))s+=15;
  if(/desktop|espeak|robot/i.test(n))s-=30;
  return s;
}
function langVoice(code){
  const L=LANGS[code];if(!L)return null;
  if(voiceCache[code])return voiceCache[code];
  const vs=(window.speechSynthesis?.getVoices?.()||[]).filter(v=>L.voice.test(v.lang));
  voiceCache[code]=vs.sort((a,b)=>rankVoice(L,b)-rankVoice(L,a))[0]||null;
  return voiceCache[code];
}
window.speechSynthesis?.addEventListener?.('voiceschanged',()=>{for(const k in voiceCache)delete voiceCache[k];});
function speakLang(code,name,onName){
  const synth=window.speechSynthesis,voice=langVoice(code),L=LANGS[code];if(!synth||!voice)return false;
  synth.cancel();
  /* Entonación: frase cálida y pausada, una breve pausa y el nombre con énfasis. */
  const mk=(text,rate,pitch)=>{const u=new SpeechSynthesisUtterance(text);u.voice=voice;u.lang=voice.lang;u.rate=rate;u.pitch=pitch;u.volume=1;return u;};
  const intro=mk(L.intro,.88,.95),who=mk(`${plain(name)}!`,.82,1.05);
  who.onstart=()=>onName?.();
  synth.speak(intro);
  intro.onend=()=>setTimeout(()=>synth.speak(who),280);
  return true;
}

function create({canvas,label='Lista de los buenos',onName,onSpeak,layout=null}={}){
  /* layout (opcional, formato horizontal): {scale,x,y,headerY,nameY,size,maxWidth} */
  const L0={scale:1,x:0,y:0,headerY:175,nameY:440,size:230,maxWidth:930,...(layout||{})};
  const ctx=canvas.getContext('2d');
  let running=false,raf=0,sound=false,audio=null,gain=null,current=-1,prepared=new Map(),playing=null,lastAnnounced=-1,lang='es';
  const stopVoice=()=>{playing?.stop?.();playing=null;if(lang!=='es')window.speechSynthesis?.cancel();};
  const ensureAudio=()=>{if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();gain=audio.createGain();gain.gain.value=1;gain.connect(audio.destination);}if(audio.state==='suspended')audio.resume().catch(()=>{});return audio;};
  async function prepare(slot){
    if(prepared.has(slot))return prepared.get(slot);
    const it=itemFor(slot);if(!it)return null;
    const code=lang;
    const p=(async()=>{
      if(code!=='es'){
        const L=LANGS[code],shown=plain(it.name);
        const files=sound?await langFiles(L,it.name):null;
        if(files){
          const ctxA=ensureAudio(),[a,b]=await Promise.all([files.ann,files.file].map(async u=>ctxA.decodeAudioData((await bytes(u)).buffer.slice(0))));
          const gap=Math.round(.06*ctxA.sampleRate),out=ctxA.createBuffer(1,a.length+gap+b.length,ctxA.sampleRate);
          out.getChannelData(0).set(a.getChannelData(0),0);out.getChannelData(0).set(b.getChannelData(0),a.length+gap);
          return {name:shown,raw:it.name,recorded:true,header:L.header,revealAt:VOICE_AT+a.duration+.06,write:Math.max(WRITE,b.duration+.6),buffer:out};
        }
        return {name:shown,raw:it.name,recorded:true,header:L.header,revealAt:VOICE_AT+L.reveal,write:WRITE,tts:sound&&!!langVoice(code)};
      }
      if(it.rec){
        const gender=it.rec.gender==='girl'?'girl':'boy';
        const [ann,nm]=await Promise.all([bytes(speech.voices[gender]),bytes(it.rec.src)]);
        const joined=speech.compose(ann,nm,it.rec);
        const buffer=sound?await ensureAudio().decodeAudioData(joined.data.buffer.slice(0)):null;
        return {name:it.name,recorded:true,revealAt:VOICE_AT+joined.revealAt,write:Math.max(WRITE,joined.writeDuration+.6),buffer};
      }
      const clip=sound?await alsoClip():null;let buffer=null;
      if(clip){try{buffer=await ensureAudio().decodeAudioData((await bytes(clip)).buffer.slice(0));}catch{buffer=null;}}
      return {name:it.name,recorded:false,revealAt:VOICE_AT+(buffer?buffer.duration:.6),write:WRITE,buffer,chime:!buffer};
    })().catch(()=>null);
    prepared.set(slot,p);
    for(const k of prepared.keys())if(k<slot-1)prepared.delete(k);
    return p;
  }
  function approx(slot){
    const it=itemFor(slot);if(!it)return null;
    if(lang!=='es'){const L=LANGS[lang];return {name:plain(it.name),raw:it.name,recorded:true,header:L.header,revealAt:VOICE_AT+L.reveal,write:WRITE};}
    const g=it.rec?.gender==='girl'?'girl':'boy';return {name:it.name,recorded:!!it.rec,revealAt:VOICE_AT+(it.rec?APPROX_ANNOUNCE[g]+.04:.6),write:WRITE};
  }
  function chime(){if(!audio)return;const t0=audio.currentTime;[1318,1760,2093].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t0+i*.09);g.gain.exponentialRampToValueAtTime(.12,t0+i*.09+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+i*.09+.7);o.connect(g).connect(gain);o.start(t0+i*.09);o.stop(t0+i*.09+.8);});}
  let meta=new Map();
  /* Si la lista cambia (por ejemplo, apruebas nombres nuevos), se descarta lo preparado. */
  window.addEventListener('aldea:live-names',()=>{prepared.clear();meta.clear();current=-1;});
  window.addEventListener('aldea:on-air',e=>{const s=e.detail.slot;if(s>current){prepared.delete(s);meta.delete(s);}else if(s===current&&lastAnnounced!==s){prepared.delete(s);meta.delete(s);current=-1;}});
  let lastNamed=-1;
  function frame(){
    if(!running)return;
    const now=Date.now(),slot=slotOf(now),t=(now/1000)%SLOT;
    if(slot!==current){
      current=slot;stopVoice();
      meta.set(slot,approx(slot));
      prepare(slot).then(m=>{if(m)meta.set(slot,m);});
      prepare(slot+1);
      for(const k of meta.keys())if(k<slot-1)meta.delete(k);
    }
    const m=meta.get(slot);
    if(sound&&m&&lastAnnounced!==slot&&t>=VOICE_AT&&t<VOICE_AT+1.2){
      (prepared.get(slot)||prepare(slot)).then(full=>{
        if(!full||current!==slot||lastAnnounced===slot||!sound)return;
        lastAnnounced=slot;meta.set(slot,full);
        const late=Math.max(0,(Date.now()/1000)%SLOT-VOICE_AT);
        if(full.buffer&&late<full.buffer.duration-.3){const src=audio.createBufferSource();src.buffer=full.buffer;src.connect(gain);src.start(0,late);playing=src;onSpeak?.(full.buffer.duration-late);}
        else if(full.tts&&late<.8){onSpeak?.(5);speakLang(lang,full.raw||full.name,()=>{if(current===slot){const at=(Date.now()/1000)%SLOT;meta.set(slot,{...full,revealAt:Math.min(at,SLOT-2)});}});}
        else if(full.chime)setTimeout(chime,Math.max(0,(full.revealAt-VOICE_AT-late)*1000));
      });
    }
    if(m&&lastNamed!==slot&&t>=m.revealAt){lastNamed=slot;onName?.(m.name,m.recorded);}
    draw(m,t);
    raf=requestAnimationFrame(frame);
  }
  function draw(m,t){
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
    if(!m)return;
    ctx.setTransform(L0.scale,0,0,L0.scale,L0.x,L0.y);
    const fade=t>FADE_AT?Math.max(0,1-(t-FADE_AT)/(SLOT-FADE_AT)):1;
    ctx.save();ctx.globalAlpha=fade;
    const header=Math.min(1,Math.max(0,(t-.2)/.6));
    if(header>0){
      ctx.globalAlpha=fade*header;ctx.textAlign='center';ctx.font='700 46px Georgia,serif';ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=14;ctx.fillStyle='#ffe7b0';
      ctx.fillText(m.header||(m.recorded?`✦ ${label} ✦`:'✦ Santa también saluda a ✦'),540,L0.headerY);
      ctx.shadowBlur=0;ctx.globalAlpha=fade;
    }
    stardust.draw(ctx,m.name,t,m.revealAt,m.write,{size:L0.size,maxWidth:L0.maxWidth,y:L0.nameY});
    ctx.restore();
  }
  return {
    async start(){if(running)return;running=true;startOnAir();await loadList();current=-1;lastAnnounced=-1;lastNamed=-1;raf=requestAnimationFrame(frame);},
    stop(){running=false;cancelAnimationFrame(raf);stopVoice();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);},
    setSound(on){sound=!!on;prepared.clear();lastAnnounced=-1;if(on){ensureAudio();}else stopVoice();},
    /* 'es' = solo los audios grabados en español · 'en' inglés · 'pt' portugués (opciones aparte). */
    setLang(l){const next=LANGS[l]?l:'es';if(next===lang)return;stopVoice();lang=next;prepared.clear();meta.clear();current=-1;lastAnnounced=-1;lastNamed=-1;},
    get lang(){return lang;},
    setLabel(l){label=l||'Lista de los buenos';},
    get count(){return list.length;},get source(){return source;},
    refresh:()=>loadList(true)
  };
}
/* Estado de la voz de un idioma para mostrarlo en pantalla. */
async function langStatus(code){
  const L=LANGS[code];if(!L)return {kind:'recorded',label:''};
  if(await firstExisting(L.ann))return {kind:'files',label:code==='en'?'Professional English voice (generated audio)':'Voz profissional em português (áudios gerados)'};
  const v=langVoice(code);
  if(v)return {kind:'device',label:code==='en'?`Device voice: ${v.name}`:`Voz do dispositivo: ${v.name}`};
  return {kind:'none',label:code==='en'?'This device has no English voice installed: names appear in the sky without voice.':'Este dispositivo não tem voz em português instalada: os nomes aparecem no céu sem voz.'};
}
window.ALDEA_LIVE_NAMES={create,loadList,namesToday,langStatus,englishStatus:()=>langStatus('en'),plain,get count(){return list.length;},get source(){return source;},get catalogSize(){return new Set(catalog.map(r=>r.name.toLocaleLowerCase('es'))).size;}};
})();
