import { getSkillImageUrl } from "../utils/skillUtils";

export const skillPool = [
  {
    id: "Fireball",
    name: "fireball",
    description: "Ein mächtiger Feuerball.",
    level: 2,
    element: "fire",
    power: 100,
    effect: "FireEffect",
    image: getSkillImageUrl("fireball"),
    cooldown: 3000,
  },
  {
    id: "frostball",
    name: "Frostball",
    description: "Frostangriff mit Verlangsamung.",
    level: 2,
    element: "ice",
    power: 5,
    effect: "FrostEffect",
    image: getSkillImageUrl("frostball"),
    cooldown: 300,
  },
];
