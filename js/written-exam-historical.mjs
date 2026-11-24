/* Show verified session identifiers and readable answer keys.
   Original scanned documents are fetched only from authenticated Supabase.
   Do not commit scanned data or exam images to the public GitHub repository. */
export function createHistoricalWrittenViewer(browserSection,loadSession){
 if(!browserSection||typeof loadSession!=="function")throw Error("기출자료 화면을 초기화할 수 없습니다.");
 const list=browserSection.querySelector(".qb-list");
 if(!list)throw Error("문제 목록 영역을 찾지 못했습니다.");
 const section=document.createElement("section");
 section.className="written-historical-session";
 section.hidden=true;
 section.setAttribute("aria-live","polite");
 list.before(section);
 const cache=new Map();
 let sequence=0;
 const el=(tag,className,txt)=>{
  const item=document.createElement(tag);
  if(className)item.className=className;
  if(txt!==undefined)item.textContent=String(txt);
  return item;
 };
 const label=(round)=>"2025년 "+round+"회";
 function update({year,round,subject}){
  const isHistorical=String(year)==="2025";
  section.hidden=!isHistorical;
  list.hidden=isHistorical;
  if(!isHistorical){sequence++;return;}
  const version=++sequence;
  section.replaceChildren();
  const heading=el("h2","written-historical-heading",round?label(round)+" 기출문제":"2025년 정보처리산업기사 필기");
  section.append(heading);
  if(![1,2,3].includes(Number(round))){
   section.append(el("p","written-historical-help","상단의 시험 회차에서 2025년 1회·2회·3회 중 하나를 선택하세요."));
   return;
  }
  const key="2025-"+round;
  section.append(el("p","written-historical-loading","문제지를 불러오고 있습니다."));
  if(!cache.has(key))cache.set(key,Promise.resolve().then(()=>loadSession(2025,Number(round))).catch(error=>{cache.delete(key);throw error;}));
  cache.get(key).then(data=>{
   if(version!==sequence||section.hidden)return;
   section.replaceChildren(heading);
   if(data.examType!=="industrial"||data.year!==2025||Number(data.round)!==Number(round)||
      !Array.isArray(data.answerKey)||data.answerKey.length!==60||!Array.isArray(data.pages))
     throw Error("2025년 기출자료의 구성과 정답표가 올바르지 않습니다.");
   const subjects=Array.isArray(data.subjects)?data.subjects:[];
   const selected=subjects.find(s=>s.name===subject);
   const min=selected?.from||1,max=selected?.to||60;
   const subtitle=el("p","written-historical-help",selected
    ?selected.name+" · "+min+"~"+max+"번"
    :"전체 60문항 · 3과목, 과목당 20문항");
   const sourceNote=el("p","written-historical-note","기존 2025년 기출문제를 다시 열람할 수 있습니다. 현재는 원본 문제지 열람과 정답표 확인 방식이며 객관식 자동채점에는 포함되지 않습니다.");
   section.append(subtitle,sourceNote);
   const actions=el("div","written-historical-actions");
   const toggle=el("button","button button-primary written-historical-toggle","정답 보기");
   toggle.type="button";
   toggle.setAttribute("aria-expanded","false");
   const answers=el("section","written-historical-answers");
   answers.hidden=true;
   answers.id="written-historical-answers";
   toggle.setAttribute("aria-controls",answers.id);
   toggle.addEventListener("click",()=>{
    answers.hidden=!answers.hidden;
    toggle.textContent=answers.hidden?"정답 보기":"정답 접기";
    toggle.setAttribute("aria-expanded",String(!answers.hidden));
   });
   actions.append(toggle);section.append(actions);
   const keyTitle=el("h3",null,selected?selected.name+" 정답표":"2025년 "+round+"회 정답표");
   answers.append(keyTitle);
   answers.append(el("p","written-historical-keynote","정답은 제공된 교사용 자료에서 판독한 값이며 별도 독립 검증은 완료되지 않았습니다."));
   const grid=el("div","written-historical-keygrid");
   for(let i=min;i<=max;i++){
    const answer=Number(data.answerKey[i-1]);
    grid.append(el("span","written-historical-answer",i+"번 "+(answer>=1&&answer<=4?answer+"번":"미확인")));
   }
   answers.append(grid);section.append(answers);
   const pages=el("div","written-historical-pages");
   let shown=0;
   for(const page of data.pages){
    const from=Number(page.questionFrom),to=Number(page.questionTo);
    if(!Number.isInteger(from)||!Number.isInteger(to)||to<min||from>max)continue;
    if(!["image/webp","image/png","image/jpeg"].includes(page.mediaType)||!Array.isArray(page.base64Chunks)||!page.base64Chunks.length)continue;
    const figure=el("figure","written-historical-figure");
    const img=el("img");
    img.alt=label(round)+" "+from+"~"+to+"번 문제지";
    img.loading="lazy";img.decoding="async";
    img.src="data:"+page.mediaType+";base64,"+page.base64Chunks.join("");
    figure.append(img,el("figcaption",null,from+"~"+to+"번 문제"));
    pages.append(figure);shown++;
   }
   section.append(pages);
   if(!shown)section.append(el("p","written-historical-help","선택한 과목의 문제지 페이지를 찾을 수 없습니다."));
  }).catch(error=>{
   if(version!==sequence)return;
   section.replaceChildren(heading,el("p","written-historical-error","문제지 또는 정답표를 불러오지 못했습니다. 새로고침 후 다시 선택하세요."));
   console.error("2025 written session load failed",error);
  });
 }
 return {update};
}
