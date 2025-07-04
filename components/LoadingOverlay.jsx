import { StyleSheet, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { useLoading } from "../context/LoadingContext";
import { useAssets } from "../context/AssetsContext";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";

export default function LoadingOverlay() {
  const { loading } = useLoading();
  const { imageMap } = useAssets();

  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinLoopRef = useRef();

  // Animation starten & stoppen
  useEffect(() => {
    if (loading) {
      spinAnim.setValue(0);
      fadeAnim.setValue(0);

      spinLoopRef.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinLoopRef.current.start();

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        spinLoopRef.current?.stop();
      });
    }

    return () => {
      spinLoopRef.current?.stop();
    };
  }, [loading, spinAnim, fadeAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!loading) return null;

  // Sauberer Fallback, falls imageMap.spinner nicht vorhanden ist
  const spinnerSource = imageMap?.spinner || require("../assets/loading.png");

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <BlurView intensity={75} tint="light" style={StyleSheet.absoluteFill} />
      <Animated.View style={styles.spinnerCard}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image
            source={spinnerSource}
            style={styles.spinner}
            contentFit="contain"
            transition={300}
          />
        </Animated.View>
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
  spinnerCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30, 41, 59, 0.28)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  spinner: {
    width: 88,
    height: 88,
  },
});
