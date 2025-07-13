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

export default function Footer({ gradientColors }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useThemeContext();
  const current = route.name;
  const styles = createStyles(theme);

  // Gradient aus Theme oder Prop
  const colors = gradientColors ||
    theme.linearGradient || [
      theme.accentColorSecondary,
      theme.accentColor,
      theme.accentColorDark,
    ];

  return (
    <View style={styles.footer}>
      {/* Glassmorphism: Blur + Gradient */}
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
      {/* Tab-Buttons */}
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
                    textShadowRadius: 8,
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
      {/* Soft-Glow-Shadow oben */}
      <View style={styles.barShadow} pointerEvents="none" />
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
      position: "relative",
      overflow: "visible",
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: "transparent",
      borderWidth: 1.1,
      borderColor: "#fff2",
      shadowColor: theme.glowColor,
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.13,
      shadowRadius: 22,
      elevation: 7,
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
      backgroundColor: theme.accentColor + "1A", // Glasiger Button
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.09,
      shadowRadius: 6,
      elevation: 2,
    },
    activeTab: {
      shadowColor: theme.glowColor,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.33,
      shadowRadius: 17,
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
      transform: [{ scale: 1.32 }],
    },
    iconActiveWrap: {
      borderRadius: 13,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.22,
      shadowRadius: 14,
      elevation: 5,
    },
    label: {
      fontSize: 13,
      marginTop: 3,
      textAlign: "center",
      color: theme.textColor,
      letterSpacing: 0.2,
      opacity: 0.82,
      fontWeight: "normal",
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    activeLabel: {
      opacity: 1,
      color: theme.borderGlowColor,
      textShadowColor: theme.glowColor,
      textShadowRadius: 8,
    },
    barShadow: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 11,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      backgroundColor: theme.shadowColor + "17",
      shadowColor: theme.glowColor,
      shadowOffset: { width: 0, height: -7 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      zIndex: 1,
      elevation: 2,
    },
  });
}
