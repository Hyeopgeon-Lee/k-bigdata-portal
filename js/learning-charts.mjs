import {escapeHTML as esc} from "./practical-core.js?v=20261127-no-timer-1";
const percent=(a,b)=>b?Math.round(a/b*1000)/10:0;
export const btn=(label,action,attrs="")=>'<button type="button" class="cd-btn" data-pd-action="'+action+'" '+attrs+'>'+esc(label)+'</button>';
export const select=(key,value,opts,label)=>'<label class="pd-select">'+esc(label)+'<select data-pd-select="'+key+'">'+opts.map(([k,v])=>'<option value="'+esc(k)+'"'+(String(value)===String(k)?" selected":"")+'>'+esc(v)+'</option>').join("")+'</select></label>';
export const kpi=(n,v,s="")=>'<article class="cd-kpi"><small>'+esc(n)+'</small><strong>'+esc(v)+'</strong><small>'+esc(s)+'</small></article>';
export const card=(title,html)=>'<article class="cd-card"><h3>'+esc(title)+'</h3>'+html+'</article>';
export const bar=(a,b,color="")=>'<div class="cd-track" role="progressbar" aria-label="비율" aria-valuenow="'+percent(a,b)+'" aria-valuemin="0" aria-valuemax="100"><span class="'+color+'" style="width:'+percent(a,b)+'%"></span></div>';
export const line=(label,value)=>'<div class="cd-line"><strong>'+esc(label)+'</strong><span>'+esc(value)+'</span></div>';
export const donut=(value,caption,style)=>'<div class="cd-donut pd-donut" role="img" aria-label="'+esc(caption+" "+value)+'" style="'+style+'"><div><strong>'+esc(value)+'</strong><small>'+esc(caption)+'</small></div></div>';
