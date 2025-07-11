import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeContext } from "../context/ThemeContext";

export default function ThemeSwitcher() {
  const { uiThemeType, setUiThemeType, availableThemes, theme } =
    useThemeContext();
  const styles = createStyles(theme);
  const gradient = theme.linearGradient || [
    "#000000",
    "#000000",
    "#FF2D00",
    "#FF2D00",
  ];

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
            >
              {/* Gradient Hintergrund */}
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
}

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
      shadowColor: theme.shadowColor,
      shadowOpacity: 0.1,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 2 },
      minWidth: 70,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: theme.borderColor,
      opacity: 0.82,
    },
    buttonWrapActive: {
      borderColor: theme.glowColor || theme.borderGlowColor,
      opacity: 1,
      shadowColor: theme.glowColor || theme.accentColorDark,
      shadowOpacity: 0.22,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
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
      color: theme.textColor + "cc",
      fontSize: 15,
      letterSpacing: 0.5,
      textAlign: "center",
    },
    buttonTextActive: {
      color: theme.bgColor || "#fff",
      textShadowColor: theme.borderGlowColor,
      textShadowRadius: 5,
      textShadowOffset: { width: 0, height: 1 },
    },
  });
}
