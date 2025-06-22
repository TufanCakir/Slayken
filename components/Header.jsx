import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { t } from "../i18n";

export default function Header() {
  const { coins } = useCoins();
  const { crystals } = useCrystals();
  const { level, xp, xpToNextLevel } = useAccountLevel();

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
          <FontAwesome5
            name="coins"
            size={14}
            color="#facc15"
            style={styles.icon}
          />
          <Text style={[styles.currencyText, { color: "#facc15" }]}>
            {coins}
          </Text>
        </View>
        <View style={styles.currencyItem}>
          <MaterialCommunityIcons
            name="cards-diamond"
            size={16}
            color="#38bdf8"
            style={styles.icon}
          />
          <Text style={[styles.currencyText, { color: "#38bdf8" }]}>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 88,
    backgroundColor: "#1e293b", // Modernes Dunkelblau
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
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
    color: "#60a5fa",
    letterSpacing: 0.2,
    marginBottom: 2,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  level: {
    fontSize: 13,
    color: "#dbeafe",
    fontWeight: "700",
    opacity: 0.85,
  },
  centerBlock: {
    flex: 1,
    height: 20,
    backgroundColor: "#334155", // Noch dunkleres Blau
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "#3b82f6",
    shadowColor: "#60a5fa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
  },
  xpBarFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    backgroundColor: "linear-gradient(90deg, #3b82f6 0%, #38bdf8 100%)", // Für Expo nicht direkt möglich, siehe Hinweis unten!
    backgroundColor: "#3b82f6", // Statisches Blau als Fallback
    borderRadius: 12,
  },
  xpText: {
    fontSize: 11,
    textAlign: "center",
    fontWeight: "bold",
    color: "#f0f9ff",
    zIndex: 1,
  },
  rightBlock: {
    flexDirection: "row",
    gap: 8,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 7,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 3,
    letterSpacing: 0.2,
  },
  icon: {
    marginRight: 2,
  },
});
