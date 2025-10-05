// projects.js — project data and metadata

// Cache busting version - update this when images change
export const IMAGE_VERSION = "v2";

// Helper function to get random year (single year per project)
const getRandomYear = () => {
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  return years[Math.floor(Math.random() * years.length)];
};

// Helper function to get random tags
const getRandomTags = () => {
  const allTags = ["Light", "Installation", "Education", "AV", "Mixed Reality", "Stage"];
  const numTags = Math.floor(Math.random() * 3) + 1; // 1-3 tags
  return allTags.sort(() => 0.5 - Math.random()).slice(0, numTags);
};

export const projects = [
  {
    title: "Course Designer at Svenska Tecknare",
    images: ["assets/images/Course-designer-at-Svenska-Tecknare.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Crack at Nowhere",
    images: ["assets/images/Crack-at-Nowhere-1.jpg", "assets/images/Crack-at-Nowhere-2.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Danny Saucedo",
    images: ["assets/images/Danny-Saucedo-1.jpg", "assets/images/Danny-Saucedo-2.jpg", "assets/images/Danny-Saucedo-3.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Dendrolux at Into the Woods",
    images: ["assets/images/Dendrolux-at-Into-the-Woods-1.jpg", "assets/images/Dendrolux-at-Into-the-Woods-2.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Dendrolux at Tjoloholms Slott",
    images: [
      "assets/images/Dendrolux-at-Tjoloholms-Slott-1.jpg",
      "assets/images/Dendrolux-at-Tjoloholms-Slott-2.jpg",
      "assets/images/Dendrolux-at-Tjoloholms-Slott-3.jpg",
      "assets/images/Dendrolux-at-Tjoloholms-Slott-4.jpg",
      "assets/images/Dendrolux-at-Tjoloholms-Slott-5.jpg",
      "assets/images/Dendrolux-at-Tjoloholms-Slott-6.jpg",
      "assets/images/Dendrolux-at-Tjoloholms-Slott-7.jpg",
    ],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Eastern City Portal",
    images: [
      "assets/images/Eastern-City-Portal-1.jpg",
      "assets/images/Eastern-City-Portal-2.jpg",
      "assets/images/Eastern-City-Portal-3.jpg",
      "assets/images/Eastern-City-Portal-4.jpg",
      "assets/images/Eastern-City-Portal-5.jpg",
      "assets/images/Eastern-City-Portal-6.jpg",
      "assets/images/Eastern-City-Portal-7.jpg",
      "assets/images/Eastern-City-Portal-8.jpg",
      "assets/images/Eastern-City-Portal-9.jpg",
      "assets/images/Eastern-City-Portal-10.jpg",
    ],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Embed at Hobo Hotel",
    images: ["assets/images/Embed-at-Hobo-Hotel.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Emerging Sensation",
    images: ["assets/images/Emerging-Sensation-1.jpg", "assets/images/Emerging-Sensation-2.jpg", "assets/images/Emerging-Sensation-3.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Firestarter at Nowhere",
    images: [
      "assets/images/Firestarter-at-Nowhere-1.jpg",
      "assets/images/Firestarter-at-Nowhere-2.jpg",
      "assets/images/Firestarter-at-Nowhere-3.jpg",
      "assets/images/Firestarter-at-Nowhere-4.jpg",
      "assets/images/Firestarter-at-Nowhere-5.jpg",
      "assets/images/Firestarter-at-Nowhere-6.jpg",
      "assets/images/Firestarter-at-Nowhere-7.jpg",
      "assets/images/Firestarter-at-Nowhere-8.jpg",
      "assets/images/Firestarter-at-Nowhere-9.jpg",
      "assets/images/Firestarter-at-Nowhere-10.jpg",
    ],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Harpa Light Organ at Sonar Reykjavik",
    images: ["assets/images/Harpa-Light-Organ-at-Sonar-Reykjavik.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Harpa Touch at Sonar Reykjavik",
    images: ["assets/images/Harpa-Touch-at-Sonar-Reykjavik.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Haven at Icehotel",
    images: ["assets/images/Haven-at-Icehotel.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Heroes at Nobel Week Lights",
    images: ["assets/images/Heroes-at-Nobel-Week-Lights-1.jpg", "assets/images/Heroes-at-Nobel-Week-Lights-2.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Jag ar Gud at Kulturhuset Stadsteatern",
    images: [
      "assets/images/Jag-ar-Gud-at-Kulturhuset-Stadsteatern-1.jpg",
      "assets/images/Jag-ar-Gud-at-Kulturhuset-Stadsteatern-2.jpg",
      "assets/images/Jag-ar-Gud-at-Kulturhuset-Stadsteatern-3.jpg",
      "assets/images/Jag-ar-Gud-at-Kulturhuset-Stadsteatern-4.jpg",
      "assets/images/Jag-ar-Gud-at-Kulturhuset-Stadsteatern-5.jpg",
      "assets/images/Jag-ar-Gud-at-Kulturhuset-Stadsteatern-6.jpg",
      "assets/images/Jag-ar-Gud-at-Kulturhuset-Stadsteatern-7.jpg",
      "assets/images/Jag-ar-Gud-at-Kulturhuset-Stadsteatern-8.jpg",
      "assets/images/Jag-ar-Gud-at-Kulturhuset-Stadsteatern-9.jpg",
      "assets/images/Jag-ar-Gud-at-Kulturhuset-Stadsteatern-10.jpg",
    ],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Lights for Ukraine",
    images: ["assets/images/Lights-for-Ukraine-1.jpg", "assets/images/Lights-for-Ukraine-2.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Lyra",
    images: ["assets/images/Lyra.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Myriad at Reaktorhallen R1",
    images: [
      "assets/images/Myriad-at-Reaktorhallen-R1-1.jpg",
      "assets/images/Myriad-at-Reaktorhallen-R1-2.jpg",
      "assets/images/Myriad-at-Reaktorhallen-R1-3.jpg",
    ],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Mystery on the Icehotel Express at Icehotel",
    images: ["assets/images/Mystery-on-the-Icehotel-Express-at-Icehotel.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "People in Orbit",
    images: ["assets/images/People-in-Orbit-1.jpg", "assets/images/People-in-Orbit-2.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Retrospectives at Nowhere",
    images: ["assets/images/Retrospectives-at-Nowhere.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Sala Hjartslag at Sala kommun",
    images: ["assets/images/Sala-Hjartslag-at-Sala-kommun.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "TinyMassive at Sonar Reykjavik",
    images: ["assets/images/TinyMassive-at-Sonar-Reykjavik.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Transcend",
    images: ["assets/images/Transcend.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Tufting Ex Machina",
    images: [
      "assets/images/Tufting-Ex-Machina-1.jpg",
      "assets/images/Tufting-Ex-Machina-2.jpg",
      "assets/images/Tufting-Ex-Machina-3.jpg",
      "assets/images/Tufting-Ex-Machina-4.jpg",
      "assets/images/Tufting-Ex-Machina-5.jpg",
      "assets/images/Tufting-Ex-Machina-6.jpg",
      "assets/images/Tufting-Ex-Machina-7.jpg",
      "assets/images/Tufting-Ex-Machina-8.jpg",
      "assets/images/Tufting-Ex-Machina-9.jpg",
    ],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
  {
    title: "Vista",
    images: ["assets/images/Vista-1.jpg", "assets/images/Vista-2.jpg", "assets/images/Vista-3.jpg", "assets/images/Vista-4.jpg"],
    year: getRandomYear(),
    tags: getRandomTags(),
  },
];
