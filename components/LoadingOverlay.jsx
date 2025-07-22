import React, { useEffect, useRef, useMemo } from "react";
import { StyleSheet, Animated, Easing, View } from "react-native";
import { useLoading } from "../context/LoadingContext";
import { useAssets } from "../context/AssetsContext";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";

const LoadingOverlay = React.memo(function LoadingOverlay() {
  const { loading } = useLoading();
  const { imageMap } = useAssets();

  // Animation Refs
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinLoopRef = useRef();

  const spinnerSource = useMemo(
    () => imageMap?.spinner || require("../assets/loading.png"),
    [imageMap]
  );

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

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {/* Glassy BlurView Layer */}
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      {/* Optional transparenter Overlay */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
      </View>
      {/* Spinner Card */}
      <View style={styles.center}>
        <View style={styles.glassCard}>
          <View style={styles.glassBorder} pointerEvents="none" />
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
});

export default LoadingOverlay;

// --- Styles ohne unnötige Shadows ---
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
    backgroundColor: "rgba(255,255,255,0.17)",
    overflow: "visible",
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    borderWidth: 1.3,
    borderColor: "#ffffff60",
    zIndex: 2,
  },
  spinner: {
    width: 82,
    height: 82,
    zIndex: 5,
  },
});
