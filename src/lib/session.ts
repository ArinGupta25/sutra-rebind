import {cookies} from 'next/headers';
import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
const sign=(value:string)=>{if(!process.env.AUTH_SECRET)throw new Error('SESSION_UNAVAILABLE');return createHmac('sha256',process.env.AUTH_SECRET).update(value).digest('hex');};
export async function accountId(create=false){
 const jar=await cookies();const value=jar.get('sutra_session')?.value;
 if(value){const [id,sig]=value.split('.');if(/^[a-f0-9-]{36}$/.test(id??'')&&/^[a-f0-9]{64}$/.test(sig??'')&&timingSafeEqual(Buffer.from(sig),Buffer.from(sign(id))))return id;}
 if(!create)return null;
 const id=randomUUID();jar.set('sutra_session',`${id}.${sign(id)}`,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*90});return id;
}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(!origin)return;const host=req.headers.get('host');if(origin!==new URL(req.url).origin&&origin!==process.env.NEXT_PUBLIC_SITE_URL&&new URL(origin).host!==host)throw new Error('Request origin is not allowed.');}
export async function jsonBody(req:Request){if(Number(req.headers.get('content-length')??0)>20000)throw new Error('Request is too large.');const text=await req.text();if(text.length>20000)throw new Error('Request is too large.');return JSON.parse(text);}
export function apiError(error:unknown){
 const message=error instanceof Error?error.message:'Request failed.';
 if(message==='DATABASE_UNAVAILABLE'||message==='SESSION_UNAVAILABLE'||message.includes('relation "sutra_state"'))return Response.json({error:'The service is being connected. Please use WhatsApp for help; your request has not been saved.'},{status:503});
 if(error&&typeof error==='object'&&'issues' in error){const issues=(error as {issues:{message:string}[]}).issues;return Response.json({error:issues[0]?.message??'Please check the form.'},{status:400});}
 if(message.includes('Too many requests'))return Response.json({error:message},{status:429});
 if(/stock|slot|future|not allowed|already|not found|empty|Payment|expired|available|large/.test(message))return Response.json({error:message},{status:400});
 console.error('Sutra API error:',error instanceof Error?error.name:'unknown');
 return Response.json({error:'We could not complete that request. Please try again.'},{status:500});
}
export async function isAdmin(){const token=(await cookies()).get('sutra_admin')?.value;if(!token)return false;const [expires,sig]=token.split('.');const time=Number(expires);return Number.isFinite(time)&&time>Date.now()&&time<=Date.now()+3600000&&/^[a-f0-9]{64}$/.test(sig??'')&&timingSafeEqual(Buffer.from(sig),Buffer.from(sign('admin:'+expires)));}
export async function adminLogin(secret:string){const expected=process.env.ADMIN_SECRET;if(!expected||Buffer.byteLength(secret)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(secret),Buffer.from(expected)))return false;const expires=String(Date.now()+3600000);(await cookies()).set('sutra_admin',`${expires}.${sign('admin:'+expires)}`,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:3600});return true;}
