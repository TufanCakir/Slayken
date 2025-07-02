import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useThemeContext } from "../context/ThemeContext";

export default function ThemeSwitcher() {
  const { uiThemeType, setUiThemeType, availableThemes, theme } =
    useThemeContext();
  const styles = createStyles(theme, uiThemeType);

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
        {availableThemes.map((key) => (
          <Pressable
            key={key}
            onPress={() => setUiThemeType(key)}
            style={[styles.button, uiThemeType === key && styles.buttonActive]}
          >
            <Text
              style={[
                styles.buttonText,
                uiThemeType === key && styles.buttonTextActive,
              ]}
            >
              {key.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(theme, activeKey) {
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
      color: theme.accentColor,
      fontWeight: "bold",
    },
    scrollRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 2,
    },
    button: {
      paddingVertical: 7,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginRight: 9,
      backgroundColor: theme.bgSecondary || "#222",
      borderWidth: 2,
      borderColor: theme.borderColor || "#444",
      opacity: 0.82,
    },
    buttonActive: {
      backgroundColor: theme.accentColor,
      borderColor: theme.accentColor,
      opacity: 1,
      shadowOpacity: 0.17,
      shadowColor: theme.accentColor,
    },
    buttonText: {
      fontWeight: "bold",
      color: theme.textColor + "cc",
      fontSize: 15,
      letterSpacing: 0.5,
    },
    buttonTextActive: {
      color: theme.bgColor || "#fff",
    },
  });
}
