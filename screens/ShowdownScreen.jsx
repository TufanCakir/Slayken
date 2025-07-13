import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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
import { getBossImageUrl } from "../utils/boss/bossUtils";
import { useStage } from "../context/StageContext";
import ScreenLayout from "../components/ScreenLayout";
import { getEquipmentImageUrl } from "../utils/equipment/equipment";

// Hilfsfunktionen (zentral)
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

// Modal Komponente (vermeidet Duplikate)
function InfoModal({ visible, children, onClose, styles, theme }) {
  if (!visible) return null;
  return (
    <Modal transparent visible={!!visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={theme.linearGradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.skillModal}>
          {children}
          <Pressable style={styles.okButton} onPress={onClose}>
            <Text style={styles.okText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// StageNode ist jetzt 100% stateless, alles Status wird extern gemappt
function StageNode({ stage, progress, onPress, theme, styles, imageMap }) {
  const isBoss = stage.type === "boss";
  const isUnlocked = progress.unlocked;
  const isCompleted = progress.completed;
  const boss = bossData[stage.bossId];
  const bossImageUrl = boss ? getBossImageUrl(boss.id) : null;

  return (
    <LinearGradient
      colors={theme.linearGradient}
      style={styles.stageNodeGradient}
      start={{ x: 0.12, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Pressable
        style={[
          styles.stageNode,
          isBoss && styles.bossNode,
          isCompleted && styles.completedNode,
        ]}
        onPress={isUnlocked ? onPress : undefined}
        disabled={!isUnlocked}
      >
        <View style={styles.iconWrapper}>
          {bossImageUrl && (
            <Image
              source={bossImageUrl}
              style={styles.bossImage}
              contentFit="cover"
              transition={200}
              blurRadius={isUnlocked ? 0 : 8}
            />
          )}
          {!isUnlocked && <View style={styles.lockOverlay} />}
          {isBoss && (
            <View style={styles.bossBadge}>
              <Text style={styles.bossBadgeText}>BOSS</Text>
            </View>
          )}
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>
              {String(stage.id).padStart(2, "0")}
            </Text>
          </View>
        </View>
        <Text style={styles.stageName} numberOfLines={1}>
          {stage.name}
        </Text>
        <View style={styles.starsRow}>
          {isUnlocked ? (
            [...Array(3)].map((_, i) => (
              <Text
                key={i}
                style={[
                  styles.star,
                  i < progress.stars ? styles.starFilled : styles.starEmpty,
                ]}
              >
                ★
              </Text>
            ))
          ) : (
            <Text style={styles.stageLock}>🔒</Text>
          )}
        </View>
      </Pressable>
    </LinearGradient>
  );
}

// Duplikate im Haupt-Render vermeiden: Alle stage-progress-Kombinationen zentral berechnen
function mapStageProgress(stagesData, stageProgress) {
  // Liefert ein Array: [{stage, progress}, ...] in Reihenfolge
  return stagesData.map((stage) => ({
    stage,
    progress: stageProgress.find((p) => p.id === stage.id) || {
      unlocked: false,
      completed: false,
      stars: 0,
    },
  }));
}

// Hauptkomponente
export default function ShowdownScreen() {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const navigation = useNavigation();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { classList, activeClassId, updateCharacter } = useClass();
  const { gainExp } = useLevelSystem();
  const completeMissionOnce = useCompleteMissionOnce();
  const { stageProgress, updateStage, stagesData } = useStage();

  const [selectedStage, setSelectedStage] = useState(null);
  const [battleActive, setBattleActive] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Basisdaten zentral berechnen, kein Duplikat im Kampf oder Modal
  const baseCharacter = useMemo(
    () => classList.find((c) => c.id === activeClassId),
    [classList, activeClassId]
  );
  const { stats: charStats, percentBonuses } = useMemo(
    () =>
      baseCharacter
        ? getCharacterStatsWithEquipment(baseCharacter)
        : { stats: {}, percentBonuses: {} },
    [baseCharacter]
  );

  const boss = useMemo(() => {
    if (!selectedStage || !bossData[selectedStage.bossId]) return null;
    const rawBoss = bossData[selectedStage.bossId];
    const key = getEventBossKey(rawBoss.image, rawBoss.name);
    return {
      ...rawBoss,
      image: imageMap[key] || rawBoss.image,
    };
  }, [selectedStage, imageMap]);

  const scaledBoss = useMemo(
    () =>
      boss && baseCharacter
        ? scaleBossStats(boss, baseCharacter.level || 1)
        : null,
    [boss, baseCharacter]
  );

  const [bossHp, setBossHp] = useState(scaledBoss?.hp || 100);

  useEffect(() => {
    setBossHp(scaledBoss?.hp || 100);
  }, [scaledBoss, battleActive]);

  // Zentrale Stage/Progress Map
  const stageMap = useMemo(
    () => mapStageProgress(stagesData, stageProgress),
    [stagesData, stageProgress]
  );

  // Modal-Renderlogik DRY
  const renderModal = () => {
    if (!modalContent) return null;
    if (modalContent.type === "drop")
      return (
        <InfoModal
          styles={styles}
          theme={theme}
          visible
          onClose={() => setModalContent(null)}
        >
          <Text style={styles.skillModalTitle}>🎉 Du hast gefunden:</Text>
          <Image
            source={getEquipmentImageUrl(modalContent.drop?.id)}
            style={{ width: 60, height: 60, margin: 12 }}
            contentFit="contain"
          />

          <Text style={{ color: theme.borderGlowColor, fontSize: 18 }}>
            {modalContent.drop?.label}
          </Text>
          <Text style={{ color: theme.textColor, fontSize: 14 }}>
            {modalContent.drop?.description}
          </Text>
        </InfoModal>
      );
    if (modalContent.type === "skills")
      return (
        <InfoModal
          styles={styles}
          theme={theme}
          visible
          onClose={() => setModalContent(null)}
        >
          <Text style={styles.skillModalTitle}>
            🎉 Neue Skills freigeschaltet!
          </Text>
          {(modalContent.skills || []).map((s, i) => (
            <View key={i} style={styles.skillItem}>
              <Text style={styles.skillName}>{s.name}</Text>
              <Text style={styles.skillDescription}>{s.description}</Text>
              <Text style={styles.skillPower}>Power: {s.power}</Text>
            </View>
          ))}
        </InfoModal>
      );
    return null;
  };

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
            updateStage(selectedStage.id, { completed: true, stars: 3 });
            const nextStage = stagesData.find(
              (s) => s.id === selectedStage.id + 1
            );
            if (nextStage) updateStage(nextStage.id, { unlocked: true });
            addCoins(COIN_REWARD);
            addCrystals(CRYSTAL_REWARD);
            addXp(100);
            completeMissionOnce("1");

            const leveled = gainExp(baseCharacter, 120);
            updateCharacter(leveled);

            // Neue Skills oder Drops
            const oldNames = baseCharacter.skills?.map((s) => s.name) || [];
            const newSkills = leveled.skills?.filter(
              (s) => !oldNames.includes(s.name)
            );
            if (newSkills?.length) {
              setModalContent({ type: "skills", skills: newSkills });
            } else if (Math.random() < 0.5) {
              const drop =
                equipmentPool[Math.floor(Math.random() * equipmentPool.length)];
              updateCharacter({
                ...baseCharacter,
                inventory: [...(baseCharacter.inventory || []), drop.id],
              });
              setModalContent({ type: "drop", drop });
            }

            setBattleActive(false);
            setSelectedStage(null);
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
      completeMissionOnce,
      updateStage,
      selectedStage,
      stagesData,
    ]
  );

  const bossBgKey = getBackgroundKey(scaledBoss?.background);
  const bossBgSrc =
    (bossBgKey && imageMap[bossBgKey]) || scaledBoss?.background;

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {battleActive && bossBgSrc && (
        <View style={StyleSheet.absoluteFill}>
          <Image
            source={bossBgSrc}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={400}
          />
        </View>
      )}

      {/* Stage-Map */}
      {!battleActive && (
        <ScreenLayout>
          <LinearGradient
            colors={theme.linearGradient}
            start={{ x: 0.12, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.stageMapRowOuter}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stageMapRow}
            >
              {stageMap.map(({ stage, progress }, idx) => (
                <React.Fragment key={stage.id}>
                  <StageNode
                    styles={styles}
                    stage={stage}
                    progress={progress}
                    onPress={() => {
                      setSelectedStage(stage);
                      setBattleActive(true);
                    }}
                    theme={theme}
                    imageMap={imageMap}
                  />
                  {idx < stageMap.length - 1 && (
                    <View style={styles.stageLine} />
                  )}
                </React.Fragment>
              ))}
            </ScrollView>
          </LinearGradient>
        </ScreenLayout>
      )}

      {battleActive && boss && (
        <BattleScene
          boss={boss}
          bossHp={bossHp}
          bossMaxHp={scaledBoss?.hp || 100}
          bossDefeated={bossHp === 0}
          handleFight={handleFight}
          bossBackground={bossBgSrc}
          stage={selectedStage}
          imageMap={imageMap}
          onBack={() => navigation.goBack()}
        />
      )}

      {/* Modal-Block (DRY) */}
      {renderModal()}
    </View>
  );
}

// Styles (unverändert, keine Dubletten)
function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    stageMapRowOuter: {
      borderRadius: 20,
      marginHorizontal: 6,
      marginBottom: 12,
      minHeight: 130,
      padding: 2,
      shadowColor: theme.accentColorDark,
      shadowOpacity: 0.17,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 2 },
      elevation: 5,
      marginTop: 40,
    },
    stageMapRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 16,
      minHeight: 130,
    },
    stageNodeGradient: {
      borderRadius: 24,
      marginHorizontal: 4,
    },
    stageNode: {
      alignItems: "center",
      marginHorizontal: 8,
      width: 92,
      minHeight: 120,
      position: "relative",
      borderRadius: 18,
      overflow: "hidden",
      shadowColor: theme.accentColorDark,
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    bossNode: { borderColor: "#e8413c" },
    completedNode: { borderColor: "#ffd700" },
    iconWrapper: {
      width: 74,
      height: 74,
      borderRadius: 37,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
      position: "relative",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 7,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    bossImage: { width: "100%", height: "100%", borderRadius: 37 },
    lockOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(20,20,20,0.43)",
      zIndex: 2,
      borderRadius: 37,
    },
    bossBadge: {
      position: "absolute",
      bottom: -2,
      left: "50%",
      transform: [{ translateX: -22 }],
      backgroundColor: "#e8413c",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 1,
      zIndex: 3,
      borderWidth: 1,
      borderColor: "#fff",
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    bossBadgeText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "bold",
      letterSpacing: 1,
    },
    numberBadge: {
      position: "absolute",
      top: 2,
      right: 6,
      backgroundColor: "rgba(10,10,10,0.82)",
      borderRadius: 7,
      paddingHorizontal: 5,
      paddingVertical: 1,
      zIndex: 3,
      borderWidth: 1,
      borderColor: "#fff",
    },
    numberText: {
      color: "#ffd700",
      fontWeight: "bold",
      fontSize: 13,
      textShadowColor: "#000c",
      textShadowRadius: 2,
      letterSpacing: 1,
    },
    stageName: {
      fontSize: 13,
      color: "#fff",
      fontWeight: "600",
      textAlign: "center",
      maxWidth: 82,
    },
    starsRow: {
      flexDirection: "row",
      marginTop: 2,
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
    },
    star: {
      fontSize: 17,
      marginHorizontal: 1,
      marginBottom: -2,
      textShadowColor: "#000a",
      textShadowRadius: 2,
    },
    starFilled: { color: "#ffd700" },
    starEmpty: { color: "#444" },
    stageLock: {
      color: "#bbb",
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 2,
    },
    stageLine: {
      height: 4,
      width: 34,
      backgroundColor: "#fff6",
      borderRadius: 2,
      marginBottom: 34,
    },
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
