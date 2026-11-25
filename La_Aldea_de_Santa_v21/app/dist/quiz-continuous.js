(() => {
'use strict';
const KEY='aldea-quiz-progress-v1';let saved={seen:[],counter:'0'};
try{saved={...saved,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{}
if(!Array.isArray(saved.seen))saved.seen=[];if(!/^\d+$/.test(String(saved.counter)))saved.counter='0';
const seen=new Set(saved.seen),persist=()=>{try{localStorage.setItem(KEY,JSON.stringify({seen:[...seen].slice(-2000),counter:saved.counter}));}catch{}};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const numeric=(id,category,level,question,answer,explanation)=>({id,category,level,question,answer:String(answer),wrong:[String(answer+1n),String(answer+3n)],explanation,generated:true});
function generate(level=1,category='all'){
const k=BigInt(saved.counter);saved.counter=String(k+1n);persist();
const step=BigInt(level+1),a=k+BigInt(5*level+4),b=k%9n+2n,c=k%5n+1n,id='continuous-'+k,type=Number(k%6n),name=['Ana','Mateo','Lucía','Diego','Sara','Liam'][Number(k%6n)];
if(category==='verbal'||(category==='all'&&type===5))return numeric(id,'verbal',level,`${name} preparó ${a} tarjetas y entregó ${b}. Guardó las demás en una caja. ¿Cuántas tarjetas se entiende que guardó?`,a-b,`«Las demás» son las que quedaron: ${a} − ${b} = ${a-b}.`);
if(category==='ciencias')return numeric(id,'ciencias',level,`Una masa de ${a} gramos recibe ${b} gramos más. ¿Qué masa total marca la balanza, en gramos?`,a+b,`Las masas se suman: ${a} + ${b} = ${a+b} gramos.`);
if(type===0)return numeric(id,'matematico',level,`${name} tiene ${a} estrellas, recibe ${b} y regala ${c}. ¿Cuántas conserva?`,a+b-c,`${a} + ${b} − ${c} = ${a+b-c}.`);
if(type===1)return numeric(id,'matematico',level,`Hay ${a} cajas con ${b} adornos cada una. ¿Cuántos adornos hay?`,a*b,`${a} × ${b} = ${a*b}.`);
if(type===2)return numeric(id,'matematico',level,`Reparte ${a*b} galletas en ${b} grupos iguales. ¿Cuántas recibe cada grupo?`,a,`${a*b} ÷ ${b} = ${a}.`);
if(type===3)return numeric(id,'matematico',level,`La secuencia sigue una suma constante: ${a}, ${a+step}, ${a+step*2n}, ${a+step*3n}. ¿Cuál sigue?`,a+step*4n,`Se suma ${step}. El siguiente es ${a+step*4n}.`);
if(type===4)return numeric(id,'matematico',level,`Un rectángulo mide ${a} metros de largo y ${b} de ancho. ¿Cuál es su perímetro, en metros?`,2n*(a+b),`2 × (${a} + ${b}) = ${2n*(a+b)} metros.`);
return numeric(id,'matematico',level,`Compras ${b} cintas a ${a} soles cada una y pagas ${a*b+c}. ¿Cuántos soles de vuelto recibes?`,c,`El costo es ${a*b}; ${a*b+c} − ${a*b} = ${c}.`);
}
window.SANTA_QUIZ_FLOW={generate,total:()=>window.SANTA_QUIZ.length,remaining:(l,c)=>window.SANTA_QUIZ.filter(q=>q.level===l&&(c==='all'||q.category===c)&&!seen.has(q.id)).length,round(l,c,continuous){const pool=shuffle(window.SANTA_QUIZ.filter(q=>q.level===l&&(c==='all'||q.category===c)&&!seen.has(q.id))),r=pool.slice(0,10);r.forEach(q=>seen.add(q.id));if(continuous){while(r.length<10)r.push(generate(l,c));}else if(r.length<10){for(const q of shuffle(window.SANTA_QUIZ.filter(q=>q.level===l&&(c==='all'||q.category===c)&&!r.includes(q)))){if(r.length===10)break;r.push(q);}}persist();return r;}};
})();
