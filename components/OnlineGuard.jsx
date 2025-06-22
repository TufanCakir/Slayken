import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useThemeContext } from "../context/ThemeContext";
import { t } from "../i18n";
import { BlurView } from "expo-blur";

export default function OnlineGuard({ children }) {
  const { theme } = useThemeContext();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected && !!state.isInternetReachable);
    });
    NetInfo.fetch().then((state) => {
      setIsConnected(!!state.isConnected && !!state.isInternetReachable);
    });
    return unsubscribe;
  }, []);

  const retryConnection = () => {
    NetInfo.fetch().then((state) => {
      setIsConnected(!!state.isConnected && !!state.isInternetReachable);
    });
  };

  if (!isConnected) {
    return (
      <View style={StyleSheet.absoluteFill}>
        <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.centered}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: "rgba(37, 99, 235, 0.18)", // blue glassy
                borderColor: theme.accentColor,
                shadowColor: theme.accentColor,
              },
            ]}
          >
            <Text style={[styles.message, { color: theme.textColor }]}>
              {t("noInternetMessage")}
            </Text>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: theme.accentColor + "EE",
                  borderColor: theme.shadowColor,
                  shadowColor: theme.accentColor,
                },
              ]}
              onPress={retryConnection}
            >
              <Text style={[styles.buttonText, { color: theme.textColor }]}>
                {t("retryButton")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  card: {
    padding: 28,
    borderRadius: 22,
    alignItems: "center",
    borderWidth: 1.5,
    minWidth: 260,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  message: {
    fontSize: 19,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: 0.1,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.3,
    textAlign: "center",
  },
});
