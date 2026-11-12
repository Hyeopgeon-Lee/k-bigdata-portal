# 졸업생 네트워크 Supabase 전환 (2026-11-13)

## 운영 경로
- 포털: https://portal.k-bigdata.kr/alumni/index.html
- 포털 관리자: https://portal.k-bigdata.kr/alumni/admin.html
- 기존 독립 서비스: https://alumni.k-bigdata.kr/ (원본 Google Sheets를 사용하는 별도 서비스로 보존)
- 회원 인증: 기존 학과 포털 Supabase Auth `kbigdata-portal-auth-v1`
- 데이터 API: Supabase Edge Function `alumni-network-api`
- 데이터 원본: 학과 Alumni Network Google Sheets (이관 전 스냅샷)

## 이관 기록
| Google Sheets 탭 | Supabase 행 수 |
|---|---:|
| alumni | 44 |
| jobs | 2 |
| alumni_news | 1 |
| contact_requests | 3 |
| job_mail_logs | 1 |
| alumni_news_mail_logs | 1 |
| alumni_consent_logs | 74 |
| career_consent_invites | 0 |
| alumni_news_consent_invites | 0 |
| admins | 1 |
| logs | 321 |
| pin_reset_requests | 1 |
| **합계** | **449** |

이관 시 `source_kind`+`source_id` 복합 키로 중복을 방지했으며 모든 원본 행은 `public.alumni_network_records.data` JSONB로 보관한다. 원본 시트는 삭제하거나 수정하지 않았다.

## 보호 및 권한
- `alumni_network_records`와 `alumni_network_mail_outbox`는 RLS가 활성화되어 있으며 `anon`/`authenticated`에 직접 접근 권한이 없다.
- Supabase Edge Function이 JWT의 실제 로그인 사용자를 검증하고, 포털의 `portal_learning_access`, `portal_super_admin_allowed` 및 프로필 `alumni_source_id`로 조회·수정·승인 권한을 검사한다.
- 이메일·휴대전화, 과거 PIN 해시, 연락 요청 원문 및 운영 로그는 공개 목록 API에 노출하지 않는다.
- 레거시 Alumni ID/PIN과 Google 관리자 비밀번호는 **새 포털에서 인증 수단으로 사용하지 않는다**. 포털 인증과 비밀번호 재설정을 사용한다.
- 메일 발송은 Resend로 전환하되 관리자가 명시적으로 호출한 발송은 중복 방지 기록을 남긴다.

## 이전 서비스 기능 매핑
- 졸업생 찾기, 조건 검색, 상세 프로필 및 경력: `list`, `detail`, `alumniDetail`, `careerPublic`
- 내 정보 등록·수정: `register`, `getOwn`, `update` (포털 계정 본인 확인, 수정 시 재승인)
- 연락 요청: `contact` (수신 동의 확인, 발송 이력 저장)
- 채용공고 목록·상세·등록: `jobs`, `jobDetail`, `submitJob`
- 동문소식 목록·상세·등록: `newsList`, `newsDetail`, `submitNews`
- 관리자 조회·승인·반려·숨김·재게시: `adminList`, `adminApprove`, `adminJobApprove`, `adminNewsApprove` 등
- 관리자 채용공고·동문소식 등록, 수신 안내 메일 및 발송 기록: `adminCreateJob`, `adminCreateNews`, `adminRunJobDigest`, `adminSendCareerConsentInvites`, `adminSendNewsConsentInvites`

## 운영 전환 참고
1. **기존** `alumni.k-bigdata.kr`은 별도 Google Apps Script/Sheets 기반으로 계속 작동한다. 이관 후 양쪽에서 수정하면 데이터가 달라진다. 운영 담당자가 구 사이트의 신규 등록을 종료하거나 구 사이트를 새 포털로 리디렉션하기 전까지는 **새 포털을 편집 원본으로 사용**해야 한다.
2. 기존 Google Apps Script에 설치된 시간 기반 채용·동문소식 발송 트리거는 이번 이관으로 자동 제거되지 않는다. 자동 메일 중복을 방지하려면 구 서비스의 트리거를 별도 확인하고 비활성화해야 한다.
3. GitHub CI는 코드·라우팅·문법 검사를 수행한다. 실제 사용자 로그인, 원본과 신규 데이터 비교, 연락 요청 Resend 발송 등은 테스트 계정으로 별도 검증이 필요하다.
4. 이관 당시 원본의 졸업생 44행은 승인 43행·대기 1행이며, 포털 계정 이관 완료자 39명과 원본 졸업생 공개 프로필 수는 동일한 개념이 아니다.
