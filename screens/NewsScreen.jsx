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
import newsData from "../data/newsData.json";
import { t } from "../i18n";

// BLUE-THEME COLORS
const BLUE_BG = "#0f172a";
const BLUE_CARD = "#1e293b";
const BLUE_BORDER = "#2563eb";
const BLUE_SHADOW = "#60a5fa";
const BLUE_ACCENT = "#38bdf8";
const BLUE_TEXT = "#f0f9ff";
const BLUE_MUTED = "#a7c7e7";

export default function NewsScreen() {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => Linking.openURL(item.uri)}
      activeOpacity={0.89}
    >
      <View style={styles.item}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          contentFit="contain"
        />
        <Text style={styles.itemText}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout style={styles.container}>
      <Text style={styles.header}>{t("newsTitle")}</Text>

      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>{t("noNews")}</Text>}
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
    backgroundColor: BLUE_BG,
    paddingTop: 40,
  },
  header: {
    textAlign: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    fontWeight: "bold",
    fontSize: 25,
    color: BLUE_ACCENT,
    letterSpacing: 0.6,
    backgroundColor: `${BLUE_CARD}dd`,
    textShadowColor: "#334155",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: Platform.OS === "android" ? 2 : 0,
  },
  listContainer: {
    paddingHorizontal: 18,
    paddingBottom: 80,
    zIndex: 2,
  },
  item: {
    backgroundColor: BLUE_CARD,
    borderRadius: 18,
    marginBottom: 18,
    shadowColor: BLUE_SHADOW,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: Platform.OS === "android" ? 4 : 0,
    borderWidth: 2,
    borderColor: `${BLUE_BORDER}44`,
    padding: 10,
  },
  itemText: {
    fontSize: 17,
    fontWeight: "600",
    color: BLUE_TEXT,
    marginTop: 12,
    letterSpacing: 0.12,
    textShadowColor: "#334155",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  image: {
    width: "100%",
    height: 165,
    borderRadius: 13,
    backgroundColor: "#172138",
  },
  empty: {
    textAlign: "center",
    marginTop: 54,
    fontSize: 17,
    color: BLUE_MUTED,
    zIndex: 2,
  },
  footerWrapper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});
