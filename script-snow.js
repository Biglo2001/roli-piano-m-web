const musicToggle = document.getElementById("music-toggle");
const snow = document.getElementById("snow");
const snowflakeCount = 40;

musicToggle.addEventListener("click", () => {
  const muted = musicToggle.getAttribute("aria-pressed") !== "true";

  musicToggle.setAttribute("aria-pressed", String(muted));
  musicToggle.setAttribute("aria-label", muted ? "Unmute piano" : "Mute piano");
  musicToggle.textContent = muted ? "🔇" : "🔊";
  window.dispatchEvent(new CustomEvent("piano-mute-change", {
    detail: { muted }
  }));
});

for (let i = 0; i < snowflakeCount; i++) {
  const flake = document.createElement("span");

  flake.className = "snowflake";
  flake.style.left = `${Math.random() * 100}%`;
  flake.style.width = `${4 + Math.random() * 7}px`;
  flake.style.height = flake.style.width;
  flake.style.opacity = `${0.4 + Math.random() * 0.6}`;
  flake.style.setProperty("--duration", `${10 + Math.random() * 10}s`);
  flake.style.setProperty("--delay", `${Math.random() * -20}s`);

  snow.appendChild(flake);
}
