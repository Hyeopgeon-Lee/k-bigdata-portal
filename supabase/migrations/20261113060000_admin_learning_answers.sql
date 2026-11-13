create function public.admin_learning_answers(p_period text,p_start date,p_grade integer,p_subject text,p_wrong boolean,p_offset integer)
returns table(student text, submitted_at timestamptz, question_id text,result text,answer_text text)
language plpgsql stable security definer set search_path='' as $$
declare
 today date := (now() at time zone 'Asia/Seoul')::date;
 current_start date;
 period_end date;
begin
 if public.portal_super_admin_allowed() is not true then raise exception 'ADMIN_REQUIRED' using errcode='42501'; end if;
 if p_period not in ('week','month') or p_grade not in (0,1,2) or p_offset < 0 then raise exception 'INVALID_FILTER'; end if;
 current_start := date_trunc(p_period,today::timestamp)::date;
 if p_start > current_start or date_trunc(p_period,p_start::timestamp)::date <> p_start then raise exception 'INVALID_PERIOD'; end if;
 period_end := case when p_period='week' then p_start+7 else (p_start+interval '1 month')::date end;
 return query
 select p.full_name,a.submitted_at,a.question_id,a.result,a.answer_text
 from public.learning_attempts a
 left join public.profiles p on p.user_id=a.user_id
 left join public.learning_period_members m on m.user_id=a.user_id and m.period_type=p_period and m.period_start=p_start
 where a.submitted_at >= (p_start::timestamp at time zone 'Asia/Seoul')
 and a.submitted_at < (period_end::timestamp at time zone 'Asia/Seoul')
 and (case when p_start=current_start then
   p.signup_type='student' and p.approval_status='approved' and p.enrollment_status='enrolled' and p.academic_year in (1,2) and (p_grade=0 or p.academic_year=p_grade)
 else m.user_id is not null and (p_grade=0 or m.grade=p_grade) end)
 and (not p_wrong or a.result='incorrect')
 and (case a.bank when 'coding' then split_part(a.question_id,'-',1) when 'ncp' then 'NCP' else 'PRACTICAL' end)=p_subject
 order by a.submitted_at desc,a.id desc limit 26 offset p_offset;
end $$;
revoke all on function public.admin_learning_answers(text,date,integer,text,boolean,integer) from public,anon;
grant execute on function public.admin_learning_answers(text,date,integer,text,boolean,integer) to authenticated;
