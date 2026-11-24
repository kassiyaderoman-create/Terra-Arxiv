const seasons = [
  ["Prelude to Dawn", 8],
  ["Perish in Frost", 8],
  ["Rise from Ember", 10],
];
const tracker = document.querySelector("#tracker");
const timeline = document.querySelector("#anime-timeline");
const milestones = [
  "Amiya va Rhodes Island guruhi Doktorni Chernobogdan olib chiqadi. Safar davomida Reunion bilan to‘qnashuv ularni Lungmenga olib boradi.",
  "Lungmen uchun kurash paytida Amiya FrostNova va uning Yeti otryadi qanday sharoitda jang qilganini ko‘radi.",
  "Ch’en va Rhodes Island Chernobogning asosiy shahar platformasi Lungmenga yetib borishidan oldin halokatning oldini olishga urinadi.",
];
const episodeCount = seasons.reduce((total, [, count]) => total + count, 0);
const reward = document.querySelector("#anime-reward");
const reopenReward = document.querySelector("#reopen-reward");
document.querySelector("#reward-count").textContent =
  seasons.length + " mavsum · " + episodeCount + "/" + episodeCount + " qism";
reopenReward.addEventListener("click", () => reward.showModal());
let watched = [];
try {
  const stored = JSON.parse(localStorage.getItem("terra-watched") || "[]");
  if (Array.isArray(stored))
    watched = [
      ...new Set(
        stored.filter(
          (n) => Number.isInteger(n) && n >= 1 && n <= episodeCount,
        ),
      ),
    ];
} catch {}
let episode = 0;
tracker.innerHTML = seasons
  .map(([title, count], season) => {
    const episodes = Array.from({ length: count }, (_, index) => {
      const number = ++episode;
      return `<label class="episode"><input type="checkbox" value="${number}" ${watched.includes(number) ? "checked" : ""}><span>${index + 1}-qism<small>Umumiy ${number}-qism</small></span><em hidden>Keyingi</em></label>`;
    });
    return `<fieldset data-season id="watch-season-${season + 1}"><legend>${season + 1}-mavsum · ${title}</legend><div class="season-progress"><div class="progress-track"><progress max="${count}" value="0" aria-label="${title} tomosha jarayoni"></progress><i aria-hidden="true"></i></div><span></span></div><div class="episode-grid">${episodes.join("")}</div></fieldset>`;
  })
  .join("");
function updateWatchStatus() {
  const next = Array.from(
    { length: episodeCount },
    (_, index) => index + 1,
  ).find((number) => !watched.includes(number));
  [...tracker.querySelectorAll("[data-season]")].forEach((season, index) => {
    const inputs = [...season.querySelectorAll("input")];
    const count = inputs.filter((input) => input.checked).length;
    season.querySelector("progress").value = count;
    season
      .querySelector(".progress-track")
      .style.setProperty("--watched", (100 * count) / inputs.length + "%");
    season.querySelector(".season-progress span").textContent =
      count + "/" + inputs.length;
    const entry = timeline.children[index];
    const complete = count === inputs.length;
    season.classList.toggle("season-done", complete);
    entry.querySelector("summary").textContent =
      seasons[index][0] +
      (complete ? " · spoyler" : " · " + count + "/" + inputs.length);
    entry.querySelector("p").textContent = complete
      ? milestones[index]
      : "Avval shu mavsumning qolgan qismlarini «ko‘rdim» deb belgilang.";
    for (const input of inputs) {
      const row = input.closest("label");
      const isNext = Number(input.value) === next;
      row.classList.toggle("next-episode", isNext);
      row.querySelector("em").hidden = !isNext;
    }
  });
  reopenReward.hidden = Boolean(next);
  const nextLabel = next
    ? next <= 8
      ? [1, next]
      : next <= 16
        ? [2, next - 8]
        : [3, next - 16]
    : null;
  document.querySelector("#watch-status").textContent =
    watched.length +
    "/" +
    episodeCount +
    " qism ko‘rildi. " +
    (nextLabel
      ? `Davomi — ${nextLabel[0]}-mavsum, ${nextLabel[1]}-qism.`
      : "Uchala mavsum tugatildi!");
}
tracker.addEventListener("change", (event) => {
  const number = Number(event.target.value);
  const wasComplete = watched.length === episodeCount;
  watched = event.target.checked
    ? [...watched, number]
    : watched.filter((item) => item !== number);
  try {
    localStorage.setItem("terra-watched", JSON.stringify(watched));
  } catch {}
  updateWatchStatus();
  if (!wasComplete && watched.length === episodeCount) reward.showModal();
});
timeline.replaceChildren(
  ...seasons.map(() => {
    const entry = document.createElement("details");
    entry.append(
      document.createElement("summary"),
      document.createElement("p"),
    );
    return entry;
  }),
);
updateWatchStatus();
