import { useEffect, useState } from "react";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { equipmentPool } from "../data/equipmentPool";
import { useClass } from "../context/ClassContext";
import { useThemeContext } from "../context/ThemeContext";
import { Image } from "expo-image";
import { getEquipmentImageUrl } from "../utils/equipment/equipment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenLayout from "../components/ScreenLayout";

export default function CharacterEquipmentScreen() {
  const { classList, equipItem } = useClass();
  const { theme } = useThemeContext();

  const [selectedCharacterId, setSelectedCharacterId] = useState(
    classList[0]?.id
  );
  const selectedChar = classList.find((c) => c.id === selectedCharacterId);

  const unlockedItemIds = useUnlockedEquipment();

  const filteredEquipmentPool = equipmentPool.filter((item) =>
    unlockedItemIds.includes(item.id)
  );

  function useUnlockedEquipment() {
    const [unlockedItemIds, setUnlockedItemIds] = useState([]);
    useEffect(() => {
      const loadUnlocked = async () => {
        const keys = await AsyncStorage.getAllKeys();
        const unlocked = keys
          .filter((k) => k.startsWith("unlocked_item_"))
          .map((k) => k.replace("unlocked_item_", ""));
        setUnlockedItemIds(unlocked);
      };
      loadUnlocked();
    }, []);
    return unlockedItemIds;
  }

  const handleEquip = (equipment, slot) => {
    equipItem(selectedChar.id, slot, equipment.id);
  };
  const handleRemove = (slot) => {
    equipItem(selectedChar.id, slot, null);
  };

  const getEquipped = (slot) =>
    equipmentPool.find((eq) => eq.id === selectedChar?.equipment?.[slot]);

  // Stat-Berechnung mit Equipment-Boni
  const baseStats = selectedChar?.stats ?? {};
  let bonusStats = { ...baseStats };
  let percentBonuses = { attack: 0, expGain: 0 };

  ["weapon"].forEach((slot) => {
    const item = getEquipped(slot);
    if (item) {
      item.bonuses.forEach((bonus) => {
        if (bonus.type === "flat") {
          bonusStats[bonus.stat] = (bonusStats[bonus.stat] || 0) + bonus.value;
        } else if (bonus.type === "percent") {
          percentBonuses[bonus.stat] =
            (percentBonuses[bonus.stat] || 0) + bonus.value;
        }
      });
    }
  });

  if (!selectedChar) {
    return (
      <View style={[styles.container, { backgroundColor: theme.accentColor }]}>
        <Text style={{ color: theme.textColor }}>Kein Charakter gefunden.</Text>
      </View>
    );
  }

  return (
    <ScreenLayout>
      <ImageBackground
        source={theme.bgImage}
        style={[styles.container, { backgroundColor: theme.accentColor }]}
      >
        {/* Charakterauswahl */}
        <View style={styles.charRow}>
          {classList.map((char) => (
            <TouchableOpacity
              key={char.id}
              style={[
                styles.charButton,
                {
                  borderColor:
                    char.id === selectedChar.id
                      ? theme.borderColor
                      : "transparent",
                  backgroundColor:
                    char.id === selectedChar.id
                      ? theme.shadowColor
                      : theme.accentColor,
                },
              ]}
              onPress={() => setSelectedCharacterId(char.id)}
            >
              <Text style={[styles.charButtonText, { color: theme.textColor }]}>
                {char.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats mit Boni */}
        <View
          style={[
            styles.statsBox,
            {
              backgroundColor: theme.accentColor + "ee",
              borderColor: theme.borderColor,
              shadowColor: theme.shadowColor,
            },
          ]}
        >
          <Text style={[styles.statsTitle, { color: theme.textColor }]}>
            Stats
          </Text>
          {Object.entries(bonusStats).map(([stat, value]) => (
            <Text
              key={stat}
              style={[styles.statText, { color: theme.textColor }]}
            >
              {stat}: <Text style={{ fontWeight: "bold" }}>{value}</Text>
              {percentBonuses[stat]
                ? ` (+${Math.round(percentBonuses[stat] * 100)}%)`
                : ""}
            </Text>
          ))}
          {percentBonuses.attack > 0 && (
            <Text style={[styles.statText, { color: theme.textColor }]}>
              Attack-Bonus: +{Math.round(percentBonuses.attack * 100)}%
            </Text>
          )}
          {percentBonuses.expGain > 0 && (
            <Text style={[styles.statText, { color: theme.textColor }]}>
              EXP-Bonus: +{Math.round(percentBonuses.expGain * 100)}%
            </Text>
          )}
        </View>

        {/* Ausrüstungswahl */}
        <Text style={[styles.equipTitle, { color: theme.textColor }]}>
          Ausrüstung
        </Text>
        <FlatList
          data={filteredEquipmentPool}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const alreadyEquipped = getEquipped(item.slot)?.id === item.id;
            return (
              <View
                style={[
                  styles.equipItem,
                  {
                    borderColor: theme.borderColor,
                    backgroundColor: theme.accentColor + "cc",
                  },
                ]}
              >
                <Image
                  source={{ uri: getEquipmentImageUrl(item.id) }}
                  style={{ width: 40, height: 40, marginRight: 8 }}
                  contentFit="contain"
                  transition={200}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.equipLabel, { color: theme.textColor }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.equipDesc, { color: theme.textColor }]}>
                    {item.description}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.equipBtn,
                    alreadyEquipped && { backgroundColor: "#d97706" },
                  ]}
                  onPress={() =>
                    alreadyEquipped
                      ? handleRemove(item.slot)
                      : handleEquip(item, item.slot)
                  }
                >
                  <Text style={{ color: "#fff" }}>
                    {alreadyEquipped ? "Entfernen" : "Ausrüsten"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />

        {/* Ausgerüstete Items mit Bild anzeigen */}
        <Text style={[styles.equippedTitle, { color: theme.textColor }]}>
          Aktuell ausgerüstet:
        </Text>
        <View
          style={[
            styles.equippedBox,
            {
              borderColor: theme.borderColor,
              backgroundColor: theme.accentColor + "ee",
            },
          ]}
        >
          {["weapon"].map((slot) => {
            const eq = getEquipped(slot);
            return (
              <View
                key={slot}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                {eq && (
                  <Image
                    source={{ uri: getEquipmentImageUrl(eq.id) }}
                    style={{ width: 32, height: 32, marginRight: 6 }}
                    contentFit="contain"
                    transition={200}
                  />
                )}
                <Text style={[styles.equippedItem, { color: theme.textColor }]}>
                  {slot}: {eq ? eq.label : "–"}
                </Text>
              </View>
            );
          })}
        </View>
      </ImageBackground>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, justifyContent: "flex-start" },
  charRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  charButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 6,
    minWidth: 60,
    alignItems: "center",
  },
  charButtonText: { fontWeight: "bold" },
  statsBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
    marginTop: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 7,
  },
  statsTitle: { fontWeight: "bold", marginBottom: 8, fontSize: 16 },
  statText: { fontSize: 14 },
  equipTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  equipItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.3,
    padding: 8,
    marginBottom: 8,
  },
  equipLabel: { fontWeight: "bold" },
  equipDesc: { fontSize: 13, opacity: 0.85 },
  equipBtn: {
    backgroundColor: "#52525b",
    padding: 8,
    borderRadius: 8,
    minWidth: 74,
    alignItems: "center",
  },
  equippedTitle: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 3,
  },
  equippedBox: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.2,
    marginTop: 4,
  },
  equippedItem: { fontSize: 14, fontWeight: "bold" },
});
