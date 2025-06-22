import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { t } from "../../i18n";

const accentColor = "#2563eb";
const accentColorLight = "#60a5fa";
const textColor = "#f0f9ff";

export default function ToSSection() {
  const navigation = useNavigation();

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

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  linkButton: {
    padding: 14,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 80,
    backgroundColor: accentColor,
    borderColor: accentColorLight,
    shadowColor: accentColorLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 8,
    elevation: 4,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "700",
    color: textColor,
    letterSpacing: 0.1,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
