// Datei: components/OnlineGuard.js

import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useThemeContext } from "../context/ThemeContext";
import { t } from "../i18n"; // ← Übersetzungsfunktion importieren

export default function OnlineGuard({ children }) {
  const { theme } = useThemeContext();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Listener für Verbindungsänderungen
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected && !!state.isInternetReachable);
    });
    // Initiale Abfrage
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
      <View style={[styles.container, { backgroundColor: theme.accentColor }]}>
        <Text style={[styles.message, { color: theme.textColor }]}>
          {t("noInternetMessage")}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.accentColor }]}
          onPress={retryConnection}
        >
          <Text style={[styles.buttonText, { color: theme.textColor }]}>
            {t("retryButton")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
