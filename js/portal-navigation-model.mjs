import {categories, services, portalNavLinks} from './services.js?v=20261026-portal-launcher-1';

export const shellVersion = '20261026-portal-launcher-1';
export const portalPages = {
  index: {title:'통합 포털', group:null},
  services: {title:'전체 서비스', group:null, directory:true},
  coding: {title:'기초학습', group:'learning'},
  practical: {title:'정보처리 자격증 기출문제', group:'learning'},
  interview: {title:'기술면접', group:'learning'},
  certifications: {title:'자격증', group:'learning'},
  ncp: {title:'NCP 기출문제', group:'learning'},
  docs: {title:'공식문서', group:'learning'},
  jobs: {title:'IT 직무', group:'career'},
  resume: {title:'자기소개서', group:'career'},
  recruit: {title:'채용공고', group:'career'},
  'project-guide': {title:'프로젝트 가이드', group:'project'},
  schedule: {title:'학과 주요 일정', group:'campus'}
};
export const groups = Object.values(categories);
export const navigationItems = portalNavLinks.map(item=>{
  const service=services.find(service=>service.id===item.id);
  if(!service)throw new Error('Unknown navigation service: '+item.id);
  return {...item,url:service.url};
});
export const officialWebsite = 'https://www.kopo.ac.kr/kangseo/content.do?menu=1547';
