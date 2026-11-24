/* Resolve previous/next navigation from the current filtered queue first.
   For one-question links and the end of a partial bank queue, continue through
   the complete bank instead of silently returning to the list. */
export function adjacentWrittenQuestion(bank,queue,currentId,direction,allowBankFallback=true){
 if(direction!==1&&direction!==-1)return null;
 const queued=Array.isArray(queue)?queue:[];
 const index=queued.findIndex(q=>q?.id===currentId);
 const nearby=index>=0?queued[index+direction]:null;
 if(nearby)return {question:nearby,queue:queued,index:index+direction};
 if(!allowBankFallback||!Array.isArray(bank))return null;
 const fullIndex=bank.findIndex(q=>q?.id===currentId);
 if(fullIndex<0)return null;
 const candidate=bank[fullIndex+direction];
 return candidate?{question:candidate,queue:bank,index:fullIndex+direction}:null;
}
