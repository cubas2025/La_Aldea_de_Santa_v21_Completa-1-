(() => {
  'use strict';
  const main=document.querySelector('main');
  const titles={llamadas:'Llamadas de Santa',editor:'Editor de videos',inicio:'Inicio',magia:'Explora la aldea',catalogo:'Saludos personalizados',pedido:'Personaliza tu saludo','lista-buenos':'Lista de los buenos',tarjetas:'Tarjetas mágicas',juegos:'El gran reto de aprender','tarjeta-navidad':'Tarjeta Navidad',cuentos:'Cuentos con su nombre',colorear:'El taller de colores',buenos:'40 escenas de Santa',cumpleanos:'Invitaciones de cumpleaños','tarjeta-qr':'Tarjetas con QR',preguntas:'Preguntas frecuentes'};
  function route(){
    let key;try{key=decodeURIComponent(location.hash.slice(1))||'inicio';}catch{key='inicio';}
    if(key==='contenido')return;
    if(!titles[key])key='inicio';
    const visible=key==='catalogo'||key==='pedido'?['catalogo','pedido']:[key];
    for(const el of main.children)el.hidden=el.classList.contains('ribbon')?key!=='inicio':!visible.includes(el.id);
    document.body.dataset.page=key;
    document.querySelector('#route-title').textContent=titles[key];
    document.title=`${titles[key]} · La aldea de Santa`;
    for(const a of document.querySelectorAll('.site-header nav a')){
      const match=a.hash==='#'+key||(a.hash==='#catalogo'&&key==='pedido');
      if(match)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    }
    for(const media of document.querySelectorAll('main audio,main video'))if(media.closest('main > section')?.hidden)media.pause();
    window.dispatchEvent(new CustomEvent('aldea:navigate',{detail:{page:key}}));
    requestAnimationFrame(()=>{if(key==='pedido')document.querySelector('#pedido').scrollIntoView({behavior:'instant'});else window.scrollTo({top:0,behavior:'instant'});});
  }
  window.addEventListener('hashchange',route);route();
})();
