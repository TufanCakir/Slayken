import { useState, useEffect, useCallback } from "react";
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
import { useThemeContext } from "../context/ThemeContext"; // schon vorhanden!

import bossData from "../data/bossData.json";
import chapterData from "../data/chapterData.json";
import { Image } from "expo-image";
import { useCompleteMissionOnce } from "../utils/mission/missionUtils";

const COIN_REWARD = 100;
const CRYSTAL_REWARD = 30;
const PLAYER_MAX_HP_DEFAULT = 100;

function getEventBossKey(imageUrl, fallbackName) {
  if (!imageUrl && !fallbackName) return null;
  let name = null;
  if (typeof imageUrl === "string" && imageUrl.endsWith(".png")) {
    const match = /\/([\w-]+)\.png$/i.exec(imageUrl);
    name = match ? match[1] : null;
  }
  if (!name && fallbackName) {
    name = fallbackName;
  }
  return name ? "eventboss_" + name.toLowerCase() : null;
}

function getBackgroundKey(bgUrl) {
  if (!bgUrl) return null;
  const match = /\/([\w-]+)\.png$/i.exec(bgUrl);
  return match ? "bg_" + match[1].toLowerCase() : null;
}

export default function StoryScreen({ imageMap = {} }) {
  const navigation = useNavigation();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { classList, activeClassId, updateCharacter } = useClass();
  const { gainExp } = useLevelSystem();
  const { missions, markMissionCompleted } = useMissions();
  const completeMissionOnce = useCompleteMissionOnce();

  const activeCharacter = classList.find((c) => c.id === activeClassId);
  const maxHp = activeCharacter?.maxHp || PLAYER_MAX_HP_DEFAULT;

  const [selectedChapter, setSelectedChapter] = useState(null);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHp, setBossHp] = useState(100);

  const [newUnlockedSkills, setNewUnlockedSkills] = useState(null);
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  useEffect(() => {
    if (!selectedChapter) return;
    const boss = bossData.find((b) => b.id === selectedChapter.bossId);
    setCurrentBoss(boss);
    setBossHp(boss?.hp || 100);
  }, [selectedChapter]);

  const handleFight = useCallback(
    (skill) => {
      if (!activeCharacter || !currentBoss) return;

      const damage = typeof skill?.power === "number" ? skill.power : 20;

      setBossHp((prevBossHp) => {
        const newHp = Math.max(prevBossHp - damage, 0);

        if (newHp === 0) {
          setTimeout(() => {
            addCoins(COIN_REWARD);
            addCrystals(CRYSTAL_REWARD);
            addXp(100);
            completeMissionOnce("1");

            const updatedCharacter = gainExp(activeCharacter, 120);
            updateCharacter(updatedCharacter);

            const oldSkillNames = (activeCharacter.skills || []).map(
              (s) => s.name
            );
            const newSkills = (updatedCharacter.skills || []).filter(
              (s) => !oldSkillNames.includes(s.name)
            );

            if (newSkills.length > 0) {
              setNewUnlockedSkills(newSkills);
            } else {
              setSelectedChapter(null);
              setCurrentBoss(null);
              setBossHp(100);
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
  }, []);

  // Prozent-HP für Balkenanzeige
  const bossHpPercent =
    currentBoss && currentBoss.hp
      ? Math.round((bossHp / currentBoss.hp) * 100)
      : 0;

  // Gemapptes Bossobjekt mit gecachtem Bild
  const mappedBoss = currentBoss
    ? {
        ...currentBoss,
        image:
          (getEventBossKey(
            currentBoss.image,
            currentBoss.name || currentBoss.id
          ) &&
            imageMap[
              getEventBossKey(
                currentBoss.image,
                currentBoss.name || currentBoss.id
              )
            ]) ||
          currentBoss.image,
      }
    : null;

  // Boss-Hintergrund gecacht
  const bossBgKey = getBackgroundKey(currentBoss?.background);
  const bossBgSrc =
    (bossBgKey && imageMap[bossBgKey]) || currentBoss?.background;

  if (!selectedChapter) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Wähle ein Kapitel</Text>
        <FlatList
          data={chapterData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          renderItem={({ item }) => {
            const boss = bossData.find((b) => b.id === item.bossId);
            const bossImage =
              (boss &&
                imageMap[getEventBossKey(boss.image, boss.name || boss.id)]) ||
              boss?.image;
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
      </View>
    );
  }
  console.log("StoryScreen bossBgSrc:", bossBgSrc);
  const bossBackgroundSource =
    bossBgSrc && typeof bossBgSrc === "string" ? { uri: bossBgSrc } : bossBgSrc;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.backButton}
        onPress={() => setSelectedChapter(null)}
      >
        <Text style={styles.backText}>← Zurück zur Kapitel-Auswahl</Text>
      </Pressable>

      <Text style={styles.chapterTitleFight}>{selectedChapter.label}</Text>

      {bossBgSrc && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={
              typeof bossBgSrc === "string" ? { uri: bossBgSrc } : bossBgSrc
            }
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={400}
          />
          <View style={StyleSheet.absoluteFillObject} />
        </View>
      )}

      {currentBoss && (
        <BattleScene
          boss={mappedBoss}
          bossHp={bossHpPercent}
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

// Styles:
function createStyles(theme) {
  const accent = theme.accentColor || "#191919";
  const text = theme.textColor || "#fff";
  const glow = theme.glowColor || "#ffd70088";
  const highlight = theme.borderGlowColor || "#ffd700cc";
  const cardBg = accent + "ee";

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      fontSize: 24,
      color: highlight,
      marginBottom: 12,
      textAlign: "center",
      letterSpacing: 0.4,
    },
    chapterCard: {
      backgroundColor: cardBg,
      borderRadius: 18,
      height: 200,
      marginVertical: 6,
      overflow: "hidden",
    },
    chapterImage: {
      flex: 1,
      borderRadius: 18,
      width: "100%",
    },
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
    },
    chapterDesc: {
      color: text,
      fontSize: 14,
      marginTop: 3,
    },
    backButton: {
      marginVertical: 10,
      padding: 4,
      alignSelf: "flex-start",
    },
    backText: {
      fontSize: 16,
    },
    chapterTitleFight: {
      color: highlight,
      fontSize: 22,
      marginBottom: 12,
      textAlign: "center",
      letterSpacing: 0.5,
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
    },
    skillDescription: { fontSize: 14, color: text },
    skillPower: { fontSize: 12 },
    okButton: {
      backgroundColor: highlight,
      padding: 10,
      borderRadius: 10,
      alignSelf: "center",
      marginTop: 16,
    },
    okText: { color: accent },
  });
}
