import {categories, services, portalNavLinks} from './services.js?v=20261112-alumni-integrated-1';

export const shellVersion = '20261112-page-intro-2';
export const portalPages = {
  index: {title:'통합 포털', group:null},
  services: {title:'전체 서비스', group:null, directory:true, eyebrow:'ALL SERVICES', description:'필요한 서비스를 찾아보세요.', headingId:'directory-title'},
  coding: {title:'기초 코딩 350제', group:'learning', eyebrow:'CODING PRACTICE', description:'Java·C·Python·Ubuntu 문제풀이', headingId:'coding-heading', quiz:true},
  study: {title:'자율학습 관리', group:null, navGroup:'learning', eyebrow:'STUDENT LEARNING · AFTER SCHOOL', description:'이번 주 자율학습을 계획하고 기록하세요.', locked:true},
  'study-absence': {title:'자율학습 미참여 사유', group:null, locked:true},
  mypage: {title:'마이페이지', group:null, locked:true},
  'my-certifications': {title:'나의 자격증', group:null, navGroup:'learning', locked:true},
  'my-learning': {title:'나의 학습현황', group:null, navGroup:'learning', eyebrow:'STUDENT LEARNING · MY PROGRESS', description:'문제풀이와 오답 복습 현황을 확인하세요.', locked:true},
  'teacher-learning': {title:'학급 학습통계', group:null, navGroup:'learning', eyebrow:'SUPER ADMIN · WEEKLY LEARNING', description:'학생 학습 현황과 주간 메일 발송을 관리하세요.', locked:true},
  practical: {title:'정보처리 기출문제', group:'learning', eyebrow:'PRACTICAL EXAM', description:'정보처리기사·정보처리산업기사의 C·Java·Python·SQL 실기 기출문제를 학습하세요.', headingId:'portal-intro-title-practical', quiz:true},
  interview: {title:'기술면접 문제은행', group:'learning', eyebrow:'TECHNICAL INTERVIEW', description:'IT 직무 기술면접 문제풀이'},
  certifications: {title:'IT 자격증', group:'learning', eyebrow:'CERTIFICATIONS', description:'자격증별 시험 정보와 취득 시기를 확인하세요.'},
  ncp: {title:'NCP 기출문제', group:'learning', eyebrow:'NCP CERTIFICATION', description:'NCP Professional 공개 복원문제 75문항을 학습하고 원문 번호와 출처를 확인하세요.', headingId:'ncp-title', quiz:true},
  docs: {title:'개발 공식문서', group:'learning', eyebrow:'OFFICIAL DOCUMENTATION', description:'공식 기술문서를 찾아보세요.'},
  jobs: {title:'IT 직무 가이드', group:'career', eyebrow:'IT CAREERS', description:'직무별 핵심 역량을 확인하세요.'},
  resume: {title:'자기소개서 작성 가이드', group:'career', eyebrow:'COVER LETTER GUIDE', description:'실제 경험과 행동을 근거로 지원 직무에 적합한 이유를 보여주는 자기소개서를 작성하세요.'},
  recruit: {title:'추천 채용공고', group:'career', eyebrow:'JOB OPENINGS', description:'학과 추천 채용공고'},
  'project-guide': {title:'기술보다 문제에서 시작하세요', group:'project', eyebrow:'PROJECT GUIDE', description:'실제 사용자의 문제를 발견하고 소프트웨어 서비스로 해결하는 프로젝트를 설계하세요.'},
  schedule: {title:'학과 주요 일정', group:'campus', eyebrow:'DEPARTMENT SCHEDULE', description:'학과 일정을 확인하세요.', headingId:'schedule-title'},
  room: {title:'프로젝트실 예약', group:'campus', eyebrow:'PROJECT ROOM · STUDENT BOOKING', description:'8318호·8319호 예약', locked:true},
  help: {title:'학과 요청 · 문의', group:'campus', eyebrow:'STUDENT SERVICE · HELP DESK', description:'시설·수업·프로젝트 관련 요청을 등록하세요.', locked:true}
};
export const groups = Object.values(categories);
export const navigationItems = portalNavLinks.map(item=>{
  const service=services.find(service=>service.id===item.id);
  if(!service)throw new Error('Unknown navigation service: '+item.id);
  return {...item,url:service.url};
});
export const officialWebsite = 'https://www.kopo.ac.kr/kangseo/content.do?menu=1547';
