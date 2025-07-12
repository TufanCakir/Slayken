import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { useThemeContext } from "../context/ThemeContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useClass } from "../context/ClassContext";
import { useLevelSystem } from "../hooks/useLevelSystem";
import { useAssets } from "../context/AssetsContext";
import bossData from "../data/bossData.json";
import BattleScene from "../components/BattleScene";
import { useCompleteMissionOnce } from "../utils/mission/missionUtils";
import { calculateSkillDamage, scaleBossStats } from "../utils/combatUtils";
import { getCharacterStatsWithEquipment } from "../utils/combat/statUtils";
import { equipmentPool } from "../data/equipmentPool";

const COIN_REWARD = 100;
const CRYSTAL_REWARD = 30;

const getEventBossKey = (url, fallback) => {
  if (typeof url === "string" && url.endsWith(".png")) {
    const match = /\/([\w-]+)\.png$/i.exec(url);
    return match ? "eventboss_" + match[1].toLowerCase() : null;
  }
  return fallback ? "eventboss_" + fallback.toLowerCase() : null;
};
const getBackgroundKey = (url) => {
  if (!url) return null;
  const match = /\/([\w-]+)\.png$/i.exec(url);
  return match ? "bg_" + match[1].toLowerCase() : null;
};

// Eine Modal-Komponente für alles:
function ResultModal({
  visible,
  onClose,
  type,
  drop,
  skills,
  imageMap,
  theme,
  styles,
}) {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.modalOverlay}>
        <View style={styles.skillModal}>
          {type === "drop" && drop && (
            <>
              <Text style={styles.skillModalTitle}>🎉 Du hast gefunden:</Text>
              <Image
                source={imageMap["equipment_" + drop.id]}
                style={{ width: 60, height: 60, margin: 12 }}
              />
              <Text style={{ color: theme.borderGlowColor, fontSize: 18 }}>
                {drop.label}
              </Text>
              <Text style={{ color: theme.textColor, fontSize: 14 }}>
                {drop.description}
              </Text>
            </>
          )}
          {type === "skills" && skills && (
            <>
              <Text style={styles.skillModalTitle}>
                🎉 Neue Skills freigeschaltet!
              </Text>
              {skills.map((s, i) => (
                <View key={i} style={styles.skillItem}>
                  <Text style={styles.skillName}>{s.name}</Text>
                  <Text style={styles.skillDescription}>{s.description}</Text>
                  <Text style={styles.skillPower}>Power: {s.power}</Text>
                </View>
              ))}
            </>
          )}
          <Pressable style={styles.okButton} onPress={onClose}>
            <Text style={styles.okText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function EndlessModeScreen() {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const navigation = useNavigation();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { classList, activeClassId, updateCharacter } = useClass();
  const { gainExp } = useLevelSystem();
  const completeMissionOnce = useCompleteMissionOnce();

  // Modalstatus (ein State statt zwei)
  const [modal, setModal] = useState({ type: null, drop: null, skills: null });
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp, setBossMaxHp] = useState(100);

  // Aktiver Charakter
  const baseCharacter = useMemo(
    () => classList.find((c) => c.id === activeClassId),
    [classList, activeClassId]
  );
  const { stats: charStats, percentBonuses } = useMemo(() => {
    if (!baseCharacter) return { stats: {}, percentBonuses: {} };
    return getCharacterStatsWithEquipment(baseCharacter);
  }, [baseCharacter]);

  // Bossdaten
  const scaledBoss = useMemo(() => {
    if (!currentBoss || !baseCharacter) return null;
    return scaleBossStats(currentBoss, baseCharacter.level || 1);
  }, [currentBoss, baseCharacter]);

  // Spawn/Refresh Boss + MaxHP
  const spawnNewBoss = useCallback(() => {
    const randomBoss = bossData[Math.floor(Math.random() * bossData.length)];
    setCurrentBoss(randomBoss);
    setBossHp(randomBoss.hp || 100);
    setBossMaxHp(randomBoss.hp || 100);
  }, []);

  useEffect(spawnNewBoss, []);

  useEffect(() => {
    if (scaledBoss) {
      setBossHp(scaledBoss.hp ?? 100);
      setBossMaxHp(scaledBoss.hp ?? 100);
    }
  }, [scaledBoss]);

  // Angriff/Skill-Handler
  const handleFight = useCallback(
    (skill = {}) => {
      if (!baseCharacter || !scaledBoss) return;
      const skillPower = skill?.power ?? charStats.attack ?? 30;
      const damage = calculateSkillDamage({
        charStats,
        percentBonuses,
        skill: { skillDmg: skillPower },
        enemyDefense: scaledBoss.defense || 0,
      });

      setBossHp((prev) => {
        const nextHp = Math.max(prev - damage, 0);
        if (nextHp === 0) {
          setTimeout(() => {
            addCoins(COIN_REWARD);
            addCrystals(CRYSTAL_REWARD);
            addXp(100);
            completeMissionOnce("1");

            const leveled = gainExp(baseCharacter, 120);
            updateCharacter(leveled);

            // Neue Skills
            const oldNames = baseCharacter.skills?.map((s) => s.name) || [];
            const newSkills = leveled.skills?.filter(
              (s) => !oldNames.includes(s.name)
            );

            if (newSkills?.length) {
              setModal({ type: "skills", skills: newSkills, drop: null });
            } else if (Math.random() < 0.5) {
              // Drop
              const drop =
                equipmentPool[Math.floor(Math.random() * equipmentPool.length)];
              const nextInventory = [
                ...(baseCharacter.inventory || []),
                drop.id,
              ];
              updateCharacter({
                ...baseCharacter,
                inventory: nextInventory,
              });
              setModal({ type: "drop", drop, skills: null });
            } else {
              setTimeout(spawnNewBoss, 500);
            }
          }, 300);
        }
        return nextHp;
      });
    },
    [
      baseCharacter,
      scaledBoss,
      charStats,
      percentBonuses,
      addCoins,
      addCrystals,
      addXp,
      gainExp,
      updateCharacter,
      spawnNewBoss,
      completeMissionOnce,
    ]
  );

  const handleCloseModal = useCallback(() => {
    setModal({ type: null, drop: null, skills: null });
    setTimeout(spawnNewBoss, 500);
  }, [spawnNewBoss]);

  // Bildquellen gemappt
  const bossBgKey = getBackgroundKey(scaledBoss?.background);
  const bossBgSrc =
    (bossBgKey && imageMap[bossBgKey]) || scaledBoss?.background;

  const mappedBoss = useMemo(
    () =>
      scaledBoss
        ? {
            ...scaledBoss,
            image:
              imageMap[getEventBossKey(scaledBoss.image, scaledBoss.name)] ||
              scaledBoss.image,
          }
        : null,
    [scaledBoss, imageMap]
  );

  const styles = useMemo(() => createStyles(theme), [theme]);

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

      {mappedBoss && (
        <BattleScene
          boss={mappedBoss}
          bossHp={bossHp}
          bossMaxHp={bossMaxHp}
          bossDefeated={bossHp === 0}
          handleFight={handleFight}
          bossBackground={bossBgSrc}
          imageMap={imageMap}
          onBack={() => navigation.goBack()}
        />
      )}

      {/* EIN gemeinsames Modal für alles */}
      <ResultModal
        visible={modal.type === "drop" || modal.type === "skills"}
        type={modal.type}
        drop={modal.drop}
        skills={modal.skills}
        onClose={handleCloseModal}
        imageMap={imageMap}
        theme={theme}
        styles={styles}
      />
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.74)",
      paddingHorizontal: 12,
    },
    skillModal: {
      backgroundColor: theme.accentColor,
      borderRadius: 18,
      paddingVertical: 24,
      paddingHorizontal: 22,
      minWidth: 270,
      maxWidth: 350,
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 13,
      elevation: 3,
    },
    skillModalTitle: {
      fontSize: 20,
      color: theme.textColor,
      marginBottom: 18,
      textAlign: "center",
      letterSpacing: 0.1,
    },
    skillItem: {
      marginBottom: 13,
      backgroundColor: theme.accentColor,
      padding: 8,
      borderRadius: 8,
      width: "100%",
      borderWidth: 1,
      borderColor: theme.borderGlowColor,
    },
    skillName: {
      fontSize: 16,
      color: theme.borderGlowColor,
      marginBottom: 4,
      fontWeight: "bold",
    },
    skillDescription: { fontSize: 14, color: theme.textColor, marginBottom: 4 },
    skillPower: { fontSize: 12, color: theme.glowColor },
    okButton: {
      marginTop: 16,
      backgroundColor: theme.accentColor,
      paddingVertical: 10,
      paddingHorizontal: 34,
      borderRadius: 13,
      borderWidth: 1.2,
      borderColor: theme.borderGlowColor,
    },
    okText: {
      color: theme.textColor,
      fontSize: 16,
      letterSpacing: 0.06,
      fontWeight: "600",
    },
  });
}
