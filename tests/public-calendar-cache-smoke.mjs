/* Read-only production Edge smoke check: never mutates real calendar or accounts. */
import assert from "node:assert/strict";
const url="https://zjsindkakjfzmjgrkaou.supabase.co/functions/v1/public-calendar-cache";
const controller=new AbortController();
const timer=setTimeout(()=>controller.abort(),18000);
try{
 const response=await fetch(url,{headers:{Accept:"application/json"},signal:controller.signal});
 assert.equal(response.status,200,"Public calendar cache should return HTTP 200");
 const data=await response.json();
 assert.equal(data?.ok,true);
 assert.ok(Array.isArray(data.events));
 assert.ok(data.events.length<=4000);
 const allowed=new Set(["id","title","category","startDate","endDate","startTime","important","published","source","targetGrade"]);
 for(const event of data.events){
  assert.equal(event.published,true);
  for(const key of Object.keys(event))assert.ok(allowed.has(key),"private field leaked: "+key);
 }
 console.log("PASS: public calendar cache returned "+data.events.length+" published events; stale="+Boolean(data.stale));
}finally{clearTimeout(timer);}
