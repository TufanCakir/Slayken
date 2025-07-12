import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useThemeContext } from "../context/ThemeContext";
import { t } from "../i18n";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function OnlineGuard({ children }) {
  const { theme } = useThemeContext();
  const [isConnected, setIsConnected] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (!isConnected) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, fadeAnim]);

  const styles = createStyles(theme);

  if (!isConnected) {
    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: fadeAnim, zIndex: 20 },
        ]}
      >
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.centered}>
          <Animated.View style={styles.card}>
            <Ionicons
              name="wifi-off"
              size={56}
              color={theme.glowColor}
              style={{ marginBottom: 13 }}
              accessibilityLabel="Offline-Icon"
              accessibilityRole="image"
            />
            <Text style={styles.message}>
              {t("noInternetMessage") || "Keine Internetverbindung"}
            </Text>
            <TouchableOpacity
              style={styles.buttonOuter}
              onPress={checkConnection}
              activeOpacity={0.89}
              accessibilityRole="button"
              accessibilityLabel={t("retryButton") || "Erneut versuchen"}
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
                <Text style={styles.buttonText}>
                  {t("retryButton") || "Erneut versuchen"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
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
      padding: 34,
      borderRadius: 24,
      alignItems: "center",
      minWidth: 270,
      elevation: 12,
      backgroundColor: theme.accentColor + "f4",
      shadowColor: theme.glowColor,
      shadowOpacity: 0.23,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 5 },
      borderWidth: 2.5,
      borderColor: theme.borderGlowColor,
    },
    message: {
      fontSize: 21,
      textAlign: "center",
      marginBottom: 22,
      letterSpacing: 0.17,
      fontWeight: "bold",
      color: theme.textColor,
      textShadowColor: theme.glowColor,
      textShadowRadius: 4,
      textShadowOffset: { width: 0, height: 2 },
    },
    buttonOuter: {
      borderRadius: 13,
      marginTop: 10,
      overflow: "hidden",
      minWidth: 170,
      alignSelf: "center",
      shadowColor: theme.glowColor,
      shadowRadius: 15,
      shadowOpacity: 0.32,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    button: {
      paddingVertical: 14,
      paddingHorizontal: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 13,
      width: "100%",
    },
    buttonText: {
      fontSize: 17,
      letterSpacing: 0.34,
      textAlign: "center",
      color: theme.textColor,
      fontWeight: "bold",
    },
  });
}
