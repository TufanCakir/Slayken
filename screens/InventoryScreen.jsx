import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import { equipmentPool } from "../data/equipmentPool";
import { useClass } from "../context/ClassContext";
import ScreenLayout from "../components/ScreenLayout";
import { LinearGradient } from "expo-linear-gradient";
import { getEquipmentImageUrl } from "../utils/equipment/equipment";

const LEFT_SLOTS = ["head", "shoulder", "chest", "hands", "legs"];
const RIGHT_SLOTS = ["weapon", "ring", "neck", "feet"];

// --- Memoized EquipSlot ---
const EquipSlot = React.memo(function EquipSlot({
  slot,
  equipped,
  gradients,
  theme,
  setSelectedSlot,
  setModalVisible,
  handleRemove,
}) {
  const equippedItemId = equipped[slot];
  const equippedItem = equipmentPool.find((e) => e.id === equippedItemId);
  const icon = equippedItem ? getEquipmentImageUrl(equippedItem.id) : null;

  return (
    <TouchableOpacity
      style={styles.slotButton}
      onPress={() => {
        setSelectedSlot(slot);
        setModalVisible(true);
      }}
      onLongPress={() => handleRemove(slot)}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={
        equippedItem
          ? `Slot ${slot}: ${equippedItem.label}`
          : `Slot ${slot}: leer`
      }
    >
      <LinearGradient
        colors={icon ? gradients : [theme.shadowColor, theme.accentColor]}
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
});

// --- Memoized ModalItem (bereits vorhanden) ---
const ModalItem = React.memo(function ModalItem({
  item,
  count,
  onEquip,
  icon,
  theme,
  gradients,
}) {
  return (
    <TouchableOpacity
      style={[styles.modalItem, !count && styles.modalItemDisabled]}
      onPress={() => count && onEquip(item)}
      disabled={!count}
    >
      <LinearGradient
        colors={count ? gradients : [theme.shadowColor, theme.accentColor]}
        start={[0.1, 0]}
        end={[1, 1]}
        style={styles.modalItemGradient}
      >
        {icon ? (
          <Image source={icon} style={styles.modalImage} contentFit="contain" />
        ) : (
          <View style={styles.emptySlot} />
        )}
        <Text style={styles.modalText}>
          {item.label}
          <Text style={{ color: theme.borderGlowColor }}>{`  x${count}`}</Text>
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
});

// --- Memoized CharacterButton ---
const CharacterButton = React.memo(function CharacterButton({
  char,
  selected,
  gradients,
  theme,
  onSelect,
}) {
  return (
    <TouchableOpacity
      key={char.id}
      style={[styles.charSelectButton, selected && styles.charSelectActive]}
      onPress={() => onSelect(char.id)}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={selected ? gradients : [theme.shadowColor, theme.accentColor]}
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
          selected && styles.charSelectLabelActive,
        ]}
      >
        {char.label}
      </Text>
    </TouchableOpacity>
  );
});

export default function InventoryScreen() {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const { classList, equipItem } = useClass();
  const gradients = [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  const [selectedCharacterId, setSelectedCharacterId] = useState(
    classList[0]?.id || null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const selectedCharacter = useMemo(
    () => classList.find((c) => c.id === selectedCharacterId),
    [classList, selectedCharacterId]
  );
  const selectedInventory = selectedCharacter?.inventory || [];
  const equipped = selectedCharacter?.equipment || {};

  const inventoryCounts = useMemo(() => {
    return selectedInventory.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
  }, [selectedInventory]);

  // Stable Handler für Equip
  const handleEquip = useCallback(
    (item) => {
      if (!selectedCharacterId || !selectedSlot) return;
      equipItem(selectedCharacterId, selectedSlot, item.id);
      setModalVisible(false);
    },
    [selectedCharacterId, selectedSlot, equipItem]
  );

  // Stable Handler für Remove
  const handleRemove = useCallback(
    (slot) => equipItem(selectedCharacterId, slot, null),
    [equipItem, selectedCharacterId]
  );

  // Memoisiertes FlatList renderItem
  const renderModalItem = useCallback(
    ({ item }) => (
      <ModalItem
        item={item}
        count={item.count}
        onEquip={handleEquip}
        icon={item.icon}
        theme={theme}
        gradients={gradients}
      />
    ),
    [handleEquip, theme, gradients]
  );

  // Modal Items filtern
  const filteredEquip = useMemo(
    () =>
      equipmentPool
        .filter((e) => e.slot === selectedSlot)
        .map((e) => ({
          ...e,
          icon: getEquipmentImageUrl(e.id),
          count: inventoryCounts[e.id] || 0,
        })),
    [selectedSlot, inventoryCounts]
  );

  return (
    <ScreenLayout style={styles.container}>
      {/* Charakter Auswahl */}
      <LinearGradient
        colors={gradients}
        start={[0.1, 0]}
        end={[1, 1]}
        style={styles.headingGradient}
      >
        <Text style={styles.heading}>Charakter Auswahl</Text>
      </LinearGradient>
      <View style={styles.characterSelectRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {classList.map((char) => (
            <CharacterButton
              key={char.id}
              char={char}
              selected={char.id === selectedCharacterId}
              gradients={gradients}
              theme={theme}
              onSelect={setSelectedCharacterId}
            />
          ))}
        </ScrollView>
      </View>

      {/* Ausrüstungsübersicht */}
      <View style={styles.characterRow}>
        {/* Linke Slots */}
        <LinearGradient
          colors={gradients}
          start={[0.1, 0]}
          end={[1, 1]}
          style={styles.slotColumnGradient}
        >
          <View style={styles.slotColumn}>
            {LEFT_SLOTS.map((slot) => (
              <EquipSlot
                key={slot}
                slot={slot}
                equipped={equipped}
                gradients={gradients}
                theme={theme}
                setSelectedSlot={setSelectedSlot}
                setModalVisible={setModalVisible}
                handleRemove={handleRemove}
              />
            ))}
          </View>
        </LinearGradient>

        {/* Charakterbild */}
        <View style={styles.characterArea}>
          {selectedCharacter ? (
            <LinearGradient
              colors={gradients}
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

        {/* Rechte Slots */}
        <LinearGradient
          colors={gradients}
          start={[0.1, 0]}
          end={[1, 1]}
          style={styles.slotColumnGradient}
        >
          <View style={styles.slotColumn}>
            {RIGHT_SLOTS.map((slot) => (
              <EquipSlot
                key={slot}
                slot={slot}
                equipped={equipped}
                gradients={gradients}
                theme={theme}
                setSelectedSlot={setSelectedSlot}
                setModalVisible={setModalVisible}
                handleRemove={handleRemove}
              />
            ))}
          </View>
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
              colors={gradients}
              start={[0.1, 0]}
              end={[1, 1]}
              style={styles.modalTitleGradient}
            >
              <Text style={styles.modalTitle}>Ausrüstung wählen</Text>
            </LinearGradient>
            <FlatList
              data={filteredEquip}
              keyExtractor={(item) => item.id}
              renderItem={renderModalItem}
              style={{ maxHeight: 340 }}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients}
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
    },
    slotColumn: {
      alignItems: "center",
      justifyContent: "center",
    },
    slotButton: { alignItems: "center", marginVertical: 2 },
    slotIconOuter: {
      width: 58,
      height: 58,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
      padding: 3,
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
      opacity: 0.36,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      backgroundColor: theme.accentColor,
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
      height: 360,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
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
    },
    modalItemDisabled: {
      opacity: 0.36,
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
