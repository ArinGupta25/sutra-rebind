import {randomUUID} from 'node:crypto';
import {accountId,apiError,jsonBody,sameOrigin} from '@/lib/session';
import {rateLimit,withState} from '@/lib/db';
import {applicationSchema,bookingSchema,contactSchema,notificationSchema,tradeSchema} from '@/lib/validation';
import {events,slots,estimateCoins} from '@/lib/catalog';
export async function POST(req:Request){try{
 sameOrigin(req);const id=await accountId();if(!id)throw new Error('Session not available. Please refresh.');
 const body=await jsonBody(req);const schema={contact:contactSchema,notification:notificationSchema,trade:tradeSchema,booking:bookingSchema,application:applicationSchema}[body.kind as string];
 if(!schema)return Response.json({error:'Unknown form.'},{status:400});
 const data=schema.parse(body.data) as Record<string,unknown>;
 const result=await withState(state=>{
   rateLimit(state,id+':forms',20);
   if(body.kind==='booking'){
     const event=events.find(e=>e.id===data.eventId);
     if(!event||!slots.includes(String(data.slot)))throw new Error('That slot is not available.');
     if(Date.parse(`${event.date}T${data.slot}:00+05:30`)<Date.now())throw new Error('Please select a future slot.');
     if(state.submissions.some(s=>s.kind==='booking'&&s.status!=='cancelled'&&s.data.eventId===data.eventId&&s.data.slot===data.slot))throw new Error('That slot has already been reserved. Please choose another.');
     data.city=event.city;data.date=event.date;
   }
   if(body.kind==='trade')data.estimate=estimateCoins(String(data.material),String(data.condition),Number(data.weight));
   const entry={demo:process.env.PAYMENTS_MODE!=='live',id:randomUUID(),accountId:id,kind:String(body.kind),created:new Date().toISOString(),status:'received',data};
   state.submissions.unshift(entry);return {id:entry.id,status:entry.status};
 });return Response.json(result,{status:201});
 }catch(e){return apiError(e);}}
export async function GET(req:Request){try{const eventId=new URL(req.url).searchParams.get('event');if(!events.some(e=>e.id===eventId))return Response.json({error:'Event not found.'},{status:404});return Response.json(await withState(s=>({booked:s.submissions.filter(e=>e.kind==='booking'&&e.status!=='cancelled'&&e.data.eventId===eventId).map(e=>e.data.slot)})));}catch(e){return apiError(e);}}
