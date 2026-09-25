import type {Metadata} from 'next';
import {Space_Grotesk,DM_Sans} from 'next/font/google';
import {Providers} from '@/components/providers';
import {Header,Footer} from '@/components/shell';
import './globals.css';
const display=Space_Grotesk({subsets:['latin'],variable:'--font-display',display:'swap'});
const body=DM_Sans({subsets:['latin'],variable:'--font-body',display:'swap'});
export const metadata:Metadata={title:{default:'Sūtra Rebind — Old threads. New possibilities.',template:'%s | Sūtra Rebind'},description:'Circular Indian streetwear. Rescued denim meets heirloom textiles in one-of-a-kind modular pieces. Explore the drop, trace your thread, and close the loop.',metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://sutra-rebind.vercel.app'),openGraph:{title:'Sūtra Rebind — Wear the next chapter',description:'70% rescued. 30% unexpected. 100% you.',images:['/images/campaign.webp']}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${display.variable} ${body.variable}`}><body><Providers><Header/><main id="main">{children}</main><Footer/></Providers></body></html>;}
