create or replace function public.portal_bootstrap()
returns jsonb language plpgsql security invoker set search_path='' as $$
declare p jsonb; exp timestamptz; access jsonb; admin_allowed boolean;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 select jsonb_build_object('user_id',user_id,'full_name',full_name,'email',email,'student_no',student_no,
  'signup_type',signup_type,'academic_year',academic_year,'enrollment_status',enrollment_status,
  'approval_status',approval_status,'graduation_year',graduation_year,'mobile_phone',mobile_phone,'alumni_source_id',alumni_source_id,'alumni_student_no',alumni_student_no)
  into p from public.profiles where user_id=auth.uid();
 if p is null then return jsonb_build_object('profile',null); end if;
 exp:=public.start_portal_session();
 access:=public.portal_learning_access();
 admin_allowed:=case when (access->>'read')::boolean then public.portal_super_admin_allowed() else false end;
 return jsonb_build_object('profile',p,'expires',exp,'access',access,'admin',admin_allowed);
end $$;
revoke all on function public.portal_bootstrap() from public,anon;
grant execute on function public.portal_bootstrap() to authenticated;
