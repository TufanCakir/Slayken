import React, { useEffect, useState } from "react";
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
  const [username, setUsername] = useState("");

  useEffect(() => {
    navigation.setOptions({ title: t("settingsTitle") });

    const loadUsername = async () => {
      const savedUser = await AsyncStorage.getItem("user");
      if (savedUser) setUsername(savedUser);
    };
    loadUsername();
  }, [language]);

  return (
    <ScreenLayout style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Spielername ändern */}
        <PlayerNameSection
          theme={theme}
          username={username}
          setUsername={setUsername}
        />

        {/* Sprache wählen */}
        <LanguageSection
          accentColor={theme.accentColor}
          textColor={theme.textColor}
        />

        {/* UI-Thema (Light/Dark) */}
        <UIThemeSection />

        {/* Musiksteuerung */}
        <MusicSection theme={theme} />

        {/* Nutzungsbedingungen */}
        <ToSSection />

        {/* App zurücksetzen */}
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
    padding: 20,
    paddingBottom: 100,
  },
});
