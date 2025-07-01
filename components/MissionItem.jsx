import React, { useRef, useEffect } from "react";
import {
  View,
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

// Icon-Komponente für Rewards
function RewardIcon({ type }) {
  if (type === "crystal")
    return (
      <MaterialCommunityIcons
        name="cards-diamond"
        size={18}
        color="#38bdf8"
        style={styles.icon}
      />
    );
  return (
    <FontAwesome5 name="coins" size={16} color="#facc15" style={styles.icon} />
  );
}

export default function MissionItem({ item, onCollect }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Animation nur, wenn neu abgeschlossen & noch nicht eingesammelt
  useEffect(() => {
    if (item.completed && !item.collected) {
      scaleAnim.setValue(0.94);
      opacityAnim.setValue(0.7);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 440,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [item.completed, item.collected]);

  // UI
  const isCollectable = item.completed && !item.collected;
  const isCollected = !!item.collected;
  const isCompleted = !!item.completed;

  return (
    <Animated.View
      style={[
        styles.missionItem,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        isCollected && styles.collectedItem,
      ]}
    >
      <Text
        style={[styles.missionText, isCollected && styles.missionTextCollected]}
      >
        {item.title}
      </Text>

      {/* Fortschrittsbalken */}
      {isCollectable && (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarFill} />
        </View>
      )}

      {/* Collect-Button */}
      {isCollectable && (
        <TouchableOpacity
          onPress={() => onCollect(item)}
          style={styles.collectButton}
          accessibilityRole="button"
          accessibilityLabel={`Belohnung für ${item.title} einsammeln`}
        >
          <View style={styles.rewardRow}>
            <RewardIcon type={item.reward.type} />
            <Text style={styles.collectText}>+{item.reward.amount}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Label nach Einsammeln */}
      {isCollected && (
        <Text style={styles.collectedLabel}>✅ Belohnung eingesammelt</Text>
      )}
    </Animated.View>
  );
}

// STYLES (Apple-inspiriert: soft, readable, responsive)
const styles = StyleSheet.create({
  missionItem: {
    marginBottom: 16,
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 18,
    transition: "background-color 220ms",
  },
  collectedItem: {
    backgroundColor: "#16202b",
  },
  missionText: {
    fontSize: 17,
    letterSpacing: 0.7,
    color: "#bae6fd",
  },
  missionTextCollected: {
    textDecorationLine: "line-through",
    opacity: 0.56,
  },
  progressBarContainer: {
    height: 7,
    backgroundColor: "#334155",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBarFill: {
    width: "100%",
    height: "100%",
    backgroundColor: "#22c55e",
  },
  collectButton: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  collectText: {
    color: "#f0f9ff",
    fontSize: 15,
    letterSpacing: 0.1,
  },
  collectedLabel: {
    marginTop: 12,
    textAlign: "center",
    color: "#10b981",
    fontStyle: "italic",
    fontSize: 13,
    letterSpacing: 0.1,
  },
  icon: {
    marginRight: 4,
  },
});
