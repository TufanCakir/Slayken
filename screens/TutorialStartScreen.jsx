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
import tutorialData from "../data/tutorialData.json";
import { useThemeContext } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function TutorialStartScreen() {
  const { theme } = useThemeContext(); // Theme holen
  const navigation = useNavigation();
  const [step, setStep] = useState(0);

  const steps = tutorialData;
  const currentStep = steps[step];

  useEffect(() => {
    checkIfTutorialPlayed();
  }, []);

  const checkIfTutorialPlayed = async () => {
    try {
      const played = await AsyncStorage.getItem("tutorialPlayed");
      if (played === "true") {
        startGame();
      }
    } catch (error) {
      console.error("Fehler beim Lesen des Tutorial-Status:", error);
    }
  };

  const startGame = async () => {
    try {
      await AsyncStorage.setItem("tutorialPlayed", "true");
      navigation.reset({
        index: 0,
        routes: [{ name: "HomeScreen" }],
      });
    } catch (error) {
      console.error("Fehler beim Starten des Spiels:", error);
    }
  };

  const handleNext = () => {
    if (step === steps.length - 1) {
      startGame();
    } else {
      setStep(step + 1);
    }
  };

  if (!currentStep) return null;

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.text}>{currentStep.text}</Text>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {step === steps.length - 1 ? "Los geht’s" : "Weiter"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    overlay: {
      backgroundColor: theme.accentColor,
      padding: 28,
      borderRadius: 16,
      marginHorizontal: 16,
      maxWidth: width * 0.92,
      alignSelf: "center",
    },
    text: {
      fontSize: 19,
      textAlign: "center",
      lineHeight: 28,
      color: theme.textColor,
      marginBottom: 10,
    },
    button: {
      marginTop: 26,
      paddingVertical: 13,
      paddingHorizontal: 34,
      borderRadius: 10,
      alignSelf: "center",
      alignItems: "center",
      minWidth: 140,
      backgroundColor: theme.accentColor,
    },
    buttonText: {
      fontSize: 16,
      letterSpacing: 1,
      color: theme.textColor,
    },
  });
}
