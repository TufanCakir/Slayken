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
import { getEquipmentImageUrl } from "../utils/equipment/equipment";

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

// --- Memoized Modal-Komponenten ---
const DropModal = React.memo(function DropModal({
  visible,
  drop,
  onClose,
  theme,
}) {
  if (!visible || !drop) return null;
  return (
    <Modal transparent visible={!!visible} animationType="fade">
      <View style={modalStyles.modalOverlay}>
        <View
          style={[
            modalStyles.skillModal,
            {
              backgroundColor: theme.accentColor,
              borderColor: theme.borderGlowColor,
              shadowColor: theme.glowColor,
            },
          ]}
        >
          <Text
            style={[modalStyles.skillModalTitle, { color: theme.textColor }]}
          >
            🎉 Du hast gefunden:
          </Text>
          <Image
            source={getEquipmentImageUrl(drop.id)}
            style={{ width: 60, height: 60, margin: 12 }}
            contentFit="contain"
          />
          <Text style={{ color: theme.borderGlowColor, fontSize: 18 }}>
            {drop.label}
          </Text>
          <Text style={{ color: theme.textColor, fontSize: 14 }}>
            {drop.description}
          </Text>
          <Pressable style={modalStyles.okButton} onPress={onClose}>
            <Text style={[modalStyles.okText, { color: theme.textColor }]}>
              OK
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});

const SkillUnlockModal = React.memo(function SkillUnlockModal({
  visible,
  skills,
  onClose,
  theme,
}) {
  if (!visible || !skills) return null;
  return (
    <Modal transparent animationType="fade" visible={!!visible}>
      <View style={modalStyles.modalOverlay}>
        <View
          style={[
            modalStyles.skillModal,
            {
              backgroundColor: theme.accentColor,
              borderColor: theme.borderGlowColor,
              shadowColor: theme.glowColor,
            },
          ]}
        >
          <Text
            style={[modalStyles.skillModalTitle, { color: theme.textColor }]}
          >
            🎉 Neue Skills freigeschaltet!
          </Text>
          {skills.map((s, i) => (
            <View
              key={i}
              style={[
                modalStyles.skillItem,
                {
                  backgroundColor: theme.accentColor,
                  borderColor: theme.borderGlowColor,
                },
              ]}
            >
              <Text
                style={[
                  modalStyles.skillName,
                  { color: theme.borderGlowColor },
                ]}
              >
                {s.name}
              </Text>
              <Text
                style={[
                  modalStyles.skillDescription,
                  { color: theme.textColor },
                ]}
              >
                {s.description}
              </Text>
              <Text
                style={[modalStyles.skillPower, { color: theme.glowColor }]}
              >
                Power: {s.power}
              </Text>
            </View>
          ))}
          <Pressable style={modalStyles.okButton} onPress={onClose}>
            <Text style={[modalStyles.okText, { color: theme.textColor }]}>
              OK
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});

const EndlessModeScreen = React.memo(function EndlessModeScreen() {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const navigation = useNavigation();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { classList, activeClassId, updateCharacter } = useClass();
  const { gainExp } = useLevelSystem();
  const completeMissionOnce = useCompleteMissionOnce();

  const [newDrop, setNewDrop] = useState(null);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp, setBossMaxHp] = useState(100);
  const [newUnlockedSkills, setNewUnlockedSkills] = useState(null);

  const baseCharacter = useMemo(
    () => classList.find((c) => c.id === activeClassId),
    [classList, activeClassId]
  );

  const { stats: charStats, percentBonuses } = useMemo(() => {
    if (!baseCharacter) return { stats: {}, percentBonuses: {} };
    return getCharacterStatsWithEquipment(baseCharacter);
  }, [baseCharacter]);

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
              setNewUnlockedSkills(newSkills);
            } else {
              // 50% Drop-Chance
              if (Math.random() < 0.5) {
                const drop =
                  equipmentPool[
                    Math.floor(Math.random() * equipmentPool.length)
                  ];
                const nextInventory = [
                  ...(baseCharacter.inventory || []),
                  drop.id,
                ];
                updateCharacter({
                  ...baseCharacter,
                  inventory: nextInventory,
                });
                setNewDrop(drop);
              } else {
                setTimeout(spawnNewBoss, 500);
              }
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

  const handleCloseSkillModal = useCallback(() => {
    setNewUnlockedSkills(null);
    setTimeout(spawnNewBoss, 400);
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

      <DropModal
        visible={!!newDrop}
        drop={newDrop}
        onClose={() => {
          setNewDrop(null);
          setTimeout(spawnNewBoss, 500);
        }}
        theme={theme}
      />

      <SkillUnlockModal
        visible={!!newUnlockedSkills}
        skills={newUnlockedSkills || []}
        onClose={handleCloseSkillModal}
        theme={theme}
      />
    </View>
  );
});

export default EndlessModeScreen;

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bgColor },
  });
}

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.74)",
    paddingHorizontal: 12,
  },
  skillModal: {
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 22,
    minWidth: 270,
    maxWidth: 350,
    alignItems: "center",
    borderWidth: 2,
  },
  skillModalTitle: {
    fontSize: 20,
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  skillItem: {
    marginBottom: 13,
    padding: 8,
    borderRadius: 8,
    width: "100%",
    borderWidth: 1,
  },
  skillName: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "bold",
  },
  skillDescription: { fontSize: 14, marginBottom: 4 },
  skillPower: { fontSize: 12 },
  okButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 34,
    borderRadius: 13,
    borderWidth: 1,
  },
  okText: {
    fontSize: 16,
    letterSpacing: 0.06,
    fontWeight: "600",
    textAlign: "center",
  },
});
