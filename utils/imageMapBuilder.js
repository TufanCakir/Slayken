import {
  skillKeys,
  classKeys,
  bossKeys,
  bgKeys,
  equipmentKeys,
  itemKeys,
} from "./imageMapKeys";

// Helper für News/Event-Boss Keys
export function getEventBossKey(url) {
  const match = /\/([\w-]+)\.png$/i.exec(url);
  return match ? "eventboss_" + match[1].toLowerCase() : null;
}

export function buildImageMap(localUris, newsImages) {
  const map = {};
  let idx = 0;

  // Skills
  skillKeys.forEach((key) => {
    map[`skill_${key}`] = localUris[idx++];
  });

  // Klassen
  classKeys.forEach((key) => {
    map[`class_${key.replace(/-/g, "")}`] = localUris[idx++];
  });

  // Bosse UND Eventbosse synchronisieren
  bossKeys.forEach((key) => {
    // Boss
    map[`boss_${key.toLowerCase()}`] = localUris[idx];
    // Eventboss (direkt zuordnen – entweder aus newsImages oder aus dem Bossbild)
    map[`eventboss_${key.toLowerCase()}`] = localUris[idx];
    idx++;
  });

  // Hintergründe
  bgKeys.forEach((key, i) => {
    map[`bg_${i + 1}`] = localUris[idx++];
    if (key.startsWith("bg_")) map[key] = localUris[idx - 1];
  });

  // Ausrüstung
  equipmentKeys.forEach((key) => {
    map[`equipment_${key}`] = localUris[idx++];
  });

  // Items
  itemKeys.forEach((key) => {
    map[key] = localUris[idx++];
  });

  // Main-Background
  map["slayken"] = localUris[idx++];

  // News/EventBosse – falls du andere brauchst
  newsImages.forEach((img, i) => {
    const key = getEventBossKey(img);
    if (key && localUris[idx]) {
      map[key] = localUris[idx++];
    }
  });

  return map;
}
