import React, { useState, useMemo, useCallback } from "react";
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

const NameStep = React.memo(function NameStep({
  name,
  setName,
  onNext,
  theme,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);
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
});

const ClassSelectStep = React.memo(function ClassSelectStep({
  classes,
  imageMap,
  onSelect,
  theme,
  name,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  const filteredClasses = useMemo(
    () => (classes ?? []).filter((cls) => !cls.eventReward),
    [classes]
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (!item) return null;
      const element = elementData[item.element];

      return (
        <TouchableOpacity
          onPress={() => onSelect(item)}
          style={styles.classCardOuter}
          activeOpacity={0.87}
          accessibilityRole="button"
          accessibilityLabel={`Klasse auswählen: ${item.label || "Unbekannt"}`}
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
    },
    [imageMap, theme]
  );

  return (
    <>
      <GradientHeader theme={theme} title="Wähle eine Klasse" />
      <FlatList
        data={filteredClasses}
        keyExtractor={(item) => item?.id ?? Math.random().toString()}
        contentContainerStyle={styles.classList}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: 138,
          offset: 138 * index,
          index,
        })}
      />
    </>
  );
});

const GradientHeader = React.memo(function GradientHeader({ theme, title }) {
  const styles = useMemo(() => createStyles(theme), [theme]);
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
});

const BackButton = React.memo(function BackButton({ onPress, label, theme }) {
  const styles = useMemo(() => createStyles(theme), [theme]);
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
});

const NextButton = React.memo(function NextButton({
  onPress,
  label,
  disabled,
  theme,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);
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
});

// --- Main Screen ---

function CreateCharacterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const { theme } = useThemeContext();
  const { setActiveClassId, updateCharacter } = useClass();
  const { imageMap } = useAssets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const goToNext = useCallback(() => setStep(2), []);
  const goBack = useCallback(
    () => (step === 1 ? navigation.goBack() : setStep(1)),
    [navigation, step]
  );

  const finishCreation = useCallback(
    async (selectedClass) => {
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
    },
    [name, updateCharacter, setActiveClassId, navigation]
  );

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
      <BackButton onPress={goBack} label="Zurück" theme={theme} />
    </View>
  );
}

export default React.memo(CreateCharacterScreen);

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
      marginTop: 14,
    },
    title: {
      fontSize: 25,
      fontWeight: "bold",
      color: theme.textColor,
      textAlign: "center",
      letterSpacing: 0.6,
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
    },
    nextButton: {
      borderRadius: 15,
      marginTop: 6,
      overflow: "hidden",
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
      fontWeight: "bold",
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
    },
    backText: {
      color: theme.textColor,
      fontSize: 16,
      letterSpacing: 0.12,
      textAlign: "center",
      fontWeight: "bold",
    },
  });
}
