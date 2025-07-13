import React, { useRef, useEffect } from "react";
import {
  View,
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { getItemImageUrl } from "../utils/item/itemUtils";
import { useThemeContext } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

function RewardIcon({ type, style }) {
  const imgSrc = getItemImageUrl(type);
  return <Image source={imgSrc} style={style} contentFit="contain" />;
}

export default function MissionItem({ item, onCollect, gradientColors }) {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  // Gradientfarben: Von Prop oder aus Theme
  const colors = gradientColors ||
    theme.linearGradient || [
      theme.accentColorSecondary,
      theme.accentColor,
      theme.accentColorDark,
    ];

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

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
    if (item.collected) {
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      checkScale.setValue(0);
    }
  }, [item.completed, item.collected, scaleAnim, opacityAnim, checkScale]);

  const isCollectable = item.completed && !item.collected;
  const isCollected = !!item.collected;

  // Progressbar dynamisch (optional, falls item.progress & item.goal existieren)
  const progress =
    typeof item.progress === "number" && typeof item.goal === "number"
      ? Math.min(item.progress / item.goal, 1)
      : 1;

  return (
    <Animated.View
      style={[
        styles.missionItem,
        isCollected && styles.collectedItem,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          shadowOpacity: isCollectable ? 0.22 : 0.12,
          borderColor: isCollectable
            ? theme.glowColor
            : isCollected
            ? theme.shadowColor + "55"
            : theme.borderGlowColor,
        },
      ]}
    >
      {/* Gradient Hintergrund */}
      <LinearGradient
        colors={colors}
        start={[0, 0]}
        end={[1, 0]}
        style={StyleSheet.absoluteFill}
      />
      <Text
        style={[styles.missionText, isCollected && styles.missionTextCollected]}
        numberOfLines={2}
      >
        {item.title}
      </Text>

      {/* Progressbar */}
      {!isCollected && (
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: isCollectable
                  ? theme.glowColor
                  : theme.borderGlowColor,
                opacity: progress < 1 ? 0.77 : 1,
              },
            ]}
          />
        </View>
      )}

      {/* Sammel-Button */}
      {isCollectable && (
        <Pressable
          onPress={() => onCollect(item)}
          style={({ pressed }) => [
            styles.collectButton,
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Belohnung für ${item.title} einsammeln`}
        >
          <View style={styles.rewardRow}>
            <RewardIcon type={item.reward.type} style={styles.icon} />
            <Text style={styles.collectText}>+{item.reward.amount}</Text>
          </View>
        </Pressable>
      )}

      {/* Collected-Status */}
      {isCollected && (
        <Animated.View
          style={[
            styles.collectedCheck,
            { transform: [{ scale: checkScale }] },
          ]}
        >
          <Ionicons name="checkmark-circle" size={30} color={theme.glowColor} />
          <Text style={styles.collectedLabel}>Eingesammelt</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ---------- DYNAMISCHE STYLES ----------
function createStyles(theme) {
  return StyleSheet.create({
    missionItem: {
      marginBottom: 16,
      borderRadius: 15,
      padding: 19,
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 3,
      position: "relative",
      overflow: "hidden",
      backgroundColor: "transparent",
    },
    collectedItem: {
      backgroundColor: theme.shadowColor + "B8",
      opacity: 0.83,
    },
    missionText: {
      fontSize: 17,
      letterSpacing: 0.7,
      color: theme.textColor,
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
      marginBottom: 7,
    },
    missionTextCollected: {
      textDecorationLine: "line-through",
      opacity: 0.56,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: theme.shadowColor + "60",
      borderRadius: 5,
      overflow: "hidden",
      marginBottom: 11,
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 5,
    },
    collectButton: {
      marginTop: 7,
      backgroundColor: theme.glowColor,
      paddingVertical: 11,
      borderRadius: 9,
      alignItems: "center",
      shadowColor: theme.borderGlowColor,
      shadowOpacity: 0.12,
      shadowRadius: 8,
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
      fontWeight: "bold",
    },
    collectedCheck: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      justifyContent: "center",
      marginTop: 15,
    },
    collectedLabel: {
      color: theme.textColor,
      fontSize: 15,
      fontWeight: "bold",
      fontStyle: "italic",
      letterSpacing: 0.12,
    },
    icon: {
      width: 24,
      height: 24,
      marginRight: 2,
    },
  });
}
