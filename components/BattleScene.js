// Datei: components/BattleScene.js
import { StyleSheet, View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useThemeContext } from "../context/ThemeContext";
import { useTeam } from "../context/TeamContext";
import { Image } from "expo-image";
import CharacterSelectButton from "./CharacterSelectButton";

export default function BattleScene({
  bossName,
  bossImage,
  difficultyLabel,
  hp,
  bossDefeated,
  handleFight,
}) {
  const { theme } = useThemeContext();
  const navigation = useNavigation();
  const { team, activeMemberId } = useTeam();
  const activeMember = team.find((m) => m.id === activeMemberId);

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={[styles.overlay, { paddingHorizontal: 20 }]}
        onPress={() => {
          if (!bossDefeated) {
            handleFight(team);
          }
        }}
      >
        {/* --- Obere Hälfte: Boss-Bereich --- */}
        <View style={styles.bossContainer}>
          <Text
            style={[
              styles.title,
              {
                color: theme.textColor,
                backgroundColor: theme.accentColor,
                borderColor: theme.shadowColor,
                shadowColor: theme.shadowColor,
              },
            ]}
          >
            {bossName} ({difficultyLabel})
          </Text>

          <View
            style={[
              styles.hpBarContainer,
              { backgroundColor: theme.shadowColor },
            ]}
          >
            <View
              style={[
                styles.hpBar,
                { width: `${hp}%`, backgroundColor: theme.accentColor },
              ]}
            />
          </View>

          {bossImage ? (
            <Image
              source={{ uri: bossImage }}
              style={styles.bossImage}
              contentFit="contain"
              transition={300}
            />
          ) : (
            <Text style={[styles.errorText, { color: theme.textColor }]}>
              ⚠️ Kein Bossbild vorhanden
            </Text>
          )}

          {bossDefeated && (
            <Text style={[styles.victory, { color: theme.accentColor }]}>
              ✅ Du hast {bossName} besiegt!
            </Text>
          )}
        </View>

        {/* --- Untere Hälfte: Aktiver Kämpfer --- */}
        <View style={styles.teamContainer}>
          <Text style={[styles.teamHeading, { color: theme.textColor }]}>
            Aktiver Kämpfer
          </Text>

          {activeMember ? (
            <View style={styles.teamAvatarWrapper}>
              <Image
                source={{ uri: activeMember.avatar }}
                style={styles.teamAvatar}
                contentFit="contain"
                transition={300}
              />
              <Text
                style={[styles.teamMemberLevel, { color: theme.textColor }]}
              >
                {activeMember.name} – Lv {activeMember.level}
              </Text>
              <Text
                style={[styles.teamMemberLevel, { color: theme.textColor }]}
              >
                {activeMember.exp} / {activeMember.expToNextLevel} XP
              </Text>
            </View>
          ) : (
            <Text style={[styles.noTeamText, { color: theme.textColor }]}>
              Kein aktives Team-Mitglied ausgewählt
            </Text>
          )}

          <CharacterSelectButton />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    left: 20,
    zIndex: 10,
    padding: 6,
    borderRadius: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between", // teilt in zwei gleich große Bereiche
    paddingVertical: 20,
    zIndex: 5,
  },
  bossContainer: {
    flex: 1, // obere Hälfte
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    letterSpacing: 1.2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    marginBottom: 12,
  },
  hpBarContainer: {
    width: "100%",
    height: 16,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
  },
  hpBar: {
    height: "100%",
    borderRadius: 10,
  },
  bossImage: {
    width: 200,
    height: 200,
  },
  victory: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  errorText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  teamContainer: {
    flex: 1, // untere Hälfte
    borderTopWidth: 1,
    borderTopColor: "#FFF",
    paddingTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  teamHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  noTeamText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  teamAvatarWrapper: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  teamAvatar: {
    width: 200,
    height: 200,
    borderRadius: 24,
  },
  teamMemberLevel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});
