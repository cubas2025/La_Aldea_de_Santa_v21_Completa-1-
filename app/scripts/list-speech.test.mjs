import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import vm from 'node:vm';

let now=0;
const context=vm.createContext({window:{},performance:{now:()=>now}});
for(const file of ['name-audio-data.js','list-speech.js'])vm.runInContext(readFileSync(new URL('../../'+file,import.meta.url),'utf8'),context);
const {SANTA_NAME_AUDIO:catalog,SANTA_LIST_SPEECH:sync}=context.window;
const bytes=path=>new Uint8Array(readFileSync(new URL('../../'+path,import.meta.url)));
const announcements=Object.fromEntries(Object.entries(sync.voices).map(([gender,path])=>[gender,bytes(path)]));
let checked=0,longest=0;
for(const recording of catalog){
 const name=bytes(recording.src),namePCM=sync.pcm(name),lead=Math.round((recording.lead||0)*44100)*2;
 for(const [gender,first] of Object.entries(announcements)){
  const result=sync.compose(first,name,recording),firstPCM=sync.pcm(first),out=sync.pcm(result.data),split=firstPCM.length;
  assert.equal(result.revealAt,split/88200);
  assert.ok(result.nameAt>result.revealAt&&result.nameAt-result.revealAt<1/24,'Name voice follows reveal within one output frame');
  assert.deepEqual(Buffer.from(out.subarray(0,split)),Buffer.from(firstPCM),'Complete announcement retained');
  assert.ok(out.subarray(split,split+3528).every(n=>n===0),'No overlapping name before announcement ends');
  assert.deepEqual(Buffer.from(out.subarray(split+3528)),Buffer.from(namePCM.subarray(lead)),'Only the selected name, with its catalogued lead removed');
  assert.ok(result.revealAt+result.writeDuration<=result.nameEnd+.001,'Letters finish before the name finishes');
  assert.ok(result.nameEnd<12,'Every available name finishes within the shortest video');
  longest=Math.max(longest,result.nameEnd);checked++;
 }
}
assert.equal(sync.find(catalog,'Jazmin').name,'Jazmin');
assert.equal(sync.find(catalog,'María').name,'María');
assert.equal(sync.find(catalog,'nombre inexistente para prueba'),undefined);
assert.throws(()=>sync.pcm(new Uint8Array(10)),/incompleta/);
const audio=new EventTarget();audio.currentTime=0;audio.duration=6;
const clock=sync.clock(audio);now=8000;assert.equal(clock.time(),0,'A stalled audio track must not advance the reveal');
audio.currentTime=4.24;assert.equal(clock.time(),4.24);audio.dispatchEvent(new Event('ended'));now=9000;assert.equal(clock.time(),7,'Animation continues after the joined speech ends');
mkdirSync('/tmp/santa-sync-qa',{recursive:true});
for(const [name,gender] of [['Mateo','boy'],['Jazmin','girl']]){
 const recording=sync.find(catalog,name),result=sync.compose(announcements[gender],bytes(recording.src),recording);
 writeFileSync('/tmp/santa-sync-qa/expected-'+name+'.wav',result.data);
}
console.log(JSON.stringify({passed:true,recordings:catalog.length,combinations:checked,longestNameEndsAt:longest}));
