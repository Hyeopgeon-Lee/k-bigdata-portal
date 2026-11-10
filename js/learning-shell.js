import {getAccount} from "./learning-auth.js";
const main=document.querySelector("main");
if(main){
 const bar=document.createElement("nav");
 bar.className="learning-auth-strip";bar.setAttribute("aria-label","학습계정");
 const accountLink=document.createElement("a");
 accountLink.href="login.html";accountLink.textContent="로그인 · 학습기록 동기화";
 const myLink=document.createElement("a");
 myLink.href="my-learning.html";myLink.textContent="나의 학습현황";
 myLink.hidden=true;
 bar.append(accountLink,myLink);main.before(bar);
 getAccount().then(account=>{
  if(account.loggedIn){
   accountLink.textContent=(account.profile?.full_name||"내 계정")+" · "+(account.active?"로그인됨":"계정 상태 확인");
   myLink.hidden=false;
  }
 }).catch(()=>{});
}
