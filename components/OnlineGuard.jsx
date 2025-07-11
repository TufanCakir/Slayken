import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useThemeContext } from "../context/ThemeContext";
import { t } from "../i18n";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

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

  const styles = createStyles(theme);

  if (!isConnected) {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.centered}>
          <View style={styles.card}>
            <Text style={styles.message}>{t("noInternetMessage")}</Text>
            <TouchableOpacity
              style={styles.buttonOuter}
              onPress={checkConnection}
              activeOpacity={0.89}
            >
              <LinearGradient
                colors={
                  theme.linearGradient || [
                    "#000000",
                    "#000000",
                    "#FF2D00",
                    "#FF2D00",
                  ]
                }
                start={{ x: 0.1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{t("retryButton")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

function createStyles(theme) {
  return StyleSheet.create({
    centered: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      padding: 30,
      borderRadius: 22,
      alignItems: "center",
      minWidth: 265,
      elevation: 10,
      backgroundColor: theme.accentColor + "f7",
      shadowColor: theme.accentColorDark,
      shadowOpacity: 0.16,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 3 },
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
    },
    message: {
      fontSize: 20,
      textAlign: "center",
      marginBottom: 19,
      letterSpacing: 0.14,
      fontWeight: "700",
      color: theme.textColor,
      textShadowColor: theme.accentColorDark,
      textShadowRadius: 3,
      textShadowOffset: { width: 0, height: 1 },
    },
    buttonOuter: {
      borderRadius: 13,
      marginTop: 14,
      overflow: "hidden",
      minWidth: 180,
      alignSelf: "center",
      shadowColor: theme.accentColorDark,
      shadowRadius: 13,
      shadowOpacity: 0.29,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    button: {
      paddingVertical: 13,
      paddingHorizontal: 35,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 13,
      width: "100%",
    },
    buttonText: {
      fontSize: 16,
      letterSpacing: 0.35,
      textAlign: "center",
      color: theme.textColor,
    },
  });
}
