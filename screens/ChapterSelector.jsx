import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function ChapterSelector({
  chapters,
  onSelectChapter,
  unlockedChapters,
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {chapters.map((chapter, index) => {
        const isUnlocked = unlockedChapters.includes(chapter.id);
        return (
          <TouchableOpacity
            key={chapter.id}
            onPress={() => isUnlocked && onSelectChapter(chapter)}
            style={[styles.card, !isUnlocked && styles.locked]}
            activeOpacity={0.8}
          >
            <Image source={{ uri: chapter.image }} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{chapter.title}</Text>
              {chapter.description && (
                <Text style={styles.desc}>{chapter.description}</Text>
              )}
            </View>
            {!isUnlocked && (
              <View style={styles.overlay}>
                <Text style={styles.lockText}>🔒 Gesperrt</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: "center",
  },
  card: {
    width: 300,
    height: 180,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111",
    elevation: 4,
  },
  locked: {
    opacity: 0.5,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  textContainer: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  desc: {
    fontSize: 14,
    color: "#ddd",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
