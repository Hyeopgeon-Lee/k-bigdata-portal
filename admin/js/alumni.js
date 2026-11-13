/* Loaded by the shared admin guard only after portal_super_admin_allowed() succeeds.
 * Reuse the Alumni Network API and event handlers; no duplicate data store.
 */
if(window.portalAdminAllowed!==true)throw Error("ADMIN_ACCESS_DENIED");
const scripts=[
  "../alumni/js/config.js",
  "../alumni/js/api.js",
  "../alumni/js/common.js?v=20261113-copy-cleanup-1",
  "../alumni/js/admin.js?v=20261113-alumni-unified-1"
];
for(const path of scripts){
  await new Promise((resolve,reject)=>{
    const tag=document.createElement("script");
    tag.src=new URL(path,document.baseURI).href;
    tag.async=false;
    tag.onload=resolve;
    tag.onerror=()=>reject(Error("ALUMNI_ADMIN_SCRIPT_FAILED: "+path));
    document.body.append(tag);
  });
}
