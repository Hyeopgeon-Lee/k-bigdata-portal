# 포털 Supabase Auth 운영

운영 도메인: https://portal.k-bigdata.kr/  
Supabase 프로젝트: \`k-bigdata-portal\` (\`zjsindkakjfzmjgrkaou\`)

## 선택적 로그인 운영 원칙

포털의 모든 기존 공개 학습 서비스는 **로그인 없이 이용할 수 있습니다.**

- https://portal.k-bigdata.kr/ 에 접속하면 기존 메인과 문제은행이 바로 표시됩니다.
- 상단 `로그인`은 선택 기능이며, 눌렀을 때만 로그인·회원가입 창을 표시합니다.
- 로그인 창의 `닫기`를 클릭하면 계정 없이 바로 학습으로 돌아갑니다.
- 로그인했더라도 계정 승인 대기·휴학·자퇴·졸업 상태가 공개 학습 페이지를 차단하지 않습니다.
- 관리자 전용 학생 정보·가입 승인·학적 변경은 로그인 및 서버 권한 확인이 필수입니다.
- Supabase 저장 대상 개인 학습기록은 승인된 계정에만 접근할 수 있으며, 기존 브라우저 로컬 학습 기록의 서버 동기화는 별도 기능입니다.
- 과거 테스트 URL의 `?portal-auth-preview=1`은 더 이상 로그인 강제 기능이 아닙니다.

## 준비 상태

- Resend 발송 도메인: \`noreply.k-bigdata.kr\` (Verified)
- Supabase Custom SMTP: \`smtp.resend.com:465\`, 사용자 \`resend\`, 발신 \`noreply@noreply.k-bigdata.kr\`
- Email provider / Confirm email: ON
- Site URL: \`https://portal.k-bigdata.kr\`
- Redirect URL: \`https://portal.k-bigdata.kr/**\`
- 브라우저 클라이언트는 **publishable key**만 사용하며 \`service_role\`/secret key는 금지.

## 회원가입부터 승인까지

1. \`portal.k-bigdata.kr\`에서 이름·학번·이메일·비밀번호 가입.
2. 확인 메일의 링크를 클릭하고 포털로 돌아와 로그인.
3. \`register_portal_member\`가 검증된 계정에 profile/pending/student를 생성.
4. \`start_portal_session\`이 Auth JWT의 \`session_id\`에 90일 포털 이용 만료 시간을 연결.
5. 슈퍼 관리자만 학생 명단을 조회하고 가입 승인/재학·휴학·자퇴·졸업을 변경. 공개 포털 학습 화면과는 별개입니다.
6. 승인된 재학생은 학습 데이터 읽기/쓰기, 승인된 휴학생은 읽기만 허용.
7. 자퇴/졸업/미승인 계정에는 학습 Data API 권한 없음.

## 교수 슈퍼 관리자 최초 부여

교수 계정 \`hglee67@kopo.ac.kr\`은 학번 없이 가입할 수 있지만, 이메일 인증만으로 자동으로 관리자 역할이 되지 않습니다.
이메일 인증 및 최초 로그인으로 \`public.profiles\` 레코드가 생긴 후, **Supabase SQL Editor에서 신뢰할 수 있는 운영자만** 아래 블록을 실행하십시오.

\`\`\`sql
do $$
declare v_user_id uuid;
begin
  select id into v_user_id from auth.users
  where lower(email) = 'hglee67@kopo.ac.kr'
    and email_confirmed_at is not null;
  if v_user_id is null then
    raise exception 'PROFESSOR_EMAIL_NOT_CONFIRMED';
  end if;
  if not exists(select 1 from public.profiles where user_id=v_user_id
    and lower(email)='hglee67@kopo.ac.kr') then
    raise exception 'PROFESSOR_PROFILE_NOT_FOUND';
  end if;
  update public.profiles
     set approval_status='approved',enrollment_status='enrolled',updated_at=now()
   where user_id=v_user_id;
  insert into public.account_roles(user_id,role)
  values(v_user_id,'super_admin')
  on conflict(user_id) do update set role='super_admin';
end $$;
\`\`\`

적용 후 교수 계정으로 새로 로그인하여 \`내 계정 → 학생 계정 관리\`를 확인합니다.

## 보안 경계

- 90일 포털 세션은 \`private.portal_sessions\`에 별도 보관됩니다. Supabase Auth refresh token 자동갱신이 90일 권한을 늘리는 것은 아닙니다.
- 권한은 \`auth.uid()\` 및 서버 DB 함수/RLS에서 확인합니다. 프론트엔드의 관리자 표시 여부는 편의 기능일 뿐입니다.
- GitHub Pages는 **정적 파일이 공개되는 호스팅**입니다. 브라우저 인증 레이어만으로 HTML/JS/문항 데이터를 비공개로 만들 수 없습니다. 실질적인 사내/학내 전용 콘텐츠는 인증 가능한 서버 또는 접근 제어 프록시로 이동해야 합니다.
- 기존 기기 로컬 저장 학습 기록은 아직 Supabase DB로 자동 동기화되지 않습니다.
- 실제 회원가입→이메일 수신→학생 승인→로그인→학습 저장의 브라우저 실증은 배포 후 필요합니다.
