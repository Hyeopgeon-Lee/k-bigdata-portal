import {getClient,getAccount} from "./learning-auth.js";
const QUEUE_KEY="kbigdata:learning:pending-attempts:v1";
const parse=(x,fallback)=>{try{return JSON.parse(x)??fallback;}catch{return fallback;}};
const readQueue=()=>parse(localStorage.getItem(QUEUE_KEY),[]);
const writeQueue=q=>localStorage.setItem(QUEUE_KEY,JSON.stringify(q.slice(-1200)));
let flushing=false;
const validBank=bank=>["coding","ncp","practical"].includes(bank);
export async function recordCloudAttempt({bank,questionId,clientAttemptId,result="ungraded",gradingMethod="none",answerText="",elapsedSeconds=null,usedHint=false,submittedAt=new Date().toISOString(),metadata={}}){
 if(!validBank(bank)||!questionId)return;
 // Do not load a network-only SDK or send data when running locally, in tests,
 // or before the learner explicitly signs in on this device.
 if(typeof window==="undefined"||typeof localStorage==="undefined"||!localStorage.getItem("kbigdata-learning-auth"))return;
 const client=await getClient();if(!client)return; // local-only mode remains functional
 const {data:{session}}=await client.auth.getSession();
 if(!session?.user?.id)return; // never silently assign anonymous drafts to a later account
 const row={
  user_id:session.user.id,bank,question_id:String(questionId),
  client_attempt_id:String(clientAttemptId||crypto.randomUUID()),result,
  grading_method:gradingMethod,answer_text:String(answerText).slice(0,10000),
  elapsed_seconds:Number.isFinite(elapsedSeconds)?Math.max(0,Math.floor(elapsedSeconds)):null,
  used_hint:!!usedHint,submitted_at:new Date(submittedAt).toISOString(),metadata
 };
 const queue=readQueue();
 if(!queue.some(x=>x.user_id===row.user_id&&x.client_attempt_id===row.client_attempt_id)){queue.push(row);writeQueue(queue);}
 void flushCloudAttempts();
}
export async function flushCloudAttempts(){
 if(flushing)return;
 const client=await getClient();if(!client)return;
 flushing=true;
 try{
  const account=await getAccount();if(!account.active)return;
  let queue=readQueue(),items=queue.filter(x=>x.user_id===account.user.id);
  for(let i=0;i<items.length;i+=50){
   const batch=items.slice(i,i+50);
   const {error}=await client.from("learning_attempts").upsert(batch,{onConflict:"user_id,client_attempt_id",ignoreDuplicates:true});
   if(error)throw error;
   const ids=new Set(batch.map(x=>x.client_attempt_id));
   queue=readQueue().filter(x=>!(x.user_id===account.user.id&&ids.has(x.client_attempt_id)));
   writeQueue(queue);
  }
 }catch(err){console.warn("학습기록 서버 동기화 대기:",err.message);}
 finally{flushing=false;}
}
export async function saveCloudDraft(bank,questionId,draft){
 if(!validBank(bank)||!questionId)return;
 const account=await getAccount().catch(()=>null);if(!account?.active)return;
 const client=await getClient();
 const {error}=await client.from("learning_drafts").upsert({
  user_id:account.user.id,bank,question_id:questionId,draft_text:String(draft).slice(0,10000),updated_at:new Date().toISOString()
 },{onConflict:"user_id,bank,question_id"});
 if(error)console.warn("임시 답안 서버 저장 실패:",error.message);
}
export async function getCloudRecords(bank,{limit=1000}={}){
 const account=await getAccount().catch(()=>null);if(!account?.active&&!account?.readOnly)return [];
 const client=await getClient();if(!client)return [];
 const {data,error}=await client.from("learning_attempts").select("client_attempt_id,bank,question_id,result,grading_method,answer_text,elapsed_seconds,used_hint,submitted_at,metadata")
  .eq("bank",bank).eq("user_id",account.user.id).order("submitted_at",{ascending:false}).limit(limit);
 if(error){console.warn("학습기록 불러오기 실패:",error.message);return [];}
 return data||[];
}
export async function getCloudDraft(bank,questionId){
 const account=await getAccount().catch(()=>null);if(!account?.active&&!account?.readOnly)return null;
 const client=await getClient();
 const {data}=await client.from("learning_drafts").select("draft_text").eq("user_id",account.user.id).eq("bank",bank).eq("question_id",questionId).maybeSingle();
 return data?.draft_text??null;
}
export async function getCloudProgress(bank){
 const account=await getAccount().catch(()=>null);if(!account?.active&&!account?.readOnly)return [];
 const client=await getClient();
 const {data,error}=await client.from("learning_progress").select("bank,question_id,last_result,attempts_count,correct_count,incorrect_count,last_attempt_at").eq("bank",bank).eq("user_id",account.user.id).limit(1000);
 if(error)return [];
 return data||[];
}
export function pendingCount(){return readQueue().length;}
if(typeof window!=="undefined")window.addEventListener("online",()=>{void flushCloudAttempts();});
