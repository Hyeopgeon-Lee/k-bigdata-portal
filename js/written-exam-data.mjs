/* Exam material lives in Supabase, never in the public GitHub Pages repository.
   The portal's authenticated Supabase client is initialized before learning modules. */
function getDb(){
 const db=window.portalSupabaseClient;
 if(!db||typeof db.from!=="function")throw Error("포털 데이터베이스 연결을 확인할 수 없습니다.");
 return db;
}
export async function loadWrittenExamQuestions(examType){
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
