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
export function mountWrittenExamScans(browserSection,manifestUrl,session){
 if(!browserSection||!session||!Number.isInteger(session.year)||!Number.isInteger(session.round))return null;
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
 const heading=make("h2",null,session.year+"년 "+(session.roundLabel||session.round+"회")+" · 문제지 원본 자료");
 heading.id="written-scans-heading-"+key;
 section.setAttribute("aria-labelledby",heading.id);
 const note=make("p","written-scan-note","출제연도·회차·과목별로 원본 자료를 확인합니다. 원문 텍스트·선택지의 검증이 끝나지 않은 스캔은 자동채점 문제 수에 포함되지 않습니다.");
 const message=make("p","written-scans-status","자료를 선택하면 원본 정보를 불러옵니다.");
 message.setAttribute("role","status");
 const container=make("div","written-scans-list");
 section.append(heading,note,message,container);
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
    const rsp=await fetch(manifestUrl,{cache:"no-store"});
    if(!rsp.ok)throw Error("HTTP "+rsp.status);
    const data=await rsp.json();
    if(data.examType!=="industrial"||data.year!==session.year||data.round!==session.round||
       data.questionCountClaimed!==60||!Array.isArray(data.pages)||!data.pages.length){
      throw Error("시험자료 연도·회차·문항수 형식 오류");
    }
    const hasImages=data.pages.some(p=>Array.isArray(p.base64Chunks)&&p.base64Chunks.length>0);
    message.textContent=session.year+"년 "+session.round+"회 · 60문항 수록 · "+data.pages.length+"쪽 · "+
      (hasImages?"원본 페이지 이미지 보관":"문서·정답표의 등록정보 확인 (페이지 이미지 미연결)");
    if(data.examDate)note.append(" · 시험일 "+data.examDate);
    const source=make("p","written-scan-origin","원본 파일: "+(data.sourceFileName||"파일명 미확인"));
    section.insertBefore(source,container);
    if(!hasImages){
     const warning=make("p","written-scan-notice","문서의 회차·과목·정답표는 등록했지만, 이 페이지에 원본 DOCX 이미지가 아직 연결되지 않았습니다. 개별 문제풀이·자동채점 등록이 완료됐다는 뜻은 아닙니다.");
     section.insertBefore(warning,container);
     const link=usableUrl(data.referenceUrl);
     if(link){
      const p=make("p","written-scan-reference");
      const a=make("a",null,"출판사 공개 자료실 열기 (별도 제공처)");
      a.href=link;a.target="_blank";a.rel="noopener noreferrer";p.append(a);section.insertBefore(p,container);
     }
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
     const keyDetails=make("details","written-answer-key");
     keyDetails.append(make("summary",null,"교사용 정답표 (60문항 · 독립 검증 전)"));
     keyDetails.append(make("p","written-answer-key-note",data.answerKeyVerification||"출처 정답표 확인 필요"));
     const grid=make("div","written-answer-grid");
     data.answerKey.forEach((answer,index)=>{
      if(!Number.isInteger(answer)||answer<1||answer>4)return;
      grid.append(make("span",null,(index+1)+"번 "+answer+"번"));
     });
     keyDetails.append(grid);section.append(keyDetails);
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
