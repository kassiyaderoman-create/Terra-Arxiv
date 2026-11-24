import { portrait } from "./operator-model.mjs";
import { openProfile } from "./dossier.mjs";

const classDescriptions = {
  Vanguard: "Jang boshida DP yig‘ishga yordam beradi.",
  Guard:
    "Yaqin masofada zarar yetkazadi. Ayrimlari uzoqroqdan ham hujum qiladi.",
  Defender: "Yo‘lni to‘sadi va jamoa o‘rniga zarbalarni qabul qiladi.",
  Sniper:
    "Masofadan jismoniy zarar yetkazadi. Marksman tarmog‘i uchuvchilarni ustuvor nishonga oladi.",
  Caster: "Jismoniy zirhi yuqori nishonlarga Arts zarari bilan javob beradi.",
  Medic: "Ittifoqchilarning jonini tiklaydi.",
  Supporter:
    "Tarmog‘iga qarab dushmanni sekinlatadi, ittifoqchilarni kuchaytiradi yoki yordamchi birliklar chaqiradi.",
  Specialist:
    "Itarish, tortish yoki tez qayta joylashtirish kabi maxsus vazifalarni bajaradi.",
};
const classExamples = [
  "Texas",
  "SilverAsh",
  "Hoshiguma",
  "Exusiai",
  "Amiya",
  "Shining",
  "Angelina",
  "Shaw",
];
document.querySelector("#classes").innerHTML = Object.entries(classDescriptions)
  .map(
    ([name, copy], index) =>
      `<div class="class-card"><img src="${portrait(classExamples[index])}" alt="" loading="lazy"><div><strong>${name}</strong><p>${copy}</p></div></div>`,
  )
  .join("");

for (const button of document.querySelectorAll("[data-guide]")) {
  button.addEventListener("click", () => openProfile(button.dataset.guide));
}
