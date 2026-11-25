/* Both studios use the same joined recording and its exact PCM sample positions. */
(() => {
 'use strict';
 const RATE=44100,GAP=1764; // Reveal, then speak 40 milliseconds later.
 const voices=Object.freeze({boy:'assets/lista-video/voz-nino.wav',girl:'assets/lista-video/voz-nina.wav'});
 const exact=s=>s.trim().normalize('NFC').replace(/\s+/g,' ').toLocaleLowerCase('es');
 const fold=s=>exact(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 function find(catalog,name){const labels=r=>[r.name,...(r.aliases||[])],match=catalog.find(r=>labels(r).some(n=>exact(n)===exact(name)));if(match)return match;const matches=catalog.filter(r=>labels(r).some(n=>fold(n)===fold(name)));return matches.length===1?matches[0]:undefined;}
 function pcm(bytes){
  if(bytes.length<44)throw new Error('La grabación está incompleta.');
  const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),tag=i=>String.fromCharCode(...bytes.subarray(i,i+4));
  if(tag(0)!=='RIFF'||tag(8)!=='WAVE')throw new Error('La grabación no es un WAV válido.');
  let data,rate=0,channels=0,depth=0,format=0;
  for(let i=12;i+8<=bytes.length;){const size=v.getUint32(i+4,true);if(i+8+size>bytes.length)throw new Error('La grabación está incompleta.');if(tag(i)==='fmt '&&size>=16){format=v.getUint16(i+8,true);channels=v.getUint16(i+10,true);rate=v.getUint32(i+12,true);depth=v.getUint16(i+22,true);}if(tag(i)==='data')data=bytes.subarray(i+8,i+8+size);i+=8+size+(size%2);}
  if(!data?.length||data.length%2||format!==1||rate!==RATE||channels!==1||depth!==16)throw new Error('Formato de grabación incompatible.');return data;
 }
 function compose(announcement,nameBytes,recording){
  const first=pcm(announcement),original=pcm(nameBytes),lead=Math.min(original.length/2-1,Math.max(0,Math.round((recording.lead||0)*RATE))),second=original.subarray(lead*2);
  const data=new Uint8Array(44+first.length+GAP*2+second.length),v=new DataView(data.buffer),chars=(i,s)=>{for(let j=0;j<s.length;j++)data[i+j]=s.charCodeAt(j);};
  chars(0,'RIFF');v.setUint32(4,data.length-8,true);chars(8,'WAVE');chars(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,RATE,true);v.setUint32(28,RATE*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);chars(36,'data');v.setUint32(40,data.length-44,true);data.set(first,44);data.set(second,44+first.length+GAP*2);
  const revealAt=first.length/(RATE*2),nameAt=revealAt+GAP/RATE,nameDuration=second.length/(RATE*2);
  return {data,revealAt,nameAt,nameEnd:nameAt+nameDuration,writeDuration:Math.max(.2,Math.min(1.2,nameDuration)),duration:(data.length-44)/(RATE*2)};
 }
 async function prepare(gender,recording,fetchBytes){if(!voices[gender]||!recording)throw new Error('Elige un nombre con grabación disponible o selecciona «Sin voz».');const [announcement,name]=await Promise.all([fetchBytes(voices[gender]),fetchBytes(recording.src)]);return compose(announcement,name,recording);}
 function clock(audio){let endedAt=null,end=0;audio.addEventListener('ended',()=>{end=Number.isFinite(audio.duration)?audio.duration:audio.currentTime;endedAt=performance.now();},{once:true});return {time(now=performance.now()){return endedAt===null?audio.currentTime:end+(now-endedAt)/1000;}};}
 window.SANTA_LIST_SPEECH=Object.freeze({voices,find,pcm,compose,prepare,clock});
})();
