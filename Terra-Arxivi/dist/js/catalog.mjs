import { operators, portrait } from "./operator-model.mjs";
import { openProfile } from "./dossier.mjs";
import { findOperators } from "./catalog-filter.mjs";

let saved = new Set();
try {
  const names = JSON.parse(localStorage.getItem("terra-favorites") || "[]");
  if (Array.isArray(names)) saved = new Set(names);
} catch {}
const search = document.querySelector("#search");
const roles = document.querySelector("#role");
const rarity = document.querySelector("#rarity");
const factions = document.querySelector("#faction");
const server = document.querySelector("#server");
const prevPage = document.querySelector("#prev-page");
const nextPage = document.querySelector("#next-page");
const pageSelectors = document.querySelectorAll(".page-select");
const pageSize = 24;
let page = 1;
const favorites = document.querySelector("#favorites");
const cards = document.querySelector("#cards");
for (const role of [
  ...new Set(operators.map((operator) => operator[1])),
].sort()) {
  roles.add(new Option(role, role));
}
for (const stars of [...new Set(operators.map((operator) => operator[2]))].sort(
  (a, b) => a - b,
)) {
  rarity.add(new Option(stars + " yulduz", stars));
}
for (const faction of [
  ...new Set(operators.map((operator) => operator[3])),
].sort()) {
  factions.add(new Option(faction, faction));
}
function escapeText(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
}
function render() {
  const matches = findOperators({
    search: search.value,
    roleFilter: roles.value,
    starsFilter: rarity.value,
    factionFilter: factions.value,
    serverFilter: server.value,
    onlySaved: favorites.getAttribute("aria-pressed") === "true",
    saved,
  });
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  page = Math.min(page, pages);
  document.querySelector("#results").textContent =
    matches.length + " ta Operator topildi";
  for (const selector of pageSelectors) {
    if (selector.options.length !== pages) {
      selector.replaceChildren(
        ...Array.from({ length: pages }, (_, index) => {
          const number = index + 1;
          return new Option(number + " / " + pages, number);
        }),
      );
    }
    selector.value = String(page);
    selector.disabled = pages === 1;
  }
  prevPage.disabled = page === 1;
  nextPage.disabled = page === pages;
  cards.innerHTML =
    matches
      .slice((page - 1) * pageSize, page * pageSize)
      .map(
        ([name, role, stars, faction, , color]) => `
    <article class="card" style="--accent:${color}">
      <button type="button" class="portrait portrait-button" data-name="${escapeText(name)}" aria-label="${escapeText(name)} dosyesini ochish"><img src="${portrait(name)}" alt="" loading="lazy"></button>
      <div class="card-info">
        <span class="class-name">${role}</span>
        <h3><button class="open-card" data-name="${escapeText(name)}">${escapeText(name)}</button></h3>
        <p class="stars" aria-label="${stars} yulduz">${"★".repeat(stars)}</p>
        <p>${escapeText(faction)}</p>
      </div>
      <button class="heart" data-save="${escapeText(name)}" aria-pressed="${saved.has(name)}" aria-label="${escapeText(name)}ni saqlash">${saved.has(name) ? "♥" : "♡"}</button>
    </article>`,
      )
      .join("") || '<p class="empty">Mos Operator topilmadi.</p>';
}
function firstPage() {
  page = 1;
  render();
}
search.addEventListener("input", firstPage);
[roles, rarity, factions, server].forEach((filter) =>
  filter.addEventListener("change", firstPage),
);
function goToPage(number) {
  page = number;
  render();
  document.querySelector("#operatorlar").scrollIntoView();
}
for (const [button, delta] of [
  [prevPage, -1],
  [nextPage, 1],
]) {
  button.addEventListener("click", () => goToPage(page + delta));
}
for (const selector of pageSelectors) {
  selector.addEventListener("change", () => goToPage(Number(selector.value)));
}
favorites.addEventListener("click", () => {
  favorites.setAttribute(
    "aria-pressed",
    favorites.getAttribute("aria-pressed") !== "true",
  );
  firstPage();
});
cards.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const { name, save } = button.dataset;
  if (save) {
    if (saved.has(save)) saved.delete(save);
    else saved.add(save);
    try {
      localStorage.setItem("terra-favorites", JSON.stringify([...saved]));
    } catch {}
    render();
    (cards.querySelector('[data-save="' + save + '"]') || favorites).focus();
    return;
  }
  openProfile(name);
});
for (const button of document.querySelectorAll("[data-atlas-filter]")) {
  button.addEventListener("click", () => {
    search.value = "";
    roles.value = "";
    rarity.value = "";
    server.value = "";
    factions.value = button.dataset.atlasFilter;
    favorites.setAttribute("aria-pressed", "false");
    firstPage();
    location.hash = "operatorlar";
  });
}

render();
