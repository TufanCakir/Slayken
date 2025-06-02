// Datei: screens/NewsScreen.js

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import ScreenLayout from "../components/ScreenLayout";
import { useThemeContext } from "../context/ThemeContext";
import newsData from "../data/newsData.json";
import { t } from "../i18n"; // ← Übersetzungsfunktion importieren

export default function NewsScreen() {
  const { theme } = useThemeContext();

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => Linking.openURL(item.uri)}>
      <View
        style={[
          styles.item,
          {
            backgroundColor: theme.accentColor,
            shadowColor: theme.shadowColor,
          },
        ]}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          contentFit="contain"
        />
        <Text style={[styles.itemText, { color: theme.textColor }]}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout style={styles.container}>
      <Text
        style={[
          styles.header,
          { color: theme.textColor, backgroundColor: theme.accentColor },
        ]}
      >
        {t("newsTitle")}
      </Text>

      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={[
              styles.empty,
              { color: theme.textColor, backgroundColor: theme.accentColor },
            ]}
          >
            {t("noNews")}
          </Text>
        }
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footerWrapper} />
    </ScreenLayout>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    textAlign: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: Platform.OS === "android" ? 2 : 0,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    zIndex: 2,
  },
  item: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: Platform.OS === "android" ? 2 : 0,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 12,
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    zIndex: 2,
  },
  footerWrapper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});
