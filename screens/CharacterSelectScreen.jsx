import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import elementData from "../data/elementData.json";
import { useClass } from "../context/ClassContext";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import { LinearGradient } from "expo-linear-gradient";

const SLOT_WIDTH = Math.round(Dimensions.get("window").width * 0.93);

export default function CharacterSelectScreen() {
  const navigation = useNavigation();
  const { classList, activeClassId, setActiveClassId } = useClass();
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const styles = createStyles(theme);

  const [selectedId, setSelectedId] = useState(activeClassId);
  const maxSlots = 15;
  const fullCharacterList = [
    ...classList,
    ...Array(Math.max(maxSlots - classList.length, 0)).fill(null),
  ];

  const handleStart = () => {
    const selectedCharacter = classList.find((c) => c.id === selectedId);
    if (selectedCharacter) {
      setActiveClassId(selectedId);
      navigation.navigate("TutorialStartScreen");
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader theme={theme} />
      <FlatList
        data={fullCharacterList}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) =>
          item ? (
            <CharacterCard
              item={item}
              isSelected={selectedId === item.id}
              onPress={() => setSelectedId(item.id)}
              imageMap={imageMap}
              theme={theme}
            />
          ) : (
            <EmptySlot
              onPress={() => navigation.navigate("CreateCharacterScreen")}
              theme={theme}
            />
          )
        }
      />
      <StartButton visible={!!selectedId} onPress={handleStart} theme={theme} />
    </View>
  );
}

// ---------- Mini-Komponenten ----------

function GradientHeader({ theme }) {
  const styles = createStyles(theme);
  return (
    <LinearGradient
      colors={[
        theme.accentColorSecondary,
        theme.accentColor,
        theme.accentColorDark,
      ]}
      start={[0.1, 0]}
      end={[1, 1]}
      style={styles.headerGradient}
    >
      <Text style={styles.title}>Wähle deinen Kämpfer</Text>
    </LinearGradient>
  );
}

function CharacterCard({ item, isSelected, onPress, imageMap, theme }) {
  const styles = createStyles(theme);
  const element = elementData[item.element] || {};
  return (
    <TouchableOpacity
      style={[styles.cardOuter, isSelected && styles.selectedCardOuter]}
      onPress={onPress}
      activeOpacity={0.87}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <LinearGradient
        colors={[
          theme.accentColorSecondary,
          theme.accentColor,
          theme.accentColorDark,
        ]}
        start={[0.05, 0]}
        end={[1, 1]}
        style={styles.card}
      >
        <Image
          source={imageMap[`class_${item.baseId}`] || { uri: item.classUrl }}
          style={styles.avatar}
          contentFit="contain"
          transition={300}
        />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.level}>Level {item.level}</Text>
        <Text style={styles.element}>
          {element.icon ? element.icon + " " : ""}
          {element.label || "Element"}
        </Text>
        <Text style={styles.classText}>{item.type}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function EmptySlot({ theme, onPress }) {
  const styles = createStyles(theme);
  return (
    <TouchableOpacity
      style={styles.emptySlotOuter}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel="Neuen Charakter erstellen"
    >
      <LinearGradient
        colors={[
          theme.shadowColor,
          theme.accentColor,
          theme.accentColorSecondary,
        ]}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.emptySlot}
      >
        <Text style={styles.emptyText}>+ Charakter erstellen</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function StartButton({ visible, onPress, theme }) {
  const styles = createStyles(theme);
  if (!visible) return null;
  return (
    <TouchableOpacity
      style={styles.startButton}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={[
          theme.accentColorSecondary,
          theme.accentColor,
          theme.accentColorDark,
        ]}
        start={[0.1, 0]}
        end={[1, 1]}
        style={styles.startButtonInner}
      >
        <Text style={styles.startText}>Starten</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ---------- Styles ----------
function createStyles(theme) {
  const accent = theme.accentColor;
  const text = theme.textColor;
  const shadow = theme.shadowColor;
  const highlight = theme.borderGlowColor;
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 22,
      paddingHorizontal: 14,
      backgroundColor: theme.background || accent,
    },
    headerGradient: {
      borderRadius: 16,
      marginBottom: 15,
      alignSelf: "center",
      width: "90%",
      paddingVertical: 13,
      paddingHorizontal: 10,
      shadowColor: theme.glowColor,
      shadowRadius: 13,
      shadowOpacity: 0.34,
      shadowOffset: { width: 0, height: 5 },
      elevation: 7,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: text,
      textAlign: "center",
      letterSpacing: 0.7,
    },
    list: {
      paddingBottom: 30,
    },
    cardOuter: {
      borderRadius: 20,
      marginBottom: 18,
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
      shadowColor: theme.glowColor,
      shadowRadius: 9,
      shadowOpacity: 0.11,
      elevation: 3,
      width: SLOT_WIDTH,
      alignSelf: "center",
    },
    selectedCardOuter: {
      borderColor: highlight,
      shadowOpacity: 0.22,
      elevation: 5,
    },
    card: {
      borderRadius: 17,
      padding: 18,
      alignItems: "center",
      width: "100%",
    },
    avatar: {
      width: 160,
      height: 160,
      borderRadius: 14,
      marginBottom: 10,
      shadowRadius: 8,
      backgroundColor: shadow,
    },
    name: {
      fontSize: 19,
      fontWeight: "bold",
      color: text,
      marginBottom: 2,
      textAlign: "center",
      letterSpacing: 0.17,
      textShadowColor: theme.glowColor,
      textShadowRadius: 6,
    },
    level: {
      fontSize: 15,
      color: highlight,
      fontWeight: "700",
      marginBottom: 2,
      textShadowColor: theme.glowColor,
      textShadowRadius: 5,
    },
    element: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
      letterSpacing: 0.1,
      color: text,
      textShadowColor: theme.glowColor,
      textShadowRadius: 3,
    },
    classText: {
      fontSize: 13,
      color: text + "99",
      marginBottom: 2,
      fontWeight: "bold",
      letterSpacing: 0.12,
    },
    emptySlotOuter: {
      borderRadius: 15,
      marginBottom: 16,
      borderWidth: 1.5,
      borderColor: highlight,
      opacity: 0.93,
      shadowColor: theme.glowColor,
      shadowRadius: 7,
      shadowOpacity: 0.09,
      elevation: 2,
      width: SLOT_WIDTH,
      alignSelf: "center",
    },
    emptySlot: {
      borderRadius: 15,
      paddingVertical: 42,
      paddingHorizontal: 12,
      alignItems: "center",
      backgroundColor: accent,
      justifyContent: "center",
      width: "100%",
    },
    emptyText: {
      color: text,
      fontSize: 16,
      fontWeight: "bold",
      letterSpacing: 0.16,
      opacity: 0.82,
      textShadowColor: theme.glowColor,
      textShadowRadius: 4,
    },
    startButton: {
      marginTop: 10,
      marginBottom: 15,
      alignSelf: "center",
      width: "81%",
      borderRadius: 21,
      overflow: "hidden",
      shadowColor: theme.glowColor,
      shadowRadius: 14,
      shadowOpacity: 0.17,
      elevation: 6,
      borderWidth: 2,
      borderColor: highlight,
    },
    startButtonInner: {
      borderRadius: 21,
      paddingVertical: 16,
      alignItems: "center",
      width: "100%",
      justifyContent: "center",
    },
    startText: {
      color: text,
      fontSize: 21,
      fontWeight: "bold",
      letterSpacing: 0.2,
      textShadowColor: theme.glowColor,
      textShadowRadius: 7,
    },
  });
}
