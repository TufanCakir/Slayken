// context/CharacterContext.js
import { createContext, useContext, useState } from "react";

const CharacterContext = createContext();

export function CharacterProvider({ children }) {
  const [characters, setCharacters] = useState([]); // z. B. aus JSON laden

  const addExpToCharacter = (id, exp) => {
    setCharacters((prev) =>
      prev.map((char) => {
        if (char.id !== id) return char;

        const newExp = char.exp + exp;
        let newLevel = char.level;
        let remainingExp = newExp;

        while (remainingExp >= char.expToNextLevel) {
          remainingExp -= char.expToNextLevel;
          newLevel += 1;
        }

        return {
          ...char,
          exp: remainingExp,
          level: newLevel,
        };
      })
    );
  };

  return (
    <CharacterContext.Provider value={{ characters, addExpToCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
}

export const useCharacters = () => useContext(CharacterContext);
