const allowed=new Set(["correct","incorrect","ungraded","completed"]);
const byTime=(a,b)=>String(a.submitted_at).localeCompare(String(b.submitted_at));
export function learningRecords(bank,attempts,aliases={},bankType="practical"){
 const result=new Map(bank.map(q=>[q.id,{q,events:[],last:null,wrong:0,count:0}]));
 const corrected=new Set(attempts.filter(a=>a.bank===bankType).map(a=>a.metadata?.corrects_attempt_id).filter(Boolean));
 const seen=new Set(),byId=new Map(attempts.filter(a=>a.bank===bankType&&a.client_attempt_id).map(a=>[a.client_attempt_id,a]));
 function original(a){const visited=new Set();let e=a;while(e.metadata?.corrects_attempt_id&&!visited.has(e.client_attempt_id)){visited.add(e.client_attempt_id);const p=byId.get(e.metadata.corrects_attempt_id);if(!p||p.question_id!==a.question_id)break;e=p;}return e;}
 for(const a of [...attempts].sort(byTime)){
  const v=result.get(aliases[a.question_id]||a.question_id);
  if(a.bank!==bankType||!v||!allowed.has(a.result)||corrected.has(a.client_attempt_id)||(a.client_attempt_id&&seen.has(a.client_attempt_id)))continue;
  if(a.client_attempt_id)seen.add(a.client_attempt_id);
  const first=original(a),effective={...a,submitted_at:first.submitted_at,used_hint:first.used_hint,elapsed_seconds:first.elapsed_seconds,answer_text:first.answer_text,metadata:first.metadata};v.events.push(effective);v.count++;if(a.result==="incorrect")v.wrong++;
 }
 for(const v of result.values()){v.events.sort(byTime);v.last=v.events.at(-1)||null;}return [...result.values()];
}
export const stats=rows=>({total:rows.length,done:rows.filter(v=>v.last).length,c:rows.filter(v=>v.last?.result==="correct").length,w:rows.filter(v=>v.last?.result==="incorrect").length,p:rows.filter(v=>v.last?.result==="ungraded").length});
