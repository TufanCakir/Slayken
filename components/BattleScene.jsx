import { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import ActionBar from "./skills/ActionBar";
import FireEffect from "./skills/FireEffect";
import FrostEffect from "./skills/FrostEffect";
import VoidEffect from "./skills/voidEffect";
import NaturEffect from "./skills/NaturEffect";
import StormStrikeEffect from "./skills/StormStrikeEffect";
import { useClass } from "../context/ClassContext";
import { skillPool } from "../data/skillPool";
import { getBossImageUrl } from "../utils/boss/bossUtils";
import { useThemeContext } from "../context/ThemeContext";

const BLUE_XP = "blue";
const HP_BOSS = "red";

// Helper
function getClassKey(imageUrl) {
  const match = /\/([\w-]+)\.png$/i.exec(imageUrl);
  return match ? "class_" + match[1].toLowerCase() : null;
}
function getEventBossKey(imageUrl) {
  const match = /\/([\w-]+)\.png$/i.exec(imageUrl);
  return match ? "eventboss_" + match[1].toLowerCase() : null;
}

export default function BattleScene({
  boss,
  bossHp,
  bossDefeated,
  onSkillPress,
  handleFight,
  imageMap = {},
  expReward = 120,
  accountExpReward = 100,
  coinReward = 100,
  crystalReward = 30,
  skillDmg = 30,
}) {
  // HOOKS: immer oben!
  const { classList, activeClassId } = useClass();
  const [activeEffect, setActiveEffect] = useState(null);
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  // Finde aktiven Char
  const activeCharacter = classList.find((c) => c.id === activeClassId);
  if (!activeCharacter) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.textLight}>Kein aktiver Charakter gefunden.</Text>
      </View>
    );
  }

  // EffectMap als Konstante (nicht als useState!)
  const effectMap = {
    FireEffect,
    FrostEffect,
    VoidEffect,
    NaturEffect,
    StormStrikeEffect,
  };

  // Werte aus Char
  const { name, level, exp, expToNextLevel, classUrl } = activeCharacter;
  const maxHp = boss?.maxHp || 100;
  const bossHpPercent = Math.max(0, Math.min((bossHp / maxHp) * 100, 100));
  const bossName = boss?.name || boss?.eventName || "Unbekannter Boss";

  // Bild-Mapping
  const bossImgKey = getEventBossKey(boss?.image);
  const bossImgSrc =
    (bossImgKey && imageMap[bossImgKey]) ||
    boss?.image ||
    getBossImageUrl(boss?.id);

  const classKey = getClassKey(classUrl);
  const classImgSrc = imageMap[classKey] || classUrl;

  // Skill Handling
  const handleSkillPress = (skill) => {
    if (!skill) return;
    onSkillPress?.(skill);
    if (effectMap[skill.effect]) {
      setActiveEffect(skill.effect);
    } else {
      handleFight?.(skill);
    }
  };

  // Effekt-Komponente, falls aktiv
  let EffectComponent = null;
  if (activeEffect && effectMap[activeEffect]) {
    const Component = effectMap[activeEffect];
    EffectComponent = (
      <Component
        onEnd={() => {
          setActiveEffect(null);
          handleFight?.({ effect: activeEffect, power: skillDmg });
        }}
      />
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Boss-Anzeige */}
      <View style={styles.bossContainer}>
        <BlurView intensity={55} tint="dark" style={styles.bossInfo}>
          <Text style={styles.title}>{bossName}</Text>
          <Text style={styles.hpLabel}>
            HP: <Text style={bossHp}>{bossHp}</Text> / {maxHp}
          </Text>
          <View style={styles.hpBarContainer}>
            <View
              style={[
                styles.hpBar,
                {
                  width: `${bossHpPercent}%`,
                  backgroundColor: HP_BOSS,
                },
              ]}
            />
          </View>
          {/* Rewards
          <View style={styles.rewardsRow}>
            <Text style={styles.rewardText}>Belohnungen:</Text>
            <Text style={styles.rewardText}>+{expReward} EXP</Text>
            <Text style={styles.rewardText}>+{accountExpReward} AccXP</Text>
            <Text style={styles.rewardText}>+{coinReward}💰</Text>
            <Text style={styles.rewardText}>+{crystalReward}💎</Text>
          </View> */}
          {bossDefeated && (
            <Text style={styles.victory}>✅ Du hast {bossName} besiegt!</Text>
          )}
        </BlurView>
        <Image
          source={bossImgSrc}
          style={styles.bossImage}
          contentFit="contain"
          transition={300}
        />
      </View>

      {/* Spieler-Anzeige */}
      <Pressable
        style={styles.playerArea}
        onPress={() => !bossDefeated && handleFight?.()}
      >
        <View style={styles.avatarWrapper}>
          <BlurView intensity={50} tint="dark" style={styles.characterInfo}>
            <Text style={styles.charName}>{name}</Text>
            <Text style={styles.charLevel}>Level {level}</Text>
            <Text style={styles.charXp}>
              XP {exp} / {expToNextLevel}
            </Text>
            <View style={styles.xpBarContainer}>
              <View
                style={[
                  styles.xpBar,
                  {
                    width: `${Math.min((exp / expToNextLevel) * 100, 100)}%`,
                    backgroundColor: BLUE_XP,
                  },
                ]}
              />
            </View>
          </BlurView>
          <Image
            source={classImgSrc}
            style={styles.avatar}
            contentFit="contain"
          />
        </View>
      </Pressable>

      {/* Effekt */}
      {EffectComponent}

      {/* Skills */}
      <ActionBar
        skills={skillPool}
        activeCharacter={activeCharacter}
        onSkillPress={handleSkillPress}
        imageMap={imageMap}
      />
    </View>
  );
}

function createStyles(theme) {
  const accent = theme.accentColor || "#191919";
  const text = theme.textColor || "#fff";
  const shadow = theme.shadowColor || "#222";
  const border = theme.borderColor || "#ff8800";
  const glow = theme.glowColor || "#ffd70088";
  const highlight = theme.borderGlowColor || "#ffd700cc";

  return StyleSheet.create({
    wrapper: { flex: 1 },

    bossContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
      gap: 16,
    },
    bossInfo: {
      flex: 1,
      marginRight: 12,
      borderRadius: 14,
      padding: 16,
      borderWidth: 2,
      borderColor: border,
      backgroundColor: theme.shadowColor,
      minWidth: 160,
      shadowColor: shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.16,
      shadowRadius: 9,
      elevation: 7,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: highlight,
      marginBottom: 4,
      letterSpacing: 0.5,
      textShadowColor: glow,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    hpLabel: {
      fontSize: 13,
      color: text,
      marginBottom: 5,
    },
    bossHp: {
      fontSize: 12,
      color: highlight,
      marginBottom: 5,
    },
    hpBarContainer: {
      width: "100%",
      height: 20,
      borderRadius: 7,
      backgroundColor: shadow,
      marginBottom: 6,
      overflow: "hidden",
    },
    hpBar: {
      height: "100%",
      borderRadius: 7,
      backgroundColor: highlight,
    },
    rewardsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      alignItems: "center",
      marginBottom: 4,
      marginTop: 2,
    },
    rewardText: {
      fontSize: 12,
      color: highlight,
      marginRight: 6,
    },
    bossImage: {
      width: 90,
      height: 90,
      borderRadius: 12,
      borderWidth: 2,
      backgroundColor: theme.shadowColor,
      borderColor: highlight,
    },
    victory: {
      fontSize: 15,
      fontWeight: "bold",
      marginTop: 10,
      color: highlight,
      letterSpacing: 0.2,
      textShadowColor: glow,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },

    playerArea: { flex: 1, alignItems: "center", justifyContent: "center" },
    avatarWrapper: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      gap: 12,
    },
    characterInfo: {
      flex: 1,
      borderRadius: 13,
      padding: 15,
      borderWidth: 2,
      borderColor: highlight,
      backgroundColor: accent + "ee",
      minWidth: 160,
      marginRight: 10,
      shadowColor: shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 5,
      elevation: 5,
      backgroundColor: theme.shadowColor,
    },
    charName: {
      fontSize: 15,
      fontWeight: "bold",
      color: highlight,
      marginBottom: 2,
      textShadowColor: glow,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    charLevel: {
      fontSize: 12,
      color: border,
      marginBottom: 2,
      fontWeight: "600",
    },
    charXp: {
      fontSize: 12,
      color: highlight,
      marginBottom: 5,
    },
    xpBarContainer: {
      width: "100%",
      height: 20,
      borderRadius: 7,
      backgroundColor: shadow,
      marginBottom: 6,
      overflow: "hidden",
    },
    xpBar: {
      height: "100%",
      borderRadius: 5,
      backgroundColor: border,
    },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 12,
      backgroundColor: theme.shadowColor,
      borderWidth: 2,
      borderColor: highlight,
    },
    textLight: {
      fontSize: 14,
      color: text + "bb",
      textAlign: "center",
      marginTop: 40,
    },
  });
}
