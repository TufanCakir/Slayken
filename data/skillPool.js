import { getSkillImageUrl } from "../utils/skillUtils";

export const skillPool = [
  {
    id: "fireball",
    name: "fireball",
    description: "Ein mächtiger Feuerball.",
    level: 3,
    element: ["fire", "ice"], // Mehrere Elemente!
    power: 5,
    effect: "FireEffect",
    image: getSkillImageUrl("fire"),
    cooldown: 3000,
  },
  {
    id: "frostball",
    name: "Frostball",
    description: "Frostangriff mit Verlangsamung.",
    level: 6,
    element: ["ice"],
    power: 5,
    effect: "FrostEffect",
    image: getSkillImageUrl("frostball"),
    cooldown: 3000,
  },
  {
    id: "voidrift",
    name: "Voidball",
    description: "Dunkle Energie aus der Leere.",
    level: 9,
    element: ["void", "fire"], // Kombiniert!
    power: 5,
    effect: "VoidEffect",
    image: getSkillImageUrl("voidrift"),
    cooldown: 3000,
  },
  {
    id: "naturball",
    name: "Naturball",
    description:
      "Reine Naturenergie, inspiriert von der wilden Kraft der Tiere.",
    level: 12,
    element: ["void", "fire"], // Kombiniert!
    power: 5,
    effect: "NaturEffect",
    image: getSkillImageUrl("naturball"),
    cooldown: 3000,
  },
];
