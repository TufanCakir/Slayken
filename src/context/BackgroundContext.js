// src/context/BackgroundContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BackgroundContext = createContext();

export const BackgroundProvider = ({ children }) => {
  const defaultColors = ["black", "blue", "black"]; // 🔹 Standard-Hintergrundfarbe
  const [backgroundColors, setBackgroundColors] = useState(defaultColors);

  useEffect(() => {
    const loadBackground = async () => {
      try {
        const storedBackground = await AsyncStorage.getItem("backgroundColors");
        if (storedBackground) {
          setBackgroundColors(JSON.parse(storedBackground));
        }
      } catch (error) {
        console.error("Failed to load background:", error);
      }
    };

    loadBackground();
  }, []);

  const updateBackground = async (newColors) => {
    setBackgroundColors(newColors);
    try {
      await AsyncStorage.setItem("backgroundColors", JSON.stringify(newColors));
    } catch (error) {
      console.error("Failed to save background:", error);
    }
  };

  return (
    <BackgroundContext.Provider
      value={{ backgroundColors, setBackgroundColors: updateBackground }}
    >
      {children}
    </BackgroundContext.Provider>
  );
};
