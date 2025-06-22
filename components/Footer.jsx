import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  AntDesign,
  Feather,
  FontAwesome,
  Ionicons,
  FontAwesome6,
} from "@expo/vector-icons";
import { t } from "../i18n";

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();
  const current = route.name;

  const tabs = [
    {
      key: "home",
      screen: "HomeScreen",
      icon: (isActive) => (
        <AntDesign
          name="home"
          size={24}
          color={isActive ? "#38bdf8" : "#f0f9ff"}
        />
      ),
      labelKey: "homeLabel",
    },
    {
      key: "overview",
      screen: "CharacterOverviewScreen",
      icon: (isActive) => (
        <FontAwesome6
          name="people-roof"
          size={24}
          color={isActive ? "#38bdf8" : "#f0f9ff"}
        />
      ),
      labelKey: "overviewLabel",
    },
    {
      key: "create",
      screen: "CreateCharacterScreen",
      icon: (isActive) => (
        <Ionicons
          name="people-circle-outline"
          size={24}
          color={isActive ? "#38bdf8" : "#f0f9ff"}
        />
      ),
      labelKey: "createLabel",
    },
    {
      key: "shop",
      screen: "ShopScreen",
      icon: (isActive) => (
        <Feather
          name="shopping-bag"
          size={24}
          color={isActive ? "#38bdf8" : "#f0f9ff"}
        />
      ),
      labelKey: "shopLabel",
    },
    {
      key: "exchange",
      screen: "ExchangeScreen",
      icon: (isActive) => (
        <FontAwesome
          name="exchange"
          size={24}
          color={isActive ? "#38bdf8" : "#f0f9ff"}
        />
      ),
      labelKey: "exchangeLabel",
    },
  ];

  const centerIndex = Math.floor(tabs.length / 2);

  return (
    <View style={styles.footer}>
      {tabs.map((tab, index) => {
        const isActive = current === tab.screen;
        const isCenter = index === centerIndex;
        return (
          <View key={tab.key} style={styles.tabWrapper}>
            <TouchableOpacity
              onPress={() => navigation.navigate(tab.screen)}
              activeOpacity={0.83}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              <View style={styles.icon}>{tab.icon(isActive)}</View>
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 10,
    height: 100,
    zIndex: 99,
    gap: 10,
    backgroundColor: "#1e293b", // modern deep blue
    borderTopWidth: 2,
    borderTopColor: "#2563eb",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
  },
  tabWrapper: {
    flex: 1,
  },
  tab: {
    transform: [{ skewY: "-3deg" }],
    borderWidth: 2,
    borderColor: "#2563eb",
    backgroundColor: "#2563eb",
    paddingTop: 6,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    marginHorizontal: 3,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 7,
    elevation: 3,
    zIndex: 99,
  },
  activeTab: {
    backgroundColor: "#1e293b",
    borderColor: "#38bdf8",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.38,
    elevation: 6,
  },
  label: {
    fontSize: 13,
    transform: [{ skewY: "3deg" }],
    marginTop: 4,
    textAlign: "center",
    color: "#f0f9ff",
    fontWeight: "bold",
    letterSpacing: 0.2,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  activeLabel: {
    color: "#38bdf8",
    textShadowColor: "#7dd3fc",
    textShadowRadius: 5,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ scale: 1.5 }],
  },
});
