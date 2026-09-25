import {Suspense} from 'react';
import {Checkout} from '@/components/commerce';
export const metadata={title:'Checkout',robots:{index:false,follow:false}};
export default function Page(){return <Suspense fallback={<div className="loading-screen">Loading checkout…</div>}><Checkout/></Suspense>;}
