import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
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

export default function ValuablesScreen() {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const { potions, usePotion } = useInventory();
  const { classList, addXpToCharacter } = useClass();
  const [selectCharModalOpen, setSelectCharModalOpen] = React.useState(false);
  const [pendingPotion, setPendingPotion] = React.useState(false);

  // Potion-Modal öffnen
  const handleUsePotion = () => {
    setPendingPotion(true);
    setSelectCharModalOpen(true);
  };

  // Potion an Charakter geben
  const handleGivePotionToChar = (charId) => {
    if (potions > 0) {
      usePotion();
      addXpToCharacter(charId, EXP_AMOUNT_PER_POTION);
    }
    setSelectCharModalOpen(false);
    setPendingPotion(false);
  };

  const bgImage =
    typeof theme.bgImage === "string" ? { uri: theme.bgImage } : theme.bgImage;

  // Dynamischer Potions-String (Singular/Plural)
  function getPotionCountText(count) {
    const potionWord =
      count === 1
        ? t("valuablesNameLabels.expPotion") || "EXP-Potion"
        : t("valuablesNameLabels.expPotionPlural") || "EXP-Potions";
    // z.B. "You own: 3 EXP Potions"
    return `${
      t("valuablesNameLabels.youOwn") || "You own:"
    } ${count} ${potionWord}`;
  }

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

      <LinearGradient
        colors={[
          theme.accentColorSecondary,
          theme.accentColor,
          theme.accentColorDark,
        ]}
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

      <View style={styles.potionSection}>
        <Text style={styles.info}>{getPotionCountText(potions)}</Text>
        <Image
          source={{ uri: getItemImageUrl("exp-potion") }}
          style={{ width: 54, height: 54, marginBottom: 6 }}
          contentFit="contain"
        />
        <LinearGradient
          colors={[
            theme.accentColorSecondary,
            theme.accentColor,
            theme.accentColorDark,
          ]}
          start={[0, 0]}
          end={[1, 0]}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            style={[styles.useButton, { opacity: potions > 0 ? 1 : 0.45 }]}
            onPress={handleUsePotion}
            disabled={potions <= 0}
          >
            <Text style={styles.useButtonText}>
              {t("valuablesNameLabels.useExpPotion") || "EXP-Potion verwenden"}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
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
            colors={[
              theme.accentColorSecondary,
              theme.accentColor,
              theme.accentColorDark,
            ]}
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.charSelectBtn}
                  onPress={() => handleGivePotionToChar(item.id)}
                >
                  <Image
                    source={{ uri: item.classUrl }}
                    style={styles.charAvatar}
                    contentFit="contain"
                  />
                  <Text style={styles.charName}>{item.name}</Text>
                  <Text style={styles.charLevel}>
                    {t("valuablesNameLabels.levelShort") || "Lv."} {item.level}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setSelectCharModalOpen(false)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[
                  theme.accentColorSecondary,
                  theme.accentColor,
                  theme.accentColorDark,
                ]}
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
      marginTop: 20,
      marginBottom: 16,
      alignSelf: "center",
      width: "83%",
      paddingVertical: 13,
      paddingHorizontal: 8,
    },
    header: {
      fontSize: 26,
      textAlign: "center",
      letterSpacing: 0.9,
      color: theme.textColor,
    },
    potionSection: {
      marginTop: 38,
      alignItems: "center",
    },
    info: {
      fontSize: 18,
      color: theme.textColor,
      marginBottom: 16,
      textAlign: "center",
    },
    potionCount: {
      color: theme.textColor,
      fontSize: 19,
    },
    useButton: {
      borderRadius: 13,
      paddingVertical: 13,
      paddingHorizontal: 30,
      marginVertical: 8,
      shadowColor: theme.glowColor,
      shadowRadius: 8,
      shadowOpacity: 0.18,
      elevation: 5,
    },
    useButtonText: {
      color: theme.textColor,
      fontSize: 17,
      letterSpacing: 0.17,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "#000A",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      borderRadius: 18,
      padding: 22,
      minWidth: "77%",
      maxHeight: "80%",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 20,
      marginBottom: 12,
      color: theme.textColor,
      letterSpacing: 0.22,
      textAlign: "center",
    },
    charSelectBtn: {
      flexDirection: "row",
      alignItems: "center",
      padding: 11,
      marginVertical: 6,
      borderRadius: 12,
    },
    charAvatar: {
      width: 100,
      height: 100,
      borderRadius: 18,
      marginRight: 10,
    },
    charName: {
      fontSize: 15,
      color: theme.textColor,
    },
    charLevel: {
      fontSize: 13,
      color: theme.textColor,
      marginLeft: 8,
    },
    modalClose: {
      marginTop: 12,
      borderRadius: 9,
      paddingVertical: 8,
      paddingHorizontal: 23,
      alignSelf: "center",
      alignItems: "center",
    },
    modalCloseText: {
      color: theme.borderGlowColor,
      fontSize: 16,
      letterSpacing: 0.15,
    },
  });
}
