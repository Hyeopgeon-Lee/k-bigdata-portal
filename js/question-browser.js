/* Shared entry screen for all three question banks. */
export function createQuestionBrowser({title, questions, category, categoryLabel, describe, searchText, openQuestion, scope, initialCategory=""}) {
  const main=document.querySelector("main");
  const section=document.createElement("section");
  section.className="question-browser";
  section.hidden=true;
  section.innerHTML=`
    <h1></h1>
    <div class="qb-controls">
      <div class="qb-categories" role="group" aria-label="문제 분류"></div>
      <div class="qb-search"><input aria-label="문제 검색" type="search" placeholder="문제 번호·제목·키워드 검색"><button type="button" aria-label="검색어 지우기" hidden>×</button></div>
    </div>
    <div class="qb-list"><header><h2>문제 목록 <span role="status"></span></h2><button type="button" class="qb-random"></button></header>
      <ol></ol><nav aria-label="문제 목록 페이지"><button type="button">이전</button><span></span><button type="button">다음</button></nav>
    </div>`;
  main.querySelector(".portal-service-nav").after(section);
  section.querySelector("h1").textContent=title;
  const search=section.querySelector("input"), chips=section.querySelector(".qb-categories");
  const random=section.querySelector(".qb-random"),clear=section.querySelector(".qb-search button");
  const list=section.querySelector("ol"),status=section.querySelector("[role=status]");
  const nav=section.querySelector("nav"),[prev,next]=nav.querySelectorAll("button");
  const saved=history.state?.questionBrowser||{};
  let selected=saved.selected??initialCategory, page=saved.page||0, activeId=saved.activeId||"", scroll=saved.scroll||0;
  let items=[], scopeEnabled=Boolean(scope), ids=saved.ids||[];
  search.value=saved.query||"";
  const categories=[...new Set(questions.map(category))];
  const order=["C","c","Java","java","Python","python","SQL","linux"];
  const rank=key=>order.includes(key)?order.indexOf(key):order.length;
  categories.sort((a,b)=>rank(a)-rank(b)||a.localeCompare(b));
  for(const key of ["",...categories]){
    const chip=document.createElement("button");chip.type="button";chip.dataset.category=key;
    chip.textContent=key?categoryLabel(key):"전체";chips.append(chip);
    chip.onclick=()=>{selected=key;page=0;render();};
  }
  if(scope){
    const chip=document.createElement("button");chip.type="button";chip.textContent=scope.label+" ×";
    chip.onclick=()=>{scopeEnabled=false;page=0;chip.remove();const url=new URL(location.href);url.searchParams.delete("exam");history.replaceState(history.state,"",url);render();};
    chips.before(chip);
  }
  function remember(){
    history.replaceState({...history.state,questionBrowser:{selected,query:search.value,page,activeId,scroll,ids}},"");
  }
  function begin(q,set){
    activeId=q.id;scroll=window.scrollY;ids=set.map(item=>item.id);remember();hide();openQuestion(q,set);
  }
  function render(){
    const terms=search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    items=questions.filter(q=>{
      if(scopeEnabled&&!scope.matches(q)||selected&&category(q)!==selected)return false;
      const text=searchText(q).toLocaleLowerCase();
      return terms.every(term=>text.includes(term));
    });
    for(const chip of chips.children)chip.setAttribute("aria-pressed",String(chip.dataset.category===selected));
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
      meta.textContent=categoryLabel(category(q))+" · "+q.id;
      name.textContent=describe(q);
      arrow.textContent="›";arrow.setAttribute("aria-hidden","true");
      button.type="button";button.dataset.id=q.id;
      button.append(meta,name,arrow);li.append(button);list.append(li);
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
  return {show,resume};
}
