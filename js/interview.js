import {questions} from "../data/interview-questions.js";
export {questions};
export {interviewSources, interviewEditorialSources, interviewReviewDate} from "../data/interview-sources.js";

export const interviewGroups = [...new Set(questions.map(q => q.group))];
export const interviewJobTags = ["공통", "백엔드", "Java", "데이터엔지니어", "AI개발", "클라우드", "DevOps"];
export const questionSearchText = q => [q.id, q.code, q.group, q.category, q.subCategory, q.question,
  q.shortAnswer, q.detailedAnswer, q.aliases, ...q.keywords, ...q.followUps, ...q.jobTags].join(" ");
export function matchesInterviewCategory(question, category) {
  return category === "전체" || question.group === category || question.category === category;
}
// Round-robin across shuffled fields; no duplication, no pool mutation, graceful short pools.
export function selectRandomQuestions(pool, count, random = Math.random) {
  const shuffle = values => {
    const items = [...values];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  };
  const unique = [...new Map(pool.map(q => [q.id, q])).values()];
  const buckets = shuffle([...new Set(unique.map(q => q.group))])
    .map(group => shuffle(unique.filter(q => q.group === group)));
  const result = [], target = Math.min(Math.max(0, Math.floor(count)), unique.length);
  while (result.length < target) {
    for (const bucket of buckets) {
      if (bucket.length && result.length < target) result.push(bucket.pop());
    }
  }
  return shuffle(result);
}
