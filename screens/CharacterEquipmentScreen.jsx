import React, { useEffect, useState, useCallback, useMemo } from "react";
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

// -------- Custom Hook ausgelagert --------
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

const EQUIP_SLOTS = ["weapon"];

export default function CharacterEquipmentScreen() {
  const { classList, equipItem } = useClass();
  const { theme } = useThemeContext();

  const [selectedCharacterId, setSelectedCharacterId] = useState(
    classList[0]?.id
  );

  const selectedChar = useMemo(
    () => classList.find((c) => c.id === selectedCharacterId),
    [classList, selectedCharacterId]
  );

  const unlockedItemIds = useUnlockedEquipment();

  const filteredEquipmentPool = useMemo(
    () => equipmentPool.filter((item) => unlockedItemIds.includes(item.id)),
    [unlockedItemIds]
  );

  const getEquipped = useCallback(
    (slot) => {
      const equippedId = selectedChar?.equipment?.[slot];
      return equippedId
        ? equipmentPool.find((eq) => eq.id === equippedId)
        : null;
    },
    [selectedChar]
  );

  const handleEquip = useCallback(
    (equipment, slot) => equipItem(selectedChar.id, slot, equipment.id),
    [selectedChar, equipItem]
  );

  const handleRemove = useCallback(
    (slot) => equipItem(selectedChar.id, slot, null),
    [selectedChar, equipItem]
  );

  const { totalStats, percentBonuses } = useMemo(() => {
    const baseStats = selectedChar?.stats ?? {};
    const mergedStats = { ...baseStats };
    const pBonuses = {};

    EQUIP_SLOTS.forEach((slot) => {
      const item = getEquipped(slot);
      if (item) {
        item.bonuses.forEach((bonus) => {
          if (bonus.type === "flat") {
            mergedStats[bonus.stat] =
              (mergedStats[bonus.stat] || 0) + bonus.value;
          } else if (bonus.type === "percent") {
            pBonuses[bonus.stat] = (pBonuses[bonus.stat] || 0) + bonus.value;
          }
        });
      }
    });

    return { totalStats: mergedStats, percentBonuses: pBonuses };
  }, [selectedChar, getEquipped]);

  if (!selectedChar) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={{ color: theme.textColor }}>Kein Charakter gefunden.</Text>
      </View>
    );
  }

  const renderEquipItem = useCallback(
    ({ item }) => {
      const equipped = getEquipped(item.slot);
      const alreadyEquipped = equipped?.id === item.id;

      return (
        <ItemCard
          item={item}
          alreadyEquipped={alreadyEquipped}
          theme={theme}
          onEquip={() =>
            alreadyEquipped
              ? handleRemove(item.slot)
              : handleEquip(item, item.slot)
          }
        />
      );
    },
    [getEquipped, handleEquip, handleRemove, theme]
  );

  return (
    <ScreenLayout style={styles.container}>
      {/* Charakterauswahl */}
      <View style={styles.charRow}>
        {classList.map((char) => (
          <TouchableOpacity
            key={char.id}
            style={[
              styles.charButton,
              {
                backgroundColor:
                  selectedCharacterId === char.id
                    ? theme.accentColor
                    : theme.cardColor,
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

      {/* Stats */}
      <View style={[styles.statsBox, { backgroundColor: theme.accentColor }]}>
        <Text style={[styles.statsTitle, { color: theme.textColor }]}>
          Stats
        </Text>
        {Object.entries(totalStats).map(([stat, value]) => {
          const percent = percentBonuses[stat] || 0;
          return (
            <Text
              key={stat}
              style={[styles.statText, { color: theme.textColor }]}
            >
              {stat}: {value}
              {percent ? ` (+${Math.round(percent)}%)` : ""}
            </Text>
          );
        })}
      </View>

      {/* Ausrüstungsliste */}
      <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
        Ausrüstung
      </Text>
      <FlatList
        data={filteredEquipmentPool}
        keyExtractor={(item) => item.id}
        renderItem={renderEquipItem}
        style={{ flexGrow: 0, marginBottom: 10 }}
      />

      {/* Ausgerüstet */}
      <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
        Aktuell ausgerüstet:
      </Text>
      <View
        style={[styles.equippedBox, { backgroundColor: theme.accentColor }]}
      >
        {EQUIP_SLOTS.map((slot) => {
          const eq = getEquipped(slot);
          return (
            <View key={slot} style={styles.equippedRow}>
              {eq && (
                <Image
                  source={{ uri: getEquipmentImageUrl(eq.id) }}
                  style={styles.equippedIcon}
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
    </ScreenLayout>
  );
}

// --------- Separate ItemCard-Komponente ---------
const ItemCard = React.memo(({ item, alreadyEquipped, theme, onEquip }) => (
  <View
    style={[
      styles.equipItem,
      { backgroundColor: theme.accentColor, borderColor: theme.textColor },
    ]}
  >
    <Image
      source={{ uri: getEquipmentImageUrl(item.id) }}
      style={styles.equipIcon}
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
      onPress={onEquip}
    >
      <Text style={{ color: "#fff" }}>
        {alreadyEquipped ? "Entfernen" : "Ausrüsten"}
      </Text>
    </TouchableOpacity>
  </View>
));

// --------- Styles ---------
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-start" },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  charRow: {
    flexDirection: "row",
    marginBottom: 12,
    marginTop: 10,
    paddingHorizontal: 8,
    flexWrap: "wrap",
  },
  charButton: {
    padding: 10,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
    minWidth: 60,
    alignItems: "center",
  },
  charButtonText: { fontWeight: "500" },
  statsBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    marginTop: 2,
  },
  statsTitle: { marginBottom: 8, fontSize: 16, fontWeight: "bold" },
  statText: { fontSize: 14 },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 6,
    marginTop: 4,
    letterSpacing: 0.5,
    fontWeight: "bold",
    paddingHorizontal: 8,
  },
  equipItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.3,
    padding: 8,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  equipIcon: { width: 40, height: 40, marginRight: 8 },
  equipLabel: { fontWeight: "bold" },
  equipDesc: { fontSize: 13, opacity: 0.85 },
  equipBtn: {
    backgroundColor: "#222",
    padding: 8,
    borderRadius: 8,
    minWidth: 74,
    alignItems: "center",
    marginLeft: 8,
  },
  equippedBox: {
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 8,
    marginBottom: 30,
  },
  equippedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  equippedIcon: { width: 32, height: 32, marginRight: 6 },
  equippedItem: { fontSize: 14 },
});
