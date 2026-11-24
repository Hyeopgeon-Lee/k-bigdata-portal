const make=(type,className,text)=>{
 const node=document.createElement(type);
 if(className)node.className=className;
 if(text!==undefined)node.textContent=String(text);
 return node;
};
export async function mountWrittenExamScans(browserSection,manifestUrl){
 if(!browserSection)return null;
 const section=make("section","written-source-scans");
 section.id="industrial-scanned-round-2026";
 section.setAttribute("aria-labelledby","industrial-scans-heading");
 const heading=make("h2",null,"2026년 2회 · 원본 문제지");
 heading.id="industrial-scans-heading";section.append(heading);
 section.append(make("p","written-scan-note","첨부된 2026년 2회 교사용 자료의 문제지 4쪽과 정답표 1쪽을 원본 이미지로 표시합니다. 60문항이 자료에 수록되어 있지만 문항별 텍스트·보기 검증이 끝나지 않아 아래 '문제풀이' 등록 문항 수에는 포함하지 않습니다."));
 const scans=make("div","written-scans-list");
 const message=make("p","written-scans-status","원본 자료를 불러오고 있습니다.");
 section.append(message,scans);
 browserSection.querySelector(".qb-list")?.after(section);
 try{
  const response=await fetch(manifestUrl,{cache:"no-store"});
  if(!response.ok)throw Error("자료 요청 HTTP "+response.status);
  const data=await response.json();
  if(data.examType!=="industrial"||data.year!==2026||data.round!==2||
    !Array.isArray(data.pages)||data.pages.length!==5||data.questionCountClaimed!==60){
   throw Error("원본 스캔 자료 형식 불일치");
  }
  message.textContent="2026년 2회 · 60문항 원본 · 정확한 시험일은 파일명에 기재되어 있지 않습니다.";
  const details=[];
  for(const page of data.pages){
   if(!Array.isArray(page.base64Chunks)||!page.base64Chunks.length)continue;
   const item=make("details","written-scanned-page");
   const caption=page.questionFrom==null?"정답표":page.questionFrom+"~"+page.questionTo+"번";
   const summary=make("summary",null,page.page+"쪽 · "+caption);
   item.append(summary);
   const figure=make("figure","written-scanned-figure");
   const im=make("img");
   im.loading="lazy";im.decoding="async";im.alt="2026년 2회 필기 원본 "+caption+" (스캔)";
   im.src="data:image/png;base64,"+page.base64Chunks.join("");
   figure.append(im);
   item.append(figure);
   scans.append(item);details.push({item,page});
  }
  if(details[0])details[0].item.open=true;
  const subjectSelect=browserSection.querySelector("#qb-additional-select");
  const filterSubject=()=>{
   const subject=subjectSelect?.value||"";
   let count=0;
   for(const {item,page} of details){
    const visible=!subject||page.questionFrom==null||(page.subjects||[]).includes(subject);
    item.hidden=!visible;
    if(visible)count++;
   }
   if(subject&&count===1)message.textContent="선택한 과목의 2026년 2회 스캔 문제는 없습니다. 정답표만 표시됩니다.";
   else message.textContent="2026년 2회 원본 자료 · "+(subject||"전체 과목")+" · 스캔 이미지 보관 (개별 문항 검증 대기)";
  };
  subjectSelect?.addEventListener("change",filterSubject);
  filterSubject();
  return {pages:details.length,questionCountClaimed:data.questionCountClaimed};
 }catch(error){
  message.textContent="2026년 2회 원본 스캔 자료를 불러오지 못했습니다.";
  console.error("Industrial written scan viewer error",error);return null;
 }
}
