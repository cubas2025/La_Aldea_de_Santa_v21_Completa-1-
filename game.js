(() => {
'use strict';
/* «Regalos en los techos»: Santa vuela sobre la aldea y suelta regalos.
   Chimenea = 3 puntos (con racha se duplican), tejado = 1 punto. Partidas de 60 segundos. */
const $=s=>document.querySelector(s);
const canvas=$('#game-canvas');if(!canvas)return;
const ctx=canvas.getContext('2d'),W=600,H=900;
const scoreEl=$('#game-score'),timeEl=$('#game-time'),bestEl=$('#game-best'),startBtn=$('#game-start'),overlay=$('#game-overlay'),msgEl=$('#game-message'),soundBtn=$('#game-sound');
const GROUND=820,SLEIGH_X=150,GRAV=1500,DURATION=60;
const BEST_KEY='aldea-game-best';
let best=0;try{best=Number(localStorage.getItem(BEST_KEY))||0;}catch{}
let state='idle',raf=0,last=0,time=DURATION,score=0,streak=0,delivered=0,speed=170,houses=[],gifts=[],pops=[],snow=[],stars=[],cooldown=0,bob=0,sound=true,audio=null;

for(let i=0;i<70;i++)stars.push({x:Math.random()*W,y:Math.random()*520,r:Math.random()*1.6+.4,t:Math.random()*6});
for(let i=0;i<60;i++)snow.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2.2+.8,v:30+Math.random()*50});
const COLORS=['#c8423b','#3f7a5a','#d79a3b','#5a6fb5','#8b4f8f','#b5643c'];
function newHouse(x){
  const w=150+Math.random()*90,h=150+Math.random()*120,roof=60+Math.random()*30;
  const chimX=x+w*(.2+Math.random()*.55);
  return {x,w,h,roof,color:COLORS[Math.floor(Math.random()*COLORS.length)],chim:{x:chimX,w:34,h:46},got:false,lights:Math.random()<.6};
}
function reset(){
  time=DURATION;score=0;streak=0;delivered=0;speed=170;gifts=[];pops=[];cooldown=0;
  houses=[];let x=260;while(x<W+400){const h=newHouse(x);houses.push(h);x+=h.w+40+Math.random()*80;}
  updateHud();
}
function updateHud(){scoreEl.textContent=score;timeEl.textContent=Math.ceil(time);bestEl.textContent=best;}

/* Sonidos cortos sintetizados (sin archivos). */
function beep(freq,dur,type='sine',vol=.08){
  if(!sound)return;try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+dur);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+dur);}catch{}
}
const jingle=()=>{beep(880,.12,'triangle');setTimeout(()=>beep(1175,.16,'triangle'),90);};

function drop(){
  if(state!=='play'||cooldown>0)return;
  cooldown=.32;gifts.push({x:SLEIGH_X+10,y:205+Math.sin(bob)*8,vy:60,color:COLORS[Math.floor(Math.random()*COLORS.length)],rot:0});beep(520,.06,'square',.04);
}
function roofY(h,x){ // altura del tejado a dos aguas en la posición x
  const top=GROUND-h.h-h.roof,base=GROUND-h.h,mid=h.x+h.w/2,half=h.w/2+12;
  const d=Math.abs(x-mid)/half;return d>1?null:top+(base-top)*d;
}
function land(g){
  for(const h of houses){
    if(g.x<h.x-12||g.x>h.x+h.w+12)continue;
    const c=h.chim,cTop=roofY(h,c.x+c.w/2)-c.h+10;
    if(g.x>c.x-6&&g.x<c.x+c.w+6&&g.y>=cTop&&g.y<cTop+40){
      if(h.got){pop(g.x,cTop,'Ya tiene regalo','#ffe7b0');streak=0;return true;}
      streak++;const pts=3*(streak>=3?2:1);score+=pts;delivered++;h.got=true;pop(g.x,cTop-10,streak>=3?`¡Racha! +${pts}`:`¡Chimenea! +${pts}`,'#ffd84d');jingle();return true;
    }
    const ry=roofY(h,g.x);
    if(ry!==null&&g.y>=ry){
      if(h.got){pop(g.x,ry,'Ya tiene regalo','#ffe7b0');streak=0;return true;}
      score+=1;delivered++;h.got=true;streak=0;pop(g.x,ry-10,'+1','#ffffff');beep(660,.1,'triangle');return true;
    }
  }
  if(g.y>=GROUND-6){streak=0;pop(g.x,GROUND-20,'¡Ups!','#9fd3ff');beep(200,.15,'sawtooth',.03);return true;}
  return false;
}
function pop(x,y,text,color){pops.push({x,y,text,color,t:1});}

function update(dt){
  time-=dt;if(time<=0){time=0;end();return;}
  speed=170+(DURATION-time)*3.2;bob+=dt*3;cooldown=Math.max(0,cooldown-dt);
  for(const h of houses){h.x-=speed*dt;h.chim.x-=speed*dt;}
  if(houses.length&&houses[0].x+houses[0].w<-40)houses.shift();
  const lastH=houses[houses.length-1];if(!lastH||lastH.x+lastH.w<W+60){const nx=(lastH?lastH.x+lastH.w:W)+40+Math.random()*90;houses.push(newHouse(nx));}
  gifts=gifts.filter(g=>{g.vy+=GRAV*dt;g.y+=g.vy*dt;g.rot+=dt*4;return !land(g);});
  pops=pops.filter(p=>(p.t-=dt*1.1)>0);
  for(const s of snow){s.y+=s.v*dt;s.x-=speed*dt*.15;if(s.y>H){s.y=-5;s.x=Math.random()*W;}if(s.x<0)s.x+=W;}
  updateHud();
}

/* Dibujo */
function sky(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0b1838');g.addColorStop(.6,'#1d2f63');g.addColorStop(1,'#3b4f8a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(const s of stars){ctx.globalAlpha=.5+.5*Math.sin(s.t+=.02);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill();}ctx.globalAlpha=1;
  ctx.fillStyle='#fff6d6';ctx.beginPath();ctx.arc(480,110,46,0,7);ctx.fill();ctx.fillStyle='#0b1838';ctx.globalAlpha=.25;ctx.beginPath();ctx.arc(498,98,40,0,7);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle='#22345f';ctx.beginPath();ctx.moveTo(0,700);for(let x=0;x<=W;x+=60)ctx.lineTo(x,660+Math.sin(x*.012)*30);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
}
function house(h){
  const top=GROUND-h.h,roofTop=top-h.roof;
  ctx.fillStyle=h.color;ctx.fillRect(h.x,top,h.w,h.h);
  ctx.fillStyle='#4a2a22';const c=h.chim,cBase=roofY(h,c.x+c.w/2)+8;ctx.fillRect(c.x,cBase-c.h-8,c.w,c.h+8);ctx.fillStyle='#f4f4f4';ctx.fillRect(c.x-4,cBase-c.h-14,c.w+8,10);
  ctx.fillStyle='#7a2f2a';ctx.beginPath();ctx.moveTo(h.x-12,top);ctx.lineTo(h.x+h.w/2,roofTop);ctx.lineTo(h.x+h.w+12,top);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(h.x-14,top+2);ctx.lineTo(h.x+h.w/2,roofTop-6);ctx.lineTo(h.x+h.w+14,top+2);ctx.lineTo(h.x+h.w+4,top+8);ctx.lineTo(h.x+h.w/2,roofTop+6);ctx.lineTo(h.x-4,top+8);ctx.closePath();ctx.fill();
  const lit=h.got||h.lights;ctx.fillStyle=lit?'#ffd36b':'#26304d';
  for(const fx of [.22,.62]){ctx.fillRect(h.x+h.w*fx,top+34,h.w*.18,h.w*.18);}
  ctx.fillStyle='#3b2416';ctx.fillRect(h.x+h.w*.42,GROUND-62,h.w*.17,62);
  if(h.got){ctx.font='700 28px "DM Sans",sans-serif';ctx.textAlign='center';ctx.fillText('🎁',h.x+h.w/2,top+h.h*.62);}
  else{ctx.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(c.x+c.w/2+Math.sin(bob+i)*6,cBase-c.h-26-i*18,7+i*3,0,7);ctx.fill();}}
}
function sleigh(){
  const y=200+Math.sin(bob)*8,x=SLEIGH_X;
  ctx.save();ctx.translate(x,y);
  // renos
  for(const [dx,dy] of [[150,-26],[105,-18]]){ctx.fillStyle='#8a5a34';ctx.beginPath();ctx.ellipse(dx,dy,24,11,0,0,7);ctx.fill();ctx.beginPath();ctx.arc(dx+24,dy-12,8,0,7);ctx.fill();ctx.strokeStyle='#5a3a20';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(dx+24,dy-18);ctx.lineTo(dx+20,dy-32);ctx.moveTo(dx+28,dy-18);ctx.lineTo(dx+34,dy-30);ctx.stroke();ctx.strokeStyle='#8a5a34';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(dx-12,dy+8);ctx.lineTo(dx-16+Math.sin(bob*3)*4,dy+24);ctx.moveTo(dx+12,dy+8);ctx.lineTo(dx+16-Math.sin(bob*3)*4,dy+24);ctx.stroke();}
  ctx.fillStyle='#e8212f';ctx.beginPath();ctx.arc(180,-40,4.5,0,7);ctx.fill();
  ctx.strokeStyle='#d7b46a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(40,-6);ctx.lineTo(90,-18);ctx.stroke();
  // trineo
  ctx.fillStyle='#b9142b';ctx.beginPath();ctx.moveTo(-50,-20);ctx.lineTo(40,-20);ctx.quadraticCurveTo(52,-20,48,0);ctx.lineTo(44,14);ctx.lineTo(-44,14);ctx.quadraticCurveTo(-60,-6,-50,-20);ctx.fill();
  ctx.strokeStyle='#e7c06a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-50,24);ctx.lineTo(50,24);ctx.quadraticCurveTo(66,24,62,10);ctx.stroke();
  // Santa
  ctx.fillStyle='#d4202f';ctx.beginPath();ctx.arc(-6,-34,20,0,7);ctx.fill();
  ctx.fillStyle='#f6d2b5';ctx.beginPath();ctx.arc(-4,-58,12,0,7);ctx.fill();
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(-4,-48,12,0,Math.PI);ctx.fill();
  ctx.fillStyle='#d4202f';ctx.beginPath();ctx.moveTo(-16,-64);ctx.lineTo(10,-64);ctx.lineTo(-14,-86);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-14,-86,4,0,7);ctx.fill();ctx.fillRect(-18,-67,30,6);
  // saco
  ctx.fillStyle='#7a4a2a';ctx.beginPath();ctx.arc(-40,-30,16,0,7);ctx.fill();
  ctx.restore();
}
function gift(g){ctx.save();ctx.translate(g.x,g.y);ctx.rotate(Math.sin(g.rot)*.3);ctx.fillStyle=g.color;ctx.fillRect(-11,-11,22,22);ctx.fillStyle='#ffe28a';ctx.fillRect(-2.5,-11,5,22);ctx.fillRect(-11,-2.5,22,5);ctx.restore();}
function draw(){
  sky();
  for(const h of houses)house(h);
  ctx.fillStyle='#eef4ff';ctx.fillRect(0,GROUND,W,H-GROUND);
  sleigh();for(const g of gifts)gift(g);
  ctx.fillStyle='#fff';for(const s of snow){ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill();}ctx.globalAlpha=1;
  ctx.textAlign='center';ctx.font='800 30px "DM Sans",sans-serif';
  for(const p of pops){ctx.globalAlpha=Math.max(0,p.t);ctx.fillStyle=p.color;ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=4;const y=p.y-(1-p.t)*50;ctx.strokeText(p.text,p.x,y);ctx.fillText(p.text,p.x,y);}ctx.globalAlpha=1;
  if(streak>=2&&state==='play'){ctx.font='700 22px "DM Sans",sans-serif';ctx.fillStyle='#ffd84d';ctx.fillText(`Racha ×${streak}`,W/2,60);}
}
function loop(t){
  const dt=Math.min(.05,(t-last)/1000||0);last=t;
  if(state==='play')update(dt);
  draw();
  if(state==='play')raf=requestAnimationFrame(loop);
}
function start(){
  reset();state='play';overlay.hidden=true;last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);canvas.focus({preventScroll:true});
}
function end(){
  state='over';cancelAnimationFrame(raf);
  const record=score>best;if(record){best=score;try{localStorage.setItem(BEST_KEY,String(best));}catch{}}
  updateHud();draw();
  const who=($('#game-name')?.value||'').trim();
  msgEl.innerHTML=`<strong>${record?'¡Nuevo récord! 🏆':'¡Tiempo!'}</strong><span>${who?who+', entregaste':'Entregaste'} ${delivered} regalo${delivered===1?'':'s'} y sumaste ${score} punto${score===1?'':'s'}.</span>`;
  startBtn.textContent='Jugar otra vez';overlay.hidden=false;
  window.dispatchEvent(new CustomEvent('aldea:game-over',{detail:{score,delivered}}));
  shareText=`🎅🎁 ${who?who+' entregó':'Entregué'} ${delivered} regalos con Santa y sumó ${score} puntos en La aldea de Santa. ¿Puedes superarlo? #cubas.ai #laaldeadesanta`;
}
function pause(){if(state==='play'){state='paused';cancelAnimationFrame(raf);overlay.hidden=false;msgEl.innerHTML='<strong>Pausa</strong><span>Toca «Seguir jugando» para continuar.</span>';startBtn.textContent='Seguir jugando';}}
function resume(){state='play';overlay.hidden=true;last=performance.now();raf=requestAnimationFrame(loop);}
let shareText='';

startBtn.addEventListener('click',()=>{if(state==='paused')resume();else start();});
canvas.addEventListener('pointerdown',e=>{e.preventDefault();drop();});
canvas.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'||e.key==='ArrowDown'){e.preventDefault();drop();}});
document.addEventListener('keydown',e=>{if(document.body.dataset.page!=='juego-santa'||state!=='play')return;if(e.target.closest('input,textarea,select'))return;if(e.key===' '){e.preventDefault();drop();}});
soundBtn.addEventListener('click',()=>{sound=!sound;soundBtn.textContent=sound?'🔊 Sonido':'🔇 Sin sonido';soundBtn.setAttribute('aria-pressed',String(sound));});
$('#game-share')?.addEventListener('click',async()=>{
  const text=shareText||'🎅🎁 Juega gratis a entregar regalos con Santa en La aldea de Santa #cubas.ai #laaldeadesanta';const url=location.origin+location.pathname+'#juego-santa';
  if(navigator.share){try{await navigator.share({title:'Regalos en los techos',text,url});return;}catch(err){if(err.name==='AbortError')return;}}
  window.open(`https://wa.me/?text=${encodeURIComponent(text+' '+url)}`,'_blank','noopener');
});
window.addEventListener('aldea:navigate',e=>{if(e.detail.page!=='juego-santa')pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
reset();draw();
})();
