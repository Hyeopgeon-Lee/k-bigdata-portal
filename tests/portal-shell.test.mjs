import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {portalPages,groups,navigationItems,shellVersion} from '../js/portal-navigation-model.mjs';
import {renderHeader,renderServiceNavigation,renderToolbar,renderPageIntro} from '../scripts/portal-shell-template.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>readFileSync(path.join(root,file),'utf8').replaceAll('\r\n','\n');
const discover=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.name.startsWith('.')||['node_modules','ui-screenshots','test-results','alumni','supabase'].includes(entry.name)?[]:entry.isDirectory()?discover(path.join(dir,entry.name)):entry.name.endsWith('.html')?[path.relative(root,path.join(dir,entry.name)).replaceAll('\\','/')]:[]);
const files=discover(root).sort();
const matchNavigationVersion=/const navigationScriptVersion='([^']+)'/.exec(read('scripts/build-portal-shell.mjs'));
assert.ok(matchNavigationVersion,'the generated shell declares a navigation script version');
const navigationScriptVersion=matchNavigationVersion[1];
assert.equal(files.length,Object.keys(portalPages).length,'all discovered HTML pages must have an explicit page identity');
assert.equal(new Set(navigationItems.map(item=>item.id)).size,navigationItems.length,'unique service IDs');
assert.equal(groups.length,4,'preserve the four portal areas');
for(const file of files){
  const id=path.basename(file,'.html'),page=portalPages[id],html=read(file);
  assert.ok(page,'known page '+file);
  assert.equal((html.match(/<header\b[^>]*class="[^"]*\bsite-header\b/g)||[]).length,1,'one global header '+file);
  assert.ok(html.includes(renderHeader(page)),'generated global header is current '+file);
  assert.equal((html.match(/css\/portal-navigation\.css\?v=/g)||[]).length,1,'one shared CSS asset '+file);
  assert.equal((html.match(/js\/portal-navigation\.js\?v=/g)||[]).length,1,'one shared early menu script '+file);
  assert.ok(html.includes('css/portal-navigation.css?v='+shellVersion),'versioned CSS '+file);
  assert.ok(html.includes('js/portal-navigation.js?v='+navigationScriptVersion),'versioned JS '+file);
  assert.ok(html.indexOf('css/portal-navigation.css')>html.lastIndexOf('<style'),'shared styles follow any inline stylesheet '+file);
  assert.ok(/<script defer src="js\/portal-navigation\.js/.test(html),'menu runs independently of content modules '+file);
  if(page.eyebrow){
    assert.ok(html.includes(renderServiceNavigation(page,id)),'generated service links '+file);
    assert.ok(html.includes(renderPageIntro(page,id)),'generated page introduction '+file);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,'exactly one accessible page title '+file);
    assert.equal((html.match(/portal-page-back/g)||[]).length,1,'one portal home back link '+file);
    const generated=renderServiceNavigation(page,id);
    assert.equal((generated.match(/data-nav-id=/g)||[]).length,navigationItems.length,'all services accessible '+file);
    assert.equal((generated.match(/aria-current="page"/g)||[]).length,page.group?1:0,'current service if registered '+file);
    assert.ok(html.indexOf('portal:services:end')<html.indexOf('portal:intro:start'),'service bar precedes intro '+file);
  }else{
    assert.ok(!html.includes('data-learning-nav'),'home keeps its own content information architecture');
    assert.ok(!html.includes('portal:intro:start'),'home has no redundant introduction');
  }
  if(page.toolbar)assert.ok(html.includes(renderToolbar(page)),'learning toolbar actions preserved '+file);
  else assert.ok(!/<div class="(?:coding-study-header )?study-header"/.test(html),'no unwanted auxiliary toolbar '+file);
}
const generated=spawnSync(process.execPath,['scripts/build-portal-shell.mjs','--check'],{cwd:root,encoding:'utf8'});
assert.equal(generated.status,0,generated.stderr||generated.stdout);
const runtime=read('js/portal-navigation.js');
assert.match(runtime,/portalNavigationReady/,'repeat initialization guard');
assert.match(runtime,/Escape/,'keyboard menu exit');
assert.match(runtime,/hashchange/,'home anchor current location stays accurate');
console.log('PASS: '+files.length+' HTML pages use the current generated shell, unique shared assets, preserved menu groups and current-service identity.');
