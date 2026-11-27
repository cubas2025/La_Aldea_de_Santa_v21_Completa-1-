/* Sabelina, la maestra del conocimiento, anima el quiz en vivo: 3 minutos antes de cada partida de 10 preguntas.
   Cada animación se arma con frases de distintos tipos (saludos a países, hora en vivo, compartir, regalitos,
   metas, actualización de nombres…), en un orden que cambia en cada partida pero es igual en todas las pantallas.
   Para agregar frases, añade textos a las listas: se usan solos. */
(() => {
const pools = {
  apertura: [
    '¡Hola, hola, familia de la aldea! Soy Sabelina, la maestra del conocimiento, ¡y bienvenidos al gran Quiz Navideño en vivo!',
    '¡Muy buenas, mis queridos aprendices! Aquí Sabelina, desde la Academia Mágica de Santa. ¡Qué alegría verlos llegar!',
    '¡Atención, atención! La Academia Mágica abre sus puertas. Soy Sabelina y hoy vamos a aprender jugando todos juntos.',
    '¡Hola a todos los curiosos del mundo! Soy Sabelina. Preparen la mente, que el quiz más divertido del Polo Norte está por empezar.',
    '¡Bienvenidos, pequeños genios y grandes campeones! Sabelina al micrófono, con preguntas nuevas recién salidas del libro del conocimiento infinito.',
    '¡Jo, jo, jo! Bueno, eso lo dice Santa… Yo digo: ¡hola, hola! Soy Sabelina y esto es el Quiz Navideño en vivo.',
  ],
  reglas: [
    'Las reglas son facilísimas: leo la pregunta, ustedes eligen A, B o C, y la escriben en el chat antes de que se acabe el tiempo.',
    'Cada partida tiene diez preguntas. Cuenten sus aciertos con los dedos, en un papel o en la cabeza, ¡porque al final les pregunto su puntaje!',
    'Pueden jugar solos o en equipo con la familia. ¡Dos cabezas piensan mejor que una, y tres cabezas… hacen un escándalo maravilloso!',
  ],
  puntaje: [
    '¡Terminó la partida! A ver, a ver… ¿cuántas acertaron de diez? ¡Escriban su puntaje en los comentarios!',
    '¿Quién sacó diez de diez? ¡Quiero ver a los genios navideños en el chat! Y si sacaron menos, no pasa nada: ¡hoy aprendieron algo nuevo!',
    'Pongan su puntaje en los comentarios, por ejemplo: ocho de diez. ¡Vamos a ver quién es el campeón o la campeona de la aldea!',
    'Si fallaron alguna, ¡felicidades! Equivocarse es la mejor forma de aprender. Escriban en el chat cuántas acertaron.',
    'Reto para la siguiente partida: superar su propio puntaje. Si sacaron seis, ¡vamos por siete! Escriban su número en los comentarios.',
  ],
  saludo: [
    '¡Un abrazo enorme para {p1}! Saludos a {c1}. ¿Y dónde está mi gente de {p2}? ¡Escriban su ciudad en el chat!',
    '¡Saludos navideños a {p1}, especialmente a {c1}! Y otro abrazote para {p2}, para {c2}. ¡Qué lindo es jugar juntos desde tantos lugares!',
    '¿Quién nos ve desde {p1}? ¡Hola, {c1}! ¿Y desde {p2}? ¡Un saludo especial para {c2}! Escriban desde dónde juegan.',
    '¡La magia de la Navidad viaja por toda Latinoamérica! Hoy saludo a {p1}, a {c1}, y también a {p2}, a {c2}.',
    'Mis renos me cuentan que hay muchos aprendices en {p1} y en {p2}. ¡Hola, {c1}! ¡Hola, {c2}! Escriban su país en el chat.',
  ],
  compartir: [
    'Si les está gustando el quiz, ¡compártanlo con todos sus contactos! Toquen la flechita y envíenlo a la familia y a los amigos.',
    'Invitemos a más jugadores: compartan este en vivo en sus grupos. ¡Entre más seamos, más divertido es aprender!',
    '¿Tienen un primo, una abuela o un amigo que sabe muchísimo? ¡Compártanle el en vivo y que venga a competir!',
    'Ayúdenme a llevar el quiz a toda Latinoamérica: compartan la transmisión con todos sus contactos. ¡Gracias, mis aprendices!',
  ],
  regalos: [
    'Si pueden, envíen un regalito en el en vivo: nos ayuda muchísimo a seguir preparando preguntas, cuentos y sorpresas. ¡Gracias de corazón!',
    'Gracias a todos los que nos envían regalitos y apoyan la aldea. Cada apoyo nos ayuda a seguir transmitiendo para los niños.',
    'Cada regalito que envían es como una estrellita para la Academia Mágica. ¡Mil gracias por su cariño y por ayudarnos a seguir!',
  ],
  metas: [
    '¡Vamos por la meta de corazones! Toquen la pantalla muchas veces y llenemos el en vivo de corazoncitos.',
    'Nuestra meta de hoy: que el en vivo brille con miles de corazones. ¡Tap, tap, tap en la pantalla!',
    'Si llegamos a la meta de corazones, ¡prometo una partida con preguntas súper curiosas! ¡Vamos, toquen la pantalla!',
    'Síganos para no perderse ninguna partida y dejen su corazón en el en vivo. ¡Estamos muy cerca de la meta!',
  ],
  nombres: [
    '¡Pregunta importante! ¿Enviamos la actualización de los nombres a Santa? Escriban su nombre y su país en los comentarios y Estelvia los lleva a Santa Claus.',
    'Estelvia, la guardiana de las cartas, está lista para enviar la actualización de nombres a Santa. ¡Escriban su nombre completo y desde dónde nos ven!',
    '¿Quién quiere que su nombre llegue hoy al Polo Norte? Escríbanlo en el chat con su ciudad. ¡Enviamos la actualización de los nombres a Santa!',
  ],
  animo: [
    'Recuerden: cada nuevo aprendizaje enciende una estrella en su corazón. ¡Y hoy vamos a encender muchas!',
    'No importa si aciertan o no: lo importante es intentarlo, aprender y divertirnos en familia.',
    'Los niños curiosos hacen las mejores preguntas. ¡Sigan preguntando siempre, que así se aprende!',
    'Quédense con nosotros, porque la siguiente partida trae preguntas de animales, planetas, países, inventos y mucho más.',
    'Pónganse cómodos, llamen a la familia y preparen la mente. ¡Lo que viene está buenísimo!',
    'Un consejo de la Academia Mágica: lean bien cada pregunta y piensen con calma. ¡El apuro es enemigo del acierto!',
    'Dato curioso: ¡las preguntas de hoy salen del libro del conocimiento infinito, y nunca se repiten hasta terminarlas todas!',
    'Aquí en la aldea, todos ganamos: el que acierta aprende, y el que se equivoca… ¡también aprende!',
  ],
  final: [
    '¡Atención, aprendices! La partida {n} empieza en tres, dos, uno… ¡a jugar!',
    '¡Preparados, listos… ya! Comienza la partida {n}. ¡Mucha suerte a todos!',
    '¡Que suenen las campanas! La partida {n} arranca ahora mismo. ¡Atentos a la primera pregunta!',
  ],
};
const lugares = [
  ['Perú', 'Lima, Arequipa y Trujillo'], ['México', 'Ciudad de México, Guadalajara y Monterrey'], ['Colombia', 'Bogotá, Medellín y Cali'],
  ['Argentina', 'Buenos Aires, Córdoba y Rosario'], ['Chile', 'Santiago, Valparaíso y Concepción'], ['Ecuador', 'Quito, Guayaquil y Cuenca'],
  ['Venezuela', 'Caracas, Maracaibo y Valencia'], ['Bolivia', 'La Paz, Santa Cruz y Cochabamba'], ['Paraguay', 'Asunción y Ciudad del Este'],
  ['Uruguay', 'Montevideo y Punta del Este'], ['Guatemala', 'Ciudad de Guatemala y Antigua'], ['Honduras', 'Tegucigalpa y San Pedro Sula'],
  ['El Salvador', 'San Salvador y Santa Ana'], ['Nicaragua', 'Managua y León'], ['Costa Rica', 'San José y Alajuela'],
  ['Panamá', 'Ciudad de Panamá y Colón'], ['República Dominicana', 'Santo Domingo y Santiago'], ['Puerto Rico', 'San Juan y Ponce'],
  ['Cuba', 'La Habana y Santiago de Cuba'], ['España', 'Madrid, Barcelona y Sevilla'], ['Estados Unidos', 'Miami, Los Ángeles y Nueva York'],
];
const rng = seed => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const pick = (r, a) => a[Math.floor(r() * a.length)];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
/* La hora en vivo: se escribe en el momento en que se dice. */
function horaEnVivo() {
  const d = new Date(), h = d.getHours(), m = d.getMinutes(), h12 = h % 12 || 12;
  const parte = h < 6 ? 'de la madrugada' : h < 12 ? 'de la mañana' : h < 19 ? 'de la tarde' : 'de la noche';
  const hora = m === 0 ? `son las ${h12} en punto ${parte}` : m === 1 ? `son las ${h12} y un minuto ${parte}` : `son las ${h12} y ${m} ${parte}`;
  const xmas = d.getMonth() === 11 && d.getDate() === 25;
  const y = d.getFullYear() + (d.getMonth() === 11 && d.getDate() > 25 ? 1 : 0);
  const dias = Math.floor((new Date(y, 11, 25) - d) / 86400000);   // igual que el contador de la pantalla
  const falta = xmas ? '¡y hoy es Navidad! ¡Feliz Navidad a todos!' : dias === 0 ? '¡y mañana es Navidad!' : dias === 1 ? 'y falta 1 día para Navidad' : `y faltan ${dias} días para Navidad`;
  return `¡Hora de la aldea! Hoy es ${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}, ${hora}, ${falta}`;
}
/* Arma la animación de una partida: [{t, tipo, texto (o función)}]; dura 3 minutos. */
function build(round, num) {
  const r = rng(round * 2654435761 >>> 0), plan = [], used = new Set();
  const take = tipo => { let t, k = 0; do { t = pick(r, pools[tipo]); } while (used.has(t) && k++ < 8); used.add(t); return t; };
  const usados = new Set(), libre = () => { let x, k = 0; do { x = pick(r, lugares); } while (usados.has(x) && k++ < 30); usados.add(x); return x; };
  const saludo = () => { const a = libre(), b = libre();
    return take('saludo').replace('{p1}', a[0]).replace('{c1}', a[1]).replace('{p2}', b[0]).replace('{c2}', b[1]); };
  const orden = [
    ['apertura', take('apertura')], ['puntaje', take('puntaje')], ['saludo', saludo()], ['compartir', take('compartir')],
    ['hora', horaEnVivo], ['reglas', take('reglas')], ['saludo', saludo()], ['nombres', take('nombres')],
    ['animo', take('animo')], ['regalos', take('regalos')], ['hora', horaEnVivo], ['saludo', saludo()],
    ['metas', take('metas')], ['animo', take('animo')], ['saludo', saludo()], ['hora', horaEnVivo],
    ['final', take('final').replace('{n}', num)],
  ];
  const times = [1500, 10500, 21000, 32000, 43000, 54500, 65000, 76000, 87500, 98500, 109000, 120000, 131000, 142000, 153000, 163500, 172500];
  orden.forEach(([tipo, texto], i) => plan.push({ t: times[i], tipo, texto }));
  return plan;
}
const TIPOS = { apertura: '🎅 Bienvenida', puntaje: '🏆 Tu puntaje', saludo: '🌎 Saludos en vivo', compartir: '📲 Comparte', hora: '🕒 Hora de la aldea',
  reglas: '📜 Reglas', nombres: '📝 Nombres para Santa', animo: '✨ Ánimo', regalos: '🎁 Regalitos', metas: '❤️ Meta del en vivo', final: '🚀 ¡A jugar!' };
window.SANTA_QUIZ_HOST = { duracion: 180000, build, tipos: TIPOS, horaEnVivo };
})();
