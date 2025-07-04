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
        onPress={() => navigation.navigate("ToSScreen")}
        style={({ pressed }) => [
          styles.linkButton,
          { opacity: pressed ? 0.85 : 1 },
        ]}
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
      alignItems: "center",
    },
    linkButton: {
      paddingVertical: 14,
      paddingHorizontal: 38,
      borderRadius: 11,
      alignItems: "center",
      backgroundColor: theme.accentColor,
      borderWidth: 2,
      borderColor: theme.textColor + "33",
      marginTop: 48, // weniger wuchtig als 80, besser für Settings-Listen
    },
    linkText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.textColor,
      letterSpacing: 0.2,
    },
  });
