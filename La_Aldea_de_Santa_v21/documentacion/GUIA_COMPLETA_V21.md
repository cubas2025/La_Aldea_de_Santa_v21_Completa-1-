# La aldea de Santa - Guía completa de la versión 21

Código publicado: b84d0a590c2369093fb7cd3b534cd365df78a1ad

## 1. Qué contiene esta entrega

Copia de la versión 21 de La aldea de Santa, correspondiente al código publicado y al commit b84d0a590c2369093fb7cd3b534cd365df78a1ad. La documentación y los iniciadores de esta entrega se añaden al proyecto sin modificar sus recursos publicados.

Sitio público: https://la-aldea-de-santa.orangemirth32.chatgpt.site. Marca: La aldea de Santa. Firma: Cubas.AI. Frase: La magia más bonita es verte sonreír. Contacto: +51 917 823 560. WhatsApp: https://w.app/cubasai.

- 54 opciones de saludo personalizado; tarifas PEN 3 / USD 1 y PEN 5 / USD 2 según el catálogo.
- 5 escenas de Santa en movimiento, con exportación de 12 segundos.
- 40 escenas fotográficas de Santa, con video de 15 segundos.
- 864 nombres con grabaciones aisladas de la voz de Santa.
- 25 tarjetas navideñas con paisajes y cuenta regresiva.
- 30 cuentos personalizables y 30 libros de seis páginas: 180 páginas para colorear en total.
- 1.500 preguntas preparadas, tres niveles y modo de práctica continua con variantes.
- 11 pistas en el selector de música, más los recursos de voz y música de las llamadas.
- Editor de video, tarjetas, certificados, invitaciones, tarjetas QR y sección de llamadas en prueba.

Todos los archivos necesarios para la aplicación están en app/. No se incluyen credenciales, datos de clientes, historial Git, cachés ni videos de prueba creados durante la revisión. Los CSV de catalogos/ permiten consultar el contenido sin abrir el código.

## 2. Abrir la aplicación en tu PC o celular

1. Extrae el ZIP completo. No ejecutes archivos desde dentro del comprimido. Mantén juntas todas sus carpetas.
2. En Windows, instala Python 3 si no está disponible y ejecuta INICIAR_WINDOWS.bat. El iniciador comprueba Python y abre una ventana con el servidor local.
3. Abre http://127.0.0.1:8080 en Chrome o Edge. Mantén abierta la ventana del servidor mientras usas la app.
4. Si prefieres la terminal: entra en La_Aldea_de_Santa_v21 y ejecuta el comando indicado debajo.
5. Para detener el servidor usa Ctrl+C en su ventana. En Mac o Linux puedes ejecutar iniciar_macos_linux.sh desde una terminal con Python 3.
6. Para usarla desde un celular, abre el sitio público. El servidor local predeterminado solo está disponible en la misma PC; 127.0.0.1 en un celular se refiere a ese celular.

```text
python -m http.server 8080 --bind 127.0.0.1 --directory app/dist
```

No abras app/dist/index.html con doble clic: las cargas de audio, video y el exportador necesitan HTTP o HTTPS. No hace falta instalar Node para usar la web. Node se utiliza para las pruebas técnicas. Las dependencias del navegador ya están dentro de app/dist/vendor/.

La primera exportación carga el módulo de video y puede tardar más. Conserva la pestaña abierta, evita exportar varios videos a la vez en equipos de poca memoria y usa Cancelar si necesitas detener el proceso.

## 3. Saludos personalizados y pedidos

1. Entra en Saludos, usa las categorías y abre una tarjeta del catálogo.
2. Revisa el título, duración y datos personalizables de la ventana de detalle.
3. Pulsa Personalizar y completa el nombre del saludo, tarifa, nombre del niño o niña, edad, lugar y los datos solicitados.
4. En los pedidos largos puedes añadir gustos, familiares, logros, regalos y mensajes cuando el formulario los solicite.
5. Copia el pedido preparado y abre WhatsApp. Pega el texto y adjunta allí las fotos que correspondan.
6. Coordina el pago y la entrega con el responsable del servicio. La web no cobra ni produce automáticamente un video comercial de varios minutos.

Modalidad | Precio Perú | Otros países | Referencia de duración
Saludo corto | S/ 3 | US$ 1 | 1 a 3 minutos
Saludo largo | S/ 5 | US$ 2 | 5 minutos a más

El catálogo contiene 54 títulos, incluidos cumpleaños, grupos y otras categorías. Conserva los valores individuales de data.js. La opción Entrega de regalos de Santa incluye la tarjeta con QR según el catálogo. Los detalles completos están en catalogos/Saludos_54.csv.

El enlace w.app se abre tal como fue proporcionado. No garantiza que el texto del pedido se inserte automáticamente; por eso la app permite copiarlo primero. Las fotos se adjuntan manualmente en WhatsApp.

## 4. Lista de los buenos: Santa en movimiento

1. Entra en Lista de los buenos, junto a Saludos.
2. Elige una de las cinco escenas: El primer destello, La bolsita de estrellas, Magia en la aldea, Bajo la luna de Navidad o El sendero iluminado.
3. Escribe el nombre exactamente como debe verse. Usa las sugerencias para elegir una grabación disponible.
4. El sistema busca el nombre completo y utiliza únicamente su archivo de voz. Puedes elegir anuncio para niño o para niña.
5. Opcionalmente sube una foto JPG, PNG o WebP de hasta 12 MB, o un video de hasta 60 MB. El video del marco se reproduce sin su sonido.
6. Selecciona la música o Sin música. Pulsa Ver mi animación para revisar el resultado.
7. Pulsa Generar y descargar MP4. La descarga dura 12 segundos, mide 720 x 1280 y contiene la voz y la música seleccionadas.
8. Puedes descargar una portada PNG, pasar el resultado al editor o compartirlo desde las opciones disponibles.

La sincronización final utiliza una sola pista WAV: anuncio completo hasta «es» + pausa de 40 milisegundos + grabación del nombre elegido. Las letras aparecen al finalizar el anuncio y la pronunciación del nombre comienza inmediatamente después. El comienzo se calcula a partir de las muestras reales del WAV, sin un temporizador fijo diferente por escena.

Anuncio | Aparición del nombre | Inicio de su voz
Niño | 4,20 segundos | 4,24 segundos
Niña | 3,90 segundos | 3,94 segundos

El nombre nace como partículas con la forma de las letras y se vuelve dorado y nítido. La imagen o el video opcional aparece en el marco grande del cielo en ese mismo momento. La escena de fondo se mantiene hasta completar 12 segundos, conservando su último cuadro si termina antes.

Esta versión utiliza los nombres grabados; no inventa ni sintetiza nombres nuevos. Si no existe coincidencia, informa del problema. Jazmin conserva exactamente esa escritura. Las portadas pueden dibujar cualquier texto, pero una exportación con voz exige una grabación disponible.

## 5. Galería de 40 escenas de Santa

1. Abre el enlace de 40 escenas que aparece en Lista de los buenos, o entra desde Explora la aldea.
2. Escribe el nombre, elige la escena y selecciona Lista de buenos o Lista de mal portados.
3. Selecciona audio para niño, audio para niña o Sin voz. Añade música y, si deseas, foto o video y una buena acción.
4. En Lista de buenos, la voz incluye el anuncio y después únicamente el nombre elegido. La galería utiliza el mismo sincronizador que los videos de Santa en movimiento.
5. Revisa la animación y descarga MP4, imagen PNG o PDF. El video de esta sección conserva su duración de 15 segundos.

La fotografía de Santa conserva su pose; se animan el nombre, los destellos y el marco de contenido personal. No es una nueva animación corporal completa generada por IA en cada pedido.

Lista de mal portados desactiva los anuncios que dicen «lista de los buenos» para evitar que voz y tarjeta se contradigan. Se puede exportar con música o sin sonido. Un nombre sin grabación permite crear tarjeta o video sin voz; la exportación hablada exige elegir uno de los nombres disponibles.

Las 40 escenas y sus miniaturas están en app/dist/assets/listas/. El catálogo legible está en catalogos/Escenas_Santa_40.csv. Santa conserva el personaje realista de referencia y los duendes de apoyo son jóvenes, sin barba.

## 6. Tarjetas navideñas y cuenta regresiva

1. Abre Tarjeta Navidad desde el centro de actividades.
2. Elige uno de los 25 diseños o utiliza el diseño automático del día.
3. Escribe un nombre y personaliza la frase cuando corresponda.
4. Revisa los días, horas, minutos y segundos que faltan para Navidad.
5. Descarga la imagen o genera un video con la música seleccionada. Usa la opción de compartir o descarga y adjunta el archivo.

La cuenta regresiva usa la fecha y zona horaria del dispositivo. El 25 de diciembre celebra Navidad y después cambia al siguiente año. Las tarjetas descargadas conservan la fecha y el contador del momento de creación: un PNG o MP4 ya descargado no se actualiza solo.

Las tarjetas en imagen se generan en 1080 x 1920. Sus videos se exportan en 720 x 1280 a 24 fotogramas por segundo. La duración depende de la pista seleccionada; con la opción sin música se usa el video silencioso de 15 segundos. Consulta christmas-cards.js para modificar este comportamiento.

También hay tarjetas de felicitación, tarjetas de la lista, invitaciones de cumpleaños y tarjetas con QR. En una tarjeta QR se introduce la URL del video que se desea abrir: el QR no aloja ni sube el video.

## 7. Preguntas, niveles y certificados

1. Entra en Juega, escribe el nombre y selecciona nivel y categoría.
2. El banco contiene 1.500 preguntas en tres niveles. Las categorías incluyen Navidad, renos, duendes, ciudades, tradiciones, razonamiento matemático y verbal, Biblia, ciencias, geografía, historia, vida cotidiana y cultura general.
3. Elige una ronda o la práctica continua. Cada bloque tiene diez preguntas.
4. Con el temporizador activado dispones de 15 segundos por respuesta. El indicador cambia de verde hacia rojo al acercarse el límite.
5. Después de responder o agotar el tiempo se muestra la respuesta correcta y su explicación.
6. Al terminar se genera el certificado personalizado, con descarga y opciones de compartir.

Aciertos en el bloque | Resultado
0 a 5 | Certificado de esfuerzo y mensaje de ánimo
6 | Certificado de avance
7 a 10 | Felicitación y opción de preparar un mensaje a Santa

La práctica continua conserva un historial local y, al agotarse el banco compatible, añade variantes generadas con reglas de razonamiento y cálculo. No significa que exista una biblioteca externa infinita de preguntas nuevas en todas las materias ni una IA generativa conectada.

El progreso se conserva en el almacenamiento local de ese navegador. Borrar los datos del sitio elimina ese historial. El banco completo puede consultarse en catalogos/Preguntas_1500.csv.

## 8. Cuentos y libros para colorear

1. En Cuentos elige uno de los 30 títulos y completa nombre, edad, ciudad y personaje.
2. Abre el cuento, recorre sus páginas y elige entre las decisiones ofrecidas.
3. Usa el narrador si tu navegador dispone de una voz en español y descarga el cuento en PDF.
4. En Colorear elige un título de la lista de 30 libros y escribe el nombre del niño o niña.
5. Genera el libro y descarga sus seis páginas personalizadas. Si cambias el nombre, vuelve a generar la descarga.

Los cuentos utilizan plantillas originales e ilustraciones preparadas de estilo fotográfico. No se consultan modelos de IA para generar nuevas fotografías en cada uso. La narración de los cuentos utiliza las voces disponibles en el dispositivo; la muestra grabada de Santa no convierte automáticamente cualquier texto a esa misma voz.

Hay diez libros iniciales y veinte títulos incorporados desde la colección de 120 páginas. Los veinte se separaron por su título y conservan seis páginas cada uno. En sus PDF se rellena el espacio original «Mi nombre» y el archivo descargado incluye el nombre. Las láminas se entregan en imágenes WebP optimizadas dentro de assets/colorear/; el usuario obtiene su PDF al generarlo.

En total son 30 libros de seis páginas, equivalentes a 180 páginas. Consulta los títulos y cuentos en catalogos/Libros_para_colorear_30.csv y catalogos/Cuentos_30.csv.

## 9. Editor y publicación en redes

1. Abre Editor de videos o pulsa Editar este video después de generar uno en la app.
2. Carga un video compatible de hasta 300 MB. Puedes seleccionar un fragmento de hasta diez minutos.
3. Ajusta inicio y final, formato vertical, cuadrado, horizontal o adaptado al original.
4. Añade un texto, regula el volumen de la pista original y elige música del catálogo o un audio propio de hasta 40 MB.
5. Genera el MP4, revisa el resultado y descárgalo. Si modificas un ajuste, crea una nueva exportación.
6. Usa Compartir en TikTok, WhatsApp, Instagram, Facebook u otras redes. Completa el envío o la publicación en la aplicación elegida.

Compartir utiliza el menú nativo de archivos cuando el navegador lo admite. Si no lo admite, la app descarga el MP4 para adjuntarlo manualmente. No publica automáticamente en ninguna cuenta social y no contiene credenciales de TikTok ni de WhatsApp.

Los nombres, fotos, videos y mezclas se procesan en el navegador. Cerrar o recargar la pestaña puede eliminar el material todavía no descargado. Un equipo con poca RAM puede necesitar archivos más cortos. Mantén una copia de los originales antes de editar.

## 10. Llamadas de Santa: funcionamiento y pendiente

La sección Llamadas de Santa está junto al editor. Incluye los dos mensajes originales de Santa, una misma voz de duende en ambos y las músicas A Quiet Christmas Miracle y A Christmas Orchestral. El selector tiene códigos de 245 países y territorios compatibles con la validación telefónica.

1. Escribe un nombre con grabación y elige uno de los dos saludos.
2. Para la prueba local pulsa Escuchar prueba personalizada.
3. Escucha al duende y pulsa el botón 1 o la tecla 1 del teclado.
4. La prueba cambia a Santa: «Hola» + nombre elegido + mensaje, con la música de ese saludo.
5. El botón Llamar al celular solo puede iniciar una llamada real cuando exista un servicio telefónico conectado. En esta versión aparece pendiente de activación.

El número solicitado como emisor es +51 917 823 560, de Claro Perú. No está verificado ni conectado como emisor automático. El plan móvil ilimitado no quedó enlazado al servidor. Esta entrega no realiza llamadas reales, no detecta una tecla de un teléfono externo y no inicia videollamadas en vivo mientras no se active el servicio.

La parte preparada está en app/services/llamadas/: un adaptador Worker para Twilio con recepción de teclas DTMF y validación de firmas. No es una conexión directa a la SIM de Claro. Los costos y la cobertura del servicio telefónico se configuran por separado.

Lee la página siguiente y el README de ese servicio antes de habilitarlo. Nunca escribas credenciales telefónicas en dist/, en el ZIP público ni en una conversación.

## 11. Activar el servicio telefónico con un técnico

1. Configura una cuenta de telefonía compatible con el adaptador, saldo y un número emisor admitido o verificado. Confirma los destinos y permisos internacionales.
2. En Cloudflare crea un espacio KV y añade su identificador en services/llamadas/wrangler.toml con el binding CALLS_KV.
3. Configura en el servidor los secretos TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER y CALL_ACCESS_CODE. El código de acceso debe tener al menos 16 caracteres.
4. Ajusta ALLOWED_ORIGIN y ASSET_ORIGIN al dominio HTTPS de tu web. PUBLIC_ORIGIN es opcional y, si se usa, debe ser la URL final HTTPS del servicio.
5. Despliega el Worker desde app/services/llamadas. Comprueba que su ruta /ready devuelve enabled: true.
6. Coloca únicamente la URL HTTPS del servicio en app/dist/calls-config.js, en endpoint, y publica de nuevo la web. Las claves no van en ese archivo.
7. Haz una prueba autorizada a un número propio. Escucha al duende, pulsa 1 desde el teléfono y comprueba que Santa saluda con el nombre correcto.

El adaptador envía la llamada desde el servidor. Cuando recibe la respuesta del operador, el flujo /voice/start reproduce al duende dentro de una solicitud de una tecla. /voice/accept solo entrega el mensaje de Santa si llega Digits=1; otras respuestas terminan la llamada. /voice/status recibe sus estados reales.

Los callbacks requieren la firma HMAC-SHA1 estándar de Twilio. Las modalidades nuevas de firmas compartidas se rechazan por defecto hasta adaptar su validación. El número del destinatario no se guarda en KV ni en las URL de callback. El límite por IP de cinco solicitudes por día es una protección de mejor esfuerzo y no un límite de facturación.

```text
cd app
node services/llamadas/worker.test.mjs
```

La prueba anterior usa un operador simulado y no hace ninguna llamada real. Las instrucciones del proveedor pueden cambiar; revisa la documentación oficial enlazada en services/llamadas/README.md al realizar la activación.

## 12. Estructura técnica y sincronización final

Ruta en app/ | Responsabilidad
dist/index.html / styles.css | Interfaz, estilos y carga ordenada de scripts
dist/data.js / app.js | Catálogo, pedidos y WhatsApp
dist/list-video.js | Cinco fondos en movimiento; video de 12 s
dist/santa-list.js | Galería de 40 escenas; video de 15 s
dist/list-speech.js | Pista unida y tiempos exactos de ambas listas
dist/stardust-reveal.js | Letras de estrellas y marco de foto/video
dist/name-audio-data.js | Catálogo de 864 grabaciones y alias
dist/magic.js / content.js | Tarjetas, cuentos, PDF, juegos y libros
dist/coloring-collection.js | 20 libros nuevos añadidos a los 10 iniciales
dist/quiz-data.js / quiz-continuous.js | Banco de preguntas y variantes continuas
dist/christmas-cards.js | 25 tarjetas navideñas y sus exportaciones
dist/video-editor.js / video-sharing.js | Edición y compartir archivos
dist/calls.js / call-audio.mjs | Interfaz y mezcla de llamadas de prueba
dist/assets/ / dist/vendor/ | Medios, fuentes, librerías y sus licencias
services/llamadas/ | Adaptador telefónico separado, aún inactivo

Carga name-audio-data.js antes de list-speech.js y ambos antes de los dos estudios. No vuelvas a fijar el revelado en el segundo 5: cada anuncio tiene su duración real. Conserva el anuncio completo, una pausa de 1.764 muestras a 44.100 Hz (0,04 s) y solo el nombre seleccionado. El silencio inicial del nombre se elimina usando su metadato lead.

La vista previa sigue el reloj del audio, por lo que una pausa de carga no adelanta las letras. La exportación usa la misma pista y los mismos tiempos. El renderizado immediate hace visible la forma del nombre en polvo de estrellas al terminar «es» y la vuelve opaca y legible durante el revelado.

## 13. Mantener y publicar sin perder recursos

1. Guarda este ZIP como respaldo completo y trabaja sobre una copia extraída.
2. Para cambiar saludos o precios edita data.js; para nombres modifica name-audio-data.js y añade su WAV real en assets/nombres/.
3. Para añadir un nombre, utiliza una grabación aislada del nombre completo: WAV PCM mono, 16 bits, 44.100 Hz. Completa nombre, género del anuncio, ruta, duración y lead. No pegues una lista entera de voces como si fuera un nombre.
4. Para cambiar música actualiza music-data.js y su archivo; para tarjetas y escenas actualiza sus catálogos manteniendo rutas e identificadores coherentes.
5. Para editar preguntas revisa quiz-data.js y las opciones correctas e incorrectas. Para libros actualiza la definición, sus seis páginas o la lámina atlas correspondiente.
6. Prueba la web con HTTP local y después sube el contenido de app/dist/ a un alojamiento estático HTTPS. Conserva todas las rutas y los dos fragmentos core-1.bin y core-2.bin del exportador.
7. El archivo app/.openai/hosting.json pertenece al sitio de este proyecto. Si vas a crear un proyecto distinto en otra plataforma, configura su identidad de despliegue en lugar de reutilizar ese identificador por error.

```text
cd app
node scripts/list-speech.test.mjs
node services/llamadas/worker.test.mjs
```

La entrega conserva el código exacto de la versión 21 y sus licencias. El README original de app/ contiene historial de desarrollo y algunas descripciones antiguas; para el estado final de la sincronización y sus funciones utiliza esta guía y los archivos actuales.

No hay pasarela de pago, cuentas de clientes, base de datos de pedidos, generación de IA en tiempo real ni publicación automática en redes. Esas integraciones serían desarrollos posteriores. La prueba telefónica es local hasta que un técnico conecte y active su servidor.

## 14. Soluciones rápidas y comprobaciones realizadas

Problema | Qué revisar
La página se abrió como file:// | Inicia el servidor HTTP y abre 127.0.0.1:8080.
Un nombre no se pronuncia | Busca una coincidencia en los 864 nombres; no hay voz sintética de respaldo.
Sigue saliendo un video antiguo | Recarga y genera de nuevo. Los MP4 ya descargados no se corrigen solos.
No se genera el MP4 | Espera a que carguen escena y archivos; cancela, reduce el archivo y vuelve a intentar.
No se abre una red directamente | Descarga el MP4 y adjúntalo; el menú depende del navegador y dispositivo.
WhatsApp no incluye el pedido | Copia el texto antes de abrir w.app y pégalo en el chat.
El cuento no usa la voz de Santa | Su narrador usa las voces del dispositivo; la muestra de Santa es fija.
El contador descargado no cambia | Se conserva el instante de exportación; genera la tarjeta del nuevo día.
No entra una llamada al celular | El servicio telefónico sigue pendiente; la prueba no marca números.

Validación de esta versión: 864 grabaciones y 1.728 combinaciones con los dos anuncios; conservación del anuncio y uso exclusivo del nombre elegido; ningún nombre excede el video más corto. Se comprobaron descargas MP4 de Mateo (12 segundos) y Jazmin (15 segundos), su alineación de audio y la aparición de las letras después de «es». Las pruebas del adaptador de llamadas usaron un operador simulado.

Para comprobar la integridad del paquete, consulta INVENTARIO_ARCHIVOS.csv y su SHA-256 por archivo. VERSION_FINAL.json identifica versión, commit y cantidades. El archivo SHA256_DEL_ZIP.txt contiene la huella del ZIP y se entrega por separado para no crear una referencia circular.

## 15. Los 30 libros disponibles

- 1. La aldea nevada - 6 páginas
- 2. Los renos de Santa - 6 páginas
- 3. El taller de juguetes - 6 páginas
- 4. La estrella viajera - 6 páginas
- 5. Santa y sus cartas - 6 páginas
- 6. El tren de Navidad - 6 páginas
- 7. Los amigos del bosque - 6 páginas
- 8. El árbol de los deseos - 6 páginas
- 9. La cocina de Nina - 6 páginas
- 10. Los duendes sin barba - 6 páginas
- 11. Caperucita Roja - 6 páginas
- 12. Los tres cerditos - 6 páginas
- 13. Cenicienta - 6 páginas
- 14. La liebre y la tortuga - 6 páginas
- 15. Rapunzel - 6 páginas
- 16. La sirenita - 6 páginas
- 17. La bella durmiente - 6 páginas
- 18. La Bella y la Bestia - 6 páginas
- 19. La cigarra y la hormiga - 6 páginas
- 20. Pinocho - 6 páginas
- 21. Hansel y Gretel - 6 páginas
- 22. El gato con botas - 6 páginas
- 23. El patito feo - 6 páginas
- 24. Jack y las habichuelas mágicas - 6 páginas
- 25. El mago de Oz - 6 páginas
- 26. Guerreras K-pop: estrellas del escenario - 6 páginas
- 27. Guerreras K-pop: magia y valentía - 6 páginas
- 28. Guerreras K-pop: amistad y aventuras - 6 páginas
- 29. Guerreras K-pop: mascotas mágicas - 6 páginas
- 30. Guerreras K-pop: concierto de Navidad - 6 páginas

## 16. Catálogo de saludos incluido

- El sendero maravilloso de los animales - S/ 5 / US$ 2
- El laboratorio secreto - S/ 5 / US$ 2
- La búsqueda del tesoro - S/ 5 / US$ 2
- ¡Es hora de probar los juguetes! - S/ 5 / US$ 2
- Visita la gran biblioteca - S/ 5 / US$ 2
- Aventura interactiva - S/ 5 / US$ 2
- Una pequeña actualización con Santa - S/ 5 / US$ 2
- En la oficina de correos - S/ 5 / US$ 2
- ¿Y tu gran libro? - S/ 5 / US$ 2
- Regalo especial listo - S/ 5 / US$ 2
- Solo para un grupo de niños y niñas - S/ 5 / US$ 2
- El regalo desaparecido - S/ 5 / US$ 2
- La nueva máquina de envolver - S/ 5 / US$ 2
- La habitación secreta de Papá Noel - S/ 5 / US$ 2
- Preparándose - S/ 5 / US$ 2
- ¿Cómo te has portado? - S/ 3 / US$ 1
- ¿Estás en el camino correcto? - S/ 3 / US$ 1
- ¿Cómo se han portado? - S/ 3 / US$ 1
- Para los más pequeñitos de 1 a 3 años - S/ 3 / US$ 1
- Para los más pequeños - S/ 3 / US$ 1
- Especialmente para un grupo - S/ 3 / US$ 1
- Para niños y niñas pequeños - S/ 3 / US$ 1
- Para niños con mascotas - S/ 3 / US$ 1
- Compañeros para toda la vida - S/ 3 / US$ 1
- Un momento con Santa - S/ 3 / US$ 1
- ¡Una explosión de deseos! - S/ 3 / US$ 1
- Un dulce cumpleaños - S/ 3 / US$ 1
- Una fiesta alegre - S/ 3 / US$ 1
- ¡Feliz cumpleaños! A partir de 5 años - S/ 3 / US$ 1
- Un cumpleaños estrellado - S/ 3 / US$ 1
- Se necesita una pequeña charla con Santa - S/ 3 / US$ 1
- ¡Sabemos que te has portado bien! - S/ 3 / US$ 1
- ¿Te estás portando bien? - S/ 3 / US$ 1
- ¿Problemas para compartir? - S/ 3 / US$ 1
- Hagan su mejor esfuerzo - S/ 3 / US$ 1
- Santa está muy orgulloso - S/ 3 / US$ 1
- ¡Sigue haciéndolo así de bien! - S/ 3 / US$ 1
- Sobresalir en los estudios - S/ 3 / US$ 1
- Un nuevo comienzo - S/ 3 / US$ 1
- Regreso a la escuela - S/ 3 / US$ 1
- Halloween divertido - S/ 3 / US$ 1
- ¡Alguien los quiere! - S/ 3 / US$ 1
- San Valentín - S/ 3 / US$ 1
- Trabajando en tus regalos - S/ 3 / US$ 1
- La estrella polar - S/ 3 / US$ 1
- Santa vio sus listas de deseos - S/ 3 / US$ 1
- En vivo desde el trineo - S/ 3 / US$ 1
- ¡Estamos a una noche de Navidad! - S/ 3 / US$ 1
- Misión cumplida - S/ 3 / US$ 1
- Un Año Nuevo lleno de amor - S/ 3 / US$ 1
- ¿En la lista de los buenos? - S/ 3 / US$ 1
- Tus mejores deseos - S/ 3 / US$ 1
- Solo para adultos - S/ 3 / US$ 1
- Entrega de regalos de Santa - S/ 5 / US$ 2

Los nombres exactos y las categorías del catálogo se conservan en Saludos_54.csv y app/dist/data.js. La entrega documenta el catálogo existente; las escenas del catálogo son referencias de los saludos que se coordinan con el responsable.
