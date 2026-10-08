import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import test from "node:test";

const root = new URL("../", import.meta.url);
const script = readFileSync(new URL("js/analytics.js", root), "utf8");
const pages = [
  "index.html", "jobs.html", "certifications.html", "practical.html",
  "interview.html", "resume.html", "docs.html", "recruit.html",
  "project-guide.html"
];

function simulate({enabled = true, hostname = "portal.k-bigdata.kr",
  pathname = "/practical.html", referrer =
    "https://portal.k-bigdata.kr/interview.html?student=123&email=foo@example.com"} = {}) {
  const tags = [];
  const listeners = {};
  const document = {
    title: "실기 문제풀이 | K-BigData Portal",
    referrer,
    head: {appendChild(tag) {tags.push(tag);}},
    createElement() {return {};},
    addEventListener(name, handler) {listeners[name] = handler;}
  };
  const location = {
    hostname,
    origin: "https://" + hostname,
    pathname,
    href: "https://" + hostname + pathname +
      "?id=R-IND-SQL-0005&email=foo@example.com#answer"
  };
  const window = {location, dataLayer: []};
  const code = enabled ? script.replace(
    'const GA4_MEASUREMENT_ID = "";',
    'const GA4_MEASUREMENT_ID = "G-TEST123456";'
  ) : script;

  runInNewContext(code, {
    window, document, URL, Date, Set, encodeURIComponent
  });
  return {
    tags,
    listeners,
    calls: window.dataLayer.map(args => Array.from(args))
  };
}

test("all nine production HTML pages load the common GA4 script exactly once", () => {
  for (const page of pages) {
    const html = readFileSync(new URL(page, root), "utf8");
    assert.equal((html.match(/<script defer src="js\/analytics\.js\?v=20261008-1"><\/script>/g) || []).length, 1, page);
    assert.match(html, /<head[\s>][\s\S]*?js\/analytics\.js/);
  }
});

test("without a measurement ID, no Google request or analytics event is made", () => {
  const result = simulate({enabled: false});
  assert.equal(result.tags.length, 0);
  assert.equal(result.calls.length, 0);
});

test("only the live portal domain is measured", () => {
  const result = simulate({hostname: "example.com"});
  assert.equal(result.tags.length, 0);
  assert.equal(result.calls.length, 0);
});

test("config and page view strip query, hash, user identifiers, and referrer query", () => {
  const result = simulate();
  assert.equal(result.tags.length, 1);
  assert.match(result.tags[0].src, /googletagmanager\.com\/gtag\/js\?id=G-TEST123456$/);
  const config = result.calls.find(call => call[0] === "config");
  assert.ok(config);
  assert.equal(config[2].send_page_view, false);
  assert.equal(config[2].allow_google_signals, false);
  assert.equal(config[2].allow_ad_personalization_signals, false);
  const pageViews = result.calls.filter(call => call[0] === "event" && call[1] === "page_view");
  assert.equal(pageViews.length, 1);
  assert.equal(pageViews[0][2].page_location, "https://portal.k-bigdata.kr/practical.html");
  assert.equal(pageViews[0][2].page_referrer, "https://portal.k-bigdata.kr/interview.html");
  assert.doesNotMatch(JSON.stringify(result.calls), /foo@example\.com|R-IND-SQL-0005|student=123/);
});

test("only safe internal pages and known K-BigData services are reported on clicks", () => {
  const result = simulate();
  const click = href => result.listeners.click({
    target: {closest: () => ({href})}
  });
  click("https://portal.k-bigdata.kr/jobs.html?id=foo@example.com");
  click("https://portal.k-bigdata.kr/practical.html#content");
  click("https://apply.k-bigdata.kr/?student=123");
  click("https://unknown.k-bigdata.kr/");
  click("https://jobs.example.com/opening?name=foo@example.com");
  const events = result.calls.filter(call => call[0] === "event" && call[1] !== "page_view");
  assert.equal(events.length, 2);
  assert.equal(events[0][1], "portal_navigation");
  assert.equal(events[0][2].destination_page, "/jobs.html");
  assert.equal(events[1][1], "portal_service_open");
  assert.equal(events[1][2].destination_service, "apply");
  assert.doesNotMatch(JSON.stringify(events), /student|foo@example.com|jobs\.example\.com/);
});

test("unexpected paths are grouped as /other rather than sending sensitive paths", () => {
  const result = simulate({pathname: "/students/20261234/hglee"});
  const pageView = result.calls.find(call => call[1] === "page_view");
  assert.equal(pageView[2].page_location, "https://portal.k-bigdata.kr/other");
});
