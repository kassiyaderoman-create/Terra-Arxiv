import { flyToTeam } from "./showcase.mjs";
import { archiveByName, operators, portrait } from "./operator-model.mjs";
import { findOperators } from "./catalog-filter.mjs";

const storageKey = "terra-team";
const limit = 12;
const options = document.querySelector("#team-options");
const members = document.querySelector("#team-members");
const count = document.querySelector("#team-count");
const status = document.querySelector("#team-status");
const search = document.querySelector("#team-search");
const dossierButton = document.querySelector("#dossier-team");
const testTeam = document.querySelector("#test-team");
const roles = new Map(operators.map(([name, role]) => [name, role]));
let team = new Set();
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (Array.isArray(stored))
    team = new Set(stored.filter((name) => roles.has(name)).slice(0, limit));
} catch {}

function teamRow(name, selected) {
  const row = document.createElement("li");
  const image = document.createElement("img");
  image.src = portrait(name);
  image.alt = "";
  image.loading = "lazy";
  const label = document.createElement("span");
  label.textContent = name;
  const role = document.createElement("small");
  role.textContent = roles.get(name);
  label.append(role);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary";
  button.dataset.teamOperator = name;
  button.textContent = selected ? "Olib tashlash" : "Qo‘shish";
  button.setAttribute("aria-label", name + " · " + button.textContent);
  button.disabled = !selected && team.size === limit;
  row.append(image, label, button);
  return row;
}

export function updateDossierTeam(name) {
  dossierButton.dataset.teamOperator = name;
  const selected = team.has(name);
  dossierButton.textContent = selected
    ? "Jamoaga qo‘shildi"
    : "Jamoaga qo‘shish";
  dossierButton.disabled = selected || team.size === limit;
}

function renderOptions() {
  const matches = findOperators({ search: search.value })
    .filter(([name]) => !team.has(name))
    .slice(0, 6);
  options.replaceChildren(...matches.map(([name]) => teamRow(name, false)));
  if (!matches.length) {
    const empty = document.createElement("li");
    empty.textContent = "Mos Operator topilmadi.";
    options.append(empty);
  }
}

export function getTeam() {
  return [...team].map((name) => [name, roles.get(name)]);
}

function renderTeam() {
  testTeam.disabled = team.size === 0;
  document.querySelector("#share-team").disabled = testTeam.disabled;
  document.querySelector("#team-share-panel").hidden = true;
  count.textContent = "Jamoa · " + team.size + "/" + limit;
  members.replaceChildren(...[...team].map((name) => teamRow(name, true)));
  const activeRoles = new Set([...team].map((name) => roles.get(name)));
  const hasMarksman = [...team].some(
    (name) => archiveByName.get(name)?.[11] === "fastshot",
  );
  const hints = [
    !activeRoles.has("Vanguard") && "DP uchun Vanguard",
    !activeRoles.has("Medic") && "davolash uchun Medic",
    !hasMarksman && "dronlarga qarshi Marksman",
  ].filter(Boolean);
  status.textContent = hints.length
    ? "Tarkibda ko‘rib chiqish mumkin — " + hints.join(", ") + "."
    : "Tarkibda Vanguard, Medic va Marksman bor.";
  renderOptions();
  if (dossierButton.dataset.teamOperator)
    updateDossierTeam(dossierButton.dataset.teamOperator);
}

function toggleMember(name) {
  if (!roles.has(name)) return;
  if (team.has(name)) team.delete(name);
  else if (team.size < limit) team.add(name);
  else return;
  try {
    localStorage.setItem(storageKey, JSON.stringify([...team]));
  } catch {}
  renderTeam();
}

for (const list of [options, members]) {
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-team-operator]");
    if (!button) return;
    toggleMember(button.dataset.teamOperator);
    const next = list.querySelector("button:not(:disabled)");
    (next || search).focus();
  });
}
dossierButton.addEventListener("click", () => {
  toggleMember(dossierButton.dataset.teamOperator);
  flyToTeam();
});
search.addEventListener("input", renderOptions);
renderTeam();
