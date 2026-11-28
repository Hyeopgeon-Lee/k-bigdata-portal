/* Local export of aggregate study statistics. No student records or image uploads. */
const DAYS=["월","화","수","목","금","토","일"];
const COLORS=["#245e9d","#53a5a0","#8196df","#d08b35","#8b6fae","#8798a9","#245e9d"];
const DEPARTMENT="빅데이터소프트웨어공학과";
const SCHOOL="한국폴리텍대학 서울강서캠퍼스";
const NOTE="휴식시간·검토 대상 세션 제외 · 요일별 참여 인원 중복 제외";
const number=new Intl.NumberFormat("ko-KR",{maximumFractionDigits:1});
const nonnegative=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;
const hours=seconds=>Math.round(seconds/360)/10;
const hourText=value=>number.format(value)+"시간";

export function studyShareModel(week,grade,secondsByDay,countsByDay){
 const start=new Date(week+"T00:00:00Z");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(week)||!Number.isFinite(start.getTime())||start.toISOString().slice(0,10)!==week)throw Error("INVALID_STUDY_WEEK");
 const end=new Date(start.getTime()+6*86400000).toISOString().slice(0,10);
 const gradeLabel=["1","2"].includes(String(grade))?grade+"학년":"전체 학년";
 const rows=DAYS.map((day,i)=>({day,date:new Date(start.getTime()+i*86400000).toISOString().slice(0,10),hours:hours(nonnegative(secondsByDay[i])),count:Math.floor(nonnegative(countsByDay[i]))}));
 const total=hours(DAYS.reduce((sum,_,i)=>sum+nonnegative(secondsByDay[i]),0));
 return {week,end,gradeLabel,title:gradeLabel+" 주간 자율학습 현황",period:week.replaceAll("-",".")+".(월) ~ "+end.replaceAll("-",".")+".(일)",rows,total};
}

export function studyShareText(model){
 return [SCHOOL+" "+DEPARTMENT,model.title,model.period,"",...model.rows.map(row=>row.day+"요일 · "+row.count+"명 · "+hourText(row.hours)),"","주간 누적 공부시간: "+hourText(model.total),NOTE].join("\n");
}

export function drawStudyShareCanvas(canvas,model){
 canvas.width=1080;canvas.height=1320;
 const ctx=canvas.getContext("2d");if(!ctx)throw Error("CANVAS_UNAVAILABLE");
 const left=72,right=1008,width=right-left;
 function rect(x,y,w,h,r,color){
  if(w<=0||h<=0)return;
  r=Math.min(r,w/2,h/2);
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.fill();
 }
 function text(value,x,y,size,color,weight=500,align="left",maxWidth=width){
  ctx.font=weight+" "+size+'px "Noto Sans KR", "Noto Sans CJK KR", "Malgun Gothic", system-ui, sans-serif';
  ctx.textAlign=align;ctx.textBaseline="middle";ctx.fillStyle=color;ctx.fillText(value,x,y,maxWidth);
 }
 ctx.fillStyle="#ffffff";ctx.fillRect(0,0,1080,1320);
 ctx.fillStyle="#12375f";ctx.fillRect(0,0,1080,236);
 ctx.fillStyle="#44b5b2";ctx.fillRect(0,0,1080,12);
 text(DEPARTMENT,left,58,32,"#cfebfa",600);
 text(model.title,left,118,54,"#ffffff",800);
 text(model.period,left,183,36,"#ffffff",600);
 text("요일별 공부시간 · 참여 학생 수",left,280,35,"#173a63",700);
 const max=Math.max(1,...model.rows.map(row=>row.hours));
 model.rows.forEach((row,i)=>{
  const y=326+i*109;
  text(row.day+"요일 · "+number.format(row.count)+"명",left,y+25,36,"#173a63",600,"left",width*.62);
  text(hourText(row.hours),right,y+25,37,"#14365c",800,"right",width*.36);
  rect(left,y+54,width,24,12,"#e4edf5");
  rect(left,y+54,width*row.hours/max,24,12,COLORS[i]);
 });
 rect(left,1112,width,94,20,"#eaf2fa");
 text("주간 누적 공부시간",left+26,1159,34,"#173a63",600,"left",width*.55);
 text(hourText(model.total),right-26,1159,44,"#245e9d",800,"right",width*.4);
 text(NOTE,540,1243,26,"#52657d",500,"center",936);
 text(SCHOOL,540,1285,30,"#173a63",700,"center",936);
 return canvas;
}

function pngFile(model){
 const canvas=drawStudyShareCanvas(document.createElement("canvas"),model);
 // Synchronous encoding occurs only on a user click, preserving transient activation for Web Share.
 const data=canvas.toDataURL("image/png");
 if(!data.startsWith("data:image/png;base64,"))throw Error("IMAGE_EXPORT_FAILED");
 const binary=atob(data.slice(data.indexOf(",")+1));
 const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
 return new File([bytes],"자율학습_"+model.gradeLabel.replaceAll(" ","")+"_"+model.week+"_"+model.end+".png",{type:"image/png"});
}
function downloadFile(file){
 const url=URL.createObjectURL(file),link=document.createElement("a");
 link.href=url;link.download=file.name;document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}

export function attachStudyChartShare(mount,model){
 const chart=mount.querySelector(".admin-chart");if(!chart)return;
 const controls=document.createElement("div");controls.className="study-chart-share";
 const actions=document.createElement("div");actions.className="study-chart-share-actions";
 const createButton=(label,classes)=>{
  const button=document.createElement("button");button.type="button";button.textContent=label;button.className=classes;return button;
 };
 const share=createButton("밴드 공유하기","study-share-band");
 const download=createButton("이미지 다운로드","study-outline study-share-download");
 const copy=createButton("게시글 복사","study-outline study-share-copy");
 const status=document.createElement("p");status.className="study-share-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");status.hidden=true;
 const manual=document.createElement("textarea");manual.className="study-share-manual";manual.readOnly=true;manual.rows=5;manual.hidden=true;manual.setAttribute("aria-label","복사할 자율학습 게시글");manual.value=studyShareText(model);
 let file=null;
 function message(value){status.textContent=value;status.hidden=false;}
 function exportFile(){return file||(file=pngFile(model));}
 function save(){
  try{downloadFile(exportFile());message("이미지 다운로드를 시작했습니다. 밴드 글 작성 시 사진으로 첨부하세요.");return true;}
  catch{message("이미지를 만들지 못했습니다. 다시 시도해 주세요.");return false;}
 }
 share.addEventListener("click",async()=>{
  share.disabled=true;
  try{
   const image=exportFile(),files=[image];
   if(typeof navigator.share!=="function"||typeof navigator.canShare!=="function"||!navigator.canShare({files})){
    if(save())message("이 브라우저는 사진 공유를 지원하지 않습니다. 저장된 이미지를 밴드에 첨부하세요.");return;
   }
   message("공유 메뉴에서 밴드 앱과 게시할 밴드를 선택하세요.");
   await navigator.share({files,title:model.title,text:studyShareText(model)});
   message("공유 대상으로 이미지를 전달했습니다. 밴드에서 게시 여부를 확인하세요.");
  }catch(error){
   message(error?.name==="AbortError"?"공유가 취소되었거나 공유 대상이 없습니다. 이미지 다운로드도 이용할 수 있습니다.":"사진 공유를 완료하지 못했습니다. 이미지 다운로드 후 밴드에 첨부하세요.");
  }finally{share.disabled=false;}
 });
 download.addEventListener("click",save);
 copy.addEventListener("click",async()=>{
  try{
   if(typeof navigator.clipboard?.writeText!=="function")throw Error("CLIPBOARD_UNAVAILABLE");
   await navigator.clipboard.writeText(manual.value);manual.hidden=true;message("게시글을 복사했습니다. 밴드에 붙여넣으세요.");
  }catch{manual.hidden=false;manual.focus();manual.select();message("자동 복사를 지원하지 않습니다. 아래 글을 직접 복사하세요.");}
 });
 actions.append(share,download,copy);controls.append(actions,status,manual);
 const bars=chart.querySelector(".admin-chart-bars");chart.insertBefore(controls,bars);
}
