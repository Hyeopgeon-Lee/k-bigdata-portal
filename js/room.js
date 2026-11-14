/* Private 8318/8319 project room reservations: Supabase RLS is authoritative. */
const db=window.portalSupabaseClient;
const byId=id=>document.getElementById(id);
const rooms=['8318','8319'];
const purposes=[
 ['프로젝트','프로젝트 · 팀 회의'],['학생 모임','스터디 · 학습'],
 ['학과 회의','학과 행사 준비'],['수업/세미나','수업 · 교육 · 세미나'],
 ['상담/면담','학생 상담 · 면담'],['면접','발표 · 면접 연습'],['기타','기타 학과 업무']
];
const labels=Object.fromEntries(purposes);
let person=null,admin=false,allowed=false,selectedRoom='8318',selectedDate='',selectedTab='status',refreshSeq=0;
function element(tag,text,className){
 const n=document.createElement(tag);
 if(text!==undefined&&text!==null)n.textContent=String(text);
 if(className)n.className=className;
 return n;
}
function tell(message){byId('room-feedback').textContent=message||'';}
function bookingNotice(message,kind='error'){
 const node=byId('room-booking-feedback');
 node.textContent=message||'';
 node.hidden=!message;
 node.dataset.kind=kind;
}
function timeMinutes(time){
 const match=/^(\d{2}):(\d{2})$/.exec(time||'');
 if(!match)return NaN;
 const hours=Number(match[1]),minutes=Number(match[2]);
 return hours*60+minutes;
}
function readableDuration(minutes){
 const hours=Math.floor(minutes/60),remain=minutes%60;
 return [hours?hours+'시간':'',remain?remain+'분':''].filter(Boolean).join(' ');
}
function bookingValidation(form){
 const date=form.elements.date.value,start=form.elements.start.value,end=form.elements.end.value;
 if(!date||!start||!end)return {ok:false,message:'예약 날짜, 시작 시간, 종료 시간을 모두 선택해 주세요.'};
 const from=timeMinutes(start),to=timeMinutes(end),minutes=to-from;
 if(!Number.isFinite(minutes))return {ok:false,message:'예약 시간을 다시 선택해 주세요.'};
 if(minutes<=0)return {ok:false,message:'종료 시간은 시작 시간보다 늦어야 합니다.'};
 if(from<540||to>1320||from%30||to%30)return {ok:false,message:'예약은 09:00~22:00 사이에 30분 단위로 가능합니다.'};
 if(minutes>180){
  const latest=String(Math.floor((from+180)/60)).padStart(2,'0')+':'+String((from+180)%60).padStart(2,'0');
  return {ok:false,message:'예약은 최대 3시간까지 가능합니다. 현재 '+readableDuration(minutes)+' ('+start+'~'+end+')을 선택했습니다. 종료 시간을 '+latest+'까지로 변경해 주세요.'};
 }
 const begins=new Date(date+'T'+start+':00+09:00');
 if(!Number.isFinite(begins.getTime())||begins.getTime()<=Date.now())
  return {ok:false,message:'이미 지난 시간은 예약할 수 없습니다. 미래 날짜와 시간을 선택해 주세요.'};
 return {ok:true,minutes,begins,ends:new Date(date+'T'+end+':00+09:00')};
}
function refreshDurationHint(){
 const check=bookingValidation(byId('room-booking-form'));
 const hint=byId('room-duration-hint');
 hint.textContent=check.ok?'선택한 예약 시간: '+readableDuration(check.minutes)+' (최대 3시간)':check.message;
 hint.classList.toggle('is-invalid',!check.ok);
 bookingNotice('');
}
function koreaParts(date=new Date()){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(date).map(x=>[x.type,x.value]));
 return {date:p.year+'-'+p.month+'-'+p.day,hour:Number(p.hour)%24,minute:Number(p.minute)};
}
function dateAfter(days){const p=koreaParts();const utc=new Date(p.date+'T12:00:00+09:00');utc.setUTCDate(utc.getUTCDate()+days);return koreaParts(utc).date;}
function koreanTime(raw){return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(raw));}
function prettyDate(raw){return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric',weekday:'short'}).format(new Date(raw+'T12:00:00+09:00'));}
function prettyDateTime(raw){return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(raw));}
function toInstant(date,time){return new Date(date+'T'+time+':00+09:00').toISOString();}
function setTab(name){
 selectedTab=name;
 for(const b of document.querySelectorAll('[data-room-tab]'))b.setAttribute('aria-selected',String(b.dataset.roomTab===name));
 for(const section of document.querySelectorAll('[data-room-panel]'))section.hidden=section.dataset.roomPanel!==name;
 if(name==='status')loadSchedule();
 if(name==='mine')loadMine();


}
function setRoom(code,openForm=false){
 selectedRoom=rooms.includes(code)?code:'8318';
 byId('room-choice').value=selectedRoom;
 for(const b of document.querySelectorAll('[data-room-option]')){
   b.classList.toggle('is-selected',b.dataset.roomOption===selectedRoom);
   b.setAttribute('aria-pressed',String(b.dataset.roomOption===selectedRoom));
 }
 if(openForm)setTab('new');else if(selectedTab==='status')loadSchedule();
}
function buildDates(){
 const container=byId('room-dates');container.replaceChildren();
 const weekday=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',weekday:'short'});
 for(let offset=0;offset<5;offset++){
  const date=dateAfter(offset);
  const [month,day]=date.slice(5).split('-').map(Number);
  const dayName=weekday.format(new Date(date+'T12:00:00+09:00'));
  const btn=element('button',null,'room-date');
  btn.type='button';
  btn.setAttribute('aria-pressed',String(selectedDate===date));
  btn.setAttribute('aria-label',(offset===0?'오늘, ':'')+prettyDate(date)+' 예약 현황');
  btn.append(
   element('span',offset===0?'오늘':dayName,'room-date-weekday'),
   element('strong',month+'.'+day,'room-date-number')
  );
  btn.addEventListener('click',()=>{selectedDate=date;byId('room-date').value=date;buildDates();loadSchedule();});
  container.append(btn);
 }
}
function drawSchedule(items){
 const root=byId('room-schedule');root.replaceChildren();
 for(const room of rooms){
  const reservations=items.filter(x=>x.room_code===room);
  const card=element('article',null,'room-tile'+(reservations.length?'':' is-available'));
  const heading=element('div',null,'room-tile-head');
  heading.append(element('h3',room+'호'),
   element('span',reservations.length?'예약 '+reservations.length+'건':'예약 없음',
    'room-pill'+(reservations.length?'':' is-available')));
  card.append(heading);
  if(!reservations.length)card.append(element('p','현재 등록된 예약이 없습니다.','room-availability'));
  else for(const item of reservations){
    const slot=element('div',null,'room-booked');
    slot.append(element('strong',koreanTime(item.starts_at)+'–'+koreanTime(item.ends_at)));
    slot.append(element('span',labels[item.purpose]||item.purpose,'room-muted'));
    card.append(slot);
  }
  const book=element('button',room+'호 예약하기','room-primary');
  book.type='button';book.addEventListener('click',()=>{byId('room-date').value=selectedDate;setRoom(room,true);});
  card.append(book);root.append(card);
 }
}
async function loadSchedule(){
 const seq=++refreshSeq;const root=byId('room-schedule');
 root.replaceChildren(element('p','예약 현황을 불러오는 중...','room-muted'));
 const {data,error}=await db.rpc('room_schedule',{p_date:selectedDate});
 if(seq!==refreshSeq)return;
 if(error){root.replaceChildren(element('p','예약 현황을 확인할 수 없습니다. 로그인 상태를 확인해 주세요.','room-error'));return;}
 drawSchedule(data||[]);
}
function detailsRow(r){
 const card=element('article',null,'room-my-card');
 const heading=element('div',null,'room-row');
 const status=r.status==='ACTIVE'?'예약 중':'취소됨';
 heading.append(element('strong',r.room_code+'호 · '+prettyDateTime(r.starts_at)+'–'+koreanTime(r.ends_at)));
 heading.append(element('span',status,'room-pill '+(r.status==='CANCELLED'?'is-cancelled':'')));
 card.append(heading);
 card.append(element('p',(labels[r.purpose]||r.purpose)+(r.memo?' · '+r.memo:''),'room-muted'));
 if(r.status==='ACTIVE'){
  const btn=element('button','예약 취소','room-secondary');btn.type='button';
  btn.onclick=async()=>{
   if(!window.confirm(r.room_code+'호 '+prettyDateTime(r.starts_at)+' 예약을 취소할까요?'))return;
   btn.disabled=true;
   const {data,error}=await db.from('room_reservations').update({status:'CANCELLED'}).eq('id',r.id).eq('status','ACTIVE').select('id');
   if(error||!data?.length){tell('예약을 취소하지 못했습니다. 관리자에게 문의해 주세요.');btn.disabled=false;return;}
   tell('예약을 취소했습니다.');await loadMine();if(selectedTab==='status')loadSchedule();
  };
  card.append(btn);
 }
 return card;
}
async function loadMine(){
 const root=byId('room-my-list');
 root.replaceChildren(element('p','내 예약을 불러오는 중...','room-muted'));
 const {data,error}=await db.from('room_reservations')
  .select('id,owner_id,source,room_code,starts_at,ends_at,purpose,memo,status,created_at')
  .eq('owner_id',person.id).order('created_at',{ascending:false}).limit(200);
 if(error){root.replaceChildren(element('p','예약 내역을 확인하지 못했습니다.','room-error'));return;}
 root.replaceChildren();
 if(!data?.length){root.append(element('p','예약 내역이 없습니다.','room-muted'));return;}
 for(const item of data)root.append(detailsRow(item));
}
function fillTimeSelect(select,isEnd=false){
 for(let hour=9;hour<=22;hour++)for(let minute of [0,30]){
  // 22:00 is an allowed end time, but cannot be a new reservation's start time.
  if(hour===22&&(!isEnd||minute===30))continue;
  const time=String(hour).padStart(2,'0')+':'+String(minute).padStart(2,'0');
  select.add(new Option(time,time));
 }
}
async function createBooking(event){
 event.preventDefault();
 const form=event.currentTarget;
 const date=form.elements.date.value,room=form.elements.room_code.value,purpose=form.elements.purpose.value;
 const check=bookingValidation(form);
 if(!check.ok){bookingNotice(check.message);return;}
 if(!rooms.includes(room)){bookingNotice('프로젝트실을 선택해 주세요.');return;}
 const button=byId('room-submit');
 button.disabled=true;bookingNotice('예약을 등록하는 중...','info');
 try{
  const {error}=await db.from('room_reservations').insert({
   owner_id:person.id,room_code:room,starts_at:check.begins.toISOString(),ends_at:check.ends.toISOString(),
   purpose,memo:form.elements.memo.value.trim()
  });
  if(error){
   bookingNotice(error.code==='23P01'?'선택한 시간대에 이미 다른 예약이 있습니다. 예약 현황을 확인하고 다른 시간을 선택해 주세요.':
    error.code==='23514'?'예약 가능 시간과 최대 3시간 제한을 확인해 주세요.':
    error.code==='42501'?'예약 권한이 없습니다. 재학생 승인 상태를 확인해 주세요.':
    '예약을 등록하지 못했습니다. 로그인 상태 또는 예약 조건을 확인하고 다시 시도해 주세요.');
   return;
  }
  form.elements.memo.value='';
  tell('예약이 완료되었습니다. 내 예약에서 확인할 수 있습니다.');
  bookingNotice('');
  selectedDate=date;buildDates();setTab('mine');
 }catch(error){
  console.error('Room booking failed',error);
  bookingNotice('네트워크 오류로 예약하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.');
 }finally{
  button.disabled=false;
 }
}
async function start(){
 if(!db){tell('포털 로그인 연결에 문제가 있습니다.');return;}
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user){tell('로그인 후 이용할 수 있습니다.');return;}
 person=user;
 const a=await db.rpc('portal_super_admin_allowed');admin=a.data===true;
 allowed=window.portalLearning?.write===true;
 if(!allowed&&!admin){tell('승인된 재학생과 관리자만 예약할 수 있습니다.');return;}
 byId('room-app').hidden=false;


 selectedRoom=new URLSearchParams(location.search).get('room')==='8319'?'8319':'8318';
 selectedDate=koreaParts().date;
 const form=byId('room-booking-form');
 fillTimeSelect(form.elements.start);fillTimeSelect(form.elements.end,true);
 for(const [value,label] of purposes)form.elements.purpose.add(new Option(label,value));
 form.elements.date.min=selectedDate;
 const now=koreaParts();
 let first=Math.max(540,Math.ceil((now.hour*60+now.minute+1)/30)*30);
 let bookingDate=selectedDate;
 if(first>=1320){bookingDate=dateAfter(1);first=540;}
 const clock=minutes=>String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');
 form.elements.date.value=bookingDate;
 form.elements.start.value=clock(first);form.elements.end.value=clock(Math.min(first+60,1320));
 for(const name of ['date','start','end']){
  form.elements[name].addEventListener('change',refreshDurationHint);
  form.elements[name].addEventListener('input',refreshDurationHint);
 }
 refreshDurationHint();
 for(const button of document.querySelectorAll('[data-room-option]'))button.addEventListener('click',()=>setRoom(button.dataset.roomOption,false));
 for(const button of document.querySelectorAll('[data-room-tab]'))button.addEventListener('click',()=>setTab(button.dataset.roomTab));
 form.addEventListener('submit',createBooking);
 byId('room-refresh').onclick=()=>loadSchedule();
 setRoom(selectedRoom,false);buildDates();setTab('status');
}
start().catch(error=>{console.error('Room portal error',error);tell('예약 서비스를 초기화하지 못했습니다. 새로고침해 주세요.');});
