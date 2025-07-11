import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import tutorialData from "../data/tutorialData.json";
import { useThemeContext } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function TutorialStartScreen() {
  const { theme } = useThemeContext();
  const navigation = useNavigation();
  const [step, setStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem("tutorialPlayed").then((played) => {
      if (played === "true") startGame();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startGame = async () => {
    try {
      await AsyncStorage.setItem("tutorialPlayed", "true");
      navigation.reset({ index: 0, routes: [{ name: "HomeScreen" }] });
    } catch (error) {
      console.error("Fehler beim Starten des Spiels:", error);
    }
  };

  const handleNext = () => {
    setStep((prev) => (prev === tutorialData.length - 1 ? prev : prev + 1));
    if (step === tutorialData.length - 1) startGame();
  };

  const styles = createStyles(theme);
  const currentStep = tutorialData[step];
  if (!currentStep) return null;

  const isLast = step === tutorialData.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={theme.linearGradient}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.overlay}
      >
        <Text style={styles.text}>{currentStep.text}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {isLast ? "Los geht’s" : "Weiter"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
    },
    overlay: {
      padding: 28,
      borderRadius: 16,
      marginHorizontal: 16,
      maxWidth: width * 0.92,
      alignSelf: "center",
      // Kein backgroundColor mehr, das macht jetzt der LinearGradient
    },
    text: {
      fontSize: 19,
      textAlign: "center",
      lineHeight: 28,
      color: theme.textColor,
      marginBottom: 12,
      letterSpacing: 0.1,
    },
    button: {
      marginTop: 28,
      paddingVertical: 13,
      paddingHorizontal: 36,
      borderRadius: 10,
      alignSelf: "center",
      minWidth: 140,
      backgroundColor: theme.borderGlowColor || theme.textColor,
    },
    buttonText: {
      fontSize: 17,
      fontWeight: "bold",
      letterSpacing: 0.5,
      color: theme.accentColor,
      textAlign: "center",
    },
  });
}
