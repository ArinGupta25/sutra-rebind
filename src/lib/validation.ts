import {z} from 'zod';
import {conditions,materials,sizes} from './catalog';
export const name = z.string().trim().min(2,'Please enter your name.').max(100);
export const email = z.email('Please enter a valid email.').max(200);
export const phone = z.string().trim().regex(/^\+?[\d\s()-]{10,18}$/,'Please enter a valid phone number.').refine(v=>{const n=v.replace(/\D/g,'').length;return n>=10&&n<=15;},'Please enter 10–15 phone digits.');
export const contactSchema = z.object({name,email,category:z.enum(['Order help','Trade-in','Collaboration','Press','Other']),message:z.string().trim().min(10).max(3000),consent:z.literal(true)});
export const notificationSchema = z.object({channel:z.enum(['email','whatsapp']),contact:z.string().min(5).max(200),consent:z.literal(true)}).superRefine((v,c)=>{if(!(v.channel==='email'?email:phone).safeParse(v.contact).success)c.addIssue({code:'custom',message:'Please check your contact details.',path:['contact']});});
export const tradeSchema = z.object({name,phone,email,material:z.enum(materials),condition:z.enum(conditions),weight:z.coerce.number().min(.1).max(50),method:z.enum(['pickup','dropoff']),city:z.string().min(2).max(60),address:z.string().trim().min(8).max(500),date:z.iso.date(),consent:z.literal(true)}).superRefine((v,c)=>{if(v.method==='pickup'&&v.weight<2)c.addIssue({code:'custom',message:'Home pickups require at least 2 kg.',path:['weight']});if(Date.parse(v.date+'T23:59:59+05:30')<Date.now())c.addIssue({code:'custom',message:'Choose a future date.',path:['date']});});
export const bookingSchema = z.object({name,phone,email,eventId:z.string().max(50),slot:z.string().regex(/^\d{2}:\d{2}$/),item:z.string().min(3).max(200),notes:z.string().max(2000).default(''),consent:z.literal(true)});
const portfolio = z.url().refine(v=>new URL(v).protocol==='https:','Use a secure https:// portfolio link.');
export const applicationSchema = z.discriminatedUnion('track',[
 z.object({track:z.literal('designer'),name,email,phone,portfolio,pitch:z.string().min(20).max(3000),consent:z.literal(true)}),
 z.object({track:z.literal('guild'),name,phone,city:z.enum(['Bhiwandi','Surat','Pune','Mumbai']),expertise:z.string().min(3).max(600),language:z.enum(['EN','HI','MR']),consent:z.literal(true)}),
 z.object({track:z.literal('challenge'),name,email,phone,team:z.string().min(2).max(100),members:z.coerce.number().int().min(1).max(5),idea:z.string().min(20).max(3000),consent:z.literal(true)})
]);
export const checkoutSchema = z.object({
 items:z.array(z.object({id:z.string().max(70),size:z.enum(sizes),quantity:z.number().int().min(1).max(5)})).min(1).max(20),
 useCoins:z.boolean(),requestId:z.uuid(),
 customer:z.object({name,email,phone,address:z.string().trim().min(10).max(500),city:z.string().min(2).max(100),state:z.string().min(2).max(100),pincode:z.string().regex(/^[1-9]\d{5}$/,'Enter a 6-digit Indian PIN code.')}),
 consent:z.literal(true)
});
