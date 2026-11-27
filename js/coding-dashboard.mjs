import {createLearningDashboard} from "./learning-dashboard.mjs?v=20261128-performance-1";
export function mountCodingDashboard({questions,labels,openList,openSet,loadQuestion}){
 const main=document.querySelector("main"),nav=document.createElement("nav"),panel=document.createElement("section");
 nav.className="coding-dashboard-nav";nav.setAttribute("aria-label","기초학습 메뉴");
 nav.innerHTML='<button data-view="bank" type="button">전체 문제</button><button data-view="review" type="button">복습노트</button><button data-view="progress" type="button">학습현황</button>';
 panel.className="coding-dashboard-panel";panel.hidden=true;
 main.querySelector(".portal-page-intro").after(nav);nav.after(panel);
 const dashboard=createLearningDashboard({host:panel,bank:questions,bankType:"coding",languageLabels:labels,defaultGoal:20,answerFor:q=>q.code,loadQuestion,openSet(items){showBank();openSet(items);}});
 function showBank(){dashboard.hide();panel.hidden=true;main.classList.remove("cd-dashboard-open");for(const b of nav.querySelectorAll("button"))b.setAttribute("aria-pressed",String(b.dataset.view==="bank"));}
 nav.addEventListener("click",e=>{const target=e.target.closest("[data-view]");if(!target)return;const view=target.dataset.view;if(view==="bank"){showBank();openList();return;}for(const b of nav.querySelectorAll("button"))b.setAttribute("aria-pressed",String(b===target));panel.hidden=false;main.classList.add("cd-dashboard-open");dashboard.show(view==="review"?"wrong":"progress",panel);});
 showBank();return {showBank};
}

