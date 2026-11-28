/* Export only the aggregate data already rendered by the admin dashboard. */
const SCHOOL="한국폴리텍대학 서울강서캠퍼스";
const DEPT="빅데이터소프트웨어공학과";
const COLORS={1:"#2563eb",2:"#087f82"};
const DAYS=["일","월","화","수","목","금","토"];
const number=new Intl.NumberFormat("ko-KR");
const count=value=>Number.isFinite(Number(value))?Math.max(0,Math.trunc(Number(value))):0;
const fmt=value=>number.format(value);
const note="일별·과목별 참여 인원은 중복 제외 · 여러 날짜와 과목에 참여 가능";
const kstDate=value=>{
 const d=new Date(value);
 if(!Number.isFinite(d.getTime()))return "";
 const p=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(d);
 const part=key=>p.find(x=>x.type===key)?.value;
 return part("year")+"-"+part("month")+"-"+part("day");
};
function dateInfo(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value||""))return null;
 const d=new Date(value+"T00:00:00Z");
 if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==value)return null;
 return {date:value,weekday:DAYS[d.getUTCDay()],short:(d.getUTCMonth()+1)+"/"+d.getUTCDate()};
}
const fullDate=date=>{const d=dateInfo(date);return d?date.replaceAll("-",".")+".("+d.weekday+")":"";};

export function learningShareModel(stats,{grade="",period="week",range="",periodStart,periodEnd,basis="",partial=false,subjectNames={}}={}){
 const grades=["1","2"].includes(String(grade))?[Number(grade)]:[1,2];
 const gradeLabel=grades.length===1?grades[0]+"학년":"전체 학년";
 const monthly=period==="month",periodLabel=monthly?"월간":"주간";
 // The API end is exclusive; use its final instant for an inclusive KST label.
 const start=periodStart?kstDate(periodStart):"";
 const end=periodEnd?kstDate(new Date(Date.parse(periodEnd)-1)):"";
 const label=start&&end?fullDate(start)+" ~ "+fullDate(end):range;
 const rows=(Array.isArray(stats.daily)?stats.daily:[]).map(row=>{
  const info=dateInfo(row.date);
  if(!info)return null;
  return {...info,counts:grades.map(g=>count(row["grade"+g]))};
 }).filter(Boolean).sort((a,b)=>a.date.localeCompare(b.date));
 const subjects=Object.entries(subjectNames).map(([key,name])=>({
  name,participants:count(stats.subjects?.[key]?.participants)
 }));
 const cohort=count(stats.cohortSize),active=count(stats.activeStudents);
 return {
  gradeLabel,grades,monthly,periodLabel,title:gradeLabel+" "+periodLabel+" 문제 풀이 학습현황",
  range:label,filename:"문제풀이_"+gradeLabel.replaceAll(" ","")+"_"+(start&&end?start+"_"+end:monthly?"월간":"주간")+".png",
  basis:partial||basis==="live"?"실시간 집계":basis==="historical"?"과거 학적 기준 추가 집계":basis==="snapshot"?"확정 통계":"",
  active,cohort,attempts:count(stats.attempts),rows,subjects,
  dailyMax:Math.max(1,...(Array.isArray(stats.grades)?stats.grades:[]).filter(g=>grades.includes(Number(g.grade))).map(g=>count(g.cohortSize)),...rows.flatMap(row=>row.counts))
 };
}

export function learningShareText(model){
 return [SCHOOL+" "+DEPT,model.title,model.range,model.basis,"",
  "학습 참여 학생: "+fmt(model.active)+"명 / 재학생 "+fmt(model.cohort)+"명",
  "전체 문제 풀이: "+fmt(model.attempts)+"회","",
  model.monthly?"일별 문제 풀이 참여 학생 수":"요일별 문제 풀이 참여 학생 수",
  ...(model.rows.length?model.rows.map(row=>row.short+"("+row.weekday+") · "+model.grades.map((g,i)=>g+"학년 "+fmt(row.counts[i])+"명").join(" / ")):["일별 학습 기록이 없습니다."]),
  "","과목별 학습 참여 학생",...model.subjects.map(s=>s.name+" · "+fmt(s.participants)+"명"),"",note
 ].join("\n");
}

export function drawLearningShareCanvas(canvas,model){
 const W=1080,L=64,R=1016,BAR_H=190;
 // Use up to seven dates per group so monthly images remain legible on phones.
 const groups=[];
 for(let i=0;i<model.rows.length;i+=7)groups.push(model.rows.slice(i,i+7));
 const dailySize=groups.length?groups.length*288:104;
 const subjectStart=554+dailySize;
 const height=subjectStart+100+model.subjects.length*78+138;
 canvas.width=W;canvas.height=height;
 const ctx=canvas.getContext("2d");if(!ctx)throw Error("CANVAS_UNAVAILABLE");
 const ink="#17375d",muted="#52667d",white="#ffffff",track="#e5edf6";
 function rect(x,y,w,h,r,color){
  if(w<=0||h<=0)return;
  r=Math.min(r,w/2,h/2);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.fill();
 }
 function text(value,x,y,size,color=ink,weight=500,align="left",maxWidth=R-L){
  ctx.fillStyle=color;ctx.font=weight+" "+size+'px "Noto Sans KR", "Noto Sans CJK KR", "Malgun Gothic", system-ui, sans-serif';
  ctx.textAlign=align;ctx.textBaseline="middle";ctx.fillText(value,x,y,maxWidth);
 }
 ctx.fillStyle="#f3f7fc";ctx.fillRect(0,0,W,height);
 ctx.fillStyle="#12375f";ctx.fillRect(0,0,W,236);ctx.fillStyle="#44b5b2";ctx.fillRect(0,0,W,12);
 text(SCHOOL+" · "+DEPT,L,52,31,"#cce9f8",600);
 text(model.title,L,112,51,white,800);
 text(model.range,L,174,37,white,650);
 if(model.basis)text(model.basis,L,211,25,"#d4e8f9",500);
 const cardW=(R-L-20)/2;
 for(const [i,heading,value,detail,tone] of [[0,"학습 참여 학생",fmt(model.active)+"명","재학생 "+fmt(model.cohort)+"명 기준","#2563eb"],[1,"전체 문제 풀이",fmt(model.attempts)+"회","8개 학습 서비스", "#087f82"]]){
  const x=L+i*(cardW+20);rect(x,258,cardW,144,18,white);
  text(heading,x+22,288,29,muted,650,"left",cardW-44);
  text(value,x+22,334,48,tone,800,"left",cardW-44);
  text(detail,x+22,376,25,muted,500,"left",cardW-44);
 }
 rect(L,422,R-L,subjectStart-422-14,20,white);
 text(model.monthly?"일별 문제 풀이 참여 학생 수":"요일별 문제 풀이 참여 학생 수",L+22,458,36,ink,800);
 model.grades.forEach((grade,i)=>{
  const x=L+24+i*172;rect(x,486,22,22,5,COLORS[grade]);text(grade+"학년",x+32,497,30,muted,650);
 });
 if(!groups.length)text("일별 학습 기록이 없습니다.",W/2,556,32,muted,600,"center");
 // Numeric labels are drawn even when a day has zero participants. All groups share one scale.
 groups.forEach((group,index)=>{
  const base=550+index*288+BAR_H,slot=(R-L-60)/7;
  ctx.fillStyle=track;ctx.fillRect(L+26,base,R-L-52,2);
  group.forEach((row,i)=>{
   const center=L+30+slot*(i+.5),barWidth=model.grades.length===2?40:58;
   row.counts.forEach((value,j)=>{
    const x=center+(j-(model.grades.length-1)/2)*(barWidth+8)-barWidth/2;
    const h=value/model.dailyMax*BAR_H;const color=COLORS[model.grades[j]];
    if(value)rect(x,base-h,barWidth,h,6,color);
    text(fmt(value),x+barWidth/2,base-h-17,27,color,800,"center",barWidth+7);
   });
   text(row.short,center,base+24,27,ink,650,"center",slot-4);
   text(row.weekday,center,base+56,28,muted,650,"center",slot-4);
  });
 });
 rect(L,subjectStart,R-L,100+model.subjects.length*78,20,white);
 text("과목별 학습 참여 학생",L+22,subjectStart+39,36,ink,800);
 text("재학생 대비 참여 인원 · 단위: 명",L+22,subjectStart+77,27,muted,500);
 const max=Math.max(1,model.cohort,...model.subjects.map(s=>s.participants));
 model.subjects.forEach((s,i)=>{
  const y=subjectStart+105+i*78,x=L+22,w=R-L-44;
  text(s.name,x,y+18,32,ink,650,"left",w*.7);
  text(fmt(s.participants)+"명",R-22,y+18,34,"#2563eb",800,"right",w*.28);
  rect(x,y+40,w,18,9,track);rect(x,y+40,w*s.participants/max,18,9,"#2563eb");
 });
 text(note,W/2,height-88,25,muted,500,"center");
 text("학과 포털 학습통계  |  portal.k-bigdata.kr",W/2,height-43,29,ink,700,"center");
 return canvas;
}

function pngFile(model){
 const canvas=drawLearningShareCanvas(document.createElement("canvas"),model);
 // Encode synchronously on the click to preserve transient user activation for Web Share.
 const data=canvas.toDataURL("image/png");if(!data.startsWith("data:image/png;base64,"))throw Error("IMAGE_EXPORT_FAILED");
 const bytes=Uint8Array.from(atob(data.slice(data.indexOf(",")+1)),char=>char.charCodeAt(0));
 return new File([bytes],model.filename,{type:"image/png"});
}
function downloadFile(file){
 const url=URL.createObjectURL(file),link=document.createElement("a");
 link.href=url;link.download=file.name;document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}

export function attachLearningChartShare(mount,model){
 const el=(tag,cls,value)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(value!==undefined)node.textContent=value;return node;};
 const panel=el("section","lv-panel lv-share study-chart-share");
 panel.setAttribute("aria-label","문제 풀이 통합 차트 공유");
 panel.append(el("h3","lv-title","학습현황 밴드 공유"),el("p","lv-caption","날짜별·과목별 참여 그래프를 한 장의 이미지로 공유합니다. · "+model.gradeLabel+" · "+model.range));
 const actions=el("div","study-chart-share-actions");
 const button=(label,cls)=>{const b=el("button",cls,label);b.type="button";return b;};
 const share=button("밴드 공유하기","study-share-band"),download=button("이미지 다운로드","study-outline study-share-download"),copy=button("게시글 복사","study-outline study-share-copy");
 const status=el("p","study-share-status");status.hidden=true;status.setAttribute("role","status");status.setAttribute("aria-live","polite");
 const manual=el("textarea","study-share-manual");manual.readOnly=true;manual.rows=6;manual.hidden=true;manual.value=learningShareText(model);manual.setAttribute("aria-label","복사할 문제 풀이 학습현황");
 let file=null;
 const message=value=>{status.textContent=value;status.hidden=false;};
 const exportFile=()=>file||(file=pngFile(model));
 const save=()=>{
  try{downloadFile(exportFile());message("이미지 다운로드를 시작했습니다. 밴드 글 작성 시 사진으로 첨부하세요.");return true;}
  catch{message("이미지를 만들지 못했습니다. 다시 시도해 주세요.");return false;}
 };
 share.addEventListener("click",async()=>{
  share.disabled=true;
  try{
   const files=[exportFile()];
   if(typeof navigator.share!=="function"||typeof navigator.canShare!=="function"||!navigator.canShare({files})){
    if(save())message("이 브라우저는 사진 공유를 지원하지 않습니다. 저장된 이미지를 밴드에 첨부하세요.");return;
   }
   message("공유 메뉴에서 밴드 앱과 게시할 밴드를 선택하세요.");
   await navigator.share({files,title:model.title,text:learningShareText(model)});
   message("공유 대상으로 이미지를 전달했습니다. 밴드에서 게시 여부를 확인하세요.");
  }catch(error){
   message(error?.name==="AbortError"?"공유가 취소되었습니다. 이미지 다운로드도 이용할 수 있습니다.":"사진 공유를 완료하지 못했습니다. 이미지 다운로드 후 밴드에 첨부하세요.");
  }finally{share.disabled=false;}
 });
 download.addEventListener("click",save);
 copy.addEventListener("click",async()=>{
  try{if(typeof navigator.clipboard?.writeText!=="function")throw Error("CLIPBOARD_UNAVAILABLE");
   await navigator.clipboard.writeText(manual.value);manual.hidden=true;message("게시글을 복사했습니다. 밴드에 붙여넣으세요.");
  }catch{manual.hidden=false;manual.focus();manual.select();message("자동 복사를 지원하지 않습니다. 아래 글을 직접 복사하세요.");}
 });
 actions.append(share,download,copy);panel.append(actions,status,manual);mount.append(panel);
}
