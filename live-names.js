(() => {
'use strict';
/* «Santa lee la lista de los buenos» para el canal en vivo y el modo presentador.
   Cada 10 segundos Santa anuncia un nombre con su propia voz grabada
   («El siguiente / La siguiente en la lista de los buenos es…» + el nombre) y el nombre se escribe
   en el cielo con polvo de estrellas, sincronizado con la voz.
   - Nombres: los aprobados por el creador en /admin (Supabase). Si todavía no hay aprobados,
     se usan los nombres grabados por Santa.
   - Nombres sin grabación: se escriben en el cielo con «Santa también saluda a…», sin decirlos.
     Si existe assets/en-vivo/tambien.wav (grabado por Santa), se reproduce esa frase.
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
const itemFor=slot=>list.length?list[((slot%list.length)+list.length)%list.length]:null;
function namesToday(){const now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),now.getDate());return Math.floor((now-start)/1000/SLOT);}

/* ---------- Audio (WebAudio, solo si el sonido está activado) ---------- */
const bytesCache=new Map();
async function bytes(src){if(!bytesCache.has(src)){if(bytesCache.size>40)bytesCache.delete(bytesCache.keys().next().value);bytesCache.set(src,fetch(src).then(r=>{if(!r.ok)throw new Error('audio');return r.arrayBuffer();}).then(b=>new Uint8Array(b)).catch(e=>{bytesCache.delete(src);throw e;}));}return bytesCache.get(src);}
let alsoAvailable=null;
async function alsoClip(){if(alsoAvailable===null){try{const r=await fetch('assets/en-vivo/tambien.wav',{method:'HEAD'});alsoAvailable=r.ok;}catch{alsoAvailable=false;}}return alsoAvailable?'assets/en-vivo/tambien.wav':null;}

function create({canvas,label='Lista de los buenos',onName}={}){
  const ctx=canvas.getContext('2d');
  let running=false,raf=0,sound=false,audio=null,gain=null,current=-1,prepared=new Map(),playing=null,lastAnnounced=-1;
  const ensureAudio=()=>{if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();gain=audio.createGain();gain.gain.value=1;gain.connect(audio.destination);}if(audio.state==='suspended')audio.resume().catch(()=>{});return audio;};
  async function prepare(slot){
    if(prepared.has(slot))return prepared.get(slot);
    const it=itemFor(slot);if(!it)return null;
    const p=(async()=>{
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
  function approx(slot){const it=itemFor(slot);if(!it)return null;const g=it.rec?.gender==='girl'?'girl':'boy';return {name:it.name,recorded:!!it.rec,revealAt:VOICE_AT+(it.rec?APPROX_ANNOUNCE[g]+.04:.6),write:WRITE};}
  function chime(){if(!audio)return;const t0=audio.currentTime;[1318,1760,2093].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t0+i*.09);g.gain.exponentialRampToValueAtTime(.12,t0+i*.09+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+i*.09+.7);o.connect(g).connect(gain);o.start(t0+i*.09);o.stop(t0+i*.09+.8);});}
  let meta=new Map();
  /* Si la lista cambia (por ejemplo, apruebas nombres nuevos), se descarta lo preparado. */
  window.addEventListener('aldea:live-names',()=>{prepared.clear();meta.clear();current=-1;});
  function frame(){
    if(!running)return;
    const now=Date.now(),slot=slotOf(now),t=(now/1000)%SLOT;
    if(slot!==current){
      current=slot;playing?.stop?.();playing=null;
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
        if(full.buffer&&late<full.buffer.duration-.3){const src=audio.createBufferSource();src.buffer=full.buffer;src.connect(gain);src.start(0,late);playing=src;}
        else if(full.chime)setTimeout(chime,Math.max(0,(full.revealAt-VOICE_AT-late)*1000));
      });
    }
    if(m&&lastNamed!==slot&&t>=m.revealAt){lastNamed=slot;onName?.(m.name,m.recorded);}
    draw(m,t);
    raf=requestAnimationFrame(frame);
  }
  let lastNamed=-1;
  function draw(m,t){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(!m)return;
    const fade=t>FADE_AT?Math.max(0,1-(t-FADE_AT)/(SLOT-FADE_AT)):1;
    ctx.save();ctx.globalAlpha=fade;
    const header=Math.min(1,Math.max(0,(t-.2)/.6));
    if(header>0){
      ctx.globalAlpha=fade*header;ctx.textAlign='center';ctx.font='700 46px Georgia,serif';ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=14;ctx.fillStyle='#ffe7b0';
      ctx.fillText(m.recorded?`✦ ${label} ✦`:'✦ Santa también saluda a ✦',540,175);
      ctx.shadowBlur=0;ctx.globalAlpha=fade;
    }
    stardust.draw(ctx,m.name,t,m.revealAt,m.write,{size:230,maxWidth:930,y:440});
    ctx.restore();
  }
  return {
    async start(){if(running)return;running=true;await loadList();current=-1;lastAnnounced=-1;lastNamed=-1;raf=requestAnimationFrame(frame);},
    stop(){running=false;cancelAnimationFrame(raf);playing?.stop?.();playing=null;ctx.clearRect(0,0,canvas.width,canvas.height);},
    setSound(on){sound=!!on;prepared.clear();lastAnnounced=-1;if(on){ensureAudio();}else{playing?.stop?.();playing=null;}},
    get count(){return list.length;},get source(){return source;},
    refresh:()=>loadList(true)
  };
}
window.ALDEA_LIVE_NAMES={create,loadList,namesToday,get count(){return list.length;},get source(){return source;}};
})();
