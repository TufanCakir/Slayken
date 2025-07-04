import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import { equipmentPool } from "../data/equipmentPool";
import { useClass } from "../context/ClassContext";
import ScreenLayout from "../components/ScreenLayout";

const leftSlots = ["head", "shoulder", "chest", "hands", "legs"];
const rightSlots = ["weapon", "ring", "neck", "feet"];

export default function InventoryScreen() {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);
  const { imageMap } = useAssets();
  const { classList, equipItem } = useClass();
  const [selectedCharacterId, setSelectedCharacterId] = useState(
    classList[0]?.id || null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const selectedCharacter = classList.find((c) => c.id === selectedCharacterId);

  const handleEquip = (item) => {
    if (!selectedCharacterId || !selectedSlot) return;
    equipItem(selectedCharacterId, selectedSlot, item.id);
    setModalVisible(false);
  };

  const handleRemove = (slot) => {
    equipItem(selectedCharacterId, slot, null);
  };

  const renderSlot = (slot) => {
    const equippedItemId = selectedCharacter.equipment?.[slot];
    const equippedItem = equipmentPool.find((e) => e.id === equippedItemId);
    const icon = equippedItem ? imageMap[`equipment_${equippedItem.id}`] : null;

    return (
      <TouchableOpacity
        key={slot}
        style={styles.slotButton}
        onPress={() => {
          setSelectedSlot(slot);
          setModalVisible(true);
        }}
        onLongPress={() => handleRemove(slot)}
      >
        {icon ? (
          <Image source={icon} style={styles.slotIcon} contentFit="contain" />
        ) : (
          <View style={styles.emptySlot} />
        )}
        <Text style={styles.slotLabel}>{slot.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  };
  // Oberhalb der return-Anweisung in der Komponente:
  const selectedInventory = selectedCharacter?.inventory || [];
  const inventoryCounts = {};
  selectedInventory.forEach((id) => {
    inventoryCounts[id] = (inventoryCounts[id] || 0) + 1;
  });

  return (
    <ScreenLayout style={styles.container}>
      <Text style={styles.heading}>Charakter Auswahl</Text>

      <View style={styles.characterSelectRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {classList.map((char) => (
            <TouchableOpacity
              key={char.id}
              style={[
                styles.charSelectButton,
                char.id === selectedCharacterId && styles.charSelectActive,
              ]}
              onPress={() => setSelectedCharacterId(char.id)}
            >
              <Image
                source={char.classUrl}
                style={styles.charSelectAvatar}
                contentFit="contain"
              />
              <Text
                style={[
                  styles.charSelectLabel,
                  char.id === selectedCharacterId &&
                    styles.charSelectLabelActive,
                ]}
              >
                {char.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.characterRow}>
        {/* Left slots */}
        <View style={styles.slotColumn}>
          {leftSlots.map((slot) => renderSlot(slot))}
        </View>

        {/* Character image */}
        <View style={styles.characterArea}>
          {selectedCharacter ? (
            <Image
              source={selectedCharacter.classUrl}
              style={styles.characterImageLarge}
              contentFit="contain"
            />
          ) : (
            <Text style={styles.noCharacter}>Kein Charakter ausgewählt</Text>
          )}
        </View>

        {/* Right slots */}
        <View style={styles.slotColumn}>
          {rightSlots.map((slot) => renderSlot(slot))}
        </View>
      </View>

      <Text style={[styles.tipText, { backgroundColor: theme.accentColor }]}>
        Tippe auf einen Slot zum Anlegen, lange tippen zum Entfernen
      </Text>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <FlatList
            data={equipmentPool.filter((e) => e.slot === selectedSlot)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const icon = imageMap[`equipment_${item.id}`];
              return (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleEquip(item)}
                  disabled={!inventoryCounts[item.id]} // Optional: deaktivieren wenn keins da!
                >
                  {icon && (
                    <Image
                      source={icon}
                      style={styles.modalImage}
                      contentFit="contain"
                    />
                  )}
                  <Text style={styles.modalText}>
                    {item.label}
                    <Text style={{ color: theme.borderGlowColor }}>
                      {"  x" + (inventoryCounts[item.id] || 0)}
                    </Text>
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    heading: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.textColor,
      marginLeft: 20,
      marginTop: 20,
      marginBottom: 10,
    },
    characterRow: {
      flexDirection: "row",
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    slotColumn: {
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    characterArea: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    characterImageLarge: {
      width: "80%",
      height: 350,
      resizeMode: "contain",
    },
    slotButton: {
      alignItems: "center",
    },
    slotIcon: {
      width: 45,
      height: 45,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#fff",
    },
    emptySlot: {
      width: 45,
      height: 45,
      backgroundColor: "#475569",
      opacity: 0.6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#fff",
    },
    slotLabel: {
      color: theme.textColor,
      fontSize: 10,
      marginTop: 2,
    },
    tipText: {
      color: theme.textColor,
      marginBottom: 15,
      textAlign: "center",
      fontSize: 12,
      fontStyle: "italic",
    },
    noCharacter: {
      color: theme.textColor,
      fontSize: 16,
      marginTop: 50,
    },
    modalContainer: {
      backgroundColor: theme.accentColor,
      marginTop: "30%",
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
    },
    modalItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    modalImage: {
      width: 50,
      height: 50,
      marginRight: 10,
    },
    modalText: {
      color: theme.textColor,
      fontSize: 16,
    },
    modalClose: {
      marginTop: 14,
    },
    buttonText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 15,
    },
    characterSelectRow: {
      flexDirection: "row",
      paddingHorizontal: 10,
      marginBottom: 14,
      marginTop: 8,
      alignItems: "center",
      minHeight: 70,
    },
    charSelectButton: {
      alignItems: "center",
      marginHorizontal: 7,
      padding: 3,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: "transparent",
    },
    charSelectActive: {
      borderColor: theme.borderGlowColor,
      backgroundColor: theme.accentColor,
    },
    charSelectAvatar: {
      width: 40,
      height: 40,
      borderRadius: 7,
      marginBottom: 2,
    },
    charSelectLabel: {
      fontSize: 12,
      color: theme.textColor,
    },
    charSelectLabelActive: {
      fontWeight: "bold",
      color: theme.borderGlowColor,
    },
  });
}
