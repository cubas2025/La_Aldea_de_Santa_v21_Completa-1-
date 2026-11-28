(() => {
'use strict';
/* Panel «Nombres guardados en vivo»: agrega nombres (con lugar y foto opcional), frases completas y
   agradecimientos a donadores. Se usa igual en /admin y debajo de la pantalla de la transmisión.
   - El nombre lo dice Santa en su turno (tabla nombres_al_aire) y pasa por la franja grande (franja_en_vivo).
   - La foto se reduce a 720 px antes de subirla (Storage: fotos-en-vivo) y sale junto al nombre cuando Santa lo nombra. */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const turnoAhora=()=>Math.floor(Date.now()/10000);
const SQL='supabase/actualizacion-nombres-guardados.sql';

async function shrink(file){
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('No se pudo leer la foto.'));i.src=url;});
    const k=Math.min(1,720/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');
    c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    return await new Promise(res=>c.toBlob(res,'image/jpeg',.85));
  }finally{URL.revokeObjectURL(url);}
}

function mount(root,{getSb,login=false,catalog=window.SANTA_NAME_AUDIO||[],onToast}={}){
  root.classList.add('sl-panel');
  root.innerHTML=`
  <h2>📜 Nombres guardados en vivo</h2>
  <div class="sl-login" hidden>
    <p>Para agregar nombres desde aquí, entra con tu cuenta de administrador (la misma de /admin).</p>
    <form class="sl-login-form"><input name="email" type="email" placeholder="Correo" autocomplete="username" required><input name="password" type="password" placeholder="Contraseña" autocomplete="current-password" required><button type="submit">Entrar</button></form>
  </div>
  <div class="sl-body">
    <form class="sl-name">
      <p class="sl-help">Santa dice el nombre en 10 a 20 segundos, pasa por la franja grande con su lugar y, si le pones foto, la foto sale junto al nombre.</p>
      <div class="sl-row"><label>Nombre<input name="nombre" maxlength="200" autocomplete="off" placeholder="Ej. Valentina (o varios: Ana, Luis)" required></label>
      <label>Lugar <small>opcional</small><input name="lugar" maxlength="60" autocomplete="off" placeholder="Ej. Lima, Perú"></label></div>
      <div class="sl-row sl-photo-row"><label class="sl-photo-btn">📷 Foto <small>opcional</small><input name="foto" type="file" accept="image/*" hidden></label><img class="sl-preview" alt="" hidden><button type="button" class="sl-photo-clear" hidden>Quitar foto</button>
      <button type="submit" class="sl-send">➕ Agregar al en vivo</button></div>
    </form>
    <form class="sl-msg">
      <div class="sl-row"><label>Para la franja<select name="tipo"><option value="frase">💬 Frase completa</option><option value="gracias">💝 Agradecimiento a un donador</option></select></label></div>
      <label>Texto<textarea name="texto" rows="2" maxlength="200" placeholder="Ej. ¡Gracias, familia Rojas, por tu regalito! Santa te manda un abrazo enorme." required></textarea></label>
      <button type="submit">Enviar a la franja</button>
    </form>
    <p class="sl-status" role="status"></p>
    <details class="sl-more"><summary>Fotos enviadas</summary><p>Las fotos solo se usan en esta transmisión. Úsalas con permiso de los padres y bórralas cuando termines.</p><button type="button" class="sl-clear-photos">🗑 Borrar todas las fotos del en vivo</button></details>
  </div>`;
  const $=s=>root.querySelector(s),st=$('.sl-status');
  const say=t=>{st.textContent=t;onToast?.(t);};
  let sb=null,photo=null;
  const canon=n=>{const k=n.toLocaleLowerCase('es');const r=catalog.find(x=>x.name.toLocaleLowerCase('es')===k);return r?r.name:n.charAt(0).toLocaleUpperCase('es')+n.slice(1);};
  async function ready(){
    sb=await getSb();
    if(!login)return true;
    const {data:{session}}=await sb.auth.getSession();
    const ok=!!session;$('.sl-login').hidden=ok;$('.sl-body').hidden=!ok;return ok;
  }
  ready().catch(e=>say(e.message));
  $('.sl-login-form')?.addEventListener('submit',async e=>{
    e.preventDefault();const f=e.target;say('Entrando…');
    const {error}=await sb.auth.signInWithPassword({email:f.email.value.trim(),password:f.password.value});
    if(error){say('No se pudo entrar: revisa el correo y la contraseña.');return;}
    f.password.value='';await ready();say('✓ Listo, ya puedes agregar nombres.');
  });
  const photoIn=$('[name=foto]'),prev=$('.sl-preview'),clr=$('.sl-photo-clear');
  photoIn.addEventListener('change',()=>{const f=photoIn.files[0];if(!f)return;photo=f;prev.src=URL.createObjectURL(f);prev.hidden=false;clr.hidden=false;});
  clr.addEventListener('click',()=>{photo=null;photoIn.value='';prev.hidden=true;clr.hidden=true;});
  $('.sl-name').addEventListener('submit',async e=>{
    e.preventDefault();const f=e.target,btn=$('.sl-send');
    const names=f.nombre.value.split(/[,\n]+/).map(n=>n.trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,20).map(canon);
    const lugar=f.lugar.value.trim().slice(0,60);if(!names.length)return;
    if(photo&&names.length>1){say('La foto va con un solo nombre: escribe uno a la vez cuando le pongas foto.');return;}
    btn.disabled=true;say(photo?'Subiendo la foto…':'Enviando…');
    try{
      let foto='';
      if(photo){
        const blob=await shrink(photo),path=`${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
        const up=await sb.storage.from('fotos-en-vivo').upload(path,blob,{contentType:'image/jpeg',upsert:false});
        if(up.error)throw new Error(`No se pudo subir la foto. ¿Ejecutaste ${SQL}?`);
        foto=sb.storage.from('fotos-en-vivo').getPublicUrl(path).data.publicUrl;
      }
      const {data:q}=await sb.from('nombres_al_aire').select('turno').gte('turno',turnoAhora()).order('turno');
      let t=Math.max(turnoAhora()+2,...(q||[]).map(r=>r.turno+1));
      const rows=names.map(n=>({nombre:n.slice(0,40),turno:t++,...(lugar?{lugar}:{}),...(foto?{foto}:{})}));
      const a=await sb.from('nombres_al_aire').insert(rows);
      if(a.error)throw new Error(`No se pudo enviar. ¿Ejecutaste ${SQL}?`);
      await sb.from('franja_en_vivo').insert(names.map(n=>({tipo:'nombre',texto:n.slice(0,200),lugar})));
      f.nombre.value='';f.lugar.value='';clr.click();
      const secs=Math.max(10,Math.round((t-1-Date.now()/10000)*10));
      say(`✓ ${names.length>1?`${names.length} nombres agregados`:`«${names[0]}» agregado`}. Santa lo dice en unos ${secs} s${foto?' con su foto':''}.`);
      f.nombre.focus();
    }catch(err){say(err.message);}
    btn.disabled=false;
  });
  $('.sl-msg').addEventListener('submit',async e=>{
    e.preventDefault();const f=e.target,texto=f.texto.value.trim().slice(0,200);if(!texto)return;
    say('Enviando…');const {error}=await sb.from('franja_en_vivo').insert({tipo:f.tipo.value==='gracias'?'gracias':'frase',texto});
    if(error){say(`No se pudo enviar. ¿Ejecutaste ${SQL}?`);return;}
    f.texto.value='';say(f.tipo.value==='gracias'?'✓ Agradecimiento enviado a la franja.':'✓ Frase enviada a la franja.');
  });
  $('.sl-clear-photos').addEventListener('click',async()=>{
    if(!confirm('¿Borrar todas las fotos enviadas al en vivo? No se puede deshacer.'))return;
    const {data,error}=await sb.storage.from('fotos-en-vivo').list('',{limit:1000});
    if(error){say('No se pudieron leer las fotos.');return;}
    const files=(data||[]).map(x=>x.name).filter(n=>n&&!n.startsWith('.'));
    if(!files.length){say('No hay fotos guardadas.');return;}
    const r=await sb.storage.from('fotos-en-vivo').remove(files);
    say(r.error?'No se pudieron borrar las fotos.':`✓ ${files.length} foto${files.length>1?'s':''} borrada${files.length>1?'s':''}.`);
  });
}
window.SAVED_LIVE_PANEL={mount,esc};
})();
