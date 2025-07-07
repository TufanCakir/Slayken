import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons, Feather, FontAwesome5, Entypo } from "@expo/vector-icons";
import { useThemeContext } from "../context/ThemeContext";

export default function ActionBar({ navigation, t }) {
  const { theme } = useThemeContext();
  const iconColor = theme.textColor;

  const buttons = [
    {
      Icon: Ionicons,
      iconProps: { name: "gift-outline", size: 24, color: iconColor },
      screen: "GiftScreen",
      label: t("giftLabel"),
    },
    {
      Icon: Entypo,
      iconProps: { name: "news", size: 24, color: iconColor },
      screen: "NewsScreen",
      label: t("newsLabel"),
    },
    {
      Icon: FontAwesome5,
      iconProps: { name: "tasks", size: 24, color: iconColor },
      screen: "MissionScreen",
      label: t("missionsLabel"),
    },
    {
      Icon: Feather,
      iconProps: { name: "settings", size: 24, color: iconColor },
      screen: "SettingsScreen",
      label: t("settingsLabel"),
    },
  ];

  const styles = createStyles(theme);

  return (
    <View style={styles.row}>
      {buttons.map(({ Icon, iconProps, screen, label }, idx) => (
        <TouchableOpacity
          key={screen}
          style={styles.button}
          onPress={() => navigation.navigate(screen)}
          activeOpacity={0.85}
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

function createStyles(theme) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingBottom: 16,
      marginTop: 24,
      width: "100%",
    },
    button: {
      flex: 1,
      marginHorizontal: 6,
      height: 74,
      borderRadius: 16,
      backgroundColor: theme.accentColor,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2.5,
      borderColor: theme.borderGlowColor || theme.borderColor || "#facc15",
    },
    inner: {
      alignItems: "center",
    },
    label: {
      fontSize: 14,
      marginTop: 7,
      textAlign: "center",
      color: theme.textColor,
      letterSpacing: 0.4,
    },
  });
}
