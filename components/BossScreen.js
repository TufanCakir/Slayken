// components/BossScreen.js

import { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useThemeContext } from "../context/ThemeContext";
import { Image } from "expo-image";

const BossScreen = ({
  bossName = "Unbekannter Boss",
  chapterTitle = "Kapitel",
  chapterText = "Besiege den Boss, um das Kapitel zu beenden.",
  imagePath,
  chapterType = "boss",
}) => {
  const navigation = useNavigation();
  const { theme, uiThemeType } = useThemeContext();

  const [loading, setLoading] = useState(false);

  const handleContinue = useCallback(async () => {
    if (!bossName) {
      console.error("❌ BossScreen: Missing bossName");
      return;
    }
    setLoading(true);
    try {
      const key = `chapter_${chapterType}_${bossName}_done`;
      await AsyncStorage.setItem(key, "true");
    } catch (error) {
      console.error("❌ AsyncStorage error:", error);
    } finally {
      setLoading(false);
      navigation.navigate("BattleScreen", {
        bossName,
        difficulty: "nightmare",
        chapterType,
      });
    }
  }, [bossName, chapterType, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={uiThemeType === "dark" ? "light-content" : "dark-content"}
      />

      <View style={[StyleSheet.absoluteFill]} />

      {/* Zurück-Button */}
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.accentColor }]}
        onPress={navigation.goBack}
        accessibilityRole="button"
        accessibilityLabel="Zurück"
      >
        <Ionicons
          name="chevron-back"
          size={28}
          color={theme.textColor}
          style={{
            textShadowColor: theme.shadowColor,
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
          }}
        />
      </TouchableOpacity>

      {/* Inhalt */}
      <View style={styles.content}>
        {imagePath && (
          <Image
            source={{ uri: imagePath }}
            style={styles.bossImage}
            contentFit="contain"
            transition={300}
          />
        )}

        <Text
          style={[
            styles.title,
            {
              color: theme.textColor,
              backgroundColor: theme.accentColor,
              borderColor: theme.shadowColor,
              textShadowColor: theme.shadowColor,
            },
          ]}
        >
          {chapterTitle}
        </Text>
        <Text
          style={[
            styles.text,
            {
              color: theme.textColor,
              backgroundColor: theme.accentColor,
              borderColor: theme.shadowColor,
              textShadowColor: theme.shadowColor,
            },
          ]}
        >
          {chapterText}
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.accentColor,
              shadowColor: theme.shadowColor,
            },
          ]}
          onPress={handleContinue}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={loading ? "Lädt..." : `Stelle dich ${bossName}`}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.textColor} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.textColor }]}>
              Stelle dich {bossName}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BossScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 20,
    zIndex: 5,
    bottom: 100,
  },
  bossImage: {
    width: "80%",
    height: "40%",
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    zIndex: 6,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    zIndex: 6,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    minWidth: "60%",
    marginBottom: 20,
    zIndex: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
