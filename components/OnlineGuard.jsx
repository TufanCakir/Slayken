import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
import { Feather } from "@expo/vector-icons";

// Memoisiertes Overlay für Offline-Status
const OfflineOverlay = React.memo(function OfflineOverlay({
  fadeAnim,
  theme,
  onRetry,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const gradientColors = theme.linearGradient || [
    "#000000",
    "#000000",
    "#FF2D00",
    "#FF2D00",
  ];

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim, zIndex: 20 }]}
    >
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.centered}>
        <View style={styles.glassCard}>
          <BlurView
            intensity={18}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardContent}>
            <Feather
              name="wifi-off"
              size={46}
              color={theme.glowColor}
              style={{ marginBottom: 10 }}
              accessibilityLabel="Offline-Icon"
              accessibilityRole="image"
            />
            <Text style={styles.message}>
              {t("noInternetMessage") || "Keine Internetverbindung"}
            </Text>
            <TouchableOpacity
              style={styles.buttonOuter}
              onPress={onRetry}
              activeOpacity={0.89}
              accessibilityRole="button"
              accessibilityLabel={t("retryButton") || "Erneut versuchen"}
            >
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>
                  {t("retryButton") || "Erneut versuchen"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

const OnlineGuard = React.memo(function OnlineGuard({ children }) {
  const { theme } = useThemeContext();
  const [isConnected, setIsConnected] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // NetInfo-Check als useCallback, damit die Referenz stabil bleibt
  const checkConnection = useCallback(() => {
    NetInfo.fetch().then((state) => {
      setIsConnected(!!state.isConnected && !!state.isInternetReachable);
    });
  }, []);

  // Setup Listener bei Mount
  useEffect(() => {
    checkConnection();
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected && !!state.isInternetReachable);
    });
    return () => unsubscribe();
  }, [checkConnection]);

  // Animation bei Verbindungswechsel
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

  if (!isConnected) {
    return (
      <OfflineOverlay
        fadeAnim={fadeAnim}
        theme={theme}
        onRetry={checkConnection}
      />
    );
  }

  return <>{children}</>;
});

export default OnlineGuard;

// Styles – nur das Wesentliche, keine Shadows/Elevation/TextShadow!
function createStyles(theme) {
  return StyleSheet.create({
    centered: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
    },
    glassCard: {
      minWidth: 220,
      borderRadius: 20,
      overflow: "hidden",
      position: "relative",
      borderWidth: 1,
      borderColor: "#fff2",
      backgroundColor: "rgba(30,41,59,0.15)",
    },
    cardContent: {
      alignItems: "center",
      padding: 24,
      zIndex: 2,
    },
    message: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 16,
      letterSpacing: 0.1,
      fontWeight: "bold",
      color: theme.textColor,
    },
    buttonOuter: {
      borderRadius: 10,
      marginTop: 6,
      overflow: "hidden",
      minWidth: 110,
      alignSelf: "center",
    },
    button: {
      paddingVertical: 11,
      paddingHorizontal: 26,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      width: "100%",
    },
    buttonText: {
      fontSize: 15,
      letterSpacing: 0.2,
      textAlign: "center",
      color: theme.textColor,
      fontWeight: "bold",
    },
  });
}
