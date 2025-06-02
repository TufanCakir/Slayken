// Datei: components/Footer.js
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  MaterialCommunityIcons,
  Feather,
  FontAwesome,
} from "@expo/vector-icons";
import { useThemeContext } from "../context/ThemeContext";
import { t } from "../i18n"; // ← Übersetzungsfunktion importieren

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();
  const current = route.name;
  const { theme } = useThemeContext();

  const tabs = [
    {
      key: "home",
      screen: "HomeScreen",
      icon: (
        <MaterialCommunityIcons name="home" size={24} color={theme.textColor} />
      ),
      labelKey: "homeLabel",
    },
    {
      key: "team",
      screen: "TeamSelectionScreen",
      icon: (
        <MaterialCommunityIcons
          name="account-group"
          size={24}
          color={theme.textColor}
        />
      ),
      labelKey: "teamLabel",
    },
    {
      key: "summon",
      screen: "SummonScreen",
      icon: (
        <MaterialCommunityIcons
          name="crystal-ball"
          size={24}
          color={theme.textColor}
        />
      ),
      labelKey: "summonLabel",
    },
    {
      key: "shop",
      screen: "ShopScreen",
      icon: <Feather name="shopping-bag" size={24} color={theme.textColor} />,
      labelKey: "shopLabel",
    },
    {
      key: "exchange",
      screen: "ExchangeScreen",
      icon: <FontAwesome name="exchange" size={24} color={theme.textColor} />,
      labelKey: "exchangeLabel",
    },
  ];

  const centerIndex = Math.floor(tabs.length / 2);

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: theme.accentColor,
          borderTopColor: theme.shadowColor,
        },
      ]}
    >
      {tabs.map((tab, index) => {
        const isActive = current === tab.screen;
        const isCenter = index === centerIndex;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => navigation.navigate(tab.screen)}
            activeOpacity={0.8}
            style={[
              styles.tab,
              isCenter && styles.centerTab,
              {
                borderColor: isActive
                  ? theme.borderColor || theme.textColor
                  : theme.shadowColor,
                backgroundColor: theme.accentColor,
              },
            ]}
          >
            <View style={styles.icon}>{tab.icon}</View>
            <Text style={[styles.label, { color: theme.textColor }]}>
              {t(tab.labelKey)}
            </Text>
          </TouchableOpacity>
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
    borderTopWidth: 1,
    height: 100,
    zIndex: 99,
  },
  tab: {
    transform: [{ skewY: "-3deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
    paddingTop: 6,
    height: 70,
    width: 70,
    zIndex: 99,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTab: {
    zIndex: 2,
  },
  label: {
    fontSize: 13,
    transform: [{ skewY: "3deg" }],
    marginTop: 4,
    alignSelf: "center",
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ scale: 1.5 }],
  },
});
