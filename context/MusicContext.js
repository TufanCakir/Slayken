// Datei: context/MusicContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { Audio } from "expo-av";
import songsData from "../data/songs.json";

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Volume-State (0 … 1)
  const [volume, setVolume] = useState(1);

  // 1) Beim Unmounten: Sound entladen
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // 2) Wenn sich „volume“ ändert, Lautstärke auf die Sound-Instanz setzen
  useEffect(() => {
    if (sound) {
      sound.setVolumeAsync(volume).catch((e) => {
        console.warn("Fehler beim Setzen der Lautstärke:", e);
      });
    }
  }, [volume, sound]);

  // Helper-Funktion: Spielt den Song an der gegebenen Index-Position
  const playByIndex = async (index) => {
    // Index innerhalb der Array-Grenzen prüfen
    if (index < 0 || index >= songsData.songs.length) {
      return;
    }

    const track = songsData.songs[index];

    try {
      // Wenn schon ein Sound geladen war, entladen
      if (sound) {
        await sound.unloadAsync();
      }

      // Neuen Sound laden und sofort abspielen
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.url },
        {
          shouldPlay: true,
          volume, // initiale Lautstärke
        },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setCurrentTrack(track);
      setCurrentIndex(index);
      setIsPlaying(true);
    } catch (e) {
      console.error("Fehler beim Abspielen des Tracks:", e);
    }
  };

  // 3) Sobald der Provider das erste Mal mountet, starte automatisch den ersten Song (Index 0)
  useEffect(() => {
    playByIndex(0);
    // Leere Dep-Liste, damit dieser Effekt nur einmal beim Mounten ausgeführt wird.
  }, []);

  // 4) onPlaybackStatusUpdate: Wenn ein Song zu Ende ist, spiele automatisch den nächsten
  const onPlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < songsData.songs.length) {
        playByIndex(nextIndex);
      } else {
        // Wenn ihr nach dem letzten Song wieder von vorn beginnen wollt:
        playByIndex(0);

        // Falls ihr stattdessen am Ende stoppen möchtet, kommentiert die Zeile oben aus und macht:
        // setIsPlaying(false);
      }
    }
    // Ihr könnt hier bei Bedarf noch weitere Status-Updates (z. B. Position, Buffering) behandeln.
  };

  // Play-Funktion, die einen beliebigen Track startet (z. B. wenn ihr per UI einen bestimmten Song wählen wollt)
  const playMusic = async (track) => {
    // Track-Index anhand von URL (oder anhand eines eindeutigen Felds) bestimmen
    const index = songsData.songs.findIndex((t) => t.url === track.url);
    if (index !== -1) {
      await playByIndex(index);
    } else {
      console.warn("Track nicht gefunden:", track);
    }
  };

  const pauseMusic = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeMusic = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    } else if (currentTrack) {
      // Falls der Sound entladen wurde, starte den aktuellen erneut
      await playByIndex(currentIndex);
    } else {
      // Wenn noch kein Track gewählt wurde (sollte selten vorkommen), nimm den ersten
      await playByIndex(0);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        currentIndex,
        isPlaying,
        playMusic,
        pauseMusic,
        resumeMusic,
        allTracks: songsData.songs,
        volume,
        setVolume,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
