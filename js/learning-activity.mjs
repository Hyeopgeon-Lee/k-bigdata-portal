/* Supabase-backed learning events. Events are appended, never overwritten. */
const VALID_BANKS=new Set(['coding','ncp','practical']);
const VALID_RESULTS=new Set(['correct','incorrect','completed','ungraded','timeout']);
const VALID_METHODS=new Set(['self','automatic','completion','none']);
const storage=globalThis.localStorage;
const timers=new Map(),savedDrafts=new Map(),readCache=new Map();
let accountPromise=null;
const db=()=>globalThis.portalSupabaseClient;
const writable=()=>globalThis.portalLearning?.write===true && Date.now()<globalThis.portalLearning.expires;
const readable=()=>globalThis.portalLearning?.read===true && Date.now()<globalThis.portalLearning.expires;
async function account(){
 if(!db()||!readable())throw new Error('LOGIN_REQUIRED');
 if(globalThis.portalVerifiedUserId)return {id:globalThis.portalVerifiedUserId};
 if(!accountPromise)accountPromise=db().auth.getUser().then(({data,error})=>{
   if(error||!data?.user?.id)throw new Error('LOGIN_REQUIRED');
   return data.user;
 }).catch(error=>{accountPromise=null;throw error;});
 return accountPromise;
}
function queueKey(userId){return 'kbigdata:learning:pending:v2:'+userId;}
function pending(userId){
 try{const rows=JSON.parse(storage.getItem(queueKey(userId))||'[]');
  return Array.isArray(rows)?rows.filter(v=>v&&typeof v.client_attempt_id==='string'):[];
 }catch{return [];}
}
function setPending(userId,items){
 if(items.length>500)throw new Error('LEARNING_QUEUE_FULL');
 if(!storage)throw new Error('LEARNING_DEVICE_STORAGE_UNAVAILABLE');
 storage.setItem(queueKey(userId),JSON.stringify(items));
}
function notify(state,message){
 document.dispatchEvent(new CustomEvent('portal-learning-sync',{detail:{state,message}}));
}
function cleanNumber(value){return Number.isFinite(value)?Math.max(0,Math.min(86400,Math.round(value))):null;}
function idFor(){return globalThis.crypto?.randomUUID?.()||'attempt-'+Date.now()+'-'+Math.random().toString(36).slice(2);}
function validate(data){
 if(!VALID_BANKS.has(data.bank)||!VALID_RESULTS.has(data.result)||!VALID_METHODS.has(data.gradingMethod))throw new Error('INVALID_LEARNING_EVENT');
 if(!/^[A-Za-z0-9_-]{1,90}$/.test(String(data.questionId||'')))throw new Error('INVALID_QUESTION_ID');
 if(data.gradingMethod==='automatic'&&data.bank==='coding')throw new Error('INVALID_CODING_GRADE');
}
// One network request persists up to 25 attempts. Web Locks serialize queue writes
// across tabs; the local promise fallback covers browsers without Web Locks.
export const LEARNING_BATCH_SIZE=25;
export function learningRetryDelay(attempt,random=0){
 return Math.min(60000,2000*Math.pow(2,Math.min(5,Math.max(0,attempt))))+Math.floor(Math.max(0,Math.min(1,random))*2000);
}
let syncing=null,localQueueLock=Promise.resolve(),retryTimer=null,retryAttempt=0;
function withQueueLock(userId,work){
 const name='kbigdata:learning:queue:v2:'+userId;
 if(globalThis.navigator?.locks?.request)return globalThis.navigator.locks.request(name,work);
 const next=localQueueLock.then(work,work);
 localQueueLock=next.catch(()=>{});
 return next;
}
function retryLater(){
 if(retryTimer||!writable()||globalThis.navigator?.onLine===false)return;
 const delay=learningRetryDelay(retryAttempt++,Math.random());
 retryTimer=setTimeout(()=>{retryTimer=null;void flushLearningQueue().catch(error=>console.warn('Learning queue retry failed',error));},delay);
}
function clearRetry(){
 if(retryTimer){clearTimeout(retryTimer);retryTimer=null;}
 retryAttempt=0;
}
export function flushLearningQueue(){
 if(syncing)return syncing;
 syncing=flushLearningInternal().finally(()=>{syncing=null;});
 return syncing;
}
async function flushLearningInternal(){
 if(!writable())return {state:'readonly'};
 const user=await account();
 return withQueueLock(user.id,async()=>{
  let error=null,changed=false;
  for(let iteration=0;iteration<20;iteration++){
   const batch=pending(user.id).slice(0,LEARNING_BATCH_SIZE);
   if(!batch.length)break;
   try{
    // ON CONFLICT DO NOTHING: client_attempt_id is globally unique per user.
    // Never update an existing attempt or increment the aggregate twice.
    const result=await db().from('learning_attempts').upsert(batch,{
      onConflict:'user_id,client_attempt_id',ignoreDuplicates:true
    });
    if(result.error)throw result.error;
    changed=true;readCache.clear();
    const done=new Set(batch.map(r=>r.client_attempt_id));
    // Preserve any new events appended by this or another tab.
    setPending(user.id,pending(user.id).filter(row=>!done.has(row.client_attempt_id)));
   }catch(cause){
    error=cause;
    console.warn('Learning attempt batch pending',cause?.code||cause?.message||'NETWORK');
    break;
   }
  }
  const count=pending(user.id).length;
  if(count){
   notify('pending','학습 기록 '+count+'건이 기기에 대기 중입니다. 인터넷 연결 후 다시 동기화합니다.');
   if(error?.code!=='42501'&&error?.status!==401&&error?.status!==403)retryLater();
  }else{
   clearRetry();
   if(changed)notify('saved','학습 결과가 클라우드에 저장되었습니다.');
  }
  return {state:count?'pending':'saved',count};
 });
}
export async function recordLearningAttempt(data){
 validate(data);
 const answer=String(data.answerText??'');
 if([...answer].length>10000)throw new Error('ANSWER_TOO_LONG');
 if(!writable())return {state:'readonly',message:'읽기 전용 계정입니다.'};
 const user=await account();
 const event={
   user_id:user.id,bank:data.bank,question_id:String(data.questionId),
   client_attempt_id:String(data.clientAttemptId||idFor()).slice(0,160),
   result:data.result,grading_method:data.gradingMethod,
   answer_text:answer,
   elapsed_seconds:cleanNumber(data.elapsedSeconds),
   used_hint:!!data.usedHint,
   question_revision:data.questionRevision?String(data.questionRevision).slice(0,120):null,
   metadata:{source:'portal',self_reported:data.gradingMethod==='self',...data.metadata}
 };
 await withQueueLock(user.id,()=>{
   const rows=pending(user.id);
   if(!rows.some(r=>r.client_attempt_id===event.client_attempt_id)){
     rows.push(event);
     setPending(user.id,rows);
   }
 });
 notify('pending','학습 기록을 클라우드에 동기화하는 중입니다.');
 // Always flush after recording; failures retain the on-device copy.
 return flushLearningQueue();
}
function cachedRead(key,work){
 const scoped=(globalThis.portalVerifiedUserId||"")+":"+key;
 const previous=readCache.get(scoped);
 if(previous&&Date.now()-previous.at<30000)return previous.promise;
 const promise=Promise.resolve().then(work).catch(error=>{readCache.delete(scoped);throw error;});
 readCache.set(scoped,{at:Date.now(),promise});
 return promise;
}
export function invalidateLearningReads(){readCache.clear();}
export function fetchLearningAttempts(bank=null){return cachedRead("attempts:"+bank,()=>readLearningAttempts(bank));}
async function readLearningAttempts(bank=null){
 if(bank!==null&&!VALID_BANKS.has(bank))throw new Error('INVALID_PROGRESS_BANK');
 const user=await account();const all=[];
 for(let from=0;from<10000;from+=500){
  const query=db().from('learning_attempts').select('id,bank,question_id,result,grading_method,submitted_at,used_hint,elapsed_seconds,client_attempt_id'+(['coding','practical'].includes(bank)?',metadata':'')).eq('user_id',user.id);
  if(bank!==null)query.eq('bank',bank);
  const {data,error}=await query.order('submitted_at',{ascending:false}).range(from,from+499);
  if(error)throw error;all.push(...(data||[]));if((data||[]).length<500)break;
 }
 return all;
}
export function fetchLearningProgress(bank=null){return cachedRead("progress:"+bank,()=>readLearningProgress(bank));}
async function readLearningProgress(bank=null){
 if(bank!==null&&!VALID_BANKS.has(bank))throw new Error('INVALID_PROGRESS_BANK');
 const user=await account();const all=[];
 for(let from=0;from<10000;from+=500){
  const query=db().from('learning_progress')
   .select('bank,question_id,last_result,last_attempt_at,attempts_count,correct_count,incorrect_count')
   .eq('user_id',user.id);
  if(bank!==null)query.eq('bank',bank);
  const {data,error}=await query.order('last_attempt_at',{ascending:false}).range(from,from+499);
  if(error)throw error;all.push(...(data||[]));if((data||[]).length<500)break;
 }
 return all;
}
export async function fetchLearningAttemptAnswer(attemptId){
 const user=await account();
 const {data,error}=await db().from('learning_attempts').select('answer_text').eq('user_id',user.id).eq('id',attemptId).maybeSingle();
 if(error)throw error;return data?.answer_text||'';
}
export function debounceCloudDraft(bank,questionId,text){
 if(!writable()||!VALID_BANKS.has(bank)||!/^[A-Za-z0-9_-]{1,90}$/.test(questionId))return;
 const key=(globalThis.portalVerifiedUserId||'')+':'+bank+':'+questionId;
 const value=String(text).slice(0,10000);
 clearTimeout(timers.get(key));
 if(savedDrafts.get(key)===value)return;
 timers.set(key,setTimeout(async()=>{
  timers.delete(key);
  try{
   const user=await account();
   const {error}=await db().from('learning_drafts').upsert({user_id:user.id,bank,question_id:questionId,draft_text:value,updated_at:new Date().toISOString()},{onConflict:'user_id,bank,question_id'});
   if(error)notify('pending','초안을 이 기기에 저장했습니다. 클라우드 동기화를 다시 확인해 주세요.');
   else savedDrafts.set(key,value);
  }catch{notify('pending','초안이 기기에만 저장되었습니다.');}
 },5000));
}
export async function fetchCloudDraft(bank,questionId){
 const user=await account();
 const {data,error}=await db().from('learning_drafts').select('draft_text').eq('user_id',user.id).eq('bank',bank).eq('question_id',questionId).maybeSingle();
 if(error)throw error;const text=data?.draft_text||'';savedDrafts.set(user.id+':'+bank+':'+questionId,text);return text;
}
if(typeof window!=='undefined'){
 window.addEventListener('online',()=>{readCache.clear();flushLearningQueue().catch(()=>{});});
 window.addEventListener('portal-learning-ready',()=>{flushLearningQueue().catch(()=>{});});
 window.addEventListener('storage',event=>{
  if(event.key?.startsWith('kbigdata:learning:pending:v2:')&&event.newValue)
   void flushLearningQueue().catch(()=>{});
 });
}

export async function fetchLearningGoal(bank){
 if(!VALID_BANKS.has(bank))throw new Error("INVALID_PROGRESS_BANK");
 const user=await account();
 const {data,error}=await db().from("learning_preferences").select("daily_goal").eq("user_id",user.id).eq("bank",bank).maybeSingle();
 if(error)throw error;return data?.daily_goal??null;
}
export async function saveLearningGoal(bank,dailyGoal){
 if(!VALID_BANKS.has(bank)||!Number.isInteger(dailyGoal)||dailyGoal<1||dailyGoal>350)throw new Error("INVALID_GOAL");
 if(!writable())throw new Error("READ_ONLY");
 const user=await account();
 const {error}=await db().from("learning_preferences").upsert({user_id:user.id,bank,daily_goal:dailyGoal,updated_at:new Date().toISOString()},{onConflict:"user_id,bank"});
 if(error)throw error;
}
