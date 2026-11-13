-- Keep existing Help Desk authorization semantics while evaluating session/role checks
-- once per query via initPlans, rather than for each visible request row.
-- All membership and ownership checks remain in place.
alter policy help_requests_read on public.help_requests
 using (
   (owner_id = (select auth.uid()) and (select private.portal_write_allowed()))
   or (select public.portal_super_admin_allowed())
 );
alter policy help_requests_admin_update on public.help_requests
 using ((select public.portal_super_admin_allowed()))
 with check ((select public.portal_super_admin_allowed()));
alter policy help_requests_create on public.help_requests
 with check (
   owner_id = (select auth.uid())
   and (select private.portal_write_allowed())
   and source = 'portal'
   and legacy_request_id is null
   and legacy_student_no is null
   and legacy_student_name is null
   and status = 'RECEIVED'
   and admin_reply = ''
 );
alter policy help_messages_insert on public.help_messages
 with check (
   author_id = (select auth.uid()) and (
     (sender_role = 'student'
       and (select private.portal_write_allowed())
       and exists (
         select 1 from public.help_requests r
         where r.id = help_messages.request_id
           and r.owner_id = (select auth.uid())
       )
     )
     or (sender_role = 'admin'
       and (select public.portal_super_admin_allowed()))
   )
 );
alter policy help_attachments_insert on public.help_attachments
 with check (
   uploader_id = (select auth.uid())
   and (select private.portal_write_allowed())
   and storage_path like ((select auth.uid())::text || '/' || request_id::text || '/%')
   and exists (
     select 1 from public.help_requests r
     where r.id = help_attachments.request_id
       and r.owner_id = (select auth.uid())
   )
 );
alter policy help_notifications_read on public.help_notifications
 using (
   recipient_id = (select auth.uid())
   and (select private.portal_write_allowed())
 );
alter policy help_notifications_mark_read on public.help_notifications
 using (
   recipient_id = (select auth.uid())
   and (select private.portal_write_allowed())
 )
 with check (
   recipient_id = (select auth.uid())
   and (select private.portal_write_allowed())
 );
