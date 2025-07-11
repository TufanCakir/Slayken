import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useThemeContext } from "../context/ThemeContext";
import { t } from "../i18n";
import { Image } from "expo-image";
import { useAssets } from "../context/AssetsContext";
import { getItemImageUrl } from "../utils/item/itemUtils";
import { LinearGradient } from "expo-linear-gradient"; // <--- Wichtig!

export default function Header({ gradientColors }) {
  const { coins } = useCoins();
  const { crystals } = useCrystals();
  const { level, xp, xpToNextLevel } = useAccountLevel();
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();

  const [username, setUsername] = useState("Spieler");

  const progress = xpToNextLevel > 0 ? xp / xpToNextLevel : 0;
  const animatedXpBar = useRef(new Animated.Value(progress)).current;

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

  useEffect(() => {
    Animated.timing(animatedXpBar, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedXpBar]);

  const styles = createStyles(theme);

  // Farben aus Theme oder per Prop
  const colors = gradientColors ||
    theme.linearGradient || [
      theme.accentColorSecondary,
      theme.accentColor,
      theme.accentColorDark,
    ];

  const currencyList = [
    {
      key: "coins",
      image: imageMap.coinIcon || getItemImageUrl("coin1"),
      value: coins,
    },
    {
      key: "crystals",
      image: imageMap.crystalIcon || getItemImageUrl("crystal1"),
      value: crystals,
    },
  ];

  return (
    <View style={styles.headerContainer}>
      {/* Gradient als Background, unter allen anderen Elementen */}
      <LinearGradient
        colors={colors}
        start={[0, 0]}
        end={[1, 0]}
        style={StyleSheet.absoluteFill}
      />
      {/* USER + LEVEL */}
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
            },
          ]}
        />
        <Text style={styles.xpText}>
          {t("xpPrefix")} {xp} / {xpToNextLevel}
        </Text>
      </View>
      {/* CURRENCY */}
      <View style={styles.rightBlock}>
        {currencyList.map(({ key, image, value }) => (
          <View
            style={[
              styles.currencyItem,
              {
                borderColor: theme.borderGlowColor,
                shadowColor: theme.glowColor,
              },
            ]}
            key={key}
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
      paddingVertical: 12,
      height: 88,
      backgroundColor: "transparent", // <<--- Wichtig: damit der Gradient sichtbar bleibt!
      position: "relative", // <<--- Wichtig für absoluteFill
      overflow: "hidden",
    },
    leftBlock: {
      justifyContent: "center",
      alignItems: "flex-start",
    },
    username: {
      fontSize: 16,
      color: theme.textColor,
      letterSpacing: 0.2,
      marginBottom: 2,
    },
    level: {
      fontSize: 13,
      color: theme.textColor,
      opacity: 0.74,
      letterSpacing: 0.2,
    },
    centerBlock: {
      flex: 1,
      height: 22,
      marginHorizontal: 20,
      borderRadius: 12,
      overflow: "hidden",
      justifyContent: "center",
      position: "relative",
      borderWidth: 1.8,
      borderColor: theme.borderGlowColor,
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
      color: theme.textColor,
      zIndex: 1,
    },
    rightBlock: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },
    currencyItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 12,
      marginLeft: 7,
      elevation: 6,
    },
    currencyText: {
      fontSize: 14,
      marginLeft: 4,
      letterSpacing: 0.2,
      color: theme.textColor,
    },
    icon: {
      width: 50,
      height: 50,
      marginRight: 2,
    },
  });
}
