import { portrait } from "./operator-model.mjs";
import { playMotion } from "./motion.mjs";
import { openProfile } from "./dossier.mjs";

const atlas = {
  "Rhodes Island": {
    position: [21, 56],
    summary:
      "Oripathy bo‘yicha izlanadigan va kasallanganlarga yordam beradigan tashkilot. Uning bazasi harakatlanuvchi kemada joylashgan.",
    faction: "Rhodes Island farmatsevtika tashkiloti",
    links: [["Rhodes Island", "rhodes"]],
    operator: "Amiya",
  },
  Chernobog: {
    position: [66, 38],
    summary:
      "Ursus tarkibidagi ko‘chma shahar. Arknights hikoyasining boshida Doktor shu yerda uyg‘onadi.",
    faction: "Ursus imperiyasi · Reunion harakati",
    links: [
      ["Ursus", "ursus"],
      ["Reunion", "reunion"],
    ],
  },
  Lungmen: {
    position: [81, 51],
    summary: "Terra olamidagi yirik ko‘chma shahar va savdo markazi.",
    faction: "Lungmen Guard Department",
    links: [["Lungmen", "lungmen"]],
    operator: "Hoshiguma",
  },
  Columbia: {
    position: [24, 34],
    summary:
      "Sanoat va texnologiya rivojlangan mamlakat. Rhine Lab shu yerda tadqiqot olib boradi.",
    faction: "Rhine Lab",
    links: [["Columbia", "columbia"]],
    operator: "Saria",
  },
  Kazimierz: {
    position: [44, 37],
    summary:
      "Ritsarlik an’analari va Kazimierz Major musobaqalari bilan tanilgan mamlakat.",
    faction: "Ritsarlar va musobaqalar",
    links: [["Kazimierz", "kazimierz"]],
    operator: "Nearl",
  },
  Ursus: {
    position: [66, 23],
    summary:
      "Chernobog joylashgan yirik imperiya. Kasallanganlarga ta’qib kuchli bo‘lgan hududlardan biri.",
    faction: "Ursus imperiyasi",
    links: [["Ursus", "ursus"]],
  },
  Siracusa: {
    position: [59, 55],
    summary:
      "Shaharlar va famiglie deb ataladigan oilalar ta’siri kuchli bo‘lgan mamlakat.",
    faction: "Siracusa oilalari",
    links: [["Siracusa", "siracusa"]],
    operator: "Lappland",
  },
};

const selector = document.querySelector("#atlas-select");
const map = document.querySelector(".map");
const pins = document.querySelector("#atlas-pins");
const operatorPanel = document.querySelector("#atlas-operator");
const illustration = document.querySelector("#atlas-image");
const caption = document.querySelector("#atlas-caption");

function showPlace(name) {
  const entry = atlas[name];
  if (!entry) return;
  const changed = document.querySelector("#place-name").textContent !== name;
  selector.value = name;
  for (const pin of pins.children)
    pin.setAttribute("aria-pressed", String(pin.dataset.place === name));

  document.querySelector("#place-name").textContent = name;
  document.querySelector("#place-info").textContent = entry.summary;
  document.querySelector("#atlas-faction").textContent = entry.faction;
  illustration.src = entry.operator
    ? portrait(entry.operator)
    : "editorial/terra-city.webp";
  illustration.alt = entry.operator || "Ko‘chma shahar fan-illyustratsiyasi";
  illustration.classList.toggle("atlas-character", Boolean(entry.operator));
  caption.textContent = entry.operator
    ? "Bog‘liq Operator · " + entry.operator
    : "Ko‘chma shahar · fan-illyustratsiya";

  document.querySelector("#atlas-links").replaceChildren(
    ...entry.links.map(([label, slug]) => {
      const link = document.createElement("a");
      link.className = "secondary";
      link.href = "terra.html?entry=" + slug;
      link.textContent = label + " maqolasi";
      return link;
    }),
  );
  if (changed) {
    map.style.setProperty("--atlas-x", entry.position[0] + "%");
    map.style.setProperty("--atlas-y", entry.position[1] + "%");
    map.classList.add("atlas-zoom");
    for (const layer of [map.querySelector("svg"), pins])
      playMotion(layer, [{ scale: 1 }, { scale: 1.13 }], 420);
    const selectedPin = pins.querySelector('[aria-pressed="true"]');
    playMotion(
      selectedPin,
      [
        { boxShadow: "0 0 0 8px #ff837781" },
        { boxShadow: "0 0 0 15px #ff837700" },
      ],
      430,
    );
    for (const element of [
      illustration,
      caption,
      document.querySelector("#place-info"),
    ]) {
      playMotion(
        element,
        [
          { opacity: 0.35, transform: "translateY(4px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        290,
      );
    }
  }
  operatorPanel.replaceChildren();
  if (entry.operator) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.dataset.operator = entry.operator;
    button.textContent = entry.operator + " dosyesi";
    button.addEventListener("click", () => openProfile(entry.operator));
    operatorPanel.append(button);
  }
}

for (const [
  name,
  {
    position: [x, y],
  },
] of Object.entries(atlas)) {
  selector.add(new Option(name, name));
  const pin = document.createElement("button");
  pin.className = "pin atlas-pin";
  pin.type = "button";
  pin.dataset.place = name;
  pin.style.setProperty("--pin-x", x + "%");
  pin.style.setProperty("--pin-y", y + "%");
  pin.textContent = name;
  pin.addEventListener("click", () => showPlace(name));
  pins.append(pin);
}
selector.addEventListener("change", () => showPlace(selector.value));
showPlace("Rhodes Island");
