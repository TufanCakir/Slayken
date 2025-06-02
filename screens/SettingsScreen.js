// Datei: screens/SettingsScreen.js
import React, { useCallback, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";

import { useLanguage } from "../context/LanguageContext";
import { useThemeContext } from "../context/ThemeContext";
import { useMusic } from "../context/MusicContext";
import { t } from "../i18n";
import ScreenLayout from "../components/ScreenLayout";
import Slider from "@react-native-community/slider";

// Verfügbare Sprachen und Themes
const LANGUAGES = ["de", "en"];
const THEMES = ["dark", "light"];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { language, setLanguage } = useLanguage();
  const { uiThemeType, theme, setUiThemeType } = useThemeContext();
  const {
    volume,
    setVolume,
    isPlaying,
    pauseMusic,
    resumeMusic,
    currentTrack,
    currentIndex,
    allTracks,
    playMusic,
  } = useMusic();

  // State, um den Lade-Indikator beim Trackwechsel anzuzeigen
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

  // Header-Titel setzen: wenn sich `language` ändert, updaten wir den Header
  useEffect(() => {
    navigation.setOptions({ title: t("settingsTitle") });
  }, [language]);

  const onChangeLanguage = useCallback(
    (code) => {
      if (code !== language) {
        setLanguage(code);
      }
    },
    [language, setLanguage]
  );

  const onChangeTheme = useCallback(
    (value) => {
      if (value !== uiThemeType) {
        setUiThemeType(value);
      }
    },
    [uiThemeType, setUiThemeType]
  );

  const confirmReset = useCallback(() => {
    Alert.alert(
      t("resetConfirmTitle"),
      t("resetConfirmMessage"),
      [
        {
          text: t("cancel") || (language === "de" ? "Abbrechen" : "Cancel"),
          style: "cancel",
        },
        {
          text: t("resetApp"),
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await Updates.reloadAsync();
            } catch (e) {
              console.error(e);
              Alert.alert(t("resetError"));
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [language]);

  // Sprung zum vorherigen Track
  const handlePrevTrack = async () => {
    if (currentIndex > 0) {
      setIsLoadingTrack(true);
      await playMusic(allTracks[currentIndex - 1]);
      setIsLoadingTrack(false);
    }
  };

  // Sprung zum nächsten Track (loopend am Ende)
  const handleNextTrack = async () => {
    const nextIdx = currentIndex + 1 < allTracks.length ? currentIndex + 1 : 0;
    setIsLoadingTrack(true);
    await playMusic(allTracks[nextIdx]);
    setIsLoadingTrack(false);
  };

  return (
    <ScreenLayout style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Sprache-Section */}
          <Section title={t("languageSection")} textColor={theme.accentColor}>
            <Text style={[styles.current, { color: theme.accentColor }]}>
              {language.toUpperCase()}
            </Text>
            <View style={styles.row}>
              {LANGUAGES.map((code) => (
                <ControlButton
                  key={code}
                  label={t(`languageLabels.${code}`)}
                  selected={language === code}
                  onPress={() => onChangeLanguage(code)}
                  accent={theme.textColor}
                  textColor={theme.accentColor}
                />
              ))}
            </View>
          </Section>

          {/* UI-Theme-Section */}
          <Section title={t("uiThemeSection")} textColor={theme.textColor}>
            <View style={styles.row}>
              {THEMES.map((type) => (
                <ControlButton
                  key={type}
                  label={t(`themeLabels.${type}`)}
                  selected={uiThemeType === type}
                  onPress={() => onChangeTheme(type)}
                  accent={theme.textColor}
                  textColor={theme.accentColor}
                />
              ))}
            </View>
          </Section>

          {/* Musik-Section */}
          <Section title={t("musicSection")} textColor={theme.textColor}>
            <Pressable
              onPress={() => {
                isPlaying ? pauseMusic() : resumeMusic();
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: isPlaying }}
              style={({ pressed }) => [
                styles.linkButton,
                {
                  backgroundColor: theme.accentColor,
                  borderColor: theme.accentColor,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.linkText, { color: theme.textColor }]}>
                {isPlaying ? t("pauseMusic") : t("playMusic")}
              </Text>
            </Pressable>

            <View style={styles.volumeContainer}>
              <Text style={[styles.current, { color: theme.textColor }]}>
                {`${t("volumeLabel")}: ${Math.round(volume * 100)}%`}
              </Text>
              <Slider
                minimumValue={0}
                maximumValue={1}
                value={volume}
                onValueChange={setVolume}
                minimumTrackTintColor={theme.accentColor}
                maximumTrackTintColor={theme.textColor}
                thumbTintColor={theme.accentColor}
                accessibilityLabel={t("volumeLabel")}
              />
            </View>

            {/* Anzeige des aktuellen Titels */}
            <View style={styles.trackInfoContainer}>
              <Text
                style={[styles.currentTrackLabel, { color: theme.textColor }]}
              >
                {`${t("currentTrack")}:`}
              </Text>
              {currentTrack ? (
                <Text style={[styles.trackTitle, { color: theme.textColor }]}>
                  {currentTrack.title}
                </Text>
              ) : (
                <Text style={[styles.trackTitle, { color: theme.textColor }]}>
                  —
                </Text>
              )}
            </View>

            {/* Prev/Next Buttons */}
            <View style={styles.trackControls}>
              <Pressable
                onPress={handlePrevTrack}
                disabled={currentIndex === 0 || isLoadingTrack}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.controlButton,
                  {
                    backgroundColor:
                      currentIndex === 0 || isLoadingTrack
                        ? "#ccc"
                        : theme.textColor,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.controlButtonText,
                    {
                      color:
                        currentIndex === 0 || isLoadingTrack
                          ? "#999"
                          : theme.accentColor,
                    },
                  ]}
                >
                  {t("prevTrack")}
                </Text>
              </Pressable>

              {isLoadingTrack ? (
                <ActivityIndicator
                  size="small"
                  color={theme.accentColor}
                  style={styles.loadingIndicator}
                />
              ) : null}

              <Pressable
                onPress={handleNextTrack}
                disabled={isLoadingTrack}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.controlButton,
                  {
                    backgroundColor: isLoadingTrack ? "#ccc" : theme.textColor,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.controlButtonText,
                    { color: isLoadingTrack ? "#999" : theme.accentColor },
                  ]}
                >
                  {t("nextTrack")}
                </Text>
              </Pressable>
            </View>
          </Section>

          {/* Nutzungsbedingungen-Link */}
          <Section textColor={theme.textColor}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.linkButton,
                {
                  backgroundColor: theme.accentColor,
                  borderColor: theme.accentColor,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => navigation.navigate("ToSScreen")}
            >
              <Text style={[styles.linkText, { color: theme.textColor }]}>
                {t("termsOfService")}
              </Text>
            </Pressable>
          </Section>

          {/* App zurücksetzen */}
          <Section textColor={theme.textColor}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.resetButton,
                {
                  backgroundColor: theme.accentColor,
                  borderColor: theme.accentColor,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={confirmReset}
            >
              <Text style={[styles.resetText, { color: theme.textColor }]}>
                {t("resetApp")}
              </Text>
            </Pressable>
          </Section>
        </ScrollView>
      </SafeAreaView>
    </ScreenLayout>
  );
}

/**
 * Section-Komponente:
 * Zeigt optional einen Titel und umschließt den Inhalt.
 */
function Section({ title, children, textColor }) {
  return (
    <View style={styles.section}>
      {title ? (
        <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
      ) : null}
      {children}
    </View>
  );
}

/**
 * ControlButton-Komponente:
 * Ein Button, der einen aktiven Zustand kennt (selected) und sich barrierefrei verhält.
 */
function ControlButton({ label, selected, onPress, accent, textColor }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={selected}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: selected ? accent : "transparent",
          borderColor: accent,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={[styles.buttonText, { color: selected ? textColor : accent }]}
      >
        {label}
      </Text>
    </Pressable>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  current: {
    fontSize: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10, // ab React Native 0.71 verfügbar; sonst mit margin arbeiten
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  linkButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
  },
  linkText: {
    fontSize: 16,
    fontWeight: "500",
  },
  resetButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
  },
  resetText: {
    fontSize: 16,
    fontWeight: "500",
  },
  volumeContainer: {
    marginTop: 12,
  },
  // Neu: Container, um Titelinfos anzuzeigen
  trackInfoContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  currentTrackLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Neu: Buttons für Prev/Next
  trackControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#999",
    marginHorizontal: 4,
    alignItems: "center",
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingIndicator: {
    marginHorizontal: 8,
  },
});
