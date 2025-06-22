import { getSkillImageUrl } from "../utils/skillUtils";

export const skillPool = [
  {
    id: "inferno",
    name: "Inferno",
    description: "Ein mächtiger Feuerball.",
    level: 1,
    element: "fire",
    power: 100,
    effect: "InfernoEffect",
    image: getSkillImageUrl("fireball"),
    cooldown: 2000, // 2 Sekunden Cooldown
  },
  {
    id: "heal",
    name: "Heilung",
    description: "Heilt dich um 50 HP.",
    level: 2,
    allowedElements: ["ice", "fire"],
    power: -50,
    effect: "HealEffect",
    image: getSkillImageUrl("healball"),
    cooldown: 3000,
  },
  {
    id: "frostball",
    name: "Frostball",
    description: "Frostangriff mit Verlangsamung.",
    level: 1,
    element: "ice",
    power: 5,
    effect: "FrostEffect",
    image: getSkillImageUrl("frostball"),
    cooldown: 1500,
  },
  {
    id: "shield-bash",
    name: "Shield Bash",
    description: "Betäubt den Gegner.",
    level: 3,
    element: "null",
    power: 200,
    image: getSkillImageUrl("shield-bash"),
    cooldown: 5000,
    active: false, // << wird nicht verwendet
  },
  {
    id: "fire-hurricane",
    name: "Fire Hurricane",
    description: "Ein Wirbel aus Flammen.",
    level: 4,
    element: "fire",
    power: 300,
    image: getSkillImageUrl("fire-hurricane"),
    cooldown: 6000,
    active: false, // << wird nicht verwendet
  },
];
