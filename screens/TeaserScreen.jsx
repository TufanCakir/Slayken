import { FlatList, StyleSheet } from "react-native";
import ScreenLayout from "../components/ScreenLayout";
import teaserData from "../data/teaserData.json";
import TeaserCard from "../components/TeaserCard";

export default function TeaserScreen() {
  return (
    <ScreenLayout style={styles.container}>
      <FlatList
        data={teaserData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TeaserCard item={item} />}
        contentContainerStyle={styles.list}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  list: {
    padding: 20,
    paddingBottom: 60,
  },
});
