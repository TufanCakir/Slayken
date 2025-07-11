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
import { LinearGradient } from "expo-linear-gradient";

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

export default function Footer({ gradientColors }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useThemeContext();
  const current = route.name;
  const styles = createStyles(theme);

  // Default-Gradient: Feuerfarben aus dem Theme, kann per Prop überschrieben werden
  const colors = gradientColors ||
    theme.linearGradient || [
      theme.accentColorSecondary,
      theme.accentColor,
      theme.accentColorDark,
    ];

  return (
    <View style={styles.footer}>
      {/* LinearGradient als unterster Layer */}
      <LinearGradient
        colors={colors}
        start={[0, 0]}
        end={[1, 0]}
        style={StyleSheet.absoluteFill}
      />
      {/* Die Tabs */}
      {TABS.map(({ key, screen, Icon, iconProps, labelKey }) => {
        const isActive = current === screen;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => navigation.navigate(screen)}
            activeOpacity={0.89}
            style={[
              styles.tab,
              isActive && styles.activeTab,
              isActive && {
                borderColor: theme.borderGlowColor,
                backgroundColor: theme.borderGlowColor + "22",
              },
            ]}
          >
            <View style={[styles.iconWrap, isActive && styles.iconActiveWrap]}>
              <Icon
                {...iconProps}
                size={27}
                color={
                  isActive
                    ? theme.borderGlowColor || theme.textColor
                    : theme.textColor + "99"
                }
                style={
                  isActive && {
                    textShadowColor: theme.glowColor,
                    textShadowRadius: 7,
                  }
                }
              />
            </View>
            <Text
              style={[
                styles.label,
                isActive && styles.activeLabel,
                isActive && {
                  color: theme.borderGlowColor,
                  textShadowColor: theme.glowColor,
                  textShadowRadius: 7,
                },
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
      paddingBottom: 8,
      height: 94,
      gap: 11,
      position: "relative", // Damit absoluteFill funktioniert!
      overflow: "hidden",
    },
    tab: {
      flex: 1,
      borderWidth: 2.5,
      borderColor: theme.borderColor,
      backgroundColor: "transparent", // WICHTIG: damit Gradient sichtbar!
      height: 80,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 17,
      position: "relative",
      overflow: "visible",
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 7,
      elevation: 3,
      zIndex: 2,
    },
    activeTab: {
      shadowColor: theme.glowColor,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.3,
      shadowRadius: 18,
      elevation: 9,
      borderWidth: 2.5,
      borderColor: theme.borderGlowColor,
      backgroundColor: theme.borderGlowColor + "22",
    },
    iconWrap: {
      alignItems: "center",
      justifyContent: "center",
      margin: 6,
      padding: 3,
      transform: [{ scale: 1.35 }],
    },
    iconActiveWrap: {
      borderRadius: 12,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.22,
      shadowRadius: 12,
      elevation: 5,
    },
    label: {
      fontSize: 13.5,
      marginTop: 3,
      textAlign: "center",
      color: theme.textColor,
      letterSpacing: 0.2,
      opacity: 0.79,
      fontWeight: "normal",
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    activeLabel: {
      opacity: 1,
      color: theme.borderGlowColor,
      textShadowColor: theme.glowColor,
      textShadowRadius: 7,
    },
  });
}
