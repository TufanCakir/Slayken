import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useAccountLevel } from "../context/AccountLevelContext";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useClass } from "../context/ClassContext";
import { useLevelSystem } from "../hooks/useLevelSystem";
import BattleScene from "../components/BattleScene";
import { useMissions } from "../context/MissionContext";

import bossData from "../data/bossData.json";
import { getBossImageUrl } from "../utils/boss/bossUtils";
import { useCompleteMissionOnce } from "../utils/mission/missionUtils";

const COIN_REWARD = 100;
const CRYSTAL_REWARD = 30;
const PLAYER_MAX_HP_DEFAULT = 100;

export default function EndlessModeScreen() {
  const navigation = useNavigation();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { classList, activeClassId, updateCharacter } = useClass();
  const { gainExp } = useLevelSystem();
  const { missions, markMissionCompleted } = useMissions();
  const completeMissionOnce = useCompleteMissionOnce();
  // Aktiver Charakter & HP
  const activeCharacter = classList.find((c) => c.id === activeClassId);
  const maxHp = activeCharacter?.maxHp || PLAYER_MAX_HP_DEFAULT;

  // Boss-State
  const [bossHp, setBossHp] = useState(100);
  const [currentBoss, setCurrentBoss] = useState(null);

  // Modal für neue Skills
  const [newUnlockedSkills, setNewUnlockedSkills] = useState(null);

  // Initialer Boss beim Mount
  useEffect(() => {
    spawnNewBoss();
    // eslint-disable-next-line
  }, []);

  // Boss spawnen
  const spawnNewBoss = useCallback(() => {
    const randomBoss = bossData[Math.floor(Math.random() * bossData.length)];
    setCurrentBoss(randomBoss);
    setBossHp(randomBoss.hp || 100);
  }, []);

  // Kampf-Handler
  const handleFight = useCallback(
    (skill) => {
      if (!activeCharacter || !currentBoss) return;

      // Skill absichern (Fehlerquelle!)
      const damage = typeof skill?.power === "number" ? skill.power : 20;

      setBossHp((prevBossHp) => {
        const newHp = Math.max(prevBossHp - damage, 0);

        // Boss besiegt?
        if (newHp === 0) {
          setTimeout(() => {
            // Rewards & XP (nach dem Render!)
            addCoins(COIN_REWARD);
            addCrystals(CRYSTAL_REWARD);
            addXp(100);

            completeMissionOnce("1");

            // Charakter hochleveln
            const updatedCharacter = gainExp(activeCharacter, 120);
            updateCharacter(updatedCharacter);

            // Neue Skills identifizieren
            const oldSkillNames = (activeCharacter.skills || []).map(
              (s) => s.name
            );
            const newSkills = (updatedCharacter.skills || []).filter(
              (s) => !oldSkillNames.includes(s.name)
            );

            if (newSkills.length > 0) {
              setNewUnlockedSkills(newSkills);
            } else {
              setTimeout(spawnNewBoss, 500); // sanfte Pause
            }
          }, 300); // kleine Verzögerung, um Render-Flicker zu vermeiden
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
      spawnNewBoss,
      completeMissionOnce, // 👈 hinzufügen
    ]
  );

  // Modal schließen + nächster Boss
  const handleCloseSkillModal = useCallback(() => {
    setNewUnlockedSkills(null);
    setTimeout(spawnNewBoss, 400); // kleine Pause für besseres UX
  }, [spawnNewBoss]);

  // Prozent-Anzeige für Boss-HP (für Balken)
  const bossHpPercent =
    currentBoss && currentBoss.hp
      ? Math.max(0, Math.round((bossHp / currentBoss.hp) * 100))
      : 0;

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Zurück</Text>
      </Pressable>

      {currentBoss && (
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

      {/* Modal für neue Skills */}
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  skillModal: {
    backgroundColor: "#222",
    margin: 32,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#888",
  },
  skillModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  skillItem: { marginBottom: 12 },
  skillName: { fontSize: 16, fontWeight: "bold", color: "#F9B801" },
  skillDescription: { fontSize: 14, color: "#ccc" },
  skillPower: { fontSize: 12, color: "#888" },
  okButton: {
    marginTop: 16,
    backgroundColor: "#F9B801",
    padding: 10,
    borderRadius: 10,
    alignSelf: "center",
  },
  okText: { color: "#222", fontWeight: "bold" },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#1e293b",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#2563eb",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.11,
    shadowRadius: 6,
    elevation: 4,
  },
  backText: {
    color: "#38bdf8",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.12,
    textAlign: "center",
  },
});
