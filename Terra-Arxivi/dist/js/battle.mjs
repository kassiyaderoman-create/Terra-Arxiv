import { motionAllowed, playMotion } from "./motion.mjs";
import { getTeam } from "./team.mjs?v=share1";
import { portrait } from "./operator-model.mjs";

const unitTypes = {
  Vanguard: { cost: 2, hp: 3, damage: 2, icon: "V" },
  Defender: { cost: 3, hp: 6, damage: 1, icon: "D" },
  Medic: { cost: 2, hp: 3, damage: 0, icon: "M" },
};
const teamUnitTypes = {
  ...unitTypes,
  Medic: { ...unitTypes.Medic, range: 1 },
  Guard: { cost: 3, hp: 4, damage: 3, icon: "G" },
  Sniper: { cost: 3, hp: 2, damage: 2, range: 2, icon: "S" },
  Caster: { cost: 4, hp: 2, damage: 3, range: 2, icon: "C" },
  Supporter: { cost: 2, hp: 2, damage: 1, range: 2, icon: "U" },
  Specialist: { cost: 2, hp: 3, damage: 2, icon: "X" },
};
let teamRoster = [];
const inTeamMode = () => scenario.value === "team";
const result = document.querySelector("#team-battle-result");
const scenario = document.querySelector("#scenario");
const scenarios = {
  base: {
    waves: [2, 3, 4, 5, 5],
    dp: 3,
    text: "Asosiy safni joylashtirishni mashq qiling.",
  },
  rush: {
    waves: [2, 2, 3, 3, 4, 4, 5],
    dp: 4,
    text: "Yettilik to‘lqin. Erta DP yig‘ib, zaxira safini tayyorlang.",
  },
  team: {
    waves: [2, 3, 4, 5, 6],
    dp: 6,
    text: "Operatorni tanlang va mos katakka joylashtiring.",
  },
  armor: {
    waves: [4, 5, 6, 7, 8],
    dp: 6,
    text: "Dushmanlarning joni ko‘proq. Medic’ni safga yaqin qo‘ying.",
  },
};
let waves = scenarios.base.waves;
const pathStart = 6;
const pathEnd = 11;
const distance = (a, b) =>
  Math.abs((a % 6) - (b % 6)) + Math.abs(Math.floor(a / 6) - Math.floor(b / 6));
const board = document.querySelector("#board");
const units = document.querySelector("#units");
const turn = document.querySelector("#turn");
const message = document.querySelector("#battle-message");
let battle;
let guided = true;
let lessonIndex = 0;
const lessonToggle = document.querySelector("#lesson-toggle");
const lessonSteps = [
  {
    unit: "Vanguard",
    cell: 7,
    text: "Vanguard’ni kirishdan keyingi yoritilgan katakka qo‘ying. U dushmanni erta to‘sadi va DP yig‘adi.",
  },
  {
    text: "Keyingi yurishni bosing. Vanguard maydonda bo‘lgani uchun 2 DP yig‘asiz.",
  },
  {
    unit: "Medic",
    cell: 1,
    text: "Medic’ni tanlab, Vanguard ustidagi baland katakka qo‘ying. U yonma-yon turgan ittifoqchini davolaydi.",
  },
  {
    text: "Keyingi yurishni bosing. Yana 2 DP yig‘ib, Defender uchun yetarli ochko olasiz.",
  },
  {
    unit: "Defender",
    cell: 8,
    text: "Defender’ni tanlab, Vanguard orqasidagi katakka qo‘ying. U birinchi chiziqdan o‘tgan dushmanni ushlab qoladi.",
  },
];
function currentLesson() {
  return guided ? lessonSteps[lessonIndex] : null;
}

board.innerHTML = Array.from(
  { length: 18 },
  (_, index) =>
    `<button data-cell="${index}" class="cell ${index >= pathStart && index <= pathEnd ? "path" : ""}"></button>`,
).join("");
function renderRoster() {
  const buttons = [...battle.roster].map(([name, unit]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.dataset.unit = name;
    button.textContent = `${name} · ${unit.cost} DP`;
    if (inTeamMode()) {
      const image = document.createElement("img");
      image.src = portrait(name);
      image.alt = "";
      button.prepend(image);
      button.title =
        unit.role + " · " + (unit.range ? "Baland katak" : "Yo‘l katagi");
    }
    return button;
  });
  units.replaceChildren(...buttons);
}
function drawBattle() {
  const step = currentLesson();
  document.querySelector("#lesson-step").textContent = step
    ? `Bosqich ${lessonIndex + 1}/${lessonSteps.length}. ${step.text}`
    : guided
      ? "Joylashtirish tugadi. Keyingi yurishlarni bosib, bazani himoya qiling."
      : inTeamMode()
        ? "Jamoa sinovi. Jang qoidalari sinf bo‘yicha soddalashtirilgan. Har bir Operator bir marta joylashtiriladi."
        : "Erkin mashq. Xohlagan tartibda Operator joylashtiring.";
  lessonToggle.hidden = inTeamMode();
  lessonToggle.textContent = guided
    ? "Erkin mashqqa o‘tish"
    : "Darsni boshlash";
  document.querySelector("#battle-round").textContent = battle.round;
  document.querySelector("#battle-dp").textContent = battle.dp;
  document.querySelector("#battle-life").textContent = battle.lives + "/3";
  document.querySelector("#battle-score").textContent =
    battle.defeated + "/" + waves.length;
  for (const cell of board.children) {
    const index = Number(cell.dataset.cell);
    const unit = battle.units.get(index);
    const enemies = battle.enemies.filter((enemy) => enemy.cell === index);
    const terrain =
      index === pathStart
        ? "Kirish"
        : index === pathEnd
          ? "Himoya nuqtasi"
          : index > pathStart && index < pathEnd
            ? "Yo‘l"
            : "Baland katak";
    const occupant = unit ? `${unit.type}, ${unit.hp} jon` : terrain;
    if (unit) cell.dataset.occupant = battle.roster.get(unit.type).role;
    else delete cell.dataset.occupant;
    cell.style.removeProperty("background-image");
    if (inTeamMode() && unit)
      cell.style.backgroundImage = `linear-gradient(transparent, #1118), url("${portrait(unit.type)}")`;
    cell.textContent = [
      unit
        ? battle.roster.get(unit.type).icon + unit.hp
        : index === pathStart
          ? "Kirish"
          : index === pathEnd
            ? "Baza"
            : "",
      enemies.length ? "●" + enemies.length : "",
    ]
      .filter(Boolean)
      .join(" ");
    if (enemies.length) {
      const health = document.createElement("span");
      health.className = "enemy-health";
      health.setAttribute("aria-hidden", "true");
      const fill = document.createElement("i");
      const max = enemies.reduce((total, enemy) => total + enemy.maxHp, 0);
      const hp = enemies.reduce((total, enemy) => total + enemy.hp, 0);
      fill.style.width = (100 * hp) / max + "%";
      fill.dataset.maxHp = max;
      health.append(fill);
      cell.append(health);
    }
    cell.setAttribute(
      "aria-label",
      `Katak ${index + 1}: ${occupant}${enemies.length ? ", dushman: " + enemies.length : ""}`,
    );
    cell.classList.toggle("occupied", !!unit);
    cell.classList.toggle("enemy", enemies.length > 0);
    cell.classList.toggle("lesson-target", step?.cell === index);
    cell.disabled = battle.finished;
  }
  for (const button of units.children) {
    button.setAttribute(
      "aria-pressed",
      button.dataset.unit === battle.selected,
    );
    button.classList.toggle(
      "lesson-target",
      step?.unit === button.dataset.unit,
    );
    button.disabled = battle.finished || battle.used.has(button.dataset.unit);
  }
  turn.classList.toggle("lesson-target", !!step && !step.unit);
  turn.disabled = battle.finished || !!step?.unit;
}
function resetBattle() {
  lessonIndex = 0;
  const setup = scenarios[scenario.value];
  waves = setup.waves;
  const roster = new Map(
    inTeamMode()
      ? teamRoster.map(([name, role]) => [
          name,
          { ...teamUnitTypes[role], role },
        ])
      : Object.entries(unitTypes).map(([role, unit]) => [
          role,
          { ...unit, role, range: role === "Medic" ? 1 : 0 },
        ]),
  );
  battle = {
    roster,
    used: new Set(),
    rangedDamage: 0,
    healed: 0,
    round: 0,
    dp: setup.dp,
    lives: 3,
    defeated: 0,
    units: new Map(),
    enemies: [],
    selected: roster.keys().next().value,
    finished: false,
  };
  result.hidden = true;
  renderRoster();
  message.textContent = guided
    ? "Vanguard’ni yo‘lga joylashtiring, masalan, kirishdan keyingi katakka."
    : setup.text;
  drawBattle();
}
units.addEventListener("click", (event) => {
  const type = event.target.closest("[data-unit]")?.dataset.unit;
  if (!type) return;
  battle.selected = type;
  drawBattle();
});
board.addEventListener("click", (event) => {
  if (!event.target.matches("[data-cell]") || battle.finished) return;
  const cell = Number(event.target.dataset.cell);
  const type = battle.selected;
  const unit = battle.roster.get(type);
  if (!unit || battle.used.has(type)) return;
  const step = currentLesson();
  if (step && (step.cell !== cell || step.unit !== type)) {
    message.textContent = "Joriy bosqichdagi ko‘rsatmaga amal qiling.";
    return;
  }
  const ground = cell > pathStart && cell < pathEnd;
  if (
    cell === pathStart ||
    cell === pathEnd ||
    ground === Boolean(unit.range)
  ) {
    message.textContent = unit.range
      ? "Bu Operator uchun baland katak tanlang."
      : "Kirish va baza orasidagi yo‘l katagini tanlang.";
    return;
  }
  if (
    battle.units.has(cell) ||
    battle.enemies.some((enemy) => enemy.cell === cell)
  ) {
    message.textContent = "Bu katak band.";
    return;
  }
  if (battle.dp < unit.cost) {
    message.textContent = "DP yetarli emas. Keyingi yurishda DP yig‘ing.";
    return;
  }
  battle.units.set(cell, { type, hp: unit.hp });
  battle.dp -= unit.cost;
  if (inTeamMode()) {
    battle.used.add(type);
    battle.selected = [...battle.roster.keys()].find(
      (name) => !battle.used.has(name),
    );
  }
  if (step) lessonIndex++;
  message.textContent = type + " joylashtirildi.";
  drawBattle();
});
function showBattleMotion(moves, hits, heals) {
  if (!motionAllowed()) return;
  for (const [from, to] of moves) {
    const origin = board.children[from].getBoundingClientRect();
    const target = board.children[to];
    const destination = target.getBoundingClientRect();
    addBattleEffect(
      target,
      "battle-move-effect",
      "●",
      [
        {
          opacity: 1,
          transform: `translate(${origin.x - destination.x}px, ${origin.y - destination.y}px)`,
        },
        { opacity: 0, transform: "translate(0, 0)" },
      ],
      320,
    );
  }
  for (const [index, amount] of hits) {
    const cell = board.children[index];
    const fill = cell.querySelector(".enemy-health i");
    if (fill) {
      const current = fill.style.width;
      const previous =
        Math.min(
          100,
          parseFloat(current) + (100 * amount) / Number(fill.dataset.maxHp),
        ) + "%";
      playMotion(
        fill,
        [
          { width: previous },
          { width: previous, offset: 0.55 },
          { width: current },
        ],
        580,
      );
    }
    playMotion(
      cell,
      [
        { boxShadow: "inset 0 0 0 4px #ff9c78, inset 0 0 35px #ff633db0" },
        { boxShadow: "inset 0 0 0 1px #ff633d00" },
      ],
      340,
      290,
    );
    addBattleEffect(
      cell,
      "battle-damage-effect",
      "−" + amount,
      [
        { opacity: 1, transform: "translateY(10px) scale(1.24)" },
        { opacity: 0, transform: "translateY(-22px) scale(.95)" },
      ],
      620,
      310,
    );
  }
  for (const [index, amount] of heals)
    addBattleEffect(
      board.children[index],
      "battle-heal-effect",
      "+" + amount,
      [
        { opacity: 1, transform: "translateY(4px)" },
        { opacity: 0, transform: "translateY(-20px)" },
      ],
      560,
    );
}

function addBattleEffect(cell, className, text, frames, duration, delay = 0) {
  const effect = document.createElement("span");
  effect.className = className;
  effect.textContent = text;
  effect.setAttribute("aria-hidden", "true");
  cell.append(effect);
  const animation = playMotion(effect, frames, duration, delay);
  if (animation) animation.onfinish = () => effect.remove();
  else effect.remove();
}

turn.addEventListener("click", () => {
  if (battle.finished || currentLesson()?.unit) return;
  if (currentLesson()) lessonIndex++;
  const moves = [];
  const hits = new Map();
  const strike = (enemy, damage) => {
    if (damage > 0)
      hits.set(
        enemy.cell,
        (hits.get(enemy.cell) || 0) + Math.min(damage, enemy.hp),
      );
    enemy.hp -= damage;
  };
  const heals = new Map();
  battle.round++;
  battle.dp +=
    1 +
    Number(
      [...battle.units.values()].some(
        (unit) => battle.roster.get(unit.type).role === "Vanguard",
      ),
    );
  if (battle.round <= waves.length) {
    const hp = waves[battle.round - 1];
    battle.enemies.push({ cell: pathStart, hp, maxHp: hp });
  }
  for (const [cell, medic] of battle.units) {
    if (battle.roster.get(medic.type).role !== "Medic") continue;
    for (const [target, ally] of battle.units) {
      if (distance(cell, target) !== 1) continue;
      const health = Math.min(battle.roster.get(ally.type).hp, ally.hp + 1);
      const restored = health - ally.hp;
      if (restored) heals.set(target, (heals.get(target) || 0) + restored);
      battle.healed += restored;
      ally.hp = health;
    }
  }
  let stopped = 0;
  let escaped = 0;
  for (const enemy of battle.enemies) {
    if (!battle.units.has(enemy.cell)) {
      moves.push([enemy.cell, enemy.cell + 1]);
      enemy.cell++;
    }
    if (enemy.cell === pathEnd) {
      escaped++;
      continue;
    }
    if (!inTeamMode()) {
      const defender = battle.units.get(enemy.cell);
      if (defender) {
        strike(enemy, battle.roster.get(defender.type).damage);
        if (enemy.hp > 0 && --defender.hp <= 0) battle.units.delete(enemy.cell);
      }
    }
  }
  for (const [cell, attacker] of battle.units) {
    const unit = battle.roster.get(attacker.type);
    if (!unit.range || !unit.damage) continue;
    const target = battle.enemies.find(
      (enemy) =>
        enemy.hp > 0 &&
        enemy.cell < pathEnd &&
        distance(cell, enemy.cell) <= unit.range,
    );
    if (!target) continue;
    battle.rangedDamage += Math.min(unit.damage, target.hp);
    strike(target, unit.damage);
  }
  for (const enemy of battle.enemies) {
    if (enemy.cell >= pathEnd) continue;
    const defender = battle.units.get(enemy.cell);
    if (inTeamMode() && defender && enemy.hp > 0) {
      strike(enemy, battle.roster.get(defender.type).damage);
      if (enemy.hp > 0 && --defender.hp <= 0) battle.units.delete(enemy.cell);
    }
    if (enemy.hp <= 0) stopped++;
  }
  battle.enemies = battle.enemies.filter(
    (enemy) => enemy.hp > 0 && enemy.cell < pathEnd,
  );
  battle.defeated += stopped;
  battle.lives = Math.max(0, battle.lives - escaped);
  battle.finished =
    battle.lives === 0 ||
    (battle.round >= waves.length && !battle.enemies.length);
  message.textContent = battle.finished
    ? battle.lives
      ? "Mashq yakunlandi. Himoya nuqtasi saqlandi!"
      : "Himoya nuqtasi boy berildi. Qayta urinib ko‘ring."
    : `${stopped} dushman to‘xtatildi, ${escaped} dushman bazaga yetdi.`;
  if (inTeamMode() && battle.finished) {
    result.hidden = false;
    result.textContent =
      `Natija · ${battle.defeated}/${waves.length} ta dushman to‘xtatildi. Masofaviy zarar: ${battle.rangedDamage}. Tiklangan jon: ${battle.healed}. ` +
      (battle.lives === 0
        ? "Yo‘lga Defender yoki Guard, baland katakka masofaviy Operator qo‘yib ko‘ring."
        : "Baza himoyada qoldi.");
  }
  drawBattle();
  showBattleMotion(moves, hits, heals);
});
lessonToggle.addEventListener("click", () => {
  guided = !guided;
  if (guided) {
    scenario.value = "base";
    resetBattle();
  } else drawBattle();
});
scenario.addEventListener("change", () => {
  guided = scenario.value === "base";
  resetBattle();
});
export function startTeamPractice(snapshot) {
  if (!snapshot.length) return;
  teamRoster = snapshot;
  scenario.querySelector('[value="team"]').hidden = false;
  scenario.value = "team";
  guided = false;
  resetBattle();
  location.hash = "mashq";
  document.querySelector("#mashq").scrollIntoView();
  scenario.focus({ preventScroll: true });
}
document
  .querySelector("#test-team")
  .addEventListener("click", () => startTeamPractice(getTeam()));
document.querySelector("#reset").addEventListener("click", resetBattle);
resetBattle();
