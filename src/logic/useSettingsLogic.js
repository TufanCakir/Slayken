import { useState, useEffect, useRef } from "react";
import { Audio } from "expo-av";

const MUSIC_URL =
  "https://raw.githubusercontent.com/TufanCakir/slayken-assets/refs/heads/main/music.json";
// Basis-URL für die Audiodateien (anpassen, falls erforderlich)
const AUDIO_BASE_URL =
  "https://raw.githubusercontent.com/TufanCakir/slayken-assets/refs/heads/main/music/";

const useSettingsLogic = () => {
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  // Standardmäßig Musik an, also initial true
  const [isPlaying, setIsPlaying] = useState(true);
  const [sound, setSound] = useState(null);
  // Guard, um zu verhindern, dass nextTrack() mehrfach ausgeführt wird
  const nextTrackCalled = useRef(false);

  // Musikdaten aus der JSON-URL laden
  useEffect(() => {
    fetch(MUSIC_URL)
      .then((res) => res.json())
      .then((data) => {
        // Prüfe, ob data.songs existiert
        const trackArray = data.songs ? data.songs : data;
        if (Array.isArray(trackArray)) {
          // Mappe jedes Track-Objekt, um einen src-Wert hinzuzufügen
          const mappedTracks = trackArray.map((song) => ({
            ...song,
            src: AUDIO_BASE_URL + song.filename,
          }));
          setTracks(mappedTracks);
        } else {
          console.error("Die empfangenen Daten sind kein Array:", data);
        }
      })
      .catch((err) => console.error("Fehler beim Laden der Musikdaten:", err));
  }, []);

  // Lade oder aktualisiere den Sound, wenn tracks oder currentTrackIndex sich ändern
  useEffect(() => {
    let isCancelled = false;
    // Reset: Bei jedem neuen Sound-Load darf nextTrack wieder aufgerufen werden
    nextTrackCalled.current = false;

    const loadSound = async () => {
      // Falls bereits ein Sound geladen ist, entladen wir diesen
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      // Sicherstellen, dass der aktuelle Track existiert und eine src besitzt
      if (
        tracks.length === 0 ||
        !tracks[currentTrackIndex] ||
        !tracks[currentTrackIndex].src
      ) {
        return;
      }

      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: tracks[currentTrackIndex].src },
          { shouldPlay: isPlaying }
        );
        if (isCancelled) return;

        // Event-Handler: Wenn der Track fertig ist, wird nextTrack() aufgerufen,
        // aber nur, wenn das noch nicht geschehen ist.
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (
            status.isLoaded &&
            status.didJustFinish &&
            !nextTrackCalled.current
          ) {
            nextTrackCalled.current = true;
            nextTrack();
          }
        });

        setSound(newSound);
      } catch (error) {
        console.error("Fehler beim Laden des Sounds:", error);
      }
    };

    loadSound();

    return () => {
      isCancelled = true;
    };
  }, [tracks, currentTrackIndex]);

  // Startet die Wiedergabe
  const play = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  // Pausiert die Wiedergabe
  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  // Umschalten der Wiedergabe
  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Wechselt zum nächsten Track
  const nextTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };

  // Optional: Wechsel zum vorherigen Track
  const previousTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex(
      (prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length
    );
  };

  return {
    tracks,
    currentTrack: tracks[currentTrackIndex],
    isPlaying,
    play,
    pause,
    togglePlay,
    nextTrack,
    previousTrack,
  };
};

export default useSettingsLogic;
