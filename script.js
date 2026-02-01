const VALENTINE_SCREEN = "valentine-screen"
const STINKY_SCREEN = "stinky-screen"

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));

  const next = document.getElementById(id);
  if (!next) return;

  next.classList.add("active");

  // Confetti whenever we land on the "yes" screen
  if (id === "screen-yes") {
    confettiBurst(160);
  }

  // Optional: track what happened
  // localStorage.setItem("lastScreen", id);
}

function evaluateName() {
  const inputElement = document.getElementById("name-input");
  const name = inputElement.value;
  const normalizedName = name.toLowerCase()

  if (normalizedName == "peyton" || normalizedName == "peyton morris" || normalizedName == "peyton grace" || normalizedName == "peyton grace morris") {
    // ask peyton to be my valentine
    showScreen(VALENTINE_SCREEN)
  } else {
    // tell this random chick that isn't my girlfriend she's stinky
    showScreen(STINKY_SCREEN)
  }
}

function onButtonClick(e) {
  const btn = e.target.closest("button[data-next]");
  if (!btn) return;

  //check for emoji-burst attribute 
  if (btn.dataset.burst === "sad") {
    emojiBurst({
      emojis: ["😢", "😭", "😞", "😔"],
      count: 70,
      originEl: btn,
      spread: Math.PI * 2,  // full circle
      gravity: 0.20,
      durationMs: 1400
    });
  }

  if (btn.dataset.burst === "heart") {
    emojiBurst({
      emojis: ["🥰","💖","😍"],
      count: 70,
      originEl: btn,
      spread: Math.PI * 2,  // full circle
      gravity: 0.20,
      durationMs: 1400
    });
  }
  const nextId = btn.getAttribute("data-next");
  showScreen(nextId);
}

//Emoji Burst function
function emojiBurst({
  emojis = ["😢"],
  count = 60,
  originEl = null,
  originX = null,
  originY = null,
  spread = Math.PI * 2,
  gravity = 0.22,
  durationMs = 1300
} = {}) {
  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas"; // reuse your existing canvas CSS
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;

  function resize() {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  const fontStack =
    'system-ui, -apple-system, "Segoe UI", Roboto, Arial, ' +
    '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

  document.body.appendChild(canvas);
  window.addEventListener("resize", resize);

  // If an element is provided, burst from its center.
  if (originEl) {
    const r = originEl.getBoundingClientRect();
    originX = r.left + r.width / 2;
    originY = r.top + r.height / 2;
  } else {
    // Fallback: center-ish
    originX = originX ?? window.innerWidth * 0.5;
    originY = originY ?? window.innerHeight * 0.35;
  }

  // Particles
  const pieces = Array.from({ length: count }, () => {
    // Radiate outward: choose an angle in a spread (default full circle)
    const a = (Math.random() - 0.5) * spread;
    const angle = a; // centered around 0; you can offset if you want a direction
    const speed = 5 + Math.random() * 7;

    const size = 18 + Math.random() * 18; // emoji font px
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.0,
      vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 1.0,
      g: gravity + Math.random() * 0.06,
      size,
      rot: (Math.random() - 0.5) * 0.8,      // slight tilt
      vr: (Math.random() - 0.5) * 0.06,      // rotation speed
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    };
  });

  const start = performance.now();

  function tick(t) {
    const elapsed = t - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Fade out near the end
    const fade = Math.max(0, 1 - elapsed / durationMs);
    ctx.globalAlpha = Math.min(1, fade + 0.15);

    for (const p of pieces) {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      ctx.font = `${p.size}px ${fontStack}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    }

    if (elapsed < durationMs) {
      requestAnimationFrame(tick);
    } else {
      ctx.globalAlpha = 1;
      window.removeEventListener("resize", resize);
      canvas.remove();
    }
  }

  requestAnimationFrame(tick);
}

// ---------------------------
// "No" button scoot-away logic
// ---------------------------
function setupNoButtonDodge() {
  const noBtn = document.getElementById("btn-no");
  const area = document.getElementById("choice-area");
  if (!noBtn || !area) return;

  let dx = 0, dy = 0;
  let dodges = 0;
  const MAX_DODGES = 999; // set e.g. 8 if you eventually want it clickable

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function moveNoButtonAway(pointerX, pointerY) {
    if (dodges >= MAX_DODGES) return;

    const areaRect = area.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    // Button center
    const bx = btnRect.left + btnRect.width / 2;
    const by = btnRect.top + btnRect.height / 2;

    // Pointer distance to button center
    const dist = Math.hypot(pointerX - bx, pointerY - by);

    // Trigger distance: when pointer comes "close enough"
    const TRIGGER = 120;

    if (dist < TRIGGER) {
      dodges++;

      // Direction away from pointer (normalized)
      let vx = bx - pointerX;
      let vy = by - pointerY;
      const mag = Math.hypot(vx, vy) || 1;
      vx /= mag;
      vy /= mag;

      // Add randomness so it feels playful
      const kick = 90 + Math.random() * 80; // pixels
      const jitterX = (Math.random() - 0.5) * 40;
      const jitterY = (Math.random() - 0.5) * 40;

      dx += vx * kick + jitterX;
      dy += vy * kick + jitterY;

      // Constrain movement so it stays inside the button area
      // Compute max translate allowed within area bounds
      const leftBound   = areaRect.left - btnRect.left + 6;
      const rightBound  = areaRect.right - btnRect.right - 6;
      const topBound    = areaRect.top - btnRect.top + 6;
      const bottomBound = areaRect.bottom - btnRect.bottom - 6;

      dx = clamp(dx, leftBound, rightBound);
      dy = clamp(dy, topBound, bottomBound);

      noBtn.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  }

  // Desktop: dodge when cursor moves in the choice area
  area.addEventListener("mousemove", (e) => {
    moveNoButtonAway(e.clientX, e.clientY);
  });

  // Mobile: dodge on touch/pointer down near it
  area.addEventListener("pointerdown", (e) => {
    // If they try to tap "No", scoot immediately
    moveNoButtonAway(e.clientX, e.clientY);
  });

  // Optional: if mouse enters the button, scoot instantly
  noBtn.addEventListener("mouseenter", (e) => {
    moveNoButtonAway(e.clientX, e.clientY);
  });
}

// ---------------------------
// Confetti (lightweight canvas burst)
// ---------------------------
function confettiBurst(count = 140) {
  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  document.body.appendChild(canvas);

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  // Confetti originates near the top center-ish
  const originX = W() * 0.5;
  const originY = H() * 0.25;

  const colors = [
    "#ff4d88", "#ffb703", "#8ecae6", "#8338ec", "#fb5607", "#3a86ff", "#06d6a0"
  ];

  const pieces = Array.from({ length: count }, () => {
    const angle = (Math.random() * Math.PI) - (Math.PI / 2); // mostly upward spread
    const speed = 6 + Math.random() * 8;

    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
      vy: Math.sin(angle) * speed - (Math.random() * 6), // upward bias
      g: 0.22 + Math.random() * 0.12, // gravity
      r: 3 + Math.random() * 4, // size
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2, // rotation speed
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 60 + Math.random() * 40 // frames
    };
  });

  let frame = 0;
  const maxFrames = 140; // ~2.3s at 60fps

  function tick() {
    frame++;
    ctx.clearRect(0, 0, W(), H());

    for (const p of pieces) {
      if (p.life <= 0) continue;

      p.life--;
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r, p.r * 2.2, p.r * 1.3);
      ctx.restore();
    }

    if (frame < maxFrames) {
      requestAnimationFrame(tick);
    } else {
      window.removeEventListener("resize", resize);
      canvas.remove();
    }
  }

  requestAnimationFrame(tick);
}

document.addEventListener("DOMContentLoaded", () => {
  // Click handler for all branching buttons
  document.addEventListener("click", onButtonClick);

  // Optional: restore last screen (comment out if you want always fresh)
  // const last = localStorage.getItem("lastScreen");
  // if (last) showScreen(last);
  
  //Set up the dodging 'No' button
  setupNoButtonDodge();
  // Default screen
  showScreen("screen-start");
});
