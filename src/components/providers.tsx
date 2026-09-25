'use client';
import {createContext,useContext,useEffect,useState,useCallback,ReactNode} from 'react';
import {getProduct,Size} from '@/lib/catalog';
type CartItem={id:string;size:Size;quantity:number};
type Account={coins:number;ledger:{date:string;amount:number;reason:string}[]};
type ShopContext={cart:CartItem[];add:(id:string,size:Size)=>void;update:(id:string,size:Size,quantity:number)=>void;clear:()=>void;cartOpen:boolean;setCartOpen:(v:boolean)=>void;account:Account|null;refresh:()=>Promise<void>;ready:boolean;serviceError:string;toast:(v:string)=>void;demo:boolean};
const Context=createContext<ShopContext|null>(null);
export function Providers({children}:{children:ReactNode}){
 const [cart,setCart]=useState<CartItem[]>([]),[ready,setReady]=useState(false),[cartOpen,setCartOpen]=useState(false),[account,setAccount]=useState<Account|null>(null),[serviceError,setServiceError]=useState(''),[message,setMessage]=useState(''),[demo,setDemo]=useState(true);
 const refresh=useCallback(async()=>{try{const r=await fetch('/api/account');const data=await r.json();if(!r.ok)throw new Error(data.error);setAccount(data.account);setDemo(data.demo);setServiceError('');}catch(e){setServiceError(e instanceof Error?e.message:'Service unavailable.');}},[]);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem('sutra-cart')??'[]');if(Array.isArray(saved))setCart(saved.filter(i=>getProduct(i.id)&&['XS','S','M','L','XL','XXL'].includes(i.size)&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=5));}catch{}setReady(true);fetch('/api/account',{method:'POST'}).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error);setAccount(data.account);setDemo(data.demo);}).catch(e=>setServiceError(e.message));},[]);
 useEffect(()=>{if(ready)localStorage.setItem('sutra-cart',JSON.stringify(cart));},[cart,ready]);
 useEffect(()=>{if(message){const t=setTimeout(()=>setMessage(''),4500);return()=>clearTimeout(t);}},[message]);
 const add=(id:string,size:Size)=>{setCart(current=>{const found=current.find(i=>i.id===id&&i.size===size);return found?current.map(i=>i===found?{...i,quantity:Math.min(5,i.quantity+1)}:i):[...current,{id,size,quantity:1}];});setMessage('A new story, added to your bag.');setCartOpen(true);};
 const update=(id:string,size:Size,quantity:number)=>setCart(c=>c.map(i=>i.id===id&&i.size===size?{...i,quantity:Math.min(5,quantity)}:i).filter(i=>i.quantity>0));
 return <Context.Provider value={{cart,add,update,clear:()=>setCart([]),cartOpen,setCartOpen,account,refresh,ready,serviceError,toast:setMessage,demo}}>{children}<div className={`toast ${message?'show':''}`} role="status">{message}</div></Context.Provider>;
}
export const useShop=()=>{const value=useContext(Context);if(!value)throw new Error('Shop provider missing');return value;};
