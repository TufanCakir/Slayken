// Datei: screens/StartScreen.js
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather, FontAwesome } from "@expo/vector-icons";
import { useThemeContext } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext"; // <-- Sprach-Context
import { t } from "../i18n"; // <-- Übersetzungsfunktion
import { Image } from "expo-image";
import { characterData } from "../data/characterData";

const { width } = Dimensions.get("window");
const availableThemes = ["dark", "light"];

export default function StartScreen() {
  const navigation = useNavigation();
  const { theme, uiThemeType, setUiThemeType } = useThemeContext();
  const { language, setLanguage } = useLanguage();

  const [modalVisible, setModalVisible] = useState(false);

  // 🔥 Hook muss hier stehen:
  const [randomCharacter, setRandomCharacter] = useState(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * characterData.length);
    setRandomCharacter(characterData[randomIndex]);
  }, []);

  const handleResetApp = () => {
    Alert.alert(
      t("resetConfirmTitle"), // z.B. "App wirklich zurücksetzen?"
      t("resetConfirmMessage"), // z.B. "Alle gespeicherten Daten gehen verloren. Fortfahren?"
      [
        { text: t("cancel"), style: "cancel" }, // z.B. "Abbrechen"
        {
          text: t("resetApp"), // z.B. "Zurücksetzen"
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await Updates.reloadAsync();
            } catch (error) {
              Alert.alert(t("resetError")); // z.B. "Zurücksetzen fehlgeschlagen."
              console.error("Fehler beim Zurücksetzen:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  function Section({ title, children, textColor }) {
    return (
      <View style={styles.section}>
        {title ? (
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            {title}
          </Text>
        ) : null}
        {children}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Kein eigenes Hintergrund-Image mehr: das globale bgImage aus App.js */}

      <View style={styles.centerContent}>
        {randomCharacter && (
          <Image
            source={{ uri: randomCharacter.image }}
            style={styles.titleImage}
            contentFit="contain"
            transition={300}
          />
        )}
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate("TutorialStartScreen")}
        style={[
          styles.startButton,
          {
            backgroundColor: theme.accentColor,
            shadowColor: theme.shadowColor,
          },
        ]}
      >
        <Text style={[styles.startText, { color: theme.textColor }]}>
          {t("startPrompt")} {/* z.B. "Tippen um zu Start" */}
        </Text>
      </TouchableOpacity>

      <View
        style={[
          styles.copyright,
          {
            backgroundColor: theme.accentColor,
            shadowColor: theme.shadowColor,
          },
        ]}
      >
        <Text style={{ color: theme.textColor }}>
          {t("copyright")} {/* z.B. "© Tufan Cakir 2025" */}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.settingsIcon, { backgroundColor: theme.accentColor }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="settings-sharp" size={28} color={theme.textColor} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.accentColor },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>
              {t("settingsTitle")} {/* z.B. "Einstellungen" */}
            </Text>

            {/* --- Thema wechseln --- */}
            <Text style={[styles.sectionLabel, { color: theme.textColor }]}>
              {t("themeSection")} {/* z.B. "Theme wechseln" */}
            </Text>
            <View style={styles.themeButtons}>
              {availableThemes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor:
                        uiThemeType === type
                          ? theme.accentColor
                          : "transparent",
                      borderColor: theme.accentColor,
                    },
                  ]}
                  onPress={() => setUiThemeType(type)}
                >
                  <Text
                    style={{
                      color: theme.textColor,
                      fontWeight: "bold",
                    }}
                  >
                    {t(`themeLabels.${type}`)} {/* "Dunkel" / "Hell" */}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* --- Sprache wechseln (zwei Buttons) --- */}
            <Text style={[styles.sectionLabel, { color: theme.textColor }]}>
              {t("languageSection")} {/* z.B. "Sprache wechseln" */}
            </Text>
            <View style={styles.themeButtons}>
              {["de", "en"].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor:
                        language === lang ? theme.accentColor : "transparent",
                      borderColor: theme.accentColor,
                    },
                  ]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text
                    style={{
                      color: theme.textColor,
                      fontWeight: "bold",
                    }}
                  >
                    {lang.toUpperCase()} {/* "DE" / "EN" */}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* --- Nutzungsbedingungen --- */}
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("ToSScreen");
              }}
            >
              <Feather name="file-text" size={20} color={theme.textColor} />
              <Text style={[styles.modalItemText, { color: theme.textColor }]}>
                {t("termsOfService")} {/* z.B. "Nutzungsbedingungen" */}
              </Text>
            </TouchableOpacity>

            {/* --- App zurücksetzen --- */}
            <TouchableOpacity style={styles.modalItem} onPress={handleResetApp}>
              <Ionicons name="refresh" size={20} color={theme.accentColor} />
              <Text style={[styles.modalItemText, { color: theme.textColor }]}>
                {t("resetApp")} {/* z.B. "App zurücksetzen" */}
              </Text>
            </TouchableOpacity>

            {/* --- Soziale Icons (rein dekorativ) --- */}
            <View style={styles.socialIcons}>
              <TouchableOpacity>
                <FontAwesome
                  name="twitter"
                  size={24}
                  color={theme.accentColor}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <FontAwesome
                  name="instagram"
                  size={24}
                  color={theme.accentColor}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <FontAwesome
                  name="github"
                  size={24}
                  color={theme.accentColor}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.closeText, { color: theme.textColor }]}>
                {t("close")} {/* z.B. "Schließen" */}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
  },
  titleImage: {
    width: "80%",
    height: "80%",
  },
  startButton: {
    position: "absolute",
    bottom: 140,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: width * 0.8,
  },
  startText: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  copyright: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  settingsIcon: {
    position: "absolute",
    bottom: 50,
    right: 20,
    padding: 10,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: "85%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  themeButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  themeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  modalItemText: {
    fontSize: 16,
  },
  socialIcons: {
    flexDirection: "row",
    gap: 20,
    marginVertical: 20,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
