import { useState, useEffect } from "react";
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

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();

  const { collectedGifts } = useGifts();
  const { classList, activeClassId } = useClass();
  const { missions, markMissionCompleted } = useMissions(); // missions auch holen
  const completeMissionOnce = useCompleteMissionOnce();

  const [tutorialStep, setTutorialStep] = useState(1);

  const hasClass = classList.length > 0;
  const hasClaimedGift = Object.values(collectedGifts || {}).some((v) => v);

  useEffect(() => {
    completeMissionOnce("2");
  }, []);

  useEffect(() => {
    if (!hasClaimedGift) setTutorialStep(1);
    else if (!hasClass) setTutorialStep(2);
    else setTutorialStep(3);
  }, [hasClaimedGift, hasClass]);

  const renderTutorial = () => {
    switch (tutorialStep) {
      case 1:
        return (
          <View
            style={[
              styles.tutorialBlock,
              {
                backgroundColor: theme.accentColor,
              },
            ]}
          >
            <Text style={[styles.tutorialText, { color: theme.textColor }]}>
              {t("tutorialStep1")}: {t("pleaseCollectGift")}
            </Text>
            <TouchableOpacity
              style={[
                styles.tutorialButton,
                {
                  borderColor: theme.textColor,
                  backgroundColor: theme.accentColor,
                },
              ]}
              onPress={() => navigateTo(navigation, "GiftScreen")}
            >
              <Text
                style={[
                  styles.tutorialButtonText,
                  {
                    color: theme.textColor,
                  },
                ]}
              >
                → {t("goToGift")}
              </Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={styles.tutorialBlock}>
            <Text style={[styles.tutorialText, { color: theme.textColor }]}>
              {t("tutorialStep2")}: {t("pleaseCreateCharacter")}
            </Text>
            <TouchableOpacity
              style={[
                styles.tutorialButton,
                {
                  borderColor: theme.textColor,
                  backgroundColor: theme.accentColor,
                },
              ]}
              onPress={() => navigateTo(navigation, "CreateCharacterScreen")}
            >
              <Text
                style={[styles.tutorialButtonText, { color: theme.textColor }]}
              >
                → {t("createCharacter")}
              </Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenLayout style={styles.container}>
      <View style={StyleSheet.absoluteFill} />

      <View style={styles.buttonList}>
        <View style={styles.tutorialWrapper}>{renderTutorial()}</View>

        {tutorialStep === 3 && (
          <>
            <BattleButton
              onPress={() => navigateTo(navigation, "PreBattleInfoScreen")}
              label={t("endlessfightLabel")}
              theme={theme}
              style={styles.fullButton}
            />
            <BattleButton
              onPress={() => navigateTo(navigation, "EventScreen")}
              label={t("eventLabel")}
              theme={theme}
              style={styles.fullButton}
            />
            <BattleButton
              onPress={() => navigateTo(navigation, "StoryScreen")}
              label={t("storyLabel")}
              theme={theme}
              style={styles.fullButton}
            />
            <BattleButton
              onPress={() => navigateTo(navigation, "TeaserScreen")}
              label={t("teaserLabel")}
              theme={theme}
              style={styles.fullButton}
            />
            <BattleButton
              onPress={() => navigateTo(navigation, "CharacterEquipmentScreen")}
              label={t("equipmentLabel")}
              theme={theme}
              style={styles.fullButton}
            />
          </>
        )}
      </View>

      <ActionBar theme={theme} navigation={navigation} t={t} />
    </ScreenLayout>
  );
}
