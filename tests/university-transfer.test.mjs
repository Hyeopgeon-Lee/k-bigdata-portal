import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const myPage=readFileSync(new URL("../js/my-page.js",import.meta.url),"utf8");
const html=readFileSync(new URL("../mypage.html",import.meta.url),"utf8");
const admin=readFileSync(new URL("../admin/js/unified-users.mjs",import.meta.url),"utf8");
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function harness(profile,{record=null,prior=null,isAdmin=false,failLoad=false}={}){
 const calls=[],nodes=new Map();
 function node(id){
  if(!nodes.has(id))nodes.set(id,{hidden:true,disabled:false,required:false,value:"",textContent:"",dataset:{},handlers:{},setAttribute(){},focus(){},addEventListener(name,handler){this.handlers[name]=handler;},querySelectorAll(){return [];}});
  return nodes.get(id);
 }
 const form=node("my-page-transfer-form"),save=node("save");
 form.elements={transfer_status:{value:""},university:node("university"),department:node("department")};
 form.querySelector=()=>save;
 const api={rpc:async(name,args)=>{
  calls.push([name,args]);
  if(name==="my_university_transfer"){if(failLoad){failLoad=false;return {error:Error("unavailable")};}return {data:{record,prior_education:prior}};}
  if(name==="set_my_university_transfer"){record={transfer_status:args.p_status,university:args.p_university,department:args.p_department};return {data:record};}
  throw Error(name);
 }};
 const context={document:{getElementById:node},portalSupabaseClient:api};
 vm.createContext(context);
 vm.runInContext(myPage.replace(/await start\(\);\s*$/,"")+"\n globalThis.init=initUniversityTransfer;",context);
 context.init({...profile,approval_status:profile.approval_status||"approved"},isAdmin);
 return {node,form,save,calls,choose(value){form.elements.transfer_status.value=value;form.handlers.change();},
 submit(){return form.handlers.submit({preventDefault(){}});}};
}
const student={signup_type:"student",academic_year:2,enrollment_status:"enrolled"};
test("transfer eligibility does not include first-year, leave, withdrawn or admin",async()=>{
 for(const [profile,isAdmin,expected] of [
  [student,false,true],[{...student,academic_year:1},false,false],
  [{...student,enrollment_status:"leave"},false,false],[{...student,enrollment_status:"withdrawn"},false,false],
  [{...student,enrollment_status:"early_employment"},false,true],[{...student,enrollment_status:"graduated"},false,true],
  [{signup_type:"alumni",enrollment_status:"graduated"},false,true],[{...student,approval_status:"pending"},false,false],[student,true,false]
 ]){
  const h=harness(profile,{isAdmin});await tick();
  assert.equal(h.node("my-page-transfer-panel").hidden,!expected);
  assert.equal(h.calls.length,expected?1:0);
 }
});
test("status has no default, accepted names are required, save and clear work",async()=>{
 const h=harness(student);await tick();
 assert.equal(h.node("my-page-transfer-state").textContent,"미등록");assert.equal(h.save.disabled,true);
 h.choose("accepted");
 assert.equal(h.node("my-page-transfer-names").hidden,false);assert.equal(h.form.elements.department.required,true);
 await h.submit();assert.equal(h.calls.length,1);
 h.form.elements.university.value="  테스트대학교  ";h.form.elements.department.value="테스트학과";
 await h.submit();assert.equal(h.calls[1][1].p_university,"테스트대학교");assert.equal(h.node("my-page-transfer-state").textContent,"편입 합격");
 h.choose("none");assert.equal(h.node("my-page-transfer-names").hidden,true);await h.submit();
 assert.equal(h.calls[2][1].p_university,null);assert.equal(h.form.elements.university.value,"");
 assert.equal(h.node("my-page-transfer-state").textContent,"편입 계획 없음");
});
test("stored data loads and existing alumni fields require explicit selection",async()=>{
 const h=harness({signup_type:"alumni",enrollment_status:"graduated"},{prior:{university:"기존대학교",department:"기존학과"}});
 await tick();assert.equal(h.form.elements.university.value,"");
 h.choose("completed");assert.equal(h.node("my-page-transfer-use-prior").hidden,false);
 h.node("my-page-transfer-use-prior").handlers.click();assert.equal(h.form.elements.department.value,"기존학과");
 const stored=harness(student,{record:{transfer_status:"completed",university:"기존대학교",department:"기존학과"}});
 await tick();assert.equal(stored.form.elements.university.value,"기존대학교");assert.equal(stored.node("my-page-transfer-state").textContent,"편입 완료");
});
test("failed reads keep all controls disabled until retry succeeds",async()=>{
 const h=harness(student,{failLoad:true});await tick();
 assert.equal(h.save.disabled,true);assert.equal(h.node("my-page-transfer-options").disabled,true);assert.equal(h.node("my-page-transfer-retry").hidden,false);
 h.node("my-page-transfer-retry").handlers.click();await tick();
 assert.equal(h.node("my-page-transfer-options").disabled,false);assert.equal(h.node("my-page-transfer-state").textContent,"미등록");
});
test("new form starts hidden and admin report uses guarded RPC and charts",()=>{
 assert.match(html,/id="my-page-transfer-panel"[^>]* hidden/);
 assert.equal([...html.matchAll(/name="transfer_status"/g)].length,4);
 assert.match(admin,/admin_university_transfers/);assert.match(admin,/편입 상태별 인원/);assert.match(admin,/대학교별 편입 인원/);assert.match(admin,/학과별 편입 인원/);
 assert.match(admin,/p_graduation_year/);assert.match(admin,/data-transfer-user/);
});
