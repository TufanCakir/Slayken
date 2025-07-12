import { useState, useMemo } from "react";
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
import { useAssets } from "../context/AssetsContext";
import { getCharacterStatsWithEquipment } from "../utils/combat/statUtils";
import skinData from "../data/skinData.json";
import { scaleBossStats } from "../utils/combatUtils";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Effekt Mapping
const EFFECT_MAP = {
  FireEffect,
  FrostEffect,
  VoidEffect,
  NaturEffect,
  StormStrikeEffect,
};

function extractNameFromUrl(url) {
  if (typeof url !== "string") return "";
  const match = /\/([\w-]+)\.png$/i.exec(url);
  return match ? match[1].toLowerCase() : "";
}

export default function BattleScene({
  boss,
  bossHp,
  bossMaxHp,
  bossDefeated,
  onSkillPress,
  handleFight,
  skillDmg = 30,
  onBack, // <-- hinzugefügt
}) {
  const { classList, activeClassId } = useClass();
  const [activeEffect, setActiveEffect] = useState(null);
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const styles = createStyles(theme);

  const gradientColors = theme.linearGradient || [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  // Aktiver Charakter + Stats
  const activeCharacter = classList.find((c) => c.id === activeClassId);
  const { stats: charStats = {} } = useMemo(
    () =>
      activeCharacter
        ? getCharacterStatsWithEquipment(activeCharacter)
        : { stats: {} },
    [activeCharacter]
  );

  if (!activeCharacter) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.textLight}>Kein aktiver Charakter gefunden.</Text>
      </View>
    );
  }

  // Boss-Stats (mit Scaling, fallback-sicher)
  const scaledBoss = useMemo(
    () =>
      boss && activeCharacter
        ? scaleBossStats(boss, activeCharacter.level || 1)
        : boss,
    [boss, activeCharacter]
  );

  // Boss-Bild
  const bossKey = scaledBoss?.image
    ? `eventboss_${extractNameFromUrl(scaledBoss.image)}`
    : null;
  const bossImgSrc =
    imageMap[bossKey] || scaledBoss?.image || getBossImageUrl(scaledBoss?.id);

  // Charakter-Bild (Skin)
  const charId = activeCharacter.baseId || activeCharacter.id;
  let avatarSrc = activeCharacter.classUrl;
  if (activeCharacter.activeSkin) {
    const skin = skinData.find(
      (s) =>
        (s.characterId === charId || s.characterId === activeCharacter.id) &&
        s.id === activeCharacter.activeSkin
    );
    if (skin?.image) avatarSrc = skin.image;
  }
  const classKey =
    typeof avatarSrc === "string"
      ? `class_${extractNameFromUrl(avatarSrc)}`
      : null;
  const classImgSrc = imageMap[classKey] || avatarSrc;

  // Werte & Balken
  const { name, level, exp, expToNextLevel } = activeCharacter;
  const maxHp = bossMaxHp ?? scaledBoss?.hp ?? 100;
  const bossHpPercent = Math.max(0, Math.min((bossHp / maxHp) * 100, 100));
  const bossName =
    scaledBoss?.name || scaledBoss?.eventName || "Unbekannter Boss";
  const expPercent = Math.min((exp / expToNextLevel) * 100, 100);
  const characterSkills =
    activeCharacter.skills?.length > 0 ? activeCharacter.skills : skillPool;

  // Skill-Handler
  const handleSkill = (skill) => {
    if (!skill) return;
    onSkillPress?.(skill);
    if (EFFECT_MAP[skill.effect]) {
      setActiveEffect(skill.effect);
    } else {
      handleFight?.({
        effect: skill.effect,
        power:
          typeof skill.power === "number"
            ? skill.power
            : charStats.attack ?? skillDmg,
      });
    }
  };

  let EffectComponent = null;
  if (activeEffect && EFFECT_MAP[activeEffect]) {
    const Effect = EFFECT_MAP[activeEffect];
    EffectComponent = (
      <Effect
        onEnd={() => {
          setActiveEffect(null);
          handleFight?.({
            effect: activeEffect,
            power: charStats.attack ?? skillDmg,
          });
        }}
      />
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={onBack} hitSlop={18}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.backGradient}
          >
            <Ionicons name="arrow-back" size={24} color={theme.textColor} />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Boss-Anzeige */}
      <View style={styles.bossContainer}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bossInfoGradient}
        >
          <BlurView intensity={55} tint="dark" style={styles.bossInfoBlur}>
            <Text style={styles.title}>
              {bossName} (Lvl {activeCharacter.level || 1})
            </Text>
            <Text style={styles.hpLabel}>
              HP: <Text style={styles.hpValue}>{bossHp}</Text> / {maxHp}
            </Text>
            <View style={styles.barContainer}>
              <LinearGradient
                colors={[
                  theme.hpBarStart || "#ef2222",
                  theme.hpBarEnd || "#b90000",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.hpBar,
                  { width: `${bossHpPercent}%` },
                  bossHpPercent < 10 && { minWidth: 8 },
                ]}
              />
            </View>
            {bossDefeated && (
              <Text style={styles.victory}>✅ Du hast {bossName} besiegt!</Text>
            )}
          </BlurView>
        </LinearGradient>
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
        onPress={() => {
          if (!bossDefeated) {
            handleFight?.({
              effect: "basic",
              power: charStats.attack ?? skillDmg,
            });
          }
        }}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.characterInfoGradient}
        >
          <BlurView intensity={50} tint="dark" style={styles.characterInfoBlur}>
            <Text style={styles.charName}>{name}</Text>
            <Text style={styles.charLevel}>Level {level}</Text>
            <Text style={styles.charXp}>
              XP {exp} / {expToNextLevel}
            </Text>
            <View style={styles.xpBarContainer}>
              <LinearGradient
                colors={[
                  theme.xpBarStart || "#2175ff",
                  theme.xpBarEnd || "#15e3ff",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.xpBar,
                  { width: `${expPercent}%` },
                  expPercent < 10 && { minWidth: 8 },
                ]}
              />
            </View>
          </BlurView>
        </LinearGradient>
        <Image
          source={classImgSrc}
          style={styles.avatar}
          contentFit="contain"
        />
      </Pressable>

      {/* Effekte */}
      {EffectComponent}

      {/* ActionBar */}
      <ActionBar
        skills={characterSkills}
        activeCharacter={activeCharacter}
        onSkillPress={handleSkill}
        imageMap={imageMap}
      />
    </View>
  );
}

// -------- Styles --------
function createStyles(theme) {
  const text = theme.textColor || "#fff";
  const hpBg = theme.shadowColor || "#222";
  return StyleSheet.create({
    wrapper: { flex: 1 },
    bossContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
      gap: 16,
    },
    bossInfoGradient: {
      flex: 1,
      borderRadius: 14,
      marginRight: 12,
      minWidth: 180,
      maxWidth: 300,
      overflow: "hidden",
    },
    bossInfoBlur: {
      borderRadius: 14,
      padding: 16,
      backgroundColor: "transparent",
    },
    title: {
      fontSize: 18,
      color: text,
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    hpLabel: {
      fontSize: 13,
      color: text,
      marginBottom: 5,
    },
    hpValue: {
      fontSize: 12,
      color: text,
    },
    barContainer: {
      width: "100%",
      height: 20,
      backgroundColor: hpBg,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 6,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: "#1118",
      shadowColor: "#000",
      shadowOpacity: 0.13,
      shadowRadius: 6,
    },
    hpBar: {
      height: "100%",
      borderRadius: 8,
    },
    xpBarContainer: {
      width: 180,
      height: 12,
      backgroundColor: "#191970cc",
      borderRadius: 6,
      overflow: "hidden",
      marginTop: 5,
    },
    xpBar: {
      height: "100%",
      borderRadius: 6,
    },
    bossImage: {
      width: 200,
      height: 200,
      borderRadius: 12,
    },
    victory: {
      fontSize: 15,
      marginTop: 10,
      color: text,
      letterSpacing: 0.2,
    },
    playerArea: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    characterInfoGradient: {
      borderRadius: 13,
      marginRight: 10,
      minWidth: 160,
      overflow: "hidden",
    },
    characterInfoBlur: {
      borderRadius: 13,
      padding: 15,
      backgroundColor: "transparent",
    },
    charName: {
      fontSize: 15,
      color: text,
      marginBottom: 2,
    },
    charLevel: {
      fontSize: 12,
      color: text,
      marginBottom: 2,
      fontWeight: "600",
    },
    charXp: {
      fontSize: 12,
      color: text,
      marginBottom: 5,
    },
    avatar: {
      width: 200,
      height: 200,
      borderRadius: 12,
    },
    textLight: {
      fontSize: 14,
      color: text,
      textAlign: "center",
      marginTop: 40,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    backButton: {
      width: 50,
      height: 50,
      borderRadius: 24,
      overflow: "hidden",
      justifyContent: "center",
    },
    backGradient: {
      width: 50,
      height: 50,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
    },
  });
}
