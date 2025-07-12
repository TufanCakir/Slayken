import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { useThemeContext } from "../context/ThemeContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useClass } from "../context/ClassContext";
import { useLevelSystem } from "../hooks/useLevelSystem";
import { useAssets } from "../context/AssetsContext";
import { dimensions } from "../data/dimensions";
import bossData from "../data/bossData.json";
import BattleScene from "../components/BattleScene";
import { useCompleteMissionOnce } from "../utils/mission/missionUtils";
import { calculateSkillDamage, scaleBossStats } from "../utils/combatUtils";
import { getCharacterStatsWithEquipment } from "../utils/combat/statUtils";
import { equipmentPool } from "../data/equipmentPool";
import AnimatedPortalSvg from "../components/portals/AnimatedPortalSvg";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";

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

// DRY: Generisches Modal mit beliebigen Kindern
function RewardModal({ visible, onClose, title, children }) {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade" visible={!!visible}>
      <View style={stylesModal.overlay}>
        <View style={stylesModal.modal}>
          <Text style={stylesModal.title}>{title}</Text>
          {children}
          <Pressable style={stylesModal.okButton} onPress={onClose}>
            <Text style={stylesModal.okText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function DimensionScreen() {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const navigation = useNavigation();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { classList, activeClassId, updateCharacter } = useClass();
  const { gainExp } = useLevelSystem();
  const completeMissionOnce = useCompleteMissionOnce();

  const [selectedPortal, setSelectedPortal] = useState(null);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp, setBossMaxHp] = useState(100);
  const [reward, setReward] = useState(null); // { type, drop?, skills? }
  const [activePortalId, setActivePortalId] = useState(null);
  const portalFlyAnim = useSharedValue(1);

  const gradientColors = theme.linearGradient || [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  const onBack = () => navigation.goBack();

  const handlePortalPress = (portal) => {
    setActivePortalId(portal.id);
    portalFlyAnim.value = withTiming(16, { duration: 680 });
    setTimeout(() => {
      handleSelectPortal(portal);
      portalFlyAnim.value = 1;
      setActivePortalId(null);
    }, 700);
  };

  const baseCharacter = useMemo(
    () => classList.find((c) => c.id === activeClassId),
    [classList, activeClassId]
  );

  const { stats: charStats, percentBonuses } = useMemo(() => {
    if (!baseCharacter) return { stats: {}, percentBonuses: {} };
    return getCharacterStatsWithEquipment(baseCharacter);
  }, [baseCharacter]);

  const chooseBossFromPortal = useCallback((portal) => {
    if (!portal || !portal.bossPool?.length) return null;
    const bossKey =
      portal.bossPool[Math.floor(Math.random() * portal.bossPool.length)];
    return bossData.find((b) => b.id === bossKey);
  }, []);

  const scaledBoss = useMemo(() => {
    if (!currentBoss || !baseCharacter) return null;
    return scaleBossStats(currentBoss, baseCharacter.level || 1);
  }, [currentBoss, baseCharacter]);

  const portalAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: portalFlyAnim.value }],
    opacity: 1 - (portalFlyAnim.value - 1) / 15,
    zIndex: 99,
    position: "absolute",
    left: -20,
    top: -20,
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  }));

  // Neues Portal wählen → Boss starten
  const handleSelectPortal = (portal) => {
    setSelectedPortal(portal);
    const boss = chooseBossFromPortal(portal);
    setCurrentBoss(boss);
    setBossHp(boss?.hp || 100);
    setBossMaxHp(boss?.hp || 100);
    setReward(null);
  };

  const handleBackToPortals = useCallback(() => {
    setSelectedPortal(null);
    setCurrentBoss(null);
    setBossHp(100);
    setBossMaxHp(100);
    setReward(null);
  }, []);

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
              setReward({ type: "skills", skills: newSkills });
            } else if (Math.random() < 0.5) {
              // 50% Drop-Chance
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
              setReward({ type: "drop", drop });
            } else {
              setTimeout(handleBackToPortals, 800);
            }
          }, 350);
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
      handleBackToPortals,
      completeMissionOnce,
    ]
  );

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

  // PORTAL-AUSWAHL
  if (!selectedPortal) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Dimensionstore</Text>
        <FlatList
          data={dimensions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 38 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handlePortalPress(item)}
              style={styles.portalCard}
              disabled={!!activePortalId}
            >
              {activePortalId === item.id ? (
                <Animated.View style={portalAnimStyle}>
                  <AnimatedPortalSvg
                    size={100}
                    colorA={item.colorA}
                    colorB={item.colorB}
                    coreColor={item.coreColor}
                    dual={!!item.dual}
                  />
                </Animated.View>
              ) : (
                <View style={{ marginRight: 16 }}>
                  <AnimatedPortalSvg
                    size={100}
                    colorA={item.colorA}
                    colorB={item.colorB}
                    coreColor={item.coreColor}
                    dual={!!item.dual}
                  />
                </View>
              )}

              <LinearGradient
                colors={item.gradient || gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.portalTextBg}
              >
                <Text style={styles.portalName}>{item.name}</Text>
                <Text style={styles.portalDescription}>{item.description}</Text>
                <Text style={styles.portalDiff}>
                  Schwierigkeit: {item.difficulty}
                </Text>
              </LinearGradient>
            </Pressable>
          )}
        />
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
      </View>
    );
  }

  // BOSS-KAMPF + RewardModal
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
          onBack={handleBackToPortals}
        />
      )}

      <RewardModal
        visible={reward?.type === "drop"}
        title="🎉 Du hast gefunden:"
        onClose={() => {
          setReward(null);
          setTimeout(handleBackToPortals, 800);
        }}
      >
        <Image
          source={imageMap["equipment_" + reward?.drop?.id]}
          style={{ width: 60, height: 60, margin: 12 }}
        />
        <Text style={{ color: theme.borderGlowColor, fontSize: 18 }}>
          {reward?.drop?.label}
        </Text>
        <Text style={{ color: theme.textColor, fontSize: 14 }}>
          {reward?.drop?.description}
        </Text>
      </RewardModal>

      <RewardModal
        visible={reward?.type === "skills"}
        title="🎉 Neue Skills freigeschaltet!"
        onClose={() => {
          setReward(null);
          setTimeout(handleBackToPortals, 400);
        }}
      >
        {(reward?.skills || []).map((s, i) => (
          <View key={i} style={stylesModal.skillItem}>
            <Text style={stylesModal.skillName}>{s.name}</Text>
            <Text style={stylesModal.skillDescription}>{s.description}</Text>
            <Text style={stylesModal.skillPower}>Power: {s.power}</Text>
          </View>
        ))}
      </RewardModal>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, padding: 22, backgroundColor: theme.bgColor },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: theme.textColor,
      marginVertical: 12,
      textAlign: "center",
      letterSpacing: 0.2,
    },
    portalCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 28,
      padding: 16,
      marginVertical: 18,
      backgroundColor: "transparent",
      elevation: 0,
      shadowColor: "transparent",
    },
    portalName: { fontSize: 20, fontWeight: "700", color: "#fff" },
    portalDescription: { color: "#fff", fontSize: 13, marginTop: 2 },
    portalDiff: { color: "#ffe", marginTop: 6, fontWeight: "bold" },
    portalTextBg: {
      borderRadius: 10,
      padding: 10,
      marginLeft: 8,
      minWidth: 120,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 4,
      elevation: 4,
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

// DRY-Modal-Styles zentral
const stylesModal = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.74)",
    paddingHorizontal: 12,
  },
  modal: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 22,
    minWidth: 270,
    maxWidth: 350,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#38bdf8",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 13,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  okButton: {
    marginTop: 16,
    backgroundColor: "#38bdf8",
    paddingVertical: 10,
    paddingHorizontal: 34,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: "#bae6fd",
  },
  okText: {
    color: "#fff",
    fontSize: 16,
    letterSpacing: 0.06,
    fontWeight: "600",
  },
  skillItem: {
    marginBottom: 13,
    backgroundColor: "#1e293b",
    padding: 8,
    borderRadius: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: "#38bdf8",
  },
  skillName: {
    fontSize: 16,
    color: "#38bdf8",
    marginBottom: 4,
    fontWeight: "bold",
  },
  skillDescription: { fontSize: 14, color: "#fff", marginBottom: 4 },
  skillPower: { fontSize: 12, color: "#bae6fd" },
});
