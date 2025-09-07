import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import markdownIt from "markdown-it";
import Image from "@11ty/eleventy-img"; // <-- add

const md = markdownIt({ html: true, breaks: false, linkify: true });

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("projects");
  eleventyConfig.addPassthroughCopy("src");
  eleventyConfig.addWatchTarget("projects"); // <-- add

  eleventyConfig.addGlobalData("buildYear", new Date().getFullYear());

  // Async responsive image shortcode
  const urlPathBase = process.env.PATH_PREFIX ? `${process.env.PATH_PREFIX}/img` : "/img";

  eleventyConfig.addNunjucksAsyncShortcode(
    "responsiveImage",
    async (src, alt, className = "media-img", sizes = "(min-width: 800px) 980px, 100vw") => {
      // src should be a filesystem path like "projects/my-piece/image.jpg"
      const srcPath = path.join(process.cwd(), src);

      const metadata = await Image(srcPath, {
        widths: [480, 800, 1200, 1600, 2400],
        formats: ["avif", "webp", "jpeg"],
        urlPath: urlPathBase,
        outputDir: "dist/img",
        sharpOptions: { animated: true },
      });

      const imageAttributes = {
        alt,
        sizes,
        class: className,
        loading: "lazy",
        decoding: "async",
      };

      return Image.generateHTML(metadata, imageAttributes, {
        whitespaceMode: "inline",
      });
    }
  );

  // Your existing projects scanner (unchanged, but ensure img URLs have NO leading slash)
  eleventyConfig.addGlobalData("projects", () => {
    const root = "projects";
    if (!existsSync(root)) return [];
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
        const rel = `${root}/${dir}/${f.name}`; // <— NO leading slash
        if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
          images.push({ src: rel, alt: title });
        } else if ([".mp4", ".webm", ".mov"].includes(ext)) {
          videos.push({ src: rel });
        } else if ([".md", ".txt"].includes(ext)) {
          const raw = readFileSync(path.join(dirPath, f.name), "utf8");
          if (ext === ".md") texts.push(md.render(raw));
          else texts.push(`<p>${raw.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br>")}</p>`);
        }
      });

      if (!date) {
        const mtimes = files.map((f) => statSync(path.join(dirPath, f.name)).mtimeMs);
        date = new Date(mtimes.length ? Math.max(...mtimes) : Date.now()).toISOString();
      }

      return { slug: dir, title, date, images, videos, texts };
    });

    projects.sort((a, b) => new Date(b.date) - new Date(a.date));
    return projects;
  });

  eleventyConfig.addPassthroughCopy("CNAME");

  // formats a JS Date (or string) as YYYY-MM-DD (UTC)
  eleventyConfig.addFilter("isoDate", (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return isNaN(dt) ? "" : dt.toISOString().slice(0, 10);
  });

  // Important: DO NOT override Nunjucks' built-in safe filter
  // eleventyConfig.addFilter("safe", (v) => v); // <-- leave this OUT

  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_includes/layouts",
      output: "dist",
    },
    pathPrefix: process.env.PATH_PREFIX || "/", // <-- already set for Pages
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
}
