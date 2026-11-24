import { getTeam } from "./team.mjs?v=share1";
import { startTeamPractice } from "./battle.mjs?v=4";
import { archiveByName, operators, portrait } from "./operator-model.mjs";

const roster = new Map(
  operators.map(([name, role]) => [archiveByName.get(name)?.[0], [name, role]]),
);
roster.delete(undefined);
const shareButton = document.querySelector("#share-team");
const sharePanel = document.querySelector("#team-share-panel");
const shareUrl = document.querySelector("#team-share-url");
const shareStatus = document.querySelector("#share-status");

shareButton.addEventListener("click", async () => {
  const ids = getTeam().map(([name]) => archiveByName.get(name)?.[0]);
  if (!ids.length || ids.some((id) => !id)) return;
  const url = new URL(location.href);
  url.searchParams.set("team", ids.join(","));
  url.hash = "jamoa";
  shareUrl.value = url.href;
  sharePanel.hidden = false;
  shareStatus.textContent = "";
  try {
    await document.defaultView.navigator.clipboard.writeText(url.href);
    shareStatus.textContent = "Jamoa havolasi nusxalandi.";
  } catch {
    shareUrl.focus();
    shareUrl.select();
    shareStatus.textContent = "Havolani belgilangan maydondan nusxala.";
  }
});

const incoming = new URLSearchParams(location.search).get("team");
if (incoming !== null) {
  const ids = incoming.length <= 600 ? incoming.split(",") : [];
  const valid =
    ids.length > 0 &&
    ids.length <= 12 &&
    new Set(ids).size === ids.length &&
    ids.every((id) => roster.has(id));
  if (valid) {
    const team = ids.map((id) => roster.get(id));
    const members = document.querySelector("#shared-members");
    for (const [name, role] of team) {
      const row = document.createElement("li");
      const image = document.createElement("img");
      image.src = portrait(name);
      image.alt = "";
      const label = document.createElement("span");
      label.textContent = name + " · " + role;
      row.append(image, label);
      members.append(row);
    }
    document
      .querySelector("#test-shared-team")
      .addEventListener("click", () => startTeamPractice(team));
    const panel = document.querySelector("#shared-team");
    panel.hidden = false;
    if (location.hash === "#jamoa") panel.scrollIntoView({ block: "nearest" });
  } else {
    document.querySelector("#shared-team-error").hidden = false;
  }
}
