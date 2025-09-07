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

export default function (eleventyConfig) {
  // Passthroughs (do NOT passthrough "src" when using Vite)
  eleventyConfig.addPassthroughCopy("projects");
  eleventyConfig.addWatchTarget("projects");
  eleventyConfig.addPassthroughCopy("CNAME"); // if present

  // Globals
  eleventyConfig.addGlobalData("isDev", process.env.ELEVENTY_RUN_MODE !== "build");
  eleventyConfig.addGlobalData("buildYear", new Date().getFullYear());

  // Ensure we control the Nunjucks env first
  eleventyConfig.setLibrary(
    "njk",
    nunjucks.configure({
      autoescape: true,
      throwOnUndefined: false,
      trimBlocks: true,
      lstripBlocks: true,
    })
  );

  // Vite plugin (manual tags in layout; alias makes /src/* resolvable at build)
  eleventyConfig.addPlugin(EleventyVitePlugin, {
    tempFolderName: ".11ty-vite",
    viteOptions: {
      appType: "mpa",
      publicDir: false,
      base: process.env.PATH_PREFIX || "/", // "/<repo>" on GH Pages, "/" locally/custom domain
      clearScreen: false,
      build: { emptyOutDir: true, sourcemap: false },
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

  // Filters
  eleventyConfig.addFilter("isoDate", (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return isNaN(dt) ? "" : dt.toISOString().slice(0, 10);
  });

  // Responsive image shortcode
  const urlPathBase = process.env.PATH_PREFIX ? `${process.env.PATH_PREFIX}/img` : "/img";
  eleventyConfig.addNunjucksAsyncShortcode(
    "responsiveImage",
    async (src, alt, className = "media-img", sizes = "(min-width: 800px) 980px, 100vw") => {
      const srcPath = path.join(process.cwd(), src);
      const metadata = await Image(srcPath, {
        widths: [480, 800, 1200, 1600, 2400],
        formats: ["avif", "webp", "jpeg"],
        urlPath: urlPathBase,
        outputDir: "dist/img",
        sharpOptions: { animated: true },
      });

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
      if (className?.includes("lcp")) attrs.fetchpriority = "high";

      return Image.generateHTML(metadata, attrs, { whitespaceMode: "inline" });
    }
  );

  // Projects scanner
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
        const rel = `${root}/${dir}/${f.name}`;
        if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
          images.push({ src: rel, alt: title });
        } else if ([".mp4", ".webm", ".mov"].includes(ext)) {
          videos.push({ src: rel });
        } else if ([".md", ".txt"].includes(ext)) {
          const raw = readFileSync(path.join(dirPath, f.name), "utf8");
          texts.push(ext === ".md" ? md.render(raw) : `<p>${raw.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br>")}</p>`);
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

  return {
    dir: { input: ".", includes: "_includes", layouts: "_includes/layouts", output: "dist" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    templateFormats: ["njk", "md", "html"], // we’re sticking to Nunjucks here
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
}
