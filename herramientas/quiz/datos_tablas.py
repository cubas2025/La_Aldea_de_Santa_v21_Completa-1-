# -*- coding: utf-8 -*-
"""Tablas de datos verificados para generar preguntas del quiz (todo público)."""

# (país, capital, continente, gentilicio masculino)
PAISES = [
    ('Argentina', 'Buenos Aires', 'América', 'argentino'), ('Bolivia', 'Sucre', 'América', 'boliviano'),
    ('Brasil', 'Brasilia', 'América', 'brasileño'), ('Chile', 'Santiago', 'América', 'chileno'),
    ('Colombia', 'Bogotá', 'América', 'colombiano'), ('Costa Rica', 'San José', 'América', 'costarricense'),
    ('Cuba', 'La Habana', 'América', 'cubano'), ('Ecuador', 'Quito', 'América', 'ecuatoriano'),
    ('El Salvador', 'San Salvador', 'América', 'salvadoreño'), ('Guatemala', 'Ciudad de Guatemala', 'América', 'guatemalteco'),
    ('Honduras', 'Tegucigalpa', 'América', 'hondureño'), ('México', 'Ciudad de México', 'América', 'mexicano'),
    ('Nicaragua', 'Managua', 'América', 'nicaragüense'), ('Panamá', 'Ciudad de Panamá', 'América', 'panameño'),
    ('Paraguay', 'Asunción', 'América', 'paraguayo'), ('Perú', 'Lima', 'América', 'peruano'),
    ('República Dominicana', 'Santo Domingo', 'América', 'dominicano'), ('Uruguay', 'Montevideo', 'América', 'uruguayo'),
    ('Venezuela', 'Caracas', 'América', 'venezolano'), ('Estados Unidos', 'Washington D. C.', 'América', 'estadounidense'),
    ('Canadá', 'Ottawa', 'América', 'canadiense'), ('Jamaica', 'Kingston', 'América', 'jamaicano'),
    ('Haití', 'Puerto Príncipe', 'América', 'haitiano'), ('Belice', 'Belmopán', 'América', 'beliceño'),
    ('Guyana', 'Georgetown', 'América', 'guyanés'), ('Surinam', 'Paramaribo', 'América', 'surinamés'),
    ('España', 'Madrid', 'Europa', 'español'), ('Portugal', 'Lisboa', 'Europa', 'portugués'),
    ('Francia', 'París', 'Europa', 'francés'), ('Italia', 'Roma', 'Europa', 'italiano'),
    ('Alemania', 'Berlín', 'Europa', 'alemán'), ('Reino Unido', 'Londres', 'Europa', 'británico'),
    ('Irlanda', 'Dublín', 'Europa', 'irlandés'), ('Países Bajos', 'Ámsterdam', 'Europa', 'neerlandés'),
    ('Bélgica', 'Bruselas', 'Europa', 'belga'), ('Suiza', 'Berna', 'Europa', 'suizo'),
    ('Austria', 'Viena', 'Europa', 'austriaco'), ('Grecia', 'Atenas', 'Europa', 'griego'),
    ('Suecia', 'Estocolmo', 'Europa', 'sueco'), ('Noruega', 'Oslo', 'Europa', 'noruego'),
    ('Dinamarca', 'Copenhague', 'Europa', 'danés'), ('Finlandia', 'Helsinki', 'Europa', 'finlandés'),
    ('Islandia', 'Reikiavik', 'Europa', 'islandés'), ('Polonia', 'Varsovia', 'Europa', 'polaco'),
    ('Hungría', 'Budapest', 'Europa', 'húngaro'), ('República Checa', 'Praga', 'Europa', 'checo'),
    ('Rumania', 'Bucarest', 'Europa', 'rumano'), ('Bulgaria', 'Sofía', 'Europa', 'búlgaro'),
    ('Croacia', 'Zagreb', 'Europa', 'croata'), ('Serbia', 'Belgrado', 'Europa', 'serbio'),
    ('Ucrania', 'Kiev', 'Europa', 'ucraniano'), ('Rusia', 'Moscú', 'Europa', 'ruso'),
    ('Eslovaquia', 'Bratislava', 'Europa', 'eslovaco'), ('Eslovenia', 'Liubliana', 'Europa', 'esloveno'),
    ('Estonia', 'Tallin', 'Europa', 'estonio'), ('Letonia', 'Riga', 'Europa', 'letón'),
    ('Lituania', 'Vilna', 'Europa', 'lituano'), ('Luxemburgo', 'Luxemburgo', 'Europa', 'luxemburgués'),
    ('Malta', 'La Valeta', 'Europa', 'maltés'), ('Mónaco', 'Mónaco', 'Europa', 'monegasco'),
    ('China', 'Pekín', 'Asia', 'chino'), ('Japón', 'Tokio', 'Asia', 'japonés'),
    ('Corea del Sur', 'Seúl', 'Asia', 'surcoreano'), ('India', 'Nueva Delhi', 'Asia', 'indio'),
    ('Tailandia', 'Bangkok', 'Asia', 'tailandés'), ('Vietnam', 'Hanói', 'Asia', 'vietnamita'),
    ('Filipinas', 'Manila', 'Asia', 'filipino'), ('Indonesia', 'Yakarta', 'Asia', 'indonesio'),
    ('Malasia', 'Kuala Lumpur', 'Asia', 'malasio'), ('Singapur', 'Singapur', 'Asia', 'singapurense'),
    ('Pakistán', 'Islamabad', 'Asia', 'pakistaní'), ('Bangladés', 'Daca', 'Asia', 'bangladesí'),
    ('Nepal', 'Katmandú', 'Asia', 'nepalí'), ('Mongolia', 'Ulán Bator', 'Asia', 'mongol'),
    ('Arabia Saudita', 'Riad', 'Asia', 'saudí'), ('Israel', 'Jerusalén', 'Asia', 'israelí'),
    ('Jordania', 'Amán', 'Asia', 'jordano'), ('Líbano', 'Beirut', 'Asia', 'libanés'),
    ('Irán', 'Teherán', 'Asia', 'iraní'), ('Irak', 'Bagdad', 'Asia', 'iraquí'),
    ('Turquía', 'Ankara', 'Asia', 'turco'), ('Catar', 'Doha', 'Asia', 'catarí'),
    ('Emiratos Árabes Unidos', 'Abu Dabi', 'Asia', 'emiratí'), ('Afganistán', 'Kabul', 'Asia', 'afgano'),
    ('Sri Lanka', 'Colombo', 'Asia', 'esrilanqués'), ('Camboya', 'Nom Pen', 'Asia', 'camboyano'),
    ('Egipto', 'El Cairo', 'África', 'egipcio'), ('Marruecos', 'Rabat', 'África', 'marroquí'),
    ('Argelia', 'Argel', 'África', 'argelino'), ('Túnez', 'Túnez', 'África', 'tunecino'),
    ('Nigeria', 'Abuya', 'África', 'nigeriano'), ('Kenia', 'Nairobi', 'África', 'keniano'),
    ('Etiopía', 'Adís Abeba', 'África', 'etíope'), ('Ghana', 'Acra', 'África', 'ghanés'),
    ('Senegal', 'Dakar', 'África', 'senegalés'), ('Angola', 'Luanda', 'África', 'angoleño'),
    ('Tanzania', 'Dodoma', 'África', 'tanzano'), ('Uganda', 'Kampala', 'África', 'ugandés'),
    ('Madagascar', 'Antananarivo', 'África', 'malgache'), ('Mozambique', 'Maputo', 'África', 'mozambiqueño'),
    ('Camerún', 'Yaundé', 'África', 'camerunés'), ('Costa de Marfil', 'Yamusukro', 'África', 'marfileño'),
    ('Sudán', 'Jartum', 'África', 'sudanés'), ('Libia', 'Trípoli', 'África', 'libio'),
    ('Zimbabue', 'Harare', 'África', 'zimbabuense'), ('Ruanda', 'Kigali', 'África', 'ruandés'),
    ('Australia', 'Canberra', 'Oceanía', 'australiano'), ('Nueva Zelanda', 'Wellington', 'Oceanía', 'neozelandés'),
    ('Fiyi', 'Suva', 'Oceanía', 'fiyiano'), ('Papúa Nueva Guinea', 'Port Moresby', 'Oceanía', 'papú'),
]

# (símbolo, nombre)
ELEMENTOS = [
    ('H', 'hidrógeno'), ('He', 'helio'), ('Li', 'litio'), ('Be', 'berilio'), ('B', 'boro'), ('C', 'carbono'),
    ('N', 'nitrógeno'), ('O', 'oxígeno'), ('F', 'flúor'), ('Ne', 'neón'), ('Na', 'sodio'), ('Mg', 'magnesio'),
    ('Al', 'aluminio'), ('Si', 'silicio'), ('P', 'fósforo'), ('S', 'azufre'), ('Cl', 'cloro'), ('Ar', 'argón'),
    ('K', 'potasio'), ('Ca', 'calcio'), ('Ti', 'titanio'), ('Cr', 'cromo'), ('Mn', 'manganeso'), ('Fe', 'hierro'),
    ('Co', 'cobalto'), ('Ni', 'níquel'), ('Cu', 'cobre'), ('Zn', 'zinc'), ('Br', 'bromo'), ('Kr', 'kriptón'),
    ('Ag', 'plata'), ('Sn', 'estaño'), ('I', 'yodo'), ('Xe', 'xenón'), ('W', 'wolframio'), ('Pt', 'platino'),
    ('Au', 'oro'), ('Hg', 'mercurio'), ('Pb', 'plomo'), ('U', 'uranio'), ('Ra', 'radio'), ('Rn', 'radón'),
]

# (animal, clase, dieta, hábitat principal)
ANIMALES = [
    ('perro', 'mamífero', 'omnívoro', 'casa'), ('gato', 'mamífero', 'carnívoro', 'casa'), ('vaca', 'mamífero', 'herbívoro', 'granja'),
    ('caballo', 'mamífero', 'herbívoro', 'granja'), ('oveja', 'mamífero', 'herbívoro', 'granja'), ('cerdo', 'mamífero', 'omnívoro', 'granja'),
    ('conejo', 'mamífero', 'herbívoro', 'granja'), ('león', 'mamífero', 'carnívoro', 'sabana'), ('tigre', 'mamífero', 'carnívoro', 'selva'),
    ('elefante', 'mamífero', 'herbívoro', 'sabana'), ('jirafa', 'mamífero', 'herbívoro', 'sabana'), ('cebra', 'mamífero', 'herbívoro', 'sabana'),
    ('hipopótamo', 'mamífero', 'herbívoro', 'río'), ('rinoceronte', 'mamífero', 'herbívoro', 'sabana'), ('gorila', 'mamífero', 'herbívoro', 'selva'),
    ('chimpancé', 'mamífero', 'omnívoro', 'selva'), ('oso polar', 'mamífero', 'carnívoro', 'polo'), ('oso panda', 'mamífero', 'herbívoro', 'bosque'),
    ('lobo', 'mamífero', 'carnívoro', 'bosque'), ('zorro', 'mamífero', 'omnívoro', 'bosque'), ('ciervo', 'mamífero', 'herbívoro', 'bosque'),
    ('reno', 'mamífero', 'herbívoro', 'tundra'), ('ballena azul', 'mamífero', 'carnívoro', 'océano'), ('delfín', 'mamífero', 'carnívoro', 'océano'),
    ('murciélago', 'mamífero', 'omnívoro', 'cueva'), ('canguro', 'mamífero', 'herbívoro', 'pradera'), ('koala', 'mamífero', 'herbívoro', 'bosque'),
    ('camello', 'mamífero', 'herbívoro', 'desierto'), ('llama', 'mamífero', 'herbívoro', 'montaña'), ('alpaca', 'mamífero', 'herbívoro', 'montaña'),
    ('foca', 'mamífero', 'carnívoro', 'polo'), ('morsa', 'mamífero', 'carnívoro', 'polo'), ('ardilla', 'mamífero', 'omnívoro', 'bosque'),
    ('castor', 'mamífero', 'herbívoro', 'río'), ('jaguar', 'mamífero', 'carnívoro', 'selva'), ('perezoso', 'mamífero', 'herbívoro', 'selva'),
    ('ornitorrinco', 'mamífero', 'carnívoro', 'río'), ('nutria', 'mamífero', 'carnívoro', 'río'), ('ratón', 'mamífero', 'omnívoro', 'casa'),
    ('águila', 'ave', 'carnívoro', 'montaña'), ('pingüino', 'ave', 'carnívoro', 'polo'), ('avestruz', 'ave', 'omnívoro', 'sabana'),
    ('gallina', 'ave', 'omnívoro', 'granja'), ('pato', 'ave', 'omnívoro', 'río'), ('búho', 'ave', 'carnívoro', 'bosque'),
    ('loro', 'ave', 'herbívoro', 'selva'), ('colibrí', 'ave', 'herbívoro', 'selva'), ('flamenco', 'ave', 'omnívoro', 'laguna'),
    ('cóndor', 'ave', 'carnívoro', 'montaña'), ('paloma', 'ave', 'herbívoro', 'ciudad'), ('pavo real', 'ave', 'omnívoro', 'bosque'),
    ('tucán', 'ave', 'omnívoro', 'selva'), ('gaviota', 'ave', 'omnívoro', 'costa'), ('cocodrilo', 'reptil', 'carnívoro', 'río'),
    ('tortuga marina', 'reptil', 'omnívoro', 'océano'), ('serpiente', 'reptil', 'carnívoro', 'selva'), ('iguana', 'reptil', 'herbívoro', 'selva'),
    ('camaleón', 'reptil', 'carnívoro', 'selva'), ('lagartija', 'reptil', 'carnívoro', 'jardín'), ('rana', 'anfibio', 'carnívoro', 'laguna'),
    ('sapo', 'anfibio', 'carnívoro', 'laguna'), ('salamandra', 'anfibio', 'carnívoro', 'bosque'), ('ajolote', 'anfibio', 'carnívoro', 'lago'),
    ('tiburón blanco', 'pez', 'carnívoro', 'océano'), ('pez payaso', 'pez', 'omnívoro', 'arrecife'), ('salmón', 'pez', 'carnívoro', 'río'),
    ('caballito de mar', 'pez', 'carnívoro', 'arrecife'), ('atún', 'pez', 'carnívoro', 'océano'), ('pez globo', 'pez', 'omnívoro', 'arrecife'),
    ('abeja', 'insecto', 'herbívoro', 'jardín'), ('hormiga', 'insecto', 'omnívoro', 'jardín'), ('mariposa', 'insecto', 'herbívoro', 'jardín'),
    ('mariquita', 'insecto', 'carnívoro', 'jardín'), ('libélula', 'insecto', 'carnívoro', 'laguna'), ('saltamontes', 'insecto', 'herbívoro', 'pradera'),
    ('araña', 'arácnido', 'carnívoro', 'jardín'), ('escorpión', 'arácnido', 'carnívoro', 'desierto'), ('pulpo', 'molusco', 'carnívoro', 'océano'),
    ('caracol', 'molusco', 'herbívoro', 'jardín'), ('medusa', 'cnidario', 'carnívoro', 'océano'), ('estrella de mar', 'equinodermo', 'carnívoro', 'océano'),
]
# Peso aproximado adulto en kg, para comparar (diferencias claras)
PESOS = {'ballena azul': 150000, 'elefante': 6000, 'hipopótamo': 2500, 'rinoceronte': 2300, 'jirafa': 1200, 'oso polar': 450,
         'caballo': 500, 'vaca': 600, 'camello': 500, 'cocodrilo': 400, 'gorila': 160, 'león': 190, 'tigre': 220, 'avestruz': 120,
         'reno': 120, 'ciervo': 100, 'cerdo': 150, 'canguro': 60, 'oveja': 60, 'lobo': 40, 'perro': 25, 'koala': 10, 'zorro': 6,
         'gato': 4, 'conejo': 2, 'gallina': 2, 'ardilla': 0.5, 'ratón': 0.02, 'colibrí': 0.004, 'hormiga': 0.000003}
CRIAS = [('perro', 'cachorro'), ('gato', 'gatito'), ('vaca', 'ternero'), ('caballo', 'potro'), ('oveja', 'cordero'),
         ('cabra', 'cabrito'), ('cerdo', 'lechón'), ('gallina', 'pollito'), ('pato', 'patito'), ('rana', 'renacuajo'),
         ('mariposa', 'oruga'), ('ciervo', 'cervato'), ('oso', 'osezno'), ('lobo', 'lobezno'), ('ballena', 'ballenato'),
         ('conejo', 'gazapo'), ('paloma', 'pichón'), ('águila', 'aguilucho'), ('jabalí', 'jabato'), ('liebre', 'lebrato')]
SONIDOS = [('perro', 'ladra'), ('gato', 'maúlla'), ('vaca', 'muge'), ('caballo', 'relincha'), ('oveja', 'bala'), ('cerdo', 'gruñe'),
           ('león', 'ruge'), ('burro', 'rebuzna'), ('gallo', 'canta'), ('pato', 'grazna'), ('serpiente', 'sisea'), ('abeja', 'zumba'),
           ('lobo', 'aúlla'), ('rana', 'croa'), ('elefante', 'barrita'), ('paloma', 'zurea')]

# (planeta, posición desde el Sol, dato)
PLANETAS = [('Mercurio', 1, 'es el más cercano al Sol'), ('Venus', 2, 'es el más caliente del sistema solar'), ('Tierra', 3, 'es el único con vida conocida'),
            ('Marte', 4, 'es conocido como el planeta rojo'), ('Júpiter', 5, 'es el más grande del sistema solar'), ('Saturno', 6, 'es famoso por sus grandes anillos'),
            ('Urano', 7, 'gira prácticamente acostado'), ('Neptuno', 8, 'es el más lejano del Sol')]

INSTRUMENTOS = [('guitarra', 'cuerda'), ('violín', 'cuerda'), ('arpa', 'cuerda'), ('violonchelo', 'cuerda'), ('contrabajo', 'cuerda'), ('ukelele', 'cuerda'),
                ('charango', 'cuerda'), ('mandolina', 'cuerda'), ('banjo', 'cuerda'), ('flauta', 'viento'), ('trompeta', 'viento'), ('saxofón', 'viento'),
                ('clarinete', 'viento'), ('oboe', 'viento'), ('trombón', 'viento'), ('tuba', 'viento'), ('quena', 'viento'), ('zampoña', 'viento'),
                ('armónica', 'viento'), ('gaita', 'viento'), ('tambor', 'percusión'), ('bombo', 'percusión'), ('platillos', 'percusión'),
                ('maracas', 'percusión'), ('xilófono', 'percusión'), ('pandereta', 'percusión'), ('cajón', 'percusión'), ('triángulo', 'percusión'),
                ('bongó', 'percusión'), ('castañuelas', 'percusión'), ('timbal', 'percusión'), ('güiro', 'percusión')]

FRUTAS = ['manzana', 'pera', 'plátano', 'naranja', 'uva', 'fresa', 'piña', 'mango', 'sandía', 'melón', 'cereza', 'kiwi', 'papaya',
          'durazno', 'limón', 'mandarina', 'maracuyá', 'guayaba', 'ciruela', 'frambuesa', 'arándano', 'coco', 'higo', 'granada']
VERDURAS = ['zanahoria', 'lechuga', 'brócoli', 'espinaca', 'cebolla', 'apio', 'coliflor', 'repollo', 'pepino', 'acelga', 'betarraga',
            'rábano', 'alcachofa', 'espárrago', 'puerro', 'nabo', 'col de Bruselas', 'calabaza']

ANTONIMOS = [('alto', 'bajo'), ('grande', 'pequeño'), ('frío', 'caliente'), ('día', 'noche'), ('alegre', 'triste'), ('rápido', 'lento'),
             ('fuerte', 'débil'), ('nuevo', 'viejo'), ('lleno', 'vacío'), ('abrir', 'cerrar'), ('subir', 'bajar'), ('entrar', 'salir'),
             ('encender', 'apagar'), ('ganar', 'perder'), ('reír', 'llorar'), ('limpio', 'sucio'), ('duro', 'blando'), ('ancho', 'estrecho'),
             ('largo', 'corto'), ('pesado', 'ligero'), ('claro', 'oscuro'), ('cerca', 'lejos'), ('arriba', 'abajo'), ('dentro', 'fuera'),
             ('antes', 'después'), ('mucho', 'poco'), ('siempre', 'nunca'), ('verdad', 'mentira'), ('paz', 'guerra'), ('amor', 'odio'),
             ('valiente', 'cobarde'), ('generoso', 'egoísta'), ('rico', 'pobre'), ('dulce', 'amargo'), ('seco', 'mojado'), ('temprano', 'tarde'),
             ('comprar', 'vender'), ('dar', 'recibir'), ('nacer', 'morir'), ('empezar', 'terminar'), ('aceptar', 'rechazar'), ('recordar', 'olvidar'),
             ('construir', 'destruir'), ('unir', 'separar'), ('aparecer', 'desaparecer'), ('posible', 'imposible'), ('feliz', 'infeliz'),
             ('ordenado', 'desordenado'), ('obedecer', 'desobedecer'), ('mayor', 'menor'), ('primero', 'último'), ('blanco', 'negro'),
             ('sano', 'enfermo'), ('joven', 'anciano'), ('tranquilo', 'nervioso'), ('amigo', 'enemigo'), ('éxito', 'fracaso'), ('agradable', 'desagradable'),
             ('izquierda', 'derecha'), ('norte', 'sur'), ('este', 'oeste'), ('invierno', 'verano'), ('salida', 'llegada'), ('pregunta', 'respuesta'),
             ('presente', 'ausente'), ('público', 'privado'), ('interior', 'exterior'), ('máximo', 'mínimo'), ('conocido', 'desconocido'),
             ('honesto', 'deshonesto'), ('ruidoso', 'silencioso'), ('cómodo', 'incómodo'), ('flexible', 'rígido'), ('suave', 'áspero')]
SINONIMOS = [('feliz', 'contento'), ('bonito', 'hermoso'), ('rápido', 'veloz'), ('casa', 'hogar'), ('empezar', 'comenzar'), ('terminar', 'acabar'),
             ('regalo', 'obsequio'), ('caminar', 'andar'), ('mirar', 'observar'), ('hablar', 'conversar'), ('enojado', 'furioso'), ('miedo', 'temor'),
             ('alumno', 'estudiante'), ('maestro', 'profesor'), ('cara', 'rostro'), ('cabello', 'pelo'), ('auto', 'coche'), ('rápidamente', 'velozmente'),
             ('lindo', 'precioso'), ('listo', 'inteligente'), ('ayudar', 'auxiliar'), ('gritar', 'vociferar'), ('brillar', 'resplandecer'),
             ('tranquilo', 'sereno'), ('viejo', 'antiguo'), ('enorme', 'gigantesco'), ('diminuto', 'minúsculo'), ('valiente', 'audaz'),
             ('alegría', 'felicidad'), ('tristeza', 'pena'), ('cansado', 'agotado'), ('rico', 'sabroso'), ('dormir', 'descansar'),
             ('saltar', 'brincar'), ('famoso', 'célebre'), ('raro', 'extraño'), ('limpiar', 'asear'), ('vivienda', 'morada'), ('pelear', 'reñir'),
             ('fácil', 'sencillo'), ('difícil', 'complicado'), ('elegir', 'escoger'), ('crear', 'inventar'), ('triunfo', 'victoria'),
             ('error', 'equivocación'), ('ruta', 'camino'), ('niño', 'chico'), ('veloz', 'ligero'), ('guardar', 'conservar'), ('lanzar', 'arrojar')]

LUGARES = [('la Torre Eiffel', 'Francia'), ('el Coliseo', 'Italia'), ('Machu Picchu', 'Perú'), ('la Gran Muralla', 'China'),
           ('las pirámides de Guiza', 'Egipto'), ('Chichén Itzá', 'México'), ('el Cristo Redentor', 'Brasil'), ('la Estatua de la Libertad', 'Estados Unidos'),
           ('el Taj Mahal', 'India'), ('la Ópera de Sídney', 'Australia'), ('el Big Ben', 'Reino Unido'), ('la Sagrada Familia', 'España'),
           ('la Alhambra', 'España'), ('la torre inclinada de Pisa', 'Italia'), ('el Partenón', 'Grecia'), ('la Puerta de Brandeburgo', 'Alemania'),
           ('el monte Fuji', 'Japón'), ('la isla de Pascua', 'Chile'), ('las cataratas del Iguazú', 'Argentina'), ('el salar de Uyuni', 'Bolivia'),
           ('las islas Galápagos', 'Ecuador'), ('el canal de Panamá', 'Panamá'), ('Petra', 'Jordania'), ('el Kremlin', 'Rusia'),
           ('Angkor Wat', 'Camboya'), ('la Plaza Roja', 'Rusia'), ('el Museo del Louvre', 'Francia'), ('Teotihuacán', 'México'),
           ('el lago Titicaca', 'Perú'), ('la ciudad perdida de Tikal', 'Guatemala'), ('Cartagena de Indias', 'Colombia'), ('el castillo de Neuschwanstein', 'Alemania'),
           ('Stonehenge', 'Reino Unido'), ('el Salto Ángel', 'Venezuela'), ('el Perito Moreno', 'Argentina'), ('la Torre de Belém', 'Portugal')]

INVENTOS = [('el teléfono', 'Alexander Graham Bell'), ('la bombilla eléctrica práctica', 'Thomas Edison'), ('la imprenta de tipos móviles en Europa', 'Johannes Gutenberg'),
            ('el avión con motor', 'los hermanos Wright'), ('la teoría de la relatividad', 'Albert Einstein'), ('la penicilina', 'Alexander Fleming'),
            ('la vacuna contra la viruela', 'Edward Jenner'), ('las leyes del movimiento y la gravitación', 'Isaac Newton'), ('el telescopio para observar los astros', 'Galileo Galilei'),
            ('la radiactividad del polonio y el radio', 'Marie Curie'), ('la teoría de la evolución por selección natural', 'Charles Darwin'),
            ('la World Wide Web', 'Tim Berners-Lee'), ('la tabla periódica de los elementos', 'Dmitri Mendeléyev'), ('la pasteurización', 'Louis Pasteur'),
            ('el código Morse', 'Samuel Morse'), ('la máquina de vapor mejorada', 'James Watt'), ('el sistema de escritura para ciegos', 'Louis Braille'),
            ('la corriente alterna moderna', 'Nikola Tesla'), ('el pararrayos', 'Benjamin Franklin'), ('la dinamita', 'Alfred Nobel')]

DEPORTES_JUGADORES = [('fútbol', 11), ('baloncesto', 5), ('voleibol', 6), ('béisbol', 9), ('hockey sobre hielo', 6), ('balonmano', 7),
                      ('waterpolo', 7), ('rugby', 15), ('fútbol sala', 5)]
PINTORES = [('La Mona Lisa', 'Leonardo da Vinci'), ('La noche estrellada', 'Vincent van Gogh'), ('Los girasoles', 'Vincent van Gogh'),
            ('Las Meninas', 'Diego Velázquez'), ('El Guernica', 'Pablo Picasso'), ('La creación de Adán', 'Miguel Ángel'),
            ('El grito', 'Edvard Munch'), ('La persistencia de la memoria', 'Salvador Dalí'), ('La joven de la perla', 'Johannes Vermeer'),
            ('El nacimiento de Venus', 'Sandro Botticelli'), ('La última cena', 'Leonardo da Vinci'), ('Los nenúfares', 'Claude Monet')]
COMPOSITORES = [('la Novena Sinfonía con el «Himno a la alegría»', 'Ludwig van Beethoven'), ('La flauta mágica', 'Wolfgang Amadeus Mozart'),
                ('Las cuatro estaciones', 'Antonio Vivaldi'), ('El cascanueces', 'Piotr Ilich Chaikovski'), ('El lago de los cisnes', 'Piotr Ilich Chaikovski'),
                ('El Mesías con su famoso «Aleluya»', 'Georg Friedrich Händel'), ('El Danubio azul', 'Johann Strauss hijo'), ('El vuelo del moscardón', 'Nikolái Rimski-Kórsakov')]
NAVIDAD_PAISES = [('México', 'las posadas, nueve noches antes de Navidad'), ('España', 'el sorteo de la lotería de Navidad del 22 de diciembre'),
                  ('Italia', 'la Befana, que trae regalos el 6 de enero'), ('Alemania', 'los mercados navideños y el calendario de Adviento'),
                  ('Perú', 'el panetón con chocolate caliente'), ('Venezuela', 'las hallacas en la cena navideña'), ('Colombia', 'las velitas del 7 de diciembre'),
                  ('Puerto Rico', 'las parrandas navideñas'), ('Suecia', 'la fiesta de Santa Lucía el 13 de diciembre'), ('Noruega', 'esconder las escobas en Nochebuena'),
                  ('Filipinas', 'los faroles en forma de estrella llamados parol'), ('Japón', 'comer pastel de fresa en Navidad'),
                  ('Argentina', 'celebrar la Navidad en pleno verano'), ('Australia', 'celebrar la Navidad en la playa por el verano'),
                  ('Ucrania', 'adornar el árbol con telarañas de la suerte'), ('Islandia', 'los trece Yule Lads que visitan antes de Navidad'),
                  ('Guatemala', 'la quema del diablo el 7 de diciembre'), ('Ecuador', 'el Pase del Niño Viajero en Cuenca')]
CUERPO = [('corazón', 'bombear la sangre por todo el cuerpo'), ('pulmones', 'tomar el oxígeno del aire'), ('cerebro', 'controlar el cuerpo y los pensamientos'),
          ('estómago', 'empezar a digerir los alimentos'), ('riñones', 'filtrar la sangre y formar la orina'), ('hígado', 'limpiar la sangre y producir bilis'),
          ('piel', 'proteger el cuerpo del exterior'), ('huesos', 'sostener el cuerpo'), ('músculos', 'permitir el movimiento'), ('ojos', 'ver'),
          ('oídos', 'oír y mantener el equilibrio'), ('nariz', 'oler'), ('lengua', 'saborear'), ('dientes', 'masticar los alimentos'),
          ('intestino delgado', 'absorber los nutrientes de los alimentos')]
