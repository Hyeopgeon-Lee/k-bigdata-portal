// Common, dependency-free HTML email system. Body/rows must be trusted, already-escaped fragments.
export const PORTAL_URL = 'https://portal.k-bigdata.kr';
const BRAND = '#17365d';
const THEMES = {
  news: { label: '동문소식', accent: '#245fa5', pale: '#edf4ff', line: '#cbdff5' },
  career: { label: '채용정보', accent: '#147455', pale: '#eaf7f0', line: '#cae7d6' },
  study: { label: '자율학습', accent: '#245fa5', pale: '#edf4ff', line: '#cbdff5' },
  report: { label: '학습 리포트', accent: '#245fa5', pale: '#edf4ff', line: '#cbdff5' },
  exam: { label: '자격증 안내', accent: '#9a5410', pale: '#fff3df', line: '#f1d7a9' },
  approval: { label: '가입 승인', accent: '#147455', pale: '#eaf7f0', line: '#cae7d6' },
  help: { label: '요청·문의', accent: '#475569', pale: '#f2f5f8', line: '#dbe3ec' },
  contact: { label: '동문 연락 요청', accent: '#245fa5', pale: '#edf4ff', line: '#cbdff5' },
  obituary: { label: '부고', accent: '#475569', pale: '#f2f4f7', line: '#dbe2e9' }
};
const theme = kind => THEMES[kind] || THEMES.news;
const plain = v => String(v ?? '').trim();
export const mailEscape = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const safeUrl = value => {
  try { const url = new URL(String(value)); return ['https:','http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
};
const row = (content, css='') => '<tr><td style="'+css+'">'+content+'</td></tr>';
const table = (content, css='') => '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;'+css+'">'+content+'</table>';
export function mailParagraph(value, css='') {
  return '<p style="margin:0 0 14px;color:#334155;font-size:16px;line-height:1.75;overflow-wrap:anywhere;word-break:break-word;'+css+'">'+mailEscape(value).replace(/\r\n|\r|\n/g,'<br>')+'</p>';
}
export const mailParagraphs = value => plain(value).split(/\r?\n\s*\r?\n/).map(v=>mailParagraph(v)).join('');
export const mailSectionTitle = value => '<h2 style="margin:24px 0 10px;color:'+BRAND+';font-size:18px;line-height:1.45;">'+mailEscape(value)+'</h2>';
export function mailCallout(value, kind='news', label='') {
  const t=theme(kind);
  return table(row((label?'<p style="font-size:13px;font-weight:bold;color:'+t.accent+';margin:0 0 7px;">'+mailEscape(label)+'</p>':'')+
    '<div style="color:#334155;font-size:16px;line-height:1.75;overflow-wrap:anywhere;word-break:break-word;">'+mailEscape(value).replace(/\r\n|\r|\n/g,'<br>')+'</div>','padding:16px;background:'+t.pale+';border:1px solid '+t.line+';border-radius:10px;'),'margin:0 0 16px;');
}
export function mailDetails(pairs, kind='news') {
  const t=theme(kind), fields=pairs.filter(([,v])=>plain(v));
  if(!fields.length)return '';
  return table(fields.map(([k,v],i)=>'<tr><td width="33%" valign="top" style="padding:12px 4px 12px 14px;font-size:13px;color:#64748b;line-height:1.5;'+(i?'border-top:1px solid '+t.line+';':'')+'">'+mailEscape(k)+'</td><td valign="top" style="padding:12px 14px 12px 4px;font-size:15px;color:'+BRAND+';font-weight:bold;line-height:1.65;overflow-wrap:anywhere;word-break:break-word;'+(i?'border-top:1px solid '+t.line+';':'')+'">'+mailEscape(v)+'</td></tr>').join(''),
    'background:'+t.pale+';border:1px solid '+t.line+';border-radius:10px;margin:0 0 18px;');
}
export function mailHero({label='',title='',subtitle='',note=''},kind='news'){
  if(!plain(title))return '';
  const t=theme(kind);
  return table(row((label?'<p style="margin:0 0 7px;color:'+t.accent+';font-size:13px;font-weight:bold;">'+mailEscape(label)+'</p>':'')+
    '<div style="margin:0;color:'+BRAND+';font-size:22px;line-height:1.4;font-weight:bold;overflow-wrap:anywhere;word-break:break-word;">'+mailEscape(title)+'</div>'+
    (subtitle?'<p style="margin:7px 0 0;color:'+t.accent+';font-size:17px;font-weight:bold;line-height:1.55;">'+mailEscape(subtitle)+'</p>':'')+
    (note?'<p style="margin:9px 0 0;color:#52667f;font-size:13px;line-height:1.6;">'+mailEscape(note)+'</p>':''),'padding:18px;background:'+t.pale+';border:1px solid '+t.line+';border-radius:12px;'),'margin:0 0 20px;');
}
export function mailButton(href,label,kind='news',secondary=false){
  const url=safeUrl(href);if(!url)return '';
  const t=theme(kind),bg=secondary?t.pale:t.accent,fg=secondary?t.accent:'#ffffff';
  return table('<tr><td bgcolor="'+bg+'" align="center" style="border:1px solid '+(secondary?t.line:t.accent)+';border-radius:9px;"><a href="'+mailEscape(url)+'" style="display:block;padding:14px 12px;color:'+fg+';text-decoration:none;font-size:16px;font-weight:bold;line-height:22px;text-align:center;">'+mailEscape(label)+' &rarr;</a></td></tr>','margin:10px 0 0;');
}
export function portalMailHeader(kind='news',label=''){
  const t=theme(kind);
  return row('<p style="margin:0 0 5px;font-size:12px;line-height:1.5;color:#c7d9f1;">한국폴리텍대학 서울강서캠퍼스</p><p style="margin:0 0 7px;font-size:20px;line-height:1.4;color:#ffffff;font-weight:bold;">빅데이터소프트웨어공학과</p><p style="margin:0;font-size:13px;color:#dce8f8;line-height:1.5;">학과 통합 포털 · '+mailEscape(label||t.label)+'</p>',
    'padding:20px 20px 18px;background:'+(kind==='obituary'?'#334155':BRAND)+';border-radius:12px 12px 0 0;');
}
export function portalMailFooter(note='', links=[]){
  const anchors=[{href:PORTAL_URL+'/',label:'학과 포털'},...links].filter(x=>safeUrl(x.href)).map(x=>'<a href="'+mailEscape(safeUrl(x.href))+'" style="color:#245fa5;text-decoration:underline;font-size:13px;">'+mailEscape(x.label)+'</a>').join(' &nbsp;·&nbsp; ');
  return row('<p style="margin:0 0 6px;font-size:13px;color:#52667f;font-weight:bold;">한국폴리텍대학 서울강서캠퍼스<br>빅데이터소프트웨어공학과</p>'+(note?'<p style="margin:0 0 9px;font-size:12px;color:#64748b;line-height:1.65;">'+mailEscape(note)+'</p>':'')+'<p style="margin:0;color:#64748b;line-height:1.8;">'+anchors+'</p>',
    'padding:18px 16px;text-align:center;background:#f4f7fb;border-top:1px solid #dce5f0;border-radius:0 0 12px 12px;');
}
export function portalMailDocument(rows,title='',preheader=''){
  // All core styles are inline. No remote fonts, images, scripts or responsive CSS required.
  return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+mailEscape(title)+'</title></head><body style="margin:0;padding:0;background:#eef3f9;color:#25374f;font-family:Arial,Apple SD Gothic Neo,Malgun Gothic,sans-serif;line-height:1.65;">'+
    (preheader?'<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#eef3f9;font-size:1px;line-height:1px;mso-hide:all;">'+mailEscape(preheader)+'</div>':'')+
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eef3f9"><tr><td align="center" style="padding:12px 8px;"><!--[if mso]><table role="presentation" width="620" cellspacing="0" cellpadding="0"><tr><td><![endif]--><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="max-width:620px;background:#ffffff;border:1px solid #dbe5f0;border-radius:12px;table-layout:fixed;">'+rows+'</table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>';
}
export function renderPortalMail({kind='news',title,category='',date='',preheader='',bodyHtml='',actions=[],footerNote='',footerLinks=[]}){
  const t=theme(kind);
  const heading='<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td valign="top"><span style="display:inline-block;background:'+t.pale+';color:'+t.accent+';font-size:13px;font-weight:bold;padding:5px 9px;border-radius:6px;">'+mailEscape(category||t.label)+'</span></td>'+(date?'<td align="right" valign="middle" style="color:#64748b;font-size:12px;">'+mailEscape(date)+'</td>':'')+'</tr></table><h1 style="color:'+BRAND+';font-size:24px;line-height:1.4;margin:15px 0 20px;overflow-wrap:anywhere;word-break:break-word;">'+mailEscape(title)+'</h1>';
  return portalMailDocument(portalMailHeader(kind)+row(heading+bodyHtml+actions.map((a,i)=>mailButton(a.href,a.label,kind,i>0)).join(''),'padding:20px 17px 24px;')+portalMailFooter(footerNote,footerLinks),title,preheader||title);
}
const truthy=v=>['true','1','yes','on'].includes(plain(v).toLowerCase());
const newsLabels={EMPLOYMENT:'취업',JOB_CHANGE:'이직',PROMOTION:'승진·보직',STARTUP:'창업',GRADUATE_SCHOOL:'대학원·학위',ACHIEVEMENT:'수상·성과',MARRIAGE:'결혼',BIRTH_SON:'득남',BIRTH_DAUGHTER:'득녀',OBITUARY:'부고',OTHER:'동문소식'};
const dateLabel=v=>{
  const s=plain(v);if(!s)return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s.replaceAll('-','.');
  const date=new Date(s);return Number.isFinite(+date)?new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date).replaceAll('-','.'): '';
};
const mailSettings=[{href:PORTAL_URL+'/mypage.html',label:'재학생 수신 설정'},{href:PORTAL_URL+'/alumni/alumni.html',label:'졸업생 수신 설정'}];
export function renderAlumniAnnouncement(kind,recordId,item){
  const job=kind==='jobs', id=encodeURIComponent(String(recordId ?? ''));
  const href=PORTAL_URL+'/alumni/'+(job?'job':'news')+'-detail.html?id='+id;
  if(job){
    const company=plain(item.company), title=plain(item.job_title), deadline=truthy(item.always_open)?'상시채용':dateLabel(item.deadline);
    const subject='[동문 채용정보] '+(company+' · '+title).slice(0,150);
    const body=mailHero({label:'채용기업',title:company,subtitle:title},'career')+
      mailDetails([['고용 형태',item.employment_type],['채용 구분',item.recruit_type],['근무 지역',item.location],['접수 마감',deadline]],'career')+
      (plain(item.skills)?mailCallout(plain(item.skills).replaceAll('|',' · '),'career','요구 기술'):'')+
      (plain(item.alumni_comment)?mailSectionTitle('채용 안내')+mailParagraphs(item.alumni_comment):mailParagraph('학과 졸업생 네트워크를 통해 공유된 채용정보입니다. 상세 모집 내용을 확인해 주세요.'));
    return {subject,html:renderPortalMail({kind:'career',title:'채용정보 안내',category:truthy(item.always_open)?'상시채용':'채용정보',preheader:company+' '+title,bodyHtml:body,actions:[{href,label:'채용정보 자세히 보기'}],footerNote:'수신 설정은 아래 링크에서 언제든 변경할 수 있습니다.',footerLinks:mailSettings})};
  }
  const title=plain(item.title),type=plain(item.news_type),tone=type==='OBITUARY'?'obituary':'news';
  const subject='[동문소식] '+title.slice(0,120);
  const fields=type==='GRADUATE_SCHOOL'?[['대학원',item.school_name],['학위·과정',item.degree_or_program]]:type==='OBITUARY'?[['고인과의 관계',item.relationship],['장소·빈소',item.location]]:[['회사·서비스명',item.company],['직무',item.job_title],['기관',item.organization],['직책·성과명',item.position_title],['장소',item.location]];
  const hero=type==='GRADUATE_SCHOOL'&&plain(item.school_name)?mailHero({label:'대학원·학위',title:item.school_name,subtitle:plain(item.degree_or_program)},tone):mailDetails(fields,tone);
  const admitted=type==='GRADUATE_SCHOOL'&&title.includes('합격')&&title.match(/^(.{1,40}?)\s+졸업생[,，]?/);
  const heading=admitted?admitted[1]+' 졸업생의 대학원 합격을 축하합니다!':title;
  return {subject,html:renderPortalMail({kind:tone,title:heading,category:newsLabels[type]||'동문소식',date:dateLabel(item.event_date||item.approved_at||item.created_at),bodyHtml:hero+mailParagraphs(item.content),actions:[{href,label:'동문소식 자세히 보기'}],footerNote:'수신 설정은 아래 링크에서 언제든 변경할 수 있습니다.',footerLinks:mailSettings})};
}
