/* Imported only by the existing super-admin guard. Each tab activates its own data module. */
if(window.portalAdminAllowed!==true)throw Error("ADMIN_SESSION_REQUIRED");
const get=id=>document.getElementById(id),buttons=[...document.querySelectorAll("[data-learning-tab]")];
const keys=buttons.map(b=>b.dataset.learningTab);
let active="",generation=0;
const modules=new Map();
const loaders={
 problem:()=>import("../../js/teacher-learning.js?v=20261128-learning-share-1").then(m=>m.activateLearning),
 study:()=>import("../../js/study-teacher.js?v=20261128-learning-tabs-1").then(m=>m.activateStudy),
 written:()=>import("../../js/written-admin.js?v=20261128-learning-tabs-1").then(m=>m.activateWritten),
 operations:()=>Promise.all([import("../../js/learning-admin-settings.mjs?v=20261128-learning-tabs-1"),import("../../js/study-diagnostics.js?v=20261128-learning-tabs-1")]).then(([m,d])=>()=>Promise.allSettled([m.activateSettings(),d.activateDiagnostics()]))
};
function getLoader(key){
 if(!modules.has(key)){
  const promise=loaders[key]().catch(error=>{modules.delete(key);throw error;});
  modules.set(key,promise);
 }
 return modules.get(key);
}
async function open(key,options={}){
 if(!keys.includes(key))return;
 if(active===key&&!Object.keys(options).length)return;
 active=key;const request=++generation;
 for(const button of buttons){
  const selected=button.dataset.learningTab===key;
  button.setAttribute("aria-selected",String(selected));button.tabIndex=selected?0:-1;
  get("learning-panel-"+button.dataset.learningTab).hidden=!selected;
 }
 const gradePanel=document.querySelector(".admin-grade-panel");
 if(gradePanel)gradePanel.hidden=key==="operations";
 const status=get("learning-tab-status");status.hidden=false;status.textContent="화면을 불러오는 중…";
 try{
  const activate=await getLoader(key);
  if(request!==generation)return;
  status.hidden=true;
  await activate(options);
 }catch(error){
  if(request!==generation)return;
  console.error("Learning tab",key,error);status.hidden=false;status.replaceChildren();
  status.append(document.createTextNode("화면을 불러오지 못했습니다. "));
  const retry=document.createElement("button");retry.type="button";retry.textContent="다시 시도";
  retry.addEventListener("click",()=>{active="";void open(key,options);});status.append(retry);
 }
}
window.portalLearningTabs={open,isActive:key=>active===key};
for(const button of buttons){
 button.addEventListener("click",()=>void open(button.dataset.learningTab));
 button.addEventListener("keydown",e=>{
  let next=keys.indexOf(button.dataset.learningTab);
  if(e.key==="ArrowRight"||e.key==="ArrowDown")next=(next+1)%keys.length;
  else if(e.key==="ArrowLeft"||e.key==="ArrowUp")next=(next-1+keys.length)%keys.length;
  else if(e.key==="Home")next=0;else if(e.key==="End")next=keys.length-1;else return;
  e.preventDefault();buttons[next].focus();void open(keys[next]);
 });
}
const overviewTab=document.querySelector('[data-admin-grade=""]');if(overviewTab)overviewTab.textContent="전체 비교";
await open("problem");
