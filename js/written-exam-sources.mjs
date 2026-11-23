const el=(tag,className,textValue)=>{
 const node=document.createElement(tag);
 if(className)node.className=className;
 if(textValue!==undefined)node.textContent=String(textValue);
 return node;
};
const httpsUrl=value=>{
 try{const url=new URL(value);return url.protocol==="https:"?url.href:null;}catch{return null;}
};
export async function mountWrittenSources(browserSection,url,examType){
 const container=browserSection?.querySelector(".qb-list");
 if(!container)return null;
 const section=el("section","written-source-directory");
 section.id="written-source-directory";
 section.setAttribute("aria-labelledby","written-source-heading");
 const heading=el("h2",null,"연도별 외부 기출자료");
 heading.id="written-source-heading";
 const subtitle=el("p","written-source-explainer",
  "학습자료를 제공하는 외부 사이트의 원문으로 이동합니다. 자료가 게시되어 있어도 원문 동일성·정답·포털 재게시 권한이 검증된 것은 아닙니다.");
 section.append(heading,subtitle);
 container.after(section);
 try{
  const response=await fetch(url,{cache:"no-store"});
  if(!response.ok)throw Error("외부 자료 목록 HTTP "+response.status);
  const manifest=await response.json();
  if(manifest.examType!==examType||!Array.isArray(manifest.years))throw Error("자료 목록 형식 오류");
  const status=el("p","written-source-summary","자료 확인일: "+String(manifest.checkedAt||"미기록")+
   " · 연도별 목록 "+manifest.years.length+"개 · 문제 원문 검증은 별도");
  section.append(status);
  const rows=el("div","written-source-years");
  for(const entry of manifest.years){
   if(!Number.isInteger(entry.year)||!Array.isArray(entry.materials))continue;
   const details=el("details","written-source-year");
   if(entry.year>=2025)details.open=true;
   const title=el("summary",null,entry.year+"년 · "+String(entry.sourceStatus||"자료 확인 중"));
   details.append(title);
   if(entry.examRule)details.append(el("p","written-source-rule",entry.examRule));
   const list=el("ul","written-source-links");
   for(const source of entry.materials){
    const li=el("li","written-source-item");
    const title=el("strong",null,String(source.label||"외부 자료"));
    const meta=el("p",null,[source.source,source.format,Number.isInteger(source.sourceQuestionCount)?source.sourceQuestionCount+"문항":null,source.answerKeyListed?"답안표 수록":null,source.verified].filter(Boolean).join(" · "));
    const license=el("p","written-source-license","재게시: "+String(source.rights||"미확인"));
    li.append(title,meta,license);
    const target=httpsUrl(source.url);
    if(target){
     const link=el("a","button button-secondary","외부 자료 열기 ↗");
     link.href=target;link.target="_blank";link.rel="noopener noreferrer";
     link.setAttribute("aria-label",source.label+" 외부 원문 열기 (새 창)");
     li.append(link);
    }
    list.append(li);
   }
   details.append(list);rows.append(details);
  }
  section.append(rows);
  if(httpsUrl(manifest.officialNoticeUrl)){
    const policy=el("p","written-source-official-note");
    const a=el("a",null,"Q-net 공개 기준 확인 ↗");a.href=manifest.officialNoticeUrl;
    a.target="_blank";a.rel="noopener noreferrer";policy.append(a);
    section.append(policy);
  }
  return {years:manifest.years.length,links:manifest.years.reduce((n,y)=>n+y.materials.length,0)};
 }catch(error){
  section.append(el("p","written-source-error","외부 기출자료 목록을 표시할 수 없습니다."));
  console.error("Written exam source index failed",error);return null;
 }
}
