import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useThemeContext } from "../context/ThemeContext";
import { t } from "../i18n";
import { Image } from "expo-image";
import { getItemImageUrl } from "../utils/item/itemUtils";

export default function Header() {
  const { coins } = useCoins();
  const { crystals } = useCrystals();
  const { level, xp, xpToNextLevel } = useAccountLevel();
  const { theme } = useThemeContext();

  const [username, setUsername] = useState("Spieler");

  const progress = xp / xpToNextLevel;
  const [animatedXpBar] = useState(new Animated.Value(progress));

  useEffect(() => {
    const fetchUsername = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUsername(storedUser);
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    Animated.timing(animatedXpBar, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const styles = createStyles(theme);

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
            },
          ]}
        />
        <Text style={styles.xpText}>
          {t("xpPrefix")} {xp} / {xpToNextLevel}
        </Text>
      </View>

      {/* CURRENCY */}
      <View style={styles.rightBlock}>
        <View style={styles.currencyItem}>
          <Image
            source={{ uri: getItemImageUrl("coin") }}
            style={styles.icon}
            contentFit="contain"
          />
          <Text style={styles.currencyText}>{coins}</Text>
        </View>
        <View style={styles.currencyItem}>
          <Image
            source={{ uri: getItemImageUrl("crystal") }}
            style={styles.icon}
            contentFit="contain"
          />
          <Text style={styles.currencyText}>{crystals}</Text>
        </View>
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
      borderBottomWidth: 2,
      borderBottomColor: theme.textColor,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 7,
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
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    level: {
      fontSize: 13,
      color: theme.textColor,
      opacity: 0.7,
      fontWeight: "700",
    },
    centerBlock: {
      flex: 1,
      height: 20,
      backgroundColor: "blue",
      marginHorizontal: 20,
      borderRadius: 12,
      overflow: "hidden",
      justifyContent: "center",
      position: "relative",
      borderWidth: 2,
      borderColor: theme.textColor,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.13,
      shadowRadius: 6,
    },
    xpBarFill: {
      position: "absolute",
      left: 0,
      top: 0,
      height: "100%",
      backgroundColor: "green",
      borderRadius: 12,
    },
    xpText: {
      fontSize: 11,
      textAlign: "center",
      fontWeight: "bold",
      color: theme.textColor,
      zIndex: 1,
    },
    rightBlock: {
      flexDirection: "row",
      gap: 8,
    },
    currencyItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.accentColor,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 10,
      marginLeft: 7,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: theme.textColor,
    },
    currencyText: {
      fontSize: 14,
      fontWeight: "bold",
      marginLeft: 3,
      letterSpacing: 0.2,
      color: theme.textColor,
    },
    icon: {
      width: 20,
      height: 20,
      marginRight: 2,
    },
  });
}
