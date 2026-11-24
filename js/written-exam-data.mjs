/* Exam material lives in Supabase, never in the public GitHub Pages repository.
   The portal's authenticated Supabase client is initialized before learning modules. */
function getDb(){
 const db=window.portalSupabaseClient;
 if(!db||typeof db.from!=="function")throw Error("포털 데이터베이스 연결을 확인할 수 없습니다.");
 return db;
}
export async function loadWrittenExamQuestions(examType){
 const {data,error}=await getDb().from("written_question_bank")
  .select("payload").eq("exam_type",examType)
  .order("question_id",{ascending:true}).limit(1000);
 if(error)throw new Error("필기 문제 데이터 요청 실패: "+error.message);
 if(!Array.isArray(data))throw Error("필기 데이터 형식 오류");
 return data.map(item=>item.payload);
}

/* Scanned sessions are available only through authenticated Supabase.
   No original document or image is stored in GitHub Pages. */
export async function loadWrittenExamSession(examType,year,round){
 if(examType!=="industrial"||year!==2025||![1,2,3].includes(round))throw Error("지원하지 않는 기출 회차입니다.");
 const {data,error}=await getDb().from("written_exam_scanned_sources")
  .select("manifest").eq("exam_type",examType).eq("exam_year",year).eq("exam_round",round).maybeSingle();
 if(error)throw new Error("2025년 기출자료 조회 실패: "+error.message);
 if(!data?.manifest)throw Error("2025년 "+round+"회 자료가 등록되지 않았습니다.");
 return data.manifest;
}
