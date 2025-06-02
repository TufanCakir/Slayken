// Datei: components/EventList.js
import React from "react";
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "expo-image";

import { useThemeContext } from "../context/ThemeContext";
import ScreenLayout from "./ScreenLayout";
import FotoButtons from "./FotoButtons";

// Wrapper, damit ViewShot ref-getriggert wird (importiere ViewShot)
import ViewShot from "react-native-view-shot";
const ViewShotWrapper = React.forwardRef((props, ref) => (
  <ViewShot
    ref={ref}
    options={{ format: "png", quality: 0.8 }}
    style={{ flex: 1 }}
  >
    {props.children}
  </ViewShot>
));

export default function EventList({
  availableEvents,
  viewShotRef,
  onSelectEvent,
  takeScreenshot,
}) {
  const { theme } = useThemeContext();

  return (
    <ScreenLayout
      style={[
        styles.container,
        { backgroundColor: theme.bgImage ? undefined : theme.backgroundColor },
      ]}
    >
      <ViewShotWrapper ref={viewShotRef}>
        <Text style={[styles.heading, { color: theme.textColor }]}>
          Verfügbare Events
        </Text>

        {availableEvents.length === 0 ? (
          <Text style={[styles.message, { color: theme.textColor }]}>
            Du hast noch keine Events freigeschaltet. Kaufe Items im Shop und
            lasse dich überraschen.
          </Text>
        ) : (
          <FlatList
            data={availableEvents}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.accentColor,
                    borderColor: theme.borderColor,
                    shadowColor: theme.shadowColor,
                  },
                ]}
                onPress={() => onSelectEvent(item)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  contentFit="contain"
                  transition={300}
                />
                <Text style={[styles.title, { color: theme.textColor }]}>
                  {item.title}
                </Text>
                <Text style={[styles.story, { color: theme.textColor }]}>
                  {item.story}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        <FotoButtons
          onPress={takeScreenshot}
          buttonColor={theme.accentColor}
          textColor={theme.textColor}
        />
      </ViewShotWrapper>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    // Schatten für iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // Elevation für Android
    elevation: 6,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  story: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
