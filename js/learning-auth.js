import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,AUTH_MAX_DAYS,SUPER_ADMIN_EMAIL} from "./learning-config.js";
const LOGGED_AT_KEY="kbigdata:learning:authenticated-at:v1";
const EXPIRES_KEY="kbigdata:learning:expires-at:v1";
let clientPromise;
export function isConfigured(){return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(SUPABASE_URL)&&SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_");}
export async function getClient(){
 if(!isConfigured())return null;
 if(!clientPromise)clientPromise=import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.10/+esm")
  .then(({createClient})=>createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{
    persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:"kbigdata-learning-auth"
  }}));
 return clientPromise;
}
export function loginStarted(){return Number(localStorage.getItem(LOGGED_AT_KEY)||"0");}
export async function signOutPortal(){
 const client=await getClient();
 try{if(client)await client.rpc("revoke_portal_session");}catch{}
 try{if(client)await client.auth.signOut();}finally{
  localStorage.removeItem(LOGGED_AT_KEY);localStorage.removeItem(EXPIRES_KEY);
 }
}
export async function requestCode(email,signUp=false){
 const client=await getClient(); if(!client)throw Error("포털 인증 시스템을 아직 연결하지 않았습니다.");
 const {error}=await client.auth.signInWithOtp({email:email.trim().toLowerCase(),options:{shouldCreateUser:signUp}});
 if(error)throw error;
}
export async function verifyCode(email,token,{fullName="",studentNo=""}={}){
 const client=await getClient(); if(!client)throw Error("인증 서버를 설정하지 않았습니다.");
 const {error}=await client.auth.verifyOtp({email:email.trim().toLowerCase(),token:token.trim(),type:"email"});
 if(error)throw error;
 const {data:expires,error:sessionError}=await client.rpc("start_portal_session");
 if(sessionError){await signOutPortal();throw sessionError;}
 const now=Date.now(),limit=now+AUTH_MAX_DAYS*86400000;
 const expiration=Math.min(Date.parse(expires),limit);
 localStorage.setItem(LOGGED_AT_KEY,String(now));
 localStorage.setItem(EXPIRES_KEY,String(expiration));
 if(fullName.trim()){
  const {error:registerError}=await client.rpc("register_portal_member",{p_name:fullName.trim(),p_student_no:studentNo.trim()||null});
  if(registerError)throw registerError;
 }
 return getAccount();
}
export async function getAccount(){
 const client=await getClient();if(!client)return {configured:false,loggedIn:false};
 const {data:{session},error}=await client.auth.getSession();
 if(error||!session)return {configured:true,loggedIn:false};
 const starts=loginStarted(),expires=Number(localStorage.getItem(EXPIRES_KEY)||"0");
 if(!starts||Date.now()-starts>=AUTH_MAX_DAYS*86400000||!expires||Date.now()>=expires){
  await signOutPortal();return {configured:true,loggedIn:false,expired:true};
 }
 const [p,r]=await Promise.all([
  client.from("profiles").select("user_id,full_name,email,student_no,approval_status,enrollment_status,academic_year,class_name").eq("user_id",session.user.id).maybeSingle(),
  client.from("account_roles").select("role").eq("user_id",session.user.id).maybeSingle()
 ]);
 if(p.error)throw p.error;
 if(r.error)throw r.error;
 const role=r.data?.role||"student",profile=p.data||null;
 return {configured:true,loggedIn:true,user:session.user,profile,role,
  active:!!profile&&profile.approval_status==="approved"&&profile.enrollment_status==="enrolled",
  readOnly:!!profile&&profile.approval_status==="approved"&&profile.enrollment_status==="leave",
  isAdmin:role==="super_admin"&&session.user.email?.toLowerCase()===SUPER_ADMIN_EMAIL,
  expiresAt:expires};
}
export async function getLearningAccount({write=false}={}){
 const account=await getAccount();
 if(!account.loggedIn||!(account.active||(!write&&account.readOnly)))return null;
 return account;
}
export function koreanStatus(profile){
 if(!profile)return "가입 정보 미등록";
 const statuses={pending:"승인 대기",approved:"승인 완료",rejected:"가입 거절",suspended:"계정 정지"};
 const enrollments={enrolled:"재학",leave:"휴학",withdrawn:"자퇴",graduated:"졸업"};
 return (statuses[profile.approval_status]||"상태 확인 필요")+" · "+(enrollments[profile.enrollment_status]||"");
}
