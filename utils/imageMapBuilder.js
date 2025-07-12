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

/**
 * Erstellt ein Mapping aus Keys zu lokalen Bild-URIs.
 * Erwartet, dass localUris in der Reihenfolge aller imageKeys geliefert wird!
 * Robust gegenüber zu kurzen/zu langen Arrays.
 */
export function buildImageMap(localUris = [], newsImages = []) {
  const map = {};
  let idx = 0;

  // Helper für sicheres Poppen oder "" zurückgeben
  const safeUri = () => (idx < localUris.length ? localUris[idx++] : "");

  // Skills
  for (const key of skillKeys) {
    map[`skill_${key}`] = safeUri();
  }

  // Klassen
  for (const key of classKeys) {
    map[`class_${key.replace(/-/g, "")}`] = safeUri();
  }

  // Bosse UND Eventbosse synchronisieren (Bosskey + eventboss_key)
  for (const key of bossKeys) {
    const uri = safeUri();
    map[`boss_${key.toLowerCase()}`] = uri;
    map[`eventboss_${key.toLowerCase()}`] = uri;
  }

  // Hintergründe
  for (let i = 0; i < bgKeys.length; i++) {
    const key = bgKeys[i];
    const uri = safeUri();
    map[`bg_${i + 1}`] = uri;
    if (key.startsWith("bg_")) map[key] = uri;
  }

  // Ausrüstung
  for (const key of equipmentKeys) {
    map[`equipment_${key}`] = safeUri();
  }

  // Items
  for (const key of itemKeys) {
    map[key] = safeUri();
  }

  // Main-Background (optional)
  if (idx < localUris.length) {
    map["slayken"] = safeUri();
  }

  // News/Eventboss-Keys (aus newsImages)
  for (const img of newsImages) {
    const key = getEventBossKey(img);
    if (key && idx < localUris.length) {
      map[key] = safeUri();
    }
  }

  // Falls zu viele Bilder: Rest ignorieren. Falls zu wenige: Leere Strings als Fallback.

  return map;
}
