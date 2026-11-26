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
  /* Escenas de Santa (sin sonido durante la lista). title en español, title_en en inglés y title_pt en portugués. */
  playlist: [
    { src: 'assets/en-vivo/santa-polvo-estrellas.mp4', title: 'Santa esparce polvo de estrellas mágico', title_en: 'Santa sprinkles magic stardust', title_pt: 'Papai Noel espalha pó de estrelas mágico', duration: 7.93, repeat: 4 },
    { src: 'assets/lista-video/santa-luna.mp4', title: 'Santa saluda bajo la luna de Navidad', title_en: 'Santa waves under the Christmas moon', title_pt: 'Papai Noel acena sob a lua de Natal', duration: 7.93, repeat: 3 },
    { src: 'assets/lista-video/santa-bolsita.mp4', title: 'Santa prepara su bolsita de estrellas', title_en: 'Santa prepares his bag of stars', title_pt: 'Papai Noel prepara sua bolsinha de estrelas', duration: 7.93, repeat: 3 },
    { src: 'assets/en-vivo/santa-polvo-estrellas.mp4', title: 'La magia de Santa ilumina la aldea', title_en: "Santa's magic lights up the village", title_pt: 'A magia do Papai Noel ilumina a vila', duration: 7.93, repeat: 3 },
    { src: 'assets/lista-video/santa-destellos.mp4', title: 'Santa reparte magia en la aldea', title_en: 'Santa spreads magic around the village', title_pt: 'Papai Noel espalha magia pela vila', duration: 7.93, repeat: 3 },
    { src: 'assets/lista-video/santa-polvo.mp4', title: 'Santa lanza polvo de estrellas', title_en: 'Santa throws stardust', title_pt: 'Papai Noel lança pó de estrelas', duration: 7.93, repeat: 3 },
    { src: 'assets/lista-video/santa-guirnaldas.mp4', title: 'Santa pasea por el sendero iluminado', title_en: 'Santa walks the glowing path', title_pt: 'Papai Noel passeia pelo caminho iluminado', duration: 7.93, repeat: 3 }
  ],
  /* Música de fondo del en vivo (se reproduce en orden, con volumen igualado y transición suave). */
  musica: [
    { src: 'assets/en-vivo/musica/christmas-waltz.mp3', title: 'A Christmas Waltz', gain: 0.8 },
    { src: 'assets/en-vivo/musica/heavenly-winter-wonder.mp3', title: 'Heavenly Winter Wonder', gain: 0.87 },
    { src: 'assets/en-vivo/musica/moonlight-frozen-king.mp3', title: 'Moonlight on the Frozen King', gain: 0.95 },
    { src: 'assets/en-vivo/musica/quiet-christmas-miracle.mp3', title: 'A Quiet Christmas Miracle', gain: 0.89 },
    { src: 'assets/en-vivo/musica/galactic-sleigh-ride.mp3', title: 'Galactic Sleigh Ride', gain: 0.96 },
    { src: 'assets/en-vivo/musica/heavenly-christmas.mp3', title: 'Heavenly Christmas', gain: 0.81 },
    { src: 'assets/en-vivo/musica/sleigh-bells-dance.mp3', title: "The Sleigh Bells' Dance", gain: 0.91 },
    { src: 'assets/en-vivo/musica/christmas-orchestral.mp3', title: 'A Christmas Orchestral', gain: 0.88 },
    { src: 'assets/en-vivo/musica/galactic-sleigh-ride-2.mp3', title: 'Galactic Sleigh Ride · II', gain: 1 },
    { src: 'assets/en-vivo/musica/gallop-of-the-sleigh.mp3', title: 'Gallop of the Sleigh', gain: 0.81 },
    { src: 'assets/navidad/village-christmas-lights.mp3', title: 'Village Christmas Lights', gain: 0.8 },
    { src: 'assets/musica/sleigh-bells.mp3', title: 'Sleigh Bells in the Air', gain: 1 },
    { src: 'assets/musica/sleigh-takeoff.mp3', title: 'Sleigh Takeoff', gain: 0.88 },
    { src: 'assets/musica/sleigh-takeoff-2.mp3', title: 'Sleigh Takeoff · II', gain: 0.81 },
    { src: 'assets/musica/final-bell.mp3', title: 'The Final Bell', gain: 0.95 },
    { src: 'assets/musica/final-bell-2.mp3', title: 'The Final Bell · II', gain: 0.93 },
    { src: 'assets/musica/fourth-note.mp3', title: 'The Fourth Note', gain: 0.96 },
    { src: 'assets/musica/fourth-note-2.mp3', title: 'The Fourth Note · II', gain: 1 },
    { src: 'assets/musica/music-box-waltz.mp3', title: 'The Music Box Waltz', gain: 0.91 },
    { src: 'assets/musica/final-note.mp3', title: 'The Final Note', gain: 0.9 },
    { src: 'assets/musica/crystal-chime.mp3', title: 'Crystal Chime', gain: 0.91 }
  ]
};
