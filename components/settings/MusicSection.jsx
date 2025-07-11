import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useMusic } from "../../context/MusicContext";
import { t } from "../../i18n";
import { useThemeContext } from "../../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

export default function MusicSection() {
  const { theme } = useThemeContext(); // <-- ZUERST!
  const gradientColors = theme.linearGradient || [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  const {
    volume,
    setVolume,
    isPlaying,
    pauseMusic,
    resumeMusic,
    currentTrack,
    currentIndex,
    allTracks,
    playMusic,
  } = useMusic();
  const styles = createStyles(theme);
  const [isLoading, setIsLoading] = useState(false);

  // Track navigation handlers
  const prevDisabled = currentIndex === 0 || isLoading;
  const nextDisabled = isLoading;
  const handlePrev = async () => {
    if (!prevDisabled) {
      setIsLoading(true);
      await playMusic(allTracks[currentIndex - 1]);
      setIsLoading(false);
    }
  };
  const handleNext = async () => {
    if (!nextDisabled) {
      setIsLoading(true);
      await playMusic(allTracks[(currentIndex + 1) % allTracks.length]);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Play/Pause Button */}
      <Pressable
        onPress={isPlaying ? pauseMusic : resumeMusic}
        accessibilityRole="button"
        accessibilityState={{ selected: isPlaying }}
        style={({ pressed }) => [
          styles.linkButtonWrap,
          pressed && styles.buttonPressed,
        ]}
      >
        {/* Gradient-Hintergrund */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.linkText}>
          {isPlaying ? t("pauseMusic") : t("playMusic")}
        </Text>
      </Pressable>

      {/* Volume Slider */}
      <View style={styles.volumeContainer}>
        <Text style={styles.current}>
          {t("volumeLabel")}: {Math.round(volume * 100)}%
        </Text>
        <Slider
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={setVolume}
          minimumTrackTintColor={theme.accentColor}
          maximumTrackTintColor={theme.borderColor}
          thumbTintColor={theme.accentColor}
          accessibilityLabel={t("volumeLabel")}
        />
      </View>

      {/* Track Info */}
      <View style={styles.trackInfoContainer}>
        <Text style={styles.currentTrackLabel}>{t("currentTrack")}:</Text>
        <Text style={styles.trackTitle}>{currentTrack?.title || "—"}</Text>
      </View>

      {/* Track Controls */}
      <View style={styles.trackControls}>
        <TrackButton
          label={t("prevTrack")}
          onPress={handlePrev}
          disabled={prevDisabled}
          theme={theme}
        />
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={theme.accentColor}
            style={{ marginHorizontal: 8 }}
          />
        )}
        <TrackButton
          label={t("nextTrack")}
          onPress={handleNext}
          disabled={nextDisabled}
          theme={theme}
        />
      </View>
    </>
  );
}

function TrackButton({ label, onPress, disabled, theme }) {
  const gradientColors = theme.linearGradient || [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          flex: 1,
          borderRadius: 9,
          marginHorizontal: 6,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        },
        disabled && { opacity: 0.55 },
        pressed && !disabled && { opacity: 0.7 },
      ]}
    >
      {/* Gradient-Hintergrund */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text
        style={{
          color: disabled ? "#cbd5e1" : theme.textColor,
          fontWeight: "bold",
          fontSize: 14,
          letterSpacing: 0.2,
          zIndex: 1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    linkButtonWrap: {
      // <--- Wichtig! So wie im Render verwendet!
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      marginTop: 12,
      marginBottom: 12,
      position: "relative",
    },
    buttonPressed: {
      opacity: 0.8,
    },
    linkText: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.textColor,
      letterSpacing: 0.3,
      zIndex: 1,
    },
    volumeContainer: {
      marginTop: 8,
      marginBottom: 12,
    },
    current: {
      fontSize: 16,
      marginBottom: 10,
      color: theme.textColor,
    },
    trackInfoContainer: {
      marginTop: 14,
      alignItems: "center",
    },
    currentTrackLabel: {
      fontSize: 15,
      marginBottom: 2,
      color: theme.textColor,
    },
    trackTitle: {
      fontSize: 16,
      color: theme.textColor,
      letterSpacing: 0.2,
    },
    trackControls: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 14,
    },
  });
}
