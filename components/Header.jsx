import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useThemeContext } from "../context/ThemeContext";
import { t } from "../i18n";
import { Image } from "expo-image";
import { useAssets } from "../context/AssetsContext"; // ✅ NEU: useAssets importieren
import { getItemImageUrl } from "../utils/item/itemUtils";

export default function Header() {
  const { coins } = useCoins();
  const { crystals } = useCrystals();
  const { level, xp, xpToNextLevel } = useAccountLevel();
  const { theme } = useThemeContext();
  const { imageMap } = useAssets(); // ✅ Assets holen

  const [username, setUsername] = useState("Spieler");

  // Fortschritt robust berechnen
  const progress = xpToNextLevel > 0 ? xp / xpToNextLevel : 0;
  const animatedXpBar = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    let isMounted = true;
    const fetchUsername = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser && isMounted) setUsername(storedUser);
      } catch (e) {}
    };
    fetchUsername();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    Animated.timing(animatedXpBar, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedXpBar]);

  const styles = createStyles(theme);

  const currencyList = [
    {
      key: "coins",
      image: imageMap.coinIcon || getItemImageUrl("coin"),
    },
    {
      key: "crystals",
      image: imageMap.crystalIcon || getItemImageUrl("crystal"),
    },
  ];

  const currencyValues = { coins, crystals };

  return (
    <View style={styles.headerContainer}>
      {/* USER + LEVEL BLOCK */}
      <View style={styles.leftBlock}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.level}>
          {t("levelPrefix")} {level}
        </Text>
      </View>

      {/* XP BAR */}
      <View style={styles.centerBlock}>
        <Animated.View
          style={[
            styles.xpBarFill,
            {
              width: animatedXpBar.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: theme.glowColor || "#14b8a6",
              shadowColor: theme.borderGlowColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.45,
              shadowRadius: 10,
              elevation: 6,
            },
          ]}
        />
        <Text style={styles.xpText}>
          {t("xpPrefix")} {xp} / {xpToNextLevel}
        </Text>
      </View>

      {/* CURRENCY */}
      <View style={styles.rightBlock}>
        {currencyList.map((c) => (
          <View
            style={[
              styles.currencyItem,
              {
                borderColor: theme.borderGlowColor,
                shadowColor: theme.glowColor,
              },
            ]}
            key={c.key}
          >
            <Image
              source={c.image}
              style={styles.icon}
              contentFit="contain"
              transition={250}
            />
            <Text style={styles.currencyText}>{currencyValues[c.key]}</Text>
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
      paddingVertical: 12,
      height: 88,
      backgroundColor: theme.accentColor,
      borderBottomWidth: 1.5,
      borderBottomColor: theme.borderGlowColor || "#333",
      shadowColor: theme.glowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 5,
    },
    leftBlock: {
      justifyContent: "center",
      alignItems: "flex-start",
    },
    username: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.textColor,
      letterSpacing: 0.2,
      marginBottom: 2,
      textShadowColor: theme.shadowColor + "55",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    level: {
      fontSize: 13,
      color: theme.textColor,
      opacity: 0.74,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    centerBlock: {
      flex: 1,
      height: 22,
      backgroundColor: theme.accentColor,
      marginHorizontal: 20,
      borderRadius: 12,
      overflow: "hidden",
      justifyContent: "center",
      position: "relative",
      borderWidth: 1.8,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 2,
    },
    xpBarFill: {
      position: "absolute",
      left: 0,
      top: 0,
      height: "100%",
      borderRadius: 12,
    },
    xpText: {
      fontSize: 11,
      textAlign: "center",
      fontWeight: "bold",
      color: theme.textColor,
      zIndex: 1,
      textShadowColor: theme.shadowColor + "99",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    rightBlock: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },
    currencyItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.accentColor,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 12,
      marginLeft: 7,
      borderWidth: 1.2,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 7,
      elevation: 6,
    },
    currencyText: {
      fontSize: 14,
      fontWeight: "bold",
      marginLeft: 4,
      letterSpacing: 0.2,
      color: theme.textColor,
      textShadowColor: theme.shadowColor + "88",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    icon: {
      width: 21,
      height: 21,
      marginRight: 2,
    },
  });
}
