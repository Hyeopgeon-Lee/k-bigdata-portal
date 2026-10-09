// Interview practice progress: explicit spoken practice is not inferred from opening an answer.
export const INTERVIEW_HISTORY_KEY = "__kBigDataInterviewV2";
export const INTERVIEW_MODES = ["HOME", "BROWSE", "PRACTICE_ONE", "PRACTICE_TEN", "COMPLETE"];

export function createInterviewSession(items, mode) {
  return {items:[...items],index:0,mode,opened:new Set(),glossaryOpened:new Set(),
    checked:new Set(),practiced:new Set()};
}

export function interviewSessionStats(session) {
  if (!session) return {total:0,checked:0,practiced:0,unchecked:[],unpracticed:[]};
  const items=session.items || [], ids=new Set(items.map(q=>q.id));
  const checked=[...session.checked].filter(id=>ids.has(id));
  const practiced=[...session.practiced].filter(id=>ids.has(id));
  return {
    total:items.length,checked:checked.length,practiced:practiced.length,
    unchecked:items.filter(q=>!session.checked.has(q.id)),
    unpracticed:items.filter(q=>!session.practiced.has(q.id))
  };
}

export function serializeInterviewState({mode,direct,session,filters,limit,lastRandom}) {
  return {
    version:2,mode,directId:direct?.id||null,
    filters:{category:filters.category,job:filters.job,difficulty:filters.difficulty,query:filters.query},
    limit,lastRandom,
    session:session?{
      ids:session.items.map(q=>q.id),index:session.index,mode:session.mode,
      opened:[...session.opened],glossaryOpened:[...session.glossaryOpened],
      checked:[...session.checked],practiced:[...session.practiced]
    }:null
  };
}

export function restoreInterviewState(snapshot, questions) {
  if (!snapshot||snapshot.version!==2||!INTERVIEW_MODES.includes(snapshot.mode)) return null;
  const lookup=new Map(questions.map(q=>[q.id,q]));
  const direct=snapshot.directId?lookup.get(snapshot.directId):null;
  if(snapshot.directId&&!direct)return null;
  let session=null;
  if(snapshot.session){
    const saved=snapshot.session, ids=saved.ids;
    if(!Array.isArray(ids)||ids.length<1||ids.length>150
       ||new Set(ids).size!==ids.length||!ids.every(id=>lookup.has(id))
       ||!Number.isInteger(saved.index)||saved.index<0||saved.index>ids.length)return null;
    session=createInterviewSession(ids.map(id=>lookup.get(id)),saved.mode==="ten"?"ten":"one");
    session.index=saved.index;
    const valid=new Set(ids);
    for(const field of ["opened","glossaryOpened","checked","practiced"]){
      if(!Array.isArray(saved[field]))return null;
      session[field]=new Set(saved[field].filter(id=>valid.has(id)));
    }
  }
  if(["PRACTICE_TEN","COMPLETE"].includes(snapshot.mode)&&!session)return null;
  if(snapshot.mode==="PRACTICE_ONE"&&!session&&!direct)return null;
  const supplied=snapshot.filters||{};
  const filters={
    category:typeof supplied.category==="string"?supplied.category:"전체",
    job:typeof supplied.job==="string"?supplied.job:"전체",
    difficulty:typeof supplied.difficulty==="string"?supplied.difficulty:"전체",
    query:typeof supplied.query==="string"?supplied.query:""
  };
  return {mode:snapshot.mode,direct:direct||null,session,filters,
    limit:Number.isInteger(snapshot.limit)&&snapshot.limit>=20&&snapshot.limit<=150?snapshot.limit:20,
    lastRandom:typeof snapshot.lastRandom==="string"?snapshot.lastRandom:null};
}
