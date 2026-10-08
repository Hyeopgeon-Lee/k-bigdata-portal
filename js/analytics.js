/**
 * K-BigData Portal — GA4 traffic analytics
 *
 * Measurement ID: dedicated GA4 Web data stream for the student portal.
 * Only portal.k-bigdata.kr is measured.
 * No query strings, hashes, names, student IDs, search terms, or form data
 * are included in our page-view or navigation events.
 */
(() => {
  "use strict";

  const GA4_MEASUREMENT_ID = "G-8PMMKFNRY7";
  const PORTAL_HOST = "portal.k-bigdata.kr";
  const SUBDOMAIN_SERVICES = new Set([
    "apply", "ready", "room", "help", "alumni", "ai", "prof"
  ]);

  if (!/^G-[A-Z0-9]{6,}$/i.test(GA4_MEASUREMENT_ID)) return;
  if (window.location.hostname.toLowerCase() !== PORTAL_HOST) return;

  // Only simple static page names are allowed; URL queries and hashes are
  // intentionally discarded even on pages that use them for question IDs.
  function pagePath(pathname) {
    if (pathname === "/" || pathname === "/index.html") return "/index.html";
    return /^\/[a-z0-9-]+\.html$/i.test(pathname) ? pathname : "/other";
  }

  const currentPage = pagePath(window.location.pathname);
  const safeLocation = window.location.origin + currentPage;

  function safeReferrer(value) {
    if (!value) return "";
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" && url.protocol !== "http:") return "";
      if (url.hostname === PORTAL_HOST) {
        return url.origin + pagePath(url.pathname);
      }
      // Retain only the external site's origin, never its query or path.
      return url.origin;
    } catch {
      return "";
    }
  }

  const referrer = safeReferrer(document.referrer);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  const gtag = window.gtag;

  // Load the official Google tag after the local configuration is validated.
  const tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://www.googletagmanager.com/gtag/js?id=" +
    encodeURIComponent(GA4_MEASUREMENT_ID);
  document.head.appendChild(tag);

  gtag("js", new Date());
  gtag("config", GA4_MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: safeLocation,
    page_referrer: referrer,
    page_title: document.title
  });

  // Send all portal events only to the dedicated student GA4 stream.
  // Exactly one explicitly sanitized page_view per full page load.
  gtag("event", "page_view", {
    send_to: GA4_MEASUREMENT_ID,
    page_location: safeLocation,
    page_referrer: referrer,
    page_title: document.title
  });

  // Aggregate menu/service usage without collecting link text, job URLs,
  // query parameters, search text, user identities, or form submissions.
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!target || typeof target.closest !== "function") return;
    const link = target.closest("a[href]");
    if (!link) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return;

    if (url.hostname === PORTAL_HOST) {
      const destination = pagePath(url.pathname);
      if (destination === "/other") return;
      if (destination === currentPage) return; // same-page or anchor navigation
      gtag("event", "portal_navigation", {
        send_to: GA4_MEASUREMENT_ID,
        destination_page: destination
      });
      return;
    }

    if (url.hostname.endsWith(".k-bigdata.kr")) {
      const service = url.hostname.slice(0, -".k-bigdata.kr".length);
      if (SUBDOMAIN_SERVICES.has(service)) {
        gtag("event", "portal_service_open", {
          send_to: GA4_MEASUREMENT_ID,
          destination_service: service
        });
      }
    }
  }, { passive: true });
})();
