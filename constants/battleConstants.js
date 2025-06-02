// Datei: constants/battleConstants.js
import bossData from "../data/bossData.json";
import eventData from "../data/eventData.json";
import characterData from "../data/characterData.json";
import seasonalData from "../data/seasonalData.json";

export const difficultyLevels = [
  { key: "Easy", label: "Leicht" },
  { key: "Medium", label: "Normal" },
  { key: "Hard", label: "Albtraum" },
  { key: "Hell", label: "Hölle" },
];

export const chapterMap = {
  boss: bossData,
  event: eventData,
  characters: characterData,
  seasonal: seasonalData,
};
