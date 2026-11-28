// Isolated Supabase fixture for browser QA. Account state persists across local pages.
export async function approvedStudent(context, profileOverride={}, registeredAlumni=false, superAdmin=false, adminFixtures=false){
 await context.route("https://esm.sh/@supabase/supabase-js@*",route=>route.fulfill({
  contentType:"application/javascript",
  headers:{"Access-Control-Allow-Origin":"*"},
  body: String.raw`export const createClient=()=>{
   const key="__qa_supabase_storage_v2";
   function database(){try{return JSON.parse(localStorage.getItem(key)||"{}");}catch{return {};}}
   function save(db){localStorage.setItem(key,JSON.stringify(db));}
   const user={id:"fixture",email:"student@example.test"};
   const fixtureLearningAttempt={bank:"coding",question_id:"JAVA-001",result:"correct",grading_method:"self",submitted_at:new Date().toISOString()};
   const profileOverride=${JSON.stringify(profileOverride)};
   const registeredAlumni=${JSON.stringify(registeredAlumni)};
   const superAdmin=${JSON.stringify(superAdmin)};
   const adminFixtures=${JSON.stringify(adminFixtures)};
   const fixtureMember={user_id:"11111111-1111-4111-8111-111111111111",full_name:"테스트 학생",student_no:"2026000001",academic_year:1,signup_type:"student",approval_status:"approved",enrollment_status:"enrolled",email:"test@example.test",email_mask:"te***@example.test"};
   const adminStudents=[fixtureMember,{...fixtureMember,user_id:"22222222-2222-4222-8222-222222222221",full_name:"2학년 학생 A",academic_year:2,student_no:"2025000001"},{...fixtureMember,user_id:"22222222-2222-4222-8222-222222222222",full_name:"2학년 학생 B",academic_year:2,student_no:"2025000002"}];
   const pendingStudents=adminStudents.slice(0,2).map((s,i)=>({...s,user_id:"33333333-3333-4333-8333-33333333333"+i,full_name:i?"2학년 가입 대기":"1학년 가입 대기",approval_status:"pending"}));
   const adminAlumni=[{alumni_id:"22222222-2222-4222-8222-222222222222",name:"졸업생 테스트",graduation_year:2025,company:"테스트 회사",employment_status:"취업",approval_status:"approved",career_mail_enabled:true,alumni_news_mail_enabled:false,status:"APPROVED"},{alumni_id:"22222222-2222-4222-8222-222222222223",name:"2026 졸업생",graduation_year:2026,company:"다른 회사",employment_status:"구직",approval_status:"approved",career_mail_enabled:false,alumni_news_mail_enabled:false,status:"APPROVED"}];
   const adminTables={
    student_certifications:adminStudents.map((s,i)=>({id:"cert-"+i,user_id:s.user_id,certificate_name:i?"정보처리산업기사":"SQLD",pass_status:"final",verification_status:i===2?"pending":"verified",final_pass_date:"2026-11-20",created_at:"2026-11-20"})),
    room_reservations:adminStudents.map((s,i)=>({id:"room-"+i,owner_id:s.user_id,room_code:i?"8319":"8318",starts_at:new Date().toISOString(),ends_at:new Date(Date.now()+3600000).toISOString(),purpose:i?"2학년 예약":"1학년 예약",status:i===2?"CANCELLED":"ACTIVE",created_at:new Date().toISOString()})),
    help_requests:adminStudents.map((s,i)=>({id:"help-"+i,owner_id:s.user_id,category:"기타",location:"온라인 포털",title:i?"2학년 요청":"1학년 요청",status:i===2?"COMPLETED":"RECEIVED",created_at:new Date().toISOString()}))
   };
   function from(table){
    let mode="select",where=[],ordering=null,max=1000,offset=0,values=null;
    const match=(row)=>where.every(([type,k,v])=>{
     const x=row[k];if(type==="eq")return x===v;if(type==="in")return v.includes(x);
     if(type==="gte")return x>=v;if(type==="lte")return x<=v;
     if(type==="lt")return x<v;if(type==="neq")return x!==v;return true;
    });
    function execute(){
     if(table==="profiles")return {data:[{user_id:user.id,full_name:"Student",approval_status:"approved",enrollment_status:"enrolled",signup_type:"student",...profileOverride}].filter(match),error:null};
     const db=database(),rows=db[table]||(superAdmin&&adminFixtures?adminTables[table]:null)||[];
     if(mode==="delete"){db[table]=rows.filter(row=>!match(row));save(db);return {data:[],error:null};}
     if(mode==="update"){
      const updated=rows.map(row=>match(row)?{...row,...values}:row);
      db[table]=updated;save(db);return {data:updated.filter(match),error:null};
     }
     let data=rows.filter(match);
     if(ordering){const [col,ascending]=ordering;data=data.slice().sort((a,b)=>(String(a[col]||"").localeCompare(String(b[col]||"")))*(ascending?1:-1));}
     return {data:data.slice(offset,offset+max),count:data.length,error:null};
    }
    const builder={
     select(){mode="select";return this;},
     eq(k,v){where.push(["eq",k,v]);return this;},
     in(k,v){where.push(["in",k,v]);return this;},
     gte(k,v){where.push(["gte",k,v]);return this;},
     lte(k,v){where.push(["lte",k,v]);return this;},
     lt(k,v){where.push(["lt",k,v]);return this;},
     neq(k,v){where.push(["neq",k,v]);return this;},
     order(k,options={}){ordering=[k,options.ascending!==false];return this;},
     limit(n){max=n;return this;},
     range(a,b){offset=a;max=b-a+1;return this;},
     or(){return this;},
     delete(){mode="delete";return this;},
     update(row){mode="update";values=row;return this;},
     upsert(items){return this.insert(items,true);},
     insert(items,merge=false){
      const db=database(),rows=db[table]||[];
      for(const original of (Array.isArray(items)?items:[items])){
       const row={...original};
       if(table==="personal_tasks"){
        row.id??="fixture-task-"+Date.now()+"-"+Math.random();
        row.status??="open";row.created_at??=new Date().toISOString();
       }
       if(table==="user_favorites")row.created_at??=new Date().toISOString();
       const keys={user_favorites:["user_id","service_id"],user_recent_services:["user_id","service_id"],
        daily_task_checks:["user_id","task_date","task_key"],user_preferences:["user_id"]}[table];
       const old=merge&&keys?rows.findIndex(r=>keys.every(k=>r[k]===row[k])):-1;
       if(old>=0)rows[old]={...rows[old],...row};else rows.push(row);
      }
      db[table]=rows;save(db);return Promise.resolve({data:[],error:null});
     },
     maybeSingle(){const result=execute();return Promise.resolve({...result,data:result.data[0]||null});},
     single(){const result=execute();return Promise.resolve({...result,data:result.data[0]||null});},
     then(resolve,reject){return Promise.resolve(execute()).then(resolve,reject);}
    };
    return builder;
   }
   return {
    auth:{
     onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}};},
     async getUser(){return {data:{user}};},
     async getSession(){return {data:{session:{access_token:"fixture-token"}},error:null};},
     async signOut(){return {error:null};},
     async signInWithPassword(){return {error:null};}
    },
    from,
    functions:{async invoke(name,{body}={}){
      if(adminFixtures&&superAdmin&&name==="learning-admin"&&body?.action==="summary"){
       const count=body.grade===1?1:body.grade===2?2:3;
       const grades=(body.grade?[body.grade]:[1,2]).map(g=>({grade:g,cohortSize:g,activeStudents:g,attempts:g*3}));
       const chartStats={cohortSize:count,activeStudents:count,attempts:count*3,grades,subjects:{JAVA:{participants:count,attempts:count*3}},gradingMethods:{self:count,automatic:0},questions:[],smallCohortHidden:true,daily:[]};
       return {data:{ok:true,cohortSize:count,periodStart:"2026-11-23T00:00:00+09:00",periodEnd:"2026-11-30T00:00:00+09:00",partial:true,current:{chartStats,activeStudents:count,participationRate:100,attempts:count*3,unique:count,selfCorrect:count*2,selfTotal:count*3,selfAccuracy:67,autoCorrect:0,autoTotal:0,autoAccuracy:null,subjects:{JAVA:{attempts:count*3,unique:count,wrong:count}}},previous:null,topWrong:[],snapshotStatus:"live"},error:null};
      }
      return {data:{ok:false,error:"ADMIN_NOT_AUTHORIZED"},error:null};
     }},
    async rpc(name,args){
      if(adminFixtures&&superAdmin){
       if(name==="admin_list_students")return {data:adminStudents,error:null};
       if(name==="admin_pending_signup_requests")return {data:pendingStudents,error:null};
       if(name==="admin_alumni_directory"){
        const rows=adminAlumni.filter(x=>!args?.p_year||String(x.graduation_year)===String(args.p_year));
        return {data:{rows,total:rows.length,employment_values:["취업","구직"],companies:rows.length,mentor_count:0},error:null};
       }
       if(name==="admin_user_list"){
        let rows=adminStudents.filter(x=>!args?.p_grade||x.academic_year===args.p_grade);
        if(args?.p_approval==="pending")rows=pendingStudents.filter(x=>!args.p_grade||x.academic_year===args.p_grade);
        if(args?.p_attention==="academic")rows=[];
        if(args?.p_attention==="inactive"||args?.p_attention==="no_plan"||args?.p_attention==="no_cert")rows=rows.filter(x=>x.academic_year===2);
        return {data:{rows:rows.slice(0,args?.p_size||25),total:rows.length,counts:{all:3,grade1:1,grade2:2,enrolled:3,leave:0,withdrawn:0,graduated:0,early_employment:0,pending:2,requests:0,mail_failed:0}},error:null};
       }
       if(name==="admin_user_detail")return {data:args?.p_tab==="learning"?{summary:[],recent:[],mocks:[]}:{profile:adminStudents.find(x=>x.user_id===args?.p_user_id)||fixtureMember,weekly_opt_in:false},error:null};
       if(name==="study_admin_dashboard"){
        const start=args.p_week_start+"T09:00:00+09:00",one=adminStudents.find(s=>s.academic_year===1).user_id,two=adminStudents.find(s=>s.academic_year===2).user_id;
        const sessions=[
         {user_id:one,started_at:start,status:"completed",duration_seconds:3600},
         {user_id:one,started_at:start,status:"completed",duration_seconds:1800},
         {user_id:two,started_at:start,status:"completed",duration_seconds:7200},
         {user_id:adminStudents.filter(s=>s.academic_year===2)[1].user_id,started_at:start,status:"needs_review",duration_seconds:3600},
         {user_id:adminStudents.filter(s=>s.academic_year===2)[1].user_id,started_at:start,status:"completed",duration_seconds:0}
        ];
        return {data:{students:adminStudents.map(s=>({id:s.user_id,name:s.full_name,academic_year:s.academic_year})),plans:[],sessions,reasons:[],email_enabled:false},error:null};
       }
       if(name==="study_admin_diagnostics")return {data:{stale:[],reviews:[],errors:[]},error:null};
       if(name==="portal_written_summary")return {data:adminStudents.filter(x=>!args?.p_grade||x.academic_year===args.p_grade).map(x=>({...x,attempts:1,completed:0,passed:0,solved:1,unique_count:1,mocks:0,rounds:[]})),error:null};
       if(name==="portal_admin_health_summary")return {data:{observedAt:new Date().toISOString(),dbConnections:3,dbMaxConnections:20},error:null};
      }
      if(name==="admin_user_list")return {data:{rows:[fixtureMember],total:1,counts:{all:1,grade1:1,enrolled:1}},error:null}; if(name==="admin_user_detail")return {data:args?.p_tab==="learning"?{summary:[],recent:[],mocks:[]}:{profile:fixtureMember,weekly_opt_in:false},error:null};if(name==="admin_alumni_directory")return {data:{rows:[{alumni_id:"22222222-2222-4222-8222-222222222222",name:"졸업생 테스트",graduation_year:2025,company:"테스트 회사",approval_status:"approved",career_mail_enabled:true,alumni_news_mail_enabled:false,status:"APPROVED"}],total:1,employment_values:[],companies:1,mentor_count:0},error:null}; if(name==="admin_alumni_requests")return {data:{rows:[],total:0},error:null};return {data:({portal_bootstrap:{profile:{user_id:user.id,full_name:"Student",approval_status:"approved",enrollment_status:"enrolled",signup_type:"student",...profileOverride},expires:new Date(Date.now()+90*86400000).toISOString(),access:{read:true,write:true},admin:superAdmin},
     start_portal_session:new Date(Date.now()+90*86400000).toISOString(),
     portal_learning_access:{read:true,write:true},portal_my_learning_overview:{period:[fixtureLearningAttempt],progress:[fixtureLearningAttempt],review:[],recent:[fixtureLearningAttempt],count:1,recovered:0},portal_super_admin_allowed:superAdmin,admin_list_students:[],admin_pending_signup_requests:[],my_alumni_profile_registered:registeredAlumni})[name]};}
   };
  };`
 }));
}
