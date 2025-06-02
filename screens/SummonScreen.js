// Datei: screens/SummonScreen.js
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useCrystals } from "../context/CrystalContext";
import { useThemeContext } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import availableCharacters from "../data/availableCharacters.json";
import summonData from "../data/summonData.json";
import ScreenLayout from "../components/ScreenLayout";
import { useSummon } from "../context/SummonContext";
import { t } from "../i18n";
import summonRates from "../data/summonRates.json"; // Neue Datei
import { Image } from "expo-image";

export default function SummonScreen() {
  const { crystals, spendCrystals } = useCrystals();
  const { theme } = useThemeContext();
  const navigation = useNavigation();
  const { addSummon, isSummoning, setIsSummoning } = useSummon();

  const [selectedRarity, setSelectedRarity] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const blacklistedIds = ["sylas"];

  const rarityOrder = {
    mythic: 1,
    legendary: 2,
    epic: 3,
    rare: 4,
    uncommon: 5,
    common: 6,
  };

  const calculateRarityRates = () => {
    return Object.entries(summonRates)
      .sort((a, b) => rarityOrder[a[0]] - rarityOrder[b[0]])
      .map(([rarity, rate]) => {
        const count = availableCharacters.filter(
          (c) => c.rarity === rarity && c.id !== "sylas"
        ).length;
        return { rarity, rate, count };
      });
  };

  const getCharactersByRarity = (rarity) =>
    availableCharacters.filter((c) => c.rarity === rarity && c.id !== "sylas");

  const handleSummon = useCallback(
    async (type) => {
      if (isSummoning) return;
      const entry = summonData.summons.find((s) => s.type === type);
      if (!entry) return;

      const { count } = entry;
      const cost = count === 1 ? 5 : 10;
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

        {/* Beschwörungs-Pool Übersicht */}
        <View style={styles.ratesContainer}>
          <Text style={[styles.rateTitle, { color: theme.textColor }]}>
            {t("summonPoolTitle", "Beschwörungs-Pool:")}
          </Text>
          {calculateRarityRates().map(({ rarity, count, rate }) => (
            <TouchableOpacity
              key={rarity}
              style={styles.rarityButton}
              onPress={() => {
                setSelectedRarity(rarity);
                setModalVisible(true);
              }}
            >
              <Text
                style={{
                  color: theme.textColor,
                  backgroundColor: theme.accentColor,
                }}
              >
                {`${t(`rarity.${rarity}`, rarity)}: ${count} (${rate}%)`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Beschwörungsoptionen */}
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
              {t(`summonLabels.${type}`)}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Modal für Charaktervorschau */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.accentColor },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>
                {t(`rarity.${selectedRarity}`, selectedRarity)}
              </Text>
              <ScrollView style={{ maxHeight: 400 }}>
                {getCharactersByRarity(selectedRarity).map((char) => (
                  <View key={char.id} style={styles.characterItem}>
                    <Image
                      source={`https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/characters/${char.avatar}`}
                      style={styles.characterImage}
                      contentFit="contain"
                      transition={300}
                    />

                    <Text style={{ color: theme.textColor }}>{char.name}</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[
                  styles.modalClose,
                  { backgroundColor: theme.accentColor },
                ]}
              >
                <Text style={{ color: theme.textColor }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
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
  buttonDisabled: { opacity: 0.5 },
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
  ratesContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  rateTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
  },
  rarityButton: {
    padding: 8,
    borderRadius: 6,
    marginVertical: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  characterItem: {
    alignItems: "center",
    marginBottom: 16,
  },
  characterImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 6,
  },
  modalClose: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});
