import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {portalPages,navigationItems,shellVersion} from '../js/portal-navigation-model.mjs';
import {renderHeader,renderServiceNavigation,renderToolbar} from './portal-shell-template.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
function discover(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(item=>item.name.startsWith('.')||['node_modules','ui-screenshots','test-results'].includes(item.name)?[]:item.isDirectory()?discover(path.join(dir,item.name)):item.name.endsWith('.html')?[path.relative(root,path.join(dir,item.name)).replaceAll('\\','/')]:[]);}
export const htmlPages=discover(root).sort();
const region=(name,content)=>`<!-- portal:${name}:start (generated; edit scripts/portal-shell-template.mjs) -->\n${content}\n<!-- portal:${name}:end -->`;
const removeRegion=(html,name)=>html.replace(new RegExp(`<!-- portal:${name}:start[^>]*-->[\\s\\S]*?<!-- portal:${name}:end -->`),'');
function replaceRegion(html,name,content,fallback){const pattern=new RegExp(`<!-- portal:${name}:start[^>]*-->[\\s\\S]*?<!-- portal:${name}:end -->`);if(pattern.test(html))return html.replace(pattern,region(name,content));if(fallback&&fallback.test(html))return html.replace(fallback,region(name,content));throw new Error('Missing '+name+' region');}
const outdated=[];
for(const file of htmlPages){
  let original=readFileSync(path.join(root,file),'utf8'),html=original;
  const id=path.basename(file,'.html');
  html=html.replace(/<html\b([^>]*)>/,(_,attributes)=>`<html${attributes.replace(/\sdata-portal-page="[^"]*"/,'')} data-portal-page="${id}">`);
  // One metadata entry registers a page; templates and markup never need copying.
  const page=portalPages[id];
  if(!page)throw new Error('Register new HTML page in portalPages: '+file);
  html=replaceRegion(html,'header',renderHeader(page),/<header\b[^>]*class="[^"]*site-header[^"]*"[^>]*>[\s\S]*?<\/header>/);
  const oldToolbar=/<div class="(?:coding-study-header )?study-header"[^>]*>[\s\S]*?<\/div>/;
  if(page.toolbar)html=replaceRegion(html,'toolbar',renderToolbar(page),oldToolbar);
  else html=removeRegion(html,'toolbar');
  if(page.group){const pattern=/<nav\b[^>]*data-learning-nav[^>]*>[\s\S]*?<\/nav>/;if(!pattern.test(html)&&!html.includes('portal:services:start'))html=html.replace(/(<main\b[^>]*>)/,'$1\n'+region('services',renderServiceNavigation(page,id)));else html=replaceRegion(html,'services',renderServiceNavigation(page,id),pattern);}
  else html=removeRegion(html,'services');
  const assets=`<link rel="stylesheet" href="css/portal-navigation.css?v=${shellVersion}">\n<script defer src="js/portal-navigation.js?v=${shellVersion}"></script>`;
  if(html.includes('portal:assets:start'))html=replaceRegion(html,'assets',assets);else html=html.replace('</head>',region('assets',assets)+'\n</head>');
  html=html.replace(/(href="css\/[^"?]+\.css)(?:\?v=[^"]+)?"/g,`$1?v=${shellVersion}"`);
  html=html.replace(/(src="js\/(?:app|home-dashboard|learning-ui|portal-shell-entry|coding)\.js)(?:\?v=[^"]+)?"/g,`$1?v=${shellVersion}"`);
  html=html.replace(/<main\b([^>]*)(?<!tabindex="-1")>/,match=>match.includes('tabindex=')?match:match.slice(0,-1)+' tabindex="-1">');
  if(html!==original){outdated.push(file);if(!process.argv.includes('--check'))writeFileSync(path.join(root,file),html);}
}
if(process.argv.includes('--check')&&outdated.length)throw new Error('Regenerate portal shell: '+outdated.join(', '));
console.log(`${process.argv.includes('--check')?'Verified':'Generated'} shared shell for ${htmlPages.length} HTML pages.`);
