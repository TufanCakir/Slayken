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
import { useClass } from "../context/ClassContext";
import { useThemeContext } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function StartScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const [modalVisible, setModalVisible] = useState(false);
  const { classList, activeClassId } = useClass();
  const activeCharacter = classList.find((char) => char.id === activeClassId);

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        {activeCharacter ? (
          <>
            <Image
              source={{ uri: activeCharacter.classUrl }}
              style={styles.characterImage}
              contentFit="contain"
              transition={300}
            />
          </>
        ) : (
          <Text style={styles.noCharText}>Kein Charakter aktiv</Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate("LoginScreen")}
        style={styles.startButton}
        activeOpacity={0.88}
      >
        <Text style={styles.startText}>{t("startPrompt")}</Text>
      </TouchableOpacity>

      <View style={styles.copyright}>
        <Text style={styles.copyrightText}>{t("copyright")}</Text>
      </View>

      <TouchableOpacity
        style={styles.settingsIcon}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="settings-sharp" size={28} color={theme.textColor} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("settingsTitle")}</Text>

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
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("https://youtube.com/@tufancakirofficial")
                }
              >
                <FontAwesome5 name="youtube" size={24} color="#e11d48" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL("https://x.com/Tufan_Cakir_")}
              >
                <FontAwesome name="twitter" size={24} color={theme.textColor} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    "https://www.instagram.com/tufancakirorigins/"
                  )
                }
              >
                <FontAwesome
                  name="instagram"
                  size={24}
                  color={theme.textColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL("https://github.com/TufanCakir")}
              >
                <FontAwesome name="github" size={24} color={theme.textColor} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL("https://tufan-cakir.itch.io/")}
              >
                <FontAwesome5
                  name="itch-io"
                  size={24}
                  color={theme.textColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL("https://slayken.com/")}
              >
                <MaterialCommunityIcons
                  name="web"
                  size={24}
                  color={theme.textColor}
                />
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

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    centerContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 30,
    },
    characterImage: {
      width: 500,
      height: 500,
      marginBottom: 100,
    },
    noCharText: {
      color: theme.textColor,
      fontSize: 22,
    },
    startButton: {
      position: "absolute",
      bottom: 140,
      alignSelf: "center",
      paddingVertical: 16,
      paddingHorizontal: 44,
      borderRadius: 20,
      backgroundColor: theme.accentColor,
      width: width * 0.8,
    },
    startText: {
      fontSize: 22,
      letterSpacing: 1.3,
      textAlign: "center",
      color: theme.textColor,
    },
    copyright: {
      width: "100%",
      alignItems: "center",
      paddingVertical: 8,
      backgroundColor: theme.accentColor,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    copyrightText: {
      color: theme.textColor,
      fontSize: 14,
    },
    settingsIcon: {
      position: "absolute",
      bottom: 54,
      right: 22,
      padding: 12,
      borderRadius: 24,
      backgroundColor: theme.accentColor + "f0",
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(16,16,24,0.7)",
    },
    modalContent: {
      width: "88%",
      borderRadius: 24,
      padding: 28,
      alignItems: "center",
      backgroundColor: theme.accentColor,
    },
    modalTitle: {
      fontSize: 24,
      color: theme.textColor,
      marginBottom: 20,
    },
    modalItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 18,
      marginTop: 7,
    },
    modalItemText: {
      fontSize: 17,
      color: theme.textColor,
    },
    socialIcons: {
      flexDirection: "row",
      gap: 30,
      marginVertical: 28,
    },
    closeText: {
      fontSize: 18,
      color: theme.textColor,
      marginTop: 10,
      letterSpacing: 0.8,
    },
  });
}
