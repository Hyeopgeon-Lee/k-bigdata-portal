import {examConfig,loadPrintableExam} from "./mock-exam-model.mjs?v=20261128-1";
import {loadWrittenExamQuestions,loadWrittenDetails} from "../../js/written-exam-data.mjs?v=20261128-performance-1";

if(window.portalAdminAllowed!==true)throw Error("SUPER_ADMIN_REQUIRED");
const db=window.portalSupabaseClient,$=id=>document.getElementById(id);
const generation=$("exam-generate"),status=$("exam-status"),result=$("exam-result");
const typeInputs=[...document.querySelectorAll('input[name="exam-type"]')],variants=$("exam-variants");
const formButtons=[...document.querySelectorAll("[data-form]")],downloadButtons=[...document.querySelectorAll("[data-download]")];
let busy=false,exam=null,pdfModule=null,rendered={},selected="A",index=0,previewUrl=null;
const getType=()=>typeInputs.find(x=>x.checked)?.value||"engineer";
const notify=(message,error=false)=>{status.textContent=message;status.dataset.error=String(error);};
const fmt=new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"});
function newId(){const id=fmt.format(new Date()).replace(/[^0-9]/g,"");const suffix=Array.from(crypto.getRandomValues(new Uint8Array(2)),x=>x.toString(16).padStart(2,"0")).join("").toUpperCase();return id+"-"+suffix;}
function updateSubjects(){
 $("exam-subjects").replaceChildren(...examConfig(getType()).subjects.map(s=>{
  const li=document.createElement("li");li.textContent=s+" 20문항";return li;
 }));
 const config=examConfig(getType()),ui=window.portalAdminUI;
 ui.renderBars(ui.chartMount($("exam-subjects"),"exam-subject-chart"),"과목별 출제 문항",config.subjects.map(subject=>[subject,20]),{unit:"문항",caption:config.label+" · 총 "+config.total+"문항",max:20});
}
function resetResult(){
 if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null;
 $("exam-preview-image").removeAttribute("src");result.hidden=true;
 rendered={};exam=null;selected="A";index=0;
}
function setBusy(value){
 busy=value;generation.disabled=value;typeInputs.forEach(x=>x.disabled=value);variants.disabled=value;
 generation.textContent=value?"시험지 생성 중…":exam?"새 시험지 다시 생성":"시험지 PDF 생성";
}
function preview(){
 const pages=rendered[selected];if(!pages)return;
 index=Math.max(0,Math.min(index,pages.length-1));
 if(previewUrl)URL.revokeObjectURL(previewUrl);
 previewUrl=URL.createObjectURL(pages[index].blob);$("exam-preview-image").src=previewUrl;
 $("exam-preview-image").alt=selected+"형 "+(index===pages.length-1?"정답표":"시험지 "+(index+1)+"페이지");
 $("exam-page-label").textContent=(index+1)+" / "+pages.length+(index===pages.length-1?" · 정답표":"");
 $("exam-prev").disabled=index===0;$("exam-next").disabled=index===pages.length-1;
 $("exam-last").disabled=index===pages.length-1;
}
function showForm(form){
 if(!rendered[form])return;selected=form;index=0;
 $("exam-form-tag").textContent=form+"형";
 formButtons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.form===form)));
 const pages=rendered[form];
 $("exam-result-info").textContent=exam.config.label+" · "+exam.config.total+"문항 · "+(pages.length-1)+"쪽 + 정답표 1쪽 · "+exam.id;
 preview();
}
function download(kind){
 if(busy||!exam||!rendered[selected]||window.portalAdminAllowed!==true)return;
 const all=rendered[selected],pages=kind==="questions"?all.slice(0,-1):kind==="answers"?all.slice(-1):all;
 const labels={full:"시험지_정답표",questions:"학생용_시험지",answers:"교수자용_정답표"};
 try{
  const blob=pdfModule.buildPdf(pages),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=exam.config.label+"_실전모의고사_"+exam.id+"_"+selected+"형_"+labels[kind]+".pdf";
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }catch(error){notify(error?.message||"PDF를 다운로드하지 못했습니다. 다시 시도하세요.",true);}
}
async function generate(){
 if(busy)return;
 const type=getType(),both=variants.checked;
 resetResult();setBusy(true);
 try{
  notify("관리자 접근 권한을 확인하고 있습니다.");
  const {data,error}=await db.rpc("portal_super_admin_allowed");
  if(error||data!==true)throw Error("관리자 권한을 확인할 수 없습니다. 다시 로그인해 주세요.");
  notify("전체 기출문제를 불러오는 중입니다.");
  const bank=await loadWrittenExamQuestions(type);
  notify("출제 후보의 문제와 정답을 확인하고 있습니다.");
  exam=await loadPrintableExam(bank,type,ids=>loadWrittenDetails(type,ids),{variants:both,id:newId()});
  pdfModule??=await import("./mock-exam-pdf.mjs?v=20261128-1");
  for(const form of Object.keys(exam.forms)){
   rendered[form]=await pdfModule.renderExam(exam,form,(page,total)=>notify(form+"형 PDF 생성 중… "+page+" / "+total+"쪽"));
  }
  $("exam-form-switch").hidden=!both;result.hidden=false;showForm("A");
  notify("PDF 생성 완료 · 출제 가능 문항 "+exam.registeredCounts.reduce((n,e)=>n+e.available,0).toLocaleString("ko-KR")+"개에서 "+exam.config.total+"문항을 선택했습니다.");
  setBusy(false);
  // One automatic download (A); other formats/forms use explicit buttons.
  download("full");
  result.scrollIntoView({behavior:"smooth",block:"start"});
 }catch(error){
  resetResult();notify(error?.message||"시험지 생성 중 오류가 발생했습니다. 다시 시도해 주세요.",true);
 }finally{setBusy(false);}
}
typeInputs.forEach(x=>x.addEventListener("change",()=>{resetResult();updateSubjects();notify("시험 종류를 선택했습니다. PDF 생성 버튼을 누르세요.");setBusy(false);}));
variants.addEventListener("change",()=>{resetResult();notify("PDF 생성 버튼을 눌러 새 시험지를 만드세요.");setBusy(false);});
generation.addEventListener("click",generate);
formButtons.forEach(b=>b.addEventListener("click",()=>showForm(b.dataset.form)));
downloadButtons.forEach(b=>b.addEventListener("click",()=>download(b.dataset.download)));
$("exam-prev").addEventListener("click",()=>{index--;preview();});
$("exam-next").addEventListener("click",()=>{index++;preview();});
$("exam-last").addEventListener("click",()=>{index=rendered[selected].length-1;preview();});
window.addEventListener("pagehide",()=>{if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null;});
updateSubjects();
