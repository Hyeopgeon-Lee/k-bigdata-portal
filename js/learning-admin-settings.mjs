/* Only loaded in the authorized operations tab. */
if(window.portalAdminAllowed!==true)throw Error('ADMIN_SESSION_REQUIRED');
const db=window.portalSupabaseClient,get=id=>document.getElementById(id);
const mailInputs={
 super_admin:get('teacher-mail-faculty'),
 student:get('teacher-mail-students')
};
const mailStatus=get('teacher-mail-status');
function setMailStatus(message,visible=false){
 mailStatus.textContent=message;
 mailStatus.classList.toggle('learn-sr-only',!visible);
}
function showMailState(type,enabled){
 const input=mailInputs[type];
 if(input)input.checked=enabled;
}
async function loadMailSettings(){
 setMailStatus('설정 확인 중…',true);
 for(const input of Object.values(mailInputs))input.disabled=true;
 const {data,error}=await db.functions.invoke('learning-admin',{body:{action:'mail_settings'}});
 if(error||!data?.ok||!Array.isArray(data.settings)){
  get('teacher-mail-settings').hidden=true;
  setMailStatus('메일 설정을 불러오지 못했습니다. 새로고침 후 다시 시도하세요.',true);
  return;
 }
 const faculty=data.settings.find(x=>x.report_type==='super_admin');
 const students=data.settings.find(x=>x.report_type==='student');
 if(typeof faculty?.enabled!=='boolean'||typeof students?.enabled!=='boolean'){
  get('teacher-mail-settings').hidden=true;
  setMailStatus('메일 설정을 확인할 수 없습니다.',true);
  return;
 }
 showMailState('super_admin',faculty.enabled);
 showMailState('student',students.enabled);
 for(const input of Object.values(mailInputs))input.disabled=false;
 get('teacher-mail-settings').hidden=false;
 setMailStatus('메일 발송 설정을 불러왔습니다.');
}
async function saveMailSetting(type,enabled){
 const input=mailInputs[type];
 const previous=!enabled;
 input.disabled=true;
 setMailStatus('설정 저장 중…');
 try{
  const {data,error}=await db.functions.invoke('learning-admin',{body:{
   action:'update_mail_setting',reportType:type,enabled
  }});
  if(error||!data?.ok||data.setting?.report_type!==type||data.setting?.enabled!==enabled)
   throw new Error('MAIL_SETTING_NOT_SAVED');
  showMailState(type,enabled);
  setMailStatus('저장되었습니다.');
 }catch(error){
  console.error('Weekly mail setting update failed',error);
  showMailState(type,previous);
  setMailStatus('저장하지 못했습니다. 다시 시도하세요.',true);
 }finally{
  input.disabled=false;
 }
}
for(const [type,input] of Object.entries(mailInputs)){
 input?.addEventListener('change',()=>{void saveMailSetting(type,input.checked);});
}

const absence=get('study-admin-mail'),absenceStatus=get('study-mail-status');
async function loadAbsence(){
 absence.disabled=true;absenceStatus.textContent='발송 설정 확인 중…';
 try{const {data,error}=await db.from('study_settings').select('enabled').eq('setting_key','absence_email').single();if(error||typeof data?.enabled!=='boolean')throw error||Error('SETTING_MISSING');absence.checked=data.enabled;absence.disabled=false;absenceStatus.textContent='설정을 불러왔습니다.';}catch{absenceStatus.textContent='메일 발송 설정을 조회하지 못했습니다.';}
}
absence.addEventListener('change',async()=>{
 const wanted=absence.checked;absence.disabled=true;absenceStatus.textContent='저장 중…';
 try{const {data,error}=await db.from('study_settings').update({enabled:wanted,updated_at:new Date().toISOString()}).eq('setting_key','absence_email').select('enabled').single();if(error||data?.enabled!==wanted)throw error||Error('SETTING_NOT_SAVED');absenceStatus.textContent='저장되었습니다.';}catch{absence.checked=!wanted;absenceStatus.textContent='저장하지 못했습니다.';}finally{absence.disabled=false;}
});
export function activateSettings(){return Promise.allSettled([loadMailSettings().catch(()=>setMailStatus('메일 설정을 조회하지 못했습니다.',true)),loadAbsence()]);}
get('learning-settings-refresh').addEventListener('click',()=>void activateSettings());
