import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons, Feather, FontAwesome5, Entypo } from "@expo/vector-icons";
import { useThemeContext } from "../context/ThemeContext";

export default function ActionBar({ navigation, t }) {
  const { theme } = useThemeContext();
  const iconColor = theme.textColor;

  const buttons = [
    {
      icon: <Ionicons name="gift-outline" size={24} color={iconColor} />,
      screen: "GiftScreen",
      label: t("giftLabel"),
    },
    {
      icon: <Entypo name="news" size={24} color={iconColor} />,
      screen: "NewsScreen",
      label: t("newsLabel"),
    },
    {
      icon: <FontAwesome5 name="tasks" size={24} color={iconColor} />,
      screen: "MissionScreen",
      label: t("missionsLabel"),
    },
    {
      icon: <Feather name="settings" size={24} color={iconColor} />,
      screen: "SettingsScreen",
      label: t("settingsLabel"),
    },
  ];

  const styles = createStyles(theme);

  return (
    <View style={styles.row}>
      {buttons.map(({ icon, screen, label }, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => navigation.navigate(screen)}
          activeOpacity={0.85}
        >
          <View style={styles.inner}>
            {icon}
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
      marginHorizontal: 4,
      height: 70,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: theme.borderColor,
      backgroundColor: theme.accentColor,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 7,
      elevation: 4,
    },
    inner: {
      alignItems: "center",
    },
    label: {
      fontSize: 13,
      marginTop: 6,
      textAlign: "center",
      color: theme.textColor,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
  });
}
