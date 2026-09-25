import Stripe from 'stripe';
import {randomUUID} from 'node:crypto';
import {accountId,apiError,jsonBody,sameOrigin} from '@/lib/session';
import {withState,rateLimit,Order,walletBalance,adjustWallet} from '@/lib/db';
import {checkoutSchema} from '@/lib/validation';
import {getProduct,totals} from '@/lib/catalog';
export async function POST(req:Request){try{
 sameOrigin(req);const account=(await accountId())!;if(!account)throw new Error('Session not available. Please refresh.');const body=checkoutSchema.parse(await jsonBody(req));const demo=process.env.PAYMENTS_MODE!=='live';
 if(!demo&&(!process.env.STRIPE_SECRET_KEY||!process.env.STRIPE_WEBHOOK_SECRET))throw new Error('Payment setup is not available yet.');
 const order=await withState(s=>{
  const existing=s.orders.find(o=>o.accountId===account&&o.requestId===body.requestId);if(existing)return existing;
  rateLimit(s,account+':checkout',10);const a=s.accounts[account];if(!a)throw new Error('Session not available. Please refresh.');
  const grouped=new Map<string,{id:string;size:string;quantity:number;name:string;price:number}>();
  for(const item of body.items){const p=getProduct(item.id);if(!p)throw new Error('Product not found.');const key=`${item.id}:${item.size}`;const previous=grouped.get(key);grouped.set(key,{...item,name:p.name,price:p.price,quantity:item.quantity+(previous?.quantity??0)});}
  const items=[...grouped.values()];for(const item of items)if(item.quantity>5||(s.stock[`${item.id}:${item.size}`]??0)<item.quantity)throw new Error(`${item.name}: not enough stock in size ${item.size}.`);
  const price=totals(items.reduce((n,i)=>n+i.quantity*i.price,0),walletBalance(a,demo),body.useCoins);
  const o:Order={id:randomUUID(),accountId:account,requestId:body.requestId,status:demo?'demo':'pending',created:new Date().toISOString(),expires:Date.now()+24*60*60000,items,...price,customer:body.customer,demo};
  if(!demo)for(const i of items)s.stock[`${i.id}:${i.size}`]-=i.quantity;
  adjustWallet(a,-price.redeemed,`${demo?'Demo order':'Checkout reservation'} ${o.id.slice(0,8)}`,demo);
  s.orders.unshift(o);return o;
 });
 if(order.demo||order.status==='paid')return Response.json({orderId:order.id,url:`/order/${order.id}`,demo:order.demo});
 if(order.status==='expired')throw new Error('This checkout expired. Please start a new checkout.');
 if(order.url)return Response.json({orderId:order.id,url:order.url,demo:false});
 const stripe=new Stripe(process.env.STRIPE_SECRET_KEY!);const base=process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin;
 const session=await stripe.checkout.sessions.create({mode:'payment',payment_method_types:['card'],client_reference_id:order.id,customer_email:order.customer.email,metadata:{orderId:order.id},line_items:[{price_data:{currency:'inr',unit_amount:order.total*100,product_data:{name:`Sūtra Rebind order ${order.id.slice(0,8)}`,description:`${order.items.reduce((n,i)=>n+i.quantity,0)} piece(s) · Rewards ₹${order.redeemed} · Shipping ₹${order.shipping}`}},quantity:1}],success_url:`${base}/order/${order.id}`,cancel_url:`${base}/checkout?cancelled=1`},{idempotencyKey:order.id});
 await withState(s=>{const o=s.orders.find(o=>o.id===order.id)!;o.sessionId=session.id;o.url=session.url!;});
 return Response.json({orderId:order.id,url:session.url,demo:false});
 }catch(e){return apiError(e);}}
