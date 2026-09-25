import {OrderView} from '@/components/commerce';
export const metadata={title:'Your Order',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <OrderView id={id}/>;}
