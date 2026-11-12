// Deterministic parsers for official Q-Net API and K-DATA SQLD schedule.
// No guessed dates: unexpected HTML / JSON formats cause a deliberate failure.
const pad=n=>String(n).padStart(2,'0');
function isoDate(year,month,day){
 const y=Number(year),m=Number(month),d=Number(day);
 const dt=new Date(Date.UTC(y,m-1,d));
 if(y<2025||y>2100||m<1||m>12||d<1||d>31||
  dt.getUTCFullYear()!==y||dt.getUTCMonth()+1!==m||dt.getUTCDate()!==d)
  throw Error('INVALID_OFFICIAL_DATE');
 return y+'-'+pad(m)+'-'+pad(d);
}
function parseCompact(raw,year){
 if(raw===null||raw===undefined||!String(raw).trim())throw Error('MISSING_DATE');
 const s=String(raw).trim();
 if(/^\d{8}$/.test(s))return isoDate(s.slice(0,4),s.slice(4,6),s.slice(6,8));
 if(/^\d{4}-\d{2}-\d{2}$/.test(s))return isoDate(s.slice(0,4),s.slice(5,7),s.slice(8,10));
 const m=/^(\d{1,2})\.(\d{1,2})(?:\s*\([^)]+\))?$/.exec(s);
 if(m)return isoDate(year,m[1],m[2]);
 throw Error('UNRECOGNIZED_DATE_FORMAT');
}
function parseRange(raw,year){
 const s=String(raw||'').replace(/\s+/g,'').replace(/[‐–—∼〜]/g,'~').replace(/\([^)]+\)/g,'');
 const m=/^(\d{1,2})\.(\d{1,2})~(?:(\d{1,2})\.)?(\d{1,2})$/.exec(s);
 if(!m)throw Error('UNRECOGNIZED_REGISTRATION_RANGE');
 const start=isoDate(year,m[1],m[2]),end=isoDate(year,m[3]||m[1],m[4]);
 if(end<start||Date.parse(end)-Date.parse(start)>20*86400000)throw Error('INVALID_REGISTRATION_RANGE');
 return [start,end];
}
const entityDecode=s=>s.replace(/&nbsp;|&#160;/gi,' ')
 .replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
 .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
const strip=s=>entityDecode(s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()).trim();
function exam(code,year,round,kind,start,end,official_url){
 if(start>end)throw Error('INVALID_EVENT_RANGE');
 return {certificate_code:code,exam_year:year,exam_round:round,
  event_type:kind,start_date:start,end_date:end,official_url,published:true};
}
export function parseSqldHtml(html){
 if(typeof html!=='string'||html.length<500||html.length>1500000)throw Error('INVALID_OFFICIAL_HTML');
 // Verify that the year belongs to the actual official annual schedule table, not the footer.
 const yearText=/<caption[^>]*>\s*(20\d{2})년\s*국가공인\s*데이터\s*관련\s*자격증\s*시험\s*일정표/i.exec(html)||
                /<h4[^>]*>\s*(20\d{2})년도\s*일정\s*<\/h4>/i.exec(html);
 if(!yearText)throw Error('SQLD_ANNUAL_YEAR_NOT_FOUND');
 const year=Number(yearText[1]);
 if(year<2025||year>2100)throw Error('UNEXPECTED_SQLD_YEAR');
 const section=/<tbody\s+class=["'][^"']*\bsch\b[^"']*\btab3\b[^"']*["'][^>]*>([\s\S]*?)<\/tbody>/i.exec(html);
 if(!section)throw Error('SQLD_OFFICIAL_TABLE_MISSING');
 const rows=section[1].match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)||[];
 let inSqld=false;
 const result=[],rounds=new Set();
 for(const row of rows){
  const cells=[...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(x=>strip(x[1]));
  if(cells.some(s=>/^SQL\s*개발자$/.test(s))){inSqld=true;continue;}
  if(!inSqld)continue;
  const roundMatch=/^제\s*(\d{1,3})\s*회$/.exec(cells[0]||'');
  if(!roundMatch)throw Error('SQLD_OFFICIAL_ROW_CHANGED');
  const round=Number(roundMatch[1]);
  if(round<1||round>100||rounds.has(round)||cells.length<7)throw Error('SQLD_DUPLICATE_OR_INCOMPLETE_ROW');
  rounds.add(round);
  // Expected: round, stage, registration, ticket, exam, pre-score, final result, documents.
  const [start,end]=parseRange(cells[2],year);
  const day=parseCompact(cells[4],year),resultDay=parseCompact(cells[6],year);
  if(!(start<=end&&end<day&&day<resultDay))throw Error('SQLD_CHRONOLOGY_ERROR');
  const url='https://www.dataq.or.kr/www/accept/schedule.do';
  result.push(exam('sqld',year,round,'registration',start,end,url));
  result.push(exam('sqld',year,round,'exam',day,day,url));
  result.push(exam('sqld',year,round,'result',resultDay,resultDay,url));
 }
 if(rounds.size<1||rounds.size>7)throw Error('SQLD_NO_CONFIRMED_ROUNDS');
 return {year,rounds:rounds.size,events:result};
}
function readItems(json){
 const response=json?.response??json;
 const code=String(response?.header?.resultCode??'');
 if(code&&code!=='00'&&code!=='0')throw Error('QNET_API_RESULT_ERROR_'+code.slice(0,6));
 const body=response?.body??json?.body;
 if(!body)throw Error('QNET_BODY_MISSING');
 const items=body?.items?.item??body?.items??body?.item??[];
 if(Array.isArray(items))return items;
 if(items&&typeof items==='object')return [items];
 return [];
}
export function parseQnetJson(json,year,certificateCode){
 if(!['engineer','industrial'].includes(certificateCode))throw Error('QNET_UNKNOWN_CERTIFICATE');
 const expectedCode=certificateCode==='engineer'?'1320':'2290';
 const result=[],rounds=new Set();
 for(const row of readItems(json)){
  if(!row||typeof row!=='object')continue;
  if(row.qualgbCd&&row.qualgbCd!=='T')continue;
  if(row.jmCd&&String(row.jmCd)!==expectedCode)continue;
  if(String(row.implYy||year)!==String(year))continue;
  const round=Number(row.implSeq);
  if(!Number.isInteger(round)||round<1||round>10)continue;
  if(rounds.has(round))throw Error('QNET_DUPLICATED_ROUND');
  if(typeof row.description==='string'&&/(상시|기능사|기술사|전문자격)/.test(row.description))continue;
  const rFields=[
   ['written_registration','docRegStartDt','docRegEndDt'],
   ['written_exam','docExamStartDt','docExamEndDt'],
   ['written_result','docPassDt','docPassDt'],
   ['practical_registration','pracRegStartDt','pracRegEndDt'],
   ['practical_exam','pracExamStartDt','pracExamEndDt'],
   ['final_result','pracPassDt','pracPassDt']
  ];
  // Only publish complete six-stage schedules; missing dates could produce false reminders.
  let events=[];
  try{
   events=rFields.map(([kind,from,to])=>exam(certificateCode,year,round,kind,
     parseCompact(row[from],year),parseCompact(row[to],year),'https://www.q-net.or.kr/'));
  }catch(error){throw Error('QNET_ROUND_INCOMPLETE_'+round+'_'+String(error.message).slice(0,40));}
  const by=Object.fromEntries(events.map(e=>[e.event_type,e]));
  if(!(by.written_registration.end_date<by.written_exam.start_date &&
       by.written_exam.start_date<=by.written_result.start_date &&
       by.written_result.start_date<=by.practical_registration.start_date &&
       by.practical_registration.end_date<by.practical_exam.start_date &&
       by.practical_exam.start_date<=by.final_result.start_date))
    throw Error('QNET_CHRONOLOGY_ERROR_'+round);
  rounds.add(round);
  result.push(...events);
 }
 if(rounds.size>5)throw Error('QNET_UNEXPECTED_ROUND_COUNT');
 return {year,rounds:rounds.size,events:result};
}
