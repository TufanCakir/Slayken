import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useThemeContext } from "../context/ThemeContext";
import { t } from "../i18n";
import { BlurView } from "expo-blur";

export default function OnlineGuard({ children }) {
  const { theme } = useThemeContext();
  const [isConnected, setIsConnected] = useState(true);

  // Internet-Check
  const checkConnection = useCallback(() => {
    NetInfo.fetch().then((state) => {
      setIsConnected(!!state.isConnected && !!state.isInternetReachable);
    });
  }, []);

  useEffect(() => {
    checkConnection();
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected && !!state.isInternetReachable);
    });
    return () => unsubscribe();
  }, [checkConnection]);

  if (!isConnected) {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.centered}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.accentColor + "ee",
                shadowColor: theme.shadowColor,
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
                  backgroundColor: theme.textColor + "22",
                  borderColor: theme.borderGlowColor || "#fff3",
                },
              ]}
              onPress={checkConnection}
              activeOpacity={0.85}
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: 28,
    borderRadius: 22,
    alignItems: "center",
    minWidth: 260,
    elevation: 8,
    shadowOpacity: 0.11,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  message: {
    fontSize: 19,
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: 0.1,
    fontWeight: "600",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1.5,
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    textAlign: "center",
    fontWeight: "bold",
  },
});
