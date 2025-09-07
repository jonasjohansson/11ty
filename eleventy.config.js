import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import markdownIt from "markdown-it";

const md = markdownIt({ html: true, breaks: false, linkify: true });

export default function (eleventyConfig) {
  // Copy project media straight through so URLs are /projects/…
  eleventyConfig.addPassthroughCopy("projects");

  // add this:
  eleventyConfig.addPassthroughCopy("src");

  // Add a simple global for current year (use {{ buildYear }} in templates)
  eleventyConfig.addGlobalData("buildYear", new Date().getFullYear());

  // Make a global that turns /projects/** into data for index
  eleventyConfig.addGlobalData("projects", () => {
    const root = "projects";
    const dirs = readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const projects = dirs.map((dir) => {
      const dirPath = path.join(root, dir);
      const files = readdirSync(dirPath, { withFileTypes: true }).filter((f) => f.isFile());

      const images = [];
      const videos = [];
      const texts = [];

      let title = dir.replace(/[._-]+/g, " ").trim();
      let date = null;

      // Optional per-project data.json
      const dataJson = path.join(dirPath, "data.json");
      if (existsSync(dataJson)) {
        try {
          const data = JSON.parse(readFileSync(dataJson, "utf8"));
          if (data.title) title = data.title;
          if (data.date) date = new Date(data.date).toISOString();
          if (Array.isArray(data.texts)) {
            data.texts.forEach((t) => {
              if (typeof t === "string") texts.push(md.render(t));
            });
          }
        } catch {}
      }

      files.forEach((f) => {
        const ext = path.extname(f.name).toLowerCase();
        const fileUrl = `${root}/${dir}/${f.name}`;
        if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
          images.push({ src: fileUrl, alt: title });
        } else if ([".mp4", ".webm", ".mov"].includes(ext)) {
          videos.push({ src: fileUrl });
        } else if ([".md", ".txt"].includes(ext)) {
          const raw = readFileSync(path.join(dirPath, f.name), "utf8");
          if (ext === ".md") texts.push(md.render(raw));
          else texts.push(`<p>${raw.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br>")}</p>`);
        }
      });

      // Use newest file mtime as date if not provided
      if (!date) {
        const mtimes = files.map((f) => statSync(path.join(dirPath, f.name)).mtimeMs);
        date = new Date(mtimes.length ? Math.max(...mtimes) : Date.now()).toISOString();
      }

      return { slug: dir, title, date, images, videos, texts };
    });

    // newest first
    projects.sort((a, b) => new Date(b.date) - new Date(a.date));
    return projects;
  });

  // Helper to mark HTML safe in Nunjucks

  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_includes/layouts",
      output: "dist",
    },
    pathPrefix: process.env.PATH_PREFIX || "/", // <— add this
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
}
