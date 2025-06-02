import { StyleSheet, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { useLoading } from "../context/LoadingContext";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";

export default function LoadingOverlay() {
  const { loading } = useLoading();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    if (loading) {
      // Spinner Rotation starten
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

      // Einblenden
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Ausblenden
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
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
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Image
          source={require("../assets/loading.png")}
          style={styles.spinner}
          contentFit="contain"
          transition={200}
        />
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
    pointerEvents: "auto", // verhindert Interaktion unterhalb
  },
  spinner: {
    width: 100,
    height: 100,
  },
});
