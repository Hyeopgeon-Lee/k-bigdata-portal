import {categories, services, portalNavLinks} from './services.js?v=20261026-schedule-align-1';

export const shellVersion = '20261112-page-intro-1';
export const portalPages = {
  index: {title:'통합 포털', group:null},
  services: {title:'전체 서비스', group:null, directory:true, eyebrow:'ALL SERVICES', description:'학습·취업·프로젝트·학과 생활 도구를 한곳에서 찾으세요. 필요한 서비스를 즐겨찾기에 추가할 수 있습니다.', headingId:'directory-title'},
  coding: {title:'기초 코딩 350제', group:'learning', eyebrow:'CODING PRACTICE', description:'Java·C·Python·Ubuntu 문제를 풀며 프로그래밍 기초를 학습하세요.', headingId:'coding-heading', quiz:true},
  'my-learning': {title:'나의 학습현황', group:null, navGroup:'learning', eyebrow:'STUDENT LEARNING · MY PROGRESS', description:'자가평가, 문제풀이 이력, 오답 복습을 한 화면에서 확인하세요. 클라우드에 저장된 학습기록을 표시합니다.'},
  'teacher-learning': {title:'학급 학습통계', group:null, navGroup:'learning', eyebrow:'SUPER ADMIN · WEEKLY LEARNING', description:'학급 학습 활동을 확인하고 주간 리포트 이메일 발송 여부를 관리합니다.'},
  practical: {title:'정보처리 기출문제', group:'learning', eyebrow:'PRACTICAL EXAM', description:'정보처리기사·정보처리산업기사의 C·Java·Python·SQL 실기 기출문제를 학습하세요.', headingId:'portal-intro-title-practical', quiz:true},
  interview: {title:'기술면접 문제은행', group:'learning', eyebrow:'TECHNICAL INTERVIEW', description:'신입 IT 직무 핵심 문제를 짧게 반복해서 연습하세요.'},
  certifications: {title:'IT 자격증', group:'learning', eyebrow:'CERTIFICATIONS', description:'시험 영역과 학과 교육, 관련 직무와 권장 취득 시기를 확인하세요.'},
  ncp: {title:'NCP 기출문제', group:'learning', eyebrow:'NCP CERTIFICATION', description:'NCP Professional 공개 복원문제 75문항을 학습하고 원문 번호와 출처를 확인하세요.', headingId:'ncp-title', quiz:true},
  docs: {title:'개발 공식문서', group:'learning', eyebrow:'OFFICIAL DOCUMENTATION', description:'수업·프로젝트·취업 준비에 필요한 핵심 개발 기술의 공식문서를 한곳에서 확인하세요.'},
  jobs: {title:'IT 직무 가이드', group:'career', eyebrow:'IT CAREERS', description:'직무의 역할과 기술을 이해하고 프로젝트에서 보여줄 역량을 찾아보세요.'},
  resume: {title:'자기소개서 작성 가이드', group:'career', eyebrow:'COVER LETTER GUIDE', description:'실제 경험과 행동을 근거로 지원 직무에 적합한 이유를 보여주는 자기소개서를 작성하세요.'},
  recruit: {title:'추천 채용공고', group:'career', eyebrow:'JOB OPENINGS', description:'학과에서 추천하는 채용공고를 확인하고 지원을 준비하세요.'},
  'project-guide': {title:'기술보다 문제에서 시작하세요', group:'project', eyebrow:'PROJECT GUIDE', description:'실제 사용자의 문제를 발견하고 소프트웨어 서비스로 해결하는 프로젝트를 설계하세요.'},
  schedule: {title:'학과 주요 일정', group:'campus', eyebrow:'DEPARTMENT SCHEDULE', description:'학사·시험·프로젝트·취업 등 학과에서 안내하는 일정을 달력과 목록으로 확인하세요.', headingId:'schedule-title'},
  room: {title:'프로젝트실 예약', group:'campus', eyebrow:'PROJECT ROOM · STUDENT BOOKING', description:'8318호와 8319호의 이용 현황을 확인하고 예약하세요.'},
  help: {title:'학과 요청 · 문의', group:'campus', eyebrow:'STUDENT SERVICE · HELP DESK', description:'PC·실습실 장애, 학과 시설, 수업·프로젝트 관련 요청을 등록하고 처리 내용을 확인하세요.'}
};
export const groups = Object.values(categories);
export const navigationItems = portalNavLinks.map(item=>{
  const service=services.find(service=>service.id===item.id);
  if(!service)throw new Error('Unknown navigation service: '+item.id);
  return {...item,url:service.url};
});
export const officialWebsite = 'https://www.kopo.ac.kr/kangseo/content.do?menu=1547';
