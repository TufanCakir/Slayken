import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useThemeContext } from "../context/ThemeContext";
import { t } from "../i18n";
import { Image } from "expo-image";
import { useAssets } from "../context/AssetsContext";
import { getItemImageUrl } from "../utils/item/itemUtils";
import { LinearGradient } from "expo-linear-gradient";

export default function Header({ gradientColors }) {
  const { coins } = useCoins();
  const { crystals } = useCrystals();
  const { level, xp, xpToNextLevel } = useAccountLevel();
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();

  const [username, setUsername] = useState("Spieler");

  // Progress als Wert zwischen 0 und 1
  const progress = xpToNextLevel > 0 ? Math.min(1, xp / xpToNextLevel) : 0;
  const animatedXpBar = useRef(new Animated.Value(progress)).current;

  // Username aus AsyncStorage holen
  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem("user")
      .then((storedUser) => {
        if (storedUser && isMounted) setUsername(storedUser);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // XP-Bar smooth animieren
  useEffect(() => {
    Animated.timing(animatedXpBar, {
      toValue: progress,
      duration: 660,
      useNativeDriver: false,
      easing: (t) => t * (2 - t),
    }).start();
  }, [progress]);

  const styles = createStyles(theme);

  const colors = gradientColors ||
    theme.linearGradient || [
      theme.accentColorSecondary,
      theme.accentColor,
      theme.accentColorDark,
    ];

  // Fallback-Images falls imageMap noch nicht geladen
  const coinIcon = imageMap?.coinIcon || getItemImageUrl("coin1");
  const crystalIcon = imageMap?.crystalIcon || getItemImageUrl("crystal1");

  const currencyList = [
    {
      key: "coins",
      image: coinIcon,
      value: coins,
      accessibilityLabel: "Coins",
    },
    {
      key: "crystals",
      image: crystalIcon,
      value: crystals,
      accessibilityLabel: "Crystals",
    },
  ];

  // Highlight für "Admin"-User
  const isSpecialUser =
    typeof username === "string" &&
    ["tufan", "admin", "tc", "tcakir", "tufancakir"].some((n) =>
      username.toLowerCase().includes(n)
    );

  return (
    <View style={styles.headerContainer} accessible accessibilityRole="header">
      <LinearGradient
        colors={colors}
        start={[0, 0]}
        end={[1, 0]}
        style={StyleSheet.absoluteFill}
      />

      {/* Links: Username & Level */}
      <View style={styles.leftBlock}>
        <Text
          style={[styles.username, isSpecialUser && styles.usernameSpecial]}
          accessibilityLabel={t("usernameLabel") || "Benutzername"}
        >
          {username}
        </Text>
        <Text style={styles.level} accessibilityLabel="Account-Level">
          {t("levelPrefix") || "Level"} {level}
        </Text>
      </View>

      {/* Mitte: XP-Bar */}
      <View style={styles.centerBlock}>
        <Animated.View
          style={[
            styles.xpBarFill,
            {
              width: animatedXpBar.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              borderColor: theme.borderGlowColor + "36",
              backgroundColor: theme.accentColor + "1A",
            },
          ]}
        />
        <Text style={styles.xpText} accessibilityLabel="XP-Fortschritt">
          {t("xpPrefix") || "XP"} {xp} / {xpToNextLevel}
        </Text>
      </View>

      {/* Rechts: Währungen */}
      <View style={styles.rightBlock}>
        {currencyList.map(({ key, image, value, accessibilityLabel }) => (
          <View
            key={key}
            style={[
              styles.currencyItem,
              {
                borderColor: theme.borderGlowColor + "36",
                backgroundColor: theme.accentColor + "1A",
              },
            ]}
            accessible
            accessibilityLabel={`${accessibilityLabel}: ${value}`}
          >
            <Image
              source={image}
              style={styles.icon}
              contentFit="contain"
              transition={250}
            />
            <Text style={styles.currencyText}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === "ios" ? 15 : 12,
      height: 90,
      backgroundColor: "transparent",
      position: "relative",
      overflow: "hidden",
    },
    leftBlock: {
      justifyContent: "center",
      alignItems: "flex-start",
      minWidth: 75,
      maxWidth: 120,
      paddingRight: 4,
    },
    username: {
      fontSize: 16,
      color: theme.textColor,
      letterSpacing: 0.18,
      marginBottom: 2,
      fontWeight: "bold",
      paddingHorizontal: 4,
      borderRadius: 7,
    },
    usernameSpecial: {
      borderWidth: 2.2,
      color: theme.accentColor,
      backgroundColor: theme.textColor,
      textShadowColor: theme.glowColor,
      textShadowRadius: 5,
    },
    level: {
      fontSize: 13,
      color: theme.textColor,
      letterSpacing: 0.15,
      opacity: 0.85,
      fontWeight: "600",
      paddingLeft: 2,
    },
    centerBlock: {
      flex: 1,
      height: 23,
      marginHorizontal: 16,
      borderRadius: 13,
      overflow: "hidden",
      justifyContent: "center",
      position: "relative",
      borderWidth: 1.7,
      borderColor: theme.borderGlowColor + "36",
      backgroundColor: theme.accentColor + "1A",
      shadowColor: theme.glowColor,
      shadowOpacity: 0.09,
      shadowRadius: 10,
      elevation: 3,
    },
    xpBarFill: {
      position: "absolute",
      left: 0,
      top: 0,
      height: "100%",
      borderRadius: 13,
      zIndex: 1,
      shadowRadius: 6,
      shadowOpacity: 0.17,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    xpText: {
      fontSize: 11.5,
      textAlign: "center",
      color: theme.textColor,
      zIndex: 2,
      fontWeight: "bold",
      letterSpacing: 0.13,
    },
    rightBlock: {
      flexDirection: "row",
      gap: 6,
      alignItems: "center",
      minWidth: 88,
      marginLeft: 2,
    },
    currencyItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 7,
      borderRadius: 12,
      marginLeft: 6,
      elevation: 7,
      borderWidth: 1.2,
      shadowRadius: 8,
      shadowOpacity: 0.23,
      shadowOffset: { width: 0, height: 3 },
    },
    currencyText: {
      fontSize: 14.5,
      marginLeft: 4,
      letterSpacing: 0.19,
      color: theme.textColor,
      fontWeight: "bold",
      textShadowColor: theme.glowColor,
      textShadowRadius: 2,
    },
    icon: {
      width: 36,
      height: 36,
      marginRight: 2,
      borderRadius: 8,
    },
  });
}
