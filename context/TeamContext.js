import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import teamData from "../data/teamData.json";

const GITHUB_BASE =
  "https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/characters";

const defaultTeam = teamData.map((member) => ({
  ...member,
  avatar: `${GITHUB_BASE}/${member.avatar}`,
  exp: member.exp || 0,
  level: member.level || 1,
  expToNextLevel: member.expToNextLevel || 100,
}));

const TeamContext = createContext();

export function TeamProvider({ children }) {
  const [team, setTeam] = useState(defaultTeam);
  const [activeMemberId, setActiveMemberId] = useState(defaultTeam[0]?.id);

  // ✅ Lade Team + activeMemberId
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTeam = await AsyncStorage.getItem("team");
        const savedActive = await AsyncStorage.getItem("activeMemberId");

        if (savedTeam) {
          const parsed = JSON.parse(savedTeam);
          const loadedTeam = parsed.map((member) => ({
            ...member,
            avatar: `${GITHUB_BASE}/${member.avatarName}`,
            exp: member.exp ?? 0,
            level: member.level ?? 1,
            expToNextLevel: member.expToNextLevel ?? 100,
          }));

          setTeam(loadedTeam);
          setActiveMemberId(savedActive ?? loadedTeam[0]?.id);
        } else {
          setTeam(defaultTeam);
          setActiveMemberId(defaultTeam[0]?.id);
        }
      } catch (err) {
        console.error("Fehler beim Laden von Team oder aktivem Kämpfer:", err);
        setTeam(defaultTeam);
        setActiveMemberId(defaultTeam[0]?.id);
      }
    };

    loadData();
  }, []);

  // ✅ Speichere Team
  useEffect(() => {
    const saveTeam = async () => {
      try {
        const serializable = team.map((member) => ({
          ...member,
          avatarName: member.avatar.split("/").pop(),
        }));
        await AsyncStorage.setItem("team", JSON.stringify(serializable));
      } catch (err) {
        console.error("Fehler beim Speichern des Teams:", err);
      }
    };
    saveTeam();
  }, [team]);

  // ✅ Speichere aktiven Kämpfer
  useEffect(() => {
    AsyncStorage.setItem("activeMemberId", activeMemberId).catch((err) =>
      console.error("Fehler beim Speichern von activeMemberId:", err)
    );
  }, [activeMemberId]);

  // ✅ XP mit Level-Up
  const addXpToMember = (id, xpGained) => {
    setTeam((prevTeam) =>
      prevTeam.map((member) => {
        if (member.id !== id) return member;

        let newExp = member.exp + xpGained;
        let newLevel = member.level;
        let expToNext = member.expToNextLevel;

        while (newExp >= expToNext) {
          newExp -= expToNext;
          newLevel += 1;
          expToNext = Math.floor(expToNext * 1.25);
        }

        return {
          ...member,
          exp: newExp,
          level: newLevel,
          expToNextLevel: expToNext,
        };
      })
    );
  };

  const addMember = (member) => {
    if (team.some((m) => m.id === member.id)) return;
    setTeam((prev) => [
      ...prev,
      {
        ...member,
        exp: member.exp ?? 0,
        level: member.level ?? 1,
        expToNextLevel: member.expToNextLevel ?? 100,
        avatar: `${GITHUB_BASE}/${member.avatar}`,
      },
    ]);
  };

  const removeMember = (id) => {
    setTeam((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      if (activeMemberId === id && updated.length > 0) {
        setActiveMemberId(updated[0].id);
      }
      return updated;
    });
  };

  const updateMember = (id, data) => {
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  };

  return (
    <TeamContext.Provider
      value={{
        team,
        setTeam,
        addMember,
        removeMember,
        updateMember,
        addXpToMember,
        activeMemberId,
        setActiveMemberId,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
}
