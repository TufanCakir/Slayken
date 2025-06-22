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

export default function CreateCharacterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");

  const { setActiveClassId, updateCharacter } = useClass();

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
      classUrl: getClassImageUrl(selectedClass.id), // 🟢 Bild-URL explizit setzen
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
            style={[styles.input, {}]}
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
            data={classes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.classList}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => finishCreation(item)}
                style={[styles.classCard, {}]}
              >
                <View style={styles.classRow}>
                  <Image
                    source={{ uri: getClassImageUrl(item.id) }}
                    style={styles.avatar}
                    contentFit="contain"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionTitle]}>{item.label}</Text>
                    <Text style={[styles.optionDescription]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#60a5fa",
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: 0.3,
    textShadowColor: "#1e3a8a",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  input: {
    backgroundColor: "#1e293b",
    borderColor: "#2563eb",
    borderWidth: 2,
    borderRadius: 14,
    fontSize: 18,
    color: "#f0f9ff",
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  nextButton: {
    backgroundColor: "#2563eb",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#38bdf8",
    opacity: 1,
  },
  buttonText: {
    color: "#f0f9ff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.15,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nextButtonDisabled: {
    backgroundColor: "#334155",
    borderColor: "#64748b",
    opacity: 0.7,
  },
  classList: {
    paddingVertical: 10,
  },
  classCard: {
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 15,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#2563eb",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 9,
    elevation: 6,
  },
  classCardActive: {
    backgroundColor: "#2563eb",
    borderColor: "#38bdf8",
    shadowColor: "#38bdf8",
    shadowOpacity: 0.25,
  },
  classRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#334155",
    borderWidth: 2,
    borderColor: "#60a5fa",
    marginRight: 14,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 2,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: "#c7dfff",
    marginBottom: 4,
  },
  elementLabel: {
    fontSize: 13,
    color: "#7dd3fc",
    fontWeight: "bold",
    backgroundColor: "#0ea5e9",
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
    left: 22,
    bottom: 22,
    backgroundColor: "#1e293b",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#2563eb",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.11,
    shadowRadius: 6,
    elevation: 4,
  },
  backText: {
    color: "#38bdf8",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.12,
    textAlign: "center",
  },
});
