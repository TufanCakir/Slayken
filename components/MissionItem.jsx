import React, { useRef, useEffect, useMemo } from "react";
import { View, Animated, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { getItemImageUrl } from "../utils/item/itemUtils";
import { useThemeContext } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

// RewardIcon als memoized Component
const RewardIcon = React.memo(function RewardIcon({ type, style }) {
  const imgSrc = getItemImageUrl(type);
  return <Image source={imgSrc} style={style} contentFit="contain" />;
});

const MissionItem = React.memo(function MissionItem({
  item,
  onCollect,
  gradientColors,
}) {
  const { theme } = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const colors = useMemo(
    () =>
      gradientColors ||
      theme.linearGradient || [
        theme.accentColorSecondary,
        theme.accentColor,
        theme.accentColorDark,
      ],
    [gradientColors, theme]
  );

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
          borderColor: isCollectable
            ? theme.glowColor
            : isCollected
            ? theme.shadowColor + "33"
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
            pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] },
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
          <Ionicons name="checkmark-circle" size={28} color={theme.glowColor} />
          <Text style={styles.collectedLabel}>Eingesammelt</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
});

export default MissionItem;

// ---------- DYNAMISCHE STYLES ----------
function createStyles(theme) {
  return StyleSheet.create({
    missionItem: {
      marginBottom: 15,
      borderRadius: 13,
      padding: 15,
      borderWidth: 1.5,
      borderColor: theme.borderGlowColor,
      // KEINE shadow*, elevation etc!
      backgroundColor: "transparent",
    },
    collectedItem: {
      backgroundColor: theme.shadowColor + "22",
      opacity: 0.7,
    },
    missionText: {
      fontSize: 16,
      letterSpacing: 0.3,
      color: theme.textColor,
      marginBottom: 7,
    },
    missionTextCollected: {
      textDecorationLine: "line-through",
      opacity: 0.56,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: theme.shadowColor + "20",
      borderRadius: 5,
      overflow: "hidden",
      marginBottom: 11,
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 5,
    },
    collectButton: {
      marginTop: 6,
      backgroundColor: theme.glowColor,
      paddingVertical: 9,
      borderRadius: 8,
      alignItems: "center",
    },
    rewardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    collectText: {
      color: theme.textColor,
      fontSize: 15,
      fontWeight: "bold",
      letterSpacing: 0.1,
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
