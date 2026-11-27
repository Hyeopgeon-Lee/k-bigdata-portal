import test from 'node:test';
import assert from 'node:assert/strict';
const records=new Map(),stored=new Map(),events=[];
const user='qa-user';
globalThis.localStorage={getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)};
globalThis.document={dispatchEvent:e=>events.push(e.detail)};
if(!globalThis.CustomEvent)globalThis.CustomEvent=class{constructor(_,o){this.detail=o.detail;}};
globalThis.portalLearning={read:true,write:true,expires:Date.now()+600000};
globalThis.portalVerifiedUserId=user;
let fail=false, updates=0, inserts=0;
globalThis.portalSupabaseClient={from(table){
 assert.equal(table,'learning_attempts');
 return {async upsert(batch){for(const row of batch){if(!records.has(row.client_attempt_id)){records.set(row.client_attempt_id,{...row});inserts++;}}return {error:null};},
 update(patch){assert.deepEqual(Object.keys(patch),['result']);const f={};return {eq(k,v){f[k]=v;return this;},select(){return this;},async maybeSingle(){
  updates++;const row=records.get(f.client_attempt_id);
  if(fail)return {error:new Error('OFFLINE')};
  if(!row||Object.entries(f).some(([k,v])=>row[k]!==v))return {data:null};
  Object.assign(row,patch);return {data:{result:row.result}};
 }}}};
}};
const {bindReview}=await import('../js/study-review.js');
function view(previous,attemptId='a',bank='coding'){
 const status={textContent:''},saved=[];
 const buttons=['correct','incorrect','ungraded'].map(grade=>({dataset:{grade},disabled:false,pressed:'false',
 setAttribute(k,v){assert.equal(k,'aria-pressed');this.pressed=v;},addEventListener(_,fn){this.click=fn;}}));
 bindReview({querySelectorAll:()=>buttons,querySelector:()=>status},{bank,questionId:'JAVA-001',clientAttemptId:attemptId,answerText:'original answer'},previous,r=>saved.push(r));
 return {buttons,status,saved};
}
test('coding self grade changes same record, idempotently, including after reopen and failure',async()=>{
 const v=view(null);
 await v.buttons[0].click();
 assert.equal(inserts,1);assert.equal(v.buttons[1].disabled,false);
 await v.buttons[1].click();
 assert.equal(inserts,1);assert.equal(records.get('a').result,'incorrect');assert.equal(records.get('a').answer_text,'original answer');
 assert.equal(v.buttons[1].pressed,'true');assert.match(v.status.textContent,/수정됨/);
 await v.buttons[1].click();assert.equal(updates,1);
 const reopened=view('incorrect');
 assert.equal(reopened.buttons[2].disabled,false);
 fail=true;await reopened.buttons[2].click();
 assert.equal(reopened.buttons[1].pressed,'true');assert.equal(records.get('a').result,'incorrect');
 fail=false;await reopened.buttons[2].click();assert.equal(records.get('a').result,'ungraded');
 await reopened.buttons[0].click();assert.equal(records.get('a').result,'correct');assert.equal(inserts,1);
 assert.equal(events.at(-1).state,'saved');
});
test('unrelated banks remain locked after grading',()=>{
 const v=view('correct','b','practical');
 assert.ok(v.buttons.every(b=>b.disabled));
});
