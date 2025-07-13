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
import { useAssets } from "../context/AssetsContext";
import { LinearGradient } from "expo-linear-gradient";

export default function CreateCharacterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const { theme } = useThemeContext();
  const { setActiveClassId, updateCharacter } = useClass();
  const { imageMap } = useAssets();
  const styles = createStyles(theme);

  const goToNext = () => setStep(2);

  const finishCreation = async (selectedClass) => {
    const newChar = {
      ...selectedClass,
      baseId: selectedClass.id,
      id: `${selectedClass.id}-${Date.now()}`,
      label: name,
      name,
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
      {step === 1 ? (
        <NameStep
          name={name}
          setName={setName}
          onNext={goToNext}
          theme={theme}
        />
      ) : (
        <ClassSelectStep
          name={name}
          classes={classes}
          imageMap={imageMap}
          onSelect={finishCreation}
          theme={theme}
        />
      )}
      <BackButton
        onPress={() => (step === 1 ? navigation.goBack() : setStep(1))}
        label="Zurück"
        theme={theme}
      />
    </View>
  );
}

// ---------- Step-Komponenten ----------

function NameStep({ name, setName, onNext, theme }) {
  const styles = createStyles(theme);
  return (
    <>
      <GradientHeader theme={theme} title="Wie soll dein Held heißen?" />
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name eingeben"
        placeholderTextColor={theme.textColor + "99"}
        style={styles.input}
        maxLength={20}
        autoFocus
        returnKeyType="done"
      />
      <NextButton
        onPress={onNext}
        disabled={!name}
        theme={theme}
        label="Weiter"
      />
    </>
  );
}

function ClassSelectStep({ classes, imageMap, onSelect, theme }) {
  const styles = createStyles(theme);

  const filteredClasses = (classes ?? []).filter((cls) => !cls.eventReward);

  console.log("elementData", elementData);

  return (
    <>
      <GradientHeader theme={theme} title="Wähle eine Klasse" />
      <FlatList
        data={filteredClasses}
        keyExtractor={(item) => item?.id ?? Math.random().toString()}
        contentContainerStyle={styles.classList}
        renderItem={({ item }) => {
          if (!item) return null;

          const element = elementData[item.element];

          return (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              style={styles.classCardOuter}
              activeOpacity={0.87}
              accessibilityRole="button"
              accessibilityLabel={`Klasse auswählen: ${
                item.label || "Unbekannt"
              }`}
            >
              <LinearGradient
                colors={[
                  theme.accentColorSecondary,
                  theme.accentColor,
                  theme.accentColorDark,
                ]}
                start={[0, 0]}
                end={[1, 0]}
                style={styles.classCard}
              >
                <View style={styles.classRow}>
                  <Image
                    source={
                      imageMap[`class_${item.id}`] || {
                        uri: getClassImageUrl(item.id),
                      }
                    }
                    style={styles.avatar}
                    contentFit="contain"
                    transition={300}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionTitle}>
                      {item.label ?? "Unbekannt"}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {item.description ?? "Keine Beschreibung vorhanden."}
                    </Text>
                    {element ? (
                      <Text style={styles.elementLabel}>
                        {element.icon} {element.label}
                      </Text>
                    ) : (
                      <Text style={styles.elementLabel}>🌟 Unbekannt</Text>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
        getItemLayout={(_, index) => ({
          length: 138,
          offset: 138 * index,
          index,
        })}
      />
    </>
  );
}

// ---------- Mini-Komponenten ----------

function GradientHeader({ theme, title }) {
  const styles = createStyles(theme);
  return (
    <LinearGradient
      colors={[
        theme.accentColorSecondary,
        theme.accentColor,
        theme.accentColorDark,
      ]}
      start={[0.12, 0]}
      end={[1, 1]}
      style={styles.headerGradient}
    >
      <Text style={styles.title}>{title}</Text>
    </LinearGradient>
  );
}

function BackButton({ onPress, label, theme }) {
  const styles = createStyles(theme);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.backButton}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.backText}>{label}</Text>
    </TouchableOpacity>
  );
}

function NextButton({ onPress, label, disabled, theme }) {
  const styles = createStyles(theme);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.nextButton, disabled && styles.nextButtonDisabled]}
      activeOpacity={disabled ? 1 : 0.84}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <LinearGradient
        colors={[
          theme.accentColorSecondary,
          theme.accentColor,
          theme.accentColorDark,
        ]}
        start={[0.1, 0]}
        end={[1, 1]}
        style={styles.nextButtonInner}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ---------- Styles ----------
function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    headerGradient: {
      borderRadius: 16,
      marginBottom: 15,
      alignSelf: "center",
      width: "90%",
      paddingVertical: 13,
      paddingHorizontal: 10,
      shadowColor: theme.glowColor,
      shadowRadius: 11,
      shadowOpacity: 0.29,
      shadowOffset: { width: 0, height: 4 },
      elevation: 7,
      marginTop: 14,
    },
    title: {
      fontSize: 25,
      fontWeight: "bold",
      color: theme.textColor,
      textAlign: "center",
      letterSpacing: 0.6,
      textShadowColor: theme.glowColor,
      textShadowOffset: { width: 0, height: 3 },
      textShadowRadius: 11,
    },
    input: {
      backgroundColor: theme.accentColor,
      fontSize: 18,
      color: theme.textColor,
      paddingVertical: 12,
      paddingHorizontal: 18,
      marginBottom: 22,
      marginTop: 10,
      borderRadius: 13,
      borderWidth: 1.6,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.13,
      shadowRadius: 8,
      elevation: 3,
    },
    nextButton: {
      borderRadius: 15,
      marginTop: 6,
      overflow: "hidden",
      shadowColor: theme.glowColor,
      shadowOpacity: 0.22,
      shadowRadius: 9,
      elevation: 4,
    },
    nextButtonInner: {
      paddingVertical: 14,
      alignItems: "center",
      width: "100%",
      borderRadius: 15,
      justifyContent: "center",
    },
    buttonText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 18,
      letterSpacing: 0.15,
      textShadowColor: theme.glowColor,
      textShadowRadius: 5,
    },
    nextButtonDisabled: {
      opacity: 0.4,
    },
    classList: {
      paddingVertical: 10,
      paddingBottom: 30,
    },
    classCardOuter: {
      borderRadius: 14,
      marginBottom: 16,
      shadowColor: theme.glowColor,
      shadowRadius: 6,
      shadowOpacity: 0.12,
      elevation: 2,
    },
    classCard: {
      borderRadius: 14,
      padding: 15,
      backgroundColor: theme.accentColor,
      borderWidth: 1.2,
      borderColor: theme.borderGlowColor,
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
      borderWidth: 1.2,
      borderColor: theme.borderGlowColor,
      backgroundColor: theme.shadowColor,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.textColor,
      marginBottom: 2,
      textShadowColor: theme.glowColor,
      textShadowRadius: 3,
    },
    optionDescription: {
      fontSize: 13,
      color: theme.textColor + "aa",
      marginBottom: 4,
    },
    elementLabel: {
      fontSize: 13,
      color: theme.textColor,
      backgroundColor: theme.accentColorSecondary + "88",
      alignSelf: "flex-start",
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 7,
      marginTop: 2,
      marginBottom: 1,
      overflow: "hidden",
      fontWeight: "bold",
      textShadowColor: theme.glowColor,
      textShadowRadius: 3,
    },
    backButton: {
      position: "absolute",
      bottom: 18,
      left: 18,
      backgroundColor: theme.shadowColor,
      paddingVertical: 10,
      paddingHorizontal: 22,
      borderRadius: 14,
      zIndex: 20,
      shadowColor: theme.glowColor,
      shadowRadius: 6,
      shadowOpacity: 0.1,
      elevation: 2,
    },
    backText: {
      color: theme.textColor,
      fontSize: 16,
      letterSpacing: 0.12,
      textAlign: "center",
      fontWeight: "bold",
      textShadowColor: theme.glowColor,
      textShadowRadius: 3,
    },
  });
}
