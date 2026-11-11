/* Supabase-backed learning events. Events are appended, never overwritten. */
const VALID_BANKS=new Set(['coding','ncp','practical']);
const VALID_RESULTS=new Set(['correct','incorrect','completed','ungraded','timeout']);
const VALID_METHODS=new Set(['self','automatic','completion','none']);
const storage=globalThis.localStorage;
const timers=new Map();
let accountPromise=null;
const db=()=>globalThis.portalSupabaseClient;
const writable=()=>globalThis.portalLearning?.write===true && Date.now()<globalThis.portalLearning.expires;
const readable=()=>globalThis.portalLearning?.read===true && Date.now()<globalThis.portalLearning.expires;
async function account(){
 if(!db()||!readable())throw new Error('LOGIN_REQUIRED');
 if(!accountPromise)accountPromise=db().auth.getUser().then(({data,error})=>{
   if(error||!data?.user?.id)throw new Error('LOGIN_REQUIRED');
   return data.user;
 }).catch(error=>{accountPromise=null;throw error;});
 return accountPromise;
}
function queueKey(userId){return 'kbigdata:learning:pending:v2:'+userId;}
function pending(userId){
 try{const rows=JSON.parse(storage.getItem(queueKey(userId))||'[]');
  return Array.isArray(rows)?rows.filter(v=>v&&typeof v.client_attempt_id==='string').slice(-500):[];
 }catch{return [];}
}
function setPending(userId,items){storage.setItem(queueKey(userId),JSON.stringify(items.slice(-500)));}
function notify(state,message){
 document.dispatchEvent(new CustomEvent('portal-learning-sync',{detail:{state,message}}));
}
function cleanNumber(value){return Number.isFinite(value)?Math.max(0,Math.min(86400,Math.round(value))):null;}
function idFor(){return globalThis.crypto?.randomUUID?.()||'attempt-'+Date.now()+'-'+Math.random().toString(36).slice(2);}
function validate(data){
 if(!VALID_BANKS.has(data.bank)||!VALID_RESULTS.has(data.result)||!VALID_METHODS.has(data.gradingMethod))throw new Error('INVALID_LEARNING_EVENT');
 if(!/^[A-Za-z0-9_-]{1,90}$/.test(String(data.questionId||'')))throw new Error('INVALID_QUESTION_ID');
 if(data.gradingMethod==='automatic'&&data.bank==='coding')throw new Error('INVALID_CODING_GRADE');
 if(data.gradingMethod==='self'&&data.bank==='ncp')throw new Error('INVALID_NCP_GRADE');
}
let syncing=null;
export function flushLearningQueue(){
 if(syncing)return syncing;
 syncing=flushLearningInternal().finally(()=>{syncing=null;});
 return syncing;
}
async function flushLearningInternal(){
 if(!writable())return {state:'readonly'};
 const user=await account();
 let count=0;
 // Drain queued events in order; concurrent clicks must not discard new events.
 for(let iteration=0;iteration<5;iteration++){
  const records=pending(user.id);
  if(!records.length)break;
  const remain=[];
  for(const record of records){
   try{
    const {error}=await db().from('learning_attempts').insert(record);
    if(error&&error.code!=='23505')remain.push(record);
   }catch{remain.push(record);}
  }
  const processed=new Set(records.map(r=>r.client_attempt_id));
  const incoming=pending(user.id).filter(r=>!processed.has(r.client_attempt_id));
  setPending(user.id,[...remain,...incoming]);
  if(remain.length || !incoming.length)break;
 }
 count=pending(user.id).length;
 const state=count?'pending':'saved';
 notify(state,count?'일부 학습 기록이 기기에 대기 중입니다. 인터넷 연결 후 다시 동기화합니다.':'학습 결과가 클라우드에 저장되었습니다.');
 return {state,count};
}
export async function recordLearningAttempt(data){
 validate(data);
 if(!writable())return {state:'readonly',message:'읽기 전용 계정입니다.'};
 const user=await account();
 const event={
   user_id:user.id,bank:data.bank,question_id:String(data.questionId),
   client_attempt_id:String(data.clientAttemptId||idFor()).slice(0,160),
   result:data.result,grading_method:data.gradingMethod,
   answer_text:String(data.answerText||'').slice(0,10000),
   elapsed_seconds:cleanNumber(data.elapsedSeconds),
   used_hint:!!data.usedHint,
   question_revision:data.questionRevision?String(data.questionRevision).slice(0,120):null,
   metadata:{source:'portal',self_reported:data.gradingMethod==='self',...data.metadata}
 };
 const rows=pending(user.id);
 if(!rows.some(r=>r.client_attempt_id===event.client_attempt_id)){
   rows.push(event);
   setPending(user.id,rows);
 }
 notify('pending','학습 기록을 클라우드에 동기화하는 중입니다.');
 return flushLearningQueue();
}
export async function fetchLearningAttempts(){
 const user=await account();const all=[];
 for(let from=0;from<10000;from+=500){
  const {data,error}=await db().from('learning_attempts').select('id,bank,question_id,result,grading_method,submitted_at,used_hint,elapsed_seconds,client_attempt_id').eq('user_id',user.id).order('submitted_at',{ascending:false}).range(from,from+499);
  if(error)throw error;all.push(...(data||[]));if((data||[]).length<500)break;
 }
 return all;
}
export async function fetchLearningProgress(){
 const user=await account();const all=[];
 for(let from=0;from<10000;from+=500){
  const {data,error}=await db().from('learning_progress').select('bank,question_id,last_result,last_attempt_at,attempts_count,correct_count,incorrect_count').eq('user_id',user.id).order('last_attempt_at',{ascending:false}).range(from,from+499);
  if(error)throw error;all.push(...(data||[]));if((data||[]).length<500)break;
 }
 return all;
}
export function debounceCloudDraft(bank,questionId,text){
 if(!writable()||!VALID_BANKS.has(bank)||!/^[A-Za-z0-9_-]{1,90}$/.test(questionId))return;
 const key=bank+':'+questionId;
 clearTimeout(timers.get(key));
 timers.set(key,setTimeout(async()=>{
  timers.delete(key);
  try{
   const user=await account();
   const {error}=await db().from('learning_drafts').upsert({user_id:user.id,bank,question_id:questionId,draft_text:String(text).slice(0,10000),updated_at:new Date().toISOString()},{onConflict:'user_id,bank,question_id'});
   if(error)notify('pending','초안을 이 기기에 저장했습니다. 클라우드 동기화를 다시 확인해 주세요.');
  }catch{notify('pending','초안이 기기에만 저장되었습니다.');}
 },1600));
}
export async function fetchCloudDraft(bank,questionId){
 const user=await account();
 const {data,error}=await db().from('learning_drafts').select('draft_text').eq('user_id',user.id).eq('bank',bank).eq('question_id',questionId).maybeSingle();
 if(error)throw error;return data?.draft_text||'';
}
if(typeof window!=='undefined'){
 window.addEventListener('online',()=>{flushLearningQueue().catch(()=>{});});
 window.addEventListener('portal-learning-ready',()=>{flushLearningQueue().catch(()=>{});});
}
