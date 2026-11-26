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
  /* Retransmisión: los saludos grabados de «Niños buenos», uno tras otro, con su propio audio.
     Duración real de cada video en segundos (para que todos vean el mismo video a la vez). */
  retransmision: {"alejandra":7.94,"alexa":7.94,"allison":8.03,"antonella":7.94,"aron-y-abdiel":9.61,"braian":7.94,"camila":12.42,"camila-1":7.94,"camila-2":7.94,"dariana":7.94,"diana":7.94,"diego":7.94,"dylan":7.94,"emma":7.94,"fernanda":7.94,"gabriel-1":9.92,"gael":7.94,"gustavo":8.61,"isabella":7.94,"jared":7.94,"jasmin":7.94,"jasyeli":8.48,"jesus":7.94,"juan":7.94,"julieta":7.94,"lia":7.94,"liam-1":8.8,"liam-y-gilbelismar":16.79,"maria":7.94,"mateo":9.94,"mathias":8.57,"mia":7.94,"noah":7.94,"oliver":7.94,"oliver-1":7.94,"rosa":7.94,"sara":7.94,"sebastian":8.34,"selim":19.95,"sofia":10.31,"sofia-1":9.08,"thiago":7.24,"valentina":8.08,"valentina-lista-de-los-buenos":8.8,"victoria":8.85,"yusmary":16.58,"zoe":7.94,"llamada-de-santa-claus":16.28,"la-buena-accion-de-santa-claus":17.51,"luces-de-navidad":15.88,"volando-por-colombia":37.25},
  playlist: [
    { src: 'assets/lista-video/santa-luna.mp4', title: 'Santa saluda bajo la luna de Navidad', duration: 7.93, repeat: 3 },
    { src: 'assets/lista-video/santa-bolsita.mp4', title: 'Santa prepara su bolsita de estrellas', duration: 7.93, repeat: 3 },
    { src: 'assets/lista-video/santa-destellos.mp4', title: 'Santa reparte magia en la aldea', duration: 7.93, repeat: 3 },
    { src: 'assets/lista-video/santa-polvo.mp4', title: 'Santa lanza polvo de estrellas', duration: 7.93, repeat: 3 },
    { src: 'assets/lista-video/santa-guirnaldas.mp4', title: 'Santa pasea por el sendero iluminado', duration: 7.93, repeat: 3 }
  ]
};
