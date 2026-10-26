// Pure daily engagement model. No identity or network access.
export const TODAY_TASKS = Object.freeze({
  "1": Object.freeze([
    {id:"practical", title:"정보처리 기출문제 2개 풀기", detail:"정답 여부와 관계없이 직접 제출한 문제를 집계합니다.", url:"practical.html", automatic:true},
    {id:"docs", title:"개발 공식문서 주제 1개 공부하기", detail:"오늘 배운 기술을 하나 골라 읽어 보세요.", url:"docs.html", automatic:false},
    {id:"project", title:"프로젝트 제작 단계 확인하기", detail:"기획·구현·테스트 중 현재 단계를 확인해 보세요.", url:"project-guide.html", automatic:false}
  ]),
  "2": Object.freeze([
    {id:"recruit", title:"추천 채용공고 1건 검토하기", detail:"직무·지원요건·마감일을 원문에서 확인하세요.", url:"recruit.html", automatic:false},
    {id:"interview", title:"기술면접 답변 1개 직접 연습하기", detail:"답을 읽기 전에 자신의 말로 설명해 보세요.", url:"interview.html", automatic:false},
    {id:"practical", title:"정보처리 기출문제 2개 풀기", detail:"정답 여부와 관계없이 직접 제출한 문제를 집계합니다.", url:"practical.html", automatic:true}
  ])
});
export const DAILY_STATE_KEY = "kbigdata:daily-plan:v1";
export const PRACTICAL_STATE_KEY = "kbigdata-practical-v1";
export const GRADE_STATE_KEY = "kbigdata:home-grade:v1";
const DAY_MS=86400000;
export function koreaDay(now=Date.now()){
  if(!Number.isFinite(now))return "";
  return new Date(now + 9*3600000).toISOString().slice(0,10);
}
export function freshDailyState(day=koreaDay()){
  return {date:day,byGrade:{"1":{},"2":{}}};
}
export function validDailyState(value,day=koreaDay()){
  if(!value || value.date!==day || !value.byGrade || typeof value.byGrade!=="object")return freshDailyState(day);
  const byGrade={"1":{},"2":{}};
  for(const grade of ["1","2"]){
    const stored=value.byGrade[grade];
    if(!stored || typeof stored!=="object" || Array.isArray(stored))continue;
    for(const task of TODAY_TASKS[grade]){
      if(!task.automatic && stored[task.id]===true)byGrade[grade][task.id]=true;
    }
  }
  return {date:day,byGrade};
}
export function completedPracticalCount(attempts,day=koreaDay()){
  if(!Array.isArray(attempts))return 0;
  const done=new Set();
  for(const item of attempts){
    if(!item || typeof item.questionId!=="string" || !item.questionId || !Number.isFinite(item.submittedAt))continue;
    if(item.viewedExplanation!==true || item.autoRevealed===true)continue;
    if(koreaDay(item.submittedAt)!==day)continue;
    done.add(item.questionId);
  }
  return done.size;
}
export function makeDailyPlan(grade,attempts,state,day=koreaDay()){
  const audience=grade==="2"?"2":"1";
  const safeState=validDailyState(state,day);
  const solved=completedPracticalCount(attempts,day);
  const tasks=TODAY_TASKS[audience].map(task=>{
    const count=task.automatic?Math.min(solved,2):Number(Boolean(safeState.byGrade[audience][task.id]));
    return {...task, done:task.automatic?count>=2:count===1, count, total:task.automatic?2:1};
  });
  const completed=tasks.filter(task=>task.done).length;
  return {grade:audience,day,tasks,completed,total:tasks.length,next:tasks.find(task=>!task.done)||tasks[0]};
}
