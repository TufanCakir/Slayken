import React, { useState, useMemo, useCallback } from "react";
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

// --- Memo-Komponenten ---
const GradientHeader = React.memo(function GradientHeader({ theme }) {
  const styles = useMemo(() => createStyles(theme), [theme]);
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
});

const CharacterCard = React.memo(function CharacterCard({
  item,
  isSelected,
  onPress,
  imageMap,
  theme,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);
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
});

const EmptySlot = React.memo(function EmptySlot({ theme, onPress }) {
  const styles = useMemo(() => createStyles(theme), [theme]);
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
});

const StartButton = React.memo(function StartButton({
  visible,
  onPress,
  theme,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);
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
});

// --- Hauptscreen ---
function CharacterSelectScreen() {
  const navigation = useNavigation();
  const { classList, activeClassId, setActiveClassId } = useClass();
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedId, setSelectedId] = useState(activeClassId);
  const maxSlots = 15;

  // Memoize Liste für FlatList
  const fullCharacterList = useMemo(
    () => [
      ...classList,
      ...Array(Math.max(maxSlots - classList.length, 0)).fill(null),
    ],
    [classList]
  );

  const handleStart = useCallback(() => {
    const selectedCharacter = classList.find((c) => c.id === selectedId);
    if (selectedCharacter) {
      setActiveClassId(selectedId);
      navigation.navigate("TutorialStartScreen");
    }
  }, [selectedId, classList, setActiveClassId, navigation]);

  const handleCreate = useCallback(() => {
    navigation.navigate("CreateCharacterScreen");
  }, [navigation]);

  // Memoisiertes renderItem
  const renderItem = useCallback(
    ({ item }) =>
      item ? (
        <CharacterCard
          item={item}
          isSelected={selectedId === item.id}
          onPress={() => setSelectedId(item.id)}
          imageMap={imageMap}
          theme={theme}
        />
      ) : (
        <EmptySlot onPress={handleCreate} theme={theme} />
      ),
    [selectedId, imageMap, theme, handleCreate]
  );

  return (
    <View style={styles.container}>
      <GradientHeader theme={theme} />
      <FlatList
        data={fullCharacterList}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
      />
      <StartButton visible={!!selectedId} onPress={handleStart} theme={theme} />
    </View>
  );
}

export default React.memo(CharacterSelectScreen);

// --- Styles ---
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
      width: SLOT_WIDTH,
      alignSelf: "center",
    },
    selectedCardOuter: {
      borderColor: highlight,
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
      backgroundColor: shadow,
    },
    name: {
      fontSize: 19,
      fontWeight: "bold",
      color: text,
      marginBottom: 2,
      textAlign: "center",
      letterSpacing: 0.17,
    },
    level: {
      fontSize: 15,
      color: highlight,
      fontWeight: "700",
      marginBottom: 2,
    },
    element: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
      letterSpacing: 0.1,
      color: text,
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
    },
    startButton: {
      marginTop: 10,
      marginBottom: 15,
      alignSelf: "center",
      width: "81%",
      borderRadius: 21,
      overflow: "hidden",
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
    },
  });
}
