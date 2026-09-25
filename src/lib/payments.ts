import type Stripe from 'stripe';
import {adjustWallet, type State, type Order} from './db';

export function releaseReservation(state:State,order:Order){
  if(order.demo||order.status!=='pending')return;
  order.status='expired';
  for(const item of order.items)state.stock[`${item.id}:${item.size}`]+=item.quantity;
  adjustWallet(state.accounts[order.accountId],order.redeemed,'Unpaid checkout rewards returned',false);
}

// A local clock cannot prove a payment failed. Only provider-confirmed events
// release reservations, so a delayed payment webhook cannot cause overselling.
export function applyPaymentEvent(state:State,event:Stripe.Event){
  if(state.webhooks.includes(event.id))return;
  const supported=['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired','checkout.session.async_payment_failed'];
  if(!supported.includes(event.type))return;
  const session=event.data.object as Stripe.Checkout.Session;
  const order=state.orders.find(o=>o.id===session.metadata?.orderId);
  if(order&&!order.demo){
    if(order.sessionId&&order.sessionId!==session.id)throw new Error('Payment session mismatch');
    if(session.payment_status==='paid'){
      if(session.amount_total!==order.total*100||session.currency!=='inr')throw new Error('Payment amount mismatch');
      if(order.status==='expired')throw new Error('Released reservation requires manual payment review');
      order.status='paid';order.sessionId=session.id;
    }else if(['checkout.session.expired','checkout.session.async_payment_failed'].includes(event.type))releaseReservation(state,order);
  }
  state.webhooks.push(event.id);
}
