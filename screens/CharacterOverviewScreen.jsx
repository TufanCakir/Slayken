import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
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

const Badge = React.memo(function Badge({ icon, text }) {
  return (
    <View style={badgeStyles.badge}>
      <MaterialCommunityIcons name={icon} size={14} color="#111" />
      <Text style={badgeStyles.text}>{text}</Text>
    </View>
  );
});

const SkinButton = React.memo(function SkinButton({
  active,
  onPress,
  icon,
  label,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[skinButtonStyles.btn, active && skinButtonStyles.btnActive]}
      activeOpacity={0.85}
    >
      {icon}
      <Text
        style={[skinButtonStyles.label, active && skinButtonStyles.labelActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const SkinsRow = React.memo(function SkinsRow({
  availableSkins = [],
  activeSkin,
  onEquipSkin,
  theme,
}) {
  if (availableSkins.length === 0) return null;
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
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
          active={!activeSkin}
          onPress={() => onEquipSkin(undefined)}
          label="Standard"
          icon={
            <MaterialCommunityIcons
              name="account"
              size={24}
              color={
                !activeSkin ? theme.borderGlowColor || "gold" : theme.textColor
              }
            />
          }
        />
        {availableSkins.map((skin) => (
          <SkinButton
            key={skin.id}
            active={skin.id === activeSkin}
            onPress={() => onEquipSkin(skin.id)}
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
  );
});

const SkillInfo = React.memo(function SkillInfo({ skill, theme }) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.skillItem}>
      <Text style={styles.skillName}>{skill.name}</Text>
      <Text style={styles.skillDesc}>{skill.description}</Text>
      <Text style={styles.skillPower}>Power: {skill.power}</Text>
    </View>
  );
});

const ActionButton = React.memo(function ActionButton({
  label,
  onPress,
  style,
  textStyle,
  testID,
}) {
  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      activeOpacity={0.84}
      testID={testID}
    >
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
});

// ---------- Hauptscreen mit memoisiertem RenderItem ----------

function CharacterOverviewScreen() {
  const {
    classList,
    activeClassId,
    setActiveClassId,
    deleteClass,
    updateCharacter,
  } = useClass();
  const { theme } = useThemeContext();
  const { isUnlocked } = useShop();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Memoize helper so FlatList nicht bei jedem Render alles neu erstellt
  const getUnlockedSkinsForChar = useCallback(
    (item) => {
      const charId = item.baseId || item.id;
      return SHOP_ITEMS.filter(
        (skin) =>
          skin.category?.toLowerCase().includes("skin") &&
          skin.characterId === charId &&
          isUnlocked(skin)
      );
    },
    [isUnlocked]
  );

  const handleEquipSkin = useCallback(
    async (char, skinId) => {
      await updateCharacter({ ...char, activeSkin: skinId });
    },
    [updateCharacter]
  );

  const renderCharacter = useCallback(
    ({ item }) => {
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
          {item.eventReward && <Badge icon="crown" text="Exklusiv" />}
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
          <SkinsRow
            availableSkins={availableSkins}
            activeSkin={item.activeSkin}
            onEquipSkin={(skinId) => handleEquipSkin(item, skinId)}
            theme={theme}
          />
          <Text style={styles.skillTitle}>Skills:</Text>
          {item.skills.map((skill, i) => (
            <SkillInfo key={i} skill={skill} theme={theme} />
          ))}
          {!isActive ? (
            <>
              <ActionButton
                label="Als Klasse aktivieren"
                onPress={() => setActiveClassId(item.id)}
                style={styles.buttonPrimary}
                textStyle={styles.buttonTextPrimary}
                testID="activate-class"
              />
              <ActionButton
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
                style={styles.buttonDanger}
                textStyle={styles.buttonTextDanger}
                testID="delete-class"
              />
            </>
          ) : (
            <Text style={styles.activeLabel}>🎖️ Aktive Klasse</Text>
          )}
        </LinearGradient>
      );
    },
    [
      styles,
      activeClassId,
      setActiveClassId,
      deleteClass,
      getUnlockedSkinsForChar,
      handleEquipSkin,
      theme,
    ]
  );

  return (
    <ScreenLayout style={styles.container}>
      <FlatList
        data={classList}
        renderItem={renderCharacter}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <Text style={styles.empty}>Keine Charaktere vorhanden.</Text>
        }
      />
    </ScreenLayout>
  );
}

export default React.memo(CharacterOverviewScreen);

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
      // shadows entfernt!
      backgroundColor: theme.accentColor + "10",
    },
    cardActive: {
      borderColor: theme.borderGlowColor || "gold",
      // shadows entfernt!
    },
    avatar: {
      width: 86,
      height: 86,
      borderRadius: 44,
      marginBottom: 10,
      backgroundColor: theme.shadowColor,
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
    },
    name: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 2,
      color: theme.textColor,
      textAlign: "center",
      letterSpacing: 0.3,
    },
    level: {
      fontSize: 15,
      color: theme.textColor,
      marginBottom: 2,
      fontWeight: "700",
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
      color: theme.glowColor,
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
    skinImg: {
      width: 36,
      height: 36,
      borderRadius: 7,
      marginBottom: 1,
      backgroundColor: theme.shadowColor,
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
    buttonPrimary: {
      marginTop: 10,
      borderRadius: 12,
      alignSelf: "stretch",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      backgroundColor: theme.accentColor,
    },
    buttonTextPrimary: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 15,
      letterSpacing: 0.14,
      paddingVertical: 8,
    },
    buttonDanger: {
      marginTop: 8,
      backgroundColor: "#1a1a1a",
      borderColor: "#c00",
      borderWidth: 1.2,
      borderRadius: 12,
      paddingVertical: 8,
      alignSelf: "stretch",
      alignItems: "center",
    },
    buttonTextDanger: {
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
      backgroundColor: theme.accentColor + "44",
      textAlign: "center",
      alignSelf: "center",
    },
    empty: {
      color: theme.textColor + "99",
      fontSize: 16,
      textAlign: "center",
      marginTop: 32,
      fontStyle: "italic",
    },
  });
}

// Badge Styles – Shadows entfernt
const badgeStyles = StyleSheet.create({
  badge: {
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
  },
  text: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#111",
    letterSpacing: 0.15,
    marginLeft: 2,
  },
});

// SkinButton Styles – Shadows entfernt
const skinButtonStyles = StyleSheet.create({
  btn: {
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
  btnActive: {
    borderWidth: 2.5,
    borderColor: "#FFD700",
    backgroundColor: "#18181b",
  },
  label: {
    fontSize: 10,
    textAlign: "center",
    color: "#fff",
    marginTop: -2,
    fontWeight: "600",
  },
  labelActive: {
    color: "#FFD700",
    fontWeight: "bold",
  },
});
