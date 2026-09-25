import {Suspense} from 'react';
import {Passport} from '@/components/circular';
export const metadata={title:'Trace Your Thread'};
export default function Page(){return <Suspense fallback={<div className="page-section">Loading passports…</div>}><Passport/></Suspense>;}
