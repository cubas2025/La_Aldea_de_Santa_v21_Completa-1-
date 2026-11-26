/* Videos listos de «Niños buenos». Para añadir uno: copia el MP4 en videos/ninos-buenos/
   y agrega una línea aquí. Los hashtags fijos se añaden siempre al final del título. */
window.NINOS_BUENOS=(() => {
  'use strict';
  const HASHTAGS=['#cubas.ai','#laaldeadesanta','#navidad','#santaclaus','#niñosbuenos','#fyp','#parati'];
  const ONE=[
    n=>`🎅 ¡Santa acaba de confirmar que ${n} está en la lista de los niños buenos! ✨`,
    n=>`${n}, Santa tiene un mensaje solo para ti 🎄❤️ ¡Míralo hasta el final!`,
    n=>`Cuando Santa escribe tu nombre con polvo de estrellas… ✨ ${n} ya es oficial 🎁`,
    n=>`😱 ¡Santa dijo el nombre de ${n}! Etiqueta a alguien que también se portó bien 🎅`,
    n=>`La lista de los buenos de esta Navidad ya salió… y ${n} está en ella 📜✨`,
    n=>`POV: Santa te nombra en la lista de los niños buenos 🎄 ¡Felicidades, ${n}! 🎁`
  ];
  const MANY=[
    n=>`🎅 ¡Santa confirmó que ${n} están en la lista de los niños buenos! ✨ Etiqueta a tus hermanos`,
    n=>`Santa tiene un mensaje para ${n} 🎄❤️ ¡Los hermanos más buenos del año!`
  ];
  // [archivo, nombre visible, duración (s), tamaño (MB), tipo]
  const rows=[
    ['alejandra','Alejandra',8,13.3],['alexa','Alexa',8,9.0],['allison','Allison',8,11.1],['antonella','Antonella',8,10.4],
    ['aron-y-abdiel','Aron y Abdiel',10,10.0,'many'],['braian','Braian',8,12.4],
    ['camila','Camila',12,13.6],['camila-1','Camila',8,11.9],['camila-2','Camila',8,12.0],
    ['dariana','Dariana',8,13.2],['diana','Diana',8,11.7],['diego','Diego',8,13.4],['dylan','Dylan',8,12.6],['emma','Emma',8,12.3],
    ['fernanda','Fernanda',8,13.9],['gabriel-1','Gabriel',10,15.6],['gael','Gael',8,13.6],['gustavo','Gustavo',9,11.8],['isabella','Isabella',8,13.0],
    ['jared','Jared',8,14.1],['jasmin','Jasmín',8,12.3],['jasyeli','Jasyeli',8,13.4],['jesus','Jesús',8,11.4],['juan','Juan',8,14.4],['julieta','Julieta',8,10.2],
    ['lia','Lía',8,13.1],['liam-1','Liam',9,14.9],['liam-y-gilbelismar','Liam y Gilbelismar',17,8.2,'many'],
    ['maria','María',8,15.3],['mateo','Mateo',10,11.0],['mathias','Mathías',9,13.7],['mia','Mía',8,12.2],['noah','Noah',8,12.1],
    ['oliver','Oliver',8,13.2],['oliver-1','Oliver',8,13.2],['rosa','Rosa',8,14.6],['sara','Sara',8,13.5],['sebastian','Sebastián',8,14.3],
    ['selim','Selim',20,21.1],['sofia','Sofía',10,16.8],['sofia-1','Sofía',9,11.4],['thiago','Thiago',7,10.6],
    ['valentina','Valentina',8,14.0],['valentina-lista-de-los-buenos','Valentina',9,14.4],['victoria','Victoria',9,14.9],
    ['yusmary','Yusmary',17,23.1],['zoe','Zoe',8,12.3],
    ['llamada-de-santa-claus','Llamada de Santa Claus',16,19.0,'special','📞 ¿Y si Santa te llamara hoy? Así suena la cabina de llamadas del Polo Norte 🎅✨'],
    ['la-buena-accion-de-santa-claus','La buena acción de Santa',18,8.6,'special','🎅💛 Santa nos recuerda que los pequeños gestos lo cambian todo. ¿A quién ayudarás hoy?'],
    ['luces-de-navidad','Luces de Navidad',16,7.9,'special','✨ Las luces de Navidad ya se encendieron en la aldea de Santa 🎄 ¿Ya armaste tu árbol?'],
    ['volando-por-colombia','Volando por Colombia',37,18.3,'special','🦌 ¡Santa sobrevoló Colombia en su trineo! 🇨🇴 ¿Será su próximo destino? ✨']
  ];
  const seen={};
  const items=rows.map(([id,name,duration,mb,kind='one',custom],i)=>{
    const n=(seen[name]=(seen[name]||0)+1);
    const title=custom||(kind==='many'?MANY[i%MANY.length]:ONE[i%ONE.length])(name);
    return Object.freeze({id,name,label:n>1?`${name} · versión ${n}`:name,duration,mb,special:kind==='special',src:`videos/ninos-buenos/${id}.mp4`,title,caption:`${title}\n\n${HASHTAGS.join(' ')}`});
  });
  return Object.freeze({hashtags:HASHTAGS,items});
})();
