/* The guard imports these existing server-authorized academic dashboards only
 * after portal_super_admin_allowed returns true. */
if(window.portalAdminAllowed!==true)throw Error("ADMIN_SESSION_REQUIRED");
await import("../../js/teacher-learning.js?v=20261113-snapshot-1");
await import("../../js/study-teacher.js?v=20261116-study-recovery-1");

await import("../../js/study-diagnostics.js?v=20261116-study-diagnostics-1");

await import("../../js/written-admin.js?v=20261128-performance-1");
