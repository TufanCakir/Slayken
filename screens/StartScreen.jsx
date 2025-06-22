import { useState } from "react";
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
import { useLanguage } from "../context/LanguageContext";
import { t } from "../i18n";
import { Image } from "expo-image";
import { useClass } from "../context/ClassContext";

const { width } = Dimensions.get("window");
const availableThemes = ["dark", "light"];

// Statische Blue Farben für cleanen Card-Look
const BLUE = "#2563eb";
const BLUE_BG = "#0f172a";
const BLUE_ACCENT = "#38bdf8";
const BLUE_DARK = "#1e293b";
const BLUE_TEXT = "#f0f9ff";
const BLUE_CARD = "#1e293b";
const BLUE_SHADOW = "#1e40af";

export default function StartScreen() {
  const navigation = useNavigation();
  const { theme, uiThemeType, setUiThemeType } = useThemeContext();
  const { language, setLanguage } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const { classList, activeClassId } = useClass();

  const activeCharacter = classList.find((char) => char.id === activeClassId);

  const handleResetApp = () => {
    Alert.alert(
      t("resetConfirmTitle"),
      t("resetConfirmMessage"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("resetApp"),
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await Updates.reloadAsync();
            } catch (error) {
              Alert.alert(t("resetError"));
              console.error("Fehler beim Zurücksetzen:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Center Character + Name */}
      <View style={styles.centerContent}>
        {activeCharacter ? (
          <>
            <Image
              source={{ uri: activeCharacter.classUrl }}
              style={styles.characterImage}
              contentFit="contain"
              transition={300}
            />
            <Text style={[styles.characterName, { color: BLUE_TEXT }]}>
              {activeCharacter.name} (Lv. {activeCharacter.level})
            </Text>
          </>
        ) : (
          <Text
            style={{ color: BLUE_ACCENT, fontSize: 20, fontWeight: "bold" }}
          >
            Kein Charakter aktiv
          </Text>
        )}
      </View>

      {/* Start-Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("LoginScreen")}
        style={styles.startButton}
        activeOpacity={0.88}
      >
        <Text style={styles.startText}>{t("startPrompt")}</Text>
      </TouchableOpacity>

      {/* Copyright Bar */}
      <View style={styles.copyright}>
        <Text style={{ color: BLUE_ACCENT }}>{t("copyright")}</Text>
      </View>

      {/* Settings-Icon */}
      <TouchableOpacity
        style={styles.settingsIcon}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="settings-sharp" size={28} color={BLUE_ACCENT} />
      </TouchableOpacity>

      {/* Modal: Einstellungen */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("settingsTitle")}</Text>

            {/* Theme Switch */}
            <Text style={styles.sectionLabel}>{t("themeSection")}</Text>
            <View style={styles.themeButtons}>
              {availableThemes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor:
                        uiThemeType === type ? BLUE_ACCENT : "transparent",
                      borderColor: BLUE_ACCENT,
                    },
                  ]}
                  onPress={() => setUiThemeType(type)}
                >
                  <Text
                    style={{
                      color: uiThemeType === type ? BLUE_DARK : BLUE_ACCENT,
                      fontWeight: "bold",
                    }}
                  >
                    {t(`themeLabels.${type}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Language Switch */}
            <Text style={styles.sectionLabel}>{t("languageSection")}</Text>
            <View style={styles.themeButtons}>
              {["de", "en"].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor:
                        language === lang ? BLUE_ACCENT : "transparent",
                      borderColor: BLUE_ACCENT,
                    },
                  ]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text
                    style={{
                      color: language === lang ? BLUE_DARK : BLUE_ACCENT,
                      fontWeight: "bold",
                    }}
                  >
                    {lang.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Nutzungsbedingungen */}
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("ToSScreen");
              }}
            >
              <Feather name="file-text" size={20} color={BLUE_ACCENT} />
              <Text style={styles.modalItemText}>{t("termsOfService")}</Text>
            </TouchableOpacity>

            {/* Reset */}
            <TouchableOpacity style={styles.modalItem} onPress={handleResetApp}>
              <Ionicons name="refresh" size={20} color={BLUE_ACCENT} />
              <Text style={styles.modalItemText}>{t("resetApp")}</Text>
            </TouchableOpacity>

            {/* Socials */}
            <View style={styles.socialIcons}>
              <TouchableOpacity>
                <FontAwesome name="twitter" size={24} color={BLUE_ACCENT} />
              </TouchableOpacity>
              <TouchableOpacity>
                <FontAwesome name="instagram" size={24} color={BLUE_ACCENT} />
              </TouchableOpacity>
              <TouchableOpacity>
                <FontAwesome name="github" size={24} color={BLUE_ACCENT} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>{t("close")}</Text>
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
    backgroundColor: BLUE_BG,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
  },
  characterImage: {
    width: 180,
    height: 180,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: BLUE_ACCENT,
    backgroundColor: BLUE_CARD,
    shadowColor: BLUE_SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
  characterName: {
    fontSize: 19,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.3,
    textShadowColor: "#1e293b80",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  startButton: {
    position: "absolute",
    bottom: 140,
    alignSelf: "center",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    backgroundColor: BLUE_ACCENT,
    shadowColor: BLUE_SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 7,
    width: width * 0.8,
  },
  startText: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1.2,
    textAlign: "center",
    color: BLUE_DARK,
    textShadowColor: "#bae6fd",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  copyright: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: BLUE_CARD,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: BLUE_SHADOW,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  settingsIcon: {
    position: "absolute",
    bottom: 54,
    right: 22,
    padding: 12,
    borderRadius: 24,
    backgroundColor: BLUE_CARD,
    shadowColor: BLUE_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.17,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(16,24,39,0.7)",
  },
  modalContent: {
    width: "88%",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    backgroundColor: BLUE_CARD,
    shadowColor: BLUE_SHADOW,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: BLUE_ACCENT,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    color: BLUE_ACCENT,
  },
  themeButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  themeButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1.5,
    marginHorizontal: 3,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    marginTop: 4,
  },
  modalItemText: {
    fontSize: 16,
    color: BLUE_ACCENT,
    fontWeight: "600",
  },
  socialIcons: {
    flexDirection: "row",
    gap: 24,
    marginVertical: 22,
  },
  closeText: {
    fontSize: 17,
    fontWeight: "bold",
    color: BLUE_ACCENT,
    marginTop: 6,
    letterSpacing: 0.5,
  },
});
