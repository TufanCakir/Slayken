import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { t } from "../i18n";
import { useLanguage } from "../context/LanguageContext";
import { useThemeContext } from "../context/ThemeContext";
import ScreenLayout from "../components/ScreenLayout";

// 🧩 Modularisierte Sektionen (Tipp: direkt memoisiert importieren!)
import PlayerNameSection from "../components/settings/PlayerNameSection";
import LanguageSection from "../components/settings/LanguageSection";
import UIThemeSection from "../components/settings/UIThemeSection";
import MusicSection from "../components/settings/MusicSection";
import ToSSection from "../components/settings/ToSSection";
import DeleteSection from "../components/settings/DeleteSection";

// Optional: direkt memoisiert importieren! (im Komponentenfile selbst: export default React.memo(...))
// z.B. export default React.memo(PlayerNameSection);

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const { theme } = useThemeContext();

  useEffect(() => {
    navigation.setOptions({ title: t("settingsTitle") });
  }, [language, navigation]);

  // Styles nur bei Theme-Wechsel neu
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Konstant, keine Inline-Funktion für ScrollView-Props
  const scrollContentStyle = styles.scroll;

  return (
    <ScreenLayout style={styles.container}>
      <ScrollView contentContainerStyle={scrollContentStyle}>
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

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scroll: {
      paddingBottom: 100,
    },
  });
}
