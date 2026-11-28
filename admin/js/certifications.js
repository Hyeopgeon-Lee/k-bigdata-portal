/* Administrator-only certificate dashboard. All counts are scoped to the enrolled roster. */
import {cohort,summarize,reviewRows,studentRows,gradeName,gradeOf} from './certification-metrics.mjs?v=20261128-cert-dashboard-1';
const api=window.portalSupabaseClient,ui=window.portalAdminUI;
if(window.portalAdminAllowed!==true||!api||!ui)throw Error('ADMIN_SESSION_REQUIRED');
const el=id=>document.getElementById(id);
const make=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=String(text);if(cls)node.className=cls;return node;};
const button=(text,cls='cert-secondary')=>{const b=make('button',text,cls);b.type='button';return b;};
const pill=(text,kind='')=>make('span',text,'cert-badge'+(kind?' is-'+kind:''));
const fmt=n=>Number(n).toLocaleString('ko-KR',{maximumFractionDigits:1});
const date=v=>v?String(v).slice(0,10).replaceAll('-','.'):'—';
const reviewLabel={pending:'확인대기',verified:'확인완료',rejected:'반려'};
const stateLabel={acquired:'취득 확인완료',written:'필기합격',pending:'확인대기',rejected:'반려',unregistered:'미등록'};
const gradeColors={'1':'#4d9cce','2':'#245e9d',other:'#8595aa'};
const gradeTone={'1':'#dceefa','2':'#e2eaf6',other:'#edf1f6'};
const tabs=[...document.querySelectorAll('[data-cert-tab]')];
const PAGE_SIZE=20;
let profiles=[],records=[],model=null,active='overview',reviewPage=0,studentPage=0,loading=false,saving=false;
const message=(text,kind='info')=>{const n=el('cert-admin-message');n.textContent=text;n.dataset.kind=kind;};
const scopeLabel=()=>ui.getGrade()?ui.getGrade()+'학년':'전체 재학생';
function sec(root,title,caption){
 const section=make('section',undefined,'admin-chart');
 section.append(make('h3',title,'admin-chart-title'));
 if(caption)section.append(make('p',caption,'admin-chart-caption'));
 root.replaceChildren(section);return section;
}
function empty(parent,text){parent.append(make('p',text,'cert-empty'));}
function legend(grades){
 const n=make('div',undefined,'cert-chart-legend');
 for(const g of grades){const item=make('span'),dot=make('i');dot.style.backgroundColor=gradeColors[g];item.append(dot,document.createTextNode(gradeName(g)));n.append(item);}
 return n;
}
function studentName(p){return p.full_name||'이름 미확인';}
function badges(c){const b=make('div',undefined,'cert-badges');b.append(pill(c.pass_status==='written'?'필기합격':'최종합격',c.pass_status==='final'?'final':'written'),pill(reviewLabel[c.verification_status]||'미확인',c.verification_status));return b;}
function renderTypes(){
 const panel=sec(el('cert-type-chart'),'자격증별 취득 학생 수','중복 학생 제외 · 확인완료 최종합격 기준');
 if(!model.types.length){empty(panel,'확인완료된 최종합격 자격증이 없습니다.');return;}
 panel.append(legend(model.grades));
 const list=make('div',undefined,'cert-type-bars'),max=Math.max(1,...model.types.map(t=>t.total));
 for(const type of model.types){
  const row=make('div',undefined,'cert-type-row'),head=make('div',undefined,'cert-chart-label'),track=make('div',undefined,'cert-type-track'),counts=make('div',undefined,'cert-type-counts');
  head.append(make('span',type.name),make('strong',fmt(type.total)+'명'));
  for(const g of model.grades){const n=type.counts[g]||0,seg=make('span');seg.style.backgroundColor=gradeColors[g];seg.style.width=(100*n/max)+'%';track.append(seg);
   const chip=make('span',gradeName(g)+' '+fmt(n)+'명');chip.style.backgroundColor=gradeTone[g];counts.append(chip);}
  track.setAttribute('aria-hidden','true');row.append(head,track,counts);list.append(row);
 }
 panel.append(list);
}
function svg(tag,attrs,text){
 const n=document.createElementNS('http://www.w3.org/2000/svg',tag);
 Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));
 if(text!==undefined)n.textContent=String(text);return n;
}
function monthLabel(month){const [y,m]=month.split('-');return y.slice(2)+'.'+m;}
function renderMonthly(){
 const panel=sec(el('cert-month-chart'),'월별 자격증 취득 추이','최근 6개월 · 현재 재학생의 최종합격일 기준 (확인완료 건수)');
 panel.append(legend(model.grades));
 const values=model.monthly.flatMap(m=>model.grades.map(g=>m.counts[g]||0)),maxVal=Math.max(0,...values);
 const step=Math.max(1,Math.ceil(maxVal/4)),max=step*4;
 const chart=svg('svg',{viewBox:'0 0 420 218',class:'cert-month-svg',role:'img','aria-label':'최근 6개월 학년별 자격증 취득 건수. 아래 월별 수치 표에서 정확한 값을 확인할 수 있습니다.'});
 const left=34,right=399,top=16,bottom=182;
 const x=i=>left+14+i*(right-left-23)/5,y=n=>bottom-n/max*(bottom-top);
 for(let j=0;j<=4;j++){
  const value=j*step,yy=y(value);
  chart.append(svg('line',{x1:left,y1:yy,x2:right,y2:yy,stroke:'#e0e9f2','stroke-width':1}),svg('text',{x:left-7,y:yy+4,'text-anchor':'end',class:'cert-axis-label'},value));
 }
 model.monthly.forEach((m,i)=>chart.append(svg('text',{x:x(i),y:bottom+19,'text-anchor':'middle',class:'cert-axis-label'},monthLabel(m.month))));
 for(const g of model.grades){
  const points=model.monthly.map((m,i)=>[x(i),y(m.counts[g]||0)]);
  chart.append(svg('polyline',{points:points.map(p=>p.join(',')).join(' '),fill:'none',stroke:gradeColors[g],'stroke-width':g==='2'?3:2.5,'stroke-linejoin':'round','stroke-dasharray':g==='other'?'5 4':'none'}));
  points.forEach(([cx,cy],i)=>{const dot=svg('circle',{cx,cy,r:g==='1'?4:3.3,fill:gradeColors[g],stroke:'#fff','stroke-width':1.2});dot.append(svg('title',{},monthLabel(model.monthly[i].month)+' '+gradeName(g)+' '+(model.monthly[i].counts[g]||0)+'건'));chart.append(dot);});
 }
 panel.append(chart);
 if(!maxVal)panel.append(make('p','최근 6개월 확인완료된 취득 기록이 없습니다.','cert-empty'));
 const detail=make('details',undefined,'cert-month-detail'),summary=make('summary','월별 수치 보기'),table=make('table',undefined,'cert-month-table'),thead=make('thead'),tbody=make('tbody'),header=make('tr');
 header.append(make('th','월'));for(const g of model.grades)header.append(make('th',gradeName(g)));thead.append(header);
 for(const m of model.monthly){const row=make('tr');row.append(make('th',m.month));for(const g of model.grades)row.append(make('td',fmt(m.counts[g]||0)+'건'));tbody.append(row);}
 table.append(thead,tbody);detail.append(summary,table);panel.append(detail);
}
function renderOverview(){
 ui.renderKPIs(el('cert-admin-stats'),[
  ['조회 재학생',model.total,'명'],['자격증 취득 학생',model.holders,'명'],['자격증 취득률',model.rate,'%'],
  ['확인된 자격증 없음',model.noVerified,'명'],['확인완료 취득 자격증',model.finalCount,'건'],['관리자 확인대기',model.pending,'건']
 ]);
 const cards=[...el('cert-admin-stats').querySelectorAll('.admin-kpi')];
 for(const [index,tab,description] of [[1,'students','취득 학생 보기'],[3,'students','확인된 자격증 없는 학생 보기'],[5,'review','확인대기 내역 보기']]){
  const b=button(description,'cert-kpi-action');b.onclick=()=>{
   if(index===1||index===3){el('cert-student-search').value='';el('cert-student-state').value=index===1?'acquired':'no-verified';studentPage=0;}
   else{el('cert-admin-search').value='';el('cert-admin-status').value='pending';reviewPage=0;}
   openTab(tab);el('cert-tab-'+tab).focus();
  };cards[index]?.append(b);
 }
 ui.renderBars(el('cert-grade-chart'),'학년별 자격증 취득률',model.gradeRates.map(g=>[gradeName(g.grade)+' · '+g.holders+'/'+g.total+'명',g.rate]),{unit:'%',max:100,caption:'해당 학년 재학생 중 확인완료된 최종합격 자격증 1개 이상 보유 학생'});
 ui.renderDonut(el('cert-holdings-chart'),'학생별 자격증 보유 개수',[
  ['1개 취득',model.holdings[1]],['2개 취득',model.holdings[2]],['3개 이상 취득',model.holdings[3]],['확인된 자격증 없음',model.holdings[0]]
 ],{unit:'명',caption:'한 학생은 한 구간에만 집계합니다.'});
 renderTypes();renderMonthly();
}
function pagination(root,total,page,setPage){
 const pages=Math.max(1,Math.ceil(total/PAGE_SIZE));root.replaceChildren();if(!total||pages===1)return;
 const prev=button('이전'),next=button('다음');prev.disabled=page===0;next.disabled=page>=pages-1;
 prev.onclick=()=>setPage(page-1);next.onclick=()=>setPage(page+1);
 root.append(prev,make('span',(page+1)+' / '+pages+' 페이지'),next);
}
async function readNote(entry){
 const {data,error}=await api.from('student_certifications').select('verification_note,updated_at').eq('id',entry.id).eq('user_id',entry.user_id).maybeSingle();
 if(error)throw error;
 if(!data)throw Error('CERT_NOT_FOUND');
 if(entry.updated_at&&data.updated_at&&entry.updated_at!==data.updated_at)throw Error('CERT_CHANGED');
 return data.verification_note||'';
}
async function saveReview(entry,next,note,form,feedback){
 if(saving||loading)return;
 const value=note.value.trim();
 if(next==='rejected'&&!value){feedback.textContent='반려 사유를 입력해 주세요.';note.focus();return;}
 if(!window.confirm('「'+entry.certificate_name+'」 기록을 '+reviewLabel[next]+' 상태로 변경할까요?'))return;
 saving=true;el('cert-refresh').disabled=true;
 const actions=[...form.querySelectorAll('button')];actions.forEach(b=>b.disabled=true);
 feedback.textContent='저장 중…';
 try{
  let query=api.from('student_certifications').update({verification_status:next,verification_note:next==='pending'?'':value}).eq('id',entry.id).eq('user_id',entry.user_id);
  if(entry.updated_at)query=query.eq('updated_at',entry.updated_at);
  const {data,error}=await query.select('id').maybeSingle();
  if(error)throw error;
  if(!data)throw Error('CERT_CHANGED');
  saving=false;
  const ok=await loadAdmin('확인 상태를 저장했습니다.');if(!ok)message('저장했지만 화면을 갱신하지 못했습니다. 새로고침해 주세요.','error');
 }catch(error){
  feedback.textContent=error?.message==='CERT_CHANGED'?'다른 변경사항이 있습니다. 새로고침 후 다시 검토해 주세요.':'저장하지 못했습니다. 다시 시도해 주세요.';
  actions.forEach(b=>b.disabled=false);
 }finally{saving=false;el('cert-refresh').disabled=loading;}
}
function reviewCard(c,profile){
 const card=make('details',undefined,'cert-item cert-review-card'),head=make('summary',undefined,'cert-review-head'),copy=make('div',undefined,'cert-review-copy');
 copy.append(make('strong',c.certificate_name,'cert-item-title'),make('span',studentName(profile)+' · '+gradeName(gradeOf(profile))+' · '+(profile.student_no||'학번 미설정'),'cert-item-meta'),make('span','합격일 '+date(c.pass_status==='written'?c.written_pass_date:c.final_pass_date),'cert-item-meta'));
 head.append(copy,badges(c));card.append(head);
 const body=make('div',undefined,'cert-review-body');card.append(body);
 let loaded=false,fetching=false;
 card.addEventListener('toggle',async()=>{
  if(!card.open||loaded||fetching)return;
  fetching=true;body.replaceChildren(make('p','확인 의견을 불러오는 중…','cert-empty'));
  try{
   const value=await readNote(c);
   if(!card.isConnected)return;
   const form=make('div',undefined,'cert-review-form'),label=make('label','관리자 확인 의견 (반려 시 필수)'),note=make('textarea');note.className='cert-admin-note';note.maxLength=500;note.rows=2;note.placeholder='관리자 확인 의견';note.value=value;label.append(note);form.append(label);
   const feedback=make('p',undefined,'cert-review-feedback');feedback.setAttribute('role','status');
   const controls=make('div',undefined,'cert-item-actions');
   for(const [next,title] of [['verified','확인완료'],['rejected','반려'],['pending','확인대기로']]){
    if(c.verification_status===next)continue;
    const b=button(title,next==='verified'?'cert-approve':'cert-secondary');b.dataset.action=next==='rejected'?'reject':next==='verified'?'verify':'pending';
    b.onclick=()=>void saveReview(c,next,note,form,feedback);controls.append(b);
   }
   form.append(controls,feedback);body.replaceChildren(form);loaded=true;
  }catch(error){body.replaceChildren(make('p',error?.message==='CERT_CHANGED'?'기록이 변경되었습니다. 새로고침해 주세요.':'확인 의견을 불러오지 못했습니다. 닫았다가 다시 열어 주세요.','cert-empty'));}
  finally{fetching=false;}
 });
 return card;
}
function renderReviewSummary(){
 const root=el('cert-status-chart');root.replaceChildren();
 for(const key of ['pending','verified','rejected']){
  const count=model.scoped.filter(c=>c.verification_status===key).length,b=button(reviewLabel[key]+' '+fmt(count)+'건','cert-status-filter');
  b.dataset.status=key;b.setAttribute('aria-pressed',String(el('cert-admin-status').value===key));
  b.onclick=()=>{el('cert-admin-status').value=key;reviewPage=0;renderReview();};root.append(b);
 }
}
function renderReviewList(){
 const items=reviewRows(model,el('cert-admin-search').value,el('cert-admin-status').value),root=el('cert-admin-list'),map=new Map(model.roster.map(p=>[p.user_id,p]));
 reviewPage=Math.min(reviewPage,Math.max(0,Math.ceil(items.length/PAGE_SIZE)-1));
 el('cert-review-count').textContent='검색 결과 '+fmt(items.length)+'건 · '+scopeLabel();
 root.replaceChildren();
 if(!items.length)empty(root,el('cert-admin-status').value==='pending'?'확인대기 등록 내역이 없습니다.':'검색 조건에 해당하는 등록 내역이 없습니다.');
 for(const c of items.slice(reviewPage*PAGE_SIZE,(reviewPage+1)*PAGE_SIZE))root.append(reviewCard(c,map.get(c.user_id)));
 pagination(el('cert-review-pagination'),items.length,reviewPage,p=>{reviewPage=p;renderReviewList();});
}
function renderReview(){if(!model)return;renderReviewSummary();renderReviewList();}
function studentCard(s){
 const p=s.profile,card=make('details',undefined,'cert-student-card'),head=make('summary',undefined,'cert-student-head'),identity=make('div',undefined,'cert-student-identity');
 identity.append(make('strong',studentName(p),'cert-item-title'),make('span',gradeName(gradeOf(p))+' · '+(p.student_no||'학번 미설정'),'cert-item-meta'));
 const stats=make('div',undefined,'cert-student-stats');
 for(const [label,value] of [['필기합격',s.writtenCount],['최종취득',s.finalCount]]){const item=make('span');item.append(make('small',label),make('strong',fmt(value)+'개'));stats.append(item);}
 const status=make('div',undefined,'cert-badges');status.append(pill(stateLabel[s.state],s.state==='acquired'?'verified':s.state==='unregistered'?'unregistered':s.state));
 if(s.pending&&s.state!=='pending')status.append(pill('확인대기 '+s.pending+'건','pending'));
 head.append(identity,stats,status);card.append(head);
 const body=make('div',undefined,'cert-student-detail');card.append(body);
 card.addEventListener('toggle',()=>{
  if(!card.open||body.childElementCount)return;
  if(!s.rows.length){empty(body,'아직 등록된 자격증이 없습니다.');return;}
  for(const c of s.rows){
   const r=make('div',undefined,'cert-student-record'),copy=make('div');
   copy.append(make('strong',c.certificate_name),make('span','합격일 '+date(c.pass_status==='written'?c.written_pass_date:c.final_pass_date),'cert-item-meta'));r.append(copy,badges(c));body.append(r);
  }
  const b=button('이 학생의 등록 내역 검토');b.onclick=()=>{el('cert-admin-search').value=p.student_no||studentName(p);el('cert-admin-status').value='';reviewPage=0;openTab('review');el('cert-tab-review').focus();};body.append(b);
 });
 return card;
}
function renderStudents(){
 if(!model)return;
 const items=studentRows(model,el('cert-student-search').value,el('cert-student-state').value,el('cert-student-sort').value),root=el('cert-student-list');
 studentPage=Math.min(studentPage,Math.max(0,Math.ceil(items.length/PAGE_SIZE)-1));
 el('cert-student-count').textContent='검색 결과 '+fmt(items.length)+' / '+fmt(model.total)+'명 · 확인완료 기록 기준';
 root.replaceChildren();
 if(!items.length)empty(root,'검색 조건에 해당하는 학생이 없습니다.');
 for(const s of items.slice(studentPage*PAGE_SIZE,(studentPage+1)*PAGE_SIZE))root.append(studentCard(s));
 pagination(el('cert-student-pagination'),items.length,studentPage,p=>{studentPage=p;renderStudents();});
}
function renderActive(){
 if(!model)return;
 if(active==='overview')renderOverview();else if(active==='review')renderReview();else renderStudents();
}
function openTab(tab){
 if(!tabs.some(b=>b.dataset.certTab===tab))return;
 active=tab;
 for(const b of tabs){const selected=b.dataset.certTab===tab;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;el('cert-panel-'+b.dataset.certTab).hidden=!selected;}
 renderActive();
}
function rebuild(){
 model=summarize(profiles,records,ui.getGrade());reviewPage=studentPage=0;
 el('cert-scope').textContent=scopeLabel()+' · 재학 중인 승인 학생만 집계 (조기취업·졸업·휴학·자퇴 제외)';
 const badge=el('cert-pending-count');badge.hidden=!model.pending;badge.textContent=fmt(model.pending);
 el('cert-content').hidden=false;renderActive();
}
async function readCerts(ids){
 const rows=[];
 // Only currently enrolled users; keep request URLs and page sizes bounded.
 for(let i=0;i<ids.length;i+=75){
  const batch=ids.slice(i,i+75);
  for(let start=0;;start+=500){
   const {data,error}=await api.from('student_certifications').select('id,user_id,certificate_code,certificate_name,pass_status,written_pass_date,final_pass_date,verification_status,created_at,updated_at').in('user_id',batch).order('created_at',{ascending:false}).order('id').range(start,start+499);
   if(error)throw error;
   rows.push(...(data||[]));if((data||[]).length<500)break;
  }
 }
 return rows;
}
async function loadAdmin(success=''){
 if(loading||saving)return false;
 loading=true;model=null;el('cert-refresh').disabled=true;el('cert-content').hidden=true;el('cert-pending-count').hidden=true;
 message('재학생 자격증 현황을 불러오는 중입니다.');
 try{
  const response=await api.rpc('admin_list_students');if(response.error)throw response.error;
  const roster=cohort(response.data||[]);
  const certs=await readCerts(roster.map(p=>p.user_id));
  profiles=roster;records=certs;rebuild();message(success||'');return true;
 }catch(error){
  console.error('Certificate admin query',error?.code||error?.message||'unknown');
  message('자격증 현황을 불러오지 못했습니다. 새로고침해 주세요.','error');return false;
 }finally{loading=false;el('cert-refresh').disabled=false;}
}
for(const [i,b] of tabs.entries()){
 b.onclick=()=>{if(!saving)openTab(b.dataset.certTab);};
 b.addEventListener('keydown',e=>{
  let next=i;
  if(['ArrowRight','ArrowDown'].includes(e.key))next=(i+1)%tabs.length;
  else if(['ArrowLeft','ArrowUp'].includes(e.key))next=(i+tabs.length-1)%tabs.length;
  else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;
  e.preventDefault();if(!saving){tabs[next].focus();openTab(tabs[next].dataset.certTab);}
 });
}
ui.onGrade(()=>{if(!loading&&model)rebuild();});
el('cert-refresh').onclick=()=>void loadAdmin();
el('cert-admin-search').addEventListener('input',()=>{reviewPage=0;if(model&&!saving)renderReviewList();});
el('cert-admin-status').addEventListener('change',()=>{reviewPage=0;if(model&&!saving)renderReview();});
for(const id of ['cert-student-search','cert-student-state','cert-student-sort'])el(id).addEventListener(id==='cert-student-search'?'input':'change',()=>{studentPage=0;if(model)renderStudents();});
await loadAdmin();
