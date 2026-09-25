import Stripe from 'stripe';
import {withState} from '@/lib/db';
import {applyPaymentEvent} from '@/lib/payments';
export async function POST(req:Request){
 if(!process.env.STRIPE_SECRET_KEY||!process.env.STRIPE_WEBHOOK_SECRET)return Response.json({error:'Not configured.'},{status:503});
 const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);let event:Stripe.Event;
 try{event=stripe.webhooks.constructEvent(await req.text(),req.headers.get('stripe-signature')??'',process.env.STRIPE_WEBHOOK_SECRET);}catch{return Response.json({error:'Invalid signature.'},{status:400});}
 try{await withState(s=>applyPaymentEvent(s,event));return Response.json({received:true});}catch{return Response.json({error:'Could not process event.'},{status:500});}
}
