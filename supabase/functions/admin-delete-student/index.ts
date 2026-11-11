import {createClient} from "npm:@supabase/supabase-js@2.49.10";
const url=Deno.env.get("SUPABASE_URL")!, anon=Deno.env.get("SUPABASE_ANON_KEY")!, key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const headers={"Access-Control-Allow-Origin":"https://portal.k-bigdata.kr","Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json","Cache-Control":"no-store"};
const respond=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
const isUUID=(s:unknown)=>typeof s==="string"&&/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(s);
async function isAdministrator(request:Request){
  const auth=request.headers.get("authorization")||"";
  if(!/^Bearer [^\s]+$/i.test(auth))return false;
  const token=auth.substring(7);
  const caller=createClient(url,anon,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data:identity,error:identityError}=await caller.auth.getUser(token);
  if(identityError||identity.user?.email?.toLowerCase()!=="hglee67@kopo.ac.kr"||!identity.user.email_confirmed_at)return false;
  const {data:allowed,error}=await caller.rpc("portal_super_admin_allowed");
  return !error&&allowed===true;
}
async function getStudent(userId:string){
  const {data,error}=await admin.from("profiles").select("user_id,full_name,email,student_no,signup_type,enrollment_status,updated_at")
    .eq("user_id",userId).maybeSingle();
  if(error)throw Error("PROFILE_READ_FAILED");
  if(!data)throw Error("NOT_FOUND");
  if(data.enrollment_status!=="withdrawn"||data.signup_type==="alumni"||data.email?.toLowerCase()==="hglee67@kopo.ac.kr")
    throw Error("NOT_WITHDRAWN");
  const {data:roles,error:roleError}=await admin.from("account_roles").select("role").eq("user_id",userId);
  if(roleError)throw Error("ROLE_CHECK_FAILED");
  if((roles||[]).some(role=>role.role==="super_admin"))throw Error("ADMIN_PROTECTED");
  return data;
}
async function findMany(table:string,column:string,value:string,fields:string){
  const collected:any[]=[];
  for(let page=0;page<10;page++){
    const {data,error}=await admin.from(table).select(fields).eq(column,value).range(page*500,page*500+499);
    if(error)throw Error("READ_FAILED_"+table);
    collected.push(...(data||[]));
    if(!data||data.length<500)return collected;
  }
  throw Error("DATA_LIMIT");
}
async function count(table:string,column:string,id:string){
  const {count,error}=await admin.from(table).select("*",{head:true,count:"exact"}).eq(column,id);
  if(error)throw Error("COUNT_FAILED_"+table);
  return count||0;
}
async function legacyEntries(table:string,student:any){
  if(!student.student_no||!student.full_name)return [];
  const {data,error}=await admin.from(table).select("id")
    .eq("source","legacy").is("owner_id",null)
    .eq("legacy_student_no",student.student_no).eq("legacy_student_name",student.full_name)
    .limit(5001);
  if(error||(data||[]).length>5000)throw Error("LEGACY_LOOKUP_FAILED");
  return data||[];
}
async function removeLegacy(table:string,student:any,ids:string[]){
  for(let i=0;i<ids.length;i+=100){
    const {error}=await admin.from(table).delete().in("id",ids.slice(i,i+100))
      .eq("source","legacy").is("owner_id",null)
      .eq("legacy_student_no",student.student_no).eq("legacy_student_name",student.full_name);
    if(error)throw Error("LEGACY_CLEANUP_FAILED_"+table);
  }
}

async function inventory(student:any){
  const [ownedRequests,legacyRequests,legacyRooms]=await Promise.all([
    findMany("help_requests","owner_id",student.user_id,"id"),
    legacyEntries("help_requests",student),legacyEntries("room_reservations",student)
  ]);
  const requests=[...ownedRequests,...legacyRequests];
  const ownFiles=await findMany("help_attachments","uploader_id",student.user_id,"storage_path");
  const paths=new Set<string>(ownFiles.map(x=>x.storage_path).filter(Boolean));
  for(let i=0;i<requests.length;i+=100){
    const {data,error}=await admin.from("help_attachments").select("storage_path")
      .in("request_id",requests.slice(i,i+100).map(x=>x.id)).limit(5001);
    if(error||(data||[]).length>5000)throw Error("FILE_INVENTORY_FAILED");
    for(const row of data||[])if(row.storage_path)paths.add(row.storage_path);
  }
  const [learning,progress,drafts,reservations,mail,messages,favorites]=await Promise.all([
    count("learning_attempts","user_id",student.user_id),
    count("learning_progress","user_id",student.user_id),
    count("learning_drafts","user_id",student.user_id),
    count("room_reservations","owner_id",student.user_id),
    count("report_deliveries","recipient_user_id",student.user_id),
    count("help_messages","author_id",student.user_id),
    count("user_favorites","user_id",student.user_id)
  ]);
  return {version:student.updated_at,paths:[...paths],
    legacyRequestIds:legacyRequests.map(x=>x.id),legacyRoomIds:legacyRooms.map(x=>x.id),
    counts:{learning,progress,drafts,reservations:reservations+legacyRooms.length,mail,messages,favorites,
      requests:requests.length,files:paths.size}};
}
async function removeRows(table:string,column:string,value:string){
  const {error}=await admin.from(table).delete().eq(column,value);
  if(error)throw Error("CLEANUP_FAILED_"+table);
}
async function erase(student:any,stock:any){
  for(let i=0;i<stock.paths.length;i+=100){
    const {error}=await admin.storage.from("help-attachments").remove(stock.paths.slice(i,i+100));
    if(error)throw Error("STORAGE_DELETE_FAILED");
  }
  const id=student.user_id;
  await removeRows("help_messages","author_id",id);
  await removeRows("help_attachments","uploader_id",id);
  await removeRows("help_requests","owner_id",id);
  await removeLegacy("help_requests",student,stock.legacyRequestIds);
  await removeRows("room_reservations","owner_id",id);
  await removeLegacy("room_reservations",student,stock.legacyRoomIds);
  await removeRows("report_deliveries","recipient_user_id",id);
  if(student.email)await removeRows("report_deliveries","recipient_email",student.email);
  await removeRows("admin_audit_log","target_user_id",id);
  // On-delete CASCADE removes linked profile, auth session, learning and personal records.
  const {error}=await admin.auth.admin.deleteUser(id);
  if(error)throw Error("AUTH_DELETE_FAILED");
}
Deno.serve(async request=>{
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
  if(request.method!=="POST")return respond({error:"METHOD_NOT_ALLOWED"},405);
  if(request.headers.get("origin")&&request.headers.get("origin")!=="https://portal.k-bigdata.kr")
    return respond({error:"ORIGIN_DENIED"},403);
  if(!await isAdministrator(request))return respond({error:"ADMIN_DENIED"},403);
  try{
    const input=await request.json();
    if(!isUUID(input?.userId)||!["preview","delete"].includes(input?.action))return respond({error:"INVALID_REQUEST"},400);
    const student=await getStudent(input.userId),stock=await inventory(student);
    if(input.action==="preview")return respond({ok:true,fullName:student.full_name,counts:stock.counts,version:stock.version});
    if(input.fullName!==student.full_name||input.confirmWord!=="영구삭제"||input.version!==stock.version)
      return respond({error:"CONFIRMATION_MISMATCH"},409);
    await erase(student,stock);
    return respond({ok:true,deleted:true});
  }catch(error){
    const message=error instanceof Error?error.message:"UNKNOWN_ERROR";
    console.error("admin-delete-student:",message);
    return respond({error:message},["NOT_FOUND","NOT_WITHDRAWN","ADMIN_PROTECTED","CONFIRMATION_MISMATCH"].includes(message)?409:500);
  }
});