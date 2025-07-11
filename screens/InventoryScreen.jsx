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
import { LinearGradient } from "expo-linear-gradient";

// Einmalig definierte Slot-Arrays
const leftSlots = ["head", "shoulder", "chest", "hands", "legs"];
const rightSlots = ["weapon", "ring", "neck", "feet"];

export default function InventoryScreen() {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const { classList, equipItem } = useClass();
  const styles = createStyles(theme);

  const [selectedCharacterId, setSelectedCharacterId] = useState(
    classList[0]?.id || null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const selectedCharacter = classList.find((c) => c.id === selectedCharacterId);
  const selectedInventory = selectedCharacter?.inventory || [];

  // Inventory-Zählung (Map aus Item-ID -> Anzahl)
  const inventoryCounts = selectedInventory.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const handleEquip = (item) => {
    if (!selectedCharacterId || !selectedSlot) return;
    equipItem(selectedCharacterId, selectedSlot, item.id);
    setModalVisible(false);
  };

  const handleRemove = (slot) => {
    equipItem(selectedCharacterId, slot, null);
  };

  const renderSlot = (slot) => {
    const equippedItemId = selectedCharacter?.equipment?.[slot];
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
        activeOpacity={0.82}
      >
        <LinearGradient
          colors={
            icon
              ? [
                  theme.accentColorSecondary,
                  theme.accentColor,
                  theme.accentColorDark,
                ]
              : [theme.shadowColor, theme.accentColor]
          }
          style={styles.slotIconOuter}
        >
          {icon ? (
            <Image source={icon} style={styles.slotIcon} contentFit="contain" />
          ) : (
            <View style={styles.emptySlot} />
          )}
        </LinearGradient>
        <Text style={styles.slotLabel}>{slot.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout style={styles.container}>
      {/* Gradient-Header */}
      <LinearGradient
        colors={[
          theme.accentColorSecondary,
          theme.accentColor,
          theme.accentColorDark,
        ]}
        start={[0.1, 0]}
        end={[1, 1]}
        style={styles.headingGradient}
      >
        <Text style={styles.heading}>Charakter Auswahl</Text>
      </LinearGradient>
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
              activeOpacity={0.85}
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

      {/* Ausrüstungsübersicht */}
      <View style={styles.characterRow}>
        {/* Linke Slots */}
        <View style={styles.slotColumn}>{leftSlots.map(renderSlot)}</View>

        {/* Charakterbild */}
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

        {/* Rechte Slots */}
        <View style={styles.slotColumn}>{rightSlots.map(renderSlot)}</View>
      </View>

      {/* Tipp */}
      <Text style={[styles.tipText, { backgroundColor: theme.accentColor }]}>
        Tippe auf einen Slot zum Anlegen, lange tippen zum Entfernen
      </Text>

      {/* Modal für Item-Auswahl */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainerOuter}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Ausrüstung wählen</Text>
            <FlatList
              data={equipmentPool.filter((e) => e.slot === selectedSlot)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const icon = imageMap[`equipment_${item.id}`];
                const count = inventoryCounts[item.id] || 0;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      !count && styles.modalItemDisabled,
                    ]}
                    onPress={() => handleEquip(item)}
                    disabled={!count}
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
                        {`  x${count}`}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    headingGradient: {
      marginTop: 20,
      marginBottom: 8,
      alignSelf: "center",
      borderRadius: 15,
      paddingVertical: 13,
      paddingHorizontal: 38,
      shadowColor: theme.glowColor,
      shadowRadius: 12,
      shadowOpacity: 0.38,
      shadowOffset: { width: 0, height: 5 },
      elevation: 6,
    },
    heading: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.textColor,
      textAlign: "center",
      letterSpacing: 0.7,
      textShadowColor: theme.glowColor,
      textShadowRadius: 8,
      textShadowOffset: { width: 0, height: 2 },
      textTransform: "uppercase",
    },
    characterSelectRow: {
      flexDirection: "row",
      paddingHorizontal: 10,
      marginBottom: 14,
      marginTop: 2,
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
      backgroundColor: theme.shadowColor + "20",
      shadowColor: theme.glowColor,
      shadowRadius: 4,
      shadowOpacity: 0.15,
      elevation: 2,
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
      backgroundColor: theme.shadowColor,
      borderWidth: 1.2,
      borderColor: theme.borderGlowColor,
    },
    charSelectLabel: {
      fontSize: 12,
      color: theme.textColor,
      opacity: 0.78,
    },
    charSelectLabelActive: {
      fontWeight: "bold",
      color: theme.borderGlowColor,
      opacity: 1,
      textShadowColor: theme.glowColor,
      textShadowRadius: 4,
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
      gap: 12,
    },
    slotButton: { alignItems: "center", marginVertical: 2 },
    slotIconOuter: {
      width: 54,
      height: 54,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.17,
      shadowRadius: 6,
      elevation: 2,
    },
    slotIcon: {
      width: 45,
      height: 45,
      borderRadius: 8,
      borderWidth: 1.7,
      borderColor: theme.borderGlowColor,
      backgroundColor: theme.shadowColor,
    },
    emptySlot: {
      width: 45,
      height: 45,
      backgroundColor: theme.shadowColor,
      opacity: 0.5,
      borderRadius: 8,
      borderWidth: 1.7,
      borderColor: theme.borderGlowColor,
    },
    slotLabel: {
      color: theme.borderGlowColor,
      fontSize: 11,
      marginTop: 1,
      letterSpacing: 1.1,
      fontWeight: "bold",
      textShadowColor: theme.glowColor,
      textShadowRadius: 3,
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
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      backgroundColor: theme.shadowColor,
      shadowColor: theme.glowColor,
      shadowRadius: 16,
      shadowOpacity: 0.13,
      elevation: 5,
    },
    noCharacter: {
      color: theme.textColor,
      fontSize: 16,
      marginTop: 50,
      fontStyle: "italic",
      opacity: 0.85,
    },
    tipText: {
      color: theme.textColor,
      marginBottom: 15,
      textAlign: "center",
      fontSize: 13,
      fontStyle: "italic",
      borderRadius: 13,
      paddingVertical: 6,
      marginHorizontal: 32,
      shadowColor: theme.glowColor,
      shadowRadius: 7,
      shadowOpacity: 0.11,
      elevation: 3,
    },
    modalContainerOuter: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.43)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: theme.accentColor,
      borderRadius: 16,
      padding: 20,
      width: "89%",
      maxHeight: "70%",
      alignItems: "center",
      shadowColor: theme.glowColor,
      shadowRadius: 14,
      shadowOpacity: 0.22,
      elevation: 8,
    },
    modalTitle: {
      color: theme.borderGlowColor,
      fontWeight: "bold",
      fontSize: 17,
      marginBottom: 12,
      letterSpacing: 0.2,
      textShadowColor: theme.glowColor,
      textShadowRadius: 7,
    },
    modalItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 13,
      borderRadius: 10,
      paddingVertical: 6,
      paddingHorizontal: 8,
      backgroundColor: theme.accentColor,
      shadowColor: theme.glowColor,
      shadowRadius: 5,
      shadowOpacity: 0.09,
      elevation: 1,
      opacity: 1,
    },
    modalItemDisabled: {
      opacity: 0.38,
    },
    modalImage: {
      width: 50,
      height: 50,
      marginRight: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.borderGlowColor,
      backgroundColor: theme.shadowColor,
    },
    modalText: {
      color: theme.textColor,
      fontSize: 16,
      fontWeight: "bold",
      letterSpacing: 0.1,
    },
    modalClose: {
      marginTop: 16,
      backgroundColor: theme.borderGlowColor,
      borderRadius: 11,
      paddingVertical: 8,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    buttonText: {
      color: theme.accentColor,
      fontWeight: "bold",
      fontSize: 16,
      textShadowColor: theme.shadowColor,
      textShadowRadius: 4,
    },
  });
}
