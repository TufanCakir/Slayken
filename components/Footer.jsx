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
import { useThemeContext } from "../context/ThemeContext";

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();
  const current = route.name;
  const { theme } = useThemeContext();

  const tabs = [
    {
      key: "home",
      screen: "HomeScreen",
      icon: (isActive) => (
        <AntDesign
          name="home"
          size={24}
          color={isActive ? theme.textColor : "#bbb"}
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
          color={isActive ? theme.textColor : "#bbb"}
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
          color={isActive ? theme.textColor : "#bbb"}
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
          color={isActive ? theme.textColor : "#bbb"}
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
          color={isActive ? theme.textColor : "#bbb"}
        />
      ),
      labelKey: "exchangeLabel",
    },
  ];

  const styles = createStyles(theme, current);

  return (
    <View style={styles.footer}>
      {tabs.map((tab) => {
        const isActive = current === tab.screen;
        return (
          <View key={tab.key} style={styles.tabWrapper}>
            <TouchableOpacity
              onPress={() => navigation.navigate(tab.screen)}
              activeOpacity={0.85}
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

function createStyles(theme) {
  return StyleSheet.create({
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingBottom: 10,
      height: 100,
      zIndex: 99,
      gap: 10,
      backgroundColor: theme.accentColor,
      borderTopWidth: 2,
      borderTopColor: theme.borderColor,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
    },
    tabWrapper: {
      flex: 1,
    },
    tab: {
      borderWidth: 2,
      borderColor: theme.borderColor,
      backgroundColor: theme.accentColor,
      paddingTop: 6,
      height: 70,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 13,
      marginHorizontal: 3,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 7,
      elevation: 2,
      zIndex: 99,
    },
    activeTab: {
      backgroundColor: theme.accentColor,
      borderColor: theme.textColor,
      shadowColor: theme.shadowColor,
    },
    label: {
      fontSize: 13,
      marginTop: 4,
      textAlign: "center",
      color: theme.textColor,
      letterSpacing: 0.2,
    },
    activeLabel: {
      color: theme.textColor,
    },
    icon: {
      alignItems: "center",
      justifyContent: "center",
      transform: [{ scale: 1.5 }],
    },
  });
}
