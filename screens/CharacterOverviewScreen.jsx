import React, { useEffect, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import elementData from "../data/elementData.json";
import skinData from "../data/skinData.json";
import ScreenLayout from "../components/ScreenLayout";
import { useClass } from "../context/ClassContext";
import { useThemeContext } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CARD_WIDTH = Dimensions.get("window").width / 2 - 24;

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

  const [ownedSkins, setOwnedSkins] = useState({});
  useEffect(() => {
    (async () => {
      const all = await AsyncStorage.getAllKeys();
      const mySkins = all
        .filter((k) => k.startsWith("unlock_skin_"))
        .map((k) => k.replace("unlock_skin_", ""));
      const dict = {};
      mySkins.forEach((id) => (dict[id] = true));
      setOwnedSkins(dict);
    })();
  }, []);

  const handleEquipSkin = async (char, skinId) => {
    await updateCharacter({ ...char, activeSkin: skinId });
  };

  const renderCharacter = ({ item }) => {
    const isActive = item.id === activeClassId;
    const element = elementData[item.element] || {};
    const availableSkins = skinData
      .filter(
        (skin) =>
          skin.characterId === (item.baseId || item.id) ||
          skin.characterId === item.id ||
          skin.characterId === item.name
      )
      .filter((skin) => ownedSkins[skin.id]);
    const currentSkin = availableSkins.find((s) => s.id === item.activeSkin);
    const avatarSrc = currentSkin?.image || item.classUrl;

    return (
      <View style={[styles.card, isActive && styles.cardActive]}>
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
        <Text style={[styles.element, { color: element.color }]}>
          {element.icon} {element.label}
        </Text>
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
                  label={skin.label}
                  icon={
                    <Image
                      source={{ uri: skin.image }}
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
      </View>
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

// --- Helper Buttons (keine Duplikate im Render!) ---
function SkinButton({ active, onPress, icon, label }) {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.skinBtn, active && styles.skinBtnActive]}
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
    <TouchableOpacity style={style} onPress={onPress}>
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    grid: {
      paddingHorizontal: 12,
      paddingBottom: 32,
    },
    card: {
      width: CARD_WIDTH,
      minHeight: 320,
      backgroundColor: theme.accentColor,
      borderRadius: 18,
      padding: 14,
      margin: 6,
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
      justifyContent: "flex-start",
    },
    cardActive: {
      borderColor: theme.textColor,
    },
    avatar: {
      width: 82,
      height: 82,
      borderRadius: 41,
      marginBottom: 10,
      backgroundColor: theme.shadowColor,
      borderWidth: 2,
      borderColor: theme.textColor,
    },
    name: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 2,
      color: theme.textColor,
      textAlign: "center",
      letterSpacing: 0.2,
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    level: {
      fontSize: 15,
      color: theme.textColor,
      marginBottom: 3,
      fontWeight: "700",
      opacity: 0.9,
    },
    element: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
      letterSpacing: 0.1,
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    classText: {
      fontSize: 13,
      color: theme.textColor + "99",
      marginBottom: 6,
      fontWeight: "bold",
      letterSpacing: 0.12,
    },
    skinsWrapper: {
      marginBottom: 8,
      marginTop: 2,
      alignSelf: "stretch",
    },
    skinsTitle: {
      color: theme.textColor,
      marginBottom: 3,
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
      marginTop: 3,
      marginBottom: 9,
    },
    skinBtn: {
      borderWidth: 1,
      borderColor: "#555",
      borderRadius: 10,
      margin: 4,
      padding: 2,
      backgroundColor: "#333",
      justifyContent: "center",
      alignItems: "center",
      width: 48,
      minHeight: 48,
    },
    skinBtnActive: {
      borderWidth: 2,
      borderColor: theme.borderGlowColor || "gold",
      backgroundColor: theme.shadowColor,
    },
    skinImg: {
      width: 36,
      height: 36,
      borderRadius: 7,
      marginBottom: 1,
    },
    skinLabel: {
      fontSize: 10,
      textAlign: "center",
      color: theme.textColor,
      marginTop: -2,
    },
    skinLabelActive: {
      color: theme.borderGlowColor || "gold",
      fontWeight: "bold",
    },
    skillTitle: {
      fontSize: 15,
      fontWeight: "bold",
      color: theme.textColor,
      marginTop: 8,
      marginBottom: 2,
      alignSelf: "flex-start",
    },
    skillItem: {
      marginBottom: 6,
      alignSelf: "flex-start",
      backgroundColor: theme.shadowColor,
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    skillName: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.textColor,
      marginBottom: 1,
    },
    skillDesc: {
      fontSize: 11,
      color: theme.textColor,
      marginBottom: 1,
    },
    skillPower: {
      fontSize: 11,
      color: theme.textColor,
      fontWeight: "bold",
    },
    activateButton: {
      marginTop: 8,
      borderRadius: 9,
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderWidth: 1.5,
      borderColor: theme.textColor,
      alignSelf: "stretch",
      alignItems: "center",
    },
    activateText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 14,
      letterSpacing: 0.14,
    },
    deleteButton: {
      marginTop: 6,
      backgroundColor: theme.accentColor,
      borderColor: theme.shadowColor,
      borderWidth: 1.2,
      borderRadius: 9,
      paddingVertical: 5,
      paddingHorizontal: 16,
      alignSelf: "stretch",
      alignItems: "center",
    },
    deleteText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 13,
      letterSpacing: 0.1,
    },
    activeLabel: {
      marginTop: 10,
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 15,
      letterSpacing: 0.15,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 8,
      textAlign: "center",
    },
    exclusiveBadge: {
      position: "absolute",
      top: 10,
      left: 10,
      backgroundColor: "#FFD700",
      borderRadius: 9,
      paddingHorizontal: 8,
      paddingVertical: 2,
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
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
