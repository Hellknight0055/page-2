window.addEventListener("error", (event) => {
  console.error(
    "Birthday website animation error:",
    event.error || event.message,
  );
});

const sky = document.getElementById("sky");
const leavesCanvas = document.getElementById("leaves");
const sctx = sky.getContext("2d");
const lctx = leavesCanvas.getContext("2d");

const moon = document.getElementById("moon");
const sun = document.getElementById("sun");
const landscape = document.getElementById("landscape");
const leafWipe = document.getElementById("leaf-wipe");
const childScene = document.getElementById("child-scene");
const eighteenScene = document.getElementById("eighteen-scene");
const presentScene = document.getElementById("present-scene");
const after = document.querySelector(".after");
const currentFrame = document.querySelector(".current-frame");
const intro = document.querySelector(".present-intro");
const letter = document.querySelector(".letter");
const loading = document.getElementById("loading");

let W, H;
let stars = [];
let fallingLeaves = [];
let start = performance.now();

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;

  sky.width = W * dpr;
  sky.height = H * dpr;
  leavesCanvas.width = W * dpr;
  leavesCanvas.height = H * dpr;

  sky.style.width = leavesCanvas.style.width = "100%";
  sky.style.height = leavesCanvas.style.height = "100%";

  sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  lctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  makeStars();
}

window.addEventListener("resize", resize);

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function makeStars() {
  stars = [];
  const count = Math.floor((W * H) / 9000);

  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H * 0.72,
      r: rand(0.35, 1.35),
      a: rand(0.25, 0.95),
      phase: Math.random() * Math.PI * 2,
      speed: rand(0.4, 1.5),
    });
  }
}

function setupLeaves() {
  // Leaves begin attached to the trees. They do not wander.
  // Their first motion is a downward fall from tree-like starting positions.
  fallingLeaves = Array.from({ length: 58 }, () => ({
    x: 0,
    y: 0,
    size: rand(10, 24),
    vx: rand(-0.25, 0.25),
    vy: rand(0.8, 1.7),
    rot: Math.random() * Math.PI * 2,
    vr: rand(-0.018, 0.018),
    phase: Math.random() * Math.PI * 2,
    hue: Math.random(),
    settled: false,
  }));
}

function resetAutumnLeaves() {
  fallingLeaves.forEach((leaf, i) => {
    // Spread starting points over the visible tree canopy areas.
    const treeZones = [
      { x: W * 0.02, w: W * 0.23, y: H * 0.22, h: H * 0.28 },
      { x: W * 0.25, w: W * 0.22, y: H * 0.3, h: H * 0.23 },
      { x: W * 0.58, w: W * 0.23, y: H * 0.23, h: H * 0.27 },
      { x: W * 0.76, w: W * 0.22, y: H * 0.18, h: H * 0.3 },
    ];

    const zone = treeZones[i % treeZones.length];

    leaf.x = zone.x + Math.random() * zone.w;
    leaf.y = zone.y + Math.random() * zone.h;
    leaf.vx = rand(-0.3, 0.3);
    leaf.vy = rand(0.8, 1.8);
    leaf.settled = false;
  });
}

function drawSky(t) {
  sctx.clearRect(0, 0, W, H);

  const e = t - start;

  // Stars appear after the initial black-screen pause.
  if (e >= 2500 && e < 23000) {
    const fadeIn = Math.min(1, (e - 2500) / 1800);

    for (const st of stars) {
      const twinkle = st.a + Math.sin(t * 0.001 * st.speed + st.phase) * 0.18;

      sctx.beginPath();
      sctx.fillStyle = `rgba(255,255,255,${Math.max(0.05, twinkle) * fadeIn})`;
      sctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      sctx.fill();
    }
  }
}

function drawLeaf(ctx, x, y, size, rot, alpha, hue = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;

  const grad = ctx.createLinearGradient(-size, -size, size, size);
  grad.addColorStop(0, hue > 0.5 ? "#e3c44f" : "#d69e34");
  grad.addColorStop(1, hue > 0.5 ? "#a97927" : "#80551f");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 1.1, -size * 0.25, 0, size);
  ctx.quadraticCurveTo(-size * 0.75, size * 0.15, 0, -size);
  ctx.fill();

  ctx.strokeStyle = "rgba(65,45,20,.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.75);
  ctx.lineTo(0, size * 0.65);
  ctx.stroke();

  ctx.restore();
}

function drawLeaves(t) {
  lctx.clearRect(0, 0, W, H);

  const e = t - start;

  // Autumn begins only after the trees have visibly changed.
  if (e < 33500 || e > 45000) return;

  if (!drawLeaves.started) {
    drawLeaves.started = true;
    resetAutumnLeaves();
  }

  /*
    PHASE 1 — LEAVES FALL FROM THE TREES
    33.5s -> 38.0s

    They travel mostly downward and collect near the ground.
    There is deliberately no sideways wind yet.
  */
  if (e < 38000) {
    const progress = Math.min(1, (e - 33500) / 4500);

    for (const leaf of fallingLeaves) {
      if (!leaf.settled) {
        leaf.x += leaf.vx;
        leaf.y += leaf.vy * (0.5 + progress);
        leaf.rot += leaf.vr;

        // Once a leaf reaches the lower area, let it settle.
        if (leaf.y > H * 0.76 + Math.random() * H * 0.08) {
          leaf.settled = true;
        }
      }

      drawLeaf(lctx, leaf.x, leaf.y, leaf.size, leaf.rot, 0.82, leaf.hue);
    }

    return;
  }

  /*
    PHASE 2 — THE WIND ARRIVES
    38.0s -> 45.0s

    By now the leaves have fallen. The wind gradually becomes stronger,
    pushing the leaves sideways and upward in irregular trajectories.
  */
  const windProgress = Math.min(1, (e - 38000) / 3500);

  for (const leaf of fallingLeaves) {
    leaf.x +=
      leaf.vx +
      (1.1 + windProgress * 2.2) +
      Math.sin(t * 0.0018 + leaf.phase) * (0.8 + windProgress);

    leaf.y +=
      Math.sin(t * 0.002 + leaf.phase) * (0.45 + windProgress * 1.5) -
      windProgress * 0.18;

    leaf.rot += leaf.vr + windProgress * 0.008;

    if (leaf.x > W + 70) {
      leaf.x = -70;
      leaf.y = H * (0.5 + Math.random() * 0.35);
    }

    if (leaf.y < H * 0.25) {
      leaf.y = H * (0.48 + Math.random() * 0.35);
    }

    drawLeaf(lctx, leaf.x, leaf.y, leaf.size, leaf.rot, 0.78, leaf.hue);
  }
}

function ease(p) {
  p = Math.max(0, Math.min(1, p));
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

function setText(el, text, duration = 1000, delay = 0) {
  if (!el) return;

  el.textContent = "";
  el.style.opacity = "1";
  el.classList.add("typewriter");

  let i = 0;

  setTimeout(() => {
    const interval = Math.max(18, duration / Math.max(text.length, 1));

    const timer = setInterval(() => {
      el.textContent += text[i];
      i++;

      if (i >= text.length) {
        clearInterval(timer);
        el.classList.remove("typewriter");
      }
    }, interval);
  }, delay);
}

function typeParagraph(el, html, duration = 1500) {
  // Used for the multi-line present-day text.
  // Characters are revealed sequentially while preserving line breaks.
  if (!el) return;

  const text = el.dataset.originalText || el.innerText;
  el.dataset.originalText = text;
  el.innerHTML = "";
  el.style.opacity = "1";
  el.classList.add("typewriter");

  let i = 0;
  const interval = Math.max(18, duration / Math.max(text.length, 1));

  const timer = setInterval(() => {
    const char = text[i];

    if (char === "\n") {
      el.innerHTML += "<br>";
    } else {
      el.innerHTML += char === " " ? "&nbsp;" : char;
    }

    i++;

    if (i >= text.length) {
      clearInterval(timer);
      el.classList.remove("typewriter");
    }
  }, interval);
}

function animate(t) {
  const e = t - start;

  if (e > 1800) loading.style.opacity = "0";
  drawSky(t);
  drawLeaves(t);

  if (e > 2200) {
    loading.style.opacity = "0";
  }

  /*
    ============================================================
    1. NIGHT
    Moon starts TOP-RIGHT and travels to TOP-LEFT.
    ============================================================
  */
  if (e >= 2500 && e <= 21500) {
    const p = ease((e - 2500) / 19000);

    // Right -> left.
    const x = 88 - 78 * p;

    // A subtle arc: moon rises slightly, then settles.
    const y = 14 - Math.sin(p * Math.PI) * 5;

    moon.style.left = `${x}vw`;
    moon.style.top = `${y}vh`;

    const fadeIn = Math.min(1, (e - 2500) / 1500);
    const fadeOut = e > 20500 ? Math.max(0, (21500 - e) / 1000) : 1;

    moon.style.opacity = String(fadeIn * fadeOut);
    moon.style.transform = `scale(${1 + Math.sin(e * 0.0015) * 0.025})`;
  }

  /*
    ============================================================
    2. SUN
    Sun appears at TOP-RIGHT and DOES NOT MOVE.
    Camera movement starts only after the sun is visible.
    ============================================================
  */
  if (e >= 19000 && e <= 27000) {
    const p = Math.min(1, Math.max(0, (e - 19000) / 2500));

    sun.style.left = "82vw";
    sun.style.top = "12vh";

    // Stay visible until the trees begin appearing, then fade out quickly.
    let opacity = Math.min(1, p);

    if (e >= 22000) {
      opacity *= Math.max(0, 1 - (e - 22000) / 3000);
    }

    sun.style.opacity = String(opacity);
  }

  /*
    ============================================================
    3. CAMERA MOVEMENT
    Starts after the sun has appeared.
    ============================================================
  */
  if (e >= 22000 && e <= 35000) {
    const p = ease((e - 22000) / 13000);

    landscape.style.opacity = String(Math.min(1, p));

    landscape.style.transform = `scale(${1.12 - 0.12 * p}) translateY(${24 - 24 * p}%)`;
  }

  /*
    ============================================================
    4. AUTUMN
    Trees change first. Leaves begin ONLY after this starts.
    ============================================================
  */
  if (e >= 31000 && e < 40000) {
    const p = Math.min(1, (e - 31000) / 9000);

    landscape.style.filter = `saturate(${1 - 0.3 * p}) hue-rotate(${-12 * p}deg)`;
  }

  /*
    ============================================================
    5. SINGLE LEAF WIPES THE CAMERA
    ============================================================
  */
  if (e >= 39500 && e <= 44500) {
    const p = ease((e - 39500) / 5000);

    leafWipe.style.opacity = "1";
    leafWipe.style.transform = `translate(-50%,-50%) scale(${0.05 + 18 * p}) rotate(${20 + 35 * p}deg)`;
  }

  /*
    ============================================================
    6. CHILDHOOD SCENE
    ============================================================
  */
  if (e >= 43500 && e <= 53500) {
    const p = Math.min(1, (e - 43500) / 1200);
    const fadeOut = e > 51500 ? Math.max(0, (53500 - e) / 1500) : 1;

    childScene.style.opacity = String(p * fadeOut);

    if (e >= 44800 && e < 47000 && !childScene.dataset.typed) {
      childScene.dataset.typed = "1";

      const date = childScene.querySelector(".date");
      const copy = childScene.querySelector(".child-copy p");

      setText(date, "16th of September 2008, 10:52 AM", 1100);

      setText(
        copy,
        "An angel was born, beginning a journey filled with kindness, love, and warmth.",
        1900,
        900,
      );
    }
  }

  /*
    ============================================================
    7. AFTER 18 YEARS
    ============================================================
  */
  if (e >= 52000 && e <= 60000) {
    eighteenScene.style.opacity = "1";

    const p = Math.min(1, (e - 52000) / 1000);
    const fadeOut = e > 57500 ? Math.max(0, (60000 - e) / 1200) : 1;

    after.style.opacity = String(p * fadeOut);

    if (e >= 52500 && !after.dataset.typed) {
      after.dataset.typed = "1";
      setText(after, "After 18 years", 1500);
    }
  }

  /*
    ============================================================
    8. PRESENT-DAY SCENE
    ============================================================
  */
  if (e >= 59000) {
    const p = ease(Math.min(1, (e - 59000) / 2500));

    presentScene.style.opacity = String(p);
    eighteenScene.style.opacity = e < 60500 ? "1" : "0";

    /*
      Intro text is typewritten, then disappears.
    */
    if (e >= 61000 && e < 70500) {
      if (!intro.dataset.typed) {
        intro.dataset.typed = "1";
        typeParagraph(intro, intro.innerText, 2600);
      }
    }

    if (e >= 69000 && e < 71000) {
      intro.style.opacity = String(Math.max(0, (71000 - e) / 2000));
    }

    /*
      Photo moves from top-middle to top-left.
    */
    if (e >= 70000) {
      const q = ease(Math.min(1, (e - 70000) / 5000));

      currentFrame.style.left = `${50 - 34 * q}%`;
      currentFrame.style.top = `${38 - 18 * q}%`;
      currentFrame.style.transform = `translate(-50%,-50%) rotate(${-6 * q}deg)`;

      currentFrame.style.width = `${
        Math.min(300, W * 0.27) -
        (Math.min(300, W * 0.27) - Math.min(270, W * 0.23)) * q
      }px`;

      /*
        Final letter appears with typewriter effect.
      */
      if (e >= 74500) {
        letter.style.opacity = "1";

        if (!letter.dataset.typed) {
          letter.dataset.typed = "1";

          const today = letter.querySelector(".today");
          const paragraphs = letter.querySelectorAll("p");

          setText(today, "Today...", 700);

          setText(
            paragraphs[1],
            "That little angel is finally eighteen years old.",
            1500,
            700,
          );

          setText(paragraphs[2], "Happy Birthday, Aaditi. ♥", 1200, 1800);
        }
      }
    }
  }

  requestAnimationFrame(animate);
}

resize();
setupLeaves();
drawLeaves.started = false;
requestAnimationFrame(animate);
