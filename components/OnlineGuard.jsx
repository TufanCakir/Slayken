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
          <View style={[styles.card]}>
            <Text style={[styles.message, { color: theme.textColor }]}>
              {t("noInternetMessage")}
            </Text>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: theme.accentColor,
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
  },
  card: {
    padding: 28,
    borderRadius: 22,
    alignItems: "center",
    minWidth: 260,
  },
  message: {
    fontSize: 19,
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: 0.1,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 6,
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    textAlign: "center",
  },
});
