const {setup}=await import('../src/lib/db');
await setup();
console.log('Sūtra database initialized. Existing data preserved.');
process.exit(0);
export {};
