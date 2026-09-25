import {cookies} from 'next/headers';
import {z} from 'zod';
import {createHash} from 'node:crypto';
import {adminLogin,isAdmin,sameOrigin,jsonBody,apiError} from '@/lib/session';
import {withState,rateLimit,adjustWallet} from '@/lib/db';
export async function GET(){try{if(!await isAdmin())return Response.json({error:'Studio sign-in required.'},{status:401});return Response.json(await withState(s=>({orders:s.orders,submissions:s.submissions,stock:s.stock,accounts:Object.keys(s.accounts).length})),{headers:{'Cache-Control':'no-store'}});}catch(e){return apiError(e);}}
export async function POST(req:Request){try{sameOrigin(req);const body=await jsonBody(req);if(body.action==='login'){
 const ip=createHash('sha256').update(req.headers.get('x-forwarded-for')?.split(',')[0]??'local').digest('hex');await withState(s=>rateLimit(s,'admin-login:'+ip,10));
 const valid=await adminLogin(z.string().min(1).max(200).parse(body.secret));return Response.json(valid?{ok:true}:{error:'Incorrect studio access key.'},{status:valid?200:401});
 }
 if(!await isAdmin())return Response.json({error:'Studio sign-in required.'},{status:401});
 if(body.action==='logout'){(await cookies()).delete('sutra_admin');return Response.json({ok:true});}
 if(body.action==='review'){
  const data=z.object({id:z.uuid(),status:z.enum(['reviewed','accepted','cancelled']),coins:z.number().int().min(0).max(10000).default(0)}).parse(body);
  await withState(s=>{const item=s.submissions.find(x=>x.id===data.id);if(!item)throw new Error('Request not found.');if(item.status==='accepted')throw new Error('This request was already accepted.');if(data.status==='accepted'&&item.kind==='trade'){const account=s.accounts[item.accountId];adjustWallet(account,data.coins,`Trade-in approved · ${item.id.slice(0,8)}`,item.demo??true);item.data.awardedCoins=data.coins;}item.status=data.status;});return Response.json({ok:true});
 }
 return Response.json({error:'Unknown action.'},{status:400});
 }catch(e){return apiError(e);}}
