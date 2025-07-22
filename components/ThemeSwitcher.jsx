import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeContext } from "../context/ThemeContext";

const ThemeSwitcher = React.memo(function ThemeSwitcher() {
  const { uiThemeType, setUiThemeType, availableThemes, theme } =
    useThemeContext();

  // Styles und Gradient nur neu, wenn Theme sich ändert
  const styles = useMemo(() => createStyles(theme), [theme]);
  const gradient = useMemo(
    () => theme.linearGradient || ["#000000", "#000000", "#FF2D00", "#FF2D00"],
    [theme]
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        Aktuelles Theme: <Text style={styles.activeTheme}>{uiThemeType}</Text>
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {availableThemes.map((key) => {
          const isActive = uiThemeType === key;
          return (
            <Pressable
              key={key}
              onPress={() => setUiThemeType(key)}
              style={[styles.buttonWrap, isActive && styles.buttonWrapActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <LinearGradient
                colors={gradient}
                start={{ x: 0.08, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text
                  style={[
                    styles.buttonText,
                    isActive && styles.buttonTextActive,
                  ]}
                >
                  {key.toUpperCase()}
                </Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

export default ThemeSwitcher;

function createStyles(theme) {
  return StyleSheet.create({
    wrapper: {
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    label: {
      fontSize: 15,
      marginBottom: 8,
      color: theme.textColor,
      fontWeight: "bold",
    },
    activeTheme: {
      color: theme.accentColorDark || theme.accentColor,
      fontWeight: "bold",
    },
    scrollRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 2,
    },
    buttonWrap: {
      marginRight: 10,
      borderRadius: 12,
      overflow: "hidden",
      minWidth: 70,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    buttonWrapActive: {
      borderColor: theme.glowColor || theme.borderGlowColor,
    },
    button: {
      paddingVertical: 9,
      paddingHorizontal: 22,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      minWidth: 70,
    },
    buttonText: {
      fontWeight: "bold",
      color: theme.textColor,
      fontSize: 15,
      letterSpacing: 0.5,
      textAlign: "center",
    },
    buttonTextActive: {
      color: theme.bgColor || "#fff",
    },
  });
}
