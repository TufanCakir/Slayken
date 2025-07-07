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

const TABS = [
  {
    key: "home",
    screen: "HomeScreen",
    Icon: AntDesign,
    iconProps: { name: "home" },
    labelKey: "homeLabel",
  },
  {
    key: "overview",
    screen: "CharacterOverviewScreen",
    Icon: FontAwesome6,
    iconProps: { name: "people-roof" },
    labelKey: "overviewLabel",
  },
  {
    key: "create",
    screen: "CreateCharacterScreen",
    Icon: Ionicons,
    iconProps: { name: "people-circle-outline" },
    labelKey: "createLabel",
  },
  {
    key: "shop",
    screen: "ShopScreen",
    Icon: Feather,
    iconProps: { name: "shopping-bag" },
    labelKey: "shopLabel",
  },
  {
    key: "exchange",
    screen: "ExchangeScreen",
    Icon: FontAwesome,
    iconProps: { name: "exchange" },
    labelKey: "exchangeLabel",
  },
];

export default function Footer() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useThemeContext();
  const current = route.name;
  const styles = createStyles(theme);

  return (
    <View style={styles.footer}>
      {TABS.map(({ key, screen, Icon, iconProps, labelKey }) => {
        const isActive = current === screen;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => navigation.navigate(screen)}
            activeOpacity={0.87}
            style={[
              styles.tab,
              isActive && styles.activeTab,
              isActive && { borderColor: theme.borderGlowColor },
            ]}
          >
            <View style={styles.icon}>
              <Icon
                {...iconProps}
                size={24}
                color={isActive ? theme.textColor : "#bdbdbd"}
              />
            </View>
            <Text
              style={[
                styles.label,
                isActive && styles.activeLabel,
                isActive && { color: theme.textColor },
              ]}
            >
              {t(labelKey)}
            </Text>
          </TouchableOpacity>
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
      borderColor: theme.borderColor,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.13,
      shadowRadius: 8,
      elevation: 16,
    },
    tab: {
      flex: 1,
      borderWidth: 2.5,
      borderColor: theme.borderColor,
      backgroundColor: theme.accentColor,
      paddingTop: 6,
      height: 70,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 15,
      marginHorizontal: 4,
      marginVertical: 3,
    },
    activeTab: {
      shadowColor: theme.glowColor,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.38,
      shadowRadius: 11,
      elevation: 7,
    },
    label: {
      fontSize: 13,
      marginTop: 4,
      textAlign: "center",
      color: theme.textColor,
      letterSpacing: 0.2,
      opacity: 0.83,
      fontWeight: "normal",
    },
    activeLabel: {
      fontWeight: "bold",
      opacity: 1,
    },
    icon: {
      alignItems: "center",
      justifyContent: "center",
      margin: 5,
      transform: [{ scale: 1.45 }],
    },
  });
}
