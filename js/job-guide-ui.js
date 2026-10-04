import {jobs,jobGroups,jobById,jobMetadata} from './jobs.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function initJobGuide(){
 const id=new URLSearchParams(location.search).get('id'),job=jobById(id),meta=jobMetadata(id);
 document.title=meta.title;
 const setMeta=(key,value)=>{let node=document.querySelector('meta['+(key.startsWith('og:')?'property':'name')+'="'+key+'"]');if(!node){node=document.createElement('meta');node.setAttribute(key.startsWith('og:')?'property':'name',key);document.head.append(node);}node.content=value;};
 setMeta('description',meta.description);setMeta('og:title',meta.title);setMeta('og:description',meta.description);setMeta('og:url',meta.canonical);setMeta('og:type','website');
 let canonical=document.querySelector('link[rel=canonical]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=meta.canonical;
 if(job){
  const caption=document.querySelector('.ux-at-glance h4:nth-of-type(2)');if(caption)caption.textContent='관련 자격증 · 선택 준비';
  const overview=document.querySelector('.ux-at-glance');if(overview){const note=document.createElement('p');note.className='hint';note.textContent='한 영역의 프로젝트로 기본 역량을 증명하고, 추가 기술은 지원 공고에 맞춰 선택하세요.';overview.append(note);}
  const structured=document.createElement('script');structured.type='application/ld+json';structured.textContent=JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:meta.title,description:meta.description,url:meta.canonical,inLanguage:'ko',about:{'@type':'Occupation',name:job.name,alternateName:job.english,description:job.overview}});document.head.append(structured);
 }else{
  const fit=document.createElement('details');fit.className='job-fit ux-disclosure';
  fit.innerHTML='<summary>나에게 맞는 직무 빠르게 찾기</summary><p class="hint">관심 있는 활동을 골라 직무와 준비 방법을 확인하세요.</p><div class="job-fit-grid">'+jobGroups.flatMap(group=>group.ids).map(id=>{const item=jobById(id);return '<a href="jobs.html?id='+esc(id)+'"><span>'+esc(item.suitability)+'</span><strong>'+esc(item.name)+' →</strong></a>';}).join('')+'</div>';
  document.querySelector('#list-controls').before(fit);
 }
 const top=document.createElement('a');top.className='job-back-top back-link';top.href='#content';top.textContent='위로 돌아가기 ↑';document.querySelector('.learning-content').append(top);
}
