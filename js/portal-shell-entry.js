import {initPortalShell} from "./portal-shell.js?v=20261009-course-info-1";

initPortalShell().catch(error=>{
 console.error("Portal shell initialization failed",error);
 const status=document.querySelector("#search-status");
 if(status)status.textContent="포털 기능을 초기화하지 못했습니다. 새로고침해 주세요.";
});
