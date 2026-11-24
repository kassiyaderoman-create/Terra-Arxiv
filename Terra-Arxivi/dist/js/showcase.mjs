import { motionAllowed, playMotion } from "./motion.mjs";

const hero = document.querySelector(".hero");
let frame = 0;
function queueParallax(x, y) {
  if (frame) cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    frame = 0;
    hero.style.setProperty("--hero-x", x + "px");
    hero.style.setProperty("--hero-y", y + "px");
  });
}
hero.addEventListener("pointermove", (event) => {
  if (!motionAllowed() || event.pointerType !== "mouse") return;
  const bounds = hero.getBoundingClientRect();
  queueParallax(
    ((event.clientX - bounds.left) / bounds.width - 0.5) * 38,
    ((event.clientY - bounds.top) / bounds.height - 0.5) * 22,
  );
});
hero.addEventListener("pointerleave", () => {
  if (motionAllowed()) queueParallax(0, 0);
});
document.defaultView.addEventListener(
  "scroll",
  () => {
    if (!motionAllowed() || !matchMedia("(hover: none)").matches) return;
    const bounds = hero.getBoundingClientRect();
    if (bounds.bottom > 0)
      queueParallax(0, Math.min(32, Math.max(0, -bounds.top) * 0.1));
  },
  { passive: true },
);

export function flyToTeam() {
  if (
    !motionAllowed() ||
    typeof HTMLElement.prototype.showPopover !== "function"
  )
    return;
  const source = document.querySelector("#detail-image");
  const count = document.querySelector("#team-count");
  const link = document.querySelector('#site-nav a[href="#jamoa"]');
  const menu = document.querySelector("#menu-toggle");
  const onScreen = (bounds) =>
    bounds.width > 0 && bounds.top >= 0 && bounds.bottom <= innerHeight;
  const target = [count, link, menu]
    .map((node) => node.getBoundingClientRect())
    .find(onScreen);
  const start = source.getBoundingClientRect();
  if (!target || !start.width) return;

  const ghost = document.createElement("img");
  ghost.className = "team-flight";
  ghost.src = source.src;
  ghost.alt = "";
  ghost.setAttribute("popover", "manual");
  ghost.setAttribute("aria-hidden", "true");
  const x = start.left + start.width / 2;
  const y = Math.max(40, start.top + start.height / 2);
  ghost.style.left = x - 32 + "px";
  ghost.style.top = y - 40 + "px";
  document.body.append(ghost);
  ghost.showPopover();
  const animation = playMotion(
    ghost,
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      {
        transform: `translate(${target.left + target.width / 2 - x}px, ${target.top + target.height / 2 - y}px) scale(.25)`,
        opacity: 0,
      },
    ],
    620,
  );
  if (animation) {
    animation.onfinish = () => ghost.remove();
    animation.oncancel = () => ghost.remove();
  } else ghost.remove();
}
