import { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import ActionBar from "./skills/ActionBar";
import FireEffect from "./skills/FireEffect";
import FrostEffect from "./skills/FrostEffect";
import VoidEffect from "./skills/voidEffect";
import NaturEffect from "./skills/NaturEffect";
import { useClass } from "../context/ClassContext";
import { skillPool } from "../data/skillPool";

const BLUE_BG = "#0f172a";
const BLUE_DARK = "#1e293b";
const BLUE = "#2563eb";
const BLUE_ACCENT = "#60a5fa";
const BLUE_BORDER = "#38bdf8";
const BLUE_XP = "#38bdf8";
const HP_BOSS = "#0ea5e9";
const GOLD = "#facc15";
const TEXT_MUTED = "#a3bffa";

export default function BattleScene({
  bossName,
  bossImage,
  bossHp,
  bossDefeated,
  onSkillPress,
  handleFight,
  bossBackground, // ✅ nicht vergessen
}) {
  console.log("✅ BossBackground in Scene:", bossBackground);

  const { classList, activeClassId } = useClass();
  const activeCharacter = classList.find((c) => c.id === activeClassId);
  const [activeEffect, setActiveEffect] = useState(null);

  // Map für Effekte
  const effectMap = {
    FireEffect,
    FrostEffect,
    VoidEffect,
    NaturEffect,
  };

  if (!activeCharacter) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.textLight}>Kein aktiver Charakter gefunden.</Text>
      </View>
    );
  }

  const { name, level, exp, expToNextLevel, classUrl, element } =
    activeCharacter;

  const bossHpPercent = Math.max(0, Math.min(bossHp, 100)).toFixed(1);

  // Freigeschaltete Skills berechnen:
  const unlockedSkills = skillPool.filter((skill) => {
    if ((level || 1) < (skill.level || 1)) return false;
    if (skill.allowedElements && !skill.allowedElements.includes(element))
      return false;
    if (skill.element && skill.element !== element) return false;
    return true;
  });

  // Skill-Klick
  const handleSkillPress = (skill) => {
    if (!skill) return;
    onSkillPress?.(skill);

    if (effectMap[skill.effect]) {
      setActiveEffect(skill.effect);
    } else {
      handleFight(skill);
    }
  };

  // Effekt nur als Component rendern, wenn aktiv
  let EffectComponent = null;
  if (activeEffect && effectMap[activeEffect]) {
    const Component = effectMap[activeEffect];
    EffectComponent = (
      <Component
        onEnd={() => {
          setActiveEffect(null);
          handleFight({ effect: activeEffect });
        }}
      />
    );
  }

  return (
    <View style={styles.wrapper}>
      {bossBackground && (
        <Image
          source={{ uri: bossBackground }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      )}

      {/* Boss-Anzeige */}
      <View style={styles.bossContainer}>
        <BlurView intensity={55} tint="dark" style={styles.bossInfo}>
          <Text style={styles.title}>{bossName}</Text>
          <Text style={styles.hpLabel}>HP: {bossHpPercent}%</Text>
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
          {bossDefeated && (
            <Text style={styles.victory}>✅ Du hast {bossName} besiegt!</Text>
          )}
        </BlurView>
        <Image
          source={{ uri: bossImage }}
          style={styles.bossImage}
          contentFit="contain"
          transition={300}
        />
      </View>

      {/* Spieler-Anzeige */}
      <Pressable
        style={styles.playerArea}
        onPress={() => !bossDefeated && handleFight()}
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
            source={{ uri: classUrl }}
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderColor: BLUE_BORDER,
    backgroundColor: "rgba(15,23,42,0.75)",
    minWidth: 160,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: GOLD,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  hpLabel: { fontSize: 13, color: TEXT_MUTED, marginBottom: 5 },
  hpBarContainer: {
    width: "100%",
    height: 14,
    borderRadius: 7,
    backgroundColor: BLUE_DARK,
    marginBottom: 6,
    overflow: "hidden",
  },
  hpBar: { height: "100%", borderRadius: 7 },
  bossImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: BLUE_DARK,
    borderWidth: 2,
    borderColor: BLUE_ACCENT,
  },
  victory: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 10,
    color: GOLD,
    letterSpacing: 0.2,
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
    borderColor: BLUE_XP,
    backgroundColor: "rgba(30,41,59,0.8)",
    minWidth: 160,
    marginRight: 10,
  },
  charName: {
    fontSize: 15,
    fontWeight: "bold",
    color: BLUE_ACCENT,
    marginBottom: 2,
  },
  charLevel: { fontSize: 12, color: GOLD, marginBottom: 2 },
  charXp: { fontSize: 12, color: BLUE_XP, marginBottom: 5 },
  xpBarContainer: {
    width: "100%",
    height: 10,
    borderRadius: 5,
    backgroundColor: BLUE_DARK,
    overflow: "hidden",
  },
  xpBar: { height: "100%", borderRadius: 5 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: BLUE_DARK,
    borderWidth: 2,
    borderColor: BLUE_ACCENT,
  },
  textLight: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    marginTop: 40,
  },
});
