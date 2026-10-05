export const normalize = value => String(value).normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu,"");

const synonyms=[
  ["쿠버네티스","kubernetes","k8s","cka"],
  ["자바","java"],
  ["클라우드","cloud"],
  ["데브옵스","devops"],
  ["데이터베이스","database","db","sql"],
  ["파이썬","python"],
  ["스프링","spring"],
  ["도커","docker"],
  ["리눅스","linux"],
  ["깃허브","github"],
  ["케이파스","kpaas"]
];

export function matches(text,query){
  const tokens=query.trim().split(/\s+/).filter(Boolean),hay=normalize(text);
  return tokens.every(token=>{
    const term=normalize(token),group=synonyms.find(g=>g.map(normalize).includes(term));
    return (group||[token]).some(value=>{
      const key=normalize(value);
      if(/^[a-z0-9]{1,4}$/i.test(value)) return new RegExp("(^|[^a-z0-9])"+key+"([^a-z0-9]|$)","i").test(String(text));
      return hay.includes(key);
    });
  });
}

export const jobSearchText = job => [
  job.name,job.english,job.overview,job.description,job.aliases,job.education,
  job.category,job.suitability,...(job.careerPath||[]),
  ...(job.tracks||[]).flatMap(track=>[track.name,track.goal,...track.skills]),
  ...(job.tags||[]),...(job.essentialSkills||[]),...(job.plusSkills||[]),
  ...(job.recruitmentKeywords||[]),...(job.tasks||[]),...(job.interviewTopics||[]),
  ...(job.relatedRoles||[]).map(role=>role.name)
].join(" ");

export const docSearchText = doc => [
  doc.name,doc.english,doc.overview,doc.description,doc.category,doc.subcategory,doc.aliases,
  ...(doc.learn||[]),...(doc.useCases||[]),...(doc.related||[]),...(doc.tags||[])
].join(" ");

export const certificationSearchText = (cert,jobs=[]) => [
  cert.name,cert.english,cert.category,cert.institution,cert.summary,cert.note,cert.recommendedTiming,
  ...(cert.aliases||[]),
  ...(cert.examScope||[]).flatMap(scope=>[scope.stage,...(scope.subjects||[])]),
  ...(cert.departmentCourses||[]),
  ...(cert.relatedJobIds||[]).map(id=>jobs.find(job=>job.id===id)?.name)
].filter(Boolean).join(" ");
