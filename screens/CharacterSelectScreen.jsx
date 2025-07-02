import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import elementData from "../data/elementData.json";
import { useClass } from "../context/ClassContext";
import { useThemeContext } from "../context/ThemeContext";

export default function CharacterSelectScreen() {
  const navigation = useNavigation();
  const { classList, activeClassId, setActiveClassId } = useClass();
  const { theme } = useThemeContext();
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
      <Text style={styles.title}>Wähle deinen Kämpfer</Text>
      <FlatList
        data={fullCharacterList}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) =>
          item ? (
            <TouchableOpacity
              style={[
                styles.card,
                selectedId === item.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedId(item.id)}
            >
              <Image
                source={{ uri: item.classUrl }}
                style={styles.avatar}
                contentFit="contain"
              />
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.level}>Level {item.level}</Text>
              <Text style={styles.element}>
                {elementData[item.element]?.icon}{" "}
                {elementData[item.element]?.label}
              </Text>
              <Text style={styles.classText}>{item.type}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.emptySlot}
              onPress={() => navigation.navigate("CreateCharacterScreen")}
            >
              <Text style={styles.emptyText}>+ Charakter erstellen</Text>
            </TouchableOpacity>
          )
        }
      />
      {selectedId && (
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startText}>Starten</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function createStyles(theme) {
  const accent = theme.accentColor;
  const text = theme.textColor;
  const shadow = theme.shadowColor;

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 22,
      paddingHorizontal: 14,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: text,
      marginBottom: 18,
      textAlign: "center",
      letterSpacing: 0.4,
      textShadowColor: shadow,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 5,
    },
    list: {
      paddingBottom: 30,
    },
    card: {
      backgroundColor: accent,
      borderRadius: 17,
      padding: 18,
      marginBottom: 18,
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },
    selectedCard: {
      borderColor: text,
    },
    avatar: {
      width: 160,
      height: 160,
      borderRadius: 14,
      marginBottom: 10,
      backgroundColor: accent,
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
      color: text,
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
    emptySlot: {
      backgroundColor: accent,
      borderRadius: 15,
      paddingVertical: 42,
      paddingHorizontal: 12,
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 1.5,
      borderColor: accent,
      opacity: 0.7,
    },
    emptyText: {
      color: text,
      fontSize: 16,
      fontWeight: "bold",
      letterSpacing: 0.16,
      opacity: 0.8,
    },
    startButton: {
      backgroundColor: accent,
      borderRadius: 20,
      paddingVertical: 16,
      marginTop: 10,
      marginBottom: 12,
      alignSelf: "center",
      width: "80%",
      alignItems: "center",
      borderWidth: 2,
      borderColor: text,
    },
    startText: {
      color: text,
      fontSize: 21,
      fontWeight: "bold",
      letterSpacing: 0.2,
    },
  });
}
