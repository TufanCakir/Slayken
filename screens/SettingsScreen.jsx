import React, { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../i18n";
import { useLanguage } from "../context/LanguageContext";
import { useThemeContext } from "../context/ThemeContext";
import ScreenLayout from "../components/ScreenLayout";

// 🧩 Modularisierte Sektionen
import PlayerNameSection from "../components/settings/PlayerNameSection";
import MusicSection from "../components/settings/MusicSection";
import LanguageSection from "../components/settings/LanguageSection";
import UIThemeSection from "../components/settings/UIThemeSection";
import ToSSection from "../components/settings/ToSSection";
import DeleteSection from "../components/settings/DeleteSection";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const { theme } = useThemeContext();

  useEffect(() => {
    navigation.setOptions({ title: t("settingsTitle") });
  }, [navigation, language]);

  return (
    <ScreenLayout style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PlayerNameSection />
        <LanguageSection />
        <UIThemeSection />
        <MusicSection />
        <ToSSection />
        <DeleteSection />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 100,
  },
});
