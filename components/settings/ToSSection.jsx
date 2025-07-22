import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { t } from "../../i18n";
import { useThemeContext } from "../../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

function ToSSectionComponent() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();

  // Memoisiert: Styles & Gradient, damit kein Re-Render bei jedem Tipper!
  const styles = useMemo(() => createStyles(theme), [theme]);
  const gradientColors = useMemo(
    () =>
      theme.linearGradient || [
        theme.accentColorSecondary,
        theme.accentColor,
        theme.accentColorDark,
      ],
    [theme]
  );

  const handlePress = () => {
    navigation.navigate("ToSScreen");
  };

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        onPress={handlePress}
        style={({ pressed }) => [
          styles.linkButton,
          pressed && { opacity: 0.85 },
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.linkText}>{t("termsOfService")}</Text>
      </Pressable>
    </View>
  );
}

export default React.memo(ToSSectionComponent);

// ---- Styles Factory ----
function createStyles(theme) {
  return StyleSheet.create({
    section: {
      marginBottom: 30,
      alignItems: "center",
    },
    linkButton: {
      paddingVertical: 14,
      paddingHorizontal: 38,
      borderRadius: 11,
      alignItems: "center",
      marginTop: 48,
      borderWidth: 2,
      borderColor: theme.textColor + "33",
      overflow: "hidden",
      position: "relative",
    },
    linkText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.textColor,
      letterSpacing: 0.2,
      zIndex: 1,
    },
  });
}
