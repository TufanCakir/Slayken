// Datei: screens/SummonScreen.js
import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useCrystals } from "../context/CrystalContext";
import { useThemeContext } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import availableCharacters from "../data/availableCharacters.json";
import summonData from "../data/summonData.json";
import ScreenLayout from "../components/ScreenLayout";
import { useSummon } from "../context/SummonContext";
import { t } from "../i18n"; // ← Übersetzungsfunktion importieren

export default function SummonScreen() {
  const { crystals, spendCrystals } = useCrystals();
  const { theme } = useThemeContext();
  const navigation = useNavigation();
  const { addSummon, isSummoning, setIsSummoning } = useSummon();

  const blacklistedIds = ["sylas"];

  const handleSummon = useCallback(
    async (type) => {
      if (isSummoning) return;
      const entry = summonData.summons.find((s) => s.type === type);
      if (!entry) return;

      const { count } = entry;
      const cost = count === 1 ? 5 : 10;
      // Übersetze den reinen Type zu seinem Label
      const labelText = t(`summonLabels.${type}`);

      if (crystals < cost) {
        Alert.alert(
          t("notEnoughCrystalsTitle"),
          t("notEnoughCrystalsMessage", { count })
        );
        return;
      }

      Alert.alert(
        t("confirmTitle"),
        t("confirmMessage", { label: labelText, cost }),
        [
          { text: t("cancel"), style: "cancel" },
          {
            text: t("yes"),
            onPress: async () => {
              try {
                setIsSummoning(true);
                spendCrystals(cost);

                const results = Array.from({ length: count }, () => {
                  let character;
                  do {
                    const idx = Math.floor(
                      Math.random() * availableCharacters.length
                    );
                    character = availableCharacters[idx];
                  } while (blacklistedIds.includes(character.id));
                  return character;
                });

                for (const char of results) {
                  await addSummon(char);
                }

                navigation.navigate("SummonResultScreen", { results });
              } catch (error) {
                console.error("Fehler beim Summon-Vorgang:", error);
                Alert.alert(t("errorTitle"), t("errorMessage"));
              } finally {
                setIsSummoning(false);
              }
            },
          },
        ]
      );
    },
    [
      crystals,
      spendCrystals,
      addSummon,
      isSummoning,
      navigation,
      setIsSummoning,
    ]
  );

  return (
    <ScreenLayout style={styles.wrapper}>
      <View style={styles.container}>
        {isSummoning && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.accentColor} />
          </View>
        )}

        {summonData.summons.map(({ type }) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.button,
              { backgroundColor: theme.accentColor },
              isSummoning && styles.buttonDisabled,
            ]}
            activeOpacity={0.7}
            onPress={() => handleSummon(type)}
            disabled={isSummoning}
          >
            <Text style={[styles.buttonText, { color: theme.textColor }]}>
              {t(`summonLabels.${type}`)} {/* Dynamisch übersetztes Label */}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});
