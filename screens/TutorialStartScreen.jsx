import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import tutorialData from "../data/tutorialData.json";
import { useThemeContext } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

// Memoisiertes Progress-Dot
const ProgressDot = React.memo(function ProgressDot({ active, style }) {
  return <View style={style(active)} />;
});

// Memoisierter Button
const TutorialButton = React.memo(function TutorialButton({
  onPress,
  loading,
  isLast,
  theme,
  styles,
}) {
  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading}
    >
      <LinearGradient
        colors={[
          theme.borderGlowColor || theme.textColor,
          theme.accentColorDark,
        ]}
        start={[0.1, 0]}
        end={[1, 1]}
        style={styles.buttonGradient}
      >
        <Text style={styles.buttonText}>
          {isLast ? "Los geht’s" : "Weiter"}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
});

export default function TutorialStartScreen() {
  const { theme } = useThemeContext();
  const navigation = useNavigation();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("tutorialPlayed").then((played) => {
      if (played === "true") startGame();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const styles = useMemo(() => createStyles(theme, width), [theme]);

  const startGame = useCallback(async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem("tutorialPlayed", "true");
      navigation.reset({ index: 0, routes: [{ name: "HomeScreen" }] });
    } catch (error) {
      setLoading(false);
      console.error("Fehler beim Starten des Spiels:", error);
    }
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (loading) return;
    if (step === tutorialData.length - 1) {
      startGame();
    } else {
      setStep((prev) => prev + 1);
    }
  }, [loading, step, startGame]);

  const currentStep = tutorialData[step];
  if (!currentStep) return null;

  const isLast = step === tutorialData.length - 1;

  // Memoisierte Dot-Styles für ProgressDot
  const dotStyle = useCallback(
    (active) => [styles.progressDot, active && styles.progressDotActive],
    [styles]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        {tutorialData.map((_, i) => (
          <ProgressDot key={i} active={i <= step} style={dotStyle} />
        ))}
      </View>
      <LinearGradient
        colors={
          theme.linearGradient || [
            theme.accentColorSecondary,
            theme.accentColor,
            theme.accentColorDark,
          ]
        }
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.overlay}
      >
        <Text style={styles.text}>{currentStep.text}</Text>
        <TutorialButton
          onPress={handleNext}
          loading={loading}
          isLast={isLast}
          theme={theme}
          styles={styles}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

function createStyles(theme, width) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: theme.background || theme.accentColor + "09",
    },
    progressContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 18,
      marginTop: Platform.OS === "ios" ? 18 : 8,
    },
    progressDot: {
      width: 14,
      height: 14,
      borderRadius: 8,
      backgroundColor: theme.shadowColor + "44",
      marginHorizontal: 4,
      borderWidth: 1.2,
      borderColor: theme.borderGlowColor + "55",
    },
    progressDotActive: {
      backgroundColor: theme.borderGlowColor || theme.textColor,
      borderColor: theme.borderGlowColor,
    },
    overlay: {
      padding: 32,
      borderRadius: 18,
      marginHorizontal: 12,
      maxWidth: width * 0.97,
      alignSelf: "center",
      shadowColor: theme.glowColor,
      shadowRadius: 18,
      shadowOpacity: 0.23,
      elevation: 5,
    },
    text: {
      fontSize: 20,
      textAlign: "center",
      lineHeight: 29,
      color: theme.textColor,
      marginBottom: 18,
      letterSpacing: 0.11,
      fontWeight: "600",
      textShadowColor: theme.glowColor,
      textShadowRadius: 6,
    },
    button: {
      marginTop: 33,
      borderRadius: 13,
      alignSelf: "center",
      minWidth: 145,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: theme.glowColor,
          shadowRadius: 9,
          shadowOpacity: 0.21,
          shadowOffset: { width: 0, height: 3 },
        },
        android: { elevation: 4 },
      }),
    },
    buttonGradient: {
      paddingVertical: 15,
      paddingHorizontal: 42,
      borderRadius: 13,
      alignItems: "center",
      width: "100%",
      justifyContent: "center",
    },
    buttonDisabled: {
      opacity: 0.46,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "bold",
      letterSpacing: 0.6,
      color: theme.accentColor,
      textAlign: "center",
      textShadowColor: theme.glowColor,
      textShadowRadius: 7,
    },
  });
}
