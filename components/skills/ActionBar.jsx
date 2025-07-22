import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
import { useAssets } from "../../context/AssetsContext";
import { LinearGradient } from "expo-linear-gradient";
import { getSkillImageUrl } from "../../utils/skillUtils";

// --- Tooltip Modal ---
const TooltipModal = React.memo(function TooltipModal({
  skill,
  visible,
  onClose,
  styles,
  gradientColors,
}) {
  if (!skill || !visible) return null;
  return (
    <Modal transparent animationType="fade" visible>
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.25, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tooltipBottomBox}
        >
          <Text style={styles.tooltipTitle}>{skill.name}</Text>
          <Text style={styles.tooltipDescription}>{skill.description}</Text>
          <Text style={styles.tooltipPower}>Power: {skill.power}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Modal>
  );
});

// --- Unlock Modal ---
const UnlockModal = React.memo(function UnlockModal({
  skill,
  visible,
  onClose,
  getSkillImage,
  styles,
  gradientColors,
}) {
  if (!skill || !visible) return null;
  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.unlockOverlay}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.unlockBox}
        >
          <Text style={styles.unlockTitle}>Neue Fähigkeit freigeschaltet!</Text>
          <Image
            source={getSkillImage(skill)}
            style={styles.unlockImage}
            contentFit="contain"
          />
          <Text style={styles.unlockSkillName}>{skill.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.unlockButton}>
            <Text style={styles.unlockButtonText}>Schließen</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
});

export default function ActionBar({
  skills = [],
  activeCharacter,
  onSkillPress,
}) {
  const [tooltipSkill, setTooltipSkill] = useState(null);
  const [cooldowns, setCooldowns] = useState({});
  const [pressedIndex, setPressedIndex] = useState(null);
  const [unlockedSkill, setUnlockedSkill] = useState(null);

  const unlockedSkillIds = useRef(new Set());
  const prevLevel = useRef(activeCharacter?.level);
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();

  // Styles und Gradient memoisiert
  const styles = useMemo(() => createStyles(theme), [theme]);
  const gradientColors = useMemo(
    () =>
      theme.linearGradient || [
        theme.accentColorSecondary,
        theme.accentColor,
        theme.accentColorDark,
      ],
    [theme]
  );

  // Skillbild laden (memoisiert)
  const getSkillImage = useCallback((skill) => {
    if (!skill || !skill.id) return require("../../assets/logo.png");
    return getSkillImageUrl(skill.id);
  }, []);

  // Skill freigeschaltet?
  const isUnlocked = useCallback(
    (skill) => {
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
    },
    [activeCharacter]
  );

  // Bei Level-Up neue Skills anzeigen (memoisiert)
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
  }, [activeCharacter, skills, isUnlocked]);

  // Status aller Skills vorberechnen (Memo für Performance)
  const skillStatuses = useMemo(
    () =>
      skills.map((skill) => {
        const unlocked = isUnlocked(skill);
        const cooldownEnd = cooldowns[skill.id] || 0;
        const isCoolingDown = cooldownEnd > Date.now();
        return { skill, unlocked, isCoolingDown, cooldownEnd };
      }),
    [skills, isUnlocked, cooldowns]
  );

  // Skill-Tap-Handler memoisiert
  const handlePress = useCallback(
    (skill, unlocked, isCoolingDown) => {
      if (!unlocked || isCoolingDown) return;
      onSkillPress?.(skill);
      if (skill.cooldown) {
        setCooldowns((prev) => ({
          ...prev,
          [skill.id]: Date.now() + skill.cooldown,
        }));
      }
    },
    [onSkillPress]
  );

  const handleLongPress = useCallback((skill, idx) => {
    Vibration.vibrate(12);
    setTooltipSkill(skill);
    setPressedIndex(idx);
  }, []);

  // Kein aktiver Charakter
  if (!activeCharacter) {
    return (
      <View style={styles.barContainer}>
        <Text style={{ color: "#dbeafe", opacity: 0.5 }}>Kein Charakter</Text>
      </View>
    );
  }

  return (
    <>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.barContainer}
      >
        {skillStatuses.map(
          ({ skill, unlocked, isCoolingDown, cooldownEnd }, index) => {
            // Cooldown-Timer pro Skill (Memo!)
            const seconds = useCooldownTimer(cooldownEnd, 100, () =>
              setCooldowns((prev) => ({ ...prev, [skill.id]: 0 }))
            );
            const skillImage = getSkillImage(skill);

            return (
              <LinearGradient
                key={skill.id || index}
                colors={gradientColors}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.skillButton,
                  !unlocked && { opacity: 0.3 },
                  isCoolingDown && { opacity: 0.5 },
                  pressedIndex === index && styles.skillButtonPressed,
                ]}
              >
                <TouchableOpacity
                  disabled={!unlocked || isCoolingDown}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => handlePress(skill, unlocked, isCoolingDown)}
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
              </LinearGradient>
            );
          }
        )}
      </LinearGradient>

      <TooltipModal
        skill={tooltipSkill}
        visible={!!tooltipSkill}
        onClose={() => {
          setTooltipSkill(null);
          setPressedIndex(null);
        }}
        styles={styles}
        gradientColors={gradientColors}
      />

      <UnlockModal
        skill={unlockedSkill}
        visible={!!unlockedSkill}
        onClose={() => setUnlockedSkill(null)}
        getSkillImage={getSkillImage}
        styles={styles}
        gradientColors={gradientColors}
      />
    </>
  );
}

// --- Styles ---
function createStyles(theme) {
  const glow = theme.glowColor || theme.shadowColor || "#ffbb00";
  const borderGlow = theme.borderGlowColor || theme.borderColor || "#ffbb00";
  const accent = theme.accentColor || "#191919";
  const text = theme.textColor || "#fff";
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
      overflow: "hidden",
      top: 100,
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
      overflow: "hidden",
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
      color: text,
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
      padding: 22,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 2.5,
      borderColor: borderGlow,
    },
    tooltipTitle: {
      color: text,
      fontSize: 20,
      marginBottom: 6,
    },
    tooltipDescription: {
      color: text,
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
      padding: 28,
      borderRadius: 20,
      alignItems: "center",
      borderWidth: 3,
      borderColor: borderGlow,
      width: 270,
      overflow: "hidden",
    },
    unlockTitle: {
      color: text,
      fontSize: 18,
      marginBottom: 12,
      fontWeight: "bold",
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
      fontWeight: "bold",
      textAlign: "center",
    },
    unlockButton: {
      borderColor: borderGlow,
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 10,
      backgroundColor: accent,
      borderWidth: 1.3,
      marginTop: 10,
    },
    unlockButtonText: {
      color: text,
      fontSize: 15,
      fontWeight: "bold",
    },
  });
}
