(() => {
'use strict';
/* Panel privado del creador: cartas, nombres nuevos y códigos de acceso (Supabase).
   La protección real la dan Supabase Auth + las reglas RLS: aunque alguien abra esta página,
   sin tu usuario administrador no puede leer nada. */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const cfg=window.ALDEA_SUPABASE||{};
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)\/?$/i.test(cfg.url||'')&&String(cfg.anonKey||'').length>20;
const LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
const TYPES={1:'Combo 1 · video corto + 30 libros',2:'Paquete 2 · video 3 min',3:'Paquete 2 + 30 libros',4:'Paquete 3 · video 5 min',5:'Paquete 3 + 30 libros'};
const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PAGE=50;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=v=>v?new Date(v).toLocaleString('es-PE',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
let sb=null,toastTimer=0;
function toast(t){const el=$('#ad-toast');el.textContent=t;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true;},4000);}
const show=id=>{for(const s of ['#ad-setup','#ad-login','#ad-app'])$(s).hidden=s!==id;$('#ad-logout').hidden=id!=='#ad-app';};

function loadLib(){return new Promise((res,rej)=>{if(window.supabase?.createClient)return res();const s=document.createElement('script');s.src=LIB;s.crossOrigin='anonymous';s.onload=res;s.onerror=()=>rej(new Error('No se pudo cargar Supabase.'));document.head.append(s);});}

async function start(){
  if(!configured){show('#ad-setup');return;}
  await loadLib();
  sb=window.supabase.createClient(cfg.url.replace(/\/$/,''),cfg.anonKey,{auth:{persistSession:true,storageKey:'aldea-admin',autoRefreshToken:true}});
  const {data:{session}}=await sb.auth.getSession();
  if(session)await enter(session.user);else show('#ad-login');
}
async function enter(user){
  const {data,error}=await sb.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();
  if(error||!data){await sb.auth.signOut();show('#ad-login');$('#ad-login-status').textContent='Esta cuenta no es administradora. Revisa el último paso de supabase/esquema.sql.';return;}
  show('#ad-app');openTab('resumen');refreshUnread();
}
$('#ad-login-form').addEventListener('submit',async e=>{
  e.preventDefault();const f=e.target,st=$('#ad-login-status'),btn=f.querySelector('button');btn.disabled=true;st.textContent='Entrando…';
  const {data,error}=await sb.auth.signInWithPassword({email:f.email.value.trim(),password:f.password.value});
  btn.disabled=false;f.password.value='';
  if(error){st.textContent='Correo o contraseña incorrectos.';return;}
  st.textContent='';await enter(data.user);
});
$('#ad-logout').addEventListener('click',async()=>{await sb.auth.signOut();show('#ad-login');});

/* Pestañas */
function openTab(name){
  for(const b of $$('[data-tab]'))b.setAttribute('aria-selected',String(b.dataset.tab===name));
  for(const p of $$('[data-pane]'))p.hidden=p.dataset.pane!==name;
  ({resumen:loadStats,cartas:()=>loadLetters(true),nombres:loadNames,codigos:()=>loadCodes(true)})[name]?.();
}
for(const b of $$('[data-tab]'))b.addEventListener('click',()=>openTab(b.dataset.tab));
const chips=(attr,cb)=>{for(const b of $$(`[data-${attr}]`))b.addEventListener('click',()=>{for(const o of $$(`[data-${attr}]`))o.setAttribute('aria-pressed',String(o===b));cb(b.dataset[attr]);});};

/* Resumen */
async function count(table,filter){let q=sb.from(table).select('*',{count:'exact',head:true});if(filter)q=filter(q);const {count:n}=await q;return n??0;}
async function loadStats(){
  const box=$('#ad-stats');box.innerHTML='<p class="fine">Cargando…</p>';
  try{
    const [{data:counters},unread,letters,names,missing,codes,given]=await Promise.all([
      sb.from('contadores').select('clave,total'),count('cartas_santa',q=>q.eq('leida',false)),count('cartas_santa'),count('nombres_registrados'),count('nombres_registrados',q=>q.eq('grabado',false)),count('codigos_acceso'),count('codigos_acceso',q=>q.eq('entregado',true))]);
    const c=Object.fromEntries((counters||[]).map(r=>[r.clave,r.total]));
    const tile=(n,l)=>`<div class="admin-stat"><strong>${Number(n||0).toLocaleString('es-PE')}</strong><span>${esc(l)}</span></div>`;
    box.innerHTML=tile(c.videos,'videos de Santa generados')+tile(c.cartas,'cartas enviadas (contador público)')+tile(unread,'cartas sin leer')+tile(letters,'cartas guardadas')+tile(missing,`nombres sin grabar (de ${names})`)+tile(given,`códigos entregados (de ${codes})`);
  }catch{box.innerHTML='<p class="fine">No se pudo cargar el resumen.</p>';}
}
async function refreshUnread(){const n=await count('cartas_santa',q=>q.eq('leida',false)).catch(()=>0);const b=$('#ad-unread');b.hidden=!n;b.textContent=n;}

/* Cartas */
let letterFilter='unread',letterPage=0;
chips('letters',v=>{letterFilter=v;loadLetters(true);});
async function loadLetters(reset){
  if(reset){letterPage=0;$('#ad-letters').innerHTML='';}
  let q=sb.from('cartas_santa').select('*').order('creado_en',{ascending:false}).range(letterPage*PAGE,letterPage*PAGE+PAGE-1);
  if(letterFilter==='unread')q=q.eq('leida',false);
  const term=$('#ad-letter-search').value.trim().replace(/[%,()]/g,'');if(term)q=q.or(`nombre.ilike.%${term}%,pais.ilike.%${term}%`);
  const {data,error}=await q;
  if(error){$('#ad-letters').innerHTML='<p class="fine">No se pudieron cargar las cartas.</p>';return;}
  if(reset&&!data.length)$('#ad-letters').innerHTML=`<p class="admin-empty">${letterFilter==='unread'?'No hay cartas sin leer. 🎉':'Todavía no llegaron cartas.'}</p>`;
  for(const l of data)$('#ad-letters').append(letterCard(l));
  $('#ad-letters-more').hidden=data.length<PAGE;letterPage++;
}
function letterCard(l){
  const el=document.createElement('article');el.className='admin-letter'+(l.leida?' read':'');el.dataset.id=l.id;
  el.innerHTML=`<header><div><strong>${esc(l.nombre)}</strong><span>${l.edad?esc(l.edad)+' años · ':''}${esc(l.pais)}${l.ciudad?' · '+esc(l.ciudad):''}</span></div><time>${esc(date(l.creado_en))}</time></header>
${l.mensaje?`<p class="admin-letter-msg">${esc(l.mensaje)}</p>`:''}${l.se_porto_bien?`<p><b>Se portó bien porque:</b> ${esc(l.se_porto_bien)}</p>`:''}${l.deseos?.length?`<p><b>Deseos:</b></p><ul>${l.deseos.map(d=>`<li>🎁 ${esc(d)}</li>`).join('')}</ul>`:''}
<div class="admin-actions"><button type="button" class="button small" data-act="read">${l.leida?'Marcar como no leída':'Marcar como leída'}</button><button type="button" class="button outline small" data-act="delete">Borrar</button></div>`;
  el.querySelector('[data-act="read"]').addEventListener('click',async()=>{const v=!l.leida;const {error}=await sb.from('cartas_santa').update({leida:v}).eq('id',l.id);if(error)return toast('No se pudo actualizar.');l.leida=v;if(letterFilter==='unread'&&v)el.remove();else el.replaceWith(letterCard(l));refreshUnread();toast(v?'Carta marcada como leída.':'Carta marcada como no leída.');});
  el.querySelector('[data-act="delete"]').addEventListener('click',async()=>{if(!confirm(`¿Borrar para siempre la carta de ${l.nombre}? No se puede deshacer.`))return;const {error}=await sb.from('cartas_santa').delete().eq('id',l.id);if(error)return toast('No se pudo borrar.');el.remove();refreshUnread();toast('Carta borrada.');});
  return el;
}
$('#ad-letters-more').addEventListener('click',()=>loadLetters(false));
$('#ad-letters-refresh').addEventListener('click',()=>{loadLetters(true);refreshUnread();});
let searchTimer=0;$('#ad-letter-search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>loadLetters(true),350);});

/* Nombres nuevos */
let nameFilter='pending',lastNames=[];
chips('names',v=>{nameFilter=v;loadNames();});
async function loadNames(){
  let q=sb.from('nombres_registrados').select('*').order('ultima_vez',{ascending:false}).limit(500);
  if(nameFilter==='missing')q=q.eq('grabado',false);
  if(nameFilter==='pending')q=q.eq('aprobado_en_vivo',false);
  if(nameFilter==='approved')q=q.eq('aprobado_en_vivo',true);
  const {data,error}=await q;const box=$('#ad-names');
  if(error){box.innerHTML=`<p class="fine">No se pudieron cargar los nombres.${/aprobado_en_vivo/.test(error.message||'')?' Ejecuta supabase/actualizacion-en-vivo.sql en Supabase.':''}</p>`;return;}
  lastNames=data;
  $('#ad-names-approve-all').hidden=!data.some(n=>!n.aprobado_en_vivo);
  box.innerHTML=data.length?`<table class="admin-table"><thead><tr><th>Nombre</th><th>¿Grabado?</th><th>Veces</th><th>Última vez</th><th>En vivo</th></tr></thead><tbody></tbody></table>`:'<p class="admin-empty">No hay nombres con ese filtro.</p>';
  const body=box.querySelector('tbody');
  for(const n of data){
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${esc(n.nombre)}</td><td>${n.grabado?'✓ Sí (Santa lo dice)':'✍️ No (solo escrito)'}</td><td>${esc(n.veces)}</td><td>${esc(date(n.ultima_vez))}</td><td class="admin-row-actions"><button type="button" data-live>${n.aprobado_en_vivo?'✓ Aprobado · Quitar':'Aprobar para el en vivo'}</button><button type="button" data-del>Borrar</button></td>`;
    tr.querySelector('[data-live]').addEventListener('click',async()=>{const v=!n.aprobado_en_vivo;const {error:e}=await sb.from('nombres_registrados').update({aprobado_en_vivo:v}).eq('clave',n.clave);if(e)return toast('No se pudo actualizar.');n.aprobado_en_vivo=v;toast(v?`«${n.nombre}» saldrá en el en vivo.`:`«${n.nombre}» ya no saldrá en el en vivo.`);loadNames();});
    tr.querySelector('[data-del]').addEventListener('click',async()=>{if(!confirm(`¿Borrar el nombre «${n.nombre}» de la lista? No se puede deshacer.`))return;const {error:e}=await sb.from('nombres_registrados').delete().eq('clave',n.clave);if(e)return toast('No se pudo borrar.');toast('Nombre borrado.');loadNames();});
    body?.append(tr);
  }
}
$('#ad-names-approve-all').addEventListener('click',async()=>{
  const pending=lastNames.filter(n=>!n.aprobado_en_vivo);if(!pending.length)return;
  if(!confirm(`¿Aprobar para el en vivo los ${pending.length} nombres de esta lista? Revisa antes que no haya groserías.`))return;
  const {error}=await sb.from('nombres_registrados').update({aprobado_en_vivo:true}).in('clave',pending.map(n=>n.clave));
  if(error)return toast('No se pudieron aprobar.');toast(`${pending.length} nombres aprobados.`);loadNames();
});
$('#ad-names-refresh').addEventListener('click',loadNames);
$('#ad-names-copy').addEventListener('click',async()=>{const text=lastNames.map(n=>n.nombre).join('\n');try{await navigator.clipboard.writeText(text);toast(`${lastNames.length} nombres copiados.`);}catch{toast('No se pudo copiar.');}});

/* Códigos */
let codePage=0;
async function loadCodes(reset){
  if(reset){codePage=0;$('#ad-codes').innerHTML='';}
  let q=sb.from('codigos_acceso').select('*').order('creado_en',{ascending:false}).range(codePage*PAGE,codePage*PAGE+PAGE-1);
  const f=$('#ad-code-filter').value;if(f==='free')q=q.eq('entregado',false).eq('activo',true);if(f==='given')q=q.eq('entregado',true);if(f==='used')q=q.gt('usos',0);if(f==='off')q=q.eq('activo',false);
  const term=$('#ad-code-search').value.trim().replace(/[%,()]/g,'');if(term)q=q.or(`codigo.ilike.%${term.toUpperCase()}%,cliente.ilike.%${term}%`);
  const {data,error}=await q;
  if(error){$('#ad-codes').innerHTML='<p class="fine">No se pudieron cargar los códigos.</p>';return;}
  let table=$('#ad-codes table tbody');
  if(!table){$('#ad-codes').innerHTML=data.length?'<table class="admin-table"><thead><tr><th>Código</th><th>Paquete</th><th>Cliente</th><th>Usos</th><th>Estado</th><th>Acciones</th></tr></thead><tbody></tbody></table>':'<p class="admin-empty">No hay códigos con ese filtro.</p>';table=$('#ad-codes table tbody');}
  for(const c of data)table?.append(codeRow(c));
  $('#ad-codes-more').hidden=data.length<PAGE;codePage++;
}
function codeRow(c){
  const tr=document.createElement('tr');
  const state=!c.activo?'⛔ Desactivado':c.entregado?'📦 Entregado':'🆓 Libre';
  tr.innerHTML=`<td><code class="admin-code">${esc(c.codigo)}</code></td><td>${esc(TYPES[c.tipo]||c.paquete)}</td><td>${esc(c.cliente||'—')}${c.whatsapp?`<br><small>${esc(c.whatsapp)}</small>`:''}</td><td>${esc(c.usos)}/${esc(c.max_usos)}</td><td>${state}</td><td class="admin-row-actions"><button type="button" data-a="copy">Copiar</button><button type="button" data-a="give">${c.entregado?'Editar cliente':'Entregar'}</button><button type="button" data-a="toggle">${c.activo?'Desactivar':'Activar'}</button>${c.usos?'<button type="button" data-a="reset">Reiniciar usos</button>':''}${c.whatsapp?`<a href="https://wa.me/${esc(c.whatsapp.replace(/\D/g,''))}?text=${encodeURIComponent(`¡Hola! 🎅 Tu código de La aldea de Santa es: ${c.codigo}\nEscríbelo al tocar «Descargar» o en «Paquetes y precios».`)}" target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a>`:''}</td>`;
  const update=async(patch,msg)=>{const {data,error}=await sb.from('codigos_acceso').update(patch).eq('codigo',c.codigo).select().single();if(error)return toast('No se pudo actualizar el código.');tr.replaceWith(codeRow(data));toast(msg);};
  tr.addEventListener('click',async e=>{
    const a=e.target.closest('[data-a]')?.dataset.a;if(!a)return;
    if(a==='copy'){try{await navigator.clipboard.writeText(c.codigo);toast(`Copiado: ${c.codigo}`);}catch{toast(c.codigo);}}
    if(a==='give'){const cliente=prompt('Nombre del cliente:',c.cliente||'');if(cliente===null)return;const whatsapp=prompt('WhatsApp del cliente (con código de país, solo números):',c.whatsapp||'');if(whatsapp===null)return;update({entregado:true,cliente:cliente.trim().slice(0,60),whatsapp:whatsapp.replace(/\D/g,'').slice(0,20),entregado_en:new Date().toISOString()},'Código marcado como entregado.');}
    if(a==='toggle')update({activo:!c.activo},c.activo?'Código desactivado: ya no funcionará.':'Código activado.');
    if(a==='reset')update({usos:0},'Usos reiniciados.');
  });
  return tr;
}
$('#ad-codes-more').addEventListener('click',()=>loadCodes(false));
$('#ad-codes-refresh').addEventListener('click',()=>loadCodes(true));
$('#ad-code-filter').addEventListener('change',()=>loadCodes(true));
let codeTimer=0;$('#ad-code-search').addEventListener('input',()=>{clearTimeout(codeTimer);codeTimer=setTimeout(()=>loadCodes(true),350);});

function newCode(){const b=new Uint8Array(6);for(;;){crypto.getRandomValues(b);const c=[...b].map(x=>ALPHABET[x%32]).join('');if(/[A-Z]/.test(c)&&/\d/.test(c))return c;}}
$('#ad-gen-form').addEventListener('submit',async e=>{
  e.preventDefault();const f=e.target,tipo=Number(f.tipo.value),n=Math.min(50,Math.max(1,Number(f.cantidad.value)||1)),max=Math.min(10,Math.max(1,Number(f.max.value)||3));
  const cliente=f.cliente.value.trim().slice(0,60),whatsapp=f.whatsapp.value.replace(/\D/g,'').slice(0,20);
  const rows=Array.from({length:n},()=>({codigo:newCode(),tipo,paquete:TYPES[tipo],max_usos:max,cliente,whatsapp,entregado:!!cliente,entregado_en:cliente?new Date().toISOString():null}));
  const {error}=await sb.from('codigos_acceso').insert(rows);
  const out=$('#ad-gen-result');
  if(error){out.textContent='No se pudieron crear los códigos. Inténtalo de nuevo.';return;}
  out.innerHTML=`<p><b>${n} código${n>1?'s':''} nuevo${n>1?'s':''}:</b></p><p class="admin-codes-new">${rows.map(r=>`<code class="admin-code">${esc(r.codigo)}</code>`).join(' ')}</p>${whatsapp&&n===1?`<a class="button green small" target="_blank" rel="noopener noreferrer" href="https://wa.me/${esc(whatsapp)}?text=${encodeURIComponent(`¡Hola! 🎅 Tu código de La aldea de Santa es: ${rows[0].codigo}\nEscríbelo al tocar «Descargar» o en «Paquetes y precios».`)}">Enviar por WhatsApp</a>`:''}`;
  loadCodes(true);
});
const typeFromText=t=>/Combo 1/i.test(t)?1:/Paquete 2\s*\+/i.test(t)?3:/Paquete 2/i.test(t)?2:/Paquete 3\s*\+/i.test(t)?5:/Paquete 3/i.test(t)?4:0;
$('#ad-import').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;const st=$('#ad-import-status');st.textContent='Leyendo el archivo…';
  const lines=(await file.text()).replace(/^﻿/,'').split(/\r?\n/).filter(Boolean);const head=lines.shift()?.split(';')||[];
  const iCode=head.findIndex(h=>/codigo/i.test(h)),iPack=head.findIndex(h=>/paquete/i.test(h)),iClient=head.findIndex(h=>/cliente/i.test(h)),iWa=head.findIndex(h=>/whatsapp/i.test(h)),iGiven=head.findIndex(h=>/entregado/i.test(h));
  if(iCode<0||iPack<0){st.textContent='El archivo no tiene las columnas Codigo y Paquete.';return;}
  const rows=[];for(const line of lines){const c=line.split(';'),codigo=(c[iCode]||'').trim().toUpperCase(),tipo=typeFromText(c[iPack]||'');if(!/^[A-Z0-9]{6,12}$/.test(codigo)||!tipo)continue;const cliente=(c[iClient]||'').trim().slice(0,60);rows.push({codigo,tipo,paquete:TYPES[tipo],cliente,whatsapp:(c[iWa]||'').replace(/\D/g,'').slice(0,20),entregado:/^s[ií]/i.test(c[iGiven]||'')||!!cliente});}
  let done=0;
  for(let i=0;i<rows.length;i+=500){const {error}=await sb.from('codigos_acceso').upsert(rows.slice(i,i+500),{onConflict:'codigo',ignoreDuplicates:true});if(error){st.textContent=`Error al importar (se subieron ${done}). Inténtalo otra vez: no se duplican.`;return;}done+=Math.min(500,rows.length-i);st.textContent=`Subiendo… ${done} de ${rows.length}`;}
  st.textContent=`¡Listo! ${rows.length} códigos importados (los que ya existían no se tocaron).`;e.target.value='';loadCodes(true);
});

start().catch(err=>{show('#ad-login');$('#ad-login-status').textContent=err.message||'No se pudo iniciar el panel.';});
})();
