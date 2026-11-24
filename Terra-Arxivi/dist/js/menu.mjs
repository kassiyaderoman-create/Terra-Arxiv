const menuToggle = document.querySelector("#menu-toggle");
const siteNav = document.querySelector("#site-nav");
document.documentElement.classList.add("has-menu");
function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
}
menuToggle.addEventListener("click", () =>
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true"),
);
siteNav.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link || menuToggle.getAttribute("aria-expanded") !== "true") return;
  setMenu(false);
  if (
    link.hash &&
    link.origin === location.origin &&
    link.pathname === location.pathname
  ) {
    const destination = document.getElementById(link.hash.slice(1));
    if (destination) {
      destination.tabIndex = -1;
      destination.focus({ preventScroll: true });
      destination.removeAttribute("tabindex");
    }
  }
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuToggle.getAttribute("aria-expanded") === "true"
  ) {
    setMenu(false);
    menuToggle.focus();
  }
});
