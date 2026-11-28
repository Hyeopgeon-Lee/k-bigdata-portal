import {analyzeReadme} from './rules.mjs';
import {checkNotion} from './notion.mjs';
const stamp=()=>new Date().toISOString(), daysAgo=n=>new Date(Date.now()-n*86400000).toISOString(), day=d=>new Date(d).toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'}), lapse=d=>d?Math.max(0,Math.floor((Date.now()-Date.parse(d))/86400000)):'', recent=n=>new Set(Array.from({length:n},(_,i)=>day(daysAgo(i)))), err=e=>String(e.message||e).slice(0,150);
const safeHosts=['github.io','github.com','notion.so','notion.site','tistory.com','velog.io','blog.naver.com','medium.com','netlify.app','vercel.app','pages.dev'];
export function publicURL(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||!safeHosts.some(h=>u.hostname===h||u.hostname.endsWith('.'+h)))throw Error('자동점검 지원 공개 호스트가 아닙니다.');return u;}
export function repoParts(value,requireRepo=false){const u=new URL(value);if(!['http:','https:'].includes(u.protocol)||u.hostname!=='github.com'||u.port||u.username||u.password||u.search||u.hash)throw Error('GitHub URL을 확인하세요.');const p=u.pathname.replace(/\/$/,'').split('/').slice(1);if(!/^[a-zA-Z0-9-]{1,39}$/.test(p[0]||'')||p.length!==(requireRepo?2:1)||requireRepo&&!/^[a-zA-Z0-9_.-]{1,100}$/.test(p[1]||''))throw Error('GitHub URL을 확인하세요.');return {owner:p[0],repo:p[1]?.replace(/\.git$/,'')};}
async function probe(value){try{let u=publicURL(value);for(let i=0;i<4;i++){let r=await fetch(u,{method:'HEAD',redirect:'manual',signal:AbortSignal.timeout(5000)});if([405,501].includes(r.status)){r=await fetch(u,{method:'GET',headers:{Range:'bytes=0-0'},redirect:'manual',signal:AbortSignal.timeout(5000)});if(r.body)await r.body.cancel().catch(()=>{})}if(r.status>=300&&r.status<400&&r.headers.get('location')){u=publicURL(new URL(r.headers.get('location'),u).href);continue;}return {available:r.ok,http_status:r.status,error:r.ok?'':'HTTP '+r.status};}throw Error('리디렉션 제한');}catch(e){return {available:false,http_status:'',error:err(e)}}}
export function preserveSuccessfulCheck(current,previous,at=stamp()){
 const old=previous?.data||previous||{},oldTime=previous?.checked_at||old.checked_at;
 const {last_success,...oldResult}=old;
 const snapshot=old.check_status==='SUCCESS'?{...oldResult,checked_at:oldTime}:last_success;
 return {...current,checked_at:at,...(current.check_status!=='SUCCESS'&&snapshot?{last_success:snapshot}:{})};
}
export async function checkStudent(db,id,token=''){
 const one=async(t,q)=>{const {data,error}=await q(db.from(t));if(error)throw error;return data};
 const profile=await one('ready_profiles',q=>q.select('data').eq('user_id',id).single()),s=profile.data;
 const repos=await one('ready_repositories',q=>q.select('*').eq('user_id',id).eq('active',true));
 const [prior,priorStudent]=await Promise.all([one('ready_repository_checks',q=>q.select('*').eq('user_id',id)),one('ready_student_checks',q=>q.select('kind,checked_at,data').eq('user_id',id))]);
 const started=stamp(),results=[],fails=[];
 const put=async(t,record)=>{const {error}=await db.from(t).upsert(record);if(error)throw Error('CHECK_SAVE_FAILED')};
 const sc=(kind,data)=>{const checked_at=stamp();return put('ready_student_checks',{user_id:id,kind,checked_at,data:preserveSuccessfulCheck(data,priorStudent.find(x=>x.kind===kind),checked_at)})};
 const rc=(repo,kind,data)=>{const checked_at=stamp();return put('ready_repository_checks',{repo_id:repo.repo_id,user_id:id,kind,checked_at,data:preserveSuccessfulCheck(data,prior.find(x=>x.repo_id===repo.repo_id&&x.kind===kind),checked_at)})};
 const gh=async(path,optional=false)=>{const r=await fetch('https://api.github.com'+path,{headers:{Accept:'application/vnd.github+json','User-Agent':'KBigData-Portal-READY',...(token?{Authorization:'Bearer '+token}:{})},redirect:'error',signal:AbortSignal.timeout(8000)});if(optional&&[404,409].includes(r.status))return null;if(!r.ok)throw Error('GitHub HTTP '+r.status);return r.json()};
 for(const repo of repos){try{
  const {owner,repo:name}=repoParts(repo.repo_url,true),base='/repos/'+encodeURIComponent(owner)+'/'+encodeURIComponent(name),meta=await gh(base);
  if(meta.private)throw Error('비공개 저장소는 점검할 수 없습니다.');
  if(!s.github_username)throw Error('GitHub 사용자명 미등록');
  const commits=[];for(let page=1;page<=3;page++){const rows=await gh(base+'/commits?since='+encodeURIComponent(daysAgo(30))+'&author='+encodeURIComponent(s.github_username)+'&per_page=100&page='+page,true)||[];commits.push(...rows);if(rows.length<100)break;}
  const dates=commits.map(c=>c.commit?.author?.date).filter(Boolean).sort().reverse(),last=dates[0]||(await gh(base+'/commits?author='+encodeURIComponent(s.github_username)+'&per_page=1',true))?.[0]?.commit?.author?.date||'';
  const seven=recent(7),fourteen=recent(14),d14=[...new Set(dates.map(day).filter(d=>fourteen.has(d)))],c7=dates.filter(d=>seven.has(day(d))).length;
  const prev=prior.find(r=>r.repo_id===repo.repo_id&&r.kind==='repository')?.data,prevReadme=prior.find(r=>r.repo_id===repo.repo_id&&r.kind==='readme')?.data;
  let details={},readme;
  if(prev?.check_status==='SUCCESS'&&prevReadme?.check_status==='SUCCESS'&&Number(prevReadme.rule_version)===2&&prev.last_push_at===meta.pushed_at){
   for(const k of ['readme_exists','gitignore_exists','license_exists','description_exists','topics_count','topics','branch_count','source_exists'])details[k]=prev[k];
   readme=prevReadme;
  }else{
   const [r,tree,branches]=await Promise.all([gh(base+'/readme',true),gh(base+'/git/trees/'+encodeURIComponent(meta.default_branch||'HEAD')+'?recursive=1',true),gh(base+'/branches?per_page=100',true)]);
   const paths=tree&&!tree.truncated?tree.tree.filter(x=>x.type==='blob').map(x=>x.path):null;
   const markdown=r?.content?new TextDecoder().decode(Uint8Array.from(atob(r.content.replace(/\s/g,'')),c=>c.charCodeAt(0))):'';
   details={readme_exists:!!r,gitignore_exists:paths?paths.includes('.gitignore'):!!await gh(base+'/contents/.gitignore',true),license_exists:!!meta.license,description_exists:!!meta.description,topics_count:meta.topics?.length||0,topics:JSON.stringify(meta.topics||[]),branch_count:branches?.length||0,source_exists:paths?paths.some(p=>/\.(java|kt|py|js|mjs|ts|jsx|tsx|vue|go|dart|sql|r|ipynb|c|cpp|cs|swift|php|rb|rs|html|css)$/i.test(p)&&!/(^|\/)(vendor|node_modules|dist|build|target|\.next|coverage|generated)(\/|$)/i.test(p)):''};
   readme={...analyzeReadme(markdown,paths,r?.path||'README.md'),readme_exists:!!r};
  }
  const age=lapse(meta.pushed_at),data={...details,last_commit_at:last,last_push_at:meta.pushed_at,commits_7d:c7,commits_30d:commits.length,student_commits_7d:c7,student_commits_30d:commits.length,active_days_7d:d14.filter(d=>seven.has(d)).length,active_days_14d:d14.length,activity_dates_14d:JSON.stringify(d14),primary_language:meta.language||'',github_updated_at:meta.updated_at,visibility:'Public',push_status:age===''?'미점검':age<=7?'정상':age<=14?'관심':age<=29?'업데이트 필요':'장기 미업데이트',check_status:'SUCCESS',error_message:''};
  await rc(repo,'repository',data);await rc(repo,'readme',{...readme,check_status:'SUCCESS',error_message:''});results.push(data);
 }catch(e){fails.push(err(e));await rc(repo,'repository',{check_status:'FAILED',error_message:err(e)});await rc(repo,'readme',{check_status:'FAILED',error_message:err(e)});}}
 const dates=[...new Set(results.flatMap(r=>JSON.parse(r.activity_dates_14d)))],d7=dates.filter(d=>recent(7).has(d)).length,last=results.map(r=>r.last_commit_at).filter(Boolean).sort().reverse()[0]||'',inactive=lapse(last);
 const g={last_activity_at:last,commits_7d:results.reduce((n,r)=>n+r.commits_7d,0),commits_30d:results.reduce((n,r)=>n+r.commits_30d,0),active_days_7d:d7,active_days_14d:dates.length,active_repository_count:repos.length,readme_count:results.filter(r=>r.readme_exists).length,inactive_days:inactive,activity_status:!repos.length?'미등록':d7>=3?'정상':d7===2?'보완 필요':d7===1?'활동 부족':inactive!==''&&inactive>=14?'장기 미활동':'미활동',recency_status:inactive===''?'미점검':inactive<=3?'정상':inactive<=6?'활동 필요':inactive<=13?'활동 부족':'장기 미활동',check_status:fails.length?(results.length?'PARTIAL':'FAILED'):'SUCCESS',error_message:fails.join(' | ')};
 await sc('github',g);
 const urls=[['개인 포트폴리오',s.portfolio_url],['기술블로그',s.blog_url],['GitHub Pages',s.github_pages_url]].filter(x=>x[1]);
 const probes=new Map();
 const checks=await Promise.all(urls.map(async([type,url])=>{if(!probes.has(url))probes.set(url,probe(url));return {type,url,...await probes.get(url)}})),available=checks.some(x=>x.available);
 await sc('portfolio',{url:urls[0]?.[1]||'',site_available:available,check_status:urls.length&&!available?'FAILED':'SUCCESS',error_message:checks.filter(x=>!x.available).map(x=>x.type+': '+x.error).join(' | '),url_results:JSON.stringify(checks)});
 let blog={site_available:checks.find(x=>x.type==='GitHub Pages')?.available||false,platform_type:s.github_pages_url?'URL':'미등록',last_repo_commit_at:'',check_status:'SUCCESS'};
 try{if(s.github_pages_repo){const {owner,repo}=repoParts(s.github_pages_repo,true),base='/repos/'+encodeURIComponent(owner)+'/'+encodeURIComponent(repo),meta=await gh(base);blog.last_repo_commit_at=meta.pushed_at;for(const [path,type] of [['_posts','Jekyll'],['content','Hugo'],['posts','Posts'],['blog','Blog']]){if(await gh(base+'/contents/'+path,true)){blog.platform_type=type;break}}}}catch(e){blog={...blog,check_status:'FAILED',error_message:err(e)}}await sc('blog',blog);
 const notion=await checkNotion(db,id,s.notion_url||'');
 const service_status={github:g.check_status,portfolio:urls.length&&!available?'FAILED':checks.some(x=>!x.available)?'PARTIAL':'SUCCESS',blog:blog.check_status,notion:notion.check_status};
 const partial=Object.values(service_status).some(x=>x!=='SUCCESS'),overall=partial?(Object.values(service_status).every(x=>x!=='SUCCESS')?'FAILED':'PARTIAL'):'SUCCESS';
 await put('ready_check_runs',{log_id:crypto.randomUUID(),started_at:started,finished_at:stamp(),data:{target_count:1,success_count:overall==='SUCCESS'?1:0,failed_count:overall==='SUCCESS'?0:1,status:overall,error_message:[...fails,...checks.filter(x=>!x.available).map(x=>x.type+': '+x.error),blog.error_message,notion.error_message].filter(Boolean).join(' | '),notion_status:notion.check_status,service_status}});
 return {...g,overall_check_status:overall,service_status};
}
