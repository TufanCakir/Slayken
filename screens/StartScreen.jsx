import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  SafeAreaView,
  Linking,
  Platform,
  StyleSheet, // <-- HIER!
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
    icon: (color) => <FontAwesome5 name="youtube" size={24} color="#e11d48" />,
    key: "youtube",
  },
  {
    url: "https://x.com/Tufan_Cakir_",
    icon: (color) => <FontAwesome name="twitter" size={24} color={color} />,
    key: "twitter",
  },
  {
    url: "https://www.instagram.com/tufancakirorigins/",
    icon: (color) => <FontAwesome name="instagram" size={24} color={color} />,
    key: "instagram",
  },
  {
    url: "https://github.com/TufanCakir",
    icon: (color) => <FontAwesome name="github" size={24} color={color} />,
    key: "github",
  },
  {
    url: "https://tufan-cakir.itch.io/",
    icon: (color) => <FontAwesome5 name="itch-io" size={24} color={color} />,
    key: "itch",
  },
  {
    url: "https://slayken.com/",
    icon: (color) => (
      <MaterialCommunityIcons name="web" size={24} color={color} />
    ),
    key: "web",
  },
];

function SocialIcons({ theme }) {
  return (
    <View style={styles.socialIcons}>
      {SOCIALS.map((social) => (
        <TouchableOpacity
          key={social.key}
          onPress={() => Linking.openURL(social.url)}
          style={styles.socialIcon}
          accessibilityRole="link"
          activeOpacity={0.75}
        >
          {social.icon(social.key === "youtube" ? "#e11d48" : theme.textColor)}
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function StartScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const [modalVisible, setModalVisible] = useState(false);

  const localImage = require("../assets/slayken-font.png");
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <Image
          source={localImage}
          style={styles.characterImage}
          contentFit="contain"
          transition={300}
          accessibilityLabel="Slayken Schriftzug"
        />
      </View>
      {/* Start-Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("LoginScreen")}
        activeOpacity={0.88}
        style={styles.startButtonOuter}
        accessibilityRole="button"
        accessibilityLabel={t("startPrompt")}
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
          <Text style={styles.startText}>{t("startPrompt")}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Copyright */}
      <View style={styles.copyright}>
        <Text style={styles.copyrightText}>{t("copyright")}</Text>
      </View>

      {/* Settings-Icon */}
      <TouchableOpacity
        style={styles.settingsIcon}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t("settingsTitle")}
      >
        <Ionicons name="settings-sharp" size={28} color={theme.textColor} />
      </TouchableOpacity>

      {/* Settings-Modal */}
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
            <Text style={styles.modalTitle}>{t("settingsTitle")}</Text>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("ToSScreen");
              }}
              activeOpacity={0.82}
            >
              <Feather name="file-text" size={20} color={theme.textColor} />
              <Text style={styles.modalItemText}>{t("termsOfService")}</Text>
            </TouchableOpacity>

            <SocialIcons theme={theme} />

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={t("close")}
            >
              <Text style={styles.closeText}>{t("close")}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// -- STYLES --
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
      marginBottom: 80,
      maxWidth: "100%",
    },
    startButtonOuter: {
      position: "absolute",
      bottom: 134,
      alignSelf: "center",
      width: width * 0.83,
      borderRadius: 25,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: theme.glowColor,
          shadowRadius: 15,
          shadowOpacity: 0.84,
          shadowOffset: { width: 0, height: 8 },
        },
        android: { elevation: 14 },
      }),
    },
    startButton: {
      paddingVertical: 20,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    startText: {
      fontSize: 27,
      letterSpacing: 1.35,
      textAlign: "center",
      color: theme.textColor,
      fontWeight: "800",
      textTransform: "uppercase",
      textShadowColor: theme.glowColor,
      textShadowRadius: 9,
      textShadowOffset: { width: 0, height: 3 },
    },
    copyright: {
      width: "100%",
      alignItems: "center",
      paddingVertical: 8,
      backgroundColor: theme.accentColor + "db",
      borderTopLeftRadius: 17,
      borderTopRightRadius: 17,
      position: "absolute",
      bottom: 0,
      left: 0,
    },
    copyrightText: {
      color: theme.textColor,
      fontSize: 14.5,
      fontWeight: "500",
      textShadowColor: theme.shadowColor + "87",
      textShadowRadius: 3,
      textShadowOffset: { width: 0, height: 2 },
    },
    settingsIcon: {
      position: "absolute",
      bottom: 60,
      right: 25,
      padding: 12,
      borderRadius: 24,
      backgroundColor: accentBg,
      ...Platform.select({
        ios: {
          shadowColor: theme.glowColor,
          shadowRadius: 8,
          shadowOpacity: 0.59,
          shadowOffset: { width: 0, height: 2 },
        },
        android: { elevation: 8 },
      }),
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(16,16,24,0.80)",
    },
    modalContent: {
      width: "90%",
      borderRadius: 26,
      paddingVertical: 34,
      paddingHorizontal: 28,
      alignItems: "center",
      shadowColor: theme.glowColor,
      shadowRadius: 12,
      shadowOpacity: 0.18,
      elevation: 7,
    },
    modalTitle: {
      fontSize: 24,
      color: theme.textColor,
      marginBottom: 25,
      fontWeight: "bold",
      letterSpacing: 0.34,
      textTransform: "uppercase",
      textShadowColor: theme.glowColor,
      textShadowRadius: 7,
    },
    modalItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 23,
      marginTop: 7,
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderRadius: 9,
      backgroundColor: theme.shadowColor + "25",
    },
    modalItemText: {
      fontSize: 18,
      color: theme.textColor,
      marginLeft: 12,
      fontWeight: "600",
    },
    socialIcons: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginVertical: 30,
      gap: 7,
    },
    socialIcon: {
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 7,
      marginVertical: 3,
      padding: 6,
      borderRadius: 18,
      backgroundColor: theme.shadowColor + "11",
    },
    closeText: {
      fontSize: 18,
      color: theme.textColor,
      marginTop: 9,
      letterSpacing: 0.8,
      fontWeight: "bold",
      textShadowColor: theme.glowColor,
      textShadowRadius: 3,
    },
  });
}
