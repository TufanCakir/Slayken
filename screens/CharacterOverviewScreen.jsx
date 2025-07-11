import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import elementData from "../data/elementData.json";
import SHOP_ITEMS from "../data/shopData.json";
import ScreenLayout from "../components/ScreenLayout";
import { useClass } from "../context/ClassContext";
import { useThemeContext } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useShop } from "../context/ShopContext";
import { LinearGradient } from "expo-linear-gradient";

const CARD_WIDTH = Dimensions.get("window").width / 2 - 22;

export default function CharacterOverviewScreen() {
  const {
    classList,
    activeClassId,
    setActiveClassId,
    deleteClass,
    updateCharacter,
  } = useClass();
  const { theme } = useThemeContext();
  const styles = createStyles(theme);
  const { isUnlocked } = useShop();

  // Nur für Skins, bleibt gleich
  function getUnlockedSkinsForChar(item) {
    const charId = item.baseId || item.id;
    return SHOP_ITEMS.filter(
      (skin) =>
        skin.category?.toLowerCase().includes("skin") &&
        skin.characterId === charId &&
        isUnlocked(skin)
    );
  }

  const handleEquipSkin = async (char, skinId) => {
    await updateCharacter({ ...char, activeSkin: skinId });
  };

  const renderCharacter = ({ item }) => {
    const isActive = item.id === activeClassId;
    const element = elementData[item.element] || {};
    const availableSkins = getUnlockedSkinsForChar(item);
    const currentSkin =
      availableSkins.find((s) => s.id === item.activeSkin) || null;
    const avatarSrc = currentSkin?.skinImage || item.classUrl;

    return (
      <LinearGradient
        colors={
          isActive
            ? [
                theme.accentColorSecondary,
                theme.accentColor,
                theme.accentColorDark,
                "#000",
              ]
            : [theme.accentColor, theme.accentColorDark, "#191919"]
        }
        start={[0, 0]}
        end={[1, 0]}
        style={[styles.card, isActive && styles.cardActive]}
      >
        {item.eventReward && (
          <View style={styles.exclusiveBadge}>
            <MaterialCommunityIcons name="crown" size={14} color="#111" />
            <Text style={styles.exclusiveBadgeText}>Exklusiv</Text>
          </View>
        )}
        <Image
          source={{ uri: avatarSrc }}
          style={styles.avatar}
          contentFit="contain"
        />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.level}>Level {item.level}</Text>
        <View style={styles.elementTag}>
          <Text style={[styles.element, { color: element.color }]}>
            {element.icon} {element.label}
          </Text>
        </View>
        <Text style={styles.classText}>{item.type}</Text>

        {availableSkins.length > 0 && (
          <View style={styles.skinsWrapper}>
            <Text style={styles.skinsTitle}>Skins:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.skinsScrollView}
              style={styles.skinsScrollStyle}
            >
              <SkinButton
                key="default"
                active={!item.activeSkin}
                onPress={() => handleEquipSkin(item, undefined)}
                label="Standard"
                icon={
                  <MaterialCommunityIcons
                    name="account"
                    size={24}
                    color={
                      !item.activeSkin
                        ? theme.borderGlowColor || "gold"
                        : theme.textColor
                    }
                  />
                }
              />
              {availableSkins.map((skin) => (
                <SkinButton
                  key={skin.id}
                  active={skin.id === item.activeSkin}
                  onPress={() => handleEquipSkin(item, skin.id)}
                  label={skin.name || "Skin"}
                  icon={
                    <Image
                      source={{ uri: skin.skinImage }}
                      style={styles.skinImg}
                      contentFit="contain"
                    />
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.skillTitle}>Skills:</Text>
        {item.skills.map((skill, i) => (
          <View key={i} style={styles.skillItem}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <Text style={styles.skillDesc}>{skill.description}</Text>
            <Text style={styles.skillPower}>Power: {skill.power}</Text>
          </View>
        ))}

        {!isActive ? (
          <>
            <ActionButton
              style={styles.activateButton}
              label="Als Klasse aktivieren"
              onPress={() => setActiveClassId(item.id)}
              textStyle={styles.activateText}
            />
            <ActionButton
              style={styles.deleteButton}
              label="Löschen"
              onPress={() =>
                Alert.alert(
                  "Charakter löschen?",
                  `${item.name} wirklich dauerhaft entfernen?`,
                  [
                    { text: "Abbrechen", style: "cancel" },
                    {
                      text: "Löschen",
                      style: "destructive",
                      onPress: () => deleteClass(item.id),
                    },
                  ]
                )
              }
              textStyle={styles.deleteText}
            />
          </>
        ) : (
          <Text style={styles.activeLabel}>🎖️ Aktive Klasse</Text>
        )}
      </LinearGradient>
    );
  };

  return (
    <ScreenLayout style={styles.container}>
      <FlatList
        data={classList}
        renderItem={renderCharacter}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
    </ScreenLayout>
  );
}

// --- Helper Buttons ---
function SkinButton({ active, onPress, icon, label }) {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.skinBtn, active && styles.skinBtnActive]}
      activeOpacity={0.84}
    >
      {icon}
      <Text style={[styles.skinLabel, active && styles.skinLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ActionButton({ style, label, onPress, textStyle }) {
  return (
    <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.84}>
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
}

// --- Styles ---
function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    grid: {
      paddingHorizontal: 8,
      paddingBottom: 32,
    },
    card: {
      width: CARD_WIDTH,
      minHeight: 340,
      borderRadius: 19,
      padding: 15,
      margin: 7,
      alignItems: "center",
      borderWidth: 2.5,
      borderColor: theme.shadowColor,
      justifyContent: "flex-start",
      elevation: 8,
      shadowColor: theme.glowColor,
      shadowRadius: 17,
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 5 },
    },
    cardActive: {
      borderColor: theme.borderGlowColor || "gold",
      shadowColor: theme.borderGlowColor,
      shadowOpacity: 0.31,
      shadowRadius: 21,
      elevation: 16,
    },
    avatar: {
      width: 86,
      height: 86,
      borderRadius: 44,
      marginBottom: 10,
      backgroundColor: theme.shadowColor,
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      elevation: 6,
    },
    name: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 2,
      color: theme.textColor,
      textAlign: "center",
      letterSpacing: 0.3,
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    level: {
      fontSize: 15,
      color: theme.textColor,
      marginBottom: 2,
      fontWeight: "700",
      opacity: 0.96,
      letterSpacing: 0.08,
    },
    elementTag: {
      alignSelf: "center",
      backgroundColor: theme.accentColorSecondary + "22",
      paddingHorizontal: 9,
      paddingVertical: 2,
      borderRadius: 9,
      marginBottom: 3,
      marginTop: 1,
      minWidth: 70,
    },
    element: {
      fontSize: 13,
      fontWeight: "bold",
      letterSpacing: 0.14,
      textAlign: "center",
      textShadowColor: theme.glowColor,
      textShadowRadius: 5,
    },
    classText: {
      fontSize: 13,
      color: theme.textColor + "99",
      marginBottom: 7,
      fontWeight: "bold",
      letterSpacing: 0.12,
    },
    skinsWrapper: {
      marginBottom: 7,
      marginTop: 3,
      alignSelf: "stretch",
    },
    skinsTitle: {
      color: theme.textColor,
      marginBottom: 2,
      fontWeight: "bold",
      fontSize: 13,
      marginLeft: 2,
    },
    skinsScrollView: {
      alignItems: "center",
      paddingRight: 16,
      minHeight: 52,
      paddingVertical: 2,
    },
    skinsScrollStyle: {
      maxWidth: "100%",
      marginTop: 2,
      marginBottom: 7,
    },
    skinBtn: {
      borderWidth: 1.3,
      borderColor: "#555",
      borderRadius: 10,
      margin: 4,
      padding: 3,
      backgroundColor: "#232323",
      justifyContent: "center",
      alignItems: "center",
      width: 50,
      minHeight: 50,
    },
    skinBtnActive: {
      borderWidth: 2.5,
      borderColor: theme.borderGlowColor || "gold",
      backgroundColor: theme.shadowColor,
    },
    skinImg: {
      width: 36,
      height: 36,
      borderRadius: 7,
      marginBottom: 1,
      backgroundColor: theme.shadowColor,
    },
    skinLabel: {
      fontSize: 10,
      textAlign: "center",
      color: theme.textColor,
      marginTop: -2,
      fontWeight: "600",
    },
    skinLabelActive: {
      color: theme.borderGlowColor || "gold",
      fontWeight: "bold",
    },
    skillTitle: {
      fontSize: 15,
      fontWeight: "bold",
      color: theme.textColor,
      marginTop: 6,
      marginBottom: 1,
      alignSelf: "flex-start",
    },
    skillItem: {
      marginBottom: 6,
      alignSelf: "flex-start",
      backgroundColor: theme.shadowColor + "bb",
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
      marginTop: 2,
    },
    skillName: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.borderGlowColor,
      marginBottom: 1,
    },
    skillDesc: {
      fontSize: 11,
      color: theme.textColor,
      marginBottom: 1,
    },
    skillPower: {
      fontSize: 11,
      color: theme.accentColorSecondary,
      fontWeight: "bold",
    },
    activateButton: {
      marginTop: 10,
      borderRadius: 12,
      overflow: "hidden",
      alignSelf: "stretch",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      backgroundColor: theme.accentColor,
      elevation: 3,
      shadowColor: theme.glowColor,
      shadowRadius: 8,
      shadowOpacity: 0.14,
    },
    activateText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 15,
      letterSpacing: 0.14,
      paddingVertical: 8,
    },
    deleteButton: {
      marginTop: 8,
      backgroundColor: "#1a1a1a",
      borderColor: "#c00",
      borderWidth: 1.2,
      borderRadius: 12,
      paddingVertical: 8,
      alignSelf: "stretch",
      alignItems: "center",
      elevation: 2,
      shadowColor: "#c00",
      shadowRadius: 8,
      shadowOpacity: 0.07,
    },
    deleteText: {
      color: "#FF5252",
      fontWeight: "bold",
      fontSize: 13.5,
      letterSpacing: 0.09,
    },
    activeLabel: {
      marginTop: 11,
      color: theme.borderGlowColor,
      fontWeight: "bold",
      fontSize: 15.5,
      letterSpacing: 0.18,
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: theme.accentColor + "88",
      textAlign: "center",
      overflow: "hidden",
      alignSelf: "center",
    },
    exclusiveBadge: {
      position: "absolute",
      top: 11,
      left: 12,
      backgroundColor: "#FFD700",
      borderRadius: 9,
      paddingHorizontal: 8,
      paddingVertical: 2,
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.16,
      shadowRadius: 3,
    },
    exclusiveBadgeText: {
      fontWeight: "bold",
      fontSize: 12,
      color: "#111",
      letterSpacing: 0.15,
      marginLeft: 2,
    },
  });
}
