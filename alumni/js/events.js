(function(){
 const U=AlumniUI,$=U.qs,esc=U.esc;
 const fmt=x=>new Date(x).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'});
 const permittedImages=['https://ai.k-bigdata.kr/assets/activities/project-presentation-2026.jpg','https://ai.k-bigdata.kr/assets/activities/project-awards-2026.webp'];
 const request=async(action,data={})=>(await AlumniAPI.request(action,{method:'POST',data})).data;
 const focusId=new URLSearchParams(location.search).get('id');
 async function load(){try{
  const rows=await request('eventList');
  $('#event-list').innerHTML=rows.length?rows.map(e=>`<article id="event-${esc(e.id)}" class="event-card"><span class="event-status">${esc(e.kind)}</span><h3>${esc(e.title)}</h3>${permittedImages.includes(e.image_url)?`<img class="event-photo" alt="이전 학과 활동 사진" src="${esc(e.image_url)}">`:''}<p>${esc(e.description)}</p><p><strong>일시</strong> ${esc(fmt(e.starts_at))}<br><strong>장소</strong> ${esc(e.venue)}${e.deadline?'<br><strong>신청 마감</strong> '+esc(fmt(e.deadline)):''}${e.capacity?'<br><strong>정원</strong> '+e.capacity+'명':''}</p>${e.requires_registration?`<div class="event-actions">${e.registration==='registered'?'<strong>신청 완료</strong><button class="button--secondary" data-action="cancel" data-id="'+esc(e.id)+'">신청 취소</button>':`<button data-action="register" data-id="${esc(e.id)}" ${e.deadline&&Date.parse(e.deadline)<Date.now()?'disabled':''}>참여 신청</button>`}</div>`:''}</article>`).join(''):'<p class="event-muted">현재 안내 중인 행사가 없습니다.</p>';
  if(focusId)document.getElementById('event-'+focusId)?.scrollIntoView({block:'start'});
 }catch(e){U.status($('#event-list'),e.message,'error')}}
 document.addEventListener('DOMContentLoaded',async()=>{
  await window.alumniPortalReady;if(document.documentElement.dataset.alumniPortalAuth!=='approved')return;
  const check=$('#event-consent'),save=$('#event-consent-save'),status=$('#event-consent-status');
  try{const pref=await request('eventPreference');check.checked=pref.enabled;check.disabled=false;save.disabled=false;}catch(e){U.status(status,e.message,'error')}
  save.onclick=async()=>{save.disabled=true;try{await request('eventPreference',{enabled:check.checked});U.status(status,check.checked?'수신 동의가 저장되었습니다.':'수신 거부가 저장되었습니다.','success');}catch(e){U.status(status,e.message,'error')}finally{save.disabled=false}};
  $('#event-list').onclick=async e=>{const b=e.target.closest('[data-action]');if(!b)return;b.disabled=true;try{await request('eventRegister',{id:b.dataset.id,cancel:b.dataset.action==='cancel'});await load()}catch(e){alert(e.message);b.disabled=false}};
  await load();
 });
})();
