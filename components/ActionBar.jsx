import React, { useMemo, useCallback } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons, Feather, FontAwesome5, Entypo } from "@expo/vector-icons";
import { useThemeContext } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

// Buttons als konstantes Array (unverändert)
const BUTTONS = [
  {
    Icon: Ionicons,
    iconProps: { name: "gift-outline", size: 24 },
    screen: "GiftScreen",
    labelKey: "giftLabel",
  },
  {
    Icon: Entypo,
    iconProps: { name: "news", size: 24 },
    screen: "NewsScreen",
    labelKey: "newsLabel",
  },
  {
    Icon: FontAwesome5,
    iconProps: { name: "tasks", size: 24 },
    screen: "MissionScreen",
    labelKey: "missionsLabel",
  },
  {
    Icon: Feather,
    iconProps: { name: "settings", size: 24 },
    screen: "SettingsScreen",
    labelKey: "settingsLabel",
  },
];

function ActionBar({ navigation, t, gradientColors }) {
  const { theme } = useThemeContext();

  // Styles & Gradient nur neu wenn Theme/Colors sich ändern
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

  const buttons = useMemo(
    () =>
      BUTTONS.map((btn) => ({
        ...btn,
        label: t(btn.labelKey),
        iconProps: {
          ...btn.iconProps,
          color: theme.textColor,
        },
      })),
    [t, theme.textColor]
  );

  const handlePress = useCallback(
    (screen) => {
      navigation.navigate(screen);
    },
    [navigation]
  );

  return (
    <View style={styles.row}>
      {/* Glass-Effekt Layer */}
      <BlurView
        intensity={28}
        tint={theme.mode === "dark" ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={colors}
        start={[0, 0]}
        end={[1, 0]}
        style={[StyleSheet.absoluteFill, { opacity: 0.78 }]}
      />
      {buttons.map(({ Icon, iconProps, screen, label }) => (
        <TouchableOpacity
          key={screen}
          style={styles.button}
          onPress={() => handlePress(screen)}
          activeOpacity={0.88}
        >
          <View style={styles.inner}>
            <Icon {...iconProps} />
            <Text style={styles.label}>{label}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Styles ohne Shadow/Elevation/TextShadow
function createStyles(theme) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingBottom: 16,
      marginTop: 24,
      width: "100%",
      position: "relative",
      overflow: "hidden",
      minHeight: 74,
      bottom: 15,
      borderRadius: 26,
      borderWidth: 1.5,
      borderColor: theme.borderGlowColor + "55",
      backgroundColor: theme.accentColor + "33",
      // Kein shadow, kein elevation!
    },
    button: {
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
      top: 7,
    },
    inner: {
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: 12,
      marginTop: 7,
      textAlign: "center",
      color: theme.textColor,
      letterSpacing: 0.4,
      fontWeight: "600",
      // Kein textShadow!
    },
  });
}

// React.memo für volle Optimierung!
export default React.memo(ActionBar);
