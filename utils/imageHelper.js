import {
  skillKeys,
  classKeys,
  bossKeys,
  bgKeys,
  equipmentKeys,
  itemKeys,
} from "./imageMapKeys";
import { getClassImageUrl } from "./classUtils";
import { getBossImageUrl } from "./boss/bossUtils";
import { getSkillImageUrl } from "./skillUtils";
import { getBossBackgroundUrl } from "./boss/backgroundUtils";
import { getEquipmentImageUrl } from "./equipment/equipment";
import { getItemImageUrl } from "./item/itemUtils";
import newsData from "../data/newsData.json";

export function getImportantImages(themeBgImage) {
  const skillImages = skillKeys.map(getSkillImageUrl);
  const classImages = classKeys.map(getClassImageUrl);
  const bossImages = bossKeys.map(getBossImageUrl);
  const bgImages = bgKeys.map(getBossBackgroundUrl);
  const equipmentImages = equipmentKeys.map(getEquipmentImageUrl);
  const itemImages = itemKeys.map(getItemImageUrl);
  const newsImages = newsData.map((e) => e.image);

  const images = [
    ...skillImages,
    ...classImages,
    ...bossImages,
    ...bgImages,
    ...equipmentImages,
    ...itemImages,
    themeBgImage,
    ...newsImages,
  ];

  return {
    images,
    newsImages,
  };
}
