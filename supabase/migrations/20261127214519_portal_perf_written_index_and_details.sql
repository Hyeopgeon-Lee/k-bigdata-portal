-- A single compact list response preserves every searchable question and answer ID.
-- Full explanations, hints and code are fetched only for the selected practice/mock session.
create or replace function public.portal_written_index(p_exam_type text)
returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(payload - array['explanation','hint','code','registrationKind','verificationDate','concept'] order by question_id),'[]'::jsonb)
 from public.written_question_bank where exam_type=p_exam_type and p_exam_type in ('engineer','industrial')
$$;
revoke all on function public.portal_written_index(text) from public,anon;
grant execute on function public.portal_written_index(text) to authenticated;
create or replace function public.portal_written_details(p_exam_type text,p_ids text[])
returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(payload order by question_id),'[]'::jsonb)
 from public.written_question_bank
 where exam_type=p_exam_type and p_exam_type in ('engineer','industrial')
 and cardinality(p_ids) between 1 and 100 and question_id=any(p_ids)
$$;
revoke all on function public.portal_written_details(text,text[]) from public,anon;
grant execute on function public.portal_written_details(text,text[]) to authenticated;

