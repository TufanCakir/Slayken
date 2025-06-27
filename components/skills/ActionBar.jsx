import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Vibration,
  useWindowDimensions,
} from "react-native";
import { useState, useEffect, useRef } from "react";
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
  const [unlockedSkill, setUnlockedSkill] = useState(null); // Für Unlock-Popup
  const { width } = useWindowDimensions();
  const unlockedSkillIds = useRef(new Set());
  const prevLevel = useRef(activeCharacter.level);

  if (!activeCharacter) {
    return (
      <View style={styles.barContainer}>
        <Text style={{ color: "#dbeafe", opacity: 0.5 }}>Kein Charakter</Text>
      </View>
    );
  }

  const matchesElement = (elementField) => {
    if (!elementField) return true;
    if (Array.isArray(elementField)) {
      return elementField.includes(activeCharacter.element);
    }
    return elementField === activeCharacter.element;
  };

  const filterSkills = skills.filter((skill) => {
    if (!activeCharacter) return false;
    if (
      skill.allowedElements &&
      !skill.allowedElements.includes(activeCharacter.element)
    )
      return false;
    if (!matchesElement(skill.element)) return false;
    return true;
  });

  function isUnlocked(skill) {
    if (!skill || !activeCharacter) return false;
    if ((activeCharacter.level || 1) < (skill.level || 1)) return false;
    if (
      skill.allowedElements &&
      !skill.allowedElements.includes(activeCharacter.element)
    )
      return false;
    if (!matchesElement(skill.element)) return false;
    return true;
  }

  useEffect(() => {
    if (!activeCharacter) return;

    // Nur reagieren, wenn Level gestiegen ist
    if (activeCharacter.level > prevLevel.current) {
      filterSkills.forEach((skill) => {
        const unlocked = isUnlocked(skill);
        if (unlocked && !unlockedSkillIds.current.has(skill.id)) {
          unlockedSkillIds.current.add(skill.id);
          setUnlockedSkill(skill);
          Vibration.vibrate(100);
        }
      });
    }

    // Update prevLevel
    prevLevel.current = activeCharacter.level;
  }, [activeCharacter.level, activeCharacter.element, filterSkills]);

  const handlePress = (skill) => {
    if (!isUnlocked(skill)) return;
    const now = Date.now();
    const cooldownUntil = cooldowns[skill.id] || 0;

    if (now < cooldownUntil) return;

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
    <>
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
                  <CircularCooldown
                    duration={skill.cooldown}
                    size={36}
                    strokeWidth={3}
                  />
                  <Text style={styles.cooldownTextOverlay}>
                    {remaining.toFixed(1)}s
                  </Text>
                </View>
              )}
              {!unlocked && (
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  pointerEvents="none"
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

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
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Unlock Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={!!unlockedSkill}
        onRequestClose={() => setUnlockedSkill(null)}
      >
        <View style={styles.unlockOverlay}>
          <View style={styles.unlockBox}>
            <Text style={styles.unlockTitle}>
              Neue Fähigkeit freigeschaltet!
            </Text>
            <Image
              source={{ uri: unlockedSkill?.image }}
              style={styles.unlockImage}
              contentFit="contain"
            />
            <Text style={styles.unlockSkillName}>{unlockedSkill?.name}</Text>
            <TouchableOpacity
              onPress={() => setUnlockedSkill(null)}
              style={styles.unlockButton}
            >
              <Text style={styles.unlockButtonText}>Schließen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    margin: 12,
    maxWidth: 512,
    alignSelf: "center",
  },
  skillButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 2,
    width: 44,
    height: 44,
    margin: 3,
    borderWidth: 1.5,
    borderColor: "#94a3b8",
    backgroundColor: "transparent",
  },
  skillIcon: {
    width: 38,
    height: 38,
    borderRadius: 4,
  },
  skillButtonPressed: {
    borderColor: "#facc15",
  },
  cooldownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(148,163,184,0.7)", // leichtes grau-transparent
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  cooldownTextOverlay: {
    color: "#1e293b",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.8)",
  },
  tooltipBottomBox: {
    backgroundColor: "#0f172a",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 2,
    borderColor: "#94a3b8",
  },
  tooltipTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tooltipDescription: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  tooltipPower: {
    color: "#facc15",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  unlockOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.85)",
  },
  unlockBox: {
    backgroundColor: "#0f172a",
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#94a3b8",
    width: 260,
  },
  unlockTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
  },
  unlockImage: {
    width: 72,
    height: 72,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#94a3b8",
  },
  unlockSkillName: {
    color: "#facc15",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 12,
  },
  unlockButton: {
    borderColor: "#94a3b8",
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unlockButtonText: {
    color: "#f8fafc",
    fontWeight: "bold",
    fontSize: 13,
  },
});
