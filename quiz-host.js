/* Sabelín, la maestra del conocimiento, anima el quiz en vivo: 3 minutos antes de cada partida de 10 preguntas.
   Cada animación se arma con frases de distintos tipos, en un orden que cambia en cada partida pero es igual
   en todas las pantallas. La «hora de la aldea» se dice una vez por hora (en la primera animación de cada hora).
   Para agregar frases, añade textos a las listas: se usan solos. */
(() => {
const pools = {
  apertura: [
    '¡Hola, hola, familia de la aldea! Soy Sabelín, la maestra del conocimiento, ¡y bienvenidos al gran Quiz Navideño en vivo!',
    '¡Muy buenas, mis queridos aprendices! Aquí Sabelín, desde la Academia Mágica de Santa. ¡Qué alegría verlos llegar!',
    '¡Atención, atención! La Academia Mágica abre sus puertas. Soy Sabelín y vamos a aprender jugando todos juntos.',
    '¡Hola a todos los curiosos del mundo! Soy Sabelín. Preparen la mente, que el quiz más divertido del Polo Norte sigue en marcha.',
    '¡Bienvenidos, pequeños genios y grandes campeones! Sabelín al micrófono, con preguntas recién salidas del libro del conocimiento infinito.',
    '¡Jo, jo, jo! Bueno, eso lo dice Santa… Yo digo: ¡hola, hola! Soy Sabelín y esto es el Quiz Navideño en vivo.',
    'Aquí seguimos, sin parar, desde la Academia Mágica. Soy Sabelín y la próxima partida ya se está preparando.',
    '¡Las campanas de la academia suenan otra vez! Hola, soy Sabelín, y tengo diez preguntas nuevas para ustedes.',
    '¡Qué bonito es ver el chat lleno de familias! Soy Sabelín, la maestra del conocimiento, y esto no se detiene.',
    'Desde la torre más alta de la Academia Mágica, ¡hola, hola! Sabelín les da la bienvenida a una nueva partida.',
    '¡Bienvenidos de nuevo a la Academia Mágica! Soy Sabelín y hoy las preguntas vienen cargadas de polvo de estrellas.',
    '¡Se encienden las luces del Polo Norte! Comienza una nueva ronda de preguntas. ¿Listos para pensar rápido?',
    '¡Hola, hola, aprendices! Abran bien los ojos y prepárense: el quiz más brillante de la Navidad está por empezar.',
    '¡Aquí Sabelín desde la biblioteca mágica! Hoy los libros se abrieron solitos para traernos preguntas nuevas.',
    '¡Las campanas sonaron tres veces! Eso significa que empieza otra partida en la Academia Mágica del Polo Norte.',
  ],
  bienvenida: [
    '¡Bienvenidos a todos los que se van uniendo! Pónganse cómodos, que aquí jugamos y aprendemos sin parar.',
    'Veo gente nueva llegando al en vivo. ¡Hola, hola! Escriban su nombre y su país para saludarlos.',
    'A los que acaban de entrar: ¡bienvenidos a la Academia Mágica de Santa! Aquí se responde A, B o C en el chat.',
    '¡Qué alegría! Siguen llegando aprendices de toda Latinoamérica. ¡Bienvenidos, bienvenidas!',
    'Si es la primera vez que nos visitas, ¡bienvenido! Esto es un quiz navideño en vivo y puedes jugar desde ya.',
    '¡Un saludo enorme a los que se acaban de conectar! Llamen a la familia, que la siguiente partida empieza pronto.',
    'Bienvenidos a los recién llegados: aquí no hay prisa, cada partida tiene diez preguntas y siempre empieza una nueva.',
    'Hola a los que se integran al en vivo: dejen un corazoncito para que Santa sepa que llegaron.',
    '¡La puerta de la academia sigue abierta! Bienvenidos a los que entran ahora mismo.',
    'Nuevos aprendices en el chat, ¡qué emoción! Escriban «¡llegué!» para darles la bienvenida.',
    'A los que se están uniendo desde el celular, desde la tele o desde la computadora: ¡bienvenidos a la aldea!',
    '¡Hola, hola, recién llegados! Les cuento rápido: leo la pregunta, ustedes eligen A, B o C, y aprendemos juntos.',
    'Bienvenidos a los abuelos, a los papás, a las mamás y a todos los niños que se unen ahora. ¡Aquí juega toda la familia!',
    'Si acabas de llegar, no te preocupes: el quiz nunca termina. Entra a la siguiente partida y cuenta tus aciertos.',
    '¡Bienvenidos! Este en vivo es para todo público: niños, jóvenes y grandes. ¡Todos aprendemos algo nuevo!',
    'Siguen llegando amigos al en vivo. ¡Bienvenidos! Abracen mi cuenta y juntos seamos más, así no se pierden ninguna partida.',
    '¡Qué lindo! Veo que se están uniendo muchos aprendices. ¡Bienvenidos a la Academia Mágica de Santa!',
    'A todos los que se van sumando: bienvenidos. Escriban desde qué ciudad nos ven y los saludo en vivo.',
    '¡Bienvenidos, bienvenidas! Estelvia también está aquí, lista para enviar sus nombres a Santa Claus.',
    'Hola a los nuevos jugadores: cada pregunta trae una explicación, así que siempre se van con algo aprendido.',
    'Si alguien te compartió este en vivo, ¡bienvenido! Y gracias a quien lo compartió.',
    'Los que acaban de entrar llegaron en el momento perfecto: ¡la próxima partida está por empezar!',
    'Bienvenidos a la aldea. Aquí siempre hay alguien atendiendo: de día, de noche y durante toda la Navidad.',
    '¡Hola, recién llegados! Preparen un papel para anotar sus aciertos, o cuéntenlos con los dedos.',
    'Un aplauso de bienvenida para los que se integran al en vivo. ¡Que empiece la diversión!',
    '¡Bienvenidos! Si quieren que Santa conozca su nombre, escríbanlo con su país en los comentarios.',
    'A los que llegan ahora: no se pierdan la actualización de los nombres con Estelvia, ¡es muy especial!',
    'Bienvenidos a todos los niños que se conectan desde la escuela, desde casa o desde la casa de los abuelos.',
    '¡Hola! A los que se unen: aquí cada respuesta, correcta o no, es un paso más para aprender.',
    'Siempre es un buen momento para llegar a la academia. ¡Bienvenidos, y a jugar!',
    '¡Bienvenidos a los que llegan desde México! La academia se llena de alegría con cada nuevo aprendiz.',
    '¡Qué bonito ver tantos nombres nuevos en el chat! Bienvenidos a la aldea, pónganse cómodos y a jugar.',
    'Si es tu primera vez aquí, ¡bienvenido! Solo tienes que escribir A, B o C en los comentarios. Así de fácil.',
    '¡Hola a los que se conectan desde Colombia, Perú y Ecuador! Bienvenidos a la Academia Mágica.',
    '¡Bienvenidas las familias que juegan juntas! Papás, abuelos y niños: aquí todos aprenden.',
    '¡Un saludo calientito a los que acaban de llegar! Tomen su chocolate y prepárense para la siguiente pregunta.',
    'Bienvenidos, bienvenidas. En esta aldea nadie llega tarde: siempre hay una partida nueva esperándote.',
    '¡Mis duendes me avisan que entraron muchos amigos nuevos! Bienvenidos a la aventura de aprender.',
    '¡Hola a todos los que nos ven desde Argentina, Chile y Uruguay! Bienvenidos al quiz navideño.',
    '¡Bienvenidos a los amigos de Venezuela, Bolivia y Paraguay! La academia los recibe con los brazos abiertos.',
    '¡Qué alegría! El chat se llenó de saludos. Bienvenidos a todos los que se van uniendo.',
    '¡Bienvenidos a los que nos ven desde Estados Unidos y España! La magia de la Navidad no tiene fronteras.',
    '¡Hola, nuevo aprendiz! Aquí no importa cuántas aciertes: lo importante es aprender y divertirnos.',
    '¡Bienvenidos a Centroamérica: Guatemala, Honduras, El Salvador, Nicaragua, Costa Rica y Panamá!',
    '¡Saludos a República Dominicana, Puerto Rico y Cuba! Bienvenidos a la Academia Mágica de Santa.',
    'Si acabas de entrar, escribe «hola» en el chat para que Sabelín te salude. ¡Bienvenido!',
    '¡Bienvenidos los hermanitos que juegan juntos! A ver quién de los dos acierta más.',
    '¡Hola a los profes y maestras que juegan con sus alumnos! Bienvenidos, aquí se aprende jugando.',
    '¡Qué bonito es ver la aldea tan llena! Bienvenidos a todos, gracias por acompañarnos hoy.',
    '¡Bienvenidos! Recuerden: abracen mi cuenta y juntos seamos más en esta gran familia navideña.',
  ],
  reglas: [
    'Las reglas son facilísimas: leo la pregunta, ustedes eligen A, B o C, y la escriben en el chat antes de que se acabe el tiempo.',
    'Cada partida tiene diez preguntas. Cuenten sus aciertos con los dedos, en un papel o en la cabeza, ¡porque al final les pregunto su puntaje!',
    'Pueden jugar solos o en equipo con la familia. ¡Dos cabezas piensan mejor que una, y tres cabezas… hacen un escándalo maravilloso!',
    'Cuando se acaba el tiempo, suena la campanita y aparece la respuesta correcta en verde, con una explicación.',
    'Las preguntas son de todo: animales, planetas, países, inventos, cuentas, palabras y mucho más. ¡Hay para todos los gustos!',
  ],
  puntaje: [
    '¡Terminó la partida! A ver, a ver… ¿cuántas acertaron de diez? ¡Escriban su puntaje en los comentarios!',
    '¿Quién sacó diez de diez? ¡Quiero ver a los genios navideños en el chat! Y si sacaron menos, no pasa nada: ¡hoy aprendieron algo nuevo!',
    'Pongan su puntaje en los comentarios, por ejemplo: ocho de diez. ¡Vamos a ver quién es el campeón o la campeona de la aldea!',
    'Si fallaron alguna, ¡felicidades! Equivocarse es la mejor forma de aprender. Escriban en el chat cuántas acertaron.',
    'Reto para la siguiente partida: superar su propio puntaje. Si sacaron seis, ¡vamos por siete! Escriban su número en los comentarios.',
    '¿Cómo les fue en la partida? Escriban su puntaje y desde qué país jugaron. ¡Me encanta leerlos!',
    'Un aplauso para todos los que jugaron la partida. ¿Cuántas acertaron? ¡El chat es suyo!',
    'Si jugaron en familia, ¿quién ganó en casa? ¡Escriban el puntaje de cada uno en los comentarios!',
    '¡Qué partida tan buena! Cuéntenme: ¿cuál pregunta les pareció la más difícil?',
    'Diez de diez es de genios, cinco de diez es de valientes, y cero de diez… ¡es de quien se va a reír y volver a intentarlo! ¿Cuántas sacaron?',
    '¿Cuántas acertaron? Escriban su puntaje del uno al diez en los comentarios. ¡Todos los puntajes valen!',
    '¡Hora de contar estrellitas! Cada respuesta correcta es una estrella. ¿Cuántas juntaron en esta partida?',
    '¿Sacaron diez de diez? ¡Escríbanlo en el chat para que Santa lo sepa! Y si no, la próxima será.',
    'Comparen su puntaje con su familia: ¿quién fue el campeón o la campeona de la casa en esta partida?',
    'No importa el número: si aprendiste algo nuevo, ya ganaste. ¡Escribe tu puntaje en los comentarios!',
  ],
  saludo: [
    '¡Un abrazo enorme para {p1}! Saludos a {c1}. ¿Y dónde está mi gente de {p2}? ¡Escriban su ciudad en el chat!',
    '¡Saludos navideños a {p1}, especialmente a {c1}! Y otro abrazote para {p2}, para {c2}. ¡Qué lindo es jugar juntos desde tantos lugares!',
    '¿Quién nos ve desde {p1}? ¡Hola, {c1}! ¿Y desde {p2}? ¡Un saludo especial para {c2}! Escriban desde dónde juegan.',
    '¡La magia de la Navidad viaja por toda Latinoamérica! Hoy saludo a {p1}, a {c1}, y también a {p2}, a {c2}.',
    'Mis renos me cuentan que hay muchos aprendices en {p1} y en {p2}. ¡Hola, {c1}! ¡Hola, {c2}! Escriban su país en el chat.',
    '¡Atención, {p1}! Un saludo para {c1}. Y para {p2}, ¡muchísimo cariño desde el Polo Norte!',
    'Nortelius, nuestro gran explorador, me pidió saludar a {p1} y a {p2}. ¡Hola, {c1}! ¡Hola, {c2}!',
    '¿Hay alguien en {c1}? ¿Y en {c2}? ¡Un abrazo para {p1} y para {p2}! Escriban su ciudad y los saludo.',
    'Desde la Academia Mágica, un saludo calientito para las familias de {p1} y de {p2}.',
    '¡Que levanten la mano los de {p1}! ¡Y los de {p2}! Saludos a {c1} y a {c2}.',
  ],
  compartir: [
    'Si les está gustando el quiz, ¡compártanlo con todos sus contactos! Toquen la flechita y envíenlo a la familia y a los amigos.',
    'Invitemos a más jugadores: compartan este en vivo en sus grupos. ¡Entre más seamos, más divertido es aprender!',
    '¿Tienen un primo, una abuela o un amigo que sabe muchísimo? ¡Compártanle el en vivo y que venga a competir!',
    'Ayúdenme a llevar el quiz a toda Latinoamérica: compartan la transmisión con todos sus contactos. ¡Gracias, mis aprendices!',
    'Un truco para jugar más divertido: compartan el en vivo con sus amigos y compitan a ver quién acierta más.',
    'Compartan este en vivo en el grupo de la familia. ¡Seguro hay un tío que se cree experto en geografía!',
    'Cada vez que comparten el en vivo, un niño más aprende algo nuevo. ¡Gracias por compartir!',
    'Toquen la flechita de compartir y envíenlo a tres contactos. ¡Hagamos crecer la Academia Mágica!',
    '¿Les gusta aprender jugando? ¡Compartan para que más familias se unan a la aventura!',
    'Si compartes el en vivo, Estelvia se pone feliz y Santa también. ¡Toca la flechita!',
    '¡Abraza mi cuenta y juntos seamos más! Así no te pierdes ninguna partida de la Academia Mágica.',
    'Si te gusta aprender con nosotros, abraza mi cuenta y juntos seamos más. ¡Gracias, aprendices!',
    'Abracen mi cuenta, compartan el en vivo y juntos seamos más en esta gran familia navideña.',
    '¿Quieres que la academia crezca? Abraza mi cuenta y juntos seamos más. ¡Santa lo agradece!',
    'Un abrazo a mi cuenta es un abrazo a toda la aldea. ¡Abraza mi cuenta y juntos seamos más!',
    'Toca la flechita, comparte con tu familia y abraza mi cuenta: juntos seamos más.',
    'Mientras más amigos lleguen, más divertido es el quiz. ¡Abraza mi cuenta y juntos seamos más!',
    'Comparte el en vivo con tus primos y amigos del cole. ¡Que vengan a jugar con nosotros!',
    'Un secreto de Sabelín: los mejores equipos se forman compartiendo. ¡Envía el en vivo a tus amigos!',
    'Abraza mi cuenta y juntos seamos más: cada nuevo amigo hace brillar más la estrella de la aldea.',
    '¿Ya abrazaste mi cuenta? Hazlo ahora y juntos seamos más aprendices en la Academia Mágica.',
    'Comparte el quiz en el grupo de la familia y reta a todos: ¿quién sabe más de la Navidad?',
  ],
  regalos: [
    'Si pueden, envíen un regalito en el en vivo: nos ayuda muchísimo a seguir preparando preguntas, cuentos y sorpresas. ¡Gracias de corazón!',
    'Gracias a todos los que nos envían regalitos y apoyan la aldea. Cada apoyo nos ayuda a seguir transmitiendo para los niños.',
    'Cada regalito que envían es como una estrellita para la Academia Mágica. ¡Mil gracias por su cariño y por ayudarnos a seguir!',
    'Gracias por cada regalito, por cada corazón y por cada comentario. ¡Así este en vivo puede seguir día y noche!',
    'Si quieren apoyar a la aldea para seguir con el en vivo, un regalito ayuda muchísimo. ¡Y un corazón también!',
    'Un agradecimiento especial a quienes nos apoyan con regalitos: gracias a ustedes seguimos aprendiendo juntos.',
    'Tinkarel dice que con sus regalitos podemos construir más preguntas y más sorpresas. ¡Gracias, gracias!',
    'Su apoyo mantiene encendidas las luces de la academia. ¡Gracias a todos los que envían regalitos!',
    'Gracias a cada donador que apoya la aldea con un regalito. ¡Ustedes mantienen encendida la magia!',
    'Un agradecimiento enorme a quienes envían regalitos: con su apoyo preparamos más preguntas y cuentos.',
    'Cada regalito que llega hace sonar una campanita en el Polo Norte. ¡Gracias, gracias, gracias!',
    'Gracias a las familias donadoras: su cariño ayuda a que este en vivo siga día y noche para los niños.',
    'Si nos apoyas con un regalito, tu nombre entra a la Lista de los buenos. ¡Mil gracias por tu cariño!',
    'Santa me pidió darles las gracias a todos los que apoyan la academia. ¡Son parte de la magia!',
    'Gracias por cada rosa, cada corazón y cada regalito. Todo ayuda a seguir aprendiendo juntos.',
    'Los duendes hacen una fiesta cada vez que llega un regalito. ¡Gracias por alegrar la aldea!',
    'Con sus regalitos construimos nuevas preguntas, nuevos cuentos y nuevas sorpresas. ¡Gracias de corazón!',
    'A todos los donadores: Santa tiene un lugar especial para ustedes en su gran libro. ¡Gracias!',
    'Un regalito pequeño hace una magia enorme. Gracias a quienes apoyan la Academia Mágica.',
    'Gracias por apoyar este en vivo familiar: gracias a ustedes más niños aprenden jugando.',
    'Cada regalito es como una galletita para los renos: les da energía para seguir. ¡Gracias!',
    'Quiero agradecer de todo corazón a los que nos acompañan y apoyan con regalitos. ¡Son increíbles!',
    'Gracias, gracias y mil gracias a nuestros donadores. ¡Abracen mi cuenta y juntos seamos más!',
  ],
  metas: [
    '¡Vamos por la meta de corazones! Toquen la pantalla muchas veces y llenemos el en vivo de corazoncitos.',
    'Nuestra meta de hoy: que el en vivo brille con miles de corazones. ¡Tap, tap, tap en la pantalla!',
    'Si llegamos a la meta de corazones, ¡prometo una partida con preguntas súper curiosas! ¡Vamos, toquen la pantalla!',
    'Síganos para no perderse ninguna partida y dejen su corazón en el en vivo. ¡Estamos muy cerca de la meta!',
    '¿Cuántos corazones podemos juntar antes de la siguiente partida? ¡A tocar la pantalla!',
    'La meta es grande, pero juntos somos muchos. ¡Corazones, corazones, corazones!',
    'Cada corazón que envían enciende una lucecita en el árbol de la academia. ¡Llenémoslo!',
    'Ayúdenme a llegar a la meta del en vivo: toquen la pantalla y sigan la cuenta. ¡Gracias!',
    '¡Vamos por la meta de corazones de esta partida! Toquen la pantalla y llenemos la aldea de amor.',
    'Si llegamos a la meta de corazones, Santa encenderá una estrella nueva en el cielo del Polo Norte.',
    '¡Cada toque en la pantalla es un copo de nieve mágico! ¿Hacemos una tormenta de corazones?',
    '¡Meta del día: que todos los aprendices escriban su país en el chat! Vamos a llenar el mapa.',
    'Nuestra meta: más amigos en la academia. Abracen mi cuenta y juntos seamos más.',
    '¡A tocar la pantalla! Cuando lleguemos a la meta, los duendes harán un baile especial.',
    '¿Llegamos a mil corazones antes de la siguiente partida? ¡Yo sé que sí podemos!',
    'Meta de hoy: compartir el en vivo con tres personas. ¡Hagamos crecer la Academia Mágica!',
  ],
  nombres: [
    '¡Pregunta importante! ¿Enviamos la actualización de los nombres a Santa? Apóyenme con un regalito y su nombre entra a la Lista de los buenos: Estelvia lo lleva directo a Santa Claus.',
    'Estelvia, la guardiana de las cartas, está lista para enviar la actualización de nombres a Santa. Con un regalito, su nombre pasa por la cinta dorada y se guarda en el Archivo mágico.',
    '¿Quién quiere que su nombre llegue hoy al Polo Norte? Envíen un regalito y formen parte de la Lista de los buenos. ¡Muchas gracias por su apoyo!',
    'Miren abajo del quiz: ahí pasan en letras doradas los nombres que entran a la Lista de los buenos. ¿Quieren estar ahí? ¡Apóyenme con un regalito!',
    'Estelvia me pregunta: ¿enviamos la actualización de los nombres a Santa? Cada regalito suma un nombre a la Lista de los buenos.',
    'Cada regalito es una cartita para Santa: Estelvia la sella con lacre y la guarda en el Archivo mágico. ¡Gracias de corazón!',
    'Hoy Santa quiere conocer muchos nombres nuevos. Con un regalito, su nombre y su país entran a la Lista de los buenos.',
    '¿Ya forman parte de la Lista de los buenos? Apóyenme con un regalito y muy pronto su nombre pasará por la cinta dorada.',
  ],
  animo: [
    'Recuerden: cada nuevo aprendizaje enciende una estrella en su corazón. ¡Y hoy vamos a encender muchas!',
    'No importa si aciertan o no: lo importante es intentarlo, aprender y divertirnos en familia.',
    'Los niños curiosos hacen las mejores preguntas. ¡Sigan preguntando siempre, que así se aprende!',
    'Quédense con nosotros, porque la siguiente partida trae preguntas de animales, planetas, países, inventos y mucho más.',
    'Pónganse cómodos, llamen a la familia y preparen la mente. ¡Lo que viene está buenísimo!',
    'Un consejo de la Academia Mágica: lean bien cada pregunta y piensen con calma. ¡El apuro es enemigo del acierto!',
    'Dato curioso: ¡las preguntas salen del libro del conocimiento infinito, y nunca se repiten hasta terminarlas todas!',
    'Aquí en la aldea, todos ganamos: el que acierta aprende, y el que se equivoca… ¡también aprende!',
    'Ser curioso es un superpoder. ¡Y aquí todos lo tenemos!',
    'Aprender es como armar un rompecabezas: cada pregunta es una pieza nueva.',
    'Si una pregunta te parece difícil, ¡excelente! Significa que estás aprendiendo algo nuevo.',
    'Este en vivo sigue día y noche, así que siempre que quieras aprender, aquí estaremos.',
    'Cuéntenme en el chat: ¿qué materia les gusta más? ¿Animales, números, países o el espacio?',
    'Recuerden tomar agua, sentarse cómodos y descansar la vista de vez en cuando. ¡Un buen aprendiz se cuida!',
    'Los guardianes de la Navidad están orgullosos de cada niño que aprende algo nuevo hoy.',
    'Prepárense, que en la siguiente partida puede salir una pregunta sobre los guardianes de la Navidad.',
    '¡Tú puedes! Cada pregunta es una oportunidad de aprender algo nuevo.',
    'Si fallaste una, no pasa nada: los mejores sabios también se equivocan y vuelven a intentar.',
    'Respira, piensa con calma y elige. ¡Confía en lo que sabes!',
    '¡Qué inteligentes son mis aprendices! Cada partida responden mejor.',
    'Aprender es como armar un árbol de Navidad: adorno por adorno, pregunta por pregunta.',
    'No importa si eres pequeño o grande: en la academia todos somos aprendices.',
    '¡Ánimo! La próxima pregunta puede ser justo la que más sabes.',
    'Equivocarse también es aprender. ¡Lo importante es seguir jugando!',
    'Sabelín está orgulloso de cada uno de ustedes. ¡Sigan así, campeones!',
    'Si una pregunta es difícil, pide ayuda a tu familia: pensar en equipo es más divertido.',
    '¡Qué emoción! Cada respuesta correcta hace brillar más la estrella de la academia.',
    'Un buen aprendiz no se rinde: escucha, piensa y vuelve a intentar.',
    'Hoy ya aprendiste algo nuevo. ¡Eso es un regalo que nadie te puede quitar!',
    '¡Vamos, vamos! La Academia Mágica cree en ti.',
    'Recuerda: lo más importante de la Navidad es compartir, y aquí compartimos lo que aprendemos.',
  ],
  curioso: [
    'Dato curioso de Nivarel: ¡los renos son los únicos ciervos en los que machos y hembras tienen astas!',
    'Boreal me cuenta que la luz del Sol tarda unos ocho minutos en llegar a la Tierra. ¡Viene volando!',
    'Nortelius dice que el río Amazonas lleva más agua que ningún otro río del mundo.',
    'Dato curioso: el pulpo tiene tres corazones. ¡Imagínense cuánto puede querer!',
    'Tinkarel sabe que el piano tiene ochenta y ocho teclas. ¿Alguien de ustedes toca el piano?',
    'Dato navideño: el villancico «Noche de paz» se cantó por primera vez en Austria, en 1818.',
    'Melodina dice que la flor de Nochebuena es originaria de México. ¡Qué bonita es!',
    'Dato curioso: el colibrí es el único pájaro que puede volar hacia atrás.',
    'Zafiriel me recuerda que la Tierra tarda unas veinticuatro horas en girar sobre sí misma.',
    'Dato del espacio: Júpiter es tan grande que dentro de él cabrían más de mil Tierras.',
    'Sanoma cuenta que «Canción de Navidad», con el señor Scrooge, la escribió Charles Dickens en 1843.',
    'Dato curioso: el ajolote mexicano puede regenerar partes de su cuerpo. ¡Es un pequeño superhéroe!',
    '¿Sabían que los renos pueden ver la luz ultravioleta? Eso les ayuda a encontrar comida en la nieve.',
    '¿Sabían que cada copo de nieve se forma alrededor de una diminuta partícula de polvo?',
    '¿Sabían que el árbol de Navidad del Rockefeller Center en Nueva York se ilumina desde los años treinta?',
    '¿Sabían que en Australia la Navidad llega en verano y muchas familias la celebran en la playa?',
    '¿Sabían que la flor de Pascua o nochebuena es originaria de México?',
    '¿Sabían que el pingüino emperador puede bucear a más de quinientos metros de profundidad?',
    '¿Sabían que la Luna se aleja de la Tierra unos tres o cuatro centímetros cada año?',
    '¿Sabían que el corazón de una ballena azul es tan grande como un auto pequeño?',
    '¿Sabían que el panetón nació en Milán, Italia, y hoy es muy querido en Perú y en toda Latinoamérica?',
    '¿Sabían que los pulpos tienen tres corazones?',
    '¿Sabían que la Antártida es el desierto más grande del mundo, aunque esté cubierta de hielo?',
    '¿Sabían que en Finlandia, en la región de Laponia, hay una aldea dedicada a Santa Claus?',
    '¿Sabían que la luz del Sol tarda unos ocho minutos en llegar a la Tierra?',
    '¿Sabían que el colibrí es el único pájaro que puede volar hacia atrás?',
    '¿Sabían que los osos polares tienen la piel negra debajo de su pelaje blanco?',
    '¿Sabían que el villancico «Noche de paz» se cantó por primera vez en Austria en 1818?',
    '¿Sabían que una jirafa duerme muy poquito, a veces menos de dos horas al día?',
    '¿Sabían que Júpiter es tan grande que dentro de él cabrían más de mil planetas como la Tierra?',
    '¿Sabían que las abejas se comunican bailando para contar dónde están las flores?',
    '¿Sabían que el chocolate viene del cacao, una planta que ya cultivaban los pueblos de Mesoamérica?',
  ],
  final: [
    '¡Atención, aprendices! La partida {n} empieza en tres, dos, uno… ¡a jugar!',
    '¡Preparados, listos… ya! Comienza la partida {n}. ¡Mucha suerte a todos!',
    '¡Que suenen las campanas! La partida {n} arranca ahora mismo. ¡Atentos a la primera pregunta!',
    '¡Mentes listas, lápices listos! La partida {n} comienza… ¡ya!',
    'Tres, dos, uno… ¡Despega la partida {n}, como el trineo de Santa!',
    '¡Silencio en la academia, que empieza la partida {n}! ¡Suerte, aprendices!',
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
/* Arma la animación de una partida: [{t, tipo, texto (o función)}]; dura 3 minutos.
   conHora: true solo en la primera animación de cada hora. */
const DURACION = 180000;
/* Tiempo que tarda el narrador en leer una frase (ms): ~0,43 s por palabra + pausas en signos + respiro. */
const dur = txt => { const w = String(txt).split(/\s+/).filter(Boolean).length, sig = (String(txt).match(/[.,!?¡¿;:]/g) || []).length;
  return Math.round((w * 0.43 + sig * 0.12 + 2.2) * 1000); };
function build(round, num, conHora) {
  const r = rng(round * 2654435761 >>> 0), plan = [], used = new Set();
  const take = tipo => { let t, k = 0; do { t = pick(r, pools[tipo]); } while (used.has(t) && k++ < 12); used.add(t); return t; };
  const usados = new Set(), libre = () => { let x, k = 0; do { x = pick(r, lugares); } while (usados.has(x) && k++ < 30); usados.add(x); return x; };
  const saludo = () => { const a = libre(), b = libre();
    return take('saludo').replace('{p1}', a[0]).replace('{c1}', a[1]).replace('{p2}', b[0]).replace('{c2}', b[1]); };
  const orden = [
    ['apertura', take('apertura')], ['bienvenida', take('bienvenida')], ['puntaje', take('puntaje')], ['saludo', saludo()],
    ['bienvenida', take('bienvenida')], ['compartir', take('compartir')], conHora ? ['hora', horaEnVivo] : ['curioso', take('curioso')],
    ['saludo', saludo()], ['nombres', take('nombres')], ['bienvenida', take('bienvenida')], ['regalos', take('regalos')],
    [r() < .5 ? 'reglas' : 'curioso', null], ['saludo', saludo()], ['metas', take('metas')], ['bienvenida', take('bienvenida')],
    ['animo', take('animo')], ['final', take('final').replace('{n}', num)],
  ].map(([tipo, texto]) => [tipo, texto ?? take(tipo)]);
  // Cada frase dura lo que tarda el narrador en decirla, más una pausa: así ninguna queda cortada.
  // Si no caben todas en los 3 minutos, se omiten las que sobran (nunca la hora ni el «¡A jugar!»).
  const fin = orden.pop(), dFin = dur(fin[1]), limite = DURACION - 1000 - dFin;
  let t = 1500;
  for (const [tipo, texto] of orden) {
    const d = dur(typeof texto === 'function' ? texto() : texto);
    if (t + d > limite && tipo !== 'hora') continue;
    plan.push({ t, tipo, texto }); t += d;
  }
  plan.push({ t: Math.max(t, DURACION - 1000 - dFin), tipo: fin[0], texto: fin[1] });
  return plan;
}
const TIPOS = { apertura: '🎅 Sabelín te saluda', bienvenida: '👋 Bienvenidos', puntaje: '🏆 Tu puntaje', saludo: '🌎 Saludos en vivo', compartir: '📲 Comparte',
  hora: '🕒 Hora de la aldea', reglas: '📜 Reglas', curioso: '💡 Dato curioso', nombres: '📝 Nombres para Santa', animo: '✨ Ánimo', regalos: '🎁 Regalitos',
  metas: '❤️ Meta del en vivo', final: '🚀 ¡A jugar!' };
/* Bienvenidas cortas para el cintillo durante las preguntas. */
const cintillo = ['👋 ¡Bienvenidos a los que se van uniendo al Quiz Navideño!', '🎁 Apóyame con tu regalito y forma parte de la Lista de los buenos',
  '🏆 Cuenta tus aciertos: al final de cada partida escribe tu puntaje', '📲 Comparte el en vivo con tu familia y amigos',
  '❤️ Toca la pantalla: ¡vamos por la meta de corazones!', '🎁 Gracias por cada regalito: así seguimos día y noche',
  '🌎 Escribe desde qué ciudad juegas y Sabelín te saluda'];
const total = Object.values(pools).reduce((a, p) => a + p.length, 0);
window.SANTA_QUIZ_HOST = { duracion: DURACION, dur, build, tipos: TIPOS, horaEnVivo, cintillo, frases: total };
})();
