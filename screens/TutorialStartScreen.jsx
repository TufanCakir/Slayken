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
  const { theme } = useThemeContext();
  const navigation = useNavigation();
  const [step, setStep] = useState(0);

  const steps = tutorialData;
  const currentStep = steps[step];

  useEffect(() => {
    AsyncStorage.getItem("tutorialPlayed").then((played) => {
      if (played === "true") startGame();
    });
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
    if (step === steps.length - 1) startGame();
    else setStep(step + 1);
  };

  if (!currentStep) return null;
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.text}>{currentStep.text}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.85}
        >
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
      backgroundColor: theme.bgImage ? "transparent" : theme.accentColor,
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
