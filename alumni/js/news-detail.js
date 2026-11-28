(function(){
  'use strict';
  const U=AlumniUI;
  function row(k,v){return v?`<dt>${U.esc(k)}</dt><dd>${U.esc(v)}</dd>`:''}
  function shareContent(n){
    const ob=n.news_type==='OBITUARY';
    const category=n.news_type_label||NewsUI.labels[n.news_type]||'기타';
    const author=[n.name,n.graduation_year?`${n.graduation_year}년 졸업`:''].filter(Boolean).join(' · ');
    const info=[author];
    if(n.event_date)info.push(`${ob?'발인·관련일':'관련 날짜'}: ${NewsUI.date(n.event_date)}`);
    if(n.location)info.push(`${ob?'빈소·장소':'장소'}: ${n.location}`);
    if(n.relationship)info.push(`관계: ${n.relationship}`);
    const body=String(n.content??'').replace(/\r\n?/g,'\n').trim().replace(/\n[ \t]*\n(?:[ \t]*\n)*/g,'\n\n');
    const sections=[`[동문소식 · ${category}]`,String(n.title??'').trim(),info.filter(Boolean).join('\n'),body];
    if(ob&&!body.includes('삼가 고인의 명복을 빕니다.'))sections.push('삼가 고인의 명복을 빕니다.');
    if(n.external_url)sections.push(`${ob?'부고 자세히 보기':'외부 안내'}\n${n.external_url}`);
    sections.push(`동문소식 자세히 보기\n${location.href}`);
    return sections.filter(Boolean).join('\n\n');
  }
  function bindShare(n){
    const text=shareContent(n),notice=U.qs('#news-share-status');
    U.qs('#news-copy').onclick=async()=>{try{await U.copyText(text);notice.textContent='게시글 내용과 링크를 복사했습니다.'}catch(e){notice.textContent=e.message}};
    U.qs('#news-share').onclick=async()=>{
      try{
        // Share one complete text payload so target apps cannot prepend the title or append the URL a second time.
        const data={text};
        if(navigator.share&&(!navigator.canShare||navigator.canShare(data))){
          await navigator.share(data);
          notice.textContent='공유할 앱을 선택해 주세요.';
        }else{
          await U.copyText(text);
          notice.textContent='공유 기능을 지원하지 않아 게시글 내용을 복사했습니다.';
        }
      }catch(e){if(e.name!=='AbortError')notice.textContent='공유하지 못했습니다. 내용 복사 버튼을 이용해 주세요.'}
    };
  }
  document.addEventListener('DOMContentLoaded',async()=>{
    const id=U.params().get('id'),st=U.qs('#news-detail-status'),root=U.qs('#news-detail');
    if(!id)return U.status(st,'잘못된 접근입니다.','error');
    try{
      const n=(await AlumniAPI.request('newsDetail',{params:{id}})).data,ob=n.news_type==='OBITUARY';
      root.className=`panel news-detail${ob?' news-detail--obituary':''}`;
      root.innerHTML=`<span class="news-card__type">${U.esc(n.news_type_label)}</span><h1>${U.esc(n.title)}</h1><p class="meta">${U.esc(n.name)} · ${U.esc(n.graduation_year)}년 졸업</p><dl class="news-detail__info">${row(ob?'발인·관련일':'관련 날짜',NewsUI.date(n.event_date))}${row(ob?'빈소·장소':'장소',n.location)}${row('관계',n.relationship)}${row('회사',n.company)}${row('직무',n.job_title)}${row('기관',n.organization)}${row('직책·보직',n.position_title)}${row('대학원',n.school_name)}${row('학위·과정',n.degree_or_program)}</dl><div class="news-detail__body">${U.esc(n.content)}</div>${ob?'<p><strong>삼가 고인의 명복을 빕니다.</strong></p>':''}<div class="actions">${n.external_url?`<a class="button button--secondary" href="${U.esc(n.external_url)}" target="_blank" rel="noopener noreferrer">${ob?'부고 자세히 보기':'외부 안내 페이지 보기'}</a>`:''}<a class="button" href="detail.html?id=${encodeURIComponent(n.alumni_id)}">선배 프로필 보기</a></div><section class="share-panel"><h2>동문소식 공유</h2><p>네이버 밴드 등 원하는 앱으로 공유하거나, 게시글 내용을 복사해 붙여넣을 수 있습니다.</p><div class="actions"><button id="news-share" type="button">공유하기</button><button id="news-copy" class="button--secondary" type="button">내용 복사</button></div><p id="news-share-status" class="hint" role="status" aria-live="polite"></p></section>`;
      root.hidden=false;st.hidden=true;bindShare(n);
    }catch(e){U.status(st,e.message,'error')}
  });
})();
