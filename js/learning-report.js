/** Minimal, canonical link shared by all learning question error-report buttons. */
export function learningReportUrl(source, question, _label = "") {
  if (!["practical", "interview", "coding", "ncp"].includes(source)) return "";
  const id = String(question?.id ?? "").trim();
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) return "";
  const base = typeof location === "undefined" ? "https://portal.k-bigdata.kr/" : location.origin + "/";
  const report = new URL("help.html", base);
  report.searchParams.set("source", source);
  report.searchParams.set("id", id);
  return report.href;
}

