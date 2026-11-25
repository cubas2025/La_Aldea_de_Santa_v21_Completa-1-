(() => {
  'use strict';
  const controllers=new Map();
  function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),60000);}
  window.SANTA_VIDEO_SHARE={
    update(id,blob,name,caption=''){const c=controllers.get(id);if(c){c.blob=blob;c.name=name;c.caption=caption;for(const b of c.root.querySelectorAll('button'))b.disabled=!blob;}},
    attach(id){
      const root=document.querySelector(`[data-video-sharing="${id}"]`);if(!root)return;
      const c={root,blob:null,name:''};controllers.set(id,c);
      const note=document.createElement('p');note.className='fine share-help';note.setAttribute('role','status');note.textContent='Genera el video y elige dónde compartirlo. En el celular se abre el menú de aplicaciones; selecciona TikTok, WhatsApp u otra red disponible.';
      const buttons=document.createElement('div');buttons.className='social-buttons';
      for(const platform of ['TikTok','WhatsApp','Instagram','Facebook','Otras redes']){
        const b=document.createElement('button');b.type='button';b.className='button outline';b.textContent=platform==='Otras redes'?'Compartir en otras redes':`Compartir en ${platform}`;b.disabled=true;
        b.addEventListener('click',async()=>{
          if(!c.blob)return;const file=new File([c.blob],c.name,{type:'video/mp4'});
          if(navigator.canShare?.({files:[file]})){
            note.textContent=`Elige ${platform==='Otras redes'?'la aplicación':platform} en el menú de tu dispositivo.`;
            try{await navigator.share({files:[file],title:'La aldea de Santa',...(c.caption?{text:c.caption}:{})});note.textContent='El archivo se entregó al menú para compartir. Completa el envío o la publicación en la aplicación elegida.';return;}
            catch(err){if(err.name==='AbortError'){note.textContent='Compartir cancelado. Tu video sigue listo para descargar.';return;}}
          }
          download(c.blob,c.name);note.textContent=`Tu navegador no puede enviar archivos directamente a otras apps. Video descargado: ábrelo en ${platform==='Otras redes'?'tu red social favorita':platform} para adjuntarlo o publicarlo.`;
        });buttons.append(b);
      }
      if(id!=='ed'){const edit=document.createElement('button');edit.type='button';edit.className='button outline';edit.textContent='Editar este video';edit.disabled=true;edit.addEventListener('click',()=>{if(!c.blob)return;window.SANTA_EDITOR?.load(c.blob,c.name);location.hash='editor';});buttons.prepend(edit);}root.append(buttons,note);
    }
  };
  for(const root of document.querySelectorAll('[data-video-sharing]'))window.SANTA_VIDEO_SHARE.attach(root.dataset.videoSharing);
})();
