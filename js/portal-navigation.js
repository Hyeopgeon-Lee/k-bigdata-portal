// Independent of content modules: static links remain usable if those modules fail.
(()=>{
  'use strict';
  if(document.documentElement.dataset.portalNavigationReady)return;
  document.documentElement.dataset.portalNavigationReady='true';
  const menu=document.querySelector('.portal-menu');
  if(!menu)return;
  const toggle=menu.querySelector('summary');
  const compact=matchMedia('(max-width:1240px)');
  const disclosures=[menu,...document.querySelectorAll('.portal-nav-more')];
  function sync(){toggle.setAttribute('aria-expanded',String(menu.open));}
  function close(node,restore=false){if(node===menu&&!compact.matches)return;node.open=false;if(restore)node.querySelector('summary')?.focus();sync();}
  function resize(){menu.open=!compact.matches;sync();}
  resize();
  compact.addEventListener('change',resize);
  menu.addEventListener('toggle',()=>{if(!compact.matches&&!menu.open)menu.open=true;sync();});
  document.addEventListener('click',event=>{
    for(const node of disclosures)if(node.open&&(!node.contains(event.target)||event.target.closest('a')))close(node);
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    const open=disclosures.filter(node=>node.open&&(node!==menu||compact.matches));
    const target=open.find(node=>node.contains(document.activeElement))||open.at(-1);
    if(target){event.preventDefault();close(target,true);}
  });
  window.addEventListener('pageshow',resize);
  // Group anchors on the home page can change without a new document.
  function currentGroup(){if(!document.body.hasAttribute('data-portal-home'))return;const group=location.hash.slice(1);document.querySelectorAll('#portal-nav a').forEach(link=>{link.removeAttribute('aria-current');if(link.dataset.portalGroup===group)link.setAttribute('aria-current','location');});if(!document.querySelector('#portal-nav [aria-current]'))document.querySelector('#portal-nav a')?.setAttribute('aria-current','page');}
  currentGroup();window.addEventListener('hashchange',currentGroup);
})();
