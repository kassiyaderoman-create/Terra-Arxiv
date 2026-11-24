export function motionAllowed() {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: no-preference)").matches
  );
}

const active = new WeakMap();

export function playMotion(element, keyframes, duration, delay = 0) {
  if (!motionAllowed() || typeof element.animate !== "function") return;
  active.get(element)?.cancel();
  const animation = element.animate(keyframes, {
    duration,
    delay,
    easing: "ease-out",
  });
  active.set(element, animation);
  return animation;
}
