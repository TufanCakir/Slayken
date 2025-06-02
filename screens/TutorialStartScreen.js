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
import { useChapter } from "../context/ChapterContext";
import { useThemeContext } from "../context/ThemeContext";
import tutorialData from "../data/tutorialData.json";

const { width } = Dimensions.get("window");

export default function TutorialStartScreen() {
  const navigation = useNavigation();
  const { setChapterType, setChapterProgress } = useChapter();
  const { theme, uiThemeType } = useThemeContext();
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
      setChapterType("boss");
      setChapterProgress(0, "boss");
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
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: theme.accentColor,
            borderColor: theme.shadowColor,
          },
        ]}
      >
        <Text style={[styles.text, { color: theme.textColor }]}>
          {currentStep.text}
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.accentColor,
              shadowColor: theme.shadowColor,
            },
          ]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, { color: theme.textColor }]}>
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
  },
  overlay: {
    padding: 24,
    borderRadius: 12,
    marginHorizontal: 16,
    maxWidth: width * 0.9,
    borderWidth: 1,
    alignSelf: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    alignItems: "center",
    minWidth: 140,
    shadowRadius: 6,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});
