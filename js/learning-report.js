/** Canonical, data-minimal link to the Help Desk learning-question report form. */
export function learningReportUrl(source, question, label = "") {
  if (!["practical", "interview"].includes(source) || !question?.id) return "";
  const page = source === "practical" ? "practical.html" : "interview.html";
  const problem = new URL(page, location.origin);
  problem.searchParams.set("id", String(question.id));
  const report = new URL("https://help.k-bigdata.kr/request.html");
  report.searchParams.set("source", source);
  report.searchParams.set("id", String(question.id).slice(0, 80));
  if (question.code) report.searchParams.set("code", String(question.code).slice(0, 40));
  if (label) report.searchParams.set("label", String(label).slice(0, 80));
  report.searchParams.set("question", String(question.question || question.title || "").replace(/\s+/g, " ").slice(0, 125));
  report.searchParams.set("url", problem.href);
  return report.href;
}
