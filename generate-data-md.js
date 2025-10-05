import { readdirSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const projectsRoot = "projects";
const templateProject = "crack-at-nowhere";

// Get all project directories
const dirs = readdirSync(projectsRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== templateProject)
  .map((d) => d.name);

console.log(`📁 Found ${dirs.length} projects to process`);

for (const dir of dirs) {
  const dirPath = join(projectsRoot, dir);
  const dataMdPath = join(dirPath, "data.md");
  const dataJsonPath = join(dirPath, "data.json");

  // Get metadata from data.json if it exists
  let title = dir.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  let date = "2023-01-01";
  let tags = ["installation"];

  if (existsSync(dataJsonPath)) {
    try {
      const data = JSON.parse(readFileSync(dataJsonPath, "utf8"));
      if (data.title) title = data.title;
      if (data.date) date = data.date;
      if (data.tags) tags = data.tags;
    } catch (err) {
      console.warn(`⚠️  Could not read ${dataJsonPath}`);
    }
  }

  // Find image files
  const files = readdirSync(dirPath);
  const imageFiles = files.filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).sort();

  if (imageFiles.length === 0) {
    console.log(`⚠️  No images found in ${dir}, skipping`);
    continue;
  }

  const firstImage = imageFiles[0];
  const secondImage = imageFiles[1] || firstImage;

  // Generate data.md content
  const content = `---
title: "${title}"
date: "${date}"
tags:
${tags.map((tag) => `  - ${tag}`).join("\n")}
blocks:
  - type: image
    src: ${firstImage}
    colStart: 1
    colSpan: 12
  - type: text
    content: |
      This project explores the intersection of light, space, and interaction. Each piece is designed to create an immersive experience that engages audiences in unique ways.

      The project was developed through a collaborative process involving technical experimentation and artistic vision.
    colStart: 3
    colSpan: 8
  - type: image
    src: ${secondImage}
    colStart: 1
    colSpan: 12
---
`;

  // Write the file
  writeFileSync(dataMdPath, content, "utf8");
  console.log(`✅ Generated ${dir}/data.md`);
}

console.log(`\n✨ Done! Generated ${dirs.length} data.md files`);
