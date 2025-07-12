import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
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
import { useRef } from "react";

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
    screen: "CharacterSelectScreen",
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

  // Farben für Gradient
  const colors = gradientColors ||
    theme.linearGradient || [
      theme.accentColorSecondary,
      theme.accentColor,
      theme.accentColorDark,
    ];

  // Animation für aktives Tab (Scale)
  const activeScale = useRef(new Animated.Value(1)).current;

  // Bei Tab-Wechsel kurzes Pop-Scale (nur Demo, kann auch pro Tab)
  const animateTab = () => {
    Animated.sequence([
      Animated.timing(activeScale, {
        toValue: 1.18,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(activeScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.footer}>
      <LinearGradient
        colors={colors}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.gradientBg}
      />
      <View style={styles.innerRow}>
        {TABS.map(({ key, screen, Icon, iconProps, labelKey }) => {
          const isActive = current === screen;
          const Wrapper = isActive ? Animated.View : View;

          return (
            <Wrapper
              key={key}
              style={[
                styles.tabWrap,
                isActive && { transform: [{ scale: activeScale }] },
              ]}
            >
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t(labelKey)}
                key={key}
                onPress={() => {
                  if (!isActive) animateTab();
                  navigation.navigate(screen);
                }}
                activeOpacity={0.91}
                style={[
                  styles.tab,
                  isActive && styles.activeTab,
                  isActive && {
                    borderColor: theme.borderGlowColor,
                    backgroundColor: theme.borderGlowColor + "22",
                  },
                ]}
              >
                <View
                  style={[styles.iconWrap, isActive && styles.iconActiveWrap]}
                >
                  <Icon
                    {...iconProps}
                    size={26}
                    color={
                      isActive
                        ? theme.borderGlowColor || theme.textColor
                        : theme.textColor + "B0"
                    }
                    style={
                      isActive
                        ? {
                            textShadowColor: theme.glowColor,
                            textShadowRadius: 8,
                            shadowOpacity: 0.5,
                          }
                        : undefined
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
                      textShadowRadius: 6,
                    },
                  ]}
                >
                  {t(labelKey)}
                </Text>
              </TouchableOpacity>
            </Wrapper>
          );
        })}
      </View>
      <View style={styles.barShadow} pointerEvents="none" />
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    footer: {
      position: "relative",
      height: 90,
      width: "100%",
      justifyContent: "flex-end",
      backgroundColor: "transparent",
      overflow: "visible",
      zIndex: 10,
    },
    gradientBg: {
      ...StyleSheet.absoluteFillObject,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      opacity: 0.98,
    },
    barShadow: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 10,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: theme.shadowColor + "2A",
      shadowColor: theme.glowColor,
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.22,
      shadowRadius: 20,
      zIndex: 1,
      elevation: 2,
    },
    innerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 10,
      paddingHorizontal: 14,
      paddingBottom: 6,
      height: 90,
      width: "100%",
      zIndex: 2,
    },
    tabWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    tab: {
      flex: 1,
      minWidth: 48,
      maxWidth: 88,
      height: 74,
      marginHorizontal: 3,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 18,
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: theme.borderColor + "40",
      overflow: "visible",
      marginBottom: 0,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 2,
      zIndex: 3,
    },
    activeTab: {
      borderColor: theme.borderGlowColor,
      backgroundColor: theme.borderGlowColor + "18",
      shadowColor: theme.glowColor,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.22,
      shadowRadius: 18,
      elevation: 8,
    },
    iconWrap: {
      alignItems: "center",
      justifyContent: "center",
      margin: 6,
      padding: 4,
      marginBottom: 2,
    },
    iconActiveWrap: {
      borderRadius: 13,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.17,
      shadowRadius: 13,
      elevation: 4,
    },
    label: {
      fontSize: 13.5,
      marginTop: 1,
      textAlign: "center",
      color: theme.textColor,
      letterSpacing: 0.18,
      opacity: 0.8,
      fontWeight: "400",
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      paddingBottom: 3,
    },
    activeLabel: {
      opacity: 1,
      color: theme.borderGlowColor,
      fontWeight: "bold",
      textShadowColor: theme.glowColor,
      textShadowRadius: 8,
      fontSize: 14.5,
    },
  });
}
