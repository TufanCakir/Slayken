import { View, StyleSheet, Animated, Easing, Dimensions } from "react-native";
import { useEffect, useRef } from "react";
import { useLoading } from "../context/LoadingContext";
import { useAssets } from "../context/AssetsContext";
import { useThemeContext } from "../context/ThemeContext";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";

export default function LoadingOverlay({ showText = false }) {
  const { loading } = useLoading();
  const { imageMap } = useAssets();
  const { theme } = useThemeContext();

  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const spinLoopRef = useRef();
  const glowLoopRef = useRef();

  // Responsiv: Spinner-Größe
  const { width } = Dimensions.get("window");
  const spinnerSize = width < 400 ? 60 : 88;

  useEffect(() => {
    if (loading) {
      spinAnim.setValue(0);
      fadeAnim.setValue(0);
      glowAnim.setValue(0);

      spinLoopRef.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 950,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinLoopRef.current.start();

      glowLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 950,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 950,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
      glowLoopRef.current.start();

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 340,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start(() => {
        spinLoopRef.current?.stop();
        glowLoopRef.current?.stop();
      });
    }
    return () => {
      spinLoopRef.current?.stop();
      glowLoopRef.current?.stop();
    };
  }, [loading, spinAnim, fadeAnim, glowAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const glow = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 1],
  });

  if (!loading) return null;

  const spinnerSource = imageMap?.spinner || require("../assets/loading.png");
  const blurType = theme?.type === "dark" ? "dark" : "light";
  const bgOverlay =
    theme?.type === "dark" ? "rgba(20,20,32,0.48)" : "rgba(236,241,255,0.31)";
  const glowColor = theme?.glowColor || "#99ffff";

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <BlurView
        intensity={70}
        tint={blurType}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.bg, { backgroundColor: bgOverlay }]} />
      <Animated.View
        style={[
          styles.spinnerCard,
          {
            shadowColor: glowColor,
            shadowOpacity: glow,
            borderColor: glowColor,
          },
        ]}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image
            source={spinnerSource}
            style={[
              styles.spinner,
              { width: spinnerSize, height: spinnerSize },
            ]}
            contentFit="contain"
            transition={300}
          />
        </Animated.View>
        {showText && (
          <Text style={[styles.loadingText, { color: theme?.textColor }]}>
            Lädt ...
          </Text>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    pointerEvents: "auto",
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  spinnerCard: {
    padding: 28,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,39,54,0.32)",
    borderWidth: 1.5,
    shadowRadius: 19,
    shadowOffset: { width: 0, height: 3 },
    elevation: 7,
    marginBottom: 32,
    minWidth: 90,
    minHeight: 90,
  },
  spinner: {
    width: 88,
    height: 88,
  },
  loadingText: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.24,
  },
});
