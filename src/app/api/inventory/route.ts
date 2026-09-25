import {withState} from '@/lib/db';
import {apiError} from '@/lib/session';
export async function GET(){try{return Response.json(await withState(s=>{return {stock:s.stock};}),{headers:{'Cache-Control':'no-store'}});}catch(e){return apiError(e);}}
