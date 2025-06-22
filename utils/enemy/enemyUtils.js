export function createEnemyFromClass(char) {
  return {
    id: `${char.id}-enemy`,
    name: `${char.id} (Gegner)`,
    description: `Ein Duplikat von ${char.id}`,
    image: char.classUrl || "",
    element: char.element,
    power: char.stats.strength,
  };
}
