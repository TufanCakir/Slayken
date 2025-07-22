import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import { getBossImageUrl } from "../utils/boss/bossUtils";

// Utilities
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

// ------ Memoized Modal ------
const SkillUnlockModal = React.memo(function SkillUnlockModal({
  visible,
  skills,
  onClose,
  styles,
  theme,
}) {
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
          <TouchableOpacity style={styles.okButton} onPress={onClose}>
            <Text style={styles.okText}>OK</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
});

// ------ Memoized ChapterCard ------
const ChapterCard = React.memo(function ChapterCard({
  item,
  onPress,
  theme,
  styles,
}) {
  const bossImage = useMemo(() => getBossImageUrl(item.bossId), [item.bossId]);
  return (
    <TouchableOpacity
      style={styles.chapterCardOuter}
      onPress={() => onPress(item)}
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
          contentFit="contain"
        />
        <View style={styles.chapterOverlay}>
          <Text style={styles.chapterTitle}>{item.label}</Text>
          <Text style={styles.chapterDesc}>{item.description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

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
  const [hpAnim] = useState(new Animated.Value(1));

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    if (!selectedChapter || !activeCharacter) return;
    const boss = bossData.find((b) => b.id === selectedChapter.bossId);
    const scaled = scaleBossStats(boss, activeCharacter.level || 1);
    setCurrentBoss(scaled);
    setBossHp(scaled.hp || 100);
    setBossMaxHp(scaled.hp || 100);
    hpAnim.setValue(1);
  }, [selectedChapter, activeCharacter]);

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

  // Background
  const bossBgKey = getBackgroundKey(currentBoss?.background);
  const bossBgSrc =
    (bossBgKey && imageMap[bossBgKey]) || currentBoss?.background;

  // Memoized Boss
  const mappedBoss = useMemo(() => {
    if (!currentBoss) return null;
    const bossImgKey = getEventBossKey(currentBoss.image, currentBoss.name);
    return {
      ...currentBoss,
      image: (bossImgKey && imageMap[bossImgKey]) || currentBoss.image,
    };
  }, [currentBoss, imageMap]);

  // Memoisiertes RenderItem für FlatList
  const renderChapterItem = useCallback(
    ({ item }) => (
      <ChapterCard
        item={item}
        onPress={setSelectedChapter}
        theme={theme}
        styles={styles}
      />
    ),
    [theme, styles]
  );

  if (!selectedChapter) {
    if (!classList.length)
      return (
        <ScreenLayout style={styles.container}>
          <Text style={styles.errorText}>
            Kein Charakter verfügbar. Erstelle zuerst einen!
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
        <FlatList
          data={chapterData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chapterList}
          renderItem={renderChapterItem}
        />
      </ScreenLayout>
    );
  }

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
          onBack={() => navigation.goBack()}
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

function createStyles(theme) {
  const accent = theme.accentColor || "#191919";
  const text = theme.textColor || "#fff";
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
    chapterList: {
      padding: 12,
      gap: 12,
      paddingBottom: 38,
    },
    chapterCardOuter: {
      borderRadius: 22,
      overflow: "hidden",
      shadowColor: highlight,
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
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
    },
    chapterOverlay: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      padding: 14,
      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    chapterTitle: {
      color: highlight,
      fontSize: 21,
      fontWeight: "bold",
      letterSpacing: 0.23,
    },
    chapterDesc: {
      color: text,
      fontSize: 15,
      marginTop: 4,
      fontWeight: "500",
      textAlign: "center",
    },
    chapterTitleFight: {
      color: highlight,
      fontSize: 23,
      marginBottom: 13,
      textAlign: "center",
      letterSpacing: 0.7,
      fontWeight: "bold",
    },
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
      backgroundColor: theme.accentColor,
    },
    skillModalTitle: {
      color: highlight,
      fontWeight: "bold",
      fontSize: 21,
      marginBottom: 18,
      textAlign: "center",
    },
    skillItem: {
      marginBottom: 16,
      alignItems: "center",
    },
    skillName: {
      fontSize: 17,
      color: highlight,
      fontWeight: "bold",
    },
    skillDescription: {
      fontSize: 14,
      color: text,
      textAlign: "center",
      marginTop: 3,
      marginBottom: 1,
    },
    skillPower: {
      fontSize: 12,
      color: text,
      fontStyle: "italic",
    },
    okButton: {
      backgroundColor: highlight,
      paddingVertical: 12,
      paddingHorizontal: 31,
      borderRadius: 13,
      alignSelf: "center",
      marginTop: 19,
      // Schatten reduziert
      elevation: 5,
    },
    okText: {
      color: accent,
      fontWeight: "bold",
      fontSize: 16,
    },
  });
}
