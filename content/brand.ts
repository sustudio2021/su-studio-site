export const brand = {
  name: "SU STUDIO",
  chineseName: "好述設計影像工作室",
  fullName: "SU STUDIO｜好述設計影像工作室",

  location: "台中",
  serviceArea: ["台中", "彰化", "南投", "台北", "全台合作"],

  identity: [
    "台中影像工作室",
    "影像設計工作室",
    "Image × Sound × Design",
  ],

  expertise: [
    "Podcast",
    "人物訪談",
    "聲音內容",
    "文化藝術專案",
  ],

  signature: [
    "行動式 Podcast",
    "人物故事紀錄",
  ],

  tagline: "Let’s build new ways of seeing.",

  description:
    "SU STUDIO｜好述設計影像工作室是一間位於台中的影像設計工作室，以人物、場域與聲音為核心，發展人物訪談、Podcast、聲音內容與文化藝術專案，透過 Image、Sound、Design 三個面向，留下值得被觀看與聆聽的故事。",

  shortDescription:
    "位於台中的影像設計工作室，專注於影像、聲音與設計的整合。",

  keywords: [
    "SU STUDIO",
    "好述設計影像工作室",
    "台中影像工作室",
    "影像設計工作室",
    "Podcast 製作",
    "人物訪談",
    "聲音內容製作",
    "文化藝術專案",
    "行動式 Podcast",
    "人物故事紀錄",
  ],

  interests: [
    "People",
    "Place",
    "Sound",
    "Story",
  ],

  concepts: {
    image: "How things are seen.",
    sound: "What is not seen.",
    design: "Structure that connects them all.",
  },

  podcastAnywhere: {
    name: "Podcast Anywhere",
    subtitle: "讓 Podcast 不再受限於錄音室。",
    description:
      "Podcast Anywhere 是 SU STUDIO 正在發展的行動式 Podcast 計畫，將錄音帶離室內空間，走進人物、場域與故事發生的地方。",
    keywords: ["Podcast Anywhere", "行動式 Podcast", "人物故事紀錄"],
    status: "Coming Soon",
  },

  contact: {
    email: "sustudio2021@gmail.com",
    instagram: "https://www.instagram.com/susustudio2021",
    website: "https://sustudio2021.com",
  },
} as const;

export type Brand = typeof brand;
