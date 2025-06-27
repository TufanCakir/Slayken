import { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import ScreenLayout from "../components/ScreenLayout";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useGifts } from "../context/GiftContext";
import GiftBox from "../components/GiftBox";
import giftData from "../data/giftData.json";
import { t } from "../i18n";
import { useThemeContext } from "../context/ThemeContext";

export default function GiftScreen() {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { addXp } = useAccountLevel();
  const { collectedGifts, collectGift, collectMultipleGifts } = useGifts();

  const [refreshFlag, setRefreshFlag] = useState(false);

  const gifts = useMemo(
    () =>
      giftData.map((gift) => {
        let icon;
        switch (gift.type) {
          case "coins":
            icon = () => (
              <FontAwesome5 name="coins" size={50} color={theme.textColor} />
            );
            break;
          case "crystals":
            icon = () => (
              <MaterialCommunityIcons
                name="cards-diamond"
                size={50}
                color={theme.textColor}
              />
            );
            break;
          case "exp":
            icon = () => (
              <FontAwesome5 name="fire" size={50} color={theme.textColor} />
            );
            break;
          case "box":
            icon = GiftBox;
            break;
          default:
            icon = () => (
              <FontAwesome name="gift" size={50} color={theme.textColor} />
            );
        }
        return { ...gift, icon };
      }),
    [theme]
  );

  const remainingGifts = gifts.filter((gift) => !collectedGifts[gift.id]);
  const allCollected = remainingGifts.length === 0;

  const handleCollect = async (item) => {
    if (collectedGifts[item.id]) return;
    await collectGift(item.id);
    if (item.type === "coins" && item.amount) addCoins(item.amount);
    if (item.type === "crystals" && item.amount) addCrystals(item.amount);
    if (item.type === "exp" && item.amount) addXp(item.amount);
    setRefreshFlag((prev) => !prev);
  };

  const collectAll = async () => {
    const idsToCollect = remainingGifts.map((gift) => gift.id);
    await collectMultipleGifts(idsToCollect);
    for (const gift of remainingGifts) {
      if (gift.type === "coins" && gift.amount) addCoins(gift.amount);
      if (gift.type === "crystals" && gift.amount) addCrystals(gift.amount);
      if (gift.type === "exp" && gift.amount) addXp(gift.amount);
    }
    setRefreshFlag((prev) => !prev);
  };

  const renderItem = ({ item }) => {
    const Icon = item.icon;
    const isCollected = collectedGifts[item.id];
    return (
      <TouchableOpacity
        style={[
          styles.giftItem,
          {
            backgroundColor: isCollected ? "#222" : theme.accentColor,
            borderColor: theme.borderColor,
            shadowColor: isCollected ? "#0000" : theme.shadowColor,
          },
        ]}
        activeOpacity={isCollected ? 1 : 0.8}
        onPress={() => !isCollected && handleCollect(item)}
        disabled={isCollected}
      >
        <View style={styles.iconWrapper}>
          <Icon />
        </View>
        <Text
          style={[
            styles.giftName,
            {
              color: isCollected ? "#666" : theme.textColor,
            },
          ]}
        >
          {isCollected ? "✓ " : ""}
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout style={{ flex: 1 }}>
      <Text style={styles.header}>{t("giftsTitle")}</Text>

      <FlatList
        data={remainingGifts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>{t("noGifts")}</Text>}
        contentContainerStyle={styles.listContainer}
        extraData={refreshFlag}
      />

      {!allCollected && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.blueButton}
            onPress={collectAll}
            activeOpacity={0.87}
          >
            <Text style={styles.blueButtonText}>{t("collectAll")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenLayout>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    header: {
      fontSize: 26,
      fontWeight: "bold",
      marginBottom: 12,
      textAlign: "center",
      color: theme.textColor,
      letterSpacing: 0.5,
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 5,
      marginTop: 10,
    },
    listContainer: {
      paddingBottom: 80,
      zIndex: 2,
      paddingHorizontal: 10,
    },
    giftItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderRadius: 10,
      marginBottom: 8,
      ...Platform.select({
        ios: {
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.18,
          shadowRadius: 8,
        },
        android: { elevation: 4 },
      }),
      zIndex: 2,
    },
    iconWrapper: {
      width: 54,
      height: 54,
      marginRight: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    giftName: {
      fontSize: 19,
      fontWeight: "600",
      flex: 1,
      letterSpacing: 0.2,
    },
    buttonGroup: {
      marginVertical: 20,
      paddingHorizontal: 16,
      gap: 12,
      position: "absolute",
      bottom: 95,
      width: "100%",
      alignItems: "center",
    },
    blueButton: {
      backgroundColor: theme.textColor,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 34,
      alignItems: "center",
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.19,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    blueButtonText: {
      color: theme.accentColor,
      fontWeight: "bold",
      fontSize: 18,
      letterSpacing: 0.18,
    },
    empty: {
      textAlign: "center",
      marginTop: 34,
      fontSize: 17,
      color: theme.textColor,
      zIndex: 2,
    },
  });
}
