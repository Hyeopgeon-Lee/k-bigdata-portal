import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {portalPages,groups,navigationItems,shellVersion} from '../js/portal-navigation-model.mjs';
import {renderHeader,renderServiceNavigation,renderToolbar} from '../scripts/portal-shell-template.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>readFileSync(path.join(root,file),'utf8');
const discover=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.name.startsWith('.')||['node_modules','ui-screenshots','test-results'].includes(entry.name)?[]:entry.isDirectory()?discover(path.join(dir,entry.name)):entry.name.endsWith('.html')?[path.relative(root,path.join(dir,entry.name)).replaceAll('\\','/')]:[]);
const files=discover(root).sort();
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
  assert.ok(html.includes('js/portal-navigation.js?v='+shellVersion),'versioned JS '+file);
  assert.ok(html.indexOf('css/portal-navigation.css')>html.lastIndexOf('<style'),'shared styles follow any inline stylesheet '+file);
  assert.ok(/<script defer src="js\/portal-navigation\.js/.test(html),'menu runs independently of content modules '+file);
  if(page.group){
    assert.ok(html.includes(renderServiceNavigation(page,id)),'generated service links '+file);
    const generated=renderServiceNavigation(page,id);
    assert.equal((generated.match(/data-nav-id=/g)||[]).length,navigationItems.length,'all services accessible '+file);
    assert.equal((generated.match(/aria-current="page"/g)||[]).length,1,'one current service '+file);
  }else assert.ok(!html.includes('data-learning-nav'),'home keeps its own content information architecture');
  if(page.toolbar)assert.ok(html.includes(renderToolbar(page)),'learning toolbar actions preserved '+file);
}
const generated=spawnSync(process.execPath,['scripts/build-portal-shell.mjs','--check'],{cwd:root,encoding:'utf8'});
assert.equal(generated.status,0,generated.stderr||generated.stdout);
const runtime=read('js/portal-navigation.js');
assert.match(runtime,/portalNavigationReady/,'repeat initialization guard');
assert.match(runtime,/Escape/,'keyboard menu exit');
assert.match(runtime,/hashchange/,'home anchor current location stays accurate');
console.log('PASS: '+files.length+' HTML pages use the current generated shell, unique shared assets, preserved menu groups and current-service identity.');
