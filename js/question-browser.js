/* Shared entry screen for all three question banks. */
export function createQuestionBrowser({title, questions, category, categoryLabel, describe, searchText, openQuestion, scope, initialCategory="", preferInitialCategory=false, onCategoryChange=null, secondaryFilter=null, additionalFilter=null, metaText=null,progressFor=null}) {
  const main=document.querySelector("main");
  const section=document.createElement("section");
  section.className="question-browser";
  section.hidden=true;
  section.innerHTML=`
    <h2 class="qb-heading"></h2>
    <div class="qb-controls">
      <div class="qb-secondary-filter" hidden><span class="qb-filter-caption"></span><div class="qb-secondary-chips" role="group"></div></div>
      <span class="qb-primary-caption" hidden></span><div class="qb-categories" role="group" aria-label="문제 분류"></div>
      <div class="qb-search"><input aria-label="문제 검색" type="search" placeholder="문제 번호·제목·키워드 검색"><button type="button" aria-label="검색어 지우기" hidden>×</button></div>
      <div class="qb-additional-filter" hidden><label for="qb-additional-select">과목 선택</label><select id="qb-additional-select"></select></div>
      <div class="qb-progress-filter" role="group" aria-label="풀이 상태 필터">
        <button type="button" data-progress="all" aria-pressed="true">전체</button>
        <button type="button" data-progress="unseen" aria-pressed="false">미풀이</button>
        <button type="button" data-progress="done" aria-pressed="false">풀이 완료</button>
      </div>
      <p class="qb-progress-hint">풀이 횟수와 최근 날짜는 로그인한 계정의 서버 기록 기준입니다. 기기 기록은 별도로 표시합니다.</p>
    </div>
    <div class="qb-list"><header><h2>문제 목록 <span role="status"></span></h2><button type="button" class="qb-random"></button></header>
      <ol></ol><nav aria-label="문제 목록 페이지"><button type="button">이전</button><span></span><button type="button">다음</button></nav>
    </div>`;
  (main.querySelector(".portal-page-intro")||main.querySelector(".portal-service-nav")).after(section);
  section.querySelector(".qb-heading").textContent=title;
  const search=section.querySelector("input"), chips=section.querySelector(".qb-categories");
  const secondary=section.querySelector(".qb-secondary-filter"),secondaryChips=section.querySelector(".qb-secondary-chips");
  const random=section.querySelector(".qb-random"),clear=section.querySelector(".qb-search button");
  const progressControls=section.querySelector(".qb-progress-filter");
  if(!progressFor){progressControls.hidden=true;section.querySelector(".qb-progress-hint").hidden=true;}
  const list=section.querySelector("ol"),status=section.querySelector("[role=status]");
  const nav=section.querySelector("nav"),[prev,next]=nav.querySelectorAll("button");
  const saved=history.state?.questionBrowser||{};
  let selected=preferInitialCategory?initialCategory:(saved.selected??initialCategory), page=saved.page||0, activeId=saved.activeId||"", scroll=saved.scroll||0;
  let selectedSecondary=secondaryFilter?(secondaryFilter.initialValue??saved.secondary??""):"";
  let progressFilter=["all","unseen","done"].includes(saved.progressFilter)?saved.progressFilter:"all";
  let selectedAdditional=additionalFilter?(saved.additional||""):"";
  let items=[], scopeEnabled=Boolean(scope), ids=saved.ids||[];
  search.value=saved.query||"";
  const categories=[...new Set(questions.map(category))];
  const order=["C","c","Java","java","Python","python","SQL","linux"];
  const rank=key=>order.includes(key)?order.indexOf(key):order.length;
  categories.sort((a,b)=>rank(a)-rank(b)||a.localeCompare(b));
  for(const key of ["",...categories]){
    const chip=document.createElement("button");chip.type="button";chip.dataset.category=key;
    chip.textContent=key?categoryLabel(key):"전체";chips.append(chip);
    chip.onclick=()=>selectCategory(key);
  }
  if(secondaryFilter){
    const caption=section.querySelector(".qb-secondary-filter .qb-filter-caption");
    caption.textContent=secondaryFilter.label||"시험 구분";
    secondary.hidden=false;
    secondaryChips.setAttribute("aria-label",secondaryFilter.label||"시험 구분");
    const primaryCaption=section.querySelector(".qb-primary-caption");
    primaryCaption.textContent=secondaryFilter.categoryLabel||"언어";
    primaryCaption.hidden=false;
    chips.setAttribute("aria-label",secondaryFilter.categoryLabel||"언어");
    for(const option of [{value:"",label:"전체"},...(secondaryFilter.options||[])]){
      const chip=document.createElement("button");
      chip.type="button";chip.dataset.secondary=option.value;chip.textContent=option.label;
      secondaryChips.append(chip);
      chip.onclick=()=>{
        selectedSecondary=option.value;page=0;
        secondaryFilter.onChange?.(selectedSecondary);
        render();
      };
    }
  }
  if(additionalFilter){
    const control=section.querySelector(".qb-additional-filter");
    const dropdown=control.querySelector("select");
    control.hidden=false;
    control.querySelector("label").textContent=additionalFilter.label||"과목 선택";
    for(const option of [{value:"",label:"전체 과목"},...(additionalFilter.options||[])]){
      const node=document.createElement("option");node.value=option.value;node.textContent=option.label;dropdown.append(node);
    }
    if(![...dropdown.options].some(o=>o.value===selectedAdditional))selectedAdditional="";
    dropdown.value=selectedAdditional;
    dropdown.onchange=()=>{selectedAdditional=dropdown.value;page=0;render();remember();};
  }
  if(scope){
    const chip=document.createElement("button");chip.type="button";chip.textContent=scope.label+" ×";
    chip.onclick=()=>{scopeEnabled=false;page=0;chip.remove();const url=new URL(location.href);url.searchParams.delete("exam");history.replaceState(history.state,"",url);render();};
    chips.before(chip);
  }
  for(const button of progressControls.querySelectorAll("button")){
    button.onclick=()=>{progressFilter=button.dataset.progress;page=0;render();remember();};
  }
  function remember(){
    history.replaceState({...history.state,questionBrowser:{selected,secondary:selectedSecondary,additional:selectedAdditional,progressFilter,query:search.value,page,activeId,scroll,ids}},"");
  }
  function selectCategory(key){
    if(key!==""&&!categories.includes(key))return;
    selected=key;page=0;render();remember();onCategoryChange?.(key);
  }
  function begin(q,set){
    activeId=q.id;scroll=window.scrollY;ids=set.map(item=>item.id);remember();hide();openQuestion(q,set);
  }
  function render(){
    const terms=search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    items=questions.filter(q=>{
      if(scopeEnabled&&!scope.matches(q)||selected&&category(q)!==selected||selectedSecondary&&secondaryFilter&&!secondaryFilter.matches(q,selectedSecondary)||selectedAdditional&&additionalFilter&&!additionalFilter.matches(q,selectedAdditional))return false;
      const text=searchText(q).toLocaleLowerCase();
      if(progressFor&&progressFilter!=="all"){
        const kind=progressFor(q)?.kind;
        if(progressFilter==="done"&&kind!=="done"&&kind!=="local")return false;
        if(progressFilter==="unseen"&&kind!=="unseen")return false;
      }
      return terms.every(term=>text.includes(term));
    });
    for(const chip of chips.children)chip.setAttribute("aria-pressed",String(chip.dataset.category===selected));
    for(const chip of secondaryChips.children)chip.setAttribute("aria-pressed",String(chip.dataset.secondary===selectedSecondary));
    for(const button of progressControls.querySelectorAll("button"))
      button.setAttribute("aria-pressed",String(button.dataset.progress===progressFilter));
    clear.hidden=!search.value;
    random.disabled=!items.length;random.textContent="랜덤 "+Math.min(10,items.length)+"문제 풀기";
    if(!items.length)random.textContent="랜덤 문제 풀기";
    const pages=Math.ceil(items.length/10);
    page=Math.min(page,Math.max(0,pages-1));
    status.textContent=items.length+"문제";
    list.replaceChildren();
    for(const q of items.slice(page*10,page*10+10)){
      const li=document.createElement("li"),button=document.createElement("button");
      const meta=document.createElement("small"),name=document.createElement("strong"),arrow=document.createElement("span");
      meta.textContent=metaText?metaText(q):categoryLabel(category(q))+" · "+q.id;
      name.textContent=describe(q);
      arrow.textContent="›";arrow.setAttribute("aria-hidden","true");
      button.type="button";button.dataset.id=q.id;
      button.append(meta,name);
      if(progressFor){
        const progress=progressFor(q);
        const detail=document.createElement("small");
        detail.className="qb-progress-detail qb-progress-"+(progress?.kind||"unknown");
        detail.textContent=progress?.text||"기록 확인 불가";
        button.append(detail);
      }
      button.append(arrow);li.append(button);list.append(li);
      button.onclick=()=>begin(q,items);
    }
    if(!items.length){const li=document.createElement("li");li.className="qb-empty";li.textContent="조건에 맞는 문제가 없습니다.";list.append(li);}
    nav.hidden=pages<=1;prev.disabled=page===0;next.disabled=page+1>=pages;
    nav.querySelector("span").textContent=(page+1)+" / "+pages;
  }
  function show(restore=true){
    section.hidden=false;main.classList.add("qb-browsing");ids=[];render();remember();
    const url=new URL(location.href);url.searchParams.delete("id");history.replaceState(history.state,"",url);
    if(restore){
      const target=[...list.querySelectorAll("button")].find(b=>b.dataset.id===activeId)||search;
      target.focus({preventScroll:true});window.scrollTo(0,scroll);
    }
  }
  function hide(){section.hidden=true;main.classList.remove("qb-browsing");}
  search.oninput=()=>{page=0;render();};
  function turn(delta){page+=delta;render();list.querySelector("button")?.focus();}
  prev.onclick=()=>turn(-1);next.onclick=()=>turn(1);
  clear.onclick=()=>{search.value="";page=0;render();search.focus();};
  random.onclick=()=>{
    const shuffled=[...items];
    for(let i=shuffled.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
    }
    const set=shuffled.slice(0,10);if(set.length)begin(set[0],set);
  };
  function resume(id){
    if(!id||!ids.includes(id))return false;
    const lookup=new Map(questions.map(q=>[q.id,q]));
    const set=ids.map(key=>lookup.get(key));
    if(set.some(q=>!q))return false;
    hide();openQuestion(lookup.get(id),set);return true;
  }
  document.body.classList.add("shared-question-bank");
  return {show,resume,refresh:render,selectCategory};
}
