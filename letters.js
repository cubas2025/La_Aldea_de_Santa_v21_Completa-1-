(() => {
'use strict';
/* Buzón de cartas a Santa: escribe, «Enviar al Polo Norte», y descarga la carta como
   imagen o envíala por WhatsApp a la aldea. Todo se crea en el dispositivo. */
const $=s=>document.querySelector(s);
const form=$('#letter-form');if(!form)return;
const WA='51917823560';
const canvas=$('#letter-canvas'),ctx=canvas.getContext('2d'),result=$('#letter-result'),status=$('#letter-status');
const countrySel=$('#letter-country');
const pay=window.ALDEA_PAY;
const countries=pay?.COUNTRIES||[{id:'pe',flag:'🇵🇪',name:'Perú'}];
countrySel.replaceChildren(...countries.map(c=>new Option(`${c.flag} ${c.name==='Otros países'?'Otro país':c.name}`,c.id)));
countrySel.value=pay?.country().id||'pe';
const serif='"Cormorant Garamond", Georgia, serif',sans='"DM Sans", Arial, sans-serif';
let blob=null,fileName='carta-a-santa.png';

function data(){
  const d=new FormData(form),c=countries.find(x=>x.id===d.get('country'))||countries[0];
  const wishes=[d.get('wish1'),d.get('wish2'),d.get('wish3')].map(v=>String(v||'').trim()).filter(Boolean);
  return {name:String(d.get('name')||'').trim(),age:String(d.get('age')||'').trim(),country:c,city:String(d.get('city')||'').trim(),letter:String(d.get('letter')||'').trim(),good:String(d.get('good')||'').trim(),wishes};
}
function wrap(text,x,y,maxW,lh,maxLines=99){
  const words=text.split(/\s+/),out=[];let line='';
  for(const w of words){const next=line?line+' '+w:w;if(ctx.measureText(next).width>maxW&&line){out.push(line);line=w;}else line=next;}
  if(line)out.push(line);
  if(out.length>maxLines){out.length=maxLines;out[maxLines-1]=out[maxLines-1].replace(/\s*\S*$/,'')+'…';}
  for(const l of out){ctx.fillText(l,x,y);y+=lh;}
  return y;
}
async function render(d){
  await document.fonts.ready;
  try{await document.fonts.load('86px "Noto Color Emoji"',d.country.flag);}catch{}
  const W=1080,H=1440;ctx.clearRect(0,0,W,H);
  // papel
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#fffaf0');g.addColorStop(1,'#f6ead2');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#b9142b';ctx.lineWidth=14;ctx.strokeRect(30,30,W-60,H-60);
  ctx.strokeStyle='#1f7a4f';ctx.lineWidth=4;ctx.setLineDash([22,14]);ctx.strokeRect(52,52,W-104,H-104);ctx.setLineDash([]);
  // líneas de cuaderno
  ctx.strokeStyle='rgba(185,20,43,.10)';ctx.lineWidth=2;for(let y=420;y<H-170;y+=52){ctx.beginPath();ctx.moveTo(110,y+12);ctx.lineTo(W-110,y+12);ctx.stroke();}
  // sello
  ctx.save();ctx.translate(900,170);ctx.rotate(.12);ctx.fillStyle='#fff';ctx.strokeStyle='#b9142b';ctx.lineWidth=5;ctx.setLineDash([8,6]);ctx.fillRect(-80,-95,160,190);ctx.strokeRect(-80,-95,160,190);ctx.setLineDash([]);
  ctx.font='86px "Noto Color Emoji", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(d.country.flag,0,-14);
  ctx.font=`700 22px ${sans}`;ctx.fillStyle='#b9142b';ctx.textBaseline='alphabetic';ctx.fillText('POLO NORTE',0,72);ctx.restore();
  // matasellos
  ctx.save();ctx.translate(735,215);ctx.rotate(-.2);ctx.strokeStyle='rgba(31,122,79,.65)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,62,0,7);ctx.stroke();ctx.font=`700 17px ${sans}`;ctx.fillStyle='rgba(31,122,79,.8)';ctx.textAlign='center';ctx.fillText('BUZÓN DE',0,-8);ctx.fillText('SANTA',0,16);ctx.restore();
  // encabezado
  ctx.textAlign='left';ctx.fillStyle='#b9142b';ctx.font=`700 46px ${serif}`;ctx.fillText('La aldea de Santa',110,150);
  ctx.fillStyle='#5a4a40';ctx.font=`500 26px ${sans}`;ctx.fillText(new Date().toLocaleDateString('es-PE',{day:'numeric',month:'long',year:'numeric'}),110,196);
  ctx.fillStyle='#2a1a20';ctx.font=`700 70px ${serif}`;ctx.fillText('Querido Santa:',110,320);
  // cuerpo
  ctx.font=`500 34px ${sans}`;ctx.fillStyle='#2a1a20';let y=420;
  const intro=`Me llamo ${d.name}${d.age?`, tengo ${d.age} años`:''} y vivo en ${d.city?d.city+', ':''}${d.country.name==='Otros países'?'un lugar muy especial':d.country.name}.`;
  y=wrap(intro,110,y,860,52);
  if(d.letter){y+=10;y=wrap(d.letter,110,y,860,52,9);}
  if(d.good){y+=10;y=wrap(`Este año me porté bien porque ${d.good.replace(/^porque\s+/i,'')}`,110,y,860,52,4);}
  if(d.wishes.length){y+=18;ctx.font=`700 36px ${sans}`;ctx.fillStyle='#b9142b';ctx.fillText('Mis deseos para esta Navidad:',110,y);y+=56;ctx.font=`500 34px ${sans}`;ctx.fillStyle='#2a1a20';
    for(const w of d.wishes){if(y>H-230)break;y=wrap(`🎁 ${w}`,130,y,840,52,2);}}
  // firma
  ctx.fillStyle='#2a1a20';ctx.font=`600 italic 44px ${serif}`;ctx.textAlign='right';ctx.fillText(`Con cariño, ${d.name}`,W-110,H-150);
  ctx.textAlign='center';ctx.font=`500 22px ${sans}`;ctx.fillStyle='#8a6f5f';ctx.fillText('Escrita en el Buzón de Cartas de La aldea de Santa',W/2,H-80);
  return new Promise(r=>canvas.toBlob(b=>r(b),'image/png'));
}
function message(d){
  return ['🎅 ¡Hola, Santa! Te envío mi carta desde el Buzón de La aldea de Santa ✉️','',`Nombre: ${d.name}`,d.age?`Edad: ${d.age} años`:'',`País: ${d.country.flag} ${d.country.name}${d.city?' · '+d.city:''}`,'',d.letter?`Querido Santa: ${d.letter}`:'',d.good?`Este año me porté bien porque ${d.good.replace(/^porque\s+/i,'')}`:'',d.wishes.length?`Mis deseos: ${d.wishes.map((w,i)=>`${i+1}) ${w}`).join(' ')}`:'','','(Si quieres, adjunto también la imagen de mi carta.)'].filter((l,i,a)=>l!==''||a[i-1]!=='').join('\n');
}
form.addEventListener('submit',async e=>{
  e.preventDefault();if(!form.reportValidity())return;
  const d=data();if(!d.letter&&!d.wishes.length){status.textContent='Escribe tu carta o al menos un deseo para Santa.';form.querySelector('[name="letter"]').focus();return;}
  const btn=form.querySelector('[type="submit"]');btn.disabled=true;form.classList.add('letter-flying');status.textContent='✉️ Tu carta vuela al Polo Norte…';
  try{
    blob=await render(d);fileName=`carta-a-santa-${d.name.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/gi,'-').toLowerCase()||'nino'}.png`;
    $('#letter-wa').href=`https://wa.me/${WA}?text=${encodeURIComponent(message(d))}`;
    await new Promise(r=>setTimeout(r,900));
    result.hidden=false;$('#letter-empty').hidden=true;status.textContent=`¡Tu carta llegó al buzón de Santa, ${d.name}! Descárgala o envíala por WhatsApp.`;
    result.scrollIntoView({behavior:'smooth',block:'start'});
  }catch{status.textContent='No se pudo preparar la carta. Inténtalo otra vez.';}
  finally{btn.disabled=false;form.classList.remove('letter-flying');}
});
$('#letter-download').addEventListener('click',()=>{if(!blob)return;const a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=fileName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);status.textContent='Tu carta se descargó como imagen.';});
$('#letter-share').addEventListener('click',async()=>{
  if(!blob)return;const file=new File([blob],fileName,{type:'image/png'});
  if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'Mi carta a Santa',text:'✉️ Mi carta a Santa desde La aldea de Santa #cubas.ai #laaldeadesanta'});return;}catch(err){if(err.name==='AbortError')return;}}
  $('#letter-download').click();status.textContent='Tu navegador no comparte imágenes directo: la descargamos para que la adjuntes.';
});
$('#letter-again').addEventListener('click',()=>{result.hidden=true;$('#letter-empty').hidden=false;form.querySelector('[name="letter"]').value='';for(const n of ['wish1','wish2','wish3','good'])form.querySelector(`[name="${n}"]`).value='';status.textContent='Escribe una nueva carta para Santa.';form.scrollIntoView({behavior:'smooth'});});
const counter=$('#letter-count'),area=form.querySelector('[name="letter"]');area.addEventListener('input',()=>{counter.textContent=`${area.value.length}/600`;});
})();
