# 학과 통합 포털 가입 인증 메일

회원가입 시 Supabase Auth의 **Confirm sign up** 템플릿에 사용할 한국어 HTML 디자인입니다.

## 메일 제목
`[빅데이터소프트웨어공학과 포털] 이메일 인증을 완료해 주세요`

## Supabase 운영 프로젝트 적용
1. [Email Templates 설정](https://supabase.com/dashboard/project/zjsindkakjfzmjgrkaou/auth/templates)으로 이동합니다.
2. **Confirm sign up** 선택
3. Subject에 위 메일 제목 입력
4. Body의 기존 영문 HTML을 [confirm-signup.html](./confirm-signup.html)의 **전체 내용**으로 교체
5. **Save** 후 신규 가입 이메일을 발송하여 본문·인증 버튼을 테스트

> 주의: 이 파일을 GitHub에 커밋하는 것만으로 Supabase 운영 메일 템플릿이 자동 변경되지는 않습니다. 호스팅된 Supabase는 Dashboard의 템플릿 설정을 별도로 저장해야 합니다.

## 템플릿 변수
- `{{ .Data.full_name }}`: 가입 화면에서 Supabase 사용자 메타데이터로 전달된 이름
- `{{ .ConfirmationURL }}`: Supabase에서 생성한 실제 인증 URL. 본문 버튼과 대체 링크에서 그대로 사용

이메일 인증 이후에는 관리자 승인 후 포털을 이용할 수 있습니다. **가입 승인 안내 메일**은 별도의 Resend Edge Function `approve-portal-signup`에서 발송되며, 본 파일은 그 메일을 변경하지 않습니다.
