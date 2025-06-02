// Datei: components/BattleView.js
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Text,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import ViewShot from "react-native-view-shot";

import { useThemeContext } from "../context/ThemeContext";
import FotoButtons from "./FotoButtons";
import BattleScene from "./BattleScene"; // Pfad ggf. anpassen

const { width } = Dimensions.get("window");

// Statische Definition der Schwierigkeitsstufen,
// kannst du bei Bedarf auch in eine zentrale Datei auslagern.
const difficultyLevels = [
  { key: "easy", label: "Leicht" },
  { key: "medium", label: "Mittel" },
  { key: "hard", label: "Schwer" },
];

export default function BattleView({
  viewShotRef,
  selectedEvent,
  difficultyKey,
  setDifficultyKey,
  difficultyLabel,
  hp,
  bossDefeated,
  handleFight,
  onBack,
  takeScreenshot,
  xpReward = { xpReward },
}) {
  const { theme } = useThemeContext();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <ViewShotWrapper ref={viewShotRef}>
        {/* Zurück-Button */}
        <TouchableOpacity
          style={[
            styles.backBtn,
            {
              backgroundColor: theme.accentColor,
              shadowColor: theme.shadowColor,
            },
          ]}
          onPress={onBack}
        >
          <Ionicons name="chevron-back" size={28} color={theme.textColor} />
        </TouchableOpacity>

        {/* Dropdown für Schwierigkeit */}
        <View style={styles.pickerContainer}>
          <Text style={[styles.pickerLabel, { color: theme.textColor }]}>
            Schwierigkeit:
          </Text>
          <RNPickerSelect
            onValueChange={(value) => setDifficultyKey(value)}
            value={difficultyKey}
            items={difficultyLevels.map((d) => ({
              label: d.label,
              value: d.key,
            }))}
            Icon={() => (
              <MaterialIcons
                name="keyboard-arrow-down" // oder z. B. "expand-more", "arrow-drop-down" etc.
                size={50}
                color={theme.textColor}
              />
            )}
            style={{
              inputIOS: {
                fontSize: 16,
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: theme.borderColor,
                borderRadius: 8,
                color: theme.textColor,
                backgroundColor: theme.accentColor,
                marginBottom: 12,
              },
              inputAndroid: {
                fontSize: 16,
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: theme.borderColor,
                borderRadius: 8,
                color: theme.textColor,
                backgroundColor: theme.accentColor,
                marginBottom: 12,
              },
              placeholder: {
                color: theme.textColor,
              },
            }}
            placeholder={{}}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        {/* BattleScene */}
        {selectedEvent && (
          <BattleScene
            bossName={selectedEvent.eventName}
            bossImage={selectedEvent.image}
            difficultyLabel={difficultyLabel}
            hp={hp}
            bossDefeated={bossDefeated}
            handleFight={handleFight}
          />
        )}

        {/* Screenshot-Button */}
        <FotoButtons
          onPress={takeScreenshot}
          buttonColor={theme.accentColor}
          textColor={theme.textColor}
        />
      </ViewShotWrapper>
    </View>
  );
}

// Wrapper für ViewShot, damit ForwardRef funktioniert
const ViewShotWrapper = React.forwardRef((props, ref) => (
  <ViewShot
    ref={ref}
    options={{ format: "png", quality: 0.8 }}
    style={{ flex: 1 }}
  >
    {props.children}
  </ViewShot>
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 80 : 40,
    left: 16,
    padding: 6,
    borderRadius: 20,
    zIndex: 3,
    // Schatten für iOS / Elevation für Android
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  pickerContainer: {
    marginTop: Platform.OS === "ios" ? 100 : 80,
    marginHorizontal: 20,
    zIndex: 2,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  pickerContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
    zIndex: 10, // deutlich höher als die Cards (dort zIndex: 2)
    position: Platform.OS === "ios" ? "relative" : undefined,
  },
  pickerInputIOS: (theme) => ({
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.shadowColor,
    backgroundColor: theme.accentColor,
    color: theme.textColor,
    fontSize: 16,
  }),
  pickerInputAndroid: (theme) => ({
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.shadowColor,
    backgroundColor: theme.accentColor,
    color: theme.textColor,
    fontSize: 16,
  }),
});
