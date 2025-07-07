import React, { useRef, useEffect } from "react";
import {
  View,
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { getItemImageUrl } from "../utils/item/itemUtils";
import { useThemeContext } from "../context/ThemeContext";

// Belohnungs-Icon mit eigenen Bildern (Coin/Crystal)
function RewardIcon({ type, style }) {
  const imgSrc = getItemImageUrl(type);
  return <Image source={imgSrc} style={style} contentFit="contain" />;
}

export default function MissionItem({ item, onCollect }) {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

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
  }, [item.completed, item.collected, scaleAnim, opacityAnim]);

  const isCollectable = item.completed && !item.collected;
  const isCollected = !!item.collected;

  return (
    <Animated.View
      style={[
        styles.missionItem,
        isCollected && styles.collectedItem,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      <Text
        style={[styles.missionText, isCollected && styles.missionTextCollected]}
      >
        {item.title}
      </Text>

      {isCollectable && (
        <>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarFill} />
          </View>
          <TouchableOpacity
            onPress={() => onCollect(item)}
            style={styles.collectButton}
            accessibilityRole="button"
            accessibilityLabel={`Belohnung für ${item.title} einsammeln`}
          >
            <View style={styles.rewardRow}>
              <RewardIcon type={item.reward.type} style={styles.icon} />
              <Text style={styles.collectText}>+{item.reward.amount}</Text>
            </View>
          </TouchableOpacity>
        </>
      )}

      {isCollected && (
        <Text style={styles.collectedLabel}>✅ Belohnung eingesammelt</Text>
      )}
    </Animated.View>
  );
}

// ---------- DYNAMISCHE STYLES ----------
function createStyles(theme) {
  return StyleSheet.create({
    missionItem: {
      marginBottom: 16,
      backgroundColor: theme.accentColor,
      borderRadius: 14,
      padding: 18,
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 3,
    },
    collectedItem: {
      backgroundColor: theme.shadowColor,
      opacity: 0.82,
    },
    missionText: {
      fontSize: 17,
      letterSpacing: 0.7,
      color: theme.textColor,
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    },
    missionTextCollected: {
      textDecorationLine: "line-through",
      opacity: 0.56,
    },
    progressBarContainer: {
      height: 7,
      backgroundColor: theme.borderColor,
      borderRadius: 4,
      overflow: "hidden",
      marginTop: 10,
    },
    progressBarFill: {
      width: "100%",
      height: "100%",
      backgroundColor: theme.glowColor,
    },
    collectButton: {
      marginTop: 14,
      backgroundColor: theme.glowColor,
      paddingVertical: 11,
      borderRadius: 8,
      alignItems: "center",
      shadowColor: theme.borderGlowColor,
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    rewardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    collectText: {
      color: theme.textColor,
      fontSize: 15,
      letterSpacing: 0.1,
    },
    collectedLabel: {
      marginTop: 12,
      textAlign: "center",
      color: theme.glowColor,
      fontStyle: "italic",
      fontSize: 13,
      letterSpacing: 0.1,
      fontWeight: "bold",
    },
    icon: {
      width: 22,
      height: 22,
      marginRight: 3,
    },
  });
}
