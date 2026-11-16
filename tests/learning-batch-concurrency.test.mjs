import assert from "node:assert/strict";
import test from "node:test";
const records=new Map(),stored=new Map(),events=[],batchSizes=[];
let blocked=false;
const userId="11111111-1111-4111-8111-111111111111";
const store={
 getItem:key=>stored.get(key)||null,
 setItem:(key,value)=>stored.set(key,String(value))
};
let mutex=Promise.resolve();
const locks={request(_name,fn){
 const next=mutex.then(fn,fn);
 mutex=next.catch(()=>{});
 return next;
}};
Object.defineProperty(globalThis,"navigator",{configurable:true,value:{onLine:true,locks}});
globalThis.localStorage=store;
globalThis.document={dispatchEvent:event=>events.push(event.detail)};
if(!globalThis.CustomEvent)globalThis.CustomEvent=class{constructor(_name,options){this.detail=options.detail;}};
globalThis.portalLearning={read:true,write:true,expires:Date.now()+3600000};
globalThis.portalVerifiedUserId=userId;
globalThis.portalSupabaseClient={
 auth:{getUser:async()=>{throw Error("A verified identity should avoid an extra auth request");}},
 from(table){
  assert.equal(table,"learning_attempts");
  return {async upsert(batch,options){
   assert.equal(options.onConflict,"user_id,client_attempt_id");
   assert.equal(options.ignoreDuplicates,true);
   assert.ok(Array.isArray(batch));
   batchSizes.push(batch.length);
   if(blocked)return {error:{code:"PGRST_OFFLINE"}};
   for(const row of batch)records.set(row.client_attempt_id,row);
   return {error:null};
  }};
 }
};
const {recordLearningAttempt,flushLearningQueue,LEARNING_BATCH_SIZE,learningRetryDelay}=
 await import("../js/learning-activity.mjs");
test("staging learning queue never loses offline student attempts",async()=>{
 assert.equal(LEARNING_BATCH_SIZE,25);
 assert.ok(learningRetryDelay(3,.5)>learningRetryDelay(2,.5));
 blocked=true;
 const result=await recordLearningAttempt({
  bank:"coding",questionId:"JAVA-001",result:"incorrect",gradingMethod:"self",answerText:"while (true) {}"
 });
 assert.equal(result.state,"pending");
 assert.equal(records.size,0);
 assert.ok(stored.get("kbigdata:learning:pending:v2:"+userId));
 blocked=false;
 assert.equal((await flushLearningQueue()).state,"saved");
 assert.equal(records.size,1);
});
test("40 simultaneous writes use 25-row chunks and a per-user lock",async()=>{
 const before=records.size;
 const work=Array.from({length:40},(_,i)=>recordLearningAttempt({
  bank:"coding",questionId:"JAVA-"+String(i+1).padStart(3,"0"),
  result:"correct",gradingMethod:"self",answerText:"answer "+i
 }));
 await Promise.all(work);
 await flushLearningQueue();
 assert.equal(records.size,before+40);
 assert.ok(batchSizes.every(n=>n>0&&n<=25));
 assert.equal(JSON.parse(stored.get("kbigdata:learning:pending:v2:"+userId)||"[]").length,0);
});
test("repeated idempotency keys count only once",async()=>{
 const before=records.size;
 for(let i=0;i<2;i++)await recordLearningAttempt({
  bank:"practical",questionId:"P-001",result:"ungraded",gradingMethod:"self",clientAttemptId:"duplicate-fixed-key"
 });
 assert.equal(records.size,before+1);
 assert.equal(events.at(-1).state,"saved");
});
