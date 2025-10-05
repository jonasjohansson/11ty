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

    window.scrollTo(0, 0);
  }

  async showProject(slug) {
    const project = projects.find((p) => p.slug === slug);

    if (!project) {
      console.warn("Project not found:", slug);
      return;
    }

    try {
      // Fetch the project page HTML with path prefix
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

      // Replace or create the projects container
      let currentProjects = document.getElementById("projects");
      if (currentProjects) {
        currentProjects.innerHTML = projectContent.innerHTML;
        currentProjects.classList.add("visible");
      } else {
        // If projects container doesn't exist, create it
        const stripsElement = document.getElementById("strips");
        if (stripsElement && stripsElement.parentNode) {
          stripsElement.parentNode.insertBefore(projectContent, stripsElement);
        }
      }

      // Scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error loading project:", error);
    }
  }

  goHome() {
    const homePath = pathPrefix ? `${pathPrefix}/` : "/";
    this.navigate(homePath);
  }
}

export const router = new SPARouter();
router.init();
