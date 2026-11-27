/* Exam material lives in Supabase, never in the public GitHub Pages repository.
   The portal's authenticated Supabase client is initialized before learning modules. */
function getDb(){
 const db=window.portalSupabaseClient;
 if(!db||typeof db.from!=="function")throw Error("포털 데이터베이스 연결을 확인할 수 없습니다.");
 return db;
}
export async function loadWrittenExamQuestions(examType){
 const {data,error}=await getDb().rpc("portal_written_index",{p_exam_type:examType});
 if(!error&&Array.isArray(data))return data;
 // Compatible with the old database in local QA and upgrades.
 return loadFullBank(examType);
}
export async function loadWrittenDetails(examType,ids){
 const unique=[...new Set(ids)],result=[];
 for(let i=0;i<unique.length;i+=100){
  const batch=unique.slice(i,i+100);
  const {data,error}=await getDb().rpc("portal_written_details",{p_exam_type:examType,p_ids:batch});
  if(error)throw error;
  if(!Array.isArray(data)||data.length!==batch.length)throw Error("문제 상세 데이터가 누락되었습니다.");
  result.push(...data);
 }
 return result;
}
async function loadFullBank(examType){
 const items=[];
 const pageSize=500;
 for(let offset=0;;offset+=pageSize){
  const {data,error}=await getDb().from("written_question_bank")
   .select("payload").eq("exam_type",examType)
   .order("question_id",{ascending:true}).range(offset,offset+pageSize-1);
  if(error)throw new Error("필기 문제 데이터 요청 실패: "+error.message);
  if(!Array.isArray(data))throw Error("필기 데이터 형식 오류");
  items.push(...data);
  if(data.length<pageSize)break;
 }
 return items.map(item=>item.payload);
}
