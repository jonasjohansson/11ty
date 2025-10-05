import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

// Project data from your JSON
const projectsData = {
  "jag-ar-gud-at-kulturhuset-stadsteatern": {
    title: "Jag är Gud",
    company: "Kulturhuset Stadsteatern",
    year: "2024",
    description:
      'Light and video design for the autobiographical performance "JAG ÄR GUD" about the life of choreographer, dancer and artist Danne Dahlin and his life with bipolar disease.',
    tags: ["stage", "av", "light"],
  },
  "eastern-city-portal": {
    title: "Eastern City Portal",
    company: "",
    year: "2024",
    description:
      'Hybrid sculpture for the London Camomile street. Carved from sustainably sourced timber, the sculpture shape evokes the imagery of a gateway, inviting viewers to reflect on possible futures, transformation, and the threshold between realities. The piece relies on a complex pattern, milled into the outer layer of our three-layered design, acting as a "marker" guiding the augmented reality experience.',
    tags: ["installation", "mixed reality"],
  },
  "tufting-ex-machina": {
    title: "Tufting Ex Machina",
    company: "",
    year: "2024",
    description:
      '"Tufting Ex Machina" was a two-day workshop at Aavistus where 10 participants engaged in a dadaist method resulting in 24 tufted squares, covering a surface of 140 * 210 cm. The assignment was to research ones identity (cultural, national, personal and more) through patterns, and work with sketching and generative AI to combine, remix and create anew.',
    tags: ["education", "installation"],
  },
  "dendrolux-at-tjoloholms-slott": {
    title: "Dendrolux",
    company: "Tjolöholms Slott",
    year: "2024",
    description: "Bespoke light rings with 300 RGB dual-side pixels, with custom silicone diffusion.",
    tags: ["light", "installation"],
  },
  "danny-saucedo": {
    title: "Danny Saucedo",
    company: "",
    year: "2024",
    description:
      "Audiovisual design and stage production for Danny Saucedo in Melodifestivalen, the Swedish precursor to Eurovision song contest.",
    tags: ["stage", "av"],
  },
  "sala-hjartslag-at-sala-kommun": {
    title: "Sala Hjärtslag",
    company: "Sala kommun",
    year: "2024",
    description:
      "Celebration of Sala turning 400 years with a beautifully crafted and technically executed audiovisual mapping installation on a curved corner wall.",
    tags: ["av", "installation"],
  },
  "firestarter-at-nowhere": {
    title: "Firestarter",
    company: "Nowhere",
    year: "2024",
    description: "Interactive installation where visitors can light a large Zippo lighter like fire using their own flame.",
    tags: ["installation", "light"],
  },
  "people-in-orbit": {
    title: "People in Orbit",
    company: "",
    year: "2023",
    description: "",
    tags: ["mixed reality"],
  },
  "mystery-on-the-icehotel-express-at-icehotel": {
    title: "Mystery on the Icehotel Express",
    company: "Icehotel",
    year: "2023",
    description:
      "Deluxe suite designed and sculpted for Icehotel 365. Inspired by Murder on the Orient Express and a heavy dose of Londons 1930 Art Moderne.",
    tags: ["installation"],
  },
  "crack-at-nowhere": {
    title: "Crack",
    company: "Nowhere",
    year: "2022",
    description: "Augmented reality artwork that opens a rip in reality to a flourishing walnut field in the middle of the desert.",
    tags: ["mixed reality", "installation"],
  },
  "retrospectives-at-nowhere": {
    title: "Retrospectives",
    company: "Nowhere",
    year: "2022",
    description: "",
    tags: ["installation"],
  },
  "lights-for-ukraine": {
    title: "Lights for Ukraine",
    company: "",
    year: "2022",
    description:
      "Light sign exhibition with an open call for illustrations which were then made as faux neon signs. Displayed in one of the busiest metro stations in Stockholm, and auctioned out with proceeds towards Unicef.",
    tags: ["light", "installation"],
  },
  "heroes-at-nobel-week-lights": {
    title: "Heroes",
    company: "Nobel Week Lights",
    year: "2022",
    description: "",
    tags: ["light", "installation"],
  },
  "dendrolux-at-into-the-woods": {
    title: "Dendrolux",
    company: "Into the Woods",
    year: "2020",
    description: "",
    tags: ["light", "installation"],
  },
  "embed-at-hobo-hotel": {
    title: "Embed",
    company: "Hobo Hotel",
    year: "2019",
    description: "",
    tags: ["light", "installation"],
  },
  "emerging-sensation": {
    title: "Emerging Sensation",
    company: "",
    year: "2019",
    description: "",
    tags: ["light", "installation"],
  },
  "tinymassive-at-sonar-reykjavik": {
    title: "Tiny/Massive",
    company: "Sónar Reykjavik",
    year: "2019",
    description: "",
    tags: ["installation"],
  },
  vista: {
    title: "Vista",
    company: "",
    year: "2018",
    description: "",
    tags: ["mixed reality"],
  },
  "haven-at-icehotel": {
    title: "Haven",
    company: "Icehotel",
    year: "2018",
    description:
      "Suite designed and sculpted for Icehotel. An animal haven and sanctuary guarded by the fenix and the fox, riddled with clues on how to gain entrance.",
    tags: ["installation"],
  },
  "harpa-touch-at-sonar-reykjavik": {
    title: "Harpa Touch",
    company: "Sónar Reykjavik",
    year: "2017",
    description: "",
    tags: ["installation", "av"],
  },
  transcend: {
    title: "Transcend",
    company: "",
    year: "2017",
    description: "",
    tags: ["mixed reality"],
  },
  "harpa-light-organ-at-sonar-reykjavik": {
    title: "Harpa Light Organ",
    company: "Sónar Reykjavik",
    year: "2016",
    description: "",
    tags: ["installation", "av", "light"],
  },
  lyra: {
    title: "Lyra",
    company: "",
    year: "2013",
    description: "",
    tags: ["light"],
  },
  "myriad-at-reaktorhallen-r1": {
    title: "Myriad",
    company: "Reaktorhallen R1",
    year: "2024",
    description:
      "Glommen is my first personal work, created during a pivotal time after moving to Canada from Japan. While working at a leading design studio on large-scale stage experiences, I transitioned from viewing code as function to embracing it as sculpture. Inspired by my father, a painter of light, I began experimenting. Glommen reflects the connection to my seaside hometown and the bittersweet anticipation of life without my father. The sun's position in the artwork mirrors his birthday, near the summer solstice.",
    tags: ["installation", "light"],
  },
};

const projectsRoot = "projects";
const dirs = readdirSync(projectsRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

console.log(`📁 Found ${dirs.length} project folders`);

for (const dir of dirs) {
  const dirPath = path.join(projectsRoot, dir);
  const dataMdPath = path.join(dirPath, "data.md");

  // Get project data
  const projectData = projectsData[dir] || {
    title: dir.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    company: "",
    year: "2024",
    description: "",
    tags: ["light", "installation"],
  };

  // Find all image files
  const files = readdirSync(dirPath);
  const imageFiles = files.filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).sort();

  if (imageFiles.length === 0) {
    console.log(`⚠️  No images found in ${dir}, skipping`);
    continue;
  }

  console.log(`✅ Processing ${dir} with ${imageFiles.length} images`);

  // Build blocks array
  const blocks = [];

  // First image as hero
  blocks.push({
    type: "image",
    src: imageFiles[0],
    colStart: 1,
    colSpan: 12,
  });

  // Add description text if available
  if (projectData.description) {
    blocks.push({
      type: "text",
      content: projectData.description,
      colStart: 3,
      colSpan: 8,
      fontSize: "2rem",
      textAlign: "center",
    });
  }

  // Add remaining images
  for (let i = 1; i < imageFiles.length; i++) {
    blocks.push({
      type: "image",
      src: imageFiles[i],
      colStart: 1,
      colSpan: 12,
    });
  }

  // Generate YAML frontmatter
  const yaml = `---
title: "${projectData.title}"
date: "${projectData.year}-01-01"
tags:
${projectData.tags.map((tag) => `  - ${tag}`).join("\n")}
blocks:
${blocks
  .map((block) => {
    if (block.type === "image") {
      return `  - type: ${block.type}
    src: ${block.src}
    colStart: ${block.colStart}
    colSpan: ${block.colSpan}`;
    } else if (block.type === "text") {
      const contentLines = block.content
        .split("\n")
        .map((line) => `      ${line}`)
        .join("\n");
      return `  - type: ${block.type}
    content: |
${contentLines}
    colStart: ${block.colStart}
    colSpan: ${block.colSpan}
    fontSize: ${block.fontSize}
    textAlign: ${block.textAlign}`;
    }
  })
  .join("\n")}
---
`;

  // Write the file
  writeFileSync(dataMdPath, yaml, "utf8");
  console.log(`   ✏️  Updated ${dir}/data.md`);
}

console.log("\n✨ Done! Updated all project data.md files");
