import { updateDossierTeam } from "./team.mjs?v=share1";
import {
  archiveByName,
  operators,
  portrait,
  profiles,
} from "./operator-model.mjs";

const details = document.querySelector("#details");
const relatedProfiles = {
  Amiya: ["Kal'tsit", "Nearl"],
  "Kal'tsit": ["Amiya"],
  Texas: ["Lappland", "Exusiai"],
  Lappland: ["Texas"],
  Hoshiguma: ["Ch'en"],
  "Ch'en": ["Hoshiguma"],
  Nearl: ["Shining", "Amiya"],
};
const related = document.querySelector("#detail-related");
const amiyaStory = document.querySelector("#amiya-story");
related.addEventListener("click", (event) => {
  const button = event.target.closest("[data-related]");
  if (button) openProfile(button.dataset.related);
});
export function openProfile(name) {
  updateDossierTeam(name);
  const [, role, stars, faction, copy] = operators.find(
    (operator) => operator[0] === name,
  );
  document.querySelector("#detail-name").textContent = name;
  document.querySelector("#detail-role").textContent =
    role + " / " + stars + " yulduz / " + faction;
  document.querySelector("#detail-copy").textContent =
    copy || name + " · " + faction;
  const wiki = document.querySelector("#detail-link");
  wiki.href =
    "https://arknights.wiki.gg/wiki/Special:Search?search=" +
    encodeURIComponent(name);
  const image = document.querySelector("#detail-image");
  const artwork = portrait(name);
  image.src = artwork;
  const download = document.querySelector("#detail-download");
  download.href = artwork;
  download.download = name.replace(/[<>:"/\\|?*]/g, "-").trim() + ".webp";
  image.alt = name;
  document.querySelector("#detail-strength").textContent = profiles[name][1];
  document.querySelector("#detail-use").textContent = profiles[name][2];
  const dossier = archiveByName.get(name);
  const stats = document.querySelector("#detail-stats");
  stats.replaceChildren();
  if (dossier) {
    const values = [
      ["Server", dossier[5]],
      ["DP", dossier[6]],
      ["To‘sish", dossier[7]],
      ["HP", dossier[8]],
      ["ATK", dossier[9]],
      ["DEF", dossier[10]],
      [
        "Jang joyi",
        { MELEE: "Yer", RANGED: "Baland katak", ALL: "Har ikkisi" }[
          dossier[12]
        ],
      ],
      ["Dosye kodi", dossier[13]],
    ];
    const [birthplace, birthday, height] = dossier[14] || [];
    const facts = [
      ["Tug‘ilgan joyi", birthplace],
      ["Tug‘ilgan kuni", birthday],
      ["Bo‘yi", height],
    ].filter(([, value]) => value && !/unknown|undisclosed/i.test(value));
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = "O‘yin ma’lumotlari · boshlang‘ich daraja";
    const list = document.createElement("dl");
    for (const [label, value] of [...values, ...facts]) {
      if (value == null || value === "") continue;
      const field = document.createElement("div");
      const term = document.createElement("dt");
      const definition = document.createElement("dd");
      term.textContent = label;
      definition.textContent = value;
      field.append(term, definition);
      list.append(field);
    }
    stats.append(note, list);
  }
  amiyaStory.hidden = name !== "Amiya";
  amiyaStory.querySelector("details").open = false;
  const names = relatedProfiles[name] || [];
  related.hidden = !names.length;
  related.querySelector("div").replaceChildren(
    ...names.map((label) => {
      const button = document.createElement("button");
      button.className = "secondary";
      button.dataset.related = label;
      button.textContent = label;
      return button;
    }),
  );
  if (details.open) {
    details.scrollTop = 0;
    document.querySelector("#detail-name").focus({ preventScroll: true });
  } else {
    details.showModal();
  }
}
