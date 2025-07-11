import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ActionBar from "../components/ActionBar";
import BattleButton from "../components/BattleButton";
import ScreenLayout from "../components/ScreenLayout";
import { useClass } from "../context/ClassContext";
import { useGifts } from "../context/GiftContext";
import { useThemeContext } from "../context/ThemeContext";
import { t } from "../i18n";
import styles from "../styles/HomeScreenStyles";
import { useCompleteMissionOnce } from "../utils/mission/missionUtils";
import { navigateTo } from "../utils/navigationUtils";

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
  { screen: "BattleScreen", labelKey: "battleLabel" },
  { screen: "PreBattleInfoScreen", labelKey: "endlessfightLabel" },
  { screen: "EventScreen", labelKey: "eventLabel" },
  { screen: "StoryScreen", labelKey: "storyLabel" },
  { screen: "TeaserScreen", labelKey: "teaserLabel" },
  { screen: "InventoryScreen", labelKey: "equipmentLabel" },
  { screen: "ValuablesScreen", labelKey: "valuablesLabel" },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const { collectedGifts } = useGifts();
  const { classList } = useClass();
  const completeMissionOnce = useCompleteMissionOnce();

  const hasClass = classList.length > 0;
  const hasClaimedGift = Object.values(collectedGifts || {}).some(Boolean);

  const tutorialStep = useMemo(() => {
    if (!hasClaimedGift) return 1;
    if (!hasClass) return 2;
    return 3;
  }, [hasClaimedGift, hasClass]);

  useEffect(() => {
    completeMissionOnce("2");
  }, []);

  // 1. Neues: Slayken-Action-Tutorial-Block mit Gradient und Glow!
  const renderTutorial = () => {
    if (tutorialStep < 3) {
      const step = tutorialSteps.find((s) => s.key === tutorialStep);
      if (!step) return null;
      return (
        <LinearGradient
          colors={theme.linearGradient}
          start={[0, 0]}
          end={[1, 1]}
          style={localStyles.tutorialBlock}
        >
          <Text
            style={[
              localStyles.tutorialText,
              {
                color: theme.textColor,
                textShadowColor: theme.glowColor,
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 8,
              },
            ]}
          >
            {step.text}
          </Text>
          <TouchableOpacity
            style={[
              localStyles.tutorialButton,
              {
                borderColor: theme.borderGlowColor,
                shadowColor: theme.shadowColor,
                backgroundColor: "transparent",
              },
            ]}
            activeOpacity={0.93}
            onPress={() => navigateTo(navigation, step.target)}
          >
            <LinearGradient
              colors={[
                theme.accentColorSecondary,
                theme.accentColor,
                theme.accentColorDark,
              ]}
              start={[0.2, 0]}
              end={[1, 1]}
              style={localStyles.buttonGradient}
            >
              <Text
                style={[
                  localStyles.tutorialButtonText,
                  {
                    color: theme.textColor,
                    textShadowColor: theme.glowColor,
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 6,
                  },
                ]}
              >
                {step.buttonLabel}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      );
    }
    return null;
  };

  // 2. BattleButtons als feurige Buttons!
  const renderBattleButtons = () => (
    <View style={localStyles.battleButtonContainer}>
      {battleButtonsConfig.map((btn) => (
        <BattleButton
          key={btn.screen}
          onPress={() => navigateTo(navigation, btn.screen)}
          label={t(btn.labelKey)}
          style={{
            margin: 5,
            ...Platform.select({
              ios: {
                shadowColor: theme.glowColor,
                shadowRadius: 7,
                shadowOpacity: 0.9,
                shadowOffset: { width: 0, height: 2 },
              },
              android: { elevation: 7 },
            }),
            borderColor: theme.borderColor,
            borderWidth: 2,
            backgroundColor: "transparent",
          }}
          gradientColors={[
            theme.accentColorSecondary,
            theme.accentColor,
            theme.accentColorDark,
          ]}
          textColor={theme.textColor}
          glowColor={theme.glowColor}
        />
      ))}
    </View>
  );

  return (
    <ScreenLayout style={styles.container}>
      <View style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.buttonList}>
        <View style={localStyles.tutorialWrapper}>{renderTutorial()}</View>
        {tutorialStep === 3 && renderBattleButtons()}
      </ScrollView>
      <ActionBar navigation={navigation} t={t} />
    </ScreenLayout>
  );
}

const localStyles = StyleSheet.create({
  tutorialWrapper: {
    marginVertical: 18,
    marginHorizontal: 0,
    alignItems: "center",
  },
  tutorialBlock: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: "center",
    width: "96%",
    alignSelf: "center",
    shadowColor: "#FF7A00",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  tutorialText: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  tutorialButton: {
    borderRadius: 18,
    borderWidth: 2,
    overflow: "hidden",
    shadowRadius: 12,
    shadowOpacity: 0.9,
    marginTop: 2,
  },
  buttonGradient: {
    paddingVertical: 11,
    paddingHorizontal: 28,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tutorialButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1.1,
    textAlign: "center",
  },
  battleButtonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingTop: 8,
  },
});
