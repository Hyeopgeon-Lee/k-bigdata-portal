export const FREE_DAILY=100, FREE_MONTHLY=3000;
export class MailQuotaError extends Error {}
const unavailable='Resend 사용량을 확인할 수 없어 메일 발송을 차단했습니다. 관리자 설정을 확인해 주세요.';
const windowData=(value,cap)=>{
 if(!value||!Number.isInteger(value.used)||value.used<0||!(value.limit===null||Number.isInteger(value.limit))||!value.resets_at||!Number.isFinite(Date.parse(value.resets_at)))throw new MailQuotaError(unavailable);
 const limit=Math.min(cap,value.limit===null?cap:value.limit);
 return {used:value.used,limit,remaining:Math.max(0,limit-value.used),resets_at:value.resets_at};
};
export async function getMailQuota(key,fetcher=fetch){
 if(!key)throw new MailQuotaError(unavailable);
 try{
  const response=await fetcher('https://api.resend.com/usage',{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error('QUOTA_HTTP_'+response.status);
  const data=await response.json();
  const daily=windowData(data.emails?.daily,FREE_DAILY),monthly=windowData(data.emails?.monthly,FREE_MONTHLY);
  return {daily,monthly,available:Math.min(daily.remaining,monthly.remaining)};
 }catch(e){if(e instanceof MailQuotaError)throw e;throw new MailQuotaError(unavailable);}
}
export function quotaDecision(quota,requested){
 if(!Number.isInteger(requested)||requested<0)throw new MailQuotaError('잘못된 발송 수량입니다.');
 if(requested<=quota.available)return {allowed:true,message:''};
 const which=quota.daily.remaining<=quota.monthly.remaining?'일일':'월간';
 return {allowed:false,message:'Resend '+which+' 무료 발송 한도를 '+(requested-quota.available)+'건 초과합니다. 발송 대상 '+requested+'명, 남은 '+quota.available+'건. 대상을 줄이거나 한도 초기화 후 다시 시도해 주세요. 이번 요청의 메일은 발송되지 않았습니다.'};
}
export async function quotaPreview(key,count,fetcher=fetch){
 try{const quota=await getMailQuota(key,fetcher);return {...quota,...quotaDecision(quota,count)};}
 catch(e){return {allowed:false,message:e.message,available:0};}
}
export async function withMailQuota(db,key,count,send){
 const token=crypto.randomUUID();
 const {data,error}=await db.rpc('portal_mail_lock',{p_token:token});
 if(error||data!==true)throw new MailQuotaError('다른 메일 발송이 진행 중이거나 한도 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
 try{
  const q=await getMailQuota(key),d=quotaDecision(q,count);
  if(!d.allowed)throw new MailQuotaError(d.message);
  return await send();
 }finally{await db.rpc('portal_mail_unlock',{p_token:token});}
}
