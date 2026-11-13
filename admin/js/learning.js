/* The guard imports these existing server-authorized academic dashboards only
 * after portal_super_admin_allowed returns true. */
if(window.portalAdminAllowed!==true)throw Error("ADMIN_SESSION_REQUIRED");
await import("../../js/teacher-learning.js?v=20261113-current-grade-1");
await import("../../js/study-teacher.js?v=20261113-current-grade-1");
