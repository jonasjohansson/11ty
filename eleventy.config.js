console.log("✅ Loading eleventy.config.js");

// @ts-nocheck
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import markdownIt from "markdown-it";
import Image from "@11ty/eleventy-img";
import nunjucks from "nunjucks";
import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";

const md = markdownIt({ html: true, breaks: false, linkify: true });
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// tiny slug helper for nice filenames
const slug = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function (eleventyConfig) {
  /** Passthroughs (do NOT passthrough "src" when using Vite) */
  eleventyConfig.addPassthroughCopy("projects");
  eleventyConfig.addWatchTarget("projects");
  eleventyConfig.addPassthroughCopy("CNAME"); // if present

  /** Globals */
  eleventyConfig.addGlobalData("isDev", process.env.ELEVENTY_RUN_MODE !== "build");
  eleventyConfig.addGlobalData("buildYear", new Date().getFullYear());

  /** Control the Nunjucks env */
  eleventyConfig.setLibrary(
    "njk",
    nunjucks.configure({
      autoescape: true,
      throwOnUndefined: false,
      trimBlocks: true,
      lstripBlocks: true,
    })
  );

  /** Vite (manual tags in layout; alias lets Vite resolve /src/* at build) */
  eleventyConfig.addPlugin(EleventyVitePlugin, {
    tempFolderName: ".11ty-vite",
    viteOptions: {
      appType: "mpa",
      publicDir: false,
      base: process.env.PATH_PREFIX || "/", // "/<repo>" for GH Pages project sites
      clearScreen: false,
      build: { emptyOutDir: true },
      server: { middlewareMode: true },
      assetsInclude: ["**/*.mp4", "**/*.webm", "**/*.mov"],
      resolve: {
        alias: {
          "/src": path.resolve(projectRoot, "src"),
        },
      },
    },
  });

  console.log("✅ EleventyVitePlugin registered");

  /** Filters */
  eleventyConfig.addFilter("isoDate", (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return isNaN(dt) ? "" : dt.toISOString().slice(0, 10);
  });

  /** Responsive image shortcode — preserves original name + width + short hash */
  const urlPathBase = process.env.PATH_PREFIX ? `${process.env.PATH_PREFIX}/img` : "/img";

  eleventyConfig.addNunjucksAsyncShortcode(
    "responsiveImage",
    async (src, alt, className = "media-img", sizes = "(min-width: 800px) 980px, 100vw") => {
      // src is a filesystem path like "projects/my-piece/Jonas_johansson_image-01.jpg"
      const srcPath = path.join(process.cwd(), src);

      const metadata = await Image(srcPath, {
        widths: [480, 800, 1200, 1600, 2400],
        formats: ["avif", "webp", "jpeg"],
        urlPath: urlPathBase,
        outputDir: "dist/img",
        sharpOptions: { animated: true },
        filenameFormat(id, fileSrc, width, format) {
          const dirSlug = slug(path.basename(path.dirname(fileSrc))); // project folder
          const baseName = path.basename(fileSrc, path.extname(fileSrc)); // original name (no ext)
          const baseSlug = slug(baseName);
          const shortHash = String(id).slice(0, 8);
          return `${dirSlug}-${baseSlug}-${width}w-${shortHash}.${format}`;
        },
      });

      // Add width/height from largest JPEG to avoid CLS
      const largestJpeg = metadata.jpeg?.[metadata.jpeg.length - 1];
      const width = largestJpeg?.width;
      const height = largestJpeg?.height;

      const attrs = {
        alt,
        sizes,
        class: className,
        loading: "lazy",
        decoding: "async",
        ...(width && height ? { width, height } : {}),
      };

      // Optional: treat hero images as LCP if you pass class "lcp"
      if (className?.includes("lcp")) attrs.fetchpriority = "high";

      return Image.generateHTML(metadata, attrs, { whitespaceMode: "inline" });
    }
  );

  /** Projects scanner → used on index.njk */
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
        const relFsPath = `${root}/${dir}/${f.name}`; // filesystem path (no leading slash)
        if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
          images.push({ src: relFsPath, alt: title });
        } else if ([".mp4", ".webm", ".mov"].includes(ext)) {
          videos.push({ src: relFsPath });
        } else if ([".md", ".txt"].includes(ext)) {
          const raw = readFileSync(path.join(dirPath, f.name), "utf8");
          texts.push(ext === ".md" ? md.render(raw) : `<p>${raw.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br>")}</p>`);
        }
      });

      // Fallback date: newest file mtime
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

  /** Eleventy return object */
  return {
    dir: { input: ".", includes: "_includes", layouts: "_includes/layouts", output: "dist" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
}
