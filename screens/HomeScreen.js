// Datei: screens/HomeScreen.js
import { useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import PagerView from "react-native-pager-view";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import ScreenLayout from "../components/ScreenLayout";

import { useTeam } from "../context/TeamContext";
import { useChapter } from "../context/ChapterContext";
import { useThemeContext } from "../context/ThemeContext";
import { t } from "../i18n"; // ← Übersetzungsfunktion importieren

import { bossData } from "../data/bossData";
import { eventData } from "../data/eventData";
import { characterData } from "../data/characterData";
import { seasonalData } from "../data/seasonalData";

import { Feather, FontAwesome5, Entypo } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const chapterMap = {
  boss: bossData,
  event: eventData,
  characters: characterData,
  seasonal: seasonalData,
};

const typeNames = {
  boss: "Boss",
  event: "Events",
  characters: "Charaktere",
  seasonal: "Saisonal",
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const pagerRef = useRef(null);

  const { team } = useTeam();
  const { chapterType, currentChapterIndex } = useChapter();
  const { theme } = useThemeContext();

  const currentChapters = chapterMap[chapterType] || [];
  const nextChapter = currentChapters[currentChapterIndex + 1];
  const hasNextChapter = Boolean(nextChapter);
  const chapterTypeLabel = typeNames[chapterType] || t("chaptersLabel");

  return (
    <ScreenLayout style={styles.container}>
      <View style={[StyleSheet.absoluteFill]} />

      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        overdrag
      >
        {team.length > 0 ? (
          team.map((member, idx) => (
            <View key={`${member.name}-${idx}`} style={styles.page}>
              <Image
                source={{ uri: member.avatar }}
                style={styles.avatar}
                contentFit="contain"
              />
            </View>
          ))
        ) : (
          <View style={styles.page} key="empty"></View>
        )}
      </PagerView>

      <TouchableOpacity
        style={[
          styles.battleButton,
          {
            backgroundColor: theme.accentColor,
            borderColor: theme.shadowColor,
            shadowColor: theme.shadowColor,
          },
        ]}
        onPress={() => navigation.navigate("BattleScreen")}
      >
        <View style={styles.buttonContent}>
          <Text style={[styles.battleButtonText, { color: theme.textColor }]}>
            {t("battleLabel")}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.eventButton,
          {
            backgroundColor: theme.accentColor,
            borderColor: theme.shadowColor,
            shadowColor: theme.shadowColor,
          },
        ]}
        onPress={() => navigation.navigate("EventScreen")}
      >
        <View style={styles.buttonContent}>
          <Text style={[styles.eventButtonText, { color: theme.textColor }]}>
            {t("eventLabel")}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.storyButton,
          {
            backgroundColor: theme.accentColor,
            borderColor: theme.shadowColor,
            shadowColor: theme.shadowColor,
          },
        ]}
        onPress={() => navigation.navigate("StoryScreen")}
      >
        <View style={styles.buttonContent}>
          <Text style={[styles.storyButtonText, { color: theme.textColor }]}>
            {t("storyLabel")}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        {[
          {
            icon: (
              <Ionicons name="gift-outline" size={24} color={theme.textColor} />
            ),
            screen: "GiftScreen",
            labelKey: "giftLabel",
          },
          {
            icon: <Entypo name="news" size={24} color={theme.textColor} />,
            screen: "NewsScreen",
            labelKey: "newsLabel",
          },
          {
            icon: (
              <FontAwesome5 name="tasks" size={24} color={theme.textColor} />
            ),
            screen: "MissionScreen",
            labelKey: "missionsLabel",
          },
          {
            icon: <Feather name="settings" size={24} color={theme.textColor} />,
            screen: "SettingsScreen",
            labelKey: "settingsLabel",
          },
        ].map(({ icon, screen, labelKey }, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.iconButton,
              {
                backgroundColor: theme.accentColor,
                borderColor: theme.shadowColor,
              },
            ]}
            onPress={() => navigation.navigate(screen)}
          >
            <View style={styles.iconWrapper}>
              {icon}
              <Text style={[styles.iconLabel, { color: theme.textColor }]}>
                {t(labelKey)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
    zIndex: 2,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 2,
  },
  avatar: {
    width: width * 0.55,
    height: width * 0.55,
    marginBottom: 20,
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  battleButton: {
    position: "absolute",
    right: 300,
    bottom: 100,
    marginTop: 12,
    transform: [{ skewY: "-3deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
    flexDirection: "row",
    paddingBottom: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    height: 100,
    width: 100,
    zIndex: 99,
  },
  battleButtonText: {
    fontSize: 30,
    transform: [{ skewY: "3deg" }],
    left: 15,
  },
  eventButton: {
    position: "absolute",
    right: 150,
    bottom: 100,
    marginTop: 12,
    transform: [{ skewY: "-3deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
    flexDirection: "row",
    paddingBottom: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    height: 100,
    width: 100,
    zIndex: 99,
  },
  eventButtonText: {
    fontSize: 30,
    transform: [{ skewY: "3deg" }],
    left: 15,
  },
  storyButton: {
    position: "absolute",
    right: 10,
    bottom: 100,
    marginTop: 12,
    transform: [{ skewY: "-3deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
    flexDirection: "row",
    paddingBottom: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    height: 100,
    width: 100,
    zIndex: 99,
  },
  storyButtonText: {
    fontSize: 30,
    transform: [{ skewY: "3deg" }],
    left: 15,
  },
  buttonRow: {
    position: "absolute",
    top: 150,
    alignSelf: "center",
    flexDirection: "row",
    gap: 12,
    zIndex: 3,
  },
  iconButton: {
    padding: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    bottom: 100,
    transform: [{ skewY: "-3deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
    borderTopWidth: 1,
    height: 100,
    width: 90,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ scale: 1.5 }],
  },
  iconLabel: {
    fontSize: 13,
    transform: [{ skewY: "3deg" }],
    textAlign: "center",
  },
});
