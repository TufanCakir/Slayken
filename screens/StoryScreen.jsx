import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useClass } from "../context/ClassContext";
import { useLevelSystem } from "../hooks/useLevelSystem";
import BattleScene from "../components/BattleScene";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import bossData from "../data/bossData.json";
import chapterData from "../data/chapterData.json";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCompleteMissionOnce } from "../utils/mission/missionUtils";
import { calculateSkillDamage, scaleBossStats } from "../utils/combatUtils";
import { getCharacterStatsWithEquipment } from "../utils/combat/statUtils";
import ScreenLayout from "../components/ScreenLayout";

const COIN_REWARD = 100;
const CRYSTAL_REWARD = 30;

const getAssetKey = (url, prefix, fallback) => {
  let name = null;
  if (typeof url === "string") {
    const match = /\/([\w-]+)\.png$/i.exec(url);
    name = match ? match[1] : null;
  }
  if (!name && fallback) name = fallback;
  return name ? `${prefix}${name.toLowerCase()}` : null;
};

function SkillUnlockModal({ visible, skills, onClose, styles, theme }) {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={[
            theme.accentColorSecondary,
            theme.accentColor,
            theme.accentColorDark,
          ]}
          start={[0.2, 0]}
          end={[1, 1]}
          style={styles.skillModal}
        >
          <Text style={styles.skillModalTitle}>
            🎉 Neue Skills freigeschaltet!
          </Text>
          <View style={{ width: "100%" }}>
            {skills.map((skill, idx) => (
              <View key={idx} style={styles.skillItem}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillDescription}>{skill.description}</Text>
                <Text style={styles.skillPower}>Power: {skill.power}</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.okButton} onPress={onClose}>
            <Text style={styles.okText}>OK</Text>
          </Pressable>
        </LinearGradient>
      </View>
    </Modal>
  );
}

export default function StoryScreen() {
  const navigation = useNavigation();
  const { imageMap } = useAssets();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { classList, activeClassId, updateCharacter } = useClass();
  const { gainExp } = useLevelSystem();
  const completeMissionOnce = useCompleteMissionOnce();
  const { theme } = useThemeContext();

  const activeCharacter = classList.find((c) => c.id === activeClassId);

  const [selectedChapter, setSelectedChapter] = useState(null);
  const [currentBoss, setCurrentBoss] = useState(null);
  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp, setBossMaxHp] = useState(100);
  const [newUnlockedSkills, setNewUnlockedSkills] = useState(null);

  // Animated HP für Fortschrittsbalken (optional nice effect)
  const [hpAnim] = useState(new Animated.Value(1));

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Boss laden, wenn Kapitel gewählt
  useEffect(() => {
    if (!selectedChapter || !activeCharacter) return;
    const boss = bossData.find((b) => b.id === selectedChapter.bossId);
    const scaled = scaleBossStats(boss, activeCharacter.level || 1);
    setCurrentBoss(scaled);
    setBossHp(scaled.hp || 100);
    setBossMaxHp(scaled.hp || 100);
    hpAnim.setValue(1);
  }, [selectedChapter, activeCharacter]);

  // Animate HP
  useEffect(() => {
    if (bossMaxHp > 0) {
      Animated.timing(hpAnim, {
        toValue: bossHp / bossMaxHp,
        duration: 340,
        useNativeDriver: false,
      }).start();
    }
  }, [bossHp, bossMaxHp]);

  useEffect(() => {
    if (currentBoss) {
      setBossHp(currentBoss.hp ?? 100);
      setBossMaxHp(currentBoss.hp ?? 100);
      hpAnim.setValue(1);
    }
  }, [currentBoss]);

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
              resetState();
            }
          }, 350);
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

  const resetState = useCallback(() => {
    setSelectedChapter(null);
    setCurrentBoss(null);
    setBossHp(100);
    setBossMaxHp(100);
    hpAnim.setValue(1);
  }, []);

  const handleCloseSkillModal = useCallback(() => {
    setNewUnlockedSkills(null);
    resetState();
  }, [resetState]);

  // Hintergrund & Bildzuordnung
  const bossBgKey = getAssetKey(currentBoss?.background, "bg_");
  const bossBgSrc =
    (bossBgKey && imageMap[bossBgKey]) || currentBoss?.background;

  const mappedBoss = useMemo(() => {
    if (!currentBoss) return null;
    const bossImgKey = getAssetKey(
      currentBoss.image,
      "eventboss_",
      currentBoss.name
    );
    return {
      ...currentBoss,
      image: (bossImgKey && imageMap[bossImgKey]) || currentBoss.image,
    };
  }, [currentBoss, imageMap]);

  // Kapitel-Auswahl
  if (!selectedChapter) {
    // Keine Charaktere? Keine Kapitel? => Hinweis!
    if (!classList.length)
      return (
        <ScreenLayout style={styles.container}>
          <Text style={styles.errorText}>
            Kein Charakter verfügbar. Erstelle zuerst einen Charakter!
          </Text>
        </ScreenLayout>
      );
    if (!chapterData.length)
      return (
        <ScreenLayout style={styles.container}>
          <Text style={styles.errorText}>Keine Kapitel gefunden.</Text>
        </ScreenLayout>
      );

    return (
      <ScreenLayout style={styles.container}>
        <Text style={styles.header}>Wähle ein Kapitel</Text>
        <FlatList
          data={chapterData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chapterList}
          renderItem={({ item }) => {
            const boss = bossData.find((b) => b.id === item.bossId);
            const bossImgKey = getAssetKey(
              boss?.image,
              "eventboss_",
              boss?.name || boss?.id
            );
            const bossImage = boss ? imageMap[bossImgKey] || boss.image : null;
            return (
              <TouchableOpacity
                style={styles.chapterCardOuter}
                onPress={() => setSelectedChapter(item)}
                activeOpacity={0.89}
              >
                <LinearGradient
                  colors={[
                    theme.accentColorSecondary,
                    theme.accentColor,
                    theme.accentColorDark,
                  ]}
                  start={[0.2, 0]}
                  end={[1, 1]}
                  style={styles.chapterCard}
                >
                  <Image
                    source={bossImage}
                    style={styles.chapterImage}
                    contentFit="cover"
                  />
                  <View style={styles.chapterOverlay}>
                    <Text style={styles.chapterTitle}>{item.label}</Text>
                    <Text style={styles.chapterDesc}>{item.description}</Text>
                  </View>
                </LinearGradient>
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

      {/* ALWAYS visible Back */}
      <Pressable style={styles.backButton} onPress={resetState}>
        <Text style={styles.backText}>← Zurück zur Kapitel-Auswahl</Text>
      </Pressable>

      <Text style={styles.chapterTitleFight}>{selectedChapter.label}</Text>

      {/* HP BAR */}
      {currentBoss && (
        <View style={styles.hpBarOuter}>
          <Animated.View
            style={[
              styles.hpBar,
              {
                width: hpAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                backgroundColor: theme.borderGlowColor || "#e11d48",
              },
            ]}
          />
          <Text style={styles.hpText}>
            Boss HP: {bossHp} / {bossMaxHp}
          </Text>
        </View>
      )}

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

      <SkillUnlockModal
        visible={!!newUnlockedSkills}
        skills={newUnlockedSkills || []}
        onClose={handleCloseSkillModal}
        styles={styles}
        theme={theme}
      />
    </View>
  );
}

// ---------- STYLES ----------
function createStyles(theme) {
  const accent = theme.accentColor || "#191919";
  const text = theme.textColor || "#fff";
  const glow = theme.glowColor || "#ffd70088";
  const highlight = theme.borderGlowColor || "#ffd700cc";
  const windowWidth = Dimensions.get("window").width;

  return StyleSheet.create({
    container: { flex: 1 },
    errorText: {
      color: "#e11d48",
      fontSize: 17,
      textAlign: "center",
      fontWeight: "bold",
      marginTop: 50,
    },
    header: {
      fontSize: 26,
      color: highlight,
      marginBottom: 12,
      textAlign: "center",
      letterSpacing: 0.7,
      fontWeight: "bold",
      textShadowColor: glow,
      textShadowRadius: 12,
      textShadowOffset: { width: 0, height: 3 },
    },
    chapterList: {
      padding: 12,
      gap: 12,
      paddingBottom: 38,
    },
    chapterCardOuter: {
      marginVertical: 6,
      borderRadius: 22,
      overflow: "hidden",
      shadowColor: highlight,
      shadowOpacity: 0.18,
      shadowRadius: 21,
      elevation: 7,
    },
    chapterCard: {
      borderRadius: 22,
      height: windowWidth > 650 ? 360 : 240,
      justifyContent: "center",
      overflow: "hidden",
      flex: 1,
    },
    chapterImage: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 22,
      opacity: 0.63,
    },
    chapterOverlay: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      padding: 14,
      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
      backgroundColor: accent + "ec",
      alignItems: "center",
    },
    chapterTitle: {
      color: highlight,
      fontSize: 21,
      fontWeight: "bold",
      letterSpacing: 0.23,
      textShadowColor: glow,
      textShadowRadius: 8,
      textShadowOffset: { width: 0, height: 2 },
    },
    chapterDesc: {
      color: text,
      fontSize: 15,
      marginTop: 4,
      fontWeight: "500",
      textAlign: "center",
      textShadowColor: accent + "c5",
      textShadowRadius: 5,
      textShadowOffset: { width: 0, height: 1 },
    },
    backButton: {
      marginVertical: 10,
      padding: 8,
      alignSelf: "flex-start",
      marginLeft: 12,
      marginTop: 18,
      backgroundColor: accent + "e8",
      borderRadius: 14,
      zIndex: 40,
      shadowColor: highlight,
      shadowRadius: 6,
      shadowOpacity: 0.09,
    },
    backText: {
      fontSize: 17,
      color: highlight,
      fontWeight: "bold",
      textShadowColor: glow,
      textShadowRadius: 7,
      textShadowOffset: { width: 0, height: 2 },
    },
    chapterTitleFight: {
      color: highlight,
      fontSize: 23,
      marginBottom: 13,
      textAlign: "center",
      letterSpacing: 0.7,
      fontWeight: "bold",
      textShadowColor: glow,
      textShadowRadius: 13,
      textShadowOffset: { width: 0, height: 4 },
    },
    // HP BAR
    hpBarOuter: {
      height: 30,
      backgroundColor: accent + "88",
      borderRadius: 11,
      marginHorizontal: 26,
      marginBottom: 10,
      overflow: "hidden",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: highlight,
      shadowColor: highlight,
      shadowRadius: 4,
      shadowOpacity: 0.11,
    },
    hpBar: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      borderRadius: 11,
    },
    hpText: {
      textAlign: "center",
      color: text,
      fontWeight: "bold",
      fontSize: 15.5,
      letterSpacing: 0.12,
      zIndex: 10,
      textShadowColor: glow,
      textShadowRadius: 6,
    },
    // MODAL
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.77)",
    },
    skillModal: {
      borderRadius: 20,
      padding: 29,
      width: "88%",
      alignItems: "center",
    },
    skillModalTitle: {
      color: highlight,
      fontWeight: "bold",
      fontSize: 21,
      marginBottom: 18,
      textAlign: "center",
      textShadowColor: glow,
      textShadowRadius: 12,
    },
    skillItem: { marginBottom: 16, alignItems: "center" },
    skillName: {
      fontSize: 17,
      color: highlight,
      fontWeight: "bold",
      textShadowColor: glow,
      textShadowRadius: 8,
    },
    skillDescription: {
      fontSize: 14,
      color: text,
      textAlign: "center",
      marginTop: 3,
      marginBottom: 1,
    },
    skillPower: { fontSize: 12, color: text, fontStyle: "italic" },
    okButton: {
      backgroundColor: highlight,
      paddingVertical: 12,
      paddingHorizontal: 31,
      borderRadius: 13,
      alignSelf: "center",
      marginTop: 19,
      shadowColor: glow,
      shadowOpacity: 0.7,
      shadowRadius: 10,
      elevation: 8,
    },
    okText: { color: accent, fontWeight: "bold", fontSize: 16 },
  });
}
