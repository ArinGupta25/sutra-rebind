import {accountId,apiError} from '@/lib/session';
import {withState} from '@/lib/db';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){try{const account=await accountId();const {id}=await params;const order=await withState(s=>s.orders.find(o=>o.id===id&&o.accountId===account));if(!order)return Response.json({error:'Order not found.'},{status:404});return Response.json({order});}catch(e){return apiError(e);}}
