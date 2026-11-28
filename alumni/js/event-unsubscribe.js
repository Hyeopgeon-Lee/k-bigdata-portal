const token=location.hash.slice(1),b=document.getElementById('unsubscribe-confirm'),s=document.getElementById('unsubscribe-status');
history.replaceState(null,'',location.pathname);
if(!/^[0-9a-f-]{36}\.[0-9a-f]{64}$/i.test(token)){b.disabled=true;s.textContent='올바르지 않은 수신 거부 링크입니다.';}
b.onclick=async()=>{b.disabled=true;try{
const response=await fetch('https://zjsindkakjfzmjgrkaou.supabase.co/functions/v1/alumni-network-api',{method:'POST',headers:{'Content-Type':'application/json',apikey:'sb_publishable_g8oFA9J2ZFiBc-86wa2Pew_7DzoCZab'},body:JSON.stringify({action:'eventUnsubscribe',data:{token}})});
const r=await response.json();if(!response.ok||!r.success)throw Error(r.message||'수신 거부 실패');s.textContent='행사·특강 안내 메일 수신 거부가 완료되었습니다.';
}catch(e){s.textContent=e.message;b.disabled=false}};
