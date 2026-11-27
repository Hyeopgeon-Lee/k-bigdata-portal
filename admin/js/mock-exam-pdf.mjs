import {numberQuestions} from "./mock-exam-model.mjs?v=20261128-1";

// A4 dimensions in PDF points. Canvas pages are rasterized at print resolution;
// only one full-resolution canvas is held at a time. No remote PDF service.
export const A4={width:595.28,height:841.89};
const W=A4.width,H=A4.height,M=32,GAP=18,CW=(W-2*M-GAP)/2,BOTTOM=H-42;
const FONT='"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR","Noto Sans CJK KR",sans-serif';
const CODE='"D2Coding","Consolas","Menlo","Noto Sans Mono CJK KR","Noto Sans CJK KR",monospace';
const fonts={normal:'10.5px '+FONT,bold:'bold 10.5px '+FONT,code:'9.5px '+CODE};
const circ=["①","②","③","④"];
const clean=v=>String(v??"").replace(/\r\n?/g,"\n").replace(/\t/g,"    ");
function wrap(ctx,value,width,font){
 ctx.font=font;const lines=[];
 for(const raw of clean(value).split("\n")){
  if(!raw){lines.push("");continue;}
  let line="",lastBreak=-1;
  for(const ch of raw){
   if(ctx.measureText(line+ch).width>width&&line){
    if(lastBreak>0&&font!==fonts.code){lines.push(line.slice(0,lastBreak).trimEnd());line=line.slice(lastBreak).trimStart();}
    else {lines.push(line);line="";}
    lastBreak=line.lastIndexOf(" ")+1;
    if(ctx.measureText(line+ch).width>width&&line){lines.push(line);line="";lastBreak=-1;}
   }
   line+=ch;if(/\s/.test(ch))lastBreak=line.length;
  }
  lines.push(line);
 }
 return lines;
}
function text(ctx,value,x,y,font,color="#151515",align="left"){
 ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline="top";ctx.fillText(value,x,y);
}
function rule(ctx,x1,y1,x2,y2,color="#a0a0a0",lw=.55){ctx.beginPath();ctx.lineWidth=lw;ctx.strokeStyle=color;ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
async function loadPictures(questions){
 const map=new Map();
 for(const {q} of questions){
  for(const v of [...(q.visuals||[]),...(q.optionVisuals||[])]){
   if(map.has(v.dataUri))continue;
   const img=new Image();img.src=v.dataUri;
   try{await img.decode();}catch{throw Error("시험지 그림을 읽을 수 없습니다. 다시 생성해 주세요.");}
   if(!img.naturalWidth||!img.naturalHeight)throw Error("문제 그림의 크기를 확인할 수 없습니다.");
   map.set(v.dataUri,img);
  }
 }
 return map;
}
function questionBlock(ctx,item,width,images){
 const {q,number}=item;let y=0;const commands=[];
 const lines=(value,x,w,font,lh)=>{for(const str of wrap(ctx,value,w,font)){commands.push({kind:"text",value:str,x,y,font});y+=lh;}};
 const pic=(v,x,w)=>{
  const img=images.get(v.dataUri);if(!img)throw Error("문제 그림에 오류가 있습니다.");
  const dw=Math.min(w,img.naturalWidth),dh=dw*img.naturalHeight/img.naturalWidth,scale=Math.min(1,170/dh);
  commands.push({kind:"image",image:img,x,y,w:dw*scale,h:dh*scale});y+=dh*scale+4;
 };
 // Inline number is intentionally separate from the question stem, so wrapping
 // keeps all following lines aligned with the beginning of the stem.
 commands.push({kind:"text",value:number+".",x:0,y,font:fonts.bold});
 lines(q.question,24,width-24,fonts.bold,14.2);y+=3;
 if(q.code){
  const start=y; y+=5;const begin=commands.length;
  lines(q.code,8,width-16,fonts.code,12.3);y+=5;
  commands.splice(begin,0,{kind:"codebox",x:0,y:start,w:width,h:y-start});y+=4;
 }
 for(const v of q.visuals||[])pic(v,4,width-8);
 q.options.forEach((opt,i)=>{
  commands.push({kind:"text",value:circ[i],x:2,y,font:fonts.normal});
  lines(opt,20,width-20,fonts.normal,14.2);
  if(q.optionVisuals?.[i])pic(q.optionVisuals[i],20,width-20);
  y+=2;
 });
 return {number,commands,height:y+10,width};
}
function headerHeight(first){return first?142:75;}
export async function layoutExam(exam,form){
 const numbered=numberQuestions(exam.forms[form]);
 const questions=numbered.flatMap(s=>s.questions),images=await loadPictures(questions);
 const g=document.createElement("canvas").getContext("2d"),pages=[];
 for(let s=0;s<numbered.length;s++){
  const section=numbered[s];let page,col,y;
  function newPage(wide=false){
   page={subject:section.subject,subjectIndex:s,first:pages.length===0,continued:pages.some(p=>p.subjectIndex===s),wide,blocks:[]};
   pages.push(page);col=0;y=headerHeight(page.first);
  }
  function advance(){if(col===0&&!page.wide){col=1;y=headerHeight(page.first);}else newPage();}
  for(const item of section.questions){
   if(!page)newPage();
   let block=questionBlock(g,item,CW,images);
   const maxHeight=BOTTOM-headerHeight(false);
   if(block.height>maxHeight||(!page.blocks.length&&block.height>BOTTOM-y)){
    block=questionBlock(g,item,W-2*M,images);
    if(page.blocks.length){newPage(true);}else page.wide=true;
    if(block.height>BOTTOM-y)throw Error(item.number+"번 문항이 A4 용지에 들어가지 않습니다. 다시 생성해 주세요.");
    page.blocks.push({...block,x:M,y});page=null;continue;
   }
   if(y+block.height>BOTTOM){
    // A very tall item may fit the continuation page but not the first-page header.
    advance();
    if(y+block.height>BOTTOM)advance();
   }
   if(y+block.height>BOTTOM)throw Error(item.number+"번 문항의 페이지 배치에 실패했습니다.");
   page.blocks.push({...block,x:M+col*(CW+GAP),y});y+=block.height;
  }
 }
 return {pages,numbered};
}
function header(ctx,exam,form,page){
 const label=exam.config.label+" 실전 모의고사";
 if(page.first&&!page.compact){
  text(ctx,"한국폴리텍대학 서울강서캠퍼스  |  빅데이터소프트웨어공학과",W/2,28,"10px "+FONT,"#333","center");
  text(ctx,label,W/2,44,"bold 20px "+FONT,"#111","center");
  text(ctx,form+"형  /  "+exam.config.total+"문항  /  "+exam.config.minutes+"분",W/2,70,"bold 11px "+FONT,"#333","center");
  ctx.strokeStyle="#777";ctx.lineWidth=.65;ctx.strokeRect(M,89,W-2*M,22);
  text(ctx,"학번: __________________  성명: __________________  점수: ________ / 100",M+10,94,"10px "+FONT);
 }else{
  text(ctx,label,M,24,"bold 13px "+FONT);text(ctx,form+"형  |  "+exam.id,W-M,26,"9px "+FONT,"#444","right");
 }
 const sy=page.first&&!page.compact?114:48;
 ctx.fillStyle="#e8e8e8";ctx.fillRect(M,sy,W-2*M,18);
 text(ctx,"제"+(page.subjectIndex+1)+"과목  "+page.subject+(page.continued?" (계속)":""),M+7,sy+3,"bold 10px "+FONT);
}
function footer(ctx,exam,form,page,total,isKey=false){
 rule(ctx,M,H-32,W-M,H-32,"#aaa");
 text(ctx,exam.id+"  |  "+form+"형",M,H-25,"8.5px "+FONT,"#444");
 text(ctx,isKey?"교수자용 정답표":"학생용 시험지",W-M,H-25,"8.5px "+FONT,"#444","right");
 text(ctx,isKey?"정답표":page+" / "+total,W/2,H-25,"9px "+FONT,"#333","center");
}
function drawQuestionPage(ctx,exam,form,page,index,total){
 header(ctx,exam,form,page);
 if(!page.wide&&page.blocks.some(b=>b.x>M+1))rule(ctx,M+CW+GAP/2,headerHeight(page.first&&!page.compact),M+CW+GAP/2,BOTTOM,"#c3c3c3");
 for(const block of page.blocks){
  for(const c of block.commands){
   const x=block.x+c.x,y=block.y+c.y;
   if(c.kind==="text")text(ctx,c.value,x,y,c.font);
   else if(c.kind==="codebox"){ctx.fillStyle="#f1f1f1";ctx.fillRect(x,y,c.w,c.h);ctx.strokeStyle="#c4c4c4";ctx.lineWidth=.45;ctx.strokeRect(x,y,c.w,c.h);}
   else ctx.drawImage(c.image,x,y,c.w,c.h);
  }
  rule(ctx,block.x,block.y+block.height-5,block.x+block.width,block.y+block.height-5,"#d2d2d2",.45);
 }
 footer(ctx,exam,form,index,total);
}
function drawAnswerPage(ctx,exam,form,numbered){
 const {config}=exam;
 text(ctx,"한국폴리텍대학 서울강서캠퍼스  |  빅데이터소프트웨어공학과",W/2,28,"10px "+FONT,"#333","center");
 text(ctx,config.label+" 실전 모의고사 정답표",W/2,49,"bold 19px "+FONT,"#111","center");
 text(ctx,form+"형  |  "+exam.id+"  |  "+config.total+"문항",W/2,79,"bold 10px "+FONT,"#333","center");
 const cols=numbered.length,tw=(W-2*M)/cols,rowH=23,top=116;
 numbered.forEach((section,c)=>{
  const x=M+c*tw;
  ctx.fillStyle="#e3e3e3";ctx.fillRect(x,top,tw,43);
  text(ctx,"제"+(c+1)+"과목",x+tw/2,top+6,"bold 10px "+FONT,"#111","center");
  // Wrap the subject caption when the five-subject grid is narrow.
  const label=wrap(ctx,section.subject,tw-9,"8.7px "+FONT);
  label.forEach((l,i)=>text(ctx,l,x+tw/2,top+20+i*10,"8.7px "+FONT,"#333","center"));
  section.questions.forEach(({q,number},i)=>{
   const yy=top+43+i*rowH;
   ctx.fillStyle=i%2?"#f6f6f6":"#fff";ctx.fillRect(x,yy,tw,rowH);
   text(ctx,String(number).padStart(2,"0"),x+tw*.27,yy+5,"10px "+FONT,"#333","center");
   text(ctx,circ[q.answer-1],x+tw*.73,yy+4,"bold 12px "+FONT,"#111","center");
   rule(ctx,x,yy+rowH,x+tw,yy+rowH,"#bdbdbd",.4);
  });
  rule(ctx,x,top,x,top+43+20*rowH,"#909090");
 });
 rule(ctx,W-M,top,W-M,top+43+20*rowH,"#909090");
 const yy=top+43+20*rowH+23;
 text(ctx,"채점 기준",M,yy,"bold 13px "+FONT);
 text(ctx,"과목별: 정답 수 × 5점 (100점 만점)",M,yy+22,"10.5px "+FONT);
 text(ctx,"평균: 전체 과목 점수의 산술평균  |  합격 기준: 평균 60점 이상, 모든 과목 40점 이상",M,yy+39,"10.5px "+FONT);
 text(ctx,"※ 정답표는 학생용 시험지와 분리하여 보관하세요.",M,yy+61,"10px "+FONT,"#555");
 footer(ctx,exam,form,0,0,true);
}
async function rasterize(draw){
 const canvas=document.createElement("canvas"),scale=3.5;
 canvas.width=Math.round(W*scale);canvas.height=Math.round(H*scale);
 const ctx=canvas.getContext("2d",{alpha:false});
 ctx.scale(canvas.width/W,canvas.height/H);ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);
 draw(ctx);
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error("PDF 페이지 이미지 생성 실패")),"image/jpeg",.95));
 const out={blob,width:canvas.width,height:canvas.height};
 canvas.width=1;canvas.height=1;return out;
}
export async function renderExam(exam,form,onProgress=()=>{}){
 const {pages,numbered}=await layoutExam(exam,form);
 const result=[];
 for(let i=0;i<pages.length;i++){
  onProgress(i+1,pages.length+1);
  result.push(await rasterize(ctx=>drawQuestionPage(ctx,exam,form,pages[i],i+1,pages.length)));
 }
 onProgress(pages.length+1,pages.length+1);
 result.push(await rasterize(ctx=>drawAnswerPage(ctx,exam,form,numbered)));
 return result;
}
// Minimal image-only PDF 1.4 writer. Binary object lengths and xref offsets
// are computed in bytes; all pages use the actual ISO A4 MediaBox.
export function buildPdf(pages){
 if(!Array.isArray(pages)||!pages.length)throw Error("PDF 페이지가 없습니다.");
 const encoder=new TextEncoder(),parts=[],offsets=[0];let position=0;
 function append(data){const part=typeof data==="string"?encoder.encode(data):data;parts.push(part);position+=part instanceof Blob?part.size:part.byteLength;}
 function obj(id,body){offsets[id]=position;append(id+" 0 obj\n");body();append("\nendobj\n");}
 append("%PDF-1.4\n");append(new Uint8Array([37,226,227,207,211,10]));
 obj(1,()=>append("<< /Type /Catalog /Pages 2 0 R >>"));
 obj(2,()=>append("<< /Type /Pages /Count "+pages.length+" /Kids ["+pages.map((_,i)=>(3+i*3)+" 0 R").join(" ")+"] >>"));
 pages.forEach((p,i)=>{
  const id=3+i*3,img=id+1,content=id+2;
  obj(id,()=>append("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+W+" "+H+"] /Resources << /XObject << /Im0 "+img+" 0 R >> >> /Contents "+content+" 0 R >>"));
  obj(img,()=>{append("<< /Type /XObject /Subtype /Image /Width "+p.width+" /Height "+p.height+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+p.blob.size+" >>\nstream\n");append(p.blob);append("\nendstream");});
  const instructions="q\n"+W+" 0 0 "+H+" 0 0 cm\n/Im0 Do\nQ\n";
  obj(content,()=>append("<< /Length "+encoder.encode(instructions).length+" >>\nstream\n"+instructions+"endstream"));
 });
 const xref=position,size=offsets.length;
 append("xref\n0 "+size+"\n0000000000 65535 f \n");
 for(let n=1;n<size;n++)append(String(offsets[n]).padStart(10,"0")+" 00000 n \n");
 append("trailer\n<< /Size "+size+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF\n");
 return new Blob(parts,{type:"application/pdf"});
}
