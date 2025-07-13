import { StyleSheet, Animated, Easing, View } from "react-native";
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

  const spinnerSource = imageMap?.spinner || require("../assets/loading.png");

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {/* Glassy BlurView Layer */}
      <BlurView intensity={84} tint="light" style={StyleSheet.absoluteFill} />
      {/* Gradient-Overlay für weiches Licht */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(255,255,255,0.09)",
            borderRadius: 0,
          }}
        />
      </View>
      {/* Spinner Card mit Glass-Effekt */}
      <View style={styles.center}>
        <View style={styles.glassCard}>
          {/* Glasrand */}
          <View style={styles.glassBorder} pointerEvents="none" />
          {/* Glow */}
          <View style={styles.glow} pointerEvents="none" />
          {/* Spinner */}
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Image
              source={spinnerSource}
              style={styles.spinner}
              contentFit="contain"
              transition={300}
            />
          </Animated.View>
        </View>
      </View>
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
  center: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  glassCard: {
    padding: 34,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)", // Mehr Weiß = mehr Milchglas
    overflow: "visible",
    shadowColor: "#fff",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 3 },
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    borderWidth: 1.7,
    borderColor: "#ffffff60", // Glasrand, weiß und halbtransparent
    zIndex: 2,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 0,
    shadowColor: "#d0e8ff",
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 10,
    zIndex: 1,
  },
  spinner: {
    width: 82,
    height: 82,
    zIndex: 5,
  },
});
