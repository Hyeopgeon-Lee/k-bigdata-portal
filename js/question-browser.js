/* Shared entry screen for all three question banks. */
export function createQuestionBrowser({title, questions, category, categoryLabel, describe, searchText, openQuestion, openSettings, settingsContainer, initialCategory=""}) {
  const main=document.querySelector("main");
  const section=document.createElement("section");
  section.className="question-browser";
  section.hidden=true;
  section.innerHTML=`
    <h1></h1>
    <div class="qb-controls">
      <label>문제 검색<input type="search" placeholder="문제명 또는 키워드" autocomplete="off"></label>
      <label>분류<select></select></label>
      <button type="button" class="qb-settings">상세 설정</button>
    </div>
    <div class="qb-list"><header><h2>문제 목록</h2><span role="status"></span></header>
      <ol></ol><nav aria-label="문제 목록 페이지"><button type="button">이전</button><span></span><button type="button">다음</button></nav>
    </div>`;
  main.querySelector(".portal-service-nav").after(section);
  section.querySelector("h1").textContent=title;
  const search=section.querySelector("input"),select=section.querySelector("select");
  const list=section.querySelector("ol"),status=section.querySelector("[role=status]");
  const nav=section.querySelector("nav"),[prev,next]=nav.querySelectorAll("button");
  select.add(new Option("전체",""));
  for(const key of new Set(questions.map(category)))select.add(new Option(categoryLabel(key),key));
  if([...select.options].some(o=>o.value===initialCategory))select.value=initialCategory;
  let page=0, activeId="", scroll=0;
  function render(){
    const term=search.value.trim().toLocaleLowerCase();
    const items=questions.filter(q=>(!select.value||select.value===category(q))&&(!term||searchText(q).toLocaleLowerCase().includes(term)));
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
      button.onclick=()=>{activeId=q.id;scroll=window.scrollY;hide();openQuestion(q,items);};
    }
    if(!items.length){const li=document.createElement("li");li.className="qb-empty";li.textContent="조건에 맞는 문제가 없습니다.";list.append(li);}
    nav.hidden=pages<=1;prev.disabled=page===0;next.disabled=page+1>=pages;
    nav.querySelector("span").textContent=(page+1)+" / "+pages;
  }
  function show(restore=true){
    section.hidden=false;main.classList.add("qb-browsing");render();
    const url=new URL(location.href);url.searchParams.delete("id");history.replaceState(null,"",url);
    if(restore){
      const target=[...list.querySelectorAll("button")].find(b=>b.dataset.id===activeId)||search;
      target.focus({preventScroll:true});window.scrollTo(0,scroll);
    }
  }
  function hide(){section.hidden=true;main.classList.remove("qb-browsing");}
  search.oninput=select.onchange=()=>{page=0;render();};
  function turn(delta){page+=delta;render();list.querySelector("button")?.focus();}
  prev.onclick=()=>turn(-1);next.onclick=()=>turn(1);
  section.querySelector(".qb-settings").onclick=()=>{scroll=window.scrollY;hide();openSettings();};
  const back=document.createElement("button");
  back.type="button";back.className="qb-back";back.textContent="‹ 문제 목록";
  back.onclick=()=>show();
  document.querySelector(settingsContainer).prepend(back);
  return {show};
}
