import React, { useCallback } from "react";
import { FlatList, StyleSheet } from "react-native";
import ScreenLayout from "../components/ScreenLayout";
import teaserData from "../data/teaserData.json";
import TeaserCard from "../components/TeaserCard";

// Falls TeaserCard nicht schon memoized ist:
const MemoTeaserCard = React.memo(TeaserCard);

export default function TeaserScreen() {
  // Memoisierte renderItem-Funktion
  const renderItem = useCallback(
    ({ item }) => <MemoTeaserCard item={item} />,
    []
  );

  return (
    <ScreenLayout style={styles.container}>
      <FlatList
        data={teaserData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        // extraData={...} // falls z.B. Theme als Abhängigkeit nötig ist
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 20,
    paddingBottom: 60,
  },
});
