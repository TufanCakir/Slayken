import { StyleSheet, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { useLoading } from "../context/LoadingContext";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";

// Schön blaues Glass-Overlay mit Blur!
export default function LoadingOverlay() {
  const { loading } = useLoading();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    if (loading) {
      spinAnim.setValue(0);
      animationRef.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animationRef.current.start();

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        animationRef.current?.stop();
      });
    }
  }, [loading]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <BlurView intensity={75} tint="light" style={StyleSheet.absoluteFill} />
      <Animated.View style={styles.spinnerCard}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image
            source={require("../assets/loading.png")}
            style={styles.spinner}
            contentFit="contain"
            transition={200}
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
    backgroundColor: "rgba(37, 99, 235, 0.17)", // blue glassy
    padding: 30,
    borderRadius: 24,
    shadowColor: "#2563eb",
    shadowOpacity: 0.28,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    borderWidth: 1.5,
    borderColor: "#60a5fa55", // blauer Glow
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 88,
    height: 88,
  },
});
