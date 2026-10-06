(() => {
  const status = document.querySelector("#copy-status");
  const buttons = document.querySelectorAll(".copy-prompt");
  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  };

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;
      const original = button.textContent;
      try {
        await copyText(target.innerText.trim());
        button.textContent = "복사됨";
        button.classList.add("is-copied");
        if (status) status.textContent = "프롬프트를 클립보드에 복사했습니다.";
        window.setTimeout(() => {
          button.textContent = original;
          button.classList.remove("is-copied");
        }, 1600);
      } catch {
        button.textContent = "복사 실패";
        if (status) status.textContent = "프롬프트 복사에 실패했습니다.";
        window.setTimeout(() => { button.textContent = original; }, 1600);
      }
    });
  });

  const roleSection = document.querySelector("#role-samples");
  const roleTabs = [...document.querySelectorAll("[data-role-target]")];
  const rolePanels = roleTabs.map(tab => document.getElementById(tab.dataset.roleTarget)).filter(Boolean);
  const activateRole = (tab, moveFocus = false) => {
    roleTabs.forEach(item => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    rolePanels.forEach(panel => { panel.hidden = panel.id !== tab.dataset.roleTarget; });
    if (moveFocus) tab.focus();
  };
  if (roleTabs.length) {
    roleTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateRole(tab));
      tab.addEventListener("keydown", event => {
        if (!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % roleTabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + roleTabs.length) % roleTabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = roleTabs.length - 1;
        activateRole(roleTabs[next], true);
      });
    });
    const hashTarget = location.hash && roleTabs.find(tab => "#" + tab.dataset.roleTarget === location.hash);
    activateRole(hashTarget || roleTabs.find(tab => tab.getAttribute("aria-selected") === "true") || roleTabs[0]);
  }

  const modeButtons = [...document.querySelectorAll("[data-annotation-mode]")];
  modeButtons.forEach(button => button.addEventListener("click", () => {
    const explain = button.dataset.annotationMode === "explain";
    roleSection?.classList.toggle("show-annotations", explain);
    modeButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
  }));
})();