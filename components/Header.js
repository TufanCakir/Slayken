// Datei: components/Header.js
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useThemeContext } from "../context/ThemeContext";
import { t } from "../i18n"; // ← Übersetzungsfunktion importieren

export default function Header() {
  const { coins } = useCoins();
  const { crystals } = useCrystals();
  const { level, xp, xpToNextLevel } = useAccountLevel();
  const { theme } = useThemeContext();

  const progress = xp / xpToNextLevel;
  const [animatedXpBar] = useState(new Animated.Value(progress));

  useEffect(() => {
    Animated.timing(animatedXpBar, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: theme.accentColor,
          borderBottomColor: theme.shadowColor,
        },
      ]}
    >
      {/* LEVEL */}
      <View
        style={[
          styles.levelBlock,
          {
            borderColor: theme.borderColor || theme.textColor,
            backgroundColor: `${theme.textColor}11`,
          },
        ]}
      >
        <Text style={[styles.levelText, { color: theme.textColor }]}>
          {`${t("levelPrefix")} ${level}`}
          {/* z. B. "LV 5" auf Englisch, "STUFE 5" auf Deutsch */}
        </Text>
      </View>

      {/* XP-LEISTE */}
      <View style={styles.xpWrapper}>
        <Animated.View
          style={[
            styles.xpBar,
            {
              width: animatedXpBar.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: "#4caf50",
            },
          ]}
        />
        <Text style={[styles.xpLabel, { color: theme.textColor }]}>
          {`${t("xpPrefix")} ${xp} / ${xpToNextLevel}`}
          {/* z. B. "XP 20 / 100" oder "EP 20 / 100" */}
        </Text>
      </View>

      {/* WÄHRUNGEN */}
      <View style={styles.currencyRow}>
        <View
          style={[
            styles.currencyItem,
            {
              borderColor: theme.borderColor || theme.textColor,
              backgroundColor: `${theme.textColor}11`,
            },
          ]}
        >
          <FontAwesome5
            name="coins"
            size={16}
            color={theme.textColor}
            style={styles.icon}
          />
          <Text style={[styles.currencyText, { color: theme.textColor }]}>
            {coins}
          </Text>
        </View>

        <View
          style={[
            styles.currencyItem,
            {
              borderColor: theme.borderColor || theme.textColor,
              backgroundColor: `${theme.textColor}11`,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="cards-diamond"
            size={16}
            color={theme.textColor}
            style={styles.icon}
          />
          <Text style={[styles.currencyText, { color: theme.textColor }]}>
            {crystals}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  levelBlock: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    transform: [{ skewY: "-3deg" }],
  },
  levelText: {
    fontSize: 18,
    fontWeight: "bold",
    transform: [{ skewY: "3deg" }],
  },
  xpWrapper: {
    flex: 1,
    marginHorizontal: 12,
    height: 10,
    borderColor: "#fff",
    backgroundColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
  },
  xpBar: {
    height: "100%",
    borderRadius: 5,
    position: "absolute",
    left: 0,
    top: 0,
  },
  xpLabel: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    zIndex: 1,
  },
  currencyRow: {
    flexDirection: "row",
    gap: 6,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    transform: [{ skewY: "-3deg" }],
  },
  currencyText: {
    fontSize: 14,
    fontWeight: "bold",
    transform: [{ skewY: "3deg" }],
  },
  icon: {
    marginRight: 4,
    transform: [{ skewY: "3deg" }],
  },
});
