// Modern SPA Router using History API
// Get projects from window global (injected by 11ty)
const projects = window.__PROJECTS_DATA__ || [];

class SPARouter {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.initialized = false;
    this.basePath = this.detectBasePath();
  }

  detectBasePath() {
    const pathname = window.location.pathname;
    // If we're in a subdirectory, extract the base path
    const parts = pathname.split("/");
    if (parts.length > 2) {
      return parts.slice(0, -1).join("/") || "/";
    }
    return "/";
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Handle browser back/forward buttons
    window.addEventListener("popstate", (event) => {
      this.handleRouteChange(event.state?.route || this.getCurrentPath());
    });

    // Handle initial page load
    const currentPath = this.getCurrentPath();

    // Check if we have initial project data (from server-rendered project page)
    if (window.__INITIAL_PROJECT__ && currentPath.startsWith("/work/")) {
      // Show the project immediately without waiting for route handling
      const projectId = window.__INITIAL_PROJECT__.slug;
      showProjectView(projectId);
      this.currentRoute = currentPath;
    } else {
      this.handleRouteChange(currentPath);
    }
  }

  getCurrentPath() {
    const fullPath = window.location.pathname;
    // Remove the base path if we're in a subdirectory
    if (fullPath.startsWith(this.basePath)) {
      return fullPath.substring(this.basePath.length) || "/";
    }
    return fullPath;
  }

  // Register a route
  route(path, handler) {
    this.routes.set(path, handler);
  }

  // Navigate to a route
  navigate(path, data = {}) {
    // Update URL without page reload - handle base path properly to avoid double slashes
    let fullPath;
    if (path === "/") {
      fullPath = this.basePath;
    } else {
      // Remove trailing slash from basePath and leading slash from path if needed
      const base = this.basePath.endsWith("/") ? this.basePath.slice(0, -1) : this.basePath;
      const route = path.startsWith("/") ? path : `/${path}`;
      fullPath = base + route;
    }
    window.history.pushState({ route: path, data }, "", fullPath);
    this.handleRouteChange(path, data);
  }

  // Handle route changes
  handleRouteChange(path, data = {}) {
    // Check for exact match first
    let handler = this.routes.get(path);

    // If no exact match, check for dynamic routes
    if (!handler) {
      if (path.startsWith("/work/")) {
        const projectId = path.split("/").pop();
        this.currentRoute = path;
        showProjectView(projectId);
        return;
      }
    }

    if (handler) {
      this.currentRoute = path;
      handler(data);
    } else {
      // Default to home if route not found - but avoid recursion
      if (path !== "/") {
        this.navigate("/");
      }
    }
  }

  // Go back to home
  goHome() {
    this.navigate("/");
  }
}

// Create router instance
export const router = new SPARouter();

// Route handlers
router.route("/", () => {
  showHomeView();
});

// View functions
function showHomeView() {
  const projectDetail = document.getElementById("project");
  const projectsContainer = document.getElementById("projects");
  const headerSubtitle = document.querySelector(".header-subtitle");
  const prevBtn = document.getElementById("project-nav-prev");
  const nextBtn = document.getElementById("project-nav-next");

  if (projectDetail) {
    // Hide project detail
    projectDetail.classList.remove("visible");
    projectDetail.classList.add("hidden");
  }

  // Hide projects container
  if (projectsContainer) {
    projectsContainer.classList.remove("visible");
  }

  // Remove project-visible class to disable scrolling
  document.body.classList.remove("project-visible");
  document.documentElement.classList.remove("project-visible");

  // Hide nav buttons
  if (prevBtn) prevBtn.classList.remove("visible");
  if (nextBtn) nextBtn.classList.remove("visible");

  // Reset header subtitle
  if (headerSubtitle) {
    headerSubtitle.textContent = "PROGRESS NOT PERFECTION";
  }

  // Reset scroll position
  window.scrollTo(0, 0);
}

function showProjectView(projectId) {
  const projectDetail = document.getElementById("project");
  const projectsContainer = document.getElementById("projects");
  const projectHero = document.getElementById("project-hero");
  const projectTitle = document.getElementById("project-title");
  const projectBody = document.getElementById("project-body");
  const headerSubtitle = document.querySelector(".header-subtitle");
  const prevBtn = document.getElementById("project-nav-prev");
  const nextBtn = document.getElementById("project-nav-next");

  // Get project data
  const project = getProjectById(projectId);
  const currentIndex = projects.findIndex((p) => p.slug === projectId);

  if (project) {
    // Get the hero image URL (already optimized with hash in filename)
    let imageUrl = Array.isArray(project.images) ? project.images[0] : project.image;

    // Set hero background image
    projectHero.style.backgroundImage = `url('${imageUrl}')`;

    // Update header subtitle with project title
    if (headerSubtitle) {
      headerSubtitle.textContent = project.title.toUpperCase();
    }

    // Hide the title in the content area
    projectTitle.style.display = "none";

    // Build project content
    let contentHTML = '<div class="project-info">';

    // Add project metadata
    if (project.year || project.tags?.length) {
      contentHTML += '<div class="project-meta">';
      if (project.year) {
        contentHTML += `<span class="project-year">${project.year}</span>`;
      }
      if (project.tags?.length) {
        contentHTML += `<span class="project-tags">${project.tags.join(", ")}</span>`;
      }
      contentHTML += "</div>";
    }

    // Add all project images (skip first one since it's the hero)
    if (project.images?.length > 1) {
      contentHTML += '<div class="project-gallery">';
      project.images.slice(1).forEach((img, index) => {
        contentHTML += `
          <figure class="project-image">
            <img src="${img}" alt="${project.title} - Image ${index + 2}" loading="lazy" />
          </figure>
        `;
      });
      contentHTML += "</div>";
    }

    contentHTML += "</div>";

    // Update project content
    projectBody.innerHTML = contentHTML;

    // Setup prev/next navigation
    prevBtn.classList.add("visible");
    nextBtn.classList.add("visible");

    if (currentIndex > 0) {
      prevBtn.disabled = false;
      prevBtn.onclick = () => {
        const prevProject = projects[currentIndex - 1];
        router.navigate(`/work/${prevProject.slug}`, { prevProject });
      };
    } else {
      prevBtn.disabled = true;
    }

    if (currentIndex < projects.length - 1) {
      nextBtn.disabled = false;
      nextBtn.onclick = () => {
        const nextProject = projects[currentIndex + 1];
        router.navigate(`/work/${nextProject.slug}`, { nextProject });
      };
    } else {
      nextBtn.disabled = true;
    }

    // Show projects container and enable scrolling
    if (projectsContainer) {
      projectsContainer.classList.add("visible");
    }

    // Add project-visible class to enable scrolling
    document.body.classList.add("project-visible");
    document.documentElement.classList.add("project-visible");

    // Show project detail inline (pushes strips down)
    projectDetail.classList.remove("hidden");
    projectDetail.classList.add("visible");

    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Helper function to get project by ID
function getProjectById(id) {
  // Find project by slug (or fallback to title conversion)
  return projects.find((project) => {
    const projectSlug = project.slug || project.title.toLowerCase().replace(/\s+/g, "-");
    return projectSlug === id;
  });
}

// Initialize back button
document.addEventListener("DOMContentLoaded", () => {
  const backButton = document.getElementById("back-button");
  if (backButton) {
    backButton.addEventListener("click", () => {
      router.goHome();
    });
  }
});

// Export for use in other modules
export { showHomeView, showProjectView };
