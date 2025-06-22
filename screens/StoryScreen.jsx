import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  Pressable,
} from "react-native";
import BattleScene from "../components/BattleScene";
import bossData from "../data/bossData.json";
import chapterData from "../data/chapterData.json";
import { getBossImageUrl } from "../utils/boss/bossUtils";
import { getClassImageUrl } from "../utils/classUtils";
import { useClass } from "../context/ClassContext";
import { useLevelSystem } from "../hooks/useLevelSystem";
import ScreenLayout from "../components/ScreenLayout";
import { Image } from "expo-image";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";

const BLUE = "#2563eb";
const BLUE_BG = "#1e293b";
const GOLD = "#facc15";
const TEXT_WHITE = "#e0edfa";

export default function StoryScreen() {
  const [selectedChapter, setSelectedChapter] = useState(chapterData[0]);
  const [bossHp, setBossHp] = useState(100);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [newUnlockedSkills, setNewUnlockedSkills] = useState(null);
  const [isFighting, setIsFighting] = useState(false);
  const [showVoiceLine, setShowVoiceLine] = useState(false);

  const { classList, activeClassId, updateCharacter } = useClass();
  const { gainExp } = useLevelSystem();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const activeCharacter = classList.find((c) => c.id === activeClassId);

  const findBossForChapter = useCallback((chapter) => {
    return bossData.find((b) => b.id === chapter.bossId);
  }, []);

  useEffect(() => {
    const boss = findBossForChapter(selectedChapter);
    setCurrentBoss(boss);
    setBossHp(boss?.hp || 100);
  }, [selectedChapter, findBossForChapter]);

  const handleFight = useCallback(
    (skill) => {
      if (!currentBoss || !activeCharacter) return;

      // Reward player for fighting (example: gain exp, coins, crystals)

      const damage = typeof skill?.power === "number" ? skill.power : 20;
      setBossHp((prevBossHp) => {
        const newHp = Math.max(prevBossHp - damage, 0);

        if (newHp === 0) {
          setTimeout(() => {
            setIsFighting(false);
            const boss = findBossForChapter(selectedChapter);
            setCurrentBoss(boss);
            setBossHp(boss?.hp || 100);

            // EP vergeben
            const updatedCharacter = gainExp(activeCharacter, 120);
            updateCharacter(updatedCharacter);

            // 💰 Belohnung nach Sieg
            addCoins(100);
            addCrystals(5);

            // Neue Skills prüfen
            const oldSkillNames = (activeCharacter.skills || []).map(
              (s) => s.name
            );
            const newSkills = (updatedCharacter.skills || []).filter(
              (s) => !oldSkillNames.includes(s.name)
            );

            if (newSkills.length > 0) {
              setNewUnlockedSkills(newSkills);
            }

            updateCharacter(updatedCharacter);

            if (newSkills.length > 0) {
              setNewUnlockedSkills(newSkills);
            }
          }, 800);
        }

        return newHp;
      });
    },
    [
      currentBoss,
      selectedChapter,
      findBossForChapter,
      activeCharacter,
      gainExp,
      updateCharacter,
    ]
  );

  function ChapterSelectBar() {
    return (
      <FlatList
        data={chapterData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 16, padding: 12 }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: BLUE_BG }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedChapter(item)}
            style={[
              styles.chapterCard,
              selectedChapter.id === item.id && styles.chapterCardActive,
            ]}
          >
            <Image
              source={getBossImageUrl(
                bossData.find((b) => b.id === item.bossId)
              )}
              style={styles.chapterImage}
              contentFit="contain"
              transition={300}
            />

            <View style={styles.chapterOverlay}>
              <Text
                style={[
                  styles.chapterTitle,
                  selectedChapter.id === item.id && styles.chapterTitleActive,
                ]}
              >
                {item.label}
              </Text>
              <Text style={styles.chapterDesc}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    );
  }

  const bossHpPercent =
    currentBoss && currentBoss.hp
      ? Math.max(0, Math.round((bossHp / currentBoss.hp) * 100))
      : 0;

  return (
    <ScreenLayout style={styles.container}>
      {!isFighting && <ChapterSelectBar />}

      {showVoiceLine &&
        currentBoss?.voiceLines &&
        typeof currentBoss.voiceLines === "string" && (
          <Text
            style={{ color: "#facc15", textAlign: "center", marginTop: 10 }}
          >
            {currentBoss.voiceLines}
          </Text>
        )}

      {!isFighting && currentBoss && (
        <Pressable
          style={styles.startButton}
          onPress={() => {
            setShowVoiceLine(true);
            setIsFighting(true);
            setTimeout(() => setShowVoiceLine(false), 4000); // 4 Sekunden anzeigen
          }}
        >
          <Text style={styles.startText}>Kapitel starten</Text>
        </Pressable>
      )}

      {isFighting && currentBoss && activeCharacter && (
        <BattleScene
          bossName={currentBoss.name}
          bossImage={getBossImageUrl(currentBoss)}
          bossHp={bossHpPercent}
          bossHpAbsolute={bossHp}
          bossHpMax={currentBoss.hp}
          bossDefeated={bossHp === 0}
          handleFight={handleFight}
          character={activeCharacter}
        />
      )}

      {newUnlockedSkills && (
        <Modal transparent animationType="fade" visible>
          <View style={styles.modalOverlay}>
            <View style={styles.skillModal}>
              <Text style={styles.skillModalTitle}>
                🎉 Neue Skills freigeschaltet!
              </Text>
              {newUnlockedSkills.map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillDescription}>
                    {skill.description}
                  </Text>
                  <Text style={styles.skillPower}>Power: {skill.power}</Text>
                </View>
              ))}
              <Pressable
                style={styles.okButton}
                onPress={() => setNewUnlockedSkills(null)}
              >
                <Text style={styles.okText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // Dunkelblau
  },
  chapterCard: {
    width: 300,
    height: 300,
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1e293b", // tiefer Blauton
    borderWidth: 2,
    borderColor: "#3b82f6", // Blau
  },
  chapterCardActive: {
    borderColor: "#60a5fa", // Helles Blau für aktives Kapitel
  },
  chapterImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  chapterOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
  },
  chapterTitle: {
    color: "#e0f2fe", // helles blauweiß
    fontWeight: "bold",
    fontSize: 16,
  },
  chapterTitleActive: {
    color: "#93c5fd", // helleres Blau
    fontSize: 17,
  },
  chapterDesc: {
    color: "#cbd5e1", // hellgrau-blau
    fontSize: 13,
    marginTop: 2,
  },
  startButton: {
    margin: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#3b82f6", // Primär-Blau
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  startText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  skillModal: {
    backgroundColor: "#1e293b",
    margin: 32,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  skillModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#bae6fd",
    marginBottom: 12,
    textAlign: "center",
  },
  skillItem: { marginBottom: 12 },
  skillName: { fontSize: 16, fontWeight: "bold", color: "#60a5fa" },
  skillDescription: { fontSize: 14, color: "#cbd5e1" },
  skillPower: { fontSize: 12, color: "#94a3b8" },
  okButton: {
    marginTop: 16,
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 10,
    alignSelf: "center",
  },
  okText: {
    color: "#f8fafc",
    fontWeight: "bold",
  },
});
