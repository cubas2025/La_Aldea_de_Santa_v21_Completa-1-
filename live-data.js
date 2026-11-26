/* Canal en vivo de Santa.
   - playlist: videos públicos de Santa que se emiten en bucle, sincronizados con la hora
     (todos los visitantes ven el mismo momento, como una transmisión en directo).
     Para agregar un video: guárdalo en videos/en-vivo/ y añade una línea aquí con su
     duración en segundos. "repeat" repite un clip corto varias veces seguidas.
   - liveNow + tiktokUser: cuando estés en vivo en TikTok, pon liveNow:true y tu usuario
     (sin @). La web mostrará el cartel «Santa está EN VIVO» con el botón a tu transmisión.
   - youtubeLiveId: opcional, el ID del video de tu directo en YouTube para verlo dentro de la web.
   Los videos de clientes NO van aquí: se reproducen desde tu dispositivo en el panel de creador. */
window.ALDEA_LIVE = {
  liveNow: false,
  tiktokUser: '',
  youtubeLiveId: '',
  playlist: [
    { src: 'assets/lista-video/santa-luna.mp4', title: 'Santa saluda bajo la luna de Navidad', duration: 7.93, repeat: 3 },
    { src: 'assets/lista-video/santa-bolsita.mp4', title: 'Santa prepara su bolsita de estrellas', duration: 7.93, repeat: 3 },
    { src: 'assets/lista-video/santa-destellos.mp4', title: 'Santa reparte magia en la aldea', duration: 7.93, repeat: 3 },
    { src: 'assets/lista-video/santa-polvo.mp4', title: 'Santa lanza polvo de estrellas', duration: 7.93, repeat: 3 },
    { src: 'assets/lista-video/santa-guirnaldas.mp4', title: 'Santa pasea por el sendero iluminado', duration: 7.93, repeat: 3 }
  ]
};
