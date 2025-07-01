import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import classData from "../data/classData.json";
import { getClassImageUrl } from "../utils/classUtils";
import { skillPool } from "../data/skillPool";

const CLASS_LIST_KEY = "classList";
const ACTIVE_CLASS_ID_KEY = "activeClassId";

const mergeSkills = (skillRefs = []) => {
  return skillRefs
    .map((ref) => {
      const full = skillPool.find((s) => s.id === ref.id);
      return full ? { ...full, ...ref } : null;
    })
    .filter(Boolean);
};

const enrichClassMember = (member) => {
  const original =
    classData.find((c) => c.id === member.baseId || member.id) || {};
  return {
    ...original,
    ...member,
    classUrl: getClassImageUrl(member.baseId || member.id),
    skills: mergeSkills(member.skills ?? original.skills ?? []),
    exp: member.exp ?? 0,
    level: member.level ?? 1,
    expToNextLevel: member.expToNextLevel ?? 100,
    equipment: member.equipment || {}, // 👈 NEU: default leeres Objekt
  };
};

const ClassContext = createContext();

export const ClassProvider = ({ children }) => {
  const [activeClassId, setActiveClassId] = useState(null);
  const [classList, setClassList] = useState([]);

  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const savedList = await AsyncStorage.getItem(CLASS_LIST_KEY);
        const savedId = await AsyncStorage.getItem(ACTIVE_CLASS_ID_KEY);

        const parsedList = savedList
          ? JSON.parse(savedList).map(enrichClassMember)
          : []; // 🚫 kein Fallback zu classData

        setClassList(parsedList);

        if (savedId) {
          setActiveClassId(savedId);
        } else if (parsedList.length > 0) {
          const fallbackId = parsedList[0].id;
          setActiveClassId(fallbackId);
          await AsyncStorage.setItem(ACTIVE_CLASS_ID_KEY, fallbackId);
        } else {
          setActiveClassId(null);
        }
      } catch (error) {
        console.error("Fehler beim Laden der Klassen:", error);
      }
    };

    loadFromStorage();
  }, []);

  const saveClassList = async (list) => {
    try {
      await AsyncStorage.setItem(CLASS_LIST_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Fehler beim Speichern der classList:", e);
    }
  };

  const updateActiveClass = async (id) => {
    setActiveClassId(id);
    await AsyncStorage.setItem(ACTIVE_CLASS_ID_KEY, id);
  };

  // NEU: addCharacter jetzt INNEN!
  const addCharacter = async (character) => {
    // Keine Duplikate
    if (classList.some((char) => char.id === character.id)) return;
    const newList = [...classList, enrichClassMember(character)];
    setClassList(newList);
    await saveClassList(newList);
  };

  const updateCharacter = async (updatedChar) => {
    const exists = classList.some((char) => char.id === updatedChar.id);
    let updatedList;
    if (exists) {
      updatedList = classList.map((char) =>
        char.id === updatedChar.id ? { ...char, ...updatedChar } : char
      );
    } else {
      updatedList = [...classList, enrichClassMember(updatedChar)];
    }
    setClassList(updatedList);
    await saveClassList(updatedList);
  };

  const equipItem = async (charId, slot, equipmentId) => {
    setClassList((prevList) =>
      prevList.map((char) =>
        char.id === charId
          ? {
              ...char,
              equipment: {
                ...(char.equipment || {}),
                [slot]: equipmentId, // ← Kann auch null sein!
              },
            }
          : char
      )
    );
    setClassList(updatedList);
    await saveClassList(updatedList);
  };

  const deleteClass = async (id) => {
    const newList = classList.filter((cls) => cls.id !== id);
    setClassList(newList);
    await saveClassList(newList);

    if (activeClassId === id) {
      const fallbackId = newList[0]?.id || null;
      setActiveClassId(fallbackId);

      if (fallbackId) {
        await AsyncStorage.setItem(ACTIVE_CLASS_ID_KEY, fallbackId);
      } else {
        await AsyncStorage.removeItem(ACTIVE_CLASS_ID_KEY);
      }
    }
  };

  const resetCharacterList = async () => {
    const resetList = classData.map(enrichClassMember);
    setClassList(resetList);
    const fallbackId = resetList[0]?.id;
    setActiveClassId(fallbackId);
    await AsyncStorage.setItem(CLASS_LIST_KEY, JSON.stringify(resetList));
    await AsyncStorage.setItem(ACTIVE_CLASS_ID_KEY, fallbackId);
  };

  const clearAllClasses = async () => {
    setClassList([]);
    setActiveClassId(null);
    await AsyncStorage.removeItem(CLASS_LIST_KEY);
    await AsyncStorage.removeItem(ACTIVE_CLASS_ID_KEY);
  };

  return (
    <ClassContext.Provider
      value={{
        activeClassId,
        setActiveClassId: updateActiveClass,
        classList,
        addCharacter, // <--- HIER NEU!
        updateCharacter,
        equipItem, // 👈 NEU
        resetCharacterList,
        deleteClass,
        clearAllClasses, // 🧼 Neu hinzugefügt
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => useContext(ClassContext);
