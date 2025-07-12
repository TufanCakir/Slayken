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
          start={[0.1, 0]}
          end={[1, 1]}
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
              <LinearGradient
                colors={
                  char.id === selectedCharacterId
                    ? [
                        theme.accentColorSecondary,
                        theme.accentColor,
                        theme.accentColorDark,
                      ]
                    : [theme.shadowColor, theme.accentColor]
                }
                start={[0, 0]}
                end={[1, 1]}
                style={styles.charSelectGradient}
              >
                <Image
                  source={char.classUrl}
                  style={styles.charSelectAvatar}
                  contentFit="contain"
                />
              </LinearGradient>
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
        <LinearGradient
          colors={[
            theme.accentColorSecondary,
            theme.accentColor,
            theme.accentColorDark,
          ]}
          start={[0.1, 0]}
          end={[1, 1]}
          style={styles.slotColumnGradient}
        >
          <View style={styles.slotColumn}>{leftSlots.map(renderSlot)}</View>
        </LinearGradient>

        {/* Charakterbild */}
        <View style={styles.characterArea}>
          {selectedCharacter ? (
            <LinearGradient
              colors={[
                theme.accentColorSecondary,
                theme.accentColor,
                theme.accentColorDark,
              ]}
              start={[0.3, 0]}
              end={[1, 1]}
              style={styles.characterGradient}
            >
              <Image
                source={selectedCharacter.classUrl}
                style={styles.characterImageLarge}
                contentFit="contain"
              />
            </LinearGradient>
          ) : (
            <Text style={styles.noCharacter}>Kein Charakter ausgewählt</Text>
          )}
        </View>

        {/* Rechte Slots mit Gradient */}
        <LinearGradient
          colors={[
            theme.accentColorSecondary,
            theme.accentColor,
            theme.accentColorDark,
          ]}
          start={[0.1, 0]}
          end={[1, 1]}
          style={styles.slotColumnGradient}
        >
          <View style={styles.slotColumn}>{rightSlots.map(renderSlot)}</View>
        </LinearGradient>
      </View>

      {/* Tipp */}
      <LinearGradient
        colors={[theme.accentColorSecondary, theme.accentColorDark]}
        start={[0.2, 0]}
        end={[1, 1]}
        style={styles.tipGradient}
      >
        <Text style={styles.tipText}>
          Tippe auf einen Slot zum Anlegen, lange tippen zum Entfernen
        </Text>
      </LinearGradient>

      {/* Modal für Item-Auswahl */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainerOuter}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[
                theme.accentColorSecondary,
                theme.accentColor,
                theme.accentColorDark,
              ]}
              start={[0.1, 0]}
              end={[1, 1]}
              style={styles.modalTitleGradient}
            >
              <Text style={styles.modalTitle}>Ausrüstung wählen</Text>
            </LinearGradient>
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
                    <LinearGradient
                      colors={
                        count
                          ? [
                              theme.accentColorSecondary,
                              theme.accentColor,
                              theme.accentColorDark,
                            ]
                          : [theme.shadowColor, theme.accentColor]
                      }
                      start={[0.1, 0]}
                      end={[1, 1]}
                      style={styles.modalItemGradient}
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
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[
                  theme.accentColorSecondary,
                  theme.accentColor,
                  theme.accentColorDark,
                ]}
                start={[0.1, 0]}
                end={[1, 1]}
                style={styles.modalCloseGradient}
              >
                <Text style={styles.buttonText}>Abbrechen</Text>
              </LinearGradient>
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
    },
    heading: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.textColor,
      textAlign: "center",
      letterSpacing: 0.7,
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
    },
    charSelectGradient: {
      borderRadius: 8,
      padding: 2,
      marginBottom: 2,
    },
    charSelectActive: {
      borderColor: "transparent",
    },
    charSelectAvatar: {
      width: 40,
      height: 40,
      borderRadius: 7,
      marginBottom: 0,
    },
    charSelectLabel: {
      fontSize: 12,
      color: theme.textColor,
      opacity: 0.78,
      marginTop: 2,
    },
    charSelectLabelActive: {
      fontWeight: "bold",
      color: theme.borderGlowColor,
      opacity: 1,
    },
    characterRow: {
      flexDirection: "row",
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    slotColumnGradient: {
      borderRadius: 16,
      paddingVertical: 10,
      paddingHorizontal: 3,
      marginHorizontal: 2,
      // KEIN gap hier!
    },
    slotColumn: {
      alignItems: "center",
      justifyContent: "center",
      // gap: 12,      // gap NUR im View!
    },
    slotButton: { alignItems: "center", marginVertical: 2 },
    slotIconOuter: {
      width: 58,
      height: 58,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
      padding: 3, // etwas padding gibt mehr "Rahmen"
    },
    slotIcon: {
      width: 48,
      height: 48,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      backgroundColor: theme.shadowColor,
    },
    emptySlot: {
      width: 48,
      height: 48,
      opacity: 0.5,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
    },
    slotLabel: {
      color: theme.borderGlowColor,
      fontSize: 11,
      marginTop: 1,
      letterSpacing: 1.1,
      fontWeight: "bold",
    },
    characterArea: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    characterGradient: {
      width: "90%",
      height: 360, // etwas mehr als das Bild für einen Rahmen
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.glowColor,
      shadowRadius: 18,
      shadowOpacity: 0.14,
      marginVertical: 6,
    },
    characterImageLarge: {
      width: "97%",
      height: 340,
      resizeMode: "contain",
      borderRadius: 18,
    },
    noCharacter: {
      color: theme.textColor,
      fontSize: 16,
      marginTop: 50,
      fontStyle: "italic",
      opacity: 0.85,
    },
    tipGradient: {
      marginBottom: 15,
      marginHorizontal: 32,
      borderRadius: 13,
      paddingVertical: 6,
      paddingHorizontal: 8,
      shadowColor: theme.glowColor,
      shadowRadius: 7,
      shadowOpacity: 0.11,
      elevation: 3,
    },
    tipText: {
      color: theme.textColor,
      textAlign: "center",
      fontSize: 13,
      fontStyle: "italic",
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
    modalTitleGradient: {
      borderRadius: 9,
      marginBottom: 10,
      paddingHorizontal: 14,
      paddingVertical: 7,
      alignSelf: "stretch",
      alignItems: "center",
    },
    modalTitle: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 17,
      letterSpacing: 0.2,
      textShadowColor: theme.glowColor,
      textShadowRadius: 7,
    },
    modalItem: {
      marginBottom: 13,
      borderRadius: 10,
      opacity: 1,
    },
    modalItemGradient: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 10,
      paddingVertical: 6,
      paddingHorizontal: 8,
      shadowColor: theme.glowColor,
      shadowRadius: 5,
      shadowOpacity: 0.09,
      elevation: 1,
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
    modalCloseButton: {
      marginTop: 16,
      alignItems: "center",
      alignSelf: "stretch",
    },
    modalCloseGradient: {
      borderRadius: 11,
      paddingVertical: 8,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    buttonText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 16,
    },
  });
}
