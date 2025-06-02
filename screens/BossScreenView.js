import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useThemeContext } from "../context/ThemeContext";
import { useChapter } from "../context/ChapterContext";
import BossScreen from "../components/BossScreen";

// JSON-Daten
import bossData from "../data/bossData.json";
import eventData from "../data/eventData.json";
import characterData from "../data/characterData.json";
import seasonalData from "../data/seasonalData.json";

const chapterMap = {
  boss: bossData,
  event: eventData,
  characters: characterData,
  seasonal: seasonalData,
};

export default function BossScreenView() {
  const route = useRoute();
  const { bossName, chapterType = "boss", chapterIndex } = route.params || {};

  const { theme, uiThemeType } = useThemeContext();
  const { setChapterType, setChapterProgress } = useChapter(); // ✅ korrekt

  useEffect(() => {
    if (typeof chapterIndex === "number") {
      setChapterProgress(chapterIndex, chapterType);
    }
    setChapterType(chapterType);
  }, [chapterIndex, chapterType]);

  const chapterList = chapterMap[chapterType] || [];
  const chapter = chapterList.find((b) => b.bossName === bossName);

  if (!chapter) {
    return (
      <View
        style={[
          styles.errorContainer,
          {
            backgroundColor:
              uiThemeType === "dark" ? theme.bgDark : theme.bgLight,
          },
        ]}
      >
        <Text style={[styles.errorText, { color: theme.textColor }]}>
          Kapitel nicht gefunden.{"\n"}({bossName} – {chapterType})
        </Text>
      </View>
    );
  }

  return (
    <BossScreen
      bossName={chapter.bossName}
      chapterTitle={chapter.title}
      chapterText={chapter.story}
      imagePath={chapter.image}
      chapterType={chapterType}
    />
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
});
