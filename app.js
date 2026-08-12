const frameCount = 251;

const canvas = document.getElementById("animationCanvas");
const context = canvas.getContext("2d");

const images = [];

let currentFrame = 0;
let targetFrame = 0;
let animationFrameId = null;

// All portfolio sections
const scenes = Array.from(
  document.querySelectorAll(".portfolio-scene")
);


// ======================================================
// CANVAS SETUP
// ======================================================

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  renderFrame(Math.round(currentFrame));
}


// ======================================================
// DRAW IMAGE AS COVER
// ======================================================

function drawCover(img) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const imageWidth = img.naturalWidth;
  const imageHeight = img.naturalHeight;

  if (!imageWidth || !imageHeight) {
    return;
  }

  const scale = Math.max(
    width / imageWidth,
    height / imageHeight
  );

  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;

  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  context.clearRect(0, 0, width, height);

  context.drawImage(
    img,
    x,
    y,
    drawWidth,
    drawHeight
  );
}


// ======================================================
// RENDER FRAME
// ======================================================

function renderFrame(frameIndex) {
  frameIndex = Math.max(
    0,
    Math.min(frameCount - 1, frameIndex)
  );

  const image = images[frameIndex];

  if (
    !image ||
    !image.complete ||
    image.naturalWidth === 0
  ) {
    return;
  }

  drawCover(image);
}


// ======================================================
// PRELOAD ALL ENHANCED FRAMES
// ======================================================

function preloadImages() {
  for (let i = 1; i <= frameCount; i++) {

    const image = new Image();

    image.src =
  `${import.meta.env.BASE_URL}frames-webp/ezgif-frame-${String(i).padStart(3, "0")}.webp`;

    image.onload = () => {

      console.log(
        `Enhanced frame ${i} loaded`
      );

      if (i === 1) {
        renderFrame(0);
      }
    };

    image.onerror = () => {

      console.error(
        `Could not load enhanced frame ${i}: ${image.src}`
      );

    };

    images.push(image);
  }
}


// ======================================================
// PORTFOLIO SCENE CHOREOGRAPHY
// ======================================================

function updatePortfolioScenes(progress) {

  if (!scenes.length) {
    return;
  }

  const sceneCount = scenes.length;

  /*
    Convert complete scroll progress
    into current scene position.

    Example:

    0.00 → Scene 1
    0.10 → Scene 2
    0.20 → Scene 3
    ...
    1.00 → Final Scene
  */

  const scenePosition =
    progress * sceneCount;

  scenes.forEach((scene, index) => {

    /*
      Each scene occupies approximately
      one portion of the total scroll.
    */

    const sceneStart = index;
    const sceneProgress =
      scenePosition - sceneStart;

    /*
      Distance from the current scene.
    */

    const distance =
      Math.abs(sceneProgress - 0.5);

    /*
      Scene becomes visible around
      its own scroll area.
    */

    const isActive =
      sceneProgress > -0.15 &&
      sceneProgress < 1.15;

    if (isActive) {

      scene.classList.add("active");

    } else {

      scene.classList.remove("active");

    }


    // ==========================================
    // CINEMATIC MOVEMENT
    // ==========================================

    if (sceneProgress >= 0 && sceneProgress <= 1) {

      /*
        0 → beginning
        0.5 → center
        1 → ending
      */

      const localProgress =
        Math.max(
          0,
          Math.min(1, sceneProgress)
        );


      // ------------------------------------------
      // ENTER / EXIT
      // ------------------------------------------

      let opacity = 1;

      if (localProgress < 0.18) {

        opacity =
          localProgress / 0.18;

      } else if (localProgress > 0.82) {

        opacity =
          (1 - localProgress) / 0.18;

      }

      opacity =
        Math.max(
          0,
          Math.min(1, opacity)
        );


      // ------------------------------------------
      // CINEMATIC DEPTH
      // ------------------------------------------

      const depth =
        Math.sin(localProgress * Math.PI) * 35;


      // ------------------------------------------
      // SLIGHT VERTICAL MOTION
      // ------------------------------------------

      const vertical =
        (localProgress - 0.5) * -35;


      // ------------------------------------------
      // APPLY SCENE MOTION
      // ------------------------------------------

      scene.style.opacity = opacity;

      scene.style.transform = `
        translate3d(
          0px,
          ${vertical}px,
          ${depth}px
        )
        scale(
          ${0.97 + Math.sin(localProgress * Math.PI) * 0.03}
        )
      `;

    }

  });
}


// ======================================================
// SMOOTH FRAME ANIMATION
// ======================================================

function animate() {

  const difference =
    targetFrame - currentFrame;


  if (Math.abs(difference) < 0.05) {

    currentFrame =
      targetFrame;

  } else {

    currentFrame +=
      difference * 0.15;

  }


  // Render animation frame
  renderFrame(
    Math.round(currentFrame)
  );


  // Calculate complete scroll progress
  const progress =
    currentFrame /
    (frameCount - 1);


  // Update portfolio content
  updatePortfolioScenes(progress);


  if (
    Math.abs(
      targetFrame - currentFrame
    ) > 0.05
  ) {

    animationFrameId =
      requestAnimationFrame(
        animate
      );

  } else {

    animationFrameId = null;

  }
}


// ======================================================
// SCROLL → FRAME + PORTFOLIO
// ======================================================

function handleScroll() {

  const scrollTop =
    window.scrollY;


  const maxScroll =
    document.documentElement.scrollHeight -
    window.innerHeight;


  if (maxScroll <= 0) {

    targetFrame = 0;

    updatePortfolioScenes(0);

    return;
  }


  /*
    Convert page scroll
    into animation progress.
  */

  const progress =
    Math.max(
      0,
      Math.min(
        1,
        scrollTop / maxScroll
      )
    );


  /*
    Convert progress
    into one of 251 frames.
  */

  targetFrame =
    progress *
    (frameCount - 1);


  /*
    Update portfolio immediately
    so text follows scrolling.
  */

  updatePortfolioScenes(
    progress
  );


  /*
    Start smooth animation.
  */

  if (!animationFrameId) {

    animationFrameId =
      requestAnimationFrame(
        animate
      );

  }
}


// ======================================================
// EVENTS
// ======================================================

window.addEventListener(
  "scroll",
  handleScroll,
  {
    passive: true
  }
);


window.addEventListener(
  "resize",
  resizeCanvas
);


// ======================================================
// START
// ======================================================

resizeCanvas();

preloadImages();

renderFrame(0);

// Show first scene immediately
updatePortfolioScenes(0);