import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  SafeAreaView,
  Linking,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Ionicons,
  Feather,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { t } from "../i18n";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeContext } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const SOCIALS = [
  {
    url: "https://youtube.com/@tufancakirofficial",
    icon: (theme) => <FontAwesome5 name="youtube" size={24} color="#e11d48" />,
    key: "youtube",
  },
  {
    url: "https://x.com/Tufan_Cakir_",
    icon: (theme) => (
      <FontAwesome name="twitter" size={24} color={theme.textColor} />
    ),
    key: "twitter",
  },
  {
    url: "https://www.instagram.com/tufancakirorigins/",
    icon: (theme) => (
      <FontAwesome name="instagram" size={24} color={theme.textColor} />
    ),
    key: "instagram",
  },
  {
    url: "https://github.com/TufanCakir",
    icon: (theme) => (
      <FontAwesome name="github" size={24} color={theme.textColor} />
    ),
    key: "github",
  },
  {
    url: "https://tufan-cakir.itch.io/",
    icon: (theme) => (
      <FontAwesome5 name="itch-io" size={24} color={theme.textColor} />
    ),
    key: "itch",
  },
  {
    url: "https://slayken.com/",
    icon: (theme) => (
      <MaterialCommunityIcons name="web" size={24} color={theme.textColor} />
    ),
    key: "web",
  },
];

export default function StartScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const [modalVisible, setModalVisible] = useState(false);

  // Lokales Bild per require
  const localImage = require("../assets/slayken-font.png");

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <Image
          source={localImage}
          style={styles.characterImage}
          contentFit="contain"
          transition={300}
        />
      </View>

      {/* START BUTTON mit Gradient & Glow */}
      <TouchableOpacity
        onPress={() => navigation.navigate("LoginScreen")}
        activeOpacity={0.88}
        style={styles.startButtonOuter}
      >
        <LinearGradient
          colors={[
            theme.accentColorSecondary,
            theme.accentColor,
            theme.accentColorDark,
          ]}
          start={[0.1, 0]}
          end={[1, 1]}
          style={styles.startButton}
        >
          <Text
            style={[
              styles.startText,
              {
                textShadowColor: theme.glowColor,
                textShadowRadius: 8,
                textShadowOffset: { width: 0, height: 3 },
              },
            ]}
          >
            {t("startPrompt")}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Copyright-Block mit Action-Color */}
      <View style={styles.copyright}>
        <Text
          style={[
            styles.copyrightText,
            {
              textShadowColor: theme.shadowColor + "77",
              textShadowRadius: 3,
              textShadowOffset: { width: 0, height: 2 },
            },
          ]}
        >
          {t("copyright")}
        </Text>
      </View>

      {/* Settings-Icon, leicht transparent */}
      <TouchableOpacity
        style={styles.settingsIcon}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="settings-sharp" size={28} color={theme.textColor} />
      </TouchableOpacity>

      {/* Modal mit Gradient */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={[
              theme.accentColorSecondary + "f0",
              theme.accentColor + "e0",
              theme.accentColorDark + "e0",
            ]}
            start={[0.1, 0]}
            end={[1, 1]}
            style={styles.modalContent}
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  textShadowColor: theme.glowColor,
                  textShadowRadius: 6,
                  textShadowOffset: { width: 0, height: 2 },
                },
              ]}
            >
              {t("settingsTitle")}
            </Text>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("ToSScreen");
              }}
            >
              <Feather name="file-text" size={20} color={theme.textColor} />
              <Text style={styles.modalItemText}>{t("termsOfService")}</Text>
            </TouchableOpacity>

            <View style={styles.socialIcons}>
              {SOCIALS.map((social) => (
                <TouchableOpacity
                  key={social.key}
                  onPress={() => Linking.openURL(social.url)}
                  style={styles.socialIcon}
                  activeOpacity={0.75}
                >
                  {social.icon(theme)}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>{t("close")}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// -- ACTION STYLES --
function createStyles(theme) {
  const accentBg = theme.accentColor + "f0";
  return StyleSheet.create({
    container: { flex: 1 },
    centerContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    characterImage: {
      width: 500,
      height: 500,
      marginBottom: 100,
    },
    startButtonOuter: {
      position: "absolute",
      bottom: 140,
      alignSelf: "center",
      width: width * 0.8,
      borderRadius: 24,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: theme.glowColor,
          shadowRadius: 13,
          shadowOpacity: 0.8,
          shadowOffset: { width: 0, height: 8 },
        },
        android: {
          elevation: 13,
        },
      }),
    },
    startButton: {
      paddingVertical: 18,
      paddingHorizontal: 48,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    startText: {
      fontSize: 26,
      letterSpacing: 1.3,
      textAlign: "center",
      color: theme.textColor,
      fontWeight: "800",
      textTransform: "uppercase",
      // Starke Lesbarkeit auf Flammen
    },
    copyright: {
      width: "100%",
      alignItems: "center",
      paddingVertical: 8,
      backgroundColor: theme.accentColor + "d9",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      position: "absolute",
      bottom: 0,
      left: 0,
    },
    copyrightText: {
      color: theme.textColor,
      fontSize: 14,
      fontWeight: "500",
    },
    settingsIcon: {
      position: "absolute",
      bottom: 54,
      right: 22,
      padding: 12,
      borderRadius: 24,
      backgroundColor: accentBg,
      ...Platform.select({
        ios: {
          shadowColor: theme.glowColor,
          shadowRadius: 8,
          shadowOpacity: 0.55,
          shadowOffset: { width: 0, height: 2 },
        },
        android: {
          elevation: 7,
        },
      }),
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(16,16,24,0.77)",
    },
    modalContent: {
      width: "88%",
      borderRadius: 24,
      padding: 28,
      alignItems: "center",
      // Gradient als Hintergrund!
    },
    modalTitle: {
      fontSize: 24,
      color: theme.textColor,
      marginBottom: 20,
      fontWeight: "bold",
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    modalItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 18,
      marginTop: 7,
    },
    modalItemText: {
      fontSize: 17,
      color: theme.textColor,
      marginLeft: 12,
      fontWeight: "600",
    },
    socialIcons: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginVertical: 28,
    },
    socialIcon: {
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 6,
      marginVertical: 2,
    },
    closeText: {
      fontSize: 18,
      color: theme.textColor,
      marginTop: 10,
      letterSpacing: 0.8,
      fontWeight: "bold",
    },
  });
}
