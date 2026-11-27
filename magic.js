(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], serif='"Cormorant Garamond", Georgia, serif', sans='"DM Sans", Arial, sans-serif';
const red='#981b31',gold='#eac979',cream='#fff7e6';let toastTimer;
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,6500);}
const imageCache=new Map();function image(src){if(!imageCache.has(src)){imageCache.set(src,new Promise((resolve,reject)=>{let im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;}));}return imageCache.get(src);}
function cover(ctx,im,x,y,w,h){const scale=Math.max(w/im.width,h/im.height),sw=w/scale,sh=h/scale;ctx.drawImage(im,(im.width-sw)/2,(im.height-sh)/2,sw,sh,x,y,w,h);}
function text(ctx,str,x,y,width,size=48,color=cream,align='center',weight='500',lineHeight=1.25){ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${serif}`;ctx.textAlign=align;ctx.textBaseline='top';const words=String(str).split(/\s+/);let line='',lines=[];for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>width&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);for(let i=0;i<lines.length;i++)ctx.fillText(lines[i],x,y+i*size*lineHeight);return y+lines.length*size*lineHeight;}
function boundedText(ctx,str,x,y,width,height,size=44,color=cream){let current=size;for(;current>26;current-=2){ctx.font=`500 ${current}px ${serif}`;let lines=1,line='';for(const word of String(str).split(/\s+/)){let test=line?line+' '+word:word;if(ctx.measureText(test).width>width&&line){lines++;line=word;}else line=test;}if(lines*current*1.25<=height)break;}return text(ctx,str,x,y,width,current,color);}
function fitText(ctx,str,x,y,width,size=95,color=gold){let sz=size;ctx.font=`700 ${sz}px ${serif}`;while(ctx.measureText(str).width>width&&sz>22){sz-=2;ctx.font=`700 ${sz}px ${serif}`;}ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(str,x,y);return y+sz*1.22;}
function star(ctx,x,y,r,fill=gold,stroke=null){ctx.beginPath();for(let i=0;i<10;i++){let a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.43:r;ctx[i?'lineTo':'moveTo'](x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
function frame(ctx,w,h){ctx.strokeStyle=gold;ctx.lineWidth=4;ctx.strokeRect(31,31,w-62,h-62);ctx.lineWidth=1;ctx.strokeRect(44,44,w-88,h-88);for(let i=0;i<35;i++){const x=55+(i*137)% (w-110),y=50+(i*213)%(h-100);if(x<105||x>w-105||y<110||y>h-100)star(ctx,x,y,4+(i%4),i%2?'#f6dc9e':'#fff4d4');}for(const [x,y]of[[58,58],[w-58,58],[58,h-58],[w-58,h-58]])star(ctx,x,y,13,gold);}
async function cardBase(canvas,scene='santa-correo.webp',photoHeight=700){await document.fonts.ready;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,1080,1440);ctx.fillStyle=red;ctx.fillRect(0,0,1080,1440);const im=await image('assets/'+scene);cover(ctx,im,0,0,1080,photoHeight);const grad=ctx.createLinearGradient(0,photoHeight-160,0,photoHeight+70);grad.addColorStop(0,'#981b3100');grad.addColorStop(1,red);ctx.fillStyle=grad;ctx.fillRect(0,photoHeight-160,1080,240);frame(ctx,1080,1440);return ctx;}
function sign(ctx){ctx.fillStyle=gold;ctx.font=`600 33px ${serif}`;ctx.textAlign='center';ctx.fillText('Con cariño, Santa Claus',540,1320);ctx.font=`500 23px ${sans}`;ctx.fillStyle='#eed1bd';ctx.fillText('La aldea de Santa',540,1370);}
let outputs={},outputNames={};function readyOutput(key,name){outputs[key]=true;outputNames[key]=name;document.querySelector(`[data-output="${key}"]`).hidden=false;$('#'+key+'-status').textContent='¡Listo! Puedes descargar, imprimir o compartir tu creación.';}
async function createCard(form){const d=new FormData(form),c=$('#card-canvas'),ctx=await cardBase(c,String(d.get('scene')),680);text(ctx,'Feliz Navidad',540,650,850,98,gold,'center','700');text(ctx,'y próspero Año Nuevo',540,765,880,52,cream);const y=fitText(ctx,String(d.get('to')).trim(),540,855,850,90,gold);text(ctx,wishes[wishIndex],540,Math.max(970,y+18),820,44,cream);if(d.get('from'))text(ctx,'De parte de '+d.get('from'),540,1210,830,37,'#f6d69e');sign(ctx);readyOutput('card','Navidad-'+d.get('to'));}
const wishes=['Que la magia de la Navidad ilumine tu hogar y el Año Nuevo te regale momentos llenos de amor.','Que nunca falten las sonrisas, los abrazos deseados y la ilusión de comenzar un hermoso Año Nuevo.','Que esta Navidad traiga paz a tu corazón y que cada día del nuevo año tenga una razón para sonreír.','Un cielo de buenos deseos para ti: amor en Navidad, esperanza en el Año Nuevo y compañía en cada camino.','Que tu hogar se llene de cariño y que el Año Nuevo llegue con sueños, salud y momentos para compartir.','Que cada estrella te recuerde cuánto te quieren. ¡Feliz Navidad y un Año Nuevo lleno de ilusión!','La alegría más grande se encuentra en las pequeñas cosas. ¡Que tengas una Navidad y un Año Nuevo maravillosos!','Que el mejor regalo sea estar cerca de quienes amas y que el nuevo año les encuentre compartiendo muchas sonrisas.'];let wishIndex=Math.floor(Math.random()*wishes.length);$('#wish-text').textContent=wishes[wishIndex];$('#random-wish').addEventListener('click',()=>{wishIndex=(wishIndex+1+Math.floor(Math.random()*(wishes.length-1)))%wishes.length;$('#wish-text').textContent=wishes[wishIndex];});
function listenForm(id,fn){$(id).addEventListener('submit',async e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;const form=e.currentTarget,b=form.querySelector('button[type="submit"]');b.disabled=true;try{await fn(form);}catch(error){console.error('No se pudo crear el archivo',error);toast('No pudimos crear la imagen. Vuelve a intentarlo.');}finally{b.disabled=false;}});}
listenForm('#card-form',createCard);
listenForm('#invite-form',async form=>{const d=new FormData(form),ctx=await cardBase($('#invite-canvas'),'santa-correo.webp',460);text(ctx,'¡Estás invitado!',540,445,850,90,gold,'center','700');fitText(ctx,String(d.get('name')).trim(),540,565,850,92,gold);text(ctx,`celebra sus ${d.get('age')} años`,540,680,850,52,cream);let date=new Date(String(d.get('date'))+'T12:00:00');const dateLabel=date.toLocaleDateString('es-PE',{day:'numeric',month:'long',year:'numeric'});text(ctx,dateLabel+' · '+d.get('time'),540,790,850,46,gold,'center','600');boundedText(ctx,d.get('place'),540,880,850,150,46,cream);boundedText(ctx,d.get('message')||'¡Ven a vivir una aventura llena de magia!',540,1050,820,160,42,cream);if(d.get('contact'))boundedText(ctx,'Confirma: '+d.get('contact'),540,1230,850,80,35,gold);sign(ctx);readyOutput('invite','Invitacion-'+d.get('name'));});
listenForm('#qr-form',async form=>{const d=new FormData(form);let url=new URL(String(d.get('url')));if(!['https:','http:'].includes(url.protocol)){toast('Usa un enlace de video que comience por https://');return;}const code=qrcode(0,'M');code.addData(url.href);code.make();const ctx=await cardBase($('#qr-canvas'),'santa-correo.webp',520);text(ctx,'¡Santa tiene un regalo para ti!',540,510,880,65,gold,'center','700');fitText(ctx,String(d.get('name')).trim(),540,675,850,90,gold);const n=code.getModuleCount(),size=330,unit=size/(n+8),x=(1080-size)/2,y=830;ctx.fillStyle='white';ctx.fillRect(x,y,size,size);ctx.fillStyle='#27131b';for(let r=0;r<n;r++)for(let col=0;col<n;col++)if(code.isDark(r,col))ctx.fillRect(x+(col+4)*unit,y+(r+4)*unit,Math.ceil(unit),Math.ceil(unit));text(ctx,'Escanea el QR y descubre tu video',540,1190,850,38,cream);if(d.get('from'))text(ctx,'De parte de '+d.get('from'),540,1250,850,34,gold);sign(ctx);readyOutput('qr','Tarjeta-QR-'+d.get('name'));});
function safeName(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9-]/gi,'-').replace(/-+/g,'-').slice(0,100)||'La-aldea-de-Santa';}
function saveBlob(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function pngBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Sin imagen')),'image/png'));}
function canvasesPDF(canvases){const {jsPDF}=window.jspdf;const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});canvases.forEach((c,i)=>{if(i)doc.addPage();const w=190,h=w*c.height/c.width;doc.addImage(c.toDataURL('image/jpeg',.92),'JPEG',10,(297-h)/2,w,h,undefined,'FAST');});return doc;}
$$('[data-download]').forEach(b=>b.addEventListener('click',async()=>{let key=b.dataset.download;if(!outputs[key])return;saveBlob(await pngBlob($('#'+key+'-canvas')),safeName(outputNames[key])+'.png');toast('Tu imagen se ha descargado.');}));
$$('[data-pdf]').forEach(b=>b.addEventListener('click',()=>{let key=b.dataset.pdf;if(!outputs[key])return;canvasesPDF([$('#'+key+'-canvas')]).save(safeName(outputNames[key])+'.pdf');toast('Tu PDF está listo para imprimir.');}));
$$('[data-share]').forEach(b=>b.addEventListener('click',async()=>{let key=b.dataset.share;if(!outputs[key])return;const blob=await pngBlob($('#'+key+'-canvas')),file=new File([blob],safeName(outputNames[key])+'.png',{type:'image/png'});if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'La aldea de Santa'});return;}catch(err){if(err.name==='AbortError')return;}}saveBlob(blob,file.name);toast('Imagen descargada. Adjúntala en WhatsApp o en tu aplicación favorita para enviarla.');}));
// Three quiz levels, absolute 15-second deadlines and automatic certificates.
const quizLevels = {1: 'Explorador', 2: 'Ayudante de Santa', 3: 'Guardián de la Navidad'};
const quizCategories = {cultura:'Cultura general',all:'Todas las categorías',renos:'Renos',duendes:'Duendes de nuestra aldea',ciudades:'Ciudades y países',tradiciones:'Costumbres y símbolos'};
let quizRound=[],quizIndex=0,quizScore=0,answered=false,quizInterval=null,quizDeadline=0;
let quizRunId=0,quizSettings=null,quizTimed=true,quizRunning=false,quizBlocks=0,quizAccumulated=0;
const shuffle=a=>{let b=[...a];for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
function stopQuizClock(){if(quizInterval!==null)window.clearInterval(quizInterval);quizInterval=null;quizDeadline=0;}
function updateLevelInfo(){
  if(!window.SANTA_QUIZ.length){$('#quiz-level-info').textContent='Preparando las 10 000 preguntas…';return;}
  const level=Number($('#quiz-level').value),category=$('#quiz-category').value;
  const count=window.SANTA_QUIZ.filter(q=>q.level===level&&(category==='all'||q.category===category)).length;
  $('#quiz-level-info').textContent=`${count} preguntas en este banco · ${window.SANTA_QUIZ_FLOW.remaining(level,category)} sin practicar · ${$('#quiz-mode').value==='continuous'?'continúa con variantes nuevas':'10 por partida'}`;
}
$('#quiz-mode').addEventListener('change',updateLevelInfo);window.addEventListener('aldea:quiz-ready',updateLevelInfo);
$('#quiz-level').addEventListener('change',updateLevelInfo);
$('#quiz-category').addEventListener('change',updateLevelInfo);
$('#quiz-time-toggle').addEventListener('click',()=>{
  if(quizRunning)return;
  quizTimed=!quizTimed;
  $('#quiz-time-toggle').setAttribute('aria-pressed',String(quizTimed));
  $('#quiz-time-toggle').textContent=quizTimed?'⏱ Reto de 15 segundos · Activado':'⏱ Sin límite de tiempo · Práctica';
});
function setQuizRunning(value){
  quizRunning=value;
  for(const selector of ['#quiz-name','#quiz-level','#quiz-category','#quiz-time-toggle','#quiz-mode'])$(selector).disabled=value;
  $('#quiz-start').textContent=value?'Reiniciar partida':'Comenzar una partida';
}
$('#quiz-setup').addEventListener('submit',async event=>{
  event.preventDefault();
  const name=$('#quiz-name').value.trim();
  if(!name){$('#quiz-name').setCustomValidity('Escribe tu nombre para preparar el certificado.');$('#quiz-name').reportValidity();return;}
  if(!window.SANTA_QUIZ.length){const b=$('#quiz-start');b.disabled=true;b.textContent='Cargando preguntas…';try{await window.ALDEA_LAZY.quiz();}catch(e){toast(e.message);return;}finally{b.disabled=false;b.textContent='Comenzar una partida';}}
  stopQuizClock();quizRunId++;
  quizSettings={name,level:Number($('#quiz-level').value),category:$('#quiz-category').value,timed:quizTimed,continuous:$('#quiz-mode').value==='continuous'};
  quizRound=window.SANTA_QUIZ_FLOW.round(quizSettings.level,quizSettings.category,quizSettings.continuous);quizBlocks=0;quizAccumulated=0;
  quizIndex=0;quizScore=0;
  outputs.certificate=false;
  $('#quiz-certificate').hidden=true;
  document.querySelector('[data-output="certificate"]').hidden=true;
  if(!quizRound.length){setQuizRunning(false);toast('Elige otra categoría para empezar.');return;}
  setQuizRunning(true);renderQuiz();
});
$('#quiz-name').addEventListener('input',()=>$('#quiz-name').setCustomValidity(''));
function renderQuiz(){
  stopQuizClock();answered=false;
  const parent=$('#quiz-stage');parent.replaceChildren();
  if(quizIndex>=quizRound.length){
    setQuizRunning(false);
    const title=document.createElement('h3');title.className='quiz-result-title';title.textContent=`¡${quizScore} de ${quizRound.length} respuestas correctas!`;
    const summary=document.createElement('p');summary.textContent=`${quizSettings.name}, completaste el nivel ${quizLevels[quizSettings.level]}. Tu certificado se genera automáticamente aquí abajo.`;
    const encouragement=document.createElement('p');encouragement.className='quiz-feedback';
    encouragement.textContent=quizScore<=5?'Sigue esforzándote: con práctica y paciencia puedes mejorar. Santa valora tus ganas de aprender.':quizScore===6?'¡Buen avance! Ya lograste seis aciertos. Sigue practicando para llegar aún más lejos.':'¡Felicitaciones! Tus ganas de aprender brillan como las estrellas de la aldea.';
    parent.append(title,summary,encouragement);
    if(quizScore>=7){
      const box=document.createElement('div');box.className='quiz-santa-request';
      const h=document.createElement('h3');h.textContent='Escríbele a Santa';
      const p=document.createElement('p');p.textContent='Prepara un mensaje para solicitar tu saludo personalizado. Tú decides cuándo enviarlo por WhatsApp.';
      const label=document.createElement('label');label.textContent='Tu mensaje para Santa';
      const message=document.createElement('textarea');message.rows=4;message.readOnly=true;message.value=`¡Hola, Santa! Soy ${quizSettings.name}. Conseguí ${quizScore} de ${quizRound.length} aciertos en el reto de La aldea de Santa. Quiero solicitar un saludo personalizado. ¿Cómo puedo pedirlo?`;label.append(message);
      const copy=document.createElement('button');copy.type='button';copy.className='button outline';copy.textContent='Copiar mi mensaje';
      copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(message.value);copy.textContent='Mensaje copiado';}catch{message.focus();message.select();copy.textContent='Seleccionado: copia el mensaje';}});
      const contact=document.createElement('a');contact.className='button green';contact.href='https://wa.me/51917823560';contact.dataset.wa='quiz';contact.target='_blank';contact.rel='noopener noreferrer';contact.textContent='Escribir a Santa por WhatsApp';
      box.append(h,p,label,copy,contact);parent.append(box);
    }
    quizBlocks++;quizAccumulated+=quizScore;updateLevelInfo();
    if(quizSettings.continuous){
      const tally=document.createElement('p');tally.textContent=`Llevas ${quizBlocks*10} preguntas y ${quizAccumulated} aciertos en esta aventura. Cada bloque tiene su propio certificado.`;
      const again=document.createElement('button');again.type='button';again.className='button';again.textContent='Continuar con 10 preguntas más';again.addEventListener('click',()=>{stopQuizClock();quizRunId++;quizRound=window.SANTA_QUIZ_FLOW.round(quizSettings.level,quizSettings.category,true);quizIndex=0;quizScore=0;outputs.certificate=false;$('#quiz-certificate').hidden=true;document.querySelector('[data-output="certificate"]').hidden=true;setQuizRunning(true);renderQuiz();$('#quiz-stage').scrollIntoView({block:'start',behavior:'instant'});});parent.append(tally,again);
    }
    generateQuizCertificate(quizRunId);
    return;
  }
  const q=quizRound[quizIndex];
  const top=document.createElement('p');top.className='quiz-top';
  const progressText=()=>`Nivel ${quizSettings.level} · Pregunta ${quizIndex+1} de ${quizRound.length} · ${quizScore} ${quizScore===1?'estrella':'estrellas'}`;
  top.textContent=progressText();
  const question=document.createElement('h3');question.className='quiz-question';question.textContent=q.question;if(q.generated){const badge=document.createElement('p');badge.className='fine';badge.textContent='Ejercicio nuevo · Razonamiento y práctica';parent.append(badge);}
  const clockRow=document.createElement('div');clockRow.className='quiz-clock-row';
  const clock=document.createElement('div');clock.className='quiz-clock';clock.id='quiz-clock';clock.setAttribute('role','timer');clock.setAttribute('aria-live','off');
  const seconds=document.createElement('strong');seconds.id='quiz-seconds';seconds.textContent=quizSettings.timed?'15':'∞';
  const clockUnit=document.createElement('span');clockUnit.textContent=quizSettings.timed?'segundos':'sin límite';clock.append(seconds,clockUnit);
  const clockText=document.createElement('p');clockText.textContent=quizSettings.timed?'¡Tú puedes! Elige tu respuesta antes de que termine el tiempo.':'Modo práctica. Responde a tu ritmo.';clockRow.append(clock,clockText);
  const meter=document.createElement('div');meter.className='quiz-time-track';meter.setAttribute('aria-hidden','true');const fill=document.createElement('span');meter.append(fill);
  const options=document.createElement('div');options.className='quiz-options';
  const feedback=document.createElement('p');feedback.className='quiz-feedback';feedback.setAttribute('role','status');
  const next=document.createElement('button');next.type='button';next.className='button';next.textContent=quizIndex===quizRound.length-1?'Ver mi resultado y certificado':'Siguiente pregunta';next.hidden=true;
  next.addEventListener('click',()=>{if(!answered)return;quizIndex++;renderQuiz();});
  function settleAnswer(option,timedOut=false){
    if(answered)return;
    if(!timedOut&&quizSettings.timed&&Date.now()>=quizDeadline)timedOut=true;
    answered=true;stopQuizClock();
    if(timedOut){
      seconds.textContent='0';clock.style.setProperty('--clock-color','hsl(0 72% 40%)');clock.dataset.urgency='red';clock.setAttribute('aria-label','Tiempo terminado');fill.style.width='0%';
      feedback.textContent=`Se terminó el tiempo. La respuesta correcta es: ${q.answer}. ${q.explanation}`;
    }else if(option===q.answer){quizScore++;feedback.textContent='¡Correcto! '+q.explanation;}
    else feedback.textContent=`La respuesta correcta es: ${q.answer}. ${q.explanation}`;
    for(const button of options.children){button.disabled=true;if(button.textContent===q.answer)button.classList.add('correct');else if(button.textContent===option&&!timedOut)button.classList.add('wrong');}
    top.textContent=progressText();next.hidden=false;
  }
  function updateClock(){
    if(answered||!quizSettings.timed)return;
    const remaining=Math.max(0,quizDeadline-Date.now()),fraction=remaining/15000;
    seconds.textContent=String(Math.ceil(remaining/1000));
    clock.style.setProperty('--clock-color',`hsl(${Math.round(120*fraction)} 72% 36%)`);
    clock.dataset.urgency=remaining<=4000?'red':remaining<=8000?'amber':'green';
    clock.setAttribute('aria-label',`${Math.ceil(remaining/1000)} segundos para responder`);
    fill.style.width=(fraction*100)+'%';fill.style.backgroundColor=`hsl(${Math.round(120*fraction)} 72% 36%)`;
    if(remaining===0)settleAnswer(null,true);
  }
  for(const option of shuffle([q.answer,...q.wrong])){const button=document.createElement('button');button.type='button';button.textContent=option;button.addEventListener('click',()=>settleAnswer(option));options.append(button);}
  parent.append(top,question,clockRow,meter,options,feedback,next);
  if(quizSettings.timed){quizDeadline=Date.now()+15000;updateClock();quizInterval=window.setInterval(updateClock,100);}
  else{clock.setAttribute('aria-label','Modo sin límite de tiempo');meter.hidden=true;}
}
async function generateQuizCertificate(runId){
  const settings={...quizSettings},score=quizScore,total=quizRound.length;
  const verdict=score<=5?'esfuerzo':score===6?'avance':'felicitacion';
  const certificateTitle=score<=5?'Certificado de esfuerzo':score===6?'Certificado de avance':'¡Felicitaciones!';
  const certificateMessage=score<=5?'Sigue esforzándote. Con práctica y paciencia podrás mejorar. ¡Santa cree en ti!':score===6?'Vas por buen camino. Sigue practicando: cada intento te ayuda a aprender.':'Tu excelente resultado y tus ganas de aprender llenan nuestra aldea de magia.';
  $('#quiz-certificate').hidden=false;$('#certificate-canvas').hidden=true;$('#certificate-retry').hidden=true;
  $('#certificate-status').textContent='Santa está preparando tu certificado…';
  try{
    const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;
    const ctx=await cardBase(canvas,'santa-correo.webp',490);
    text(ctx,certificateTitle,540,490,880,68,gold,'center','700');
    text(ctx,'Otorgado con cariño a',540,600,850,37,cream);
    fitText(ctx,settings.name,540,670,860,96,gold);
    boundedText(ctx,`Por completar el nivel ${settings.level}: ${quizLevels[settings.level]}, en el Gran Reto Navideño de La aldea de Santa.`,540,815,840,170,48,cream);
    star(ctx,540,1020,34,gold);
    text(ctx,`${score} de ${total} respuestas correctas`,540,1080,850,52,gold,'center','600');
    boundedText(ctx,certificateMessage,540,1160,820,90,36,cream);
    text(ctx,new Date().toLocaleDateString('es-PE',{day:'numeric',month:'long',year:'numeric'}),540,1260,850,29,'#f6d69e');
    sign(ctx);
    if(runId!==quizRunId)return;
    const target=$('#certificate-canvas');target.getContext('2d').drawImage(canvas,0,0);target.hidden=false;target.dataset.verdict=verdict;target.setAttribute('aria-label',`${certificateTitle}. ${settings.name}. ${score} de ${total} respuestas correctas. ${certificateMessage}`);
    readyOutput('certificate',`Certificado-${settings.name}-nivel-${settings.level}`);
    $('#certificate-status').textContent=`Tu certificado está listo. ${certificateMessage} Descárgalo como imagen o PDF, o compártelo con tu familia.`;
    $('#quiz-certificate').scrollIntoView({behavior:'instant',block:'start'});
  }catch(error){
    if(runId!==quizRunId)return;
    console.error('No se pudo generar el certificado',error);
    $('#certificate-status').textContent='No se pudo cargar la imagen del certificado. Puedes volver a intentarlo sin repetir la partida.';
    $('#certificate-retry').hidden=false;
  }
}
$('#certificate-retry').addEventListener('click',()=>generateQuizCertificate(quizRunId));
updateLevelInfo();

// Personalized story reader, a decision in the middle, six illustrated pages.
const scenes={village:'aldea-luces.webp',cabin:'cabana-cuentos.webp',reindeer:'renos-establo.webp',correo:'santa-correo.webp',mirador:'santa-mirador.webp',bosque:'santa-bosque.webp'};let activeStory=null,storyPage=0,storyChoice=0,narrating=false;
for(const s of window.SANTA_STORIES)$('#story-select').append(new Option(s.title,String(s.id)));
function storyPages(st){const {data,name,age,city}=st;const pages=[`Aquella tarde, ${name}, ${st.gender==='girl'?'una niña de':st.gender==='boy'?'un niño de':'de'} ${age} ${st.gender==='neutral'?'años':'años de edad'}, miró el cielo desde ${city}. Una chispa dorada cruzó la ventana y dejó una invitación: «Te esperamos en La aldea de Santa». En un abrir y cerrar de ojos, un sendero nevado apareció entre faroles y tejados iluminados.`,`${data.discovery} Santa saludó a ${name} con una sonrisa y le invitó a observar con atención. En aquella aldea, las mejores aventuras empezaban con una pregunta.`,`${data.problem} ${name} pensó un momento. Había dos caminos posibles, y cada uno podía ayudar de una manera distinta. ¿Qué elegirías tú?`,`${name} eligió: «${data.choices[storyChoice]}». ${data.outcomes[storyChoice]} Santa acompañó la decisión, dejando espacio para que todos aportaran una idea.`,`${data.ending} ${name} comprendió que no hacía falta una varita para hacer algo bueno. A veces una decisión pequeña podía cambiar una tarde entera.`,`Antes de regresar a ${city}, Santa abrió su bolsito rojo. Una pizca de polvo de estrellas escribió «${name}» en el cielo. «Lleva esta historia contigo —dijo— y mañana busca una nueva ocasión para ayudar». Al volver a casa, la aventura seguía brillando en su memoria.`];return pages;}
function stopNarration(){if('speechSynthesis'in window)speechSynthesis.cancel();narrating=false;}
function narrate(textValue){if(!('speechSynthesis'in window)){toast('Este navegador no ofrece narración. Puedes leer el cuento en pantalla.');return;}if(narrating){stopNarration();renderStory();return;}stopNarration();const utterance=new SpeechSynthesisUtterance(textValue);utterance.lang='es-PE';utterance.rate=.85;utterance.pitch=.8;const voices=speechSynthesis.getVoices(),spanish=voices.find(x=>/es-(PE|MX|ES)/i.test(x.lang))||voices.find(x=>x.lang.startsWith('es'));if(spanish)utterance.voice=spanish;utterance.onend=()=>{narrating=false;const b=$('#story-narrate');if(b)b.textContent='Escuchar esta página';};utterance.onerror=()=>{narrating=false;toast('La voz no está disponible. Revisa las voces en español de tu dispositivo.');const b=$('#story-narrate');if(b)b.textContent='Escuchar esta página';};narrating=true;speechSynthesis.speak(utterance);const b=$('#story-narrate');if(b)b.textContent='Detener narración';}
listenForm('#story-form',async form=>{stopNarration();const d=new FormData(form);activeStory={data:window.SANTA_STORIES[Number(d.get('story'))],name:String(d.get('name')).trim(),age:d.get('age'),city:String(d.get('city')).trim(),gender:d.get('gender')};storyPage=0;storyChoice=0;renderStory();});
function renderStory(){let p=$('#story-stage');p.replaceChildren();const s=activeStory,pages=storyPages(s),photo=document.createElement('img');photo.className='story-photo';photo.src='assets/'+scenes[storyPage===0?'village':storyPage===5?'mirador':s.data.scene];photo.alt='Escena de estilo fotográfico de la aldea de Santa';const body=document.createElement('div');body.className='story-body';const progress=document.createElement('p');progress.className='story-progress';progress.textContent=`El cuento de ${s.name} · Página ${storyPage+1} de 6`;const heading=document.createElement('h3');heading.textContent=s.data.title;const para=document.createElement('p');para.textContent=pages[storyPage];body.append(progress,heading,para);if(storyPage===2){let choices=document.createElement('div');choices.className='story-choices';let label=document.createElement('p');label.textContent='Tú eliges cómo sigue la aventura';choices.append(label);s.data.choices.forEach((choice,i)=>{const b=document.createElement('button');b.type='button';b.textContent=choice;b.classList.toggle('active',storyChoice===i);b.setAttribute('aria-pressed',String(storyChoice===i));b.addEventListener('click',()=>{storyChoice=i;renderStory();});choices.append(b);});body.append(choices);}const nav=document.createElement('div');nav.className='story-nav';for(const [label,step]of[['Anterior',-1],['Siguiente',1]]){let b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=storyPage+step<0||storyPage+step>5;b.addEventListener('click',()=>{stopNarration();storyPage+=step;renderStory();});nav.append(b);}const tools=document.createElement('div');tools.className='story-tools';let listen=document.createElement('button');listen.id='story-narrate';listen.type='button';listen.textContent=narrating?'Detener narración':'Escuchar esta página';listen.addEventListener('click',()=>narrate(pages[storyPage]));let pdf=document.createElement('button');pdf.type='button';pdf.textContent='Descargar cuento PDF · 6 páginas';pdf.addEventListener('click',async()=>{pdf.disabled=true;pdf.textContent='Preparando tu cuento…';try{await storyPDF();toast('Tu cuento de seis páginas se ha descargado.');}catch(e){console.error(e);toast('No se pudo preparar el PDF. Inténtalo otra vez.');}finally{pdf.disabled=false;pdf.textContent='Descargar cuento PDF · 6 páginas';}});const color=document.createElement('button');color.type='button';color.textContent='Colorear esta aventura';color.addEventListener('click',()=>{const related=[3,1,4,5,2,3,0,2,6,4,4,0,4,2,1,3,8,4,6,1,4,6,2,2,0,0,1,0,3,3];$('#color-book').value=String(related[s.data.id]??0);$('#color-name').value=s.name;location.hash='colorear';$('#color-generate').click();});tools.append(listen,pdf,color);body.append(nav,tools);p.append(photo,body);}
async function storyPDF(){await document.fonts.ready;let pages=storyPages(activeStory),canvases=[];for(let i=0;i<6;i++){let c=document.createElement('canvas');c.width=1240;c.height=1754;let ctx=c.getContext('2d');ctx.fillStyle='#fff9ed';ctx.fillRect(0,0,1240,1754);const scene=i===0?'village':i===5?'mirador':activeStory.data.scene;cover(ctx,await image('assets/'+scenes[scene]),55,55,1130,600);let y=text(ctx,activeStory.data.title,620,700,1080,76,red,'center','700');y=text(ctx,'Una aventura para '+activeStory.name,620,y+20,1080,42,'#9a6c30');text(ctx,pages[i],100,y+55,1040,42,'#3f3032','left','500',1.5);ctx.strokeStyle='#ddbd78';ctx.lineWidth=3;ctx.strokeRect(32,32,1176,1690);text(ctx,`La aldea de Santa · ${i+1} / 6`,620,1660,1000,28,'#8d6742');canvases.push(c);}canvasesPDF(canvases).save(safeName(activeStory.data.title+'-'+activeStory.name)+'.pdf');}
// Six separately composed illustrations per book, laid out as printable A4 pages.
for(const b of window.SANTA_BOOKS)$('#color-book').append(new Option(b.title,String(b.id)));let coloringCanvases=[];let currentColorTitle='',currentColorName='';
function drawColorPage(book,index,name,atlas){const c=document.createElement('canvas');c.width=1240;c.height=1754;const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,1240,1754);if(book.kind==='imported'){ctx.drawImage(atlas,0,0,1240,1754);if(name){const b=book.nameBox;let size=34;ctx.font=`600 ${size}px ${sans}`;while(ctx.measureText(name).width>b.w*1240&&size>15)ctx.font=`600 ${--size}px ${sans}`;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle='#111';ctx.fillText(name,b.x*1240,(b.y+b.h*.75)*1754);}return c;}ctx.strokeStyle='#222';ctx.lineWidth=3;ctx.strokeRect(35,35,1170,1684);text(ctx,book.title,620,80,1060,67,'#151515','center','700');text(ctx,name?'El libro de '+name:'Mi aventura para colorear',620,180,1050,34,'#333');const cw=atlas.width/2,ch=atlas.height/3;ctx.drawImage(atlas,(index%2)*cw,Math.floor(index/2)*ch,cw,ch,75,370,1090,1090);text(ctx,`La aldea de Santa · Página ${index+1} de 6`,620,1620,1000,28,'#333');return c;}
let colorGeneration=0;async function generateColorBook(){const generation=++colorGeneration,button=$('#color-generate');button.disabled=true;try{await document.fonts.ready;const book=window.SANTA_BOOKS[Number($('#color-book').value)],name=$('#color-name').value.trim(),pages=book.pages?await Promise.all(book.pages.map(src=>image(src))):Array(6).fill(await image('assets/colorear/libro-'+book.id+'.webp'));if(generation!==colorGeneration)return;coloringCanvases=pages.map((atlas,i)=>drawColorPage(book,i,name,atlas));currentColorTitle=book.title;currentColorName=name;$('#color-pages').replaceChildren(...coloringCanvases.map((canvas,i)=>{let d=document.createElement('div');canvas.setAttribute('aria-label',`${book.title}, lámina ${i+1} para colorear`);let p=document.createElement('p');p.textContent='Lámina '+(i+1);d.append(canvas,p);return d;}));$('#color-title').textContent=book.title+' · 6 láminas';$('#color-output').hidden=false;toast('¡Tus seis páginas están listas!');}catch(error){console.error(error);toast('No pudimos preparar las láminas. Inténtalo otra vez.');}finally{if(generation===colorGeneration)button.disabled=false;}}$('#color-generate').addEventListener('click',generateColorBook);$('#color-book').addEventListener('change',generateColorBook);$('#color-name').addEventListener('input',()=>{colorGeneration++;$('#color-generate').disabled=false;$('#color-output').hidden=true;coloringCanvases=[];});$('#color-download').addEventListener('click',()=>{if(!coloringCanvases.length)return;canvasesPDF(coloringCanvases).save(safeName(currentColorTitle+(currentColorName?'-'+currentColorName:''))+'.pdf');toast('Tu libro para colorear se ha descargado.');});
// Show real, immediately usable previews before personalization, without exposing data.
for(const [key,scene,title,page]of[['card','santa-correo.webp','Feliz Navidad','tarjetas'],['invite','santa-correo.webp','¡Estás invitado!','cumpleanos'],['qr','santa-bosque.webp','Un regalo de Santa','tarjeta-qr']])(window.ALDEA_WHEN_SHOWN||((i,f)=>f()))(page,async()=>{try{const ctx=await cardBase($('#'+key+'-canvas'),scene,760);text(ctx,title,540,780,850,83,gold,'center','700');text(ctx,'Un recuerdo creado especialmente para ti',540,1030,800,47,cream);sign(ctx);}catch(e){console.error('Error al preparar la vista previa',e);}});
window.addEventListener('pagehide',stopNarration);
})();
