-- Allow students to correct only the result of their own coding self-assessment.
grant update (result) on public.learning_attempts to authenticated;
create policy attempts_self_correct_coding on public.learning_attempts
for update to authenticated
using (user_id = (select auth.uid()) and bank = 'coding' and grading_method = 'self'
       and result in ('correct','incorrect','ungraded') and (select private.portal_write_allowed()))
with check (user_id = (select auth.uid()) and bank = 'coding' and grading_method = 'self'
       and result in ('correct','incorrect','ungraded') and (select private.portal_write_allowed()));

create function private.sync_corrected_coding_grade()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.learning_progress p
  set correct_count = p.correct_count + (new.result='correct')::int - (old.result='correct')::int,
      incorrect_count = p.incorrect_count + (new.result='incorrect')::int - (old.result='incorrect')::int,
      last_result = case when p.last_attempt_at = old.submitted_at and p.last_result = old.result
                         then new.result else p.last_result end
  where p.user_id = old.user_id and p.bank = old.bank and p.question_id = old.question_id;
  return new;
end;
$$;
revoke all on function private.sync_corrected_coding_grade() from public, anon, authenticated;
create trigger learning_coding_grade_progress after update of result on public.learning_attempts
for each row when (old.bank='coding' and old.grading_method='self' and old.result is distinct from new.result)
execute function private.sync_corrected_coding_grade();

create function private.sync_coding_grade_metadata()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.metadata := coalesce(old.metadata, '{}'::jsonb) || jsonb_build_object('evaluation',new.result);
  return new;
end;
$$;
revoke all on function private.sync_coding_grade_metadata() from public, anon, authenticated;
create trigger learning_coding_grade_metadata before update of result on public.learning_attempts
for each row when (old.bank='coding' and old.grading_method='self' and old.result is distinct from new.result)
execute function private.sync_coding_grade_metadata();
