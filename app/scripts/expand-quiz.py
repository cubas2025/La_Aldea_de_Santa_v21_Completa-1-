"""Build 820 additional reviewed exercises; keep the 180 Christmas questions."""
import json
from pathlib import Path
from fractions import Fraction

ROOT = Path(__file__).resolve().parents[1]
original = json.loads((ROOT/'dist/quiz-data.js').read_text().split('=',1)[1].strip().rstrip(';'))
original = [q for q in original if q['id'].startswith('christmas-')]
new = []
def add(category, question, answer, wrong, explanation, level=1):
    answer = str(answer); wrong = [str(w) for w in wrong]
    assert len(set([answer]+wrong)) == 3, question
    new.append(dict(id=f'learn-{len(new)+1:04}', category=category, question=question,
                    answer=answer, wrong=wrong, explanation=explanation, level=level))
def num(q, a, e, level):
    add('matematico', q, a, [a+1, a+3], e, level)

names = ['Ana','Luis','Sofía','Mateo','Lucía','Diego','Sara','Hugo','Elena','Gabriel']
for i in range(40):
    level=1+i%3; n=names[i%10]; a=i+8; b=i%7+2; c=i%5+1
    num(f'{n} tiene {a} tarjetas, recibe {b} y regala {c}. ¿Cuántas conserva?',a+b-c,f'Primero suma {a} + {b} y después resta {c}: quedan {a+b-c}.',level)
    groups=i%8+2; each=i//8+3; lost=i%3+1
    num(f'Hay {groups} cajas con {each} cascabeles en cada una. Se pierden {lost}. ¿Cuántos quedan?',groups*each-lost,f'Multiplica {groups} × {each} y resta {lost}: quedan {groups*each-lost}.',level)
    step=i%7+2; start=i+1
    num(f'La secuencia aumenta siempre lo mismo: {start}, {start+step}, {start+2*step}, {start+3*step}. ¿Qué número sigue?',start+4*step,f'Cada paso suma {step}; el siguiente número es {start+4*step}.',level)
    hour=8+i%5; minute=i%4*10; duration=15+i
    end=hour*60+minute+duration; label=f'{end//60:02}:{end%60:02}'
    add('matematico',f'Un taller empieza a las {hour:02}:{minute:02} y dura {duration} minutos. ¿A qué hora termina?',label,[f'{(end+10)//60:02}:{(end+10)%60:02}',f'{(end+20)//60:02}:{(end+20)%60:02}'],f'Suma {duration} minutos a la hora inicial. Termina a las {label}.',level)
    length=i%10+3; width=i//10+2
    num(f'Un jardín rectangular mide {length} m de largo y {width} m de ancho. ¿Cuántos metros de cerca se necesitan para rodearlo?',2*(length+width),f'El perímetro suma los cuatro lados: 2 × ({length} + {width}) = {2*(length+width)} m.',level)
    denominator=i%4+2; boxes=i//4+2; total=denominator*boxes
    num(f'De {total} adornos, una parte de cada {denominator} es dorada. ¿Cuántos adornos dorados hay?',boxes,f'Divide el total {total} entre {denominator}: hay {boxes} adornos dorados.',level)
    price=i%6+2; quantity=i//6+2; budget=price*quantity+5+i%4
    num(f'Compras {quantity} cintas a S/ {price} cada una y pagas con S/ {budget}. ¿Cuánto vuelto recibes?',budget-price*quantity,f'Las cintas cuestan {quantity} × {price} = {quantity*price}; el vuelto es {budget} − {quantity*price}.',level)
    per=i%5+2; total=(i//5+3)*per; extra=i%4+1
    num(f'Hay {total} galletas. Preparas bolsas de {per} galletas y luego agregas {extra} bolsas ya listas. ¿Cuántas bolsas hay?',total//per+extra,f'Primero {total} ÷ {per} = {total//per}; después suma las {extra} bolsas.',level)
    books=i+13; diff=i%9+2
    num(f'La caja roja tiene {books} libros. La azul tiene {diff} menos. ¿Cuántos libros tienen entre ambas?',2*books-diff,f'La azul tiene {books-diff}. Suma {books} + {books-diff} = {2*books-diff}.',level)
    red=i%9+1; blue=i//9+2; prob=Fraction(red,red+blue)
    options=[str(Fraction(blue,red+blue)),str(Fraction(red,red+blue+1)),str(Fraction(red+1,red+blue)), '0']
    wrong=[]
    for x in options:
        if x!=str(prob) and x not in wrong:wrong.append(x)
        if len(wrong)==2:break
    add('matematico',f'En una bolsa hay {red} fichas rojas y {blue} azules. Al sacar una al azar, ¿cuál es la probabilidad de que sea roja?',str(prob),wrong,f'Hay {red} casos favorables entre {red+blue} fichas. La fracción simplificada es {prob}.',max(2,level))

synonyms='''alegre|contento;veloz|rápido;hermoso|bello;hogar|casa;comenzar|iniciar;terminar|finalizar;ayudar|colaborar;observar|mirar;escuchar|oír;regalo|obsequio;camino|sendero;enorme|gigante;pequeño|diminuto;tranquilo|sereno;valiente|audaz;amable|cordial;luminoso|brillante;oscuro|sombrío;sencillo|simple;difícil|complicado;limpio|aseado;ordenar|organizar;recordar|rememorar;guardar|conservar;cuidar|proteger;reunir|juntar;separar|dividir;escoger|elegir;contestar|responder;preguntar|consultar;famoso|célebre;inteligente|listo;silencioso|callado;delgado|flaco;fuerte|robusto;débil|frágil;fragancia|aroma;maestro|profesor;alumno|estudiante;relato|cuento'''
antonyms='''abrir|cerrar;subir|bajar;entrar|salir;reír|llorar;encender|apagar;ganar|perder;construir|destruir;aceptar|rechazar;unir|separar;avanzar|retroceder;lleno|vacío;cerca|lejos;antes|después;siempre|nunca;arriba|abajo;dentro|fuera;caliente|frío;claro|oscuro;alto|bajo;ancho|estrecho;largo|corto;pesado|ligero;duro|blando;seco|mojado;limpio|sucio;rápido|lento;nuevo|viejo;joven|anciano;dulce|amargo;alegre|triste;valiente|cobarde;generoso|egoísta;ordenado|desordenado;verdadero|falso;posible|imposible;útil|inútil;visible|invisible;igual|diferente;principio|final;silencio|ruido'''
syn_wrong='triste,furioso;lento,quieto;feo,desagradable;calle,oficina;acabar,detener;iniciar,continuar;estorbar,abandonar;ignorar,esconder;hablar,escribir;deuda,préstamo;destino,vehículo;pequeño,mediano;enorme,extenso;inquieto,agitado;cobarde,temeroso;grosero,hostil;apagado,tenebroso;iluminado,radiante;complejo,enredado;fácil,simple;sucio,manchado;desordenar,revolver;olvidar,confundir;tirar,perder;dañar,abandonar;dispersar,separar;unir,juntar;rechazar,descartar;preguntar,dudar;responder,afirmar;desconocido,anónimo;distraído,confundido;ruidoso,bullicioso;grueso,ancho;débil,frágil;resistente,firme;ruido,sabor;alumno,director;profesor,conserje;receta,listado'.split(';')
for j,row in enumerate(synonyms.split(';')):
    a,b=row.split('|');add('verbal',f'¿Qué palabra significa casi lo mismo que «{a}»?',b,syn_wrong[j].split(','),f'«{a}» y «{b}» pueden ser sinónimos en este uso.',1+j%3)
for j,row in enumerate(antonyms.split(';')):
    a,b=row.split('|');add('verbal',f'¿Cuál es el antónimo de «{a}»?',b,[a,'calendario'],f'«{b}» expresa lo contrario de «{a}».',1+j%3)
analogies='''Pájaro|nido|abeja|colmena;Perro|cachorro|gato|gatito;Vaca|ternero|oveja|cordero;Caballo|potro|gallina|pollito;Pez|agua|ave|aire;Zapato|pie|guante|mano;Sombrero|cabeza|bufanda|cuello;Lápiz|escribir|tijeras|cortar;Cuchara|comer|vaso|beber;Libro|leer|canción|escuchar;Pintor|pincel|músico|instrumento;Médico|hospital|docente|escuela;Panadero|pan|zapatero|zapatos;Árbol|bosque|estrella|constelación;Página|libro|peldaño|escalera;Rueda|bicicleta|tecla|teclado;Semilla|planta|huevo|pollito;Día|noche|luz|oscuridad;Invierno|frío|verano|calor;Reloj|hora|termómetro|temperatura;Regla|longitud|balanza|masa;Ojo|ver|oído|oír;Nariz|oler|lengua|saborear;Mano|dedos|pie|dedos;Flor|pétalos|libro|páginas;Triángulo|tres|cuadrado|cuatro;Semana|siete días|docena|doce unidades;Minuto|segundos|hora|minutos;Piano|teclas|guitarra|cuerdas;Barco|mar|avión|cielo;Tren|rieles|automóvil|carretera;Cocinero|cocina|astrónomo|observatorio;Abeja|miel|vaca|leche;Agua|sed|comida|hambre;Linterna|iluminar|paraguas|proteger de la lluvia;Llave|cerradura|contraseña|cuenta digital;Mapa|orientarse|receta|cocinar;Raíz|absorber agua|hoja|captar luz;Carta|sobre|regalo|envoltura;Capitán|barco|piloto|avión'''
for j,row in enumerate(analogies.split(';')):
    a,b,c,d=row.split('|');wrong=[]
    for candidate in [b,a,analogies.split(';')[(j+3)%40].split('|')[3]]:
        if candidate.casefold()!=d.casefold() and candidate not in wrong:wrong.append(candidate)
        if len(wrong)==2:break
    add('verbal',f'{a} es a {b} como {c.lower()} es a…',d,wrong,f'Conserva la misma relación entre los dos pares: {a.lower()}–{b} y {c.lower()}–{d}.',1+j%3)
reading='''Ana guardó el paraguas porque dejó de llover.|¿Por qué lo guardó?|Porque la lluvia terminó|Porque empezó a nevar|Porque perdió su mochila
Luis apagó la lámpara al salir del cuarto vacío.|¿Qué acción ahorra energía?|Apagar la lámpara que no se usa|Encender más lámparas|Dejar todo encendido
Sara prestó un cuento a su amiga y acordaron devolverlo el viernes.|¿Qué deben hacer el viernes?|Devolver el cuento|Comprar una bicicleta|Cerrar la escuela
Mateo llevó agua para regar una planta que tenía la tierra seca.|¿Qué necesitaba la planta?|Agua|Un abrigo|Un cuaderno
Lucía caminó despacio por el piso mojado para no resbalar.|¿Qué intención explica su cuidado?|Evitar una caída|Llegar antes corriendo|Secar un libro
Diego dejó un espacio en la fila para que pasara una persona con un coche de bebé.|¿Qué muestra ese gesto?|Consideración|Desinterés|Deseo de discutir
Elena revisó su respuesta y encontró una suma equivocada. La corrigió.|¿Qué hizo al detectar el error?|Lo corrigió|Lo escondió sin revisar|Borró toda la tarea sin leer
Hugo vio un cartel que decía «Biblioteca: silencio» y bajó la voz.|¿Por qué habló más bajo?|Para respetar el lugar de lectura|Porque perdió la voz|Para interrumpir a todos
Nora llevó una bolsa reutilizable al mercado.|¿Qué objeto permitió evitar otra bolsa desechable?|La bolsa reutilizable|El recibo|Una moneda
Pablo encontró un gorro ajeno y lo entregó en objetos perdidos.|¿Dónde puede buscarlo su dueño?|En objetos perdidos|Dentro de un río|En una tienda de comida
Clara leyó dos versiones de una noticia antes de compartirla.|¿Qué intentaba hacer?|Comprobar la información|Cambiar su nombre|Evitar toda lectura
Eva preparó la mochila por la noche para no olvidar materiales al amanecer.|¿Para qué se organizó antes?|Para llevar lo necesario|Para perder sus libros|Para llegar sin mochila
Daniel tapó su dibujo mientras se secaba la pintura y pidió que no lo tocaran.|¿Qué pidió a los demás?|Esperar sin tocar la pintura|Romper el dibujo|Mojarlo de nuevo
Rosa escuchó a dos compañeros antes de proponer una solución.|¿Qué hizo primero?|Escuchó las dos opiniones|Eligió sin escuchar|Se fue sin hablar
Leo dividió una tarea grande en pasos pequeños y comenzó por el primero.|¿Qué estrategia utilizó?|Organizar la tarea por pasos|Hacer todo al azar|Abandonar antes de empezar'''
for i,line in enumerate(reading.splitlines()):
    passage,q,a,b,c=line.split('|')
    add('verbal',f'Lee: «{passage}» {q}',a,[b,c],f'La información del texto permite concluir: {a.lower()}.',1+i%3)
    add('verbal',f'¿Qué resumen conserva la idea principal de este texto? «{passage}»',a,['El personaje viajó al espacio','Se describe cómo cocinar una sopa'],f'El resumen debe mantener el sentido central del texto, sin inventar hechos.',1+i%3)
logic='''Todos los abetos de este jardín tienen luces. Este árbol es un abeto de este jardín. ¿Qué se concluye?|Tiene luces|Es el árbol más alto|No tiene ramas
Todos los libros de la caja son cuentos. Este libro salió de esa caja. ¿Qué se sabe?|Es un cuento|Está roto|Es nuevo
Si llueve, el patio se moja. Está lloviendo sobre el patio. ¿Qué ocurrirá?|El patio se moja|El patio se congela siempre|El patio desaparece
Ana llegó antes que Luis y Luis antes que Sara. ¿Quién llegó al final de los tres?|Sara|Ana|Luis
La caja roja pesa más que la azul y la azul más que la verde. ¿Cuál pesa menos?|La verde|La roja|La azul
Marta está entre Pablo y Eva en una fila de tres. ¿Quién está en el centro?|Marta|Pablo|Eva
Un letrero dice «Entrada solo con boleto». Diego no tiene boleto. ¿Qué necesita para cumplir la regla?|Conseguir un boleto|Entrar sin boleto|Cambiar el letrero
Si una pieza es cuadrada, tiene cuatro lados. Esta pieza es cuadrada. ¿Qué sabemos?|Tiene cuatro lados|Tiene tres lados|Es redonda
Ninguna ficha de esta bolsa es roja. Una ficha salió de esta bolsa. ¿Qué se sabe?|No es roja|Es azul necesariamente|Es grande necesariamente
Todos los invitados trajeron una tarjeta. Rosa es invitada. ¿Qué trajo Rosa?|Una tarjeta|Un pastel necesariamente|Nada
Una tienda cierra antes de que empiece el concierto. El concierto ya empezó. ¿Qué ocurrió primero?|El cierre de la tienda|El final del concierto|La salida del Sol necesariamente
El tren A sale antes que el B y el B antes que el C. ¿Cuál sale primero?|El A|El B|El C
Una receta pide mezclar antes de hornear. ¿Qué acción va primero?|Mezclar|Hornear|Servir el producto terminado
Para abrir una caja se necesita una llave. La llave está en el cajón. ¿Dónde buscarías primero?|En el cajón|En el cielo|En la caja cerrada necesariamente
La taza está encima del plato y el plato encima de la mesa. ¿Qué objeto está más abajo?|La mesa|La taza|El plato
Todas las ventanas de esta sala están cerradas. La ventana norte pertenece a esta sala. ¿Cómo está?|Cerrada|Abierta|Rota necesariamente
Algunos pájaros del parque son blancos. ¿Qué afirmación está garantizada?|Hay al menos un pájaro blanco en el parque|Todos son blancos|Ninguno es blanco
No todos los libros de Luis son nuevos. ¿Qué se puede asegurar?|Al menos uno no es nuevo|Ninguno es nuevo|Todos están rotos
Para participar se necesita nombre y boleto. Ana tiene nombre escrito pero no boleto. ¿Cumple ambos requisitos?|No|Sí|Solo por ser la primera
Si la puerta está abierta, entra luz. No vemos luz entrar. Según esta regla sin excepciones, ¿cómo está la puerta?|No está abierta|Está abierta|No existe
Una pelota puede estar en una de dos cajas. La caja A está vacía. ¿Dónde está la pelota?|En la caja B|En la A|En ambas
El cartel dice «Devuelve los libros antes del lunes». ¿Qué día cumple la indicación?|Domingo|Martes|Miércoles
En una carrera sin empates, Clara terminó delante de Eva y detrás de Nora. ¿Quién ganó entre ellas?|Nora|Clara|Eva
Solo los miembros pueden votar. Pedro votó cumpliendo la regla. ¿Qué sabemos de Pedro?|Es miembro|Es el presidente|Es el más joven
Si dos personas tienen la misma edad y una tiene diez años, ¿qué edad tiene la otra?|Diez años|Nueve años|Once años
Una instrucción dice «Dibuja un círculo y luego un cuadrado». ¿Qué figura dibujas al final?|Cuadrado|Círculo|Triángulo
La palabra ALTO aparece antes de BAJO en una lista de dos palabras. ¿Cuál ocupa el segundo lugar?|BAJO|ALTO|Ninguna
Todos los vasos de la bandeja están vacíos. ¿Qué no puede salir de uno de esos vasos sin añadir algo?|Agua|Aire|El propio vaso
La biblioteca abre después del desayuno y antes de la clase. ¿Qué ocurre en medio de esos tres hechos?|La apertura de la biblioteca|El desayuno|La clase
Nina tiene menos libros que Tilo y Tilo menos que Lumi. ¿Quién tiene más libros?|Lumi|Nina|Tilo'''
for i,line in enumerate(logic.splitlines()):
    q,a,b,c=line.split('|');add('verbal',q,a,[b,c],f'Usa solo las condiciones del enunciado. La conclusión que se deduce es: {a.lower()}.',1+i%3)

bible='''¿Quién construyó el arca en el relato del diluvio?|Noé|Jonás|Herodes|Génesis 6 presenta a Noé construyendo el arca.
¿Qué señal aparece en el cielo tras el diluvio como símbolo de alianza?|El arcoíris|Una escalera|Una corona|Génesis 9 relaciona el arcoíris con la alianza.
¿En qué ciudad nació Jesús según los evangelios de Mateo y Lucas?|Belén|Roma|Atenas|Mateo 2 y Lucas 2 sitúan el nacimiento en Belén.
¿Cómo se llama la madre de Jesús?|María|Rut|Ester|María es la madre de Jesús en los relatos evangélicos.
¿Quién fue el esposo de María?|José|Saúl|Jonás|Mateo 1 presenta a José como esposo de María.
¿Dónde acostaron al recién nacido Jesús según Lucas?|En un pesebre|En un barco|En un palacio|Lucas 2 menciona el pesebre.
¿Quiénes recibieron el anuncio del nacimiento mientras cuidaban sus rebaños?|Pastores|Marineros|Soldados romanos|Lucas 2 relata el anuncio a los pastores.
¿Qué siguieron los magos para buscar a Jesús en Mateo?|Una estrella|Un arcoíris|Un río|Mateo 2 menciona la estrella.
¿Qué regalo figura junto al incienso y la mirra?|Oro|Plata|Trigo|Mateo 2 enumera oro, incienso y mirra.
¿Cuántos magos dice explícitamente Mateo que eran?|No indica la cantidad|Exactamente tres|Exactamente doce|Mateo enumera tres regalos, pero no fija el número de magos.
¿Quién anunció a María que sería madre de Jesús?|Gabriel|Goliat|Pilato|Lucas 1 nombra al ángel Gabriel.
¿Qué nombre recibió el hijo de Elisabet y Zacarías?|Juan|Salomón|Daniel|Lucas 1 cuenta el nacimiento de Juan.
¿Quién bautizó a Jesús?|Juan el Bautista|Herodes|Tomás|Los evangelios presentan a Juan bautizando a Jesús.
¿En qué río fue bautizado Jesús?|Jordán|Nilo|Tíber|Los relatos del bautismo mencionan el Jordán.
¿Cuántos apóstoles eligió Jesús como grupo de los Doce?|Doce|Siete|Veinte|Los evangelios hablan del grupo de los Doce.
¿Qué oficio tenían Pedro y Andrés al ser llamados?|Pescadores|Alfareros|Reyes|Mateo 4 los presenta como pescadores.
¿Quién era el hermano de Andrés?|Pedro|Felipe|Judas Iscariote|Juan 1 identifica a Andrés como hermano de Simón Pedro.
¿Qué discípulo era cobrador de impuestos antes de seguir a Jesús?|Mateo|Santiago|Andrés|Mateo 9 relata su llamado desde el puesto de impuestos.
¿Qué recaudador subió a un árbol para ver a Jesús?|Zaqueo|Lázaro|Bartimeo|Lucas 19 narra el encuentro con Zaqueo.
¿Qué hizo Jesús en Caná según Juan 2?|Convirtió agua en vino|Construyó el arca|Dividió el Jordán|Juan 2 relata las bodas de Caná.
¿Qué alimento acompañó a los panes en la multiplicación?|Peces|Uvas|Higos|Los relatos mencionan panes y peces.
¿Cuántos panes tenía el muchacho en Juan 6?|Cinco|Diez|Doce|Juan 6 menciona cinco panes de cebada.
¿Cuántos peces llevaba ese muchacho en Juan 6?|Dos|Cinco|Siete|El relato menciona dos peces.
¿Qué hizo Jesús durante la tormenta antes de que lo despertaran?|Dormía|Pescaba|Escribía|Marcos 4 lo describe durmiendo en la barca.
¿Quién caminó hacia Jesús sobre el agua y luego tuvo miedo?|Pedro|Zaqueo|Pablo|Mateo 14 cuenta el episodio de Pedro.
¿Qué parábola habla de alguien que ayuda a un herido en el camino?|El buen samaritano|Las diez vírgenes|El sembrador|Lucas 10 cuenta la ayuda del samaritano al herido.
¿Qué actitud muestra el padre al recibir al hijo pródigo?|Perdón y alegría|Venganza|Indiferencia|Lucas 15 presenta una acogida compasiva.
¿Qué perdió la mujer de una parábola de Lucas 15?|Una moneda|Una sandalia|Una corona|La parábola habla de una moneda perdida.
¿Cuántas ovejas busca el pastor tras dejar a las noventa y nueve?|Una|Diez|Veinte|La parábola presenta la búsqueda de la oveja perdida.
En la parábola del sembrador, ¿qué representa la semilla según Lucas 8?|La palabra de Dios|El dinero|Una espada|La explicación de Lucas 8 identifica la semilla con la palabra de Dios.
¿Qué oración enseñó Jesús a sus discípulos?|El Padrenuestro|La oración de Jonás|El cántico de Moisés|Mateo 6 y Lucas 11 recogen esa enseñanza.
¿Qué invitación hace Jesús sobre el prójimo?|Amarlo|Ignorarlo|Engañarlo|El mandamiento invita a amar al prójimo.
¿Qué regla enseña a tratar a los demás como queremos ser tratados?|La regla de oro|La ley del más fuerte|La regla del silencio|Mateo 7:12 recoge esa enseñanza.
¿Quiénes eran las hermanas de Lázaro?|Marta y María|Rut y Noemí|Sara y Rebeca|Juan 11 identifica a Marta y María como sus hermanas.
¿A quién llamó Jesús a salir de la tumba en Juan 11?|Lázaro|Goliat|Esaú|Juan 11 narra el llamado a Lázaro.
¿Qué mujer escuchaba a Jesús sentada a sus pies mientras Marta servía?|María|Ester|Débora|Lucas 10 contrasta las acciones de Marta y María.
¿En qué ciudad entró Jesús montado en un asno?|Jerusalén|Babilonia|Corinto|Los evangelios sitúan la entrada en Jerusalén.
¿Qué hizo Jesús con los pies de sus discípulos en Juan 13?|Los lavó|Los pintó|Los vendó por heridas de guerra|El lavatorio muestra una actitud de servicio.
¿Quién negó conocer a Jesús tres veces?|Pedro|Andrés|Felipe|Los evangelios narran las negaciones de Pedro.
¿Qué discípulo pidió ver las heridas de Jesús resucitado?|Tomás|Mateo|Bartolomé|Juan 20 relata la petición de Tomás.
¿Qué mujer fue al sepulcro y encontró la piedra quitada en Juan 20?|María Magdalena|Sara|Rebeca|Juan 20 comienza con la visita de María Magdalena.
¿Qué nombre tenía Pablo antes de su conversión?|Saulo|Samuel|Simón el mago|Hechos presenta a Saulo, también llamado Pablo.
¿Hacia qué ciudad viajaba Saulo en el relato de su conversión?|Damasco|Belén|Nínive|Hechos 9 sitúa el viaje hacia Damasco.
¿Qué libro cuenta los viajes misioneros de Pablo?|Hechos de los Apóstoles|Génesis|Rut|Hechos narra esos viajes y la primera comunidad cristiana.
¿Quién acompañó a Pablo en la prisión de Filipos según Hechos 16?|Silas|Moisés|Elías|Hechos 16 presenta a Pablo y Silas.
¿Qué hacían Pablo y Silas a medianoche en la prisión?|Oraban y cantaban|Construían una barca|Cosechaban|Hechos 16 relata sus oraciones y cantos.
¿Qué apóstol explicó las Escrituras al etíope en Hechos 8?|Felipe|Tomás|Judas Iscariote|Hechos 8 presenta a Felipe acompañando al viajero.
¿Qué mujer comerciante recibió a Pablo en Filipos?|Lidia|Dalila|Jezabel|Hechos 16 menciona a Lidia, vendedora de púrpura.
¿Qué oficio compartían Pablo, Priscila y Aquila?|Fabricar tiendas|Construir palacios|Hacer barcos de guerra|Hechos 18 menciona la fabricación de tiendas.
¿Qué capítulo de 1 Corintios es conocido por hablar del amor?|El 13|El 2|El 8|1 Corintios 13 describe el amor paciente y bondadoso.
¿Qué libro bíblico contiene muchos poemas y oraciones?|Salmos|Números|Josué|Los Salmos reúnen cantos, poemas y oraciones.
¿Qué libro reúne numerosos consejos de sabiduría?|Proverbios|Éxodo|Jonás|Proverbios presenta enseñanzas de sabiduría.
¿Quién sacó a Israel de Egipto en el relato del Éxodo?|Moisés|David|Nehemías|Moisés lidera la salida en el relato bíblico.
¿Quién era el hermano de Moisés?|Aarón|Abel|Isaac|Éxodo presenta a Aarón como hermano de Moisés.
¿Cómo se llamaba la hermana de Moisés y Aarón?|Miriam|Ester|Rut|Éxodo 15 menciona a Miriam como hermana de Aarón.
¿Qué mar cruzaron los israelitas al salir de Egipto?|El mar Rojo|El mar Caribe|El mar Báltico|La tradición del Éxodo identifica así el cruce.
¿Qué alimento recibieron en el desierto y llamaron maná?|Pan del cielo|Pescado frito|Aceitunas|Éxodo 16 narra el don del maná.
¿En qué monte recibió Moisés los mandamientos?|Sinaí|Olimpo|Everest|Éxodo sitúa la entrega en el Sinaí.
¿Cuántos mandamientos se conocen como el Decálogo?|Diez|Cinco|Veinte|Decálogo significa las diez palabras o mandamientos.
¿Qué mandamiento invita a respetar a los padres?|Honrar al padre y a la madre|No construir casas|No sembrar trigo|El Decálogo incluye honrar a padre y madre.
¿Quién sucedió a Moisés como líder en el relato bíblico?|Josué|Saúl|Jonás|Josué continúa la conducción del pueblo.
¿Qué ciudad aparece en el relato de las murallas que cayeron tras rodearla?|Jericó|Roma|Nazaret|Josué 6 relata la caída de las murallas de Jericó.
¿Quién dijo a Noemí «Tu pueblo será mi pueblo»?|Rut|Dalila|Eva|Rut 1 expresa esa decisión de acompañamiento.
¿Qué joven escuchó su nombre mientras dormía en el santuario?|Samuel|Goliat|Absalón|1 Samuel 3 narra el llamado de Samuel.
¿A qué gigante enfrentó David?|Goliat|Sansón|Og de Atenas|1 Samuel 17 narra el enfrentamiento con Goliat.
¿Qué instrumento tocaba David para Saúl?|La lira|El saxofón|La batería eléctrica|1 Samuel 16 menciona un instrumento de cuerda, traducido como lira o arpa.
¿Quién pidió sabiduría para gobernar?|Salomón|Herodes|Pilato|1 Reyes 3 narra la petición de Salomón.
¿Qué profeta fue alimentado por cuervos en 1 Reyes 17?|Elías|Jonás|Isaías|El relato presenta a los cuervos llevando alimento a Elías.
¿Qué profeta sucedió a Elías?|Eliseo|Malaquías|Amós|2 Reyes 2 presenta a Eliseo como su sucesor.
¿Quién fue echado al foso de los leones?|Daniel|Noé|Esdras|Daniel 6 narra el episodio del foso.
¿Qué tres jóvenes aparecen en el horno de fuego en Daniel 3?|Sadrac, Mesac y Abed-nego|Pedro, Juan y Santiago|Caín, Abel y Set|Daniel 3 presenta a esos tres jóvenes.
¿Qué profeta pasó tres días y tres noches dentro de un gran pez?|Jonás|Ezequiel|Oseas|El libro de Jonás relata el episodio.
¿A qué ciudad fue enviado Jonás?|Nínive|Belén|Éfeso|El llamado de Jonás lo dirige a Nínive.
¿Qué reina intercedió por su pueblo?|Ester|Dalila|Salomé|El libro de Ester narra su intercesión.
¿Quién reconstruyó las murallas de Jerusalén según el libro que lleva su nombre?|Nehemías|Gedeón|Lot|Nehemías organiza la reconstrucción.
¿Quién es el padre de Isaac en Génesis?|Abraham|Jacob|Labán|Génesis presenta a Abraham y Sara como sus padres.
¿Cómo se llamaba la madre de Isaac?|Sara|Lea|Raquel|Génesis 21 narra el nacimiento de Isaac, hijo de Sara.
¿Qué otro nombre recibió Jacob?|Israel|Edom|Moisés|Génesis 32 relata el cambio de nombre.
¿Quién era el hermano gemelo de Jacob?|Esaú|José|Benjamín|Génesis 25 presenta a Jacob y Esaú como gemelos.
¿Qué hijo de Jacob interpretó sueños en Egipto?|José|Leví|Dan|Génesis relata las interpretaciones de José.
¿Qué hizo José al reencontrarse con sus hermanos?|Los perdonó|Los olvidó para siempre|Les prohibió comer|El relato de Génesis culmina en la reconciliación.
¿Qué personaje perdió bienes y salud y es ejemplo de perseverancia en su libro?|Job|Caifás|Ananías|El libro de Job trata su sufrimiento y sus preguntas.
¿Cuál es el primer libro de la Biblia?|Génesis|Apocalipsis|Lucas|Génesis abre la Biblia.
¿Cuál de estos es un evangelio?|Marcos|Proverbios|Esdras|Marcos pertenece al grupo de los cuatro evangelios.
¿Cuáles son los cuatro evangelios?|Mateo, Marcos, Lucas y Juan|Rut, Ester, Job y Salmos|Génesis, Éxodo, Levítico y Números|Estos cuatro libros narran la vida y enseñanza de Jesús.
¿Qué libro cierra el Nuevo Testamento?|Apocalipsis|Malaquías|Jueces|Apocalipsis es el último libro del Nuevo Testamento.
¿Qué significa «prójimo» en la enseñanza de amar al prójimo?|La otra persona a quien debemos amar|Solo los familiares|Solo quien piensa igual|La enseñanza invita a amar más allá del propio grupo.
¿Qué gesto del buen samaritano muestra compasión?|Cuidar al herido|Pasar sin mirar|Burlarse del viajero|La ayuda concreta al herido ilustra la compasión.
¿Qué imagen usa Jesús para hablar de guiar y cuidar a sus seguidores en Juan 10?|El buen pastor|El emperador|El comerciante de oro|Juan 10 emplea la imagen del buen pastor.
¿Qué invitación de Jesús aparece al hablar de los niños?|Dejar que se acerquen a él|Apartarlos siempre|Prohibirles escuchar|Marcos 10 recoge esa acogida a los niños.'''
for j,line in enumerate(bible.splitlines()):
    q,a,b,c,e=line.split('|');add('biblia',q,a,[b,c],e,1+j%3)
assert len(bible.splitlines())==90, len(bible.splitlines())

science='''¿Qué necesita una planta para fabricar alimento mediante fotosíntesis?|Luz|Oscuridad permanente|Solo arena|La luz aporta la energía de la fotosíntesis.
¿Qué órgano bombea la sangre?|Corazón|Estómago|Pulmón|El corazón impulsa la sangre por los vasos.
¿Qué órganos permiten intercambiar oxígeno y dióxido de carbono al respirar?|Pulmones|Riñones|Huesos|El intercambio gaseoso ocurre en los pulmones.
¿Qué parte de la planta absorbe agua del suelo?|Raíz|Flor|Fruto|Las raíces absorben agua y minerales.
¿Qué estado tiene el hielo?|Sólido|Gaseoso|Plasma|El hielo es agua en estado sólido.
¿Cómo se llama el paso de líquido a gas?|Evaporación|Congelación|Fusión|La evaporación transforma un líquido en gas.
¿Cómo se llama el paso de gas a líquido?|Condensación|Fusión|Sublimación|La condensación forma gotas a partir del vapor.
¿Qué fuerza atrae los objetos hacia la Tierra?|Gravedad|Magnetismo de todos los objetos|Fricción|La gravedad produce esa atracción.
¿Qué estrella está en el centro del sistema solar?|Sol|Luna|Sirio|Los planetas del sistema solar orbitan el Sol.
¿Cuál es el satélite natural de la Tierra?|Luna|Marte|Venus|La Luna orbita la Tierra.
¿Qué planeta es conocido como el planeta rojo?|Marte|Saturno|Neptuno|Su superficie rica en óxidos de hierro le da ese tono.
¿Qué planeta tiene anillos muy visibles desde telescopios?|Saturno|Mercurio|Venus|Saturno es famoso por su sistema de anillos.
¿Qué movimiento terrestre explica el día y la noche?|Rotación|Traslación por sí sola|Deriva continental|La Tierra gira sobre su eje.
¿Qué material suele permitir el paso de la luz?|Vidrio transparente|Cartón grueso|Madera|El vidrio transparente deja pasar gran parte de la luz.
¿Qué tipo de animal amamanta a sus crías?|Mamífero|Insecto|Pez óseo|Las glándulas mamarias producen leche.
¿Cuántas patas tiene un insecto adulto típico?|Seis|Ocho|Diez|Los insectos tienen tres pares de patas.
¿Cuántas patas tiene una araña?|Ocho|Seis|Cuatro|Las arañas son arácnidos y tienen cuatro pares de patas.
¿Qué gas del aire utilizamos en la respiración celular?|Oxígeno|Helio|Neón|Las células usan oxígeno para obtener energía de los nutrientes.
¿Qué gas absorben las plantas durante la fotosíntesis?|Dióxido de carbono|Helio|Argón|El dióxido de carbono aporta el carbono para formar azúcares.
¿Qué instrumento mide la temperatura?|Termómetro|Regla|Brújula|La temperatura se mide con un termómetro.
¿Qué instrumento ayuda a orientarse con el campo magnético terrestre?|Brújula|Balanza|Cronómetro|La aguja de una brújula se orienta con ese campo.
¿Qué unidad se usa para medir masa en el SI?|Kilogramo|Litro|Segundo|El kilogramo es la unidad básica de masa del SI.
¿Qué unidad se usa para medir duración en el SI?|Segundo|Metro|Amperio|El segundo mide intervalos de tiempo.
¿Qué material conduce bien la electricidad?|Cobre|Goma|Plástico|El cobre se usa como conductor en cables.
¿Qué es un ecosistema?|Seres vivos y su entorno relacionados|Solo una roca|Solo un animal|Un ecosistema incluye organismos y factores físicos que interactúan.
¿Qué animal pasa por una etapa de oruga?|Mariposa|Perro|Rana|La oruga es la larva de una mariposa o polilla.
¿Qué etapa acuática precede a la rana adulta?|Renacuajo|Polluelo|Cachorro|El renacuajo forma parte de la metamorfosis de la rana.
¿Qué estructura protege el cerebro?|Cráneo|Costilla|Fémur|Los huesos del cráneo rodean el cerebro.
¿Qué huesos protegen principalmente corazón y pulmones?|Costillas|Dedos|Tobillos|Las costillas forman parte de la caja torácica.
¿Qué fenómeno produce un eco?|Reflexión del sonido|Congelación del aire|Desaparición de la luz|El sonido regresa tras reflejarse en una superficie.'''
for j,line in enumerate(science.splitlines()):
    q,a,b,c,e=line.split('|');add('ciencias',q,a,[b,c],e,1+j%3)
concepts='''Si colocas agua líquida en un congelador y se vuelve hielo, ¿qué cambio ocurrió?|Congelación|Evaporación|Condensación;Una cuchara de metal se calienta dentro de una sopa caliente. ¿Qué proceso transmite el calor por la cuchara?|Conducción|Fotosíntesis|Germinación;Una pelota rueda cada vez más despacio sobre el suelo. ¿Qué fuerza se opone a su movimiento?|Fricción|Luz|Flotación;Una semilla empieza a desarrollar una raíz. ¿Cómo se llama este proceso?|Germinación|Evaporación|Erosión;Un oso polar tiene pelaje que ayuda a conservar calor. ¿Qué función cumple?|Aislamiento térmico|Producción de electricidad|Respirar bajo el agua;Una sombra cambia de posición durante el día. ¿Qué cambia respecto al objeto?|La dirección de la luz solar|Su masa siempre|Su material;El agua de un charco desaparece en un día cálido sin entrar al suelo. ¿Qué ocurrió principalmente?|Evaporación|Congelación|Magnetismo;Aparecen gotas fuera de un vaso frío. ¿De dónde viene esa agua?|Del vapor del aire que se condensa|Del vidrio que se derrite|De la sal del agua;¿Qué ejemplo es una mezcla?|Agua con arena|Un elemento químico puro|Un átomo aislado;¿Cómo separarías arena del agua con papel adecuado?|Filtración|Imantación|Congelación de la arena;¿Cómo separarías limaduras de hierro de arena seca?|Con un imán|Con una lupa|Con un termómetro;¿Qué acción favorece reutilizar un objeto?|Usar un frasco limpio como portalápices|Tirarlo después de un uso|Romperlo;¿Qué forma de energía capta un panel solar fotovoltaico?|Luz solar|Solo sonido|Solo viento;¿Qué transforma un aerogenerador en electricidad?|Energía del viento|Energía de las hojas|Energía de la sal;¿Qué parte del cuerpo usamos principalmente para oler?|Nariz|Codo|Rodilla;¿Qué sentido permite percibir texturas?|Tacto|Olfato|Gusto;¿Qué sentido ayuda a distinguir sabores?|Gusto|Oído|Vista;¿Por qué el aceite suele quedar sobre el agua?|Su densidad es menor|No tiene masa|Siempre está congelado;¿Qué describe mejor una cadena alimentaria?|Quién se alimenta de quién|El orden alfabético de animales|Una cuerda de metal;¿Qué organismo suele ser productor en una cadena alimentaria?|Planta verde|Lobo|Águila;¿Qué ejemplo corresponde a un herbívoro?|Conejo|León|Tiburón;¿Qué ejemplo corresponde a un carnívoro?|León|Vaca|Oveja;¿Qué ejemplo corresponde a un omnívoro?|Oso pardo|Vaca|Conejo;¿Cuál es una fuente renovable de energía?|Viento|Carbón mineral|Petróleo;¿Qué recurso se protege al cerrar un grifo que no usamos?|Agua|Hierro|Luz solar;¿Cuál es una propiedad de un gas?|Ocupa el espacio disponible del recipiente|Mantiene siempre forma rígida|No tiene partículas;¿Por qué vemos un relámpago antes de oír el trueno lejano?|La luz viaja más rápido que el sonido|El sonido viaja más rápido|La luz no se mueve;¿Qué objeto permite observar células pequeñas?|Microscopio|Telescopio|Brújula;¿Qué objeto permite observar astros lejanos?|Telescopio|Microscopio escolar|Balanza;¿Qué planeta habitamos?|Tierra|Júpiter|Urano'''
for j,line in enumerate(concepts.split(';')):
    q,a,b,c=line.split('|');add('ciencias',q,a,[b,c],f'La opción correcta es {a.lower()}; corresponde al fenómeno o concepto descrito.',1+j%3)

capitals='''Perú|Lima;Colombia|Bogotá;Venezuela|Caracas;Ecuador|Quito;Chile|Santiago;Argentina|Buenos Aires;Uruguay|Montevideo;Paraguay|Asunción;Brasil|Brasilia;México|Ciudad de México;Cuba|La Habana;Panamá|Ciudad de Panamá;Costa Rica|San José;Nicaragua|Managua;Honduras|Tegucigalpa;El Salvador|San Salvador;Guatemala|Ciudad de Guatemala;República Dominicana|Santo Domingo;Haití|Puerto Príncipe;España|Madrid;Portugal|Lisboa;Francia|París;Italia|Roma;Alemania|Berlín;Grecia|Atenas;Irlanda|Dublín;Noruega|Oslo;Suecia|Estocolmo;Finlandia|Helsinki;Dinamarca|Copenhague;Austria|Viena;Polonia|Varsovia;Japón|Tokio;China|Pekín;Corea del Sur|Seúl;India|Nueva Delhi;Egipto|El Cairo;Marruecos|Rabat;Australia|Canberra;Canadá|Ottawa'''
caps=[r.split('|') for r in capitals.split(';')]
for j,(country,city) in enumerate(caps):
    add('geografia',f'¿Cuál es la capital de {country}?',city,[caps[(j+1)%40][1],caps[(j+7)%40][1]],f'{city} es la capital de {country}.',1+j%3)

history='''¿Qué civilización construyó Machu Picchu?|Inca|Romana|Vikinga;¿Qué escritura usaban los antiguos egipcios en muchos monumentos?|Jeroglíficos|Alfabeto cirílico|Código Morse;¿En qué continente surgió la antigua civilización egipcia?|África|Oceanía|América;¿Qué ciudad fue el centro del Imperio romano?|Roma|Tokio|Quito;¿Qué civilización de Mesoamérica desarrolló ciudades como Tikal?|Maya|Inca|Griega;¿Qué instrumento andino de viento tiene varios tubos?|Zampoña|Violín|Tambor;¿Qué instrumento tiene cuerdas y se toca habitualmente con arco?|Violín|Flauta|Maraca;¿Qué instrumento pertenece a la percusión?|Tambor|Clarinete|Arpa;¿Qué material se usa tradicionalmente en muchas cerámicas?|Arcilla|Hielo|Papel de aluminio;¿Qué profesión estudia restos materiales de sociedades pasadas?|Arqueología|Astronauta|Jardinería;¿Para qué sirve un museo de historia?|Conservar y explicar patrimonio|Vender siempre todos sus objetos|Ocultar todos sus fondos;¿Qué representa una línea de tiempo?|El orden temporal de hechos|La altura de edificios|La temperatura diaria;¿Qué ocurrió primero?|La invención de la escritura|La invención de internet|La llegada del teléfono móvil;¿Quién pintó la Mona Lisa?|Leonardo da Vinci|Miguel de Cervantes|Antonio Vivaldi;¿Quién escribió Don Quijote de la Mancha?|Miguel de Cervantes|Pablo Picasso|Wolfgang Mozart;¿Quién compuso Las cuatro estaciones?|Antonio Vivaldi|Gabriel García Márquez|Frida Kahlo;¿Qué artista mexicana es conocida por sus autorretratos?|Frida Kahlo|Marie Curie|Jane Austen;¿Qué pintor es conocido por La noche estrellada?|Vincent van Gogh|César Vallejo|Charles Darwin;¿Qué escritor peruano escribió muchos poemas de Los heraldos negros?|César Vallejo|Julio Verne|William Shakespeare;¿Qué escritor creó al personaje de Pinocho?|Carlo Collodi|Homero|Jorge Luis Borges;¿Qué color resulta al mezclar pintura amarilla y azul en el modelo escolar tradicional?|Verde|Naranja|Violeta;¿Qué color resulta al mezclar pintura roja y amarilla?|Naranja|Verde|Azul;¿Qué color resulta al mezclar pintura roja y azul en el modelo escolar tradicional?|Violeta|Verde|Amarillo;¿Qué figura literaria compara usando «como»?|Símil|Hipérbole siempre|Onomatopeya;¿Qué es una onomatopeya?|Una palabra que imita un sonido|Un mapa antiguo|Una figura de tres lados;¿Qué es una escultura?|Una obra artística con volumen|Solo un texto escrito|Solo una melodía;¿Qué arte cuenta historias mediante actores en escena?|Teatro|Cerámica|Arquitectura;¿Qué arte organiza sonidos y silencios en el tiempo?|Música|Pintura|Escultura;¿Qué profesional diseña edificios?|Arquitecto|Astrónomo|Biólogo marino;¿Qué es el patrimonio cultural?|Bienes y tradiciones que una comunidad valora|Solo objetos nuevos de una tienda|Solo máquinas de fábrica'''
for j,line in enumerate(history.split(';')):
    q,a,b,c=line.split('|');add('historia',q,a,[b,c],f'La respuesta es {a}. Este dato pertenece a historia, arte o patrimonio cultural.',1+j%3)

digital='''Si recibes un enlace extraño que pide tu contraseña, ¿qué conviene hacer?|No compartirla y consultar con alguien de confianza|Escribir la contraseña enseguida|Publicarla para preguntar;¿Qué contraseña es más segura entre estas opciones?|Una frase larga y única|123456|Tu nombre;¿Qué dato conviene mantener privado en un comentario público?|La dirección exacta de tu casa|El color favorito|Un personaje de cuento;¿Qué debes hacer antes de compartir una foto de otra persona?|Pedir su permiso|Cambiarle el nombre|Publicarla siempre;¿Qué acción muestra respeto al conversar en internet?|Escuchar y evitar insultos|Burlarse de quien se equivoca|Compartir rumores;¿Qué conviene hacer con una noticia sorprendente antes de compartirla?|Revisar su fuente y buscar confirmación|Creer solo el titular|Reenviarla sin leer;¿Para qué sirve una copia de seguridad?|Recuperar archivos si se pierden|Hacer que nunca necesites contraseña|Cambiar el color de la pantalla;¿Qué significa guardar un archivo?|Conservarlo para abrirlo después|Borrarlo siempre|Imprimirlo obligatoriamente;¿Qué dispositivo se usa para escribir letras en una computadora?|Teclado|Parlante|Pantalla sin entrada;¿Qué dispositivo reproduce sonido?|Parlante|Ratón|Escáner;¿Qué debemos hacer antes de comer y después de ir al baño?|Lavarnos las manos|Solo cambiar de zapatos|Tocar más superficies;¿Qué hábito ayuda a cuidar los dientes?|Cepillarlos regularmente|Nunca limpiarlos|Usarlos para abrir botellas;¿Qué acción ayuda a descansar durante el estudio?|Hacer pausas y moverse|Permanecer inmóvil todo el día|No dormir;¿Qué bebida ayuda a hidratarnos sin azúcar añadida?|Agua potable|Jarabe|Tinta;¿Qué acción muestra juego limpio?|Respetar reglas y participantes|Hacer trampa|Insultar a quien pierde;Si alguien se equivoca en clase, ¿qué actitud ayuda?|Animarlo a intentarlo otra vez|Reírse de él|Impedir que pregunte;¿Qué acción muestra cooperación?|Repartir tareas y ayudarse|Hacer que una persona haga todo|Esconder materiales;¿Qué conviene hacer al cruzar una calle?|Usar un cruce seguro y observar el tránsito|Correr sin mirar|Mirar solo el teléfono;¿Qué acción ayuda a reducir basura?|Reutilizar materiales cuando sea posible|Tirar residuos al río|Dejar envases en la calle;¿Qué debemos hacer cuando no entendemos una instrucción?|Pedir una explicación|Fingir que entendimos siempre|Burlarnos de quien la dio'''
for j,line in enumerate(digital.split(';')):
    q,a,b,c=line.split('|');add('vida',q,a,[b,c],f'La opción que cuida a las personas y favorece aprender es: {a.lower()}.',1+j%3)

assert len(new)==820, len(new)
all_questions=original+new
assert len(all_questions)==1000
assert len({q['question'].casefold() for q in all_questions})==1000
assert len({q['id'] for q in all_questions})==1000
(ROOT/'dist/quiz-data.js').write_text('window.SANTA_QUIZ = '+json.dumps(all_questions,ensure_ascii=False,indent=2)+';\n')
print('1000 unique questions generated; original Christmas set retained.')
