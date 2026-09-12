/**
 * Cute Animated Robot Mascot
 * - Bidirectional patrol engine (Left ↔ Right) with physical turnarounds
 * - Left-click backflip somersault (360° backward flip) with happy expression & sparkles
 * - Seamless resume in the same direction from exact coordinates
 * - Global helpers for audit pipeline interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('robot-mascot-container');
  const walker = document.querySelector('.robot-walker');
  const facing = document.getElementById('robot-facing');
  const flipWrapper = document.getElementById('robot-flip-wrapper');
  const character = document.getElementById('robot-character');
  const speechBubble = document.getElementById('robot-speech-bubble');
  const mascotToggleBtn = document.getElementById('mascot-toggle-btn');

  if (!walker || !facing || !flipWrapper || !character || !speechBubble) return;

  // --- State Variables ---
  const robotWidth = 90;
  const paddingEdge = 20;
  const speed = 70; // pixels per second (smooth, natural walking pace)

  let posX = paddingEdge; // Start at bottom-left
  let direction = 1;      // 1 = moving RIGHT, -1 = moving LEFT
  let isWalking = true;
  let isHovered = false;
  let isBackflipping = false;
  let lastTimestamp = null;

  // Set initial classes and position
  walker.classList.add('is-walking');
  walker.style.transform = `translateX(${posX}px)`;

  // --- Boundary Calculation ---
  function getBoundaries() {
    const minX = paddingEdge;
    const maxX = Math.max(minX + 100, window.innerWidth - robotWidth - paddingEdge);
    return { minX, maxX };
  }

  // --- Animation Frame Loop (Bidirectional Movement) ---
  function patrolLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    let dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    // Clamp dt to avoid jumping if the user switches tabs
    if (dt > 0.1) dt = 0.1;

    // Movement updates only when not paused by hover or backflip
    if (!isBackflipping && !isHovered) {
      if (!isWalking) {
        isWalking = true;
        walker.classList.add('is-walking');
        walker.classList.remove('is-paused');
      }

      posX += direction * speed * dt;
      const { minX, maxX } = getBoundaries();

      // Right edge collision -> physically turn around to face left
      if (posX >= maxX && direction === 1) {
        posX = maxX;
        direction = -1;
        facing.classList.add('facing-left');
      }

      // Left edge collision -> physically turn around to face right
      if (posX <= minX && direction === -1) {
        posX = minX;
        direction = 1;
        facing.classList.remove('facing-left');
      }

      walker.style.transform = `translateX(${posX}px)`;
    } else {
      // Robot is stationary (hovering or executing backflip)
      if (isWalking) {
        isWalking = false;
        walker.classList.remove('is-walking');
        walker.classList.add('is-paused');
      }
    }

    requestAnimationFrame(patrolLoop);
  }

  // Start the motion loop
  requestAnimationFrame(patrolLoop);

  // --- Backflip Execution Routine ---
  function triggerBackflip() {
    if (isBackflipping) return; // Prevent triggering while already flipping
    isBackflipping = true;

    // 1. Pause walking immediately in-place
    walker.classList.remove('is-walking');
    walker.classList.add('is-paused');

    // 2. Set happy celebratory speech bubble and expression
    speechBubble.classList.add('is-bubble-visible');
    character.classList.add('is-happy');

    // 3. Trigger 360° backward somersault animation
    flipWrapper.classList.add('is-backflipping');

    // Phase 1: Landing at 1.0 second
    setTimeout(() => {
      flipWrapper.classList.remove('is-backflipping');

      // Phase 2: Hold the happy smile for approximately 1.5s after landing
      setTimeout(() => {
        character.classList.remove('is-happy');
        speechBubble.classList.remove('is-bubble-visible');

        // Reset speech bubble text to default greeting
        setTimeout(() => {
          speechBubble.textContent = "Hi! I'm your AI Auditor! 👋";
        }, 300);

        // 4. Seamlessly resume walking in the SAME direction from the exact same position
        isBackflipping = false;
        if (!isHovered) {
          isWalking = true;
          walker.classList.add('is-walking');
          walker.classList.remove('is-paused');
        }
      }, 1500); // 1.5s hold after landing
    }, 1000);   // 1.0s backflip jump duration
  }

  // --- Click & Touch Handlers ---
  // Left Click Only (button === 0)
  character.addEventListener('click', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    speechBubble.textContent = 'Yay! ✨ Watch my flip!';
    triggerBackflip();
  });

  // Mobile Tap / Touch Support
  character.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    speechBubble.textContent = 'Yay! ✨';
    triggerBackflip();
  }, { passive: false });

  // Prevent context menu on mascot right-click
  character.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // --- Hover Interaction (Greeting) ---
  character.addEventListener('mouseenter', () => {
    if (isBackflipping) return;
    isHovered = true;
    speechBubble.textContent = "Hi! I'm your AI Auditor! Click me! 👋";
    speechBubble.classList.add('is-bubble-visible');
  });

  character.addEventListener('mouseleave', () => {
    if (isBackflipping) return;
    isHovered = false;
    speechBubble.classList.remove('is-bubble-visible');
  });

  // Keyboard accessibility (Space or Enter on focused mascot)
  character.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerBackflip();
    }
  });

  // Handle Window Resize (recalculate screen boundaries gracefully)
  window.addEventListener('resize', () => {
    const { minX, maxX } = getBoundaries();
    if (posX > maxX) {
      posX = maxX;
      walker.style.transform = `translateX(${posX}px)`;
    }
  });

  // Mascot Toggle Button
  if (mascotToggleBtn && container) {
    let mascotVisible = true;
    mascotToggleBtn.addEventListener('click', () => {
      mascotVisible = !mascotVisible;
      container.style.display = mascotVisible ? 'block' : 'none';
      const labelSpan = mascotToggleBtn.querySelector('span');
      if (labelSpan) {
        labelSpan.textContent = mascotVisible ? 'Mascot: ON' : 'Mascot: OFF';
      }
    });
  }

  // Global Integration APIs
  window.mascotSay = function(text, duration = 3000) {
    speechBubble.textContent = text;
    speechBubble.classList.add('is-bubble-visible');
    setTimeout(() => {
      if (!isHovered && !isBackflipping) {
        speechBubble.classList.remove('is-bubble-visible');
      }
    }, duration);
  };

  window.mascotCelebrate = function(score) {
    speechBubble.textContent = `Audit Complete! Ready Score: ${score}/100! 🚀`;
    triggerBackflip();
  };
});
