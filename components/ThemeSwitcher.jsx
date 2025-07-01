import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useThemeContext } from "../context/ThemeContext";

export default function ThemeSwitcher() {
  const { uiThemeType, setUiThemeType, availableThemes, theme } =
    useThemeContext();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.textColor }]}>
        Aktuelles Theme: {uiThemeType}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {availableThemes.map((key) => (
          <Pressable
            key={key}
            onPress={() => setUiThemeType(key)}
            style={[
              styles.button,
              {
                backgroundColor:
                  uiThemeType === key ? theme.accentColor : "#333",
                borderColor: uiThemeType === key ? theme.borderColor : "#555",
              },
            ]}
          >
            <Text
              style={{
                color: uiThemeType === key ? theme.textColor : "#ccc",
                fontWeight: "bold",
              }}
            >
              {key.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
  },
});
