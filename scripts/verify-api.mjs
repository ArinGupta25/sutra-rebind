import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://localhost:3001';
let cookie='';
async function call(path,body,extra={}){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Origin:base,...(cookie?{Cookie:cookie}:{}),...extra},...(body?{body:JSON.stringify(body)}:{})});const set=r.headers.get('set-cookie');if(set)cookie=set.split(';')[0];return {status:r.status,data:await r.json()};}
let checks=0;function ok(value,message){assert.ok(value,message);checks++;console.log('PASS',message);}
const a=await call('/api/account',{});ok(a.status===200&&a.data.account.coins===250,'database-backed private account and demo wallet');
const customer={name:'QA API Sample',email:'qa-api@example.com',phone:'9000000000',address:'123 Fictional QA Street',city:'Pune',state:'Maharashtra',pincode:'411001'};
const order={items:[{id:'utility-shacket',size:'M',quantity:1}],useCoins:true,requestId:crypto.randomUUID(),customer,consent:true};
const first=await call('/api/checkout',order);ok(first.status===200&&first.data.demo===true,'sample checkout succeeds without payment credentials');
const repeat=await call('/api/checkout',order);ok(repeat.data.orderId===first.data.orderId,'retry returns same order without double spending');
const saved=await call('/api/orders/'+first.data.orderId);ok(saved.data.order.total===3240&&saved.data.order.redeemed===250,'server-derived price and coin redemption persisted');
const after=await call('/api/account');ok(after.data.account.coins===0&&after.data.orders.length===1,'wallet and order history agree');
const foreign=await fetch(base+'/api/orders/'+first.data.orderId);ok(foreign.status===404,'other visitors cannot read private orders');
const invalid=await call('/api/checkout',{...order,requestId:crypto.randomUUID(),items:[{id:'utility-shacket',size:'M',quantity:-1}]});ok(invalid.status===400,'invalid quantity rejected on server');
const origin=await call('/api/submissions',{kind:'contact',data:{}},{Origin:'https://untrusted.example'});ok(origin.status===400,'cross-origin mutation rejected');
const contact=await call('/api/submissions',{kind:'contact',data:{name:'QA API Sample',email:'qa-api@example.com',category:'Other',message:'QA test message for the saved contact workflow.',consent:true}});ok(contact.status===201,'contact message saved to database');
const trade=await call('/api/submissions',{kind:'trade',data:{...customer,material:'Heavy Vintage Denim',condition:'Like new',weight:1,method:'pickup',date:'2099-10-10',consent:true}});ok(trade.status===400,'sub-2kg pickup rejected');
const available=await call('/api/submissions?event=pune-01');const slot=['11:00','11:30','12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30'].find(t=>!available.data.booked.includes(t));
if(slot){const booking={kind:'booking',data:{name:'QA API Sample',phone:'9000000000',email:'qa-api@example.com',eventId:'pune-01',slot,item:'Sample denim jacket',notes:'QA test only',consent:true}};const b=await call('/api/submissions',booking);ok(b.status===201,'booking reserves selected time');const conflict=await call('/api/submissions',booking);ok(conflict.status===400,'duplicate slot rejected atomically');}
const admin=await call('/api/admin');ok(admin.status===401,'operations dashboard rejects unauthenticated access');
if(process.env.ADMIN_SECRET){
 const validTrade=await call('/api/submissions',{kind:'trade',data:{...customer,material:'Heavy Vintage Denim',condition:'Like new',weight:2,method:'pickup',date:'2099-10-10',consent:true}});ok(validTrade.status===201,'eligible trade request saved');
 const visitor=cookie;
 const login=await call('/api/admin',{action:'login',secret:process.env.ADMIN_SECRET});ok(login.status===200,'private studio login succeeds');
 const studio=await call('/api/admin');ok(studio.data.submissions.some(s=>s.id===validTrade.data.id),'studio sees saved visitor request');
 const approve={action:'review',id:validTrade.data.id,status:'accepted',coins:100};
 ok((await call('/api/admin',approve)).status===200,'studio approves demo trade reward');
 ok((await call('/api/admin',approve)).status===400,'repeat approval cannot award rewards twice');
 const wallet=await call('/api/account',null,{Cookie:visitor});ok(wallet.data.account.coins===100,'approved rewards reach original visitor wallet');
 for(const request of studio.data.submissions.filter(s=>s.kind==='booking'&&s.data.email==='qa-api@example.com'&&s.status!=='cancelled'))await call('/api/admin',{action:'review',id:request.id,status:'cancelled'});
 await call('/api/admin',{action:'logout'});
}
console.log(`Verified ${checks} API checks against ${base}. Test references created with QA API Sample.`);
