export const projectTypes = {
  productionSupport: {
    name: "Production support",
    includes: [
      "後製剪輯",
      "節奏安排",
      "字幕整理",
      "視覺整理",
      "聲音調整",
    ],
    description:
      "Client provides the footage, while SU STUDIO handles editing, pacing, visual organization, subtitles, and post-production integration.",
    shortDescription:
      "Client provides the footage, while SU STUDIO refines the pacing, visual language, and post-production flow into a consistent viewing experience.",
    chineseDescription:
      "由客戶提供素材，SU STUDIO 協助整理畫面節奏、視覺語言與後製流程，建立一致性的觀看體驗。",
  },

  fullProduction: {
    name: "Full production",
    includes: [
      "企劃",
      "訪談",
      "拍攝",
      "聲音",
      "剪輯",
    ],
    description:
      "SU STUDIO handles the project from concept development to final delivery, integrating image, sound, and design into a complete production process.",
    chineseDescription:
      "SU STUDIO 從前期到後期完整製作，整合企劃、訪談、拍攝、聲音與剪輯。",
  },

  podcastAnywhere: {
    name: "Podcast Anywhere",
    status: "Coming Soon",
    includes: [
      "Podcast 錄製",
      "人物訪談",
      "聲音內容",
      "場域錄製",
    ],
    description:
      "A mobile podcast and people-centered story documentation format in development by SU STUDIO.",
  },
} as const;

export const contentTypes = {
  youtube: "YouTube",
  shorts: "Shorts",
  podcast: "Podcast",
  project: "Project",
} as const;

export type ProjectTypes = typeof projectTypes;
export type ContentTypes = typeof contentTypes;
