/* Read-only viewer for user-supplied, image-first industrial engineer written papers.
   Scan metadata is never counted as a validated, auto-gradable question. */
const make=(tag,className,text)=>{
 const node=document.createElement(tag);
 if(className)node.className=className;
 if(text!==undefined)node.textContent=String(text);
 return node;
};
const usableUrl=value=>{
 try{const u=new URL(value);return u.protocol==="https:"?u.href:null;}catch{return null;}
};
export function mountWrittenExamScans(browserSection,loadManifest,session){
 if(!browserSection||typeof loadManifest!=="function"||!session||!Number.isInteger(session.year)||!Number.isInteger(session.round))return null;
 const key=session.year+"-"+session.round;
 let parent=browserSection.querySelector("#industrial-written-scanned-exams");
 if(!parent){
  parent=make("div","written-scanned-exams");parent.id="industrial-written-scanned-exams";
  const anchor=browserSection.querySelector(".qb-list");
  if(anchor)anchor.after(parent);else browserSection.append(parent);
 }
 const section=make("section","written-source-scans");
 section.id="industrial-scanned-round-"+key;
 section.dataset.scanSession=key;
 section.hidden=true;
 const heading=make("h2",null,session.year+"년 "+(session.roundLabel||session.round+"회")+" · 문제지");
 heading.id="written-scans-heading-"+key;
 section.setAttribute("aria-labelledby",heading.id);
 const note=make("p","written-scan-note","출제연도·회차·과목별 문제지와 정답을 확인할 수 있습니다. 이미지형 문항은 자동채점 문제 수에 포함되지 않습니다.");
 const message=make("p","written-scans-status","자료를 선택하면 원본 정보를 불러옵니다.");
 message.setAttribute("role","status");
 const container=make("div","written-scans-list");
 const answerToggle=make("button","button button-primary written-answer-toggle","정답 보기");
 answerToggle.type="button";answerToggle.setAttribute("aria-expanded","false");
 const answerPanel=make("div","written-inline-answer-panel");answerPanel.hidden=true;
 answerPanel.id="written-answer-panel-"+key;
 answerToggle.setAttribute("aria-controls",answerPanel.id);answerToggle.hidden=true;
 answerToggle.addEventListener("click",()=>{
  answerPanel.hidden=!answerPanel.hidden;
  answerToggle.textContent=answerPanel.hidden?"정답 보기":"정답 접기";
  answerToggle.setAttribute("aria-expanded",String(!answerPanel.hidden));
 });
 section.append(heading,note,message,answerToggle,answerPanel,container);
 parent.append(section);
 let loadPromise=null,details=[];
 function filterSubject(){
  const subject=browserSection.querySelector("#qb-additional-select")?.value||"";
  let pagesVisible=0;
  for(const item of details){
   const p=item.page;
   const ok=!subject||p.questionFrom==null||(p.subjects||[]).includes(subject);
   item.node.hidden=!ok;
   if(ok&&p.questionFrom!=null)pagesVisible++;
  }
  if(details.length&&subject)message.textContent=session.year+"년 "+session.round+"회 · "+subject+" · 관련 원본 페이지 "+pagesVisible+"쪽";
 }
 async function load(){
  if(loadPromise)return loadPromise;
  loadPromise=(async()=>{
   try{
    const data=await loadManifest();
    if(data.examType!=="industrial"||data.year!==session.year||data.round!==session.round||
       data.questionCountClaimed!==60||!Array.isArray(data.pages)||!data.pages.length){
      throw Error("시험자료 연도·회차·문항수 형식 오류");
    }
    const hasImages=data.pages.some(p=>Array.isArray(p.base64Chunks)&&p.base64Chunks.length>0);
    message.textContent=session.year+"년 "+session.round+"회 · 60문항 수록 · "+data.pages.length+"쪽 · "+
      (hasImages?"문제지 이미지 열람":"문항 이미지 준비 중");
    if(data.examDate)note.append(" · 시험일 "+data.examDate);
    if(!hasImages){
     const warning=make("p","written-scan-notice","문서의 회차·과목·정답표는 등록했지만, 이 페이지에 원본 DOCX 이미지가 아직 연결되지 않았습니다. 개별 문제풀이·자동채점 등록이 완료됐다는 뜻은 아닙니다.");
     section.insertBefore(warning,container);
    }
    for(const page of data.pages){
     const box=make("details","written-scanned-page");
     const caption=page.questionFrom==null?"정답표":page.questionFrom+"~"+page.questionTo+"번";
     box.append(make("summary",null,page.page+"쪽 · "+caption));
     if(page.base64Chunks?.length){
      const media=/^image\/(?:png|webp|jpeg)$/.test(page.mediaType||"")?page.mediaType:"image/png";
      const combined=page.base64Chunks.join("");
      if(/^[A-Za-z0-9+/]+=*$/.test(combined)){
       const figure=make("figure","written-scanned-figure");
       const im=make("img");
       im.loading="lazy";im.decoding="async";im.alt=session.year+"년 "+session.round+"회 · "+caption+" 원본 스캔";
       im.src="data:"+media+";base64,"+combined;
       figure.append(im);box.append(figure);
      }
     } else{
      box.append(make("p","written-scan-unavailable","첨부 DOCX의 "+caption+" 페이지 이미지 등록 전입니다."));
     }
     container.append(box);details.push({node:box,page});
    }
    const first=details.find(d=>d.page.questionFrom!==null&&!d.node.hidden);
    if(first&&hasImages)first.node.open=true;
    if(Array.isArray(data.answerKey)&&data.answerKey.length===60){
     answerToggle.hidden=false;
     const answerTitle=make("h3",null,session.year+"년 "+session.round+"회 · 정답표");
     answerPanel.append(answerTitle);
     answerPanel.append(make("p","written-answer-key-note","문서에 수록된 정답표를 확인할 수 있습니다. 독립적인 정답 검증은 완료되지 않았습니다."));
     const grid=make("div","written-answer-grid");
     for(let i=0;i<data.answerKey.length;i++){
      const answer=data.answerKey[i];
      if(!Number.isInteger(answer)||answer<1||answer>4)continue;
      const item=make("span",null,(i+1)+"번 · "+answer+"번");
      item.dataset.questionNumber=String(i+1);
      grid.append(item);
     }
     answerPanel.append(grid);
     const updateAnswers=()=>{
      const selected=subjectSelect?.value||"";
      const range=data.subjects?.find(s=>s.name===selected);
      for(const item of grid.children){
       const num=Number(item.dataset.questionNumber);
       item.hidden=!!selected&&(!range||num<range.from||num>range.to);
      }
     };
     subjectSelect?.addEventListener("change",updateAnswers);
     updateAnswers();
    }
    filterSubject();
    return {pages:details.length,withImages:hasImages};
   }catch(err){message.textContent=session.year+"년 "+session.round+"회 자료 로딩 실패";console.error("Written exam scan load failed",err);return null;}
  })();
  return loadPromise;
 }
 const subjectSelect=browserSection.querySelector("#qb-additional-select");
 subjectSelect?.addEventListener("change",filterSubject);
 return {section,show(visible){section.hidden=!visible;if(visible)void load();},ensureLoaded:load,refreshSubject:filterSubject,key};
}
