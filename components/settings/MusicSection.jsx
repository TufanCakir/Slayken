import React from "react";
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

// Blaue Farbpalette (kannst du zentral anpassen)
const accentColor = "#2563eb";
const accentColorLight = "#60a5fa";
const backgroundColor = "#0f172a";
const textColor = "#f0f9ff";
const controlDisabled = "#334155";

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

  const [isLoadingTrack, setIsLoadingTrack] = React.useState(false);

  const handlePrevTrack = async () => {
    if (currentIndex > 0) {
      setIsLoadingTrack(true);
      await playMusic(allTracks[currentIndex - 1]);
      setIsLoadingTrack(false);
    }
  };

  const handleNextTrack = async () => {
    const nextIdx = currentIndex + 1 < allTracks.length ? currentIndex + 1 : 0;
    setIsLoadingTrack(true);
    await playMusic(allTracks[nextIdx]);
    setIsLoadingTrack(false);
  };

  return (
    <>
      <Pressable
        onPress={() => {
          isPlaying ? pauseMusic() : resumeMusic();
        }}
        accessibilityRole="button"
        accessibilityState={{ selected: isPlaying }}
        style={({ pressed }) => [
          styles.linkButton,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text style={styles.linkText}>
          {isPlaying ? t("pauseMusic") : t("playMusic")}
        </Text>
      </Pressable>

      <View style={styles.volumeContainer}>
        <Text style={styles.current}>
          {`${t("volumeLabel")}: ${Math.round(volume * 100)}%`}
        </Text>
        <Slider
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={setVolume}
          minimumTrackTintColor={accentColor}
          maximumTrackTintColor={accentColorLight}
          thumbTintColor={accentColor}
          accessibilityLabel={t("volumeLabel")}
        />
      </View>

      <View style={styles.trackInfoContainer}>
        <Text style={styles.currentTrackLabel}>{`${t("currentTrack")}:`}</Text>
        <Text style={styles.trackTitle}>{currentTrack?.title || "—"}</Text>
      </View>

      <View style={styles.trackControls}>
        <Pressable
          onPress={handlePrevTrack}
          disabled={currentIndex === 0 || isLoadingTrack}
          style={({ pressed }) => [
            styles.controlButton,
            currentIndex === 0 || isLoadingTrack
              ? styles.controlButtonDisabled
              : {},
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text
            style={[
              styles.controlButtonText,
              currentIndex === 0 || isLoadingTrack
                ? styles.controlButtonTextDisabled
                : {},
            ]}
          >
            {t("prevTrack")}
          </Text>
        </Pressable>

        {isLoadingTrack && (
          <ActivityIndicator
            size="small"
            color={accentColor}
            style={{ marginHorizontal: 8 }}
          />
        )}

        <Pressable
          onPress={handleNextTrack}
          disabled={isLoadingTrack}
          style={({ pressed }) => [
            styles.controlButton,
            isLoadingTrack ? styles.controlButtonDisabled : {},
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text
            style={[
              styles.controlButtonText,
              isLoadingTrack ? styles.controlButtonTextDisabled : {},
            ]}
          >
            {t("nextTrack")}
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  linkButton: {
    padding: 14,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: accentColor,
    borderColor: accentColorLight,
    marginTop: 12,
    marginBottom: 12,
    shadowColor: accentColorLight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 5,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "bold",
    color: textColor,
    letterSpacing: 0.3,
  },
  volumeContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  current: {
    fontSize: 16,
    marginBottom: 10,
    color: accentColorLight,
    fontWeight: "500",
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  trackInfoContainer: {
    marginTop: 14,
    alignItems: "center",
  },
  currentTrackLabel: {
    fontSize: 15,
    color: accentColorLight,
    marginBottom: 2,
    fontWeight: "500",
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: textColor,
    letterSpacing: 0.2,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  trackControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: accentColorLight,
    marginHorizontal: 6,
    alignItems: "center",
    backgroundColor: accentColorLight,
    elevation: 3,
  },
  controlButtonDisabled: {
    backgroundColor: controlDisabled,
    borderColor: "#475569",
  },
  controlButtonText: {
    color: accentColor,
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  controlButtonTextDisabled: {
    color: "#cbd5e1",
  },
});
