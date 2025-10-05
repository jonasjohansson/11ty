console.log("✅ Loading eleventy.config.js");

// @ts-nocheck
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import markdownIt from "markdown-it";
import Image from "@11ty/eleventy-img";
import nunjucks from "nunjucks";
import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";
import matter from "gray-matter";

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
  /** Ignore jonasjohansson.se folder (it's a separate standalone site) */
  eleventyConfig.ignores.add("jonasjohansson.se/**");

  /** Force full rebuild on any file change - no caching */
  eleventyConfig.setServerOptions({
    domdiff: false, // Disable DOM diffing for faster full page reloads
  });

  /** Passthroughs (do NOT passthrough "src" when using Vite) */
  eleventyConfig.addWatchTarget("projects/**/*"); // Watch for ALL changes in projects folder
  eleventyConfig.addWatchTarget("src/**/*"); // Watch for ALL changes in src folder
  eleventyConfig.setWatchJavaScriptDependencies(false); // Force rebuild on any change
  eleventyConfig.addPassthroughCopy({ "src/fonts": "fonts" }); // Copy fonts to dist/fonts
  eleventyConfig.addPassthroughCopy({ "src/css": "assets" }); // Copy CSS to dist/assets
  eleventyConfig.addPassthroughCopy({ "src/js": "assets" }); // Copy JS to dist/assets
  eleventyConfig.addPassthroughCopy("favicon.svg"); // Copy favicon
  // eleventyConfig.addPassthroughCopy("projects"); // Don't copy raw projects - use optimized images only
  eleventyConfig.addPassthroughCopy("CNAME"); // if present

  /** Globals */
  eleventyConfig.addGlobalData("isDev", process.env.ELEVENTY_RUN_MODE !== "build");
  eleventyConfig.addGlobalData("buildYear", new Date().getFullYear());

  // Load about content from markdown file
  eleventyConfig.addGlobalData("about", () => {
    const aboutPath = path.join(process.cwd(), "_data/about.md");
    if (existsSync(aboutPath)) {
      return readFileSync(aboutPath, "utf8");
    }
    return "";
  });

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

  /** Shortcodes */
  eleventyConfig.addShortcode("responsiveImage", async (src, alt, widths = [480, 800, 1200]) => {
    const Image = (await import("@11ty/eleventy-img")).default;
    const metadata = await Image(src, {
      widths,
      formats: ["webp", "jpeg"],
      outputDir: "./dist/assets/",
      urlPath: "/assets/",
      filenameFormat: (id, src, width, format, options) => {
        const ext = path.extname(src);
        const name = path.basename(src, ext);
        return `${name}-${width}w-${id}.${format}`;
      },
    });
    return Image.generateHTML(metadata, {
      alt,
      loading: "lazy",
      decoding: "async",
    });
  });

  /** Strip image shortcode - processes first image for strips */
  eleventyConfig.addShortcode("stripImage", async (src, alt) => {
    const Image = (await import("@11ty/eleventy-img")).default;
    const metadata = await Image(src, {
      widths: [400, 600, 800],
      formats: ["webp", "jpeg"],
      outputDir: "./dist/assets/",
      urlPath: "/assets/",
      filenameFormat: (id, src, width, format, options) => {
        const ext = path.extname(src);
        const name = path.basename(src, ext);
        return `${name}-${width}w-${id}.${format}`;
      },
    });
    return Image.generateHTML(metadata, {
      alt,
      loading: "lazy",
      decoding: "async",
    });
  });

  // Skip Vite plugin - build assets separately
  // eleventyConfig.addPlugin(EleventyVitePlugin);

  /** Filters */
  eleventyConfig.addFilter("isoDate", (d) => {
    if (!d) return "";
    const dt = new Date(d);
    return isNaN(dt) ? "" : dt.toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("markdown", (str) => {
    return md.render(str);
  });

  /** Responsive image shortcode — preserves original name + width + short hash */
  const urlPathBase = process.env.PATH_PREFIX ? `${process.env.PATH_PREFIX}/img` : "/img";

  eleventyConfig.addNunjucksAsyncShortcode(
    "responsiveImage",
    async (src, alt, className = "media-img", sizes = "(min-width: 800px) 980px, 100vw") => {
      try {
        // src is a filesystem path like "projects/my-piece/Jonas_johansson_image-01.jpg"
        const srcPath = path.join(process.cwd(), src);
        console.log(`🖼️  Processing image: ${src} -> ${srcPath}`);

        const metadata = await Image(srcPath, {
          widths: [1920, 2400], // High resolution for portfolio
          formats: ["jpeg"], // Just JPEG for simplicity and speed
          urlPath: urlPathBase,
          outputDir: "dist/img",
          sharpJpegOptions: { quality: 90, progressive: true }, // High quality for portfolio
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
      } catch (err) {
        console.error(`❌ Error processing image ${src}:`, err.message);
        return `<img src="${src}" alt="${alt}" class="${className}" />`;
      }
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

      files.forEach((f) => {
        const ext = path.extname(f.name).toLowerCase();
        if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
          const relFsPath = `${root}/${dir}/${f.name}`; // filesystem path for responsiveImage shortcode
          images.push({ src: relFsPath, alt: title });
        } else if ([".mp4", ".webm", ".mov"].includes(ext)) {
          const relFsPath = `${root}/${dir}/${f.name}`; // videos stay as passthrough
          videos.push({ src: relFsPath });
        } else if ((ext === ".md" && f.name !== "data.md") || ext === ".txt") {
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

  /** Transform projects for JavaScript consumption */
  eleventyConfig.addGlobalData("projectsForJS", async () => {
    const root = "projects";
    if (!existsSync(root)) return [];

    const dirs = readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const projects = await Promise.all(
      dirs.map(async (dir) => {
        const dirPath = path.join(root, dir);
        const dataMdPath = path.join(dirPath, "data.md");

        let title = dir.replace(/[._-]+/g, " ").trim();
        let tags = [];
        let year = new Date().getFullYear();
        let firstImageSrc = null;
        let firstImageOptimized = null;

        // Read data.md for metadata and first image
        if (existsSync(dataMdPath)) {
          try {
            const fileContent = readFileSync(dataMdPath, "utf8");
            const parsed = matter(fileContent);
            const { title: mdTitle, date, tags: mdTags = [], blocks = [] } = parsed.data;

            if (mdTitle) title = mdTitle;
            if (mdTags) tags = mdTags;
            if (date) year = new Date(date).getFullYear();

            // Find first image block
            const firstImageBlock = blocks.find((b) => b.type === "image");
            if (firstImageBlock && firstImageBlock.src) {
              firstImageSrc = `${root}/${dir}/${firstImageBlock.src}`;
            }
          } catch (err) {
            console.warn(`⚠️  Could not read ${dataMdPath}:`, err.message);
          }
        }

        // Fallback: scan for first image if not found in data.md
        if (!firstImageSrc) {
          const files = readdirSync(dirPath, { withFileTypes: true }).filter((f) => f.isFile());
          for (const f of files) {
            const ext = path.extname(f.name).toLowerCase();
            if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
              firstImageSrc = `${root}/${dir}/${f.name}`;
              break;
            }
          }
        }

      // Generate high-quality strip image
      if (firstImageSrc) {
        try {
          const srcPath = path.join(process.cwd(), firstImageSrc);
          const urlPathBase = process.env.PATH_PREFIX ? `${process.env.PATH_PREFIX}/img` : "/img";
          
          const metadata = await Image(srcPath, {
            widths: [1920], // High resolution for strips
            formats: ["jpeg"], // Just JPEG for strips - faster processing
            urlPath: urlPathBase,
            outputDir: "dist/img",
            sharpJpegOptions: { quality: 90, progressive: true }, // High quality for portfolio
            filenameFormat(id, fileSrc, width, format) {
              const dirSlug = slug(path.basename(path.dirname(fileSrc)));
              const baseName = path.basename(fileSrc, path.extname(fileSrc));
              const baseSlug = slug(baseName);
              const shortHash = String(id).slice(0, 8);
              return `${dirSlug}-${baseSlug}-${width}w-${shortHash}.${format}`;
            },
          });

          const jpeg = metadata.jpeg?.[0];
          firstImageOptimized = jpeg?.url;
        } catch (err) {
          console.warn(`⚠️  Could not process strip image ${firstImageSrc}:`, err.message);
        }
      }

        return {
          title,
          images: firstImageOptimized ? [firstImageOptimized] : [],
          tags,
          year,
          slug: dir,
        };
      })
    );

    return projects;
  });

  /** Project content scanner → reads data.md with YAML frontmatter */
  eleventyConfig.addGlobalData("projectContent", () => {
    const root = "projects";
    if (!existsSync(root)) return {};

    const dirs = readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const projectContent = {};

    for (const dir of dirs) {
      const dirPath = path.join(root, dir);
      const dataMdPath = path.join(dirPath, "data.md");

      // If no data.md exists, skip this project
      if (!existsSync(dataMdPath)) {
        console.log(`⚠️  ${dir} has no data.md, skipping...`);
        continue;
      }

      try {
        const fileContent = readFileSync(dataMdPath, "utf8");
        const parsed = matter(fileContent);
        const { title, date, tags = [], blocks = [] } = parsed.data;

        let year = new Date().getFullYear();
        let isoDate = null;

        if (date) {
          isoDate = new Date(date).toISOString();
          year = new Date(date).getFullYear();
        }

        // Process blocks from frontmatter
        const content = blocks
          .map((block) => {
            const { type, src, content: textContent, colStart = 1, colSpan = 12, fontSize, textAlign } = block;

            if (type === "image") {
              return {
                type: "image",
                src: `${root}/${dir}/${src}`,
                alt: title || dir,
                colStart,
                colSpan,
              };
            } else if (type === "video") {
              return {
                type: "video",
                src: `${root}/${dir}/${src}`,
                alt: title || dir,
                colStart,
                colSpan,
              };
            } else if (type === "text") {
              return {
                type: "text",
                content: md.render(textContent || ""),
                colStart,
                colSpan,
                fontSize: fontSize || "3rem", // Default to 3x size
                textAlign: textAlign || "left", // Default to left
              };
            }

            return null;
          })
          .filter(Boolean);

        projectContent[dir] = {
          title: title || dir.replace(/[._-]+/g, " ").trim(),
          tags,
          year,
          date: isoDate,
          content,
        };
      } catch (err) {
        console.error(`❌ Error processing data.md in ${dir}:`, err.message);
      }
    }

    return projectContent;
  });

  /** Disable caching during watch mode for immediate rebuilds */
  eleventyConfig.setWatchThrottleWaitTime(0); // No throttling

  /** Force rebuild when project data files change */
  eleventyConfig.on("eleventy.before", ({ runMode }) => {
    // Clear the global data cache on watch mode to force re-evaluation
    if (runMode === "watch" || runMode === "serve") {
      console.log("🔄 Reloading project data...");
    }
  });

  /** Eleventy return object */
  return {
    dir: { input: ".", includes: "_includes", layouts: "_includes/layouts", output: "dist" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
  };
}
