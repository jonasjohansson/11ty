// Simplified SPA Router - Fetches server-rendered HTML
const projects = window.__PROJECTS_DATA__ || [];
const pathPrefix = window.__PATH_PREFIX__ || "";

class SPARouter {
  constructor() {
    this.currentRoute = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Handle browser back/forward buttons
    window.addEventListener("popstate", (event) => {
      const path = window.location.pathname;
      // Don't push state again, just update the view
      this.navigate(path, false);
    });

    // Handle initial page load
    const currentPath = window.location.pathname;
    this.currentRoute = currentPath;
  }

  navigate(path, pushState = true) {
    // Allow re-navigation to same path (e.g., after going back)
    if (pushState) {
      window.history.pushState({ route: path }, "", path);
    }
    this.currentRoute = path;

    // Remove path prefix from path for comparison
    const relativePath = pathPrefix ? path.replace(pathPrefix, "") : path;

    if (relativePath === "/" || relativePath === "/index.html" || relativePath === "") {
      this.showHome();
    } else if (relativePath.startsWith("/work/")) {
      const slug = relativePath.replace("/work/", "").replace(/\/$/, "");
      this.showProject(slug);
    }
  }

  showHome() {
    const projectsContainer = document.getElementById("projects");
    if (projectsContainer) {
      projectsContainer.innerHTML = "";
      projectsContainer.classList.remove("visible");
    }

    // Show all strips when going home
    this.updateStripVisibility(null);

    window.scrollTo(0, 0);
  }

  async showProject(slug) {
    const project = projects.find((p) => p.slug === slug);

    if (!project) {
      console.warn("Project not found:", slug);
      return;
    }

    // Find the clicked strip for transition
    const clickedStrip = document.querySelector(`.strip[data-project="${slug}"]`);

    try {
      // Animate strip to full screen
      if (clickedStrip) {
        clickedStrip.classList.add("expanding");
      }

      // Start fetching immediately while animation plays
      const fetchPath = pathPrefix ? `${pathPrefix}/work/${slug}/` : `/work/${slug}/`;
      const response = await fetch(fetchPath);
      if (!response.ok) throw new Error(`Failed to fetch project: ${response.status}`);

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Extract the project content
      const projectContent = doc.querySelector("#projects");

      if (!projectContent) {
        console.warn("Project content not found in response");
        return;
      }

      // Replace or create the projects container (while strip is still expanded)
      let currentProjects = document.getElementById("projects");
      if (currentProjects) {
        currentProjects.style.opacity = "0";
        currentProjects.innerHTML = projectContent.innerHTML;
        currentProjects.classList.add("visible");
      } else {
        // If projects container doesn't exist, create it
        const stripsElement = document.getElementById("strips");
        if (stripsElement && stripsElement.parentNode) {
          projectContent.style.opacity = "0";
          stripsElement.parentNode.insertBefore(projectContent, stripsElement);
          currentProjects = projectContent;
        }
      }

      // Keep expanded strip on top for 500ms total (from when it started expanding)
      if (clickedStrip) {
        setTimeout(() => {
          // Fade out the expanding strip
          clickedStrip.style.opacity = "0";
          clickedStrip.style.transition = "opacity 0.3s ease";

          // After fade out completes, fade in project content and clean up strip
          setTimeout(() => {
            // Fade in project content
            if (currentProjects) {
              currentProjects.style.opacity = "1";
              currentProjects.style.transition = "opacity 0.4s ease";
            }

            // Clean up strip
            clickedStrip.classList.remove("expanding");
            clickedStrip.style.opacity = "";
            clickedStrip.style.transition = "";
          }, 300);
        }, 500); // Strip stays visible for 500ms total
      }

      // Hide the current project strip
      this.updateStripVisibility(slug);

      // Scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error loading project:", error);
      if (clickedStrip) {
        clickedStrip.classList.remove("expanding");
      }
    }
  }

  updateStripVisibility(currentProjectSlug) {
    const allStrips = document.querySelectorAll(".strip");

    allStrips.forEach((strip) => {
      const stripSlug = strip.getAttribute("data-project");

      if (currentProjectSlug && stripSlug === currentProjectSlug) {
        // Hide the current project's strip
        strip.classList.add("hidden");
      } else {
        // Show all other strips
        strip.classList.remove("hidden");
      }
    });
  }

  goHome() {
    const homePath = pathPrefix ? `${pathPrefix}/` : "/";
    this.navigate(homePath);
  }
}

export const router = new SPARouter();
router.init();
