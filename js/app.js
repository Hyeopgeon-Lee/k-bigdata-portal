import { categories, services } from "./services.js";

const icons = {
  clipboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 12l2 2 4-5M9 18h6"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  users: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>',
  wrench: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5l-8.9 8.9a2.1 2.1 0 0 0 3 3l8.8-8.9a4 4 0 0 0 5-5L17 10l-2.4-2.4 2.3-2.3Z"/></svg>'
};

const escapeHTML = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));

function serviceCard(service, index) {
  const tags = service.tags.slice(0, service.featured ? 5 : 4).map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
  return `<a class="service-card accent-${escapeHTML(service.accent)} ${service.featured ? "featured" : ""}" href="${escapeHTML(service.url)}" aria-label="${escapeHTML(service.name)} 서비스로 이동" style="--delay:${index * 70}ms">
    <span class="card-decoration" aria-hidden="true"></span>
    <span class="service-icon">${icons[service.icon] || icons.clipboard}</span>
    <span class="service-meta">${escapeHTML(service.englishName)}</span>
    <h3>${escapeHTML(service.name)}</h3>
    <p>${escapeHTML(service.shortDescription)}</p>
    <span class="service-tags">${tags}</span>
    <span class="card-link">서비스 바로가기 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
  </a>`;
}

const groups = Object.values(categories).map((category) => {
  const categoryServices = services.filter((service) => service.category === category.id).sort((a, b) => a.order - b.order);
  return `<section class="service-group" id="${escapeHTML(category.id)}" aria-labelledby="${escapeHTML(category.id)}-title">
    <div class="group-heading"><div><p>${escapeHTML(category.english)}</p><h2 id="${escapeHTML(category.id)}-title">${escapeHTML(category.label)}</h2></div><p>${escapeHTML(category.description)}</p></div>
    <div class="service-grid ${category.id === "career" ? "career-grid" : "campus-grid"}">${categoryServices.map(serviceCard).join("")}</div>
  </section>`;
}).join("");

const serviceGroups = document.querySelector("#service-groups");
if (serviceGroups) serviceGroups.innerHTML = groups;
document.querySelector("#current-year").textContent = new Date().getFullYear();

const heroIconMap = { ready: "clipboard", apply: "send", alumni: "users", room: "calendar", help: "wrench" };
document.querySelectorAll("[data-hero-icon]").forEach((element) => { element.innerHTML = icons[heroIconMap[element.dataset.heroIcon]]; });

const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } });
}, { threshold: 0.08 }) : null;
document.querySelectorAll(".service-card").forEach((card) => observer ? observer.observe(card) : card.classList.add("is-visible"));
