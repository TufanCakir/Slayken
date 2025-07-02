import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import classData from "../data/classData.json";
import { getClassImageUrl } from "../utils/classUtils";
import { skillPool } from "../data/skillPool";

const CLASS_LIST_KEY = "classList";
const ACTIVE_CLASS_ID_KEY = "activeClassId";

const mergeSkills = (skillRefs = []) =>
  skillRefs
    .map((ref) => {
      const full = skillPool.find((s) => s.id === ref.id);
      return full ? { ...full, ...ref } : null;
    })
    .filter(Boolean);

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
    equipment: member.equipment || {},
  };
};

const ClassContext = createContext();

export const ClassProvider = ({ children }) => {
  const [activeClassId, setActiveClassId] = useState(null);
  const [classList, setClassList] = useState([]);

  // Lädt Daten aus AsyncStorage beim Mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const savedListRaw = await AsyncStorage.getItem(CLASS_LIST_KEY);
        const savedId = await AsyncStorage.getItem(ACTIVE_CLASS_ID_KEY);
        const parsedList = savedListRaw
          ? JSON.parse(savedListRaw).map(enrichClassMember)
          : [];
        if (!mounted) return;

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
      } catch (e) {
        console.error("Fehler beim Laden der Klassen:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Speichert die Liste im Storage (immer als Utility, kein useCallback nötig)
  const saveClassList = async (list) => {
    try {
      await AsyncStorage.setItem(CLASS_LIST_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Fehler beim Speichern der classList:", e);
    }
  };

  // Setzt aktive Klasse und speichert im Storage
  const updateActiveClass = useCallback(async (id) => {
    setActiveClassId(id);
    await AsyncStorage.setItem(ACTIVE_CLASS_ID_KEY, id);
  }, []);

  // Fügt einen neuen Charakter hinzu, falls nicht vorhanden
  const addCharacter = useCallback(async (character) => {
    setClassList((prevList) => {
      if (prevList.some((char) => char.id === character.id)) return prevList;
      const newList = [...prevList, enrichClassMember(character)];
      saveClassList(newList);
      return newList;
    });
  }, []);

  // Aktualisiert existierenden Charakter oder fügt neuen hinzu
  const updateCharacter = useCallback(async (updatedChar) => {
    setClassList((prevList) => {
      const exists = prevList.some((char) => char.id === updatedChar.id);
      let updatedList;
      if (exists) {
        updatedList = prevList.map((char) =>
          char.id === updatedChar.id ? { ...char, ...updatedChar } : char
        );
      } else {
        updatedList = [...prevList, enrichClassMember(updatedChar)];
      }
      saveClassList(updatedList);
      return updatedList;
    });
  }, []);

  // Item ausrüsten
  const equipItem = useCallback(async (charId, slot, equipmentId) => {
    setClassList((prevList) => {
      const updatedList = prevList.map((char) =>
        char.id === charId
          ? {
              ...char,
              equipment: {
                ...(char.equipment || {}),
                [slot]: equipmentId,
              },
            }
          : char
      );
      saveClassList(updatedList);
      return updatedList;
    });
  }, []);

  // Löscht Klasse aus Liste und passt activeClassId an
  const deleteClass = useCallback(
    async (id) => {
      setClassList((prevList) => {
        const newList = prevList.filter((cls) => cls.id !== id);
        saveClassList(newList);

        if (activeClassId === id) {
          const fallbackId = newList[0]?.id || null;
          setActiveClassId(fallbackId);
          if (fallbackId) {
            AsyncStorage.setItem(ACTIVE_CLASS_ID_KEY, fallbackId);
          } else {
            AsyncStorage.removeItem(ACTIVE_CLASS_ID_KEY);
          }
        }
        return newList;
      });
    },
    [activeClassId]
  );

  // Setzt alles zurück zu den Daten aus classData.json
  const resetCharacterList = useCallback(async () => {
    const resetList = classData.map(enrichClassMember);
    setClassList(resetList);
    const fallbackId = resetList[0]?.id;
    setActiveClassId(fallbackId);
    await AsyncStorage.setItem(CLASS_LIST_KEY, JSON.stringify(resetList));
    await AsyncStorage.setItem(ACTIVE_CLASS_ID_KEY, fallbackId);
  }, []);

  // Löscht alles
  const clearAllClasses = useCallback(async () => {
    setClassList([]);
    setActiveClassId(null);
    await AsyncStorage.removeItem(CLASS_LIST_KEY);
    await AsyncStorage.removeItem(ACTIVE_CLASS_ID_KEY);
  }, []);

  // Context Value
  const value = {
    activeClassId,
    setActiveClassId: updateActiveClass,
    classList,
    addCharacter,
    updateCharacter,
    equipItem,
    resetCharacterList,
    deleteClass,
    clearAllClasses,
  };

  return (
    <ClassContext.Provider value={value}>{children}</ClassContext.Provider>
  );
};

export const useClass = () => useContext(ClassContext);
