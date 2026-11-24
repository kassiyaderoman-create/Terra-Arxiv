import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { JSDOM } from "jsdom";

const html = await readFile(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);
const dom = new JSDOM(html, { url: "https://terra.example/" });
const { window } = dom;
for (const key of ["document", "localStorage", "location", "Option"]) {
  globalThis[key] = window[key];
}
window.HTMLElement.prototype.scrollIntoView = () => {};
window.HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
await import("../dist/js/main.mjs");

const element = (selector) => document.querySelector(selector);
function change(selector, value, event = "change") {
  element(selector).value = value;
  element(selector).dispatchEvent(new window.Event(event, { bubbles: true }));
}

test("catalog search, direct pagination, and reset by filter", () => {
  assert.match(element("#results").textContent, /\d+ ta Operator/);
  change(".page-select", "19");
  assert.equal(document.querySelectorAll(".page-select")[1].value, "19");
  assert.ok(element("#next-page").disabled);
  change("#search", "Kal’tsit", "input");
  assert.ok(element('.portrait-button[data-name="Kal\'tsit"]'));
  assert.equal(element(".page-select").value, "1");
});

test("artwork opens the dossier with the corresponding downloadable file", async () => {
  change("#search", "Amiya", "input");
  element('.portrait-button[data-name="Amiya"]').click();
  assert.ok(element("#details").open);
  assert.equal(element("#detail-name").textContent, "Amiya");
  assert.equal(element("#detail-download").href, element("#detail-image").src);
  assert.equal(element("#detail-download").download, "Amiya.webp");
  const artwork = new URL(element("#detail-download").href).pathname;
  assert.ok(
    (await readFile(new URL("../dist" + artwork, import.meta.url))).length > 0,
  );
  element("#details").open = false;
});

test("anime saves watched episodes and unlocks the 26/26 reward", async () => {
  for (let n = 1; n <= 25; n++) element(`#tracker input[value="${n}"]`).click();
  assert.ok(element("#reopen-reward").hidden);
  element('#tracker input[value="26"]').click();
  assert.match(element("#watch-status").textContent, /26\/26/);
  assert.ok(element("#anime-reward").open);
  assert.equal(JSON.parse(localStorage.getItem("terra-watched")).length, 26);
  element("#anime-reward").open = false;
  element("#tracker").replaceWith(element("#tracker").cloneNode(false));
  element("#reopen-reward").replaceWith(
    element("#reopen-reward").cloneNode(false),
  );
  await import("../dist/js/anime.mjs?reload");
  assert.equal(document.querySelectorAll("#tracker input:checked").length, 26);
  assert.ok(!element("#reopen-reward").hidden);
  assert.ok(!element("#anime-reward").open);
});

test("battle starts, advances, and resets the selected scenario", () => {
  change("#scenario", "rush");
  assert.equal(element("#battle-score").textContent, "0/7");
  element('[data-cell="7"]').click();
  assert.equal(element('[data-cell="7"]').dataset.occupant, "Vanguard");
  element("#turn").click();
  assert.equal(element("#battle-round").textContent, "1");
  element("#reset").click();
  assert.equal(element("#battle-round").textContent, "0");
  assert.equal(element('[data-cell="7"]').dataset.occupant, undefined);
});

test("team builder adds, removes, detects roles and persists the squad", () => {
  for (const name of ["Texas", "Shining", "Kroos"]) {
    change("#team-search", name, "input");
    element(`#team-options [data-team-operator="${name}"]`).click();
  }
  assert.match(element("#team-count").textContent, /3\/12/);
  assert.match(
    element("#team-status").textContent,
    /Vanguard, Medic va Marksman/,
  );
  assert.deepEqual(JSON.parse(localStorage.getItem("terra-team")), [
    "Texas",
    "Shining",
    "Kroos",
  ]);
  element('#team-members [data-team-operator="Texas"]').click();
  assert.match(element("#team-count").textContent, /2\/12/);
  change("#search", "Amiya", "input");
  element('.portrait-button[data-name="Amiya"]').click();
  element("#dossier-team").click();
  assert.ok(element('#team-members [data-team-operator="Amiya"]'));
});

test("saved team enters practice with named Operators and produces a result", () => {
  element("#details").open = false;
  element("#test-team").click();
  assert.equal(location.hash, "#mashq");
  assert.equal(element("#scenario").value, "team");
  assert.deepEqual(
    [...document.querySelectorAll("#units button")].map(
      (button) => button.dataset.unit,
    ),
    ["Shining", "Kroos", "Amiya"],
  );
  element('#units [data-unit="Kroos"]').click();
  element('[data-cell="7"]').click();
  assert.equal(element('[data-cell="7"]').dataset.occupant, undefined);
  element('[data-cell="1"]').click();
  assert.equal(element('[data-cell="1"]').dataset.occupant, "Sniper");
  assert.ok(element('#units [data-unit="Kroos"]').disabled);
  element("#turn").click();
  assert.equal(element("#battle-score").textContent, "1/5");
  element('#units [data-unit="Amiya"]').click();
  element('[data-cell="2"]').click();
  for (let step = 0; step < 12 && !element("#turn").disabled; step++)
    element("#turn").click();
  assert.equal(element("#team-battle-result").hidden, false);
  assert.match(
    element("#team-battle-result").textContent,
    /Masofaviy zarar: [1-9]/,
  );
  element("#reset").click();
  assert.equal(element("#battle-round").textContent, "0");
  assert.equal(element("#team-battle-result").hidden, true);
  assert.equal(element('#units [data-unit="Kroos"]').disabled, false);
  change("#scenario", "base");
  assert.equal(element('#units [data-unit="Kroos"]'), null);
  assert.ok(element('#units [data-unit="Vanguard"]'));
});

test("atlas synchronizes the map and region list and opens Nearl's dossier", () => {
  assert.equal(document.querySelectorAll("#atlas-pins button").length, 7);
  element('[data-place="Kazimierz"]').click();
  assert.equal(element("#atlas-select").value, "Kazimierz");
  assert.equal(element("#place-name").textContent, "Kazimierz");
  assert.equal(element("#atlas-image").alt, "Nearl");
  assert.match(element("#atlas-links a").href, /entry=kazimierz$/);
  element('#atlas-operator [data-operator="Nearl"]').click();
  assert.equal(element("#detail-name").textContent, "Nearl");
  element("#details").open = false;
  change("#atlas-select", "Chernobog");
  assert.equal(
    element('[data-place="Chernobog"]').getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(element("#atlas-operator").childElementCount, 0);
  assert.match(element("#atlas-image").src, /terra-city\.webp$/);
});

test("interaction effects reflect real actions and honor reduced motion", () => {
  let reduced = false;
  const effects = [];
  globalThis.matchMedia = () => ({ matches: !reduced });
  window.HTMLElement.prototype.animate = function () {
    const animation = { cancel() {} };
    effects.push({ element: this, animation });
    return animation;
  };
  try {
    element('[data-place="Kazimierz"]').click();
    assert.ok(effects.some(({ element: node }) => node.id === "atlas-image"));
    change("#scenario", "rush");
    element('[data-cell="7"]').click();
    element("#turn").click();
    assert.ok(element('[data-cell="7"] .battle-move-effect'));
    assert.ok(effects.some(({ element: node }) => node.dataset.cell === "7"));
    for (const { animation } of effects) animation.onfinish?.();
    assert.equal(element(".battle-move-effect"), null);
    reduced = true;
    effects.length = 0;
    element('[data-place="Ursus"]').click();
    element("#turn").click();
    assert.equal(effects.length, 0);
    assert.equal(element(".battle-move-effect"), null);
  } finally {
    delete globalThis.matchMedia;
    delete window.HTMLElement.prototype.animate;
  }
});

test("shared squad opens and runs without replacing personal squad", async () => {
  const saved = localStorage.getItem("terra-team");
  element("#share-team").click();
  const url = new URL(element("#team-share-url").value);
  assert.equal(url.hash, "#jamoa");
  assert.ok(url.searchParams.get("team").includes("char_002_amiya"));
  dom.reconfigure({ url: "https://terra.example/?team=char_002_amiya#jamoa" });
  await import("../dist/js/team-sharing.mjs?incoming");
  assert.equal(element("#shared-team").hidden, false);
  assert.match(element("#shared-members").textContent, /Amiya/);
  element("#test-shared-team").click();
  assert.deepEqual(
    Array.from(
      document.querySelectorAll("#units button"),
      (b) => b.dataset.unit,
    ),
    ["Amiya"],
  );
  assert.equal(localStorage.getItem("terra-team"), saved);
  dom.reconfigure({ url: "https://terra.example/?team=unknown#jamoa" });
  await import("../dist/js/team-sharing.mjs?invalid");
  assert.equal(element("#shared-team-error").hidden, false);
});
