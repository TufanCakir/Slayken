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

export default function MusicSection() {
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
  const { theme } = useThemeContext();
  const styles = createStyles(theme);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

  // Track navigation handlers
  const handlePrevTrack = async () => {
    if (currentIndex > 0) {
      setIsLoadingTrack(true);
      await playMusic(allTracks[currentIndex - 1]);
      setIsLoadingTrack(false);
    }
  };
  const handleNextTrack = async () => {
    const nextIdx = (currentIndex + 1) % allTracks.length;
    setIsLoadingTrack(true);
    await playMusic(allTracks[nextIdx]);
    setIsLoadingTrack(false);
  };

  return (
    <>
      {/* Play/Pause Button */}
      <Pressable
        onPress={isPlaying ? pauseMusic : resumeMusic}
        accessibilityRole="button"
        accessibilityState={{ selected: isPlaying }}
        style={({ pressed }) => [
          styles.linkButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.linkText}>
          {isPlaying ? t("pauseMusic") : t("playMusic")}
        </Text>
      </Pressable>

      {/* Volume Slider */}
      <View style={styles.volumeContainer}>
        <Text style={styles.current}>
          {`${t("volumeLabel")}: ${Math.round(volume * 100)}%`}
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
        <Text style={styles.currentTrackLabel}>{`${t("currentTrack")}:`}</Text>
        <Text style={styles.trackTitle}>{currentTrack?.title || "—"}</Text>
      </View>

      {/* Track Controls */}
      <View style={styles.trackControls}>
        <TrackButton
          label={t("prevTrack")}
          onPress={handlePrevTrack}
          disabled={currentIndex === 0 || isLoadingTrack}
          theme={theme}
        />
        {isLoadingTrack && (
          <ActivityIndicator
            size="small"
            color={theme.accentColor}
            style={{ marginHorizontal: 8 }}
          />
        )}
        <TrackButton
          label={t("nextTrack")}
          onPress={handleNextTrack}
          disabled={isLoadingTrack}
          theme={theme}
        />
      </View>
    </>
  );
}

function TrackButton({ label, onPress, disabled, theme }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          flex: 1,
          paddingVertical: 11,
          borderRadius: 9,
          marginHorizontal: 6,
          alignItems: "center",
          backgroundColor: theme.accentColor,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={{
          color: disabled ? "#cbd5e1" : theme.textColor,
          fontWeight: "bold",
          fontSize: 14,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    linkButton: {
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor: theme.accentColor,
      marginTop: 12,
      marginBottom: 12,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    linkText: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.textColor,
      letterSpacing: 0.3,
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
