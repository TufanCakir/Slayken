import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Vibration,
  useWindowDimensions,
} from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import CircularCooldown from "../effects/CircularCooldown";
import useCooldownTimer from "../../hooks/useCooldownTimer";

export default function ActionBar({
  skills = [],
  activeCharacter,
  onSkillPress,
}) {
  const [tooltipSkill, setTooltipSkill] = useState(null);
  const [cooldowns, setCooldowns] = useState({});
  const [pressedIndex, setPressedIndex] = useState(null);
  const { width } = useWindowDimensions();

  if (!activeCharacter) {
    return (
      <View style={styles.barContainer}>
        <Text style={{ color: "#dbeafe", opacity: 0.5 }}>Kein Charakter</Text>
      </View>
    );
  }

  // Nur Skills anzeigen, die für diesen Char je möglich wären
  const filterSkills = skills.filter((skill) => {
    if (!activeCharacter) return false;
    if (
      skill.allowedElements &&
      !skill.allowedElements.includes(activeCharacter.element)
    )
      return false;
    if (skill.element && skill.element !== activeCharacter.element)
      return false;
    return true;
  });

  // Dynamisch: Skill-Namen nur anzeigen, wenn wenige Skills oder genug Platz
  const showSkillName = filterSkills.length <= Math.floor(width / 80);
  function isUnlocked(skill) {
    if (!skill || !activeCharacter) return false;
    if ((activeCharacter.level || 1) < (skill.level || 1)) return false;
    if (
      skill.allowedElements &&
      !skill.allowedElements.includes(activeCharacter.element)
    )
      return false;
    if (skill.element && skill.element !== activeCharacter.element)
      return false;
    return true;
  }

  const handlePress = (skill) => {
    if (!isUnlocked(skill)) return;
    const now = Date.now();
    const cooldownUntil = cooldowns[skill.id] || 0;

    if (now < cooldownUntil) {
      return;
    }

    onSkillPress?.(skill);

    if (skill.cooldown) {
      setCooldowns((prev) => ({
        ...prev,
        [skill.id]: now + skill.cooldown,
      }));
    }
  };

  const handleLongPress = (skill, idx) => {
    Vibration.vibrate(12);
    setTooltipSkill(skill);
    setPressedIndex(idx);
  };
  const handleTooltipClose = () => {
    setTooltipSkill(null);
    setPressedIndex(null);
  };

  return (
    <View style={styles.barContainer}>
      {filterSkills.map((skill, index) => {
        const cooldownEnd = cooldowns[skill.id] || 0;
        const isCoolingDown = cooldownEnd > Date.now();
        const remaining = useCooldownTimer(cooldownEnd);
        const unlocked = isUnlocked(skill);

        return (
          <TouchableOpacity
            key={skill.id || index}
            disabled={!unlocked || isCoolingDown}
            style={[
              styles.skillButton,
              !unlocked && { opacity: 0.3 },
              isCoolingDown && { opacity: 0.5 },
              pressedIndex === index && styles.skillButtonPressed,
            ]}
            onPress={() => handlePress(skill)}
            onLongPress={() => handleLongPress(skill, index)}
            delayLongPress={150}
            onPressOut={() => setPressedIndex(null)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: skill.image }}
              style={styles.skillIcon}
              contentFit="contain"
              transition={300}
            />
            {isCoolingDown && unlocked && (
              <View style={styles.cooldownOverlay}>
                <CircularCooldown duration={skill.cooldown} />
                <Text style={styles.cooldownTextOverlay}>
                  {remaining.toFixed(1)}s
                </Text>
              </View>
            )}
            {showSkillName && (
              <Text style={styles.skillText}>{skill.name}</Text>
            )}
            {!unlocked && (
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                pointerEvents="none"
              ></View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* Tooltip Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={tooltipSkill !== null}
        onRequestClose={handleTooltipClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={handleTooltipClose}
          activeOpacity={1}
        >
          <View style={styles.tooltipBottomBox}>
            <Text style={styles.tooltipTitle}>{tooltipSkill?.name}</Text>
            <Text style={styles.tooltipDescription}>
              {tooltipSkill?.description}
            </Text>
            <Text style={styles.tooltipPower}>
              Power: {tooltipSkill?.power}
            </Text>
            {tooltipSkill && !isUnlocked(tooltipSkill) && (
              <Text
                style={{ color: "#facc15", marginTop: 6, fontWeight: "bold" }}
              >
                {tooltipSkill.level &&
                activeCharacter.level < tooltipSkill.level
                  ? `Ab Level ${tooltipSkill.level} verfügbar`
                  : tooltipSkill.allowedElements &&
                    !tooltipSkill.allowedElements.includes(
                      activeCharacter.element
                    )
                  ? `Nur für: ${tooltipSkill.allowedElements
                      .map((e) =>
                        e === "fire" ? "🔥" : e === "ice" ? "❄️" : e
                      )
                      .join(", ")}`
                  : tooltipSkill.element &&
                    tooltipSkill.element !== activeCharacter.element
                  ? `Nur für ${
                      tooltipSkill.element === "fire"
                        ? "🔥"
                        : tooltipSkill.element === "ice"
                        ? "❄️"
                        : tooltipSkill.element
                    }`
                  : "Aktuell nicht verfügbar"}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // <--- Wichtig!
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 16,
    backgroundColor: "#1e293b",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 28,
    margin: 16,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 104,
  },
  skillButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 18,
    padding: 10,
    width: 64,
    height: 80,
    marginHorizontal: 2,
    marginVertical: 4,
    shadowColor: "#60a5fa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#22d3ee",
  },
  skillButtonPressed: {
    borderColor: "#facc15",
    shadowColor: "#facc15",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    opacity: 1,
  },
  skillIcon: {
    width: 32,
    height: 32,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: "#1e293b",
  },
  skillText: {
    fontSize: 13,
    color: "#dbeafe",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
    textShadowColor: "#60a5fa",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cooldownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30,41,59,0.75)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  cooldownTextOverlay: {
    color: "#22d3ee",
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 8,
    textShadowColor: "#0ea5e9",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(30,41,59,0.80)",
  },
  tooltipBottomBox: {
    backgroundColor: "#1e293b",
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    borderWidth: 2,
    borderColor: "#2563eb",
    marginHorizontal: 0,
    minHeight: 140,
  },
  tooltipTitle: {
    color: "#60a5fa",
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  tooltipDescription: {
    color: "#dbeafe",
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 20,
  },
  tooltipPower: {
    color: "#22d3ee",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
});
