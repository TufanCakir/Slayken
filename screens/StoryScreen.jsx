import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useClass } from "../context/ClassContext";
import { useLevelSystem } from "../hooks/useLevelSystem";
import BattleScene from "../components/BattleScene";
import { useMissions } from "../context/MissionContext";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import bossData from "../data/bossData.json";
import chapterData from "../data/chapterData.json";
import { Image } from "expo-image";
import { useCompleteMissionOnce } from "../utils/mission/missionUtils";
import { calculateSkillDamage, scaleBossStats } from "../utils/combatUtils";
import { getCharacterStatsWithEquipment } from "../utils/combat/statUtils";
import ScreenLayout from "../components/ScreenLayout";

const COIN_REWARD = 100;
const CRYSTAL_REWARD = 30;

// Helper functions
function getEventBossKey(imageUrl, fallbackName) {
  let name = null;
  if (typeof imageUrl === "string") {
    const match = /\/([\w-]+)\.png$/i.exec(imageUrl);
    name = match ? match[1] : null;
  }
  if (!name && fallbackName) name = fallbackName;
  return name ? "eventboss_" + name.toLowerCase() : null;
}

function getBackgroundKey(bgUrl) {
  if (!bgUrl) return null;
  const match = /\/([\w-]+)\.png$/i.exec(bgUrl);
  return match ? "bg_" + match[1].toLowerCase() : null;
}

export default function StoryScreen() {
  const navigation = useNavigation();
  const { imageMap } = useAssets();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { classList, activeClassId, updateCharacter } = useClass();
  const { gainExp } = useLevelSystem();
  const { missions } = useMissions();
  const completeMissionOnce = useCompleteMissionOnce();
  const { theme } = useThemeContext();

  const activeCharacter = classList.find((c) => c.id === activeClassId);

  const [selectedChapter, setSelectedChapter] = useState(null);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp, setBossMaxHp] = useState(100);
  const [newUnlockedSkills, setNewUnlockedSkills] = useState(null);

  const styles = createStyles(theme);

  // Boss laden, wenn Kapitel gewählt
  useEffect(() => {
    if (!selectedChapter || !activeCharacter) return;
    const boss = bossData.find((b) => b.id === selectedChapter.bossId);
    const scaled = scaleBossStats(boss, activeCharacter.level || 1);
    setCurrentBoss(scaled);
    setBossHp(scaled.hp || 100);
    setBossMaxHp(scaled.hp || 100);
  }, [selectedChapter, activeCharacter]);

  // Bei Boss-/Char-Wechsel MaxHP immer korrekt setzen!
  useEffect(() => {
    if (currentBoss) {
      setBossHp(currentBoss.hp ?? 100);
      setBossMaxHp(currentBoss.hp ?? 100);
    }
  }, [currentBoss]);

  // --- Kampflogik & XP ---
  const handleFight = useCallback(
    (skill) => {
      if (!activeCharacter || !currentBoss) return;

      const { stats, percentBonuses } =
        getCharacterStatsWithEquipment(activeCharacter);
      const skillPower = skill?.power ?? 30;

      const damage = calculateSkillDamage({
        charStats: stats,
        percentBonuses,
        skill: { skillDmg: skillPower },
        enemyDefense: currentBoss.defense || 0,
      });

      setBossHp((prevHp) => {
        const newHp = Math.max(prevHp - damage, 0);
        if (newHp === 0) {
          setTimeout(() => {
            addCoins(COIN_REWARD);
            addCrystals(CRYSTAL_REWARD);
            addXp(100);
            completeMissionOnce("1");

            const updatedCharacter = gainExp(activeCharacter, 120);
            updateCharacter(updatedCharacter);

            const oldSkills = (activeCharacter.skills || []).map((s) => s.name);
            const newSkills = (updatedCharacter.skills || []).filter(
              (s) => !oldSkills.includes(s.name)
            );

            if (newSkills.length > 0) {
              setNewUnlockedSkills(newSkills);
            } else {
              // Reset auf Kapitel-Auswahl
              setSelectedChapter(null);
              setCurrentBoss(null);
              setBossHp(100);
              setBossMaxHp(100);
            }
          }, 300);
        }
        return newHp;
      });
    },
    [
      activeCharacter,
      currentBoss,
      addCoins,
      addCrystals,
      addXp,
      gainExp,
      updateCharacter,
      completeMissionOnce,
    ]
  );

  const handleCloseSkillModal = useCallback(() => {
    setNewUnlockedSkills(null);
    setSelectedChapter(null);
    setCurrentBoss(null);
    setBossHp(100);
    setBossMaxHp(100);
  }, []);

  // Hintergrund & Bildzuordnung
  const bossBgKey = getBackgroundKey(currentBoss?.background);
  const bossBgSrc =
    (bossBgKey && imageMap[bossBgKey]) || currentBoss?.background;

  const mappedBoss = currentBoss
    ? {
        ...currentBoss,
        image:
          (getEventBossKey(currentBoss.image, currentBoss.name) &&
            imageMap[getEventBossKey(currentBoss.image, currentBoss.name)]) ||
          currentBoss.image,
      }
    : null;

  // Kapitel-Auswahl
  if (!selectedChapter) {
    return (
      <ScreenLayout style={styles.container}>
        <Text style={styles.header}>Wähle ein Kapitel</Text>
        <FlatList
          data={chapterData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chapterList}
          renderItem={({ item }) => {
            const boss = bossData.find((b) => b.id === item.bossId);
            const bossImage = boss
              ? imageMap[getEventBossKey(boss.image, boss.name || boss.id)] ||
                boss.image
              : null;
            return (
              <TouchableOpacity
                style={styles.chapterCard}
                onPress={() => setSelectedChapter(item)}
              >
                <Image
                  source={bossImage}
                  style={styles.chapterImage}
                  contentFit="contain"
                />
                <View style={styles.chapterOverlay}>
                  <Text style={styles.chapterTitle}>{item.label}</Text>
                  <Text style={styles.chapterDesc}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </ScreenLayout>
    );
  }

  // Kampf-Ansicht
  return (
    <View style={styles.container}>
      {bossBgSrc && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={bossBgSrc}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={400}
          />
        </View>
      )}
      <Pressable
        style={styles.backButton}
        onPress={() => setSelectedChapter(null)}
      >
        <Text style={styles.backText}>← Zurück zur Kapitel-Auswahl</Text>
      </Pressable>

      <Text style={styles.chapterTitleFight}>{selectedChapter.label}</Text>

      {currentBoss && (
        <BattleScene
          boss={mappedBoss}
          bossHp={bossHp}
          bossMaxHp={bossMaxHp}
          bossDefeated={bossHp === 0}
          handleFight={handleFight}
          bossBackground={bossBgSrc}
          imageMap={imageMap}
        />
      )}

      {newUnlockedSkills && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.modalOverlay}>
            <View style={styles.skillModal}>
              <Text style={styles.skillModalTitle}>
                🎉 Neue Skills freigeschaltet!
              </Text>
              {newUnlockedSkills.map((skill, idx) => (
                <View key={idx} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillDescription}>
                    {skill.description}
                  </Text>
                  <Text style={styles.skillPower}>Power: {skill.power}</Text>
                </View>
              ))}
              <Pressable
                style={styles.okButton}
                onPress={handleCloseSkillModal}
              >
                <Text style={styles.okText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ---------- STYLES ----------
function createStyles(theme) {
  const accent = theme.accentColor || "#191919";
  const text = theme.textColor || "#fff";
  const glow = theme.glowColor || "#ffd70088";
  const highlight = theme.borderGlowColor || "#ffd700cc";
  const cardBg = accent + "ee";

  return StyleSheet.create({
    container: { flex: 1 },
    header: {
      fontSize: 24,
      color: highlight,
      marginBottom: 12,
      textAlign: "center",
      letterSpacing: 0.4,
      fontWeight: "bold",
    },
    chapterList: { padding: 12, gap: 12 },
    chapterCard: {
      backgroundColor: cardBg,
      borderRadius: 18,
      height: 200,
      marginVertical: 6,
      overflow: "hidden",
    },
    chapterImage: { flex: 1, borderRadius: 18, width: "100%" },
    chapterOverlay: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      backgroundColor: accent,
      padding: 9,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
    },
    chapterTitle: {
      color: highlight,
      fontSize: 18,
      fontWeight: "bold",
      letterSpacing: 0.1,
    },
    chapterDesc: {
      color: text,
      fontSize: 14,
      marginTop: 3,
      fontWeight: "500",
    },
    backButton: {
      marginVertical: 10,
      padding: 4,
      alignSelf: "flex-start",
    },
    backText: {
      fontSize: 16,
      color: highlight,
      fontWeight: "bold",
    },
    chapterTitleFight: {
      color: highlight,
      fontSize: 22,
      marginBottom: 12,
      textAlign: "center",
      letterSpacing: 0.5,
      fontWeight: "bold",
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.7)",
    },
    skillModal: {
      backgroundColor: accent + "f5",
      padding: 20,
      margin: 32,
      borderRadius: 16,
    },
    skillModalTitle: {
      color: highlight,
      fontWeight: "bold",
      fontSize: 18,
      marginBottom: 12,
      textAlign: "center",
      textShadowColor: glow,
      textShadowRadius: 8,
    },
    skillItem: { marginBottom: 13 },
    skillName: {
      fontSize: 16,
      color: highlight,
      fontWeight: "bold",
    },
    skillDescription: { fontSize: 14, color: text },
    skillPower: { fontSize: 12, color: text, fontStyle: "italic" },
    okButton: {
      backgroundColor: highlight,
      padding: 10,
      borderRadius: 10,
      alignSelf: "center",
      marginTop: 16,
    },
    okText: { color: accent, fontWeight: "bold" },
  });
}
