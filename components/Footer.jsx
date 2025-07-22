import React, { useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
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
import { BlurView } from "expo-blur";

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

// --- Footer (mit React.memo) ---
function Footer({ gradientColors }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useThemeContext();
  const current = route.name;

  // Styles und Farben memoisiert
  const styles = useMemo(() => createStyles(theme), [theme]);
  const colors = useMemo(
    () =>
      gradientColors ||
      theme.linearGradient || [
        theme.accentColorSecondary,
        theme.accentColor,
        theme.accentColorDark,
      ],
    [gradientColors, theme]
  );

  // Memoisiere Labels & Iconfarben (Sinnvoll für viele Locale-Switches)
  const tabItems = useMemo(
    () =>
      TABS.map((tab) => ({
        ...tab,
        label: t(tab.labelKey),
        iconColor:
          current === tab.screen
            ? theme.borderGlowColor || theme.textColor
            : theme.textColor + "99",
        isActive: current === tab.screen,
      })),
    [current, theme, t]
  );

  return (
    <View style={styles.footer}>
      <BlurView
        intensity={Platform.OS === "ios" ? 38 : 22}
        tint={theme.mode === "dark" ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={colors}
        start={[0, 0]}
        end={[1, 0]}
        style={[StyleSheet.absoluteFill, { opacity: 0.82 }]}
      />
      {tabItems.map(
        ({ key, screen, Icon, iconProps, label, iconColor, isActive }) => (
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
            <View style={styles.iconWrap}>
              <Icon
                {...iconProps}
                size={27}
                color={iconColor}
                // Kein textShadow!
              />
            </View>
            <Text
              style={[
                styles.label,
                isActive && styles.activeLabel,
                isActive && { color: theme.borderGlowColor },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

// --- Styles ohne Shadows/Elevation/TextShadows ---
function createStyles(theme) {
  return StyleSheet.create({
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingBottom: 10,
      height: 100,
      gap: 11,
      position: "relative",
      overflow: "visible",
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: "transparent",
      borderWidth: 1.1,
      borderColor: "#fff2",
    },
    tab: {
      flex: 1,
      marginHorizontal: 6,
      height: 74,
      borderRadius: 17,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.7,
      borderColor: theme.borderGlowColor + "36",
      backgroundColor: theme.accentColor + "1A",
      // Kein shadow, kein elevation!
    },
    activeTab: {
      borderWidth: 2.5,
      borderColor: theme.borderGlowColor,
      backgroundColor: theme.borderGlowColor + "22",
    },
    iconWrap: {
      alignItems: "center",
      justifyContent: "center",
      margin: 6,
      padding: 3,
      transform: [{ scale: 1.32 }],
    },
    label: {
      fontSize: 13,
      marginTop: 3,
      textAlign: "center",
      color: theme.textColor,
      letterSpacing: 0.2,
      opacity: 0.82,
      fontWeight: "normal",
      // Kein textShadow!
    },
    activeLabel: {
      opacity: 1,
      color: theme.borderGlowColor,
    },
  });
}

// --- Exportiert als React.memo ---
export default React.memo(Footer);
