import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import classes from "../data/classData.json";
import elementData from "../data/elementData.json";
import { useClass } from "../context/ClassContext";
import { getClassImageUrl } from "../utils/classUtils";
import { useThemeContext } from "../context/ThemeContext";

export default function CreateCharacterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");

  const { theme } = useThemeContext();
  const { setActiveClassId, updateCharacter } = useClass();
  const styles = createStyles(theme);

  const goToNext = () => setStep(2);

  const finishCreation = async (selectedClass) => {
    const newChar = {
      ...selectedClass,
      baseId: selectedClass.id,
      id: `${selectedClass.id}-${Date.now()}`,
      label: name,
      name: name,
      level: 1,
      exp: 0,
      skills: selectedClass.skills ?? [],
      classUrl: getClassImageUrl(selectedClass.id),
    };

    await updateCharacter(newChar);
    await setActiveClassId(newChar.id);
    navigation.replace("CharacterSelectScreen");
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <>
          <Text style={styles.title}>Wie soll dein Held heißen?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name eingeben"
            placeholderTextColor={theme.textColor + "99"}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={goToNext}
            style={[styles.nextButton, !name && styles.nextButtonDisabled]}
            disabled={!name}
          >
            <Text style={styles.buttonText}>Weiter</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Wähle eine Klasse</Text>
          <FlatList
            data={classes.filter((cls) => !cls.eventReward)} // nur nicht-eventReward!
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.classList}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => finishCreation(item)}
                style={styles.classCard}
              >
                <View style={styles.classRow}>
                  <Image
                    source={{ uri: getClassImageUrl(item.id) }}
                    style={styles.avatar}
                    contentFit="contain"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>{item.label}</Text>
                    <Text style={styles.optionDescription}>
                      {item.description}
                    </Text>
                    <Text style={styles.elementLabel}>
                      {elementData[item.element]?.icon}{" "}
                      {elementData[item.element]?.label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <TouchableOpacity
        onPress={() => (step === 1 ? navigation.goBack() : setStep(1))}
        style={styles.backButton}
      >
        <Text style={styles.backText}>Zurück</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 25,
      fontWeight: "bold",
      color: theme.textColor,
      marginBottom: 18,
      textAlign: "center",
      letterSpacing: 0.3,
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 5,
    },
    input: {
      backgroundColor: theme.accentColor,
      fontSize: 18,
      color: theme.textColor,
      paddingVertical: 12,
      paddingHorizontal: 18,
      marginBottom: 20,
      marginTop: 10,
    },
    nextButton: {
      backgroundColor: theme.textColor,
      borderRadius: 15,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 6,
    },
    buttonText: {
      color: theme.accentColor,
      fontWeight: "bold",
      fontSize: 18,
      letterSpacing: 0.15,
    },
    nextButtonDisabled: {
      backgroundColor: theme.accentColor,
      borderColor: theme.accentColor,
      opacity: 0.7,
    },
    classList: {
      paddingVertical: 10,
    },
    classCard: {
      backgroundColor: theme.accentColor,
      borderRadius: 14,
      padding: 15,
      marginBottom: 16,
    },
    classRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 28,
      marginRight: 14,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.textColor,
      marginBottom: 2,
    },
    optionDescription: {
      fontSize: 13,
      color: "#c7dfff",
      marginBottom: 4,
    },
    elementLabel: {
      fontSize: 13,
      color: theme.textColor,
      backgroundColor: theme.accentColor,
      alignSelf: "flex-start",
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 7,
      marginTop: 2,
      marginBottom: 1,
      overflow: "hidden",
    },
    backButton: {
      position: "absolute",
      backgroundColor: theme.shadowColor,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 14,
      left: 5,
    },
    backText: {
      color: theme.textColor,
      fontSize: 16,
      letterSpacing: 0.12,
      textAlign: "center",
    },
  });
}
