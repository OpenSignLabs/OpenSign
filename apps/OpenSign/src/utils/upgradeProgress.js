let intervalId;

export function showUpgradeProgress() {
  if (document.getElementById("upgrade-progress")) return;

  const overlay = document.createElement("div");
  overlay.id = "upgrade-progress";
  Object.assign(overlay.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(255,255,255,0.9)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  });

  const text = document.createElement("div");
  text.textContent = "Applying update...";
  text.style.marginBottom = "0.5rem";

  const progress = document.createElement("progress");
  progress.max = 100;
  progress.value = 0;
  progress.style.width = "60%";

  overlay.appendChild(text);
  overlay.appendChild(progress);
  document.body.appendChild(overlay);

  intervalId = setInterval(() => {
    progress.value = (progress.value + 5) % 100;
  }, 100);
}

export function hideUpgradeProgress() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  const overlay = document.getElementById("upgrade-progress");
  if (overlay) {
    overlay.remove();
  }
}
