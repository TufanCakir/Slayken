import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { t } from "../../i18n";
import { useThemeContext } from "../../context/ThemeContext";

export default function ToSSection() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.linkButton,
          { opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => navigation.navigate("ToSScreen")}
      >
        <Text style={styles.linkText}>{t("termsOfService")}</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    section: {
      marginBottom: 30,
    },
    linkButton: {
      padding: 14,
      borderWidth: 2,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 80,
      backgroundColor: theme.accentColor,
      borderColor: theme.borderColor,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.11,
      shadowRadius: 8,
      elevation: 4,
    },
    linkText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.textColor,
      letterSpacing: 0.1,
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });
