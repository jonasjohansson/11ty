// Curtain drag functionality
import { CONFIG } from "./config/constants.js";

export function initCurtain() {
  const island = document.getElementById("island-handle");
  const header = document.getElementById("header");
  const curtain = document.getElementById("about-curtain");
  const strips = document.getElementById("strips");
  const filterDropdown = document.getElementById("filter-dropdown-container");

  let isDragging = false;
  let hasMoved = false;
  let startY = 0;
  let currentPosition = 0; // 0 = closed, aboutHeight = fully open

  // Wait for content to render before calculating height
  let aboutHeight = 0;
  let maxDrag = 0;

  // Disable transition initially
  header.style.transition = "none";

  // Function to calculate and update about height
  function updateAboutHeight() {
    const oldHeight = aboutHeight;
    aboutHeight = curtain.offsetHeight;
    maxDrag = aboutHeight;

    // Update header position based on current state
    if (currentPosition === 0) {
      // Closed state - hide about content above
      header.style.transform = `translateY(-${aboutHeight}px)`;
    } else if (currentPosition === oldHeight) {
      // Was fully open - keep fully open with new height
      currentPosition = aboutHeight;
      header.style.transform = `translateY(0px)`;
    } else {
      // Partially open - maintain relative position
      const openRatio = oldHeight > 0 ? currentPosition / oldHeight : 0;
      currentPosition = openRatio * aboutHeight;
      header.style.transform = `translateY(${currentPosition - aboutHeight}px)`;
    }
  }

  // Use requestAnimationFrame to ensure DOM is fully rendered
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      updateAboutHeight();
    });
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    // Debounce resize events
    clearTimeout(resizeTimeout);

    // Disable transitions immediately
    header.style.transition = "none";

    resizeTimeout = setTimeout(() => {
      updateAboutHeight();
      // Keep transitions disabled - only enable on user interaction
    }, 100);
  });

  // Hover effect removed

  // Handle both mouse and touch events
  island.addEventListener("pointerdown", (e) => {
    isDragging = true;
    hasMoved = false;
    startY = e.clientY - currentPosition;

    // Disable transitions during drag
    header.style.transition = "none";
    island.style.cursor = "grabbing";

    // Prevent iOS pull-to-refresh
    e.preventDefault();
  });

  // Prevent touch scroll when dragging
  island.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 1) {
        // Allow the pointerdown handler to work
        // Don't prevent default here, let pointerdown handle it
      }
    },
    { passive: false }
  );

  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    // Prevent iOS pull-to-refresh during drag
    if (e.cancelable) {
      e.preventDefault();
    }

    const dragDistance = e.clientY - startY;

    // Mark as moved if dragged more than threshold
    if (Math.abs(dragDistance - currentPosition) > CONFIG.DRAG_THRESHOLD) {
      hasMoved = true;
    }

    // Clamp between 0 and maxDrag
    currentPosition = Math.max(0, Math.min(dragDistance, maxDrag));

    // Move header (about + island + filter together)
    header.style.transform = `translateY(${currentPosition - aboutHeight}px)`;

    // Update strips opacity based on curtain position
    updateStripsOpacity();
  });

  // Prevent touch move on body when dragging header
  document.body.addEventListener(
    "touchmove",
    (e) => {
      if (isDragging && e.cancelable) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  window.addEventListener("pointerup", () => {
    if (!isDragging) return;

    isDragging = false;
    island.style.cursor = "grab";

    // If user didn't drag (just clicked), toggle open/closed
    if (!hasMoved) {
      const targetPosition = currentPosition > 0 ? 0 : maxDrag;
      animateCurtain(targetPosition);
    } else {
      // After dragging, disable transition to prevent visual glitches
      header.style.transition = "none";
    }
  });

  // Update strips opacity and filter visibility based on curtain position
  function updateStripsOpacity() {
    const openProgress = currentPosition / maxDrag;
    if (openProgress > 0.5) {
      strips.classList.add("dimmed");
      filterDropdown.classList.add("fade-out");
    } else {
      strips.classList.remove("dimmed");
      filterDropdown.classList.remove("fade-out");
    }
  }

  // Animate curtain to target position
  function animateCurtain(targetPosition) {
    // Enable smooth transition
    header.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    // Update position
    currentPosition = targetPosition;

    // Move header
    header.style.transform = `translateY(${currentPosition - aboutHeight}px)`;

    // Update strips opacity
    updateStripsOpacity();
  }
}

// Auto-initialize
document.addEventListener("DOMContentLoaded", () => {
  initCurtain();
});
