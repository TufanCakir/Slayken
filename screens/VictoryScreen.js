import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useChapter } from "../context/ChapterContext";
import { useThemeContext } from "../context/ThemeContext";
import { useTeam } from "../context/TeamContext";

const { width } = Dimensions.get("window");

export default function VictoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { team, addXpToMember } = useTeam();
  const { bossName, coinReward, crystalReward, xpReward, characterId } =
    route.params || {};

  const { theme } = useThemeContext();
  const { advanceChapter } = useChapter();

  const character = team.find((c) => c.id === characterId);

  // ✅ Nur 1x XP vergeben
  useEffect(() => {
    if (characterId && xpReward > 0) {
      console.log("💥 Vergibt XP an:", characterId, "XP:", xpReward);
      addXpToMember(characterId, xpReward);
    }
  }, []);

  const handleContinue = () => {
    advanceChapter();
    navigation.reset({ index: 0, routes: [{ name: "HomeScreen" }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overlayContainer}>
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: theme.accentColor,
              borderColor: theme.shadowColor,
              shadowColor: theme.shadowColor,
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.textColor }]}>Sieg!</Text>
          <Text style={[styles.subtitle, { color: theme.textColor }]}>
            Du hast {bossName} besiegt.
          </Text>

          <View style={styles.rewards}>
            <RewardText
              text={`+${coinReward} Münzen`}
              color={theme.textColor}
            />
            <RewardText
              text={`+${crystalReward} Kristalle`}
              color={theme.textColor}
            />
            <RewardText text={`+${xpReward} XP`} color={theme.textColor} />

            {character ? (
              <>
                <RewardText
                  text={`${character.name} – Level ${character.level}`}
                  color={theme.textColor}
                />
                <RewardText
                  text={`${character.exp} / ${character.expToNextLevel} XP`}
                  color={theme.textColor}
                />
              </>
            ) : (
              <RewardText
                text={`⚠️ Charakter „${characterId}“ nicht im Team`}
                color="red"
              />
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme.accentColor,
                shadowColor: theme.shadowColor,
              },
            ]}
            onPress={handleContinue}
          >
            <Text style={[styles.buttonText, { color: theme.textColor }]}>
              Weiter
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function RewardText({ text, color }) {
  return <Text style={[styles.rewardText, { color }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    width: width * 0.85,
    maxWidth: 360,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
  },
  rewards: {
    marginBottom: 24,
    alignItems: "center",
  },
  rewardText: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 4,
    textAlign: "center",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "60%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
