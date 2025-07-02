import { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenLayout from "../components/ScreenLayout";
import BattleButton from "../components/BattleButton";
import ActionBar from "../components/ActionBar";
import { useThemeContext } from "../context/ThemeContext";
import { useGifts } from "../context/GiftContext";
import { useClass } from "../context/ClassContext";
import { useMissions } from "../context/MissionContext";
import { t } from "../i18n";
import styles from "../styles/HomeScreenStyles";
import { navigateTo } from "../utils/navigationUtils";
import { useCompleteMissionOnce } from "../utils/mission/missionUtils";

const tutorialSteps = [
  {
    key: 1,
    text: `${t("tutorialStep1")}: ${t("pleaseCollectGift")}`,
    buttonLabel: `→ ${t("goToGift")}`,
    target: "GiftScreen",
  },
  {
    key: 2,
    text: `${t("tutorialStep2")}: ${t("pleaseCreateCharacter")}`,
    buttonLabel: `→ ${t("createCharacter")}`,
    target: "CreateCharacterScreen",
  },
];

const battleButtonsConfig = [
  { screen: "PreBattleInfoScreen", labelKey: "endlessfightLabel" },
  { screen: "EventScreen", labelKey: "eventLabel" },
  { screen: "StoryScreen", labelKey: "storyLabel" },
  { screen: "TeaserScreen", labelKey: "teaserLabel" },
  { screen: "CharacterEquipmentScreen", labelKey: "equipmentLabel" },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();

  const { collectedGifts } = useGifts();
  const { classList } = useClass();
  const completeMissionOnce = useCompleteMissionOnce();

  const hasClass = classList.length > 0;
  const hasClaimedGift = Object.values(collectedGifts || {}).some(Boolean);

  // Tutorial Step bestimmen (memoized)
  const tutorialStep = useMemo(() => {
    if (!hasClaimedGift) return 1;
    if (!hasClass) return 2;
    return 3;
  }, [hasClaimedGift, hasClass]);

  useEffect(() => {
    completeMissionOnce("2");
  }, []);

  // Tutorial-Block extrahiert, wiederverwendbar, clean
  const renderTutorial = () => {
    if (tutorialStep < 3) {
      const step = tutorialSteps.find((s) => s.key === tutorialStep);
      if (!step) return null;
      return (
        <View
          style={[styles.tutorialBlock, { backgroundColor: theme.accentColor }]}
        >
          <Text style={[styles.tutorialText, { color: theme.textColor }]}>
            {step.text}
          </Text>
          <TouchableOpacity
            style={[
              styles.tutorialButton,
              {
                borderColor: theme.textColor,
                backgroundColor: theme.accentColor,
              },
            ]}
            onPress={() => navigateTo(navigation, step.target)}
          >
            <Text
              style={[styles.tutorialButtonText, { color: theme.textColor }]}
            >
              {step.buttonLabel}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  // BattleButton-Liste generisch, kein CopyPaste
  const renderBattleButtons = () =>
    battleButtonsConfig.map((btn) => (
      <BattleButton
        key={btn.screen}
        onPress={() => navigateTo(navigation, btn.screen)}
        label={t(btn.labelKey)}
        theme={theme}
        style={styles.fullButton}
      />
    ));

  return (
    <ScreenLayout style={styles.container}>
      <View style={StyleSheet.absoluteFill} />
      <View style={styles.buttonList}>
        <View style={styles.tutorialWrapper}>{renderTutorial()}</View>
        {tutorialStep === 3 && renderBattleButtons()}
      </View>
      <ActionBar theme={theme} navigation={navigation} t={t} />
    </ScreenLayout>
  );
}
