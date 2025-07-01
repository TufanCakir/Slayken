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

// Stell sicher, dass du immer skillPool oder ein fixes Array verwendest!
export default function ActionBar({
  skills = [], // skillPool!
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

  if (!activeCharacter) {
    return (
      <View style={styles.barContainer}>
        <Text style={{ color: "#dbeafe", opacity: 0.5 }}>Kein Charakter</Text>
      </View>
    );
  }

  // Ist der Skill für diesen Char wirklich nutzbar? (deine Logik)
  function isUnlocked(skill) {
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
  }

  useEffect(() => {
    if (!activeCharacter) return;

    if (activeCharacter.level > prevLevel.current) {
      skills.forEach((skill) => {
        const unlocked = isUnlocked(skill);
        if (unlocked && !unlockedSkillIds.current.has(skill.id)) {
          unlockedSkillIds.current.add(skill.id);
          setUnlockedSkill(skill);
          Vibration.vibrate(100);
        }
      });
    }
    prevLevel.current = activeCharacter.level;
  }, [activeCharacter.level, activeCharacter.element, skills]);

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

  const getSkillImage = (skill) =>
    imageMap[`skill_${skill.id}`] || require("../../assets/icon.png");

  // HOOKS: IMMER für alle Skills
  const cooldownEnds = skills.map((skill) => cooldowns[skill.id] || 0);
  const cooldownRemains = cooldownEnds.map((end) => useCooldownTimer(end));

  return (
    <>
      <View style={styles.barContainer}>
        {skills.map((skill, index) => {
          const cooldownEnd = cooldownEnds[index];
          const isCoolingDown = cooldownEnd > Date.now();
          const remaining = cooldownRemains[index];
          const unlocked = isUnlocked(skill);
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

// Dynamische Glow-Farben
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
      // Soft Glow für Bar
      shadowColor: glow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.18,
      shadowRadius: 32,
      elevation: 6,
      backgroundColor: theme.shadowColor,
      borderWidth: 2,
      borderColor: borderGlow,
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
      // Glow um die Buttons
      shadowColor: glow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.55,
      shadowRadius: 14,
      elevation: 8,
      // Glow-Übergang bei aktivem Button (z.B. Gold-Gelb)
      transitionProperty: "shadowColor", // nur Web, ignoriert Native
    },
    skillIcon: {
      width: 44,
      height: 44,
      borderRadius: 8,
      // Weicher Glow-Rahmen um Icon
      shadowColor: glow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 9,
      elevation: 7,
    },
    skillButtonPressed: {
      borderColor: "#ffe66d",
      shadowColor: "#ffe66d",
      shadowOpacity: 1,
      shadowRadius: 22,
      elevation: 13,
    },
    cooldownOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#222c" /* leicht transparent */,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: borderGlow,
    },
    cooldownTextOverlay: {
      color: glow,
      fontWeight: "bold",
      fontSize: 16,
      marginTop: 4,
      textShadowColor: glow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 6,
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
      shadowColor: glow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 21,
      elevation: 16,
    },
    tooltipTitle: {
      color: theme.textColor,
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 6,
      textShadowColor: glow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
      letterSpacing: 0.3,
    },
    tooltipDescription: {
      color: theme.textColor + "bb",
      fontSize: 15,
      marginBottom: 8,
      lineHeight: 18,
    },
    tooltipPower: {
      color: glow,
      fontSize: 14,
      fontWeight: "700",
      marginTop: 2,
      textShadowColor: borderGlow,
      textShadowRadius: 6,
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
      borderColor: borderGlow,
      shadowColor: glow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 30,
      elevation: 18,
      width: 270,
    },
    unlockTitle: {
      color: theme.textColor,
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 12,
      textShadowColor: glow,
      textShadowRadius: 10,
    },
    unlockImage: {
      width: 86,
      height: 86,
      marginBottom: 10,
      borderRadius: 14,
      borderWidth: 2.5,
      borderColor: borderGlow,
      shadowColor: glow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 9,
    },
    unlockSkillName: {
      color: glow,
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 12,
      textShadowColor: "#fff",
      textShadowRadius: 7,
    },
    unlockButton: {
      borderColor: borderGlow,
      borderWidth: 2,
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 10,
      backgroundColor: theme.accentColor,
      shadowColor: glow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.22,
      shadowRadius: 10,
      elevation: 5,
    },
    unlockButtonText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 15,
      textShadowColor: glow,
      textShadowRadius: 5,
    },
  });
}
