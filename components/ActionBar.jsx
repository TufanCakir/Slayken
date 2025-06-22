import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons, Feather, FontAwesome5, Entypo } from "@expo/vector-icons";

export default function ActionBar({ navigation, t }) {
  const iconColor = "#f0f9ff"; // fast weiß/bläulich
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

  return (
    <View style={styles.row}>
      {buttons.map(({ icon, screen, label }, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => navigation.navigate(screen)}
          activeOpacity={0.8}
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

const styles = StyleSheet.create({
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
    borderColor: "#2563eb",
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.17,
    shadowRadius: 7,
    elevation: 5,
  },
  inner: {
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    color: "#f0f9ff",
    fontWeight: "700",
    letterSpacing: 0.2,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
