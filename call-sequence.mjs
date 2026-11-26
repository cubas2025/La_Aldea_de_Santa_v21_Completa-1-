/* Secuencia de audio de la llamada de Santa (la usan la prueba de la web y la llamada real).
   Se reproduce SIEMPRE en este orden: 1) duende, 2) primer audio de Santa, 3) segundo audio de Santa.
   Para cambiar un audio: reemplaza el archivo con el mismo nombre en assets/llamadas/
   (WAV o MP3), o cambia aquí la ruta. Para la llamada real, el archivo debe estar publicado
   en la web (Twilio lo descarga desde tu dominio). */
export const CALL_SEQUENCE = [
  { id: 'duende',  src: 'assets/llamadas/duende.wav',  label: 'El duende anuncia la llamada desde el Polo Norte' },
  { id: 'santa-1', src: 'assets/llamadas/santa-1.wav', label: 'Santa · primer mensaje' },
  { id: 'santa-2', src: 'assets/llamadas/santa-2.wav', label: 'Santa · segundo mensaje' }
];
