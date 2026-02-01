function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));

  const next = document.getElementById(id);
  if (!next) return;

  next.classList.add("active");

  // Optional: track what happened
  // localStorage.setItem("lastScreen", id);
}

function onButtonClick(e) {
  const btn = e.target.closest("button[data-next]");
  if (!btn) return;

  const nextId = btn.getAttribute("data-next");
  showScreen(nextId);
}

document.addEventListener("DOMContentLoaded", () => {
  // Click handler for all branching buttons
  document.addEventListener("click", onButtonClick);

  // Optional: restore last screen (comment out if you want always fresh)
  // const last = localStorage.getItem("lastScreen");
  // if (last) showScreen(last);

  // Default screen
  showScreen("screen-start");
});
