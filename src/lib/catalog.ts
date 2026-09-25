export const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export type Size = typeof sizes[number];
export type Product = { id: string; name: string; category: 'Streetwear' | 'Indo-Western'; price: number; stock: number; color: string; image: string; imagePosition?: string; description: string; batch: string; tag: string; water: number; textile: number; carbon: number };
export const products: Product[] = [
  { id:'utility-shacket', name:'The Reworked Shacket', category:'Streetwear', price:3490, stock:12, color:'Indigo / Rani', image:'/images/shacket.webp', description:'Workwear bones. Heirloom soul. A relaxed utility shacket cut from rescued denim, interrupted by hand-placed brocade panels. No two arrangements repeat.', batch:'SR-7030-JKT', tag:'THE SIGNATURE', water:2100, textile:780, carbon:4.2 },
  { id:'saree-corset', name:'Afterhours Corset Dress', category:'Indo-Western', price:4290, stock:8, color:'Midnight / Magenta', image:'/images/corset.webp', description:'An old saree starts a new conversation. Sculpted denim meets fluid silk panels in an adjustable, asymmetric silhouette made for after dark.', batch:'SR01-2024', tag:'ONE OF A KIND', water:1850, textile:640, carbon:3.6 },
  { id:'katran-cargo', name:'Katran Cargo 01', category:'Streetwear', price:2990, stock:16, color:'Washed indigo', image:'/images/cargo.webp', description:'Room to move, room for a different future. Wide-leg rescued denim with generous utility pockets and a contrast textile accent.', batch:'SR-CARGO-01', tag:'DAILY ROTATION', water:1700, textile:710, carbon:3.9 },
  { id:'reversible-vest', name:'Two-Sided Story Vest', category:'Indo-Western', price:2690, stock:6, color:'Saffron / Indigo', image:'/images/vest.webp', description:'Two moods, one garment. A modular layering piece inspired by Indian waistcoats, finished with recovered saree borders.', batch:'SR-VEST-01', tag:'REVERSIBLE', water:1200, textile:420, carbon:2.8 },
  { id:'patchwork-overshirt', name:'Offcut Overshirt', category:'Streetwear', price:3190, stock:10, color:'Ink / Rust', image:'/images/overshirt.webp', description:'Unfinished stories, beautifully assembled. An easy oversized shirt with contrast panels and generous sleeves.', batch:'SR-SHIRT-01', tag:'RELAXED FIT', water:1550, textile:580, carbon:3.1 },
  { id:'archive-wrap', name:'Archive Wrap 00', category:'Indo-Western', price:2290, stock:0, color:'Brocade / Ink', image:'/images/wrap.webp', description:'Our first experiment in modularity. A versatile wrap silhouette built around rescued fabric and endless styling possibilities.', batch:'SR-WRAP-00', tag:'ARCHIVE', water:900, textile:350, carbon:1.9 }
];
export const getProduct = (id:string) => products.find(p=>p.id===id);
export const money = (n:number) => new Intl.NumberFormat('en-IN', {style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
export const whatsapp = (message='Hi Sūtra Rebind! I’d love to know more.') => `https://wa.me/919329231248?text=${encodeURIComponent(message)}`;
export const cities = ['Pune','Mumbai','Surat','Delhi','Bangalore'] as const;
export const events = [
  { id:'pune-01', city:'Pune', name:'The Campus Edit', venue:'Pune design district', date:'2026-10-10', label:'CAMPUS POP-UP', x:34,y:63 },
  { id:'mumbai-01', city:'Mumbai', name:'Rework the Weekend', venue:'Bandra creative quarter', date:'2026-10-17', label:'FLEA + REWORK BAR', x:28,y:55 },
  { id:'surat-01', city:'Surat', name:'Back to the Source', venue:'Surat textile district', date:'2026-10-24', label:'CRAFT MEETS STREET', x:27,y:43 },
  { id:'delhi-01', city:'Delhi', name:'Northside Rebound', venue:'Delhi design district', date:'2026-11-07', label:'CULTURE DROP', x:43,y:19 },
  { id:'bangalore-01', city:'Bangalore', name:'Future in the Making', venue:'Indiranagar creative quarter', date:'2026-11-14', label:'COMMUNITY STUDIO', x:43,y:83 }
];
export const slots = ['11:00','11:30','12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30'];
export const materials = ['Heavy Vintage Denim','Silk / Zari Saree','Cotton / Twill Garments','Loose Fabric Scraps'] as const;
export const conditions = ['Like new','Minor wear / tear','Scrap / unwearable'] as const;
export function estimateCoins(material:string,condition:string,weight:number) {
  const base = [180,260,120,60][materials.indexOf(material as typeof materials[number])] ?? 0;
  const multiplier = [1,.75,.45][conditions.indexOf(condition as typeof conditions[number])] ?? 0;
  const high = Math.max(0,Math.floor(base*multiplier*Math.max(0,weight)));
  return {low:Math.floor(high*.75),high};
}
export function nextDrop(now = Date.now()) {
  const first = Date.parse('2026-10-09T18:00:00+05:30');
  const cycle = 14*86400000;
  return first + Math.max(0,Math.ceil((now-first)/cycle))*cycle;
}
export function totals(subtotal:number,balance:number,useCoins:boolean) {
  const redeemed = useCoins ? Math.max(0,Math.min(Math.floor(balance),Math.floor(subtotal*.25))) : 0;
  const shipping = subtotal >= 2500 || subtotal===0 ? 0 : 99;
  return {subtotal,redeemed,shipping,total:subtotal-redeemed+shipping};
}
