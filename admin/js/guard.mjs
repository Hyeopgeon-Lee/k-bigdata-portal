/* Static HTML is not an authorization boundary: check the live server role
 * before revealing any management content or importing a privileged module. */
const panel=document.getElementById("admin-secure");
const denied=document.getElementById("admin-denied");
const status=document.getElementById("admin-gate-status");
try{
 const client=window.portalSupabaseClient;
 if(!client||window.portalLearning?.read!==true)throw Error("PORTAL_LOGIN_REQUIRED");
 const {data,error}=await client.rpc("portal_super_admin_allowed");
 if(error||data!==true)throw Error("SUPER_ADMIN_REQUIRED");
 window.portalAdminAllowed=true;
 const name=document.body.dataset.adminModule;
 if(!/^[a-z-]+\.js$/.test(name||""))throw Error("INVALID_ADMIN_MODULE");
 panel.hidden=false;
 // Visually identify the current management task in the common navigation.
 const current=new URL(location.href);
 for(const link of document.querySelectorAll('.admin-menu[aria-label="관리자 업무 메뉴"] a[href]')){
   const target=new URL(link.getAttribute("href"),location.href);
   const samePath=target.pathname===current.pathname;
   const sameView=!target.pathname.endsWith("/accounts.html")
     ||target.searchParams.get("view")===(current.searchParams.get("view")||"students");
   if(samePath&&sameView)link.setAttribute("aria-current","page");
   else link.removeAttribute("aria-current");
 }
 // Expose the ready state only after the protected content is no longer hidden.
 document.documentElement.dataset.adminAccess="approved";
 await import(new URL("./"+name,import.meta.url).href);
}catch(error){
 window.portalAdminAllowed=false;
 document.documentElement.dataset.adminAccess="denied";
 if(panel)panel.hidden=true;
 if(denied)denied.hidden=false;
 if(status)status.textContent=error?.message==="SUPER_ADMIN_REQUIRED"
  ?"이 페이지는 학과 슈퍼 관리자 계정만 이용할 수 있습니다."
  :"관리자 접근 권한을 확인하지 못했습니다. 다시 로그인한 후 시도해 주세요.";
}
