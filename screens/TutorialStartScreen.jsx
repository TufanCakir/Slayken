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

const { width } = Dimensions.get("window");

// Feste Blautöne
const BLUE_ACCENT = "#2563eb";
const BLUE_SHADOW = "#1e40af";
const BLUE_BG = "#1e293b";
const BLUE_TEXT = "#f0f9ff";

export default function TutorialStartScreen() {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: `${BLUE_BG}bb`, // leichter Blur-Effekt durch Transparenz
  },
  overlay: {
    backgroundColor: BLUE_BG,
    padding: 28,
    borderRadius: 16,
    marginHorizontal: 16,
    maxWidth: width * 0.92,
    borderWidth: 2,
    borderColor: BLUE_ACCENT,
    alignSelf: "center",
    shadowColor: BLUE_SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  text: {
    fontSize: 19,
    textAlign: "center",
    lineHeight: 28,
    color: BLUE_TEXT,
    marginBottom: 10,
    textShadowColor: "#1e40af88",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  button: {
    marginTop: 26,
    paddingVertical: 13,
    paddingHorizontal: 34,
    borderRadius: 10,
    alignSelf: "center",
    alignItems: "center",
    minWidth: 140,
    backgroundColor: BLUE_ACCENT,
    shadowColor: BLUE_SHADOW,
    shadowRadius: 9,
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
    borderWidth: 2,
    borderColor: "#38bdf8",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
    color: BLUE_TEXT,
    textShadowColor: "#17255455",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
