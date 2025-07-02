import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Vibration,
} from "react-native";
import { Image } from "expo-image";
import CircularCooldown from "../effects/CircularCooldown";
import useCooldownTimer from "../../hooks/useCooldownTimer";
import { useThemeContext } from "../../context/ThemeContext";

export default function ActionBar({
  skills = [],
  activeCharacter,
  onSkillPress,
  imageMap = {},
}) {
  const [tooltipSkill, setTooltipSkill] = useState(null);
  const [cooldowns, setCooldowns] = useState({});
  const [pressedIndex, setPressedIndex] = useState(null);
  const [unlockedSkill, setUnlockedSkill] = useState(null);
  const unlockedSkillIds = useRef(new Set());
  const prevLevel = useRef(activeCharacter?.level);
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  // --- Freischalt-Logik ---
  const isUnlocked = (skill) => {
    if (!skill || !activeCharacter) return false;
    if ((activeCharacter.level || 1) < (skill.level || 1)) return false;
    if (
      skill.allowedElements &&
      !skill.allowedElements.includes(activeCharacter.element)
    )
      return false;
    if (skill.element) {
      if (Array.isArray(skill.element)) {
        if (!skill.element.includes(activeCharacter.element)) return false;
      } else if (skill.element !== activeCharacter.element) {
        return false;
      }
    }
    return true;
  };

  // Unlock-Feedback bei LevelUp
  useEffect(() => {
    if (!activeCharacter) return;
    if (activeCharacter.level > prevLevel.current) {
      skills.forEach((skill) => {
        if (isUnlocked(skill) && !unlockedSkillIds.current.has(skill.id)) {
          unlockedSkillIds.current.add(skill.id);
          setUnlockedSkill(skill);
          Vibration.vibrate(100);
        }
      });
    }
    prevLevel.current = activeCharacter.level;
  }, [activeCharacter.level, activeCharacter.element, skills]);

  // Skill-Bild holen
  const getSkillImage = (skill) =>
    imageMap[`skill_${skill.id}`] || require("../../assets/icon.png");

  // Skill Cooldown starten
  const handlePress = (skill) => {
    if (!isUnlocked(skill)) return;
    if ((cooldowns[skill.id] || 0) > Date.now()) return;
    onSkillPress?.(skill);
    if (skill.cooldown) {
      setCooldowns((prev) => ({
        ...prev,
        [skill.id]: Date.now() + skill.cooldown,
      }));
    }
  };

  // Tooltip und Langdruck
  const handleLongPress = (skill, idx) => {
    Vibration.vibrate(12);
    setTooltipSkill(skill);
    setPressedIndex(idx);
  };
  const handleTooltipClose = () => {
    setTooltipSkill(null);
    setPressedIndex(null);
  };

  if (!activeCharacter) {
    return (
      <View style={styles.barContainer}>
        <Text style={{ color: "#dbeafe", opacity: 0.5 }}>Kein Charakter</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.barContainer}>
        {skills.map((skill, index) => {
          const unlocked = isUnlocked(skill);
          const cooldownEnd = cooldowns[skill.id] || 0;
          // INDIVIDUELLER HOOK pro Button (sauber & performant)
          const seconds = useCooldownTimer(cooldownEnd, 100, () =>
            setCooldowns((prev) => ({ ...prev, [skill.id]: 0 }))
          );
          const isCoolingDown = cooldownEnd > Date.now();
          const skillImage = getSkillImage(skill);

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
                source={skillImage}
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
                    {seconds.toFixed(1)}s
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tooltip Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={!!tooltipSkill}
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
              source={unlockedSkill ? getSkillImage(unlockedSkill) : undefined}
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

// Styles bleiben wie gehabt (konsolidiert!)
function createStyles(theme) {
  const glow = theme.glowColor || theme.shadowColor || "#ffbb00";
  const borderGlow = theme.borderGlowColor || theme.borderColor || "#ffbb00";
  return StyleSheet.create({
    barContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      padding: 14,
      borderRadius: 18,
      margin: 12,
      maxWidth: 512,
      alignSelf: "center",
      backgroundColor: theme.accentColor,
    },
    skillButton: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      padding: 2,
      width: 54,
      height: 54,
      margin: 4,
      borderWidth: 2.5,
      borderColor: borderGlow,
      backgroundColor: theme.accentColor,
    },
    skillIcon: {
      width: 44,
      height: 44,
      borderRadius: 8,
    },
    skillButtonPressed: {
      borderColor: "#ffe66d",
    },
    cooldownOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#222c",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 14,
      borderColor: borderGlow,
    },
    cooldownTextOverlay: {
      color: glow,
      fontSize: 16,
      marginTop: 4,
      letterSpacing: 0.2,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(15,23,42,0.87)",
    },
    tooltipBottomBox: {
      backgroundColor: theme.accentColor,
      padding: 22,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 2.5,
      borderColor: borderGlow,
    },
    tooltipTitle: {
      color: theme.textColor,
      fontSize: 20,
      marginBottom: 6,
    },
    tooltipDescription: {
      color: theme.textColor,
      fontSize: 15,
      marginBottom: 8,
      lineHeight: 18,
    },
    tooltipPower: {
      color: glow,
      fontSize: 14,
      marginTop: 2,
    },
    unlockOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(15,23,42,0.88)",
    },
    unlockBox: {
      backgroundColor: theme.accentColor,
      padding: 28,
      borderRadius: 20,
      alignItems: "center",
      borderWidth: 3,
      width: 270,
    },
    unlockTitle: {
      color: theme.textColor,
      fontSize: 18,
      marginBottom: 12,
    },
    unlockImage: {
      width: 86,
      height: 86,
      marginBottom: 10,
      borderRadius: 14,
    },
    unlockSkillName: {
      color: glow,
      fontSize: 18,
      marginBottom: 12,
    },
    unlockButton: {
      borderColor: borderGlow,
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 10,
      backgroundColor: theme.accentColor,
    },
    unlockButtonText: {
      color: theme.textColor,
      fontSize: 15,
    },
  });
}
