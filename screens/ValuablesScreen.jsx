import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import ScreenLayout from "../components/ScreenLayout";
import { useClass } from "../context/ClassContext";
import { useThemeContext } from "../context/ThemeContext";
import { useInventory } from "../context/InventoryContext";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "../i18n";
import { getItemImageUrl } from "../utils/item/itemUtils";

const EXP_AMOUNT_PER_POTION = 1000;
const MAX_MODAL_WIDTH = 430;

export default function ValuablesScreen() {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const { potions, usePotion } = useInventory();
  const { classList, addXpToCharacter } = useClass();
  const [selectCharModalOpen, setSelectCharModalOpen] = React.useState(false);

  // Potion-Modal öffnen
  const handleUsePotion = () => setSelectCharModalOpen(true);

  // Potion an Charakter geben
  const handleGivePotionToChar = (charId) => {
    if (potions > 0) {
      usePotion();
      addXpToCharacter(charId, EXP_AMOUNT_PER_POTION);
    }
    setSelectCharModalOpen(false);
  };

  const bgImage =
    typeof theme.bgImage === "string" ? { uri: theme.bgImage } : theme.bgImage;

  // Dynamischer Potions-String (Singular/Plural)
  function getPotionCountText(count) {
    const potionWord =
      count === 1
        ? t("valuablesNameLabels.expPotion") || "EXP-Potion"
        : t("valuablesNameLabels.expPotionPlural") || "EXP-Potions";
    return `${
      t("valuablesNameLabels.youOwn") || "You own:"
    } ${count} ${potionWord}`;
  }

  const potionGradient = [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  return (
    <ScreenLayout style={styles.flex}>
      {bgImage && (
        <Image
          source={bgImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={500}
          blurRadius={theme.bgBlur || 0}
        />
      )}

      {/* Überschrift */}
      <LinearGradient
        colors={potionGradient}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.headerGradient}
      >
        <Text style={styles.header}>
          {t("valuablesNameLabels.valuablesTitle") ||
            t("valuablesNameLabels.specialItems") ||
            "Besondere Items"}
        </Text>
      </LinearGradient>

      {/* Potion-Sektion */}
      <View style={styles.potionSection}>
        <Text style={styles.info}>{getPotionCountText(potions)}</Text>
        <Image
          source={{ uri: getItemImageUrl("exp-potion") }}
          style={styles.potionImage}
          contentFit="contain"
        />
        <TouchableOpacity
          style={[styles.useButtonOuter, { opacity: potions > 0 ? 1 : 0.45 }]}
          onPress={handleUsePotion}
          disabled={potions <= 0}
          activeOpacity={0.82}
        >
          <LinearGradient
            colors={potionGradient}
            start={[0, 0]}
            end={[1, 0]}
            style={styles.useButton}
          >
            <Text style={styles.useButtonText}>
              {t("valuablesNameLabels.useExpPotion") || "EXP-Potion verwenden"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        {potions <= 0 && (
          <Text style={styles.noPotionsHint}>
            {t("valuablesNameLabels.noExpPotion") ||
              "Keine Potions mehr übrig!"}
          </Text>
        )}
      </View>

      {/* Charakter Auswahl Modal */}
      <Modal
        visible={selectCharModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectCharModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={potionGradient}
            start={[0.12, 0]}
            end={[1, 1]}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>
              {t("valuablesNameLabels.selectCharacter") ||
                "Wähle einen Charakter"}
            </Text>
            <FlatList
              data={classList}
              keyExtractor={(c) => c.id}
              contentContainerStyle={styles.flatListContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.charSelectBtn}
                  onPress={() => handleGivePotionToChar(item.id)}
                  activeOpacity={0.81}
                >
                  <Image
                    source={{ uri: item.classUrl }}
                    style={styles.charAvatar}
                    contentFit="contain"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.charName}>{item.name}</Text>
                    <Text style={styles.charLevel}>
                      {t("valuablesNameLabels.levelShort") || "Lv."}{" "}
                      {item.level}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.noCharactersText}>
                  {t("valuablesNameLabels.noCharacters") ||
                    "Keine Charaktere gefunden."}
                </Text>
              }
              style={{ width: "100%" }}
              showsVerticalScrollIndicator={false}
              getItemLayout={(_, i) => ({
                length: 106,
                offset: 106 * i,
                index: i,
              })}
            />
            <TouchableOpacity
              onPress={() => setSelectCharModalOpen(false)}
              activeOpacity={0.87}
            >
              <LinearGradient
                colors={potionGradient}
                start={[0.12, 0]}
                end={[1, 1]}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>
                  {t("valuablesNameLabels.cancel") || "Abbrechen"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    flex: { flex: 1 },
    headerGradient: {
      borderRadius: 16,
      marginTop: 24,
      marginBottom: 20,
      alignSelf: "center",
      width: "86%",
      paddingVertical: 13,
      paddingHorizontal: 14,
      maxWidth: MAX_MODAL_WIDTH,
      shadowColor: theme.glowColor,
      shadowRadius: 12,
      shadowOpacity: 0.19,
      elevation: 7,
    },
    header: {
      fontSize: 26,
      textAlign: "center",
      letterSpacing: 1,
      color: theme.textColor,
      fontWeight: "bold",
      textShadowColor: theme.glowColor,
      textShadowRadius: 9,
    },
    potionSection: {
      marginTop: 38,
      alignItems: "center",
      width: "100%",
    },
    info: {
      fontSize: 18,
      color: theme.textColor,
      marginBottom: 14,
      textAlign: "center",
      fontWeight: "500",
    },
    potionImage: {
      width: 58,
      height: 58,
      marginBottom: 10,
      borderRadius: 16,
      backgroundColor: theme.shadowColor,
      borderWidth: 1.2,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowRadius: 6,
      shadowOpacity: 0.09,
      elevation: 2,
    },
    useButtonOuter: {
      width: "88%",
      maxWidth: 330,
      borderRadius: 14,
      marginTop: 8,
      alignSelf: "center",
      overflow: "hidden",
      shadowColor: theme.glowColor,
      shadowRadius: 8,
      shadowOpacity: 0.22,
      elevation: 5,
    },
    useButton: {
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    useButtonText: {
      color: theme.textColor,
      fontSize: 17,
      fontWeight: "bold",
      letterSpacing: 0.17,
      textShadowColor: theme.glowColor,
      textShadowRadius: 5,
    },
    noPotionsHint: {
      color: theme.borderGlowColor,
      fontSize: 15,
      marginTop: 7,
      fontStyle: "italic",
      textAlign: "center",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "#000B",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      borderRadius: 20,
      padding: 18,
      width: "92%",
      maxWidth: MAX_MODAL_WIDTH,
      maxHeight: "80%",
      alignItems: "center",
      backgroundColor: theme.accentColor + "cc",
      shadowColor: theme.glowColor,
      shadowRadius: 12,
      shadowOpacity: 0.18,
      elevation: 10,
    },
    modalTitle: {
      fontSize: 20,
      marginBottom: 12,
      color: theme.borderGlowColor,
      letterSpacing: 0.26,
      textAlign: "center",
      fontWeight: "bold",
      textShadowColor: theme.glowColor,
      textShadowRadius: 7,
    },
    flatListContent: {
      paddingBottom: 12,
      minWidth: "97%",
    },
    charSelectBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 9,
      marginVertical: 4,
      borderRadius: 14,
      backgroundColor: theme.accentColor + "e4",
      shadowColor: theme.glowColor,
      shadowRadius: 5,
      shadowOpacity: 0.07,
      elevation: 2,
    },
    charAvatar: {
      width: 54,
      height: 54,
      borderRadius: 13,
      marginRight: 14,
      backgroundColor: theme.shadowColor,
      borderWidth: 1,
      borderColor: theme.borderGlowColor,
    },
    charName: {
      fontSize: 16,
      color: theme.textColor,
      fontWeight: "bold",
      marginBottom: 2,
    },
    charLevel: {
      fontSize: 13,
      color: theme.borderGlowColor,
      marginLeft: 0,
      fontWeight: "500",
    },
    noCharactersText: {
      textAlign: "center",
      marginVertical: 22,
      fontSize: 15,
      color: theme.textColor,
      opacity: 0.67,
    },
    modalClose: {
      marginTop: 16,
      borderRadius: 12,
      paddingVertical: 9,
      paddingHorizontal: 25,
      alignSelf: "center",
      alignItems: "center",
      backgroundColor: theme.accentColor + "f7",
      shadowColor: theme.glowColor,
      shadowRadius: 7,
      shadowOpacity: 0.1,
      elevation: 2,
    },
    modalCloseText: {
      color: theme.borderGlowColor,
      fontSize: 17,
      letterSpacing: 0.15,
      fontWeight: "bold",
    },
  });
}
