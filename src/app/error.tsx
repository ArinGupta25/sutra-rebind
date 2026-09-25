'use client';
export default function Error({reset}:{reset:()=>void}){return <div className="empty-state page-section"><h1>A stitch came loose.</h1><p>We couldn’t load this page. Please try again.</p><button className="button primary" onClick={reset}>Try again</button></div>;}
