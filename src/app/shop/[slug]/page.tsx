import {notFound} from 'next/navigation';
import {getProduct,products} from '@/lib/catalog';
import {ProductDetail} from '@/components/store';
export const generateStaticParams=()=>products.map(p=>({slug:p.id}));
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return {title:getProduct(slug)?.name??'Piece not found'};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=getProduct(slug);if(!p)notFound();return <ProductDetail product={p}/>;}
