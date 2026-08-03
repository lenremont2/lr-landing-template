function initializeLanding() {
  const root = document.querySelector("#hop-landing");

  if (!(root instanceof HTMLElement) || root.dataset.lrInitialized === "true") {
    return;
  }

  root.dataset.lrInitialized = "true";

  const status = root.querySelector("[data-lr-starter-status]");
  if (status) {
    status.textContent = "JavaScript подключён";
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeLanding, {
    once: true,
  });
} else {
  initializeLanding();
}
