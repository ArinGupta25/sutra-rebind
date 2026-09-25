import postgres from 'postgres';
import {products,sizes} from './catalog';
export type Account = {id:string;coins:number;liveCoins?:number;created:string;ledger:{date:string;amount:number;reason:string;mode?:'demo'|'live'}[]};
export type Order = {id:string;accountId:string;requestId:string;status:'demo'|'pending'|'paid'|'expired';created:string;expires:number;items:{id:string;size:string;quantity:number;name:string;price:number}[];subtotal:number;redeemed:number;shipping:number;total:number;customer:Record<string,string>;sessionId?:string;url?:string;demo:boolean};
export type Submission = {demo?:boolean;id:string;accountId:string;kind:string;created:string;status:string;data:Record<string,unknown>};
export type State = {accounts:Record<string,Account>;orders:Order[];submissions:Submission[];stock:Record<string,number>;rates:Record<string,number[]>;webhooks:string[]};
let client:ReturnType<typeof postgres>|undefined;
function connection(){
 if(!process.env.DATABASE_URL)throw new Error('DATABASE_UNAVAILABLE');
 return client??=postgres(process.env.DATABASE_URL,{ssl:process.env.DATABASE_URL.includes('localhost')?false:'require',max:3,idle_timeout:20,connect_timeout:15,prepare:false});
}
export const initialState = ():State=>({accounts:{},orders:[],submissions:[],stock:Object.fromEntries(products.flatMap(p=>sizes.map((s,i)=>[`${p.id}:${s}`,Math.floor(p.stock/sizes.length)+(i<p.stock%sizes.length?1:0)]))),rates:{},webhooks:[]});
export const walletBalance=(a:Account,demo:boolean)=>demo?a.coins:(a.liveCoins??0);
export function adjustWallet(a:Account,amount:number,reason:string,demo:boolean){if(demo)a.coins+=amount;else a.liveCoins=(a.liveCoins??0)+amount;if(amount)a.ledger.unshift({date:new Date().toISOString(),amount,reason,mode:demo?'demo':'live'});}
export function publicAccount(a:Account|null){if(!a)return null;const demo=process.env.PAYMENTS_MODE!=='live';return {...a,coins:walletBalance(a,demo),ledger:a.ledger.filter(e=>(e.mode??'demo')===(demo?'demo':'live'))};}
export async function setup(){const sql=connection();await sql`CREATE TABLE IF NOT EXISTS sutra_state (id int PRIMARY KEY CHECK (id=1), data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`;await sql`INSERT INTO sutra_state (id,data) VALUES (1,${sql.json(initialState() as never)}) ON CONFLICT DO NOTHING`;}
export async function withState<T>(fn:(state:State)=>T|Promise<T>):Promise<T>{
 const sql=connection();
 return await sql.begin(async tx=>{
   const rows=await tx`SELECT data FROM sutra_state WHERE id=1 FOR UPDATE`;
   if(!rows.length)throw new Error('DATABASE_UNAVAILABLE');
   const state=rows[0].data as State;
   const result=await fn(state);
   await tx`UPDATE sutra_state SET data=${tx.json(state as never)},updated_at=now() WHERE id=1`;
   return result;
 }) as T;
}
export function rateLimit(state:State,key:string,limit=20){const now=Date.now();const times=(state.rates[key]??[]).filter(t=>now-t<3600000);if(times.length>=limit)throw new Error('Too many requests. Please try again in an hour.');state.rates[key]=[...times,now];for(const k of Object.keys(state.rates))if(state.rates[k].every(t=>now-t>=3600000))delete state.rates[k];}
