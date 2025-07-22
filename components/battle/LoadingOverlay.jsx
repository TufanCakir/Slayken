import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import mapData from "../../data/maps/mapData.json";

const LoadingOverlay = React.memo(function LoadingOverlay({
  currentMap,
  targetMap,
}) {
  const readableNames = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(mapData).map(([key, value]) => [
          key.toLowerCase(),
          value.name,
        ])
      ),
    []
  );

  const readable = useMemo(() => {
    if (!targetMap) return "Unbekannt";
    return readableNames[targetMap.toLowerCase()] || targetMap || "Unbekannt";
  }, [targetMap, readableNames]);

  return (
    <View style={styles.loadingScreen}>
      <Image
        source={require("../../assets/loading.png")}
        style={{ width: 120, height: 120 }}
      />
      <Text style={styles.loadingText}>Reise nach {readable} …</Text>
    </View>
  );
});

export default LoadingOverlay;

const styles = StyleSheet.create({
  loadingScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
