export const dimensions = [
  {
    id: "fire",
    name: "Feuer-Portal",
    description: "Stelle dich den Feuerbossen!",
    difficulty: "Normal",
    bossPool: ["inferno", "inferno"],
    colorA: "#ff542e", // Primärfarbe außen
    colorB: "#ff542e", // Sekundärfarbe innen
    coreColor: "#731010", // Kern
    gradient: ["#ff542e", "#ffd966"], // Für Buttons, etc.
  },
  {
    id: "ice",
    name: "Frost-Portal",
    description: "Nur für Abgehärtete.",
    difficulty: "Hard",
    bossPool: ["frostgiant", "blizzard"],
    colorA: "#25cfff",
    colorB: "#e5f7ff",
    coreColor: "#00324b",
    gradient: ["#25cfff", "#e5f7ff"],
  },
  {
    id: "void",
    name: "Void-Portal",
    description: "Das unbekannte Nichts erwartet dich.",
    difficulty: "Extreme",
    bossPool: ["abyslord", "nihilo"],
    colorA: "#7316bd",
    colorB: "#f5e2ff",
    coreColor: "#2d053d",
    gradient: ["#7316bd", "#f5e2ff"],
  },
  {
    id: "duality",
    name: "Himmel & Hölle",
    description: "Gegensätze ziehen sich an.",
    difficulty: "Epic",
    bossPool: ["angelus", "demonus"],
    colorA: "#ff3a2e", // Hölle (links)
    colorB: "#48c6ef", // Himmel (rechts)
    coreColor: "#2d053d",
    gradient: ["#ff3a2e", "#fff", "#48c6ef"], // für LinearGradient-Button
    dual: true, // Custom-Flag für dualen Effekt
  },
  // weitere ...
];
