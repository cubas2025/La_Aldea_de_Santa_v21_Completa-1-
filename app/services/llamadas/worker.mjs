// Optional, separately deployed telephony service. It is not an active phone service until configured.
import phone from '../../../vendor/libphonenumber-max.js';
import {prepareCall,findName,CALL_PROFILES} from '../../../call-audio.mjs';
const DEFAULT_ORIGIN='https://la-aldea-de-santa.orangemirth32.chatgpt.site';
const xmlEscape=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store'}});
const xml=s=>new Response('<?xml version="1.0" encoding="UTF-8"?><Response>'+s+'</Response>',{headers:{'Content-Type':'application/xml;charset=utf-8','Cache-Control':'no-store'}});
const enabled=env=>!!(env.TWILIO_ACCOUNT_SID&&env.TWILIO_AUTH_TOKEN&&env.TWILIO_FROM_NUMBER&&env.CALL_ACCESS_CODE?.length>=16&&env.CALLS_KV);
const hex=a=>[...new Uint8Array(a)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function equal(a,b){const digest=async s=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));const [x,y]=await Promise.all([digest(a),digest(b)]);let n=0;for(let i=0;i<x.length;i++)n|=x[i]^y[i];return n===0;}
async function authorized(request,env){return env.CALL_ACCESS_CODE?.length>=16&&await equal(request.headers.get('Authorization')||'','Bearer '+env.CALL_ACCESS_CODE);}
export async function twilioSignature(url,params,token){let data=url;for(const key of [...new Set([...params.keys()])].sort())for(const value of [...new Set(params.getAll(key))].sort())data+=key+value;const secret=await crypto.subtle.importKey('raw',new TextEncoder().encode(token),{name:'HMAC',hash:'SHA-1'},false,['sign']);const sig=new Uint8Array(await crypto.subtle.sign('HMAC',secret,new TextEncoder().encode(data)));return btoa(String.fromCharCode(...sig));}
async function verified(request,params,env){if(request.headers.has('X-Twilio-Webhooks-Signature-Settings'))return false;const received=request.headers.get('X-Twilio-Signature');return !!received&&await equal(received,await twilioSignature(request.url,params,env.TWILIO_AUTH_TOKEN));}
async function catalog(env,fetcher){const origin=env.ASSET_ORIGIN||DEFAULT_ORIGIN,r=await fetcher(origin+'/name-audio-data.js');if(!r.ok)throw new Error('No se pudo cargar el catálogo de nombres.');const body=await r.text(),match=body.match(/window\.SANTA_NAME_AUDIO=(\[.*\]);/s);if(!match)throw new Error('Catálogo no válido.');return JSON.parse(match[1]);}
async function callState(env,id){if(!/^[a-f0-9-]{36}$/.test(id||''))return null;const s=await env.CALLS_KV.get('call:'+id,'json');return s&&s.createdAt>Date.now()-3600000?s:null;}
async function storeState(env,id,state){await env.CALLS_KV.put('call:'+id,JSON.stringify(state),{expirationTtl:3600});}
export async function handle(request,env,fetcher=fetch){
 const u=new URL(request.url),origin=request.headers.get('Origin'),allowed=env.ALLOWED_ORIGIN||DEFAULT_ORIGIN;
 if(origin&&origin!==allowed)return json({error:'Origen no autorizado.'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Headers':'Authorization,Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Vary':'Origin'}});
 let response;try{response=await route(request,env,fetcher,u);}catch{response=json({error:'El servicio no pudo completar esta solicitud. No vuelvas a marcar hasta revisar el estado.'},500);}
 if(origin===allowed){response=new Response(response.body,response);response.headers.set('Access-Control-Allow-Origin',allowed);response.headers.set('Vary','Origin');}return response;
}
async function route(request,env,fetcher,u){
 if(u.pathname==='/ready')return json({enabled:enabled(env),requiresAccessCode:true});
 if(!enabled(env))return json({error:'El servicio telefónico está pendiente de activación.'},503);
 if(u.pathname==='/calls'&&request.method==='POST'){
  if(!await authorized(request,env))return json({error:'Código de llamada no válido.'},401);
  if(Number(request.headers.get('Content-Length')||0)>4096)return json({error:'Solicitud demasiado grande.'},413);
  const body=await request.text();if(body.length>4096)return json({error:'Solicitud demasiado grande.'},413);let data;try{data=JSON.parse(body);}catch{return json({error:'Datos no válidos.'},400);}
  const parsed=phone.parsePhoneNumberFromString(String(data.to||''));if(!parsed?.isValid()||parsed.number!==data.to||data.consent!==true)return json({error:'Número o autorización no válidos.'},400);
  const profile=CALL_PROFILES.find(p=>p.id===data.profile),names=await catalog(env,fetcher),name=findName(names,String(data.name||''));if(!profile||!name)return json({error:'Elige un nombre grabado y uno de los dos saludos.'},400);
  // The access code is mandatory; KV limits are an additional best-effort safeguard, not a billing cap.
  const day=new Date().toISOString().slice(0,10),ip=hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode((request.headers.get('CF-Connecting-IP')||'unknown')+day+env.CALL_ACCESS_CODE))),key='rate:'+ip,count=Number(await env.CALLS_KV.get(key)||0),limit=Number(env.MAX_CALLS_PER_DAY||5);if(count>=limit)return json({error:'Se alcanzó el límite de llamadas de hoy.'},429);await env.CALLS_KV.put(key,String(count+1),{expirationTtl:86400});
  const id=crypto.randomUUID(),state={name:name.name,profile:profile.id,createdAt:Date.now(),status:'queued',sid:null};await storeState(env,id,state);const base=env.PUBLIC_ORIGIN||u.origin;
  const params=new URLSearchParams({To:parsed.number,From:env.TWILIO_FROM_NUMBER,Url:base+'/voice/start?id='+id,Method:'POST',StatusCallback:base+'/voice/status?id='+id,StatusCallbackMethod:'POST',Timeout:'25',TimeLimit:'120'});for(const event of ['initiated','ringing','answered','completed'])params.append('StatusCallbackEvent',event);
  let result;try{result=await fetcher(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(env.TWILIO_ACCOUNT_SID)}/Calls.json`,{method:'POST',headers:{Authorization:'Basic '+btoa(env.TWILIO_ACCOUNT_SID+':'+env.TWILIO_AUTH_TOKEN),'Content-Type':'application/x-www-form-urlencoded'},body:params.toString(),signal:AbortSignal.timeout(15000)});}catch{state.status='pending';await storeState(env,id,state);return json({id,status:'pending'},202);}
  if(!result.ok){state.status='failed';await storeState(env,id,state);return json({error:'El operador rechazó la llamada. Revisa el número emisor, el saldo y los destinos habilitados.'},502);}const value=await result.json();state.sid=value.sid;state.status=value.status||'queued';await storeState(env,id,state);return json({id,status:state.status},202);
 }
 if(u.pathname.startsWith('/calls/')&&request.method==='GET'){if(!await authorized(request,env))return json({error:'No autorizado.'},401);const s=await callState(env,u.pathname.split('/').pop());return s?json({status:s.status}):json({error:'Solicitud no encontrada.'},404);}
 if(u.pathname.startsWith('/voice/')&&request.method==='POST'){
  const params=new URLSearchParams(await request.text());if(!await verified(request,params,env))return json({error:'Firma no válida.'},403);const id=u.searchParams.get('id'),state=await callState(env,id);if(!state)return xml('<Hangup/>');if(state.sid&&params.get('CallSid')!==state.sid)return json({error:'Llamada no válida.'},403);const base=env.PUBLIC_ORIGIN||u.origin;
  if(u.pathname==='/voice/start')return xml(`<Gather input="dtmf" numDigits="1" timeout="10" action="${xmlEscape(base+'/voice/accept?id='+id)}" method="POST"><Play>${xmlEscape(base+'/audio/intro?id='+id)}</Play></Gather><Hangup/>`);
  if(u.pathname==='/voice/accept'){if(params.get('Digits')!=='1')return xml('<Hangup/>');state.status='accepted';await storeState(env,id,state);return xml(`<Play>${xmlEscape(base+'/audio/santa?id='+id)}</Play><Hangup/>`);}
  if(u.pathname==='/voice/status'){const status=params.get('CallStatus');if(['queued','initiated','ringing','answered','in-progress','completed','busy','failed','no-answer','canceled'].includes(status)){if(state.status!=='accepted'||!['answered','in-progress'].includes(status))state.status=status==='in-progress'?'answered':status;await storeState(env,id,state);}return new Response(null,{status:204});}
 }
 if(['/audio/intro','/audio/santa'].includes(u.pathname)&&request.method==='GET'){
  const state=await callState(env,u.searchParams.get('id'));if(!state)return json({error:'Audio no disponible.'},404);const names=await catalog(env,fetcher),name=findName(names,state.name),call=await prepareCall(name,state.profile,(env.ASSET_ORIGIN||DEFAULT_ORIGIN)+'/',fetcher,8000);return new Response(u.pathname.endsWith('intro')?call.intro:call.santa,{headers:{'Content-Type':'audio/wav','Cache-Control':'private,max-age=60','X-Content-Type-Options':'nosniff'}});
 }
 return json({error:'Ruta no encontrada.'},404);
}
export default {fetch(request,env){return handle(request,env);}};
