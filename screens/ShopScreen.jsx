import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import ScreenLayout from "../components/ScreenLayout";
import { useShop } from "../context/ShopContext";

const SHOP_ITEMS = [
  {
    id: "sylas_exclusive",
    name: "Skin: Reon Dragonheart (Exclusive)",
    price: 3.99,
    iapId: "skin_reon_dragonheart_exclusive2",
    category: "Skin",
    currency: ["iap"],
    characterId: "sylas",
    baseId: "sylas",
    skinImage:
      "https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/classes/reon-dragonheart.png",
  },
];

export default function ShopScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { unlockSkin, restorePurchases, isUnlocked } = useShop();

  // Kein configure hier mehr nötig!

  const handleBuy = async (item) => {
    setIsLoading(true);
    try {
      const { customerInfo } = await Purchases.purchaseStoreProduct(item.iapId);
      const isEntitlementUnlocked =
        customerInfo.entitlements.active[item.iapId];
      if (isEntitlementUnlocked) {
        unlockSkin(item.id);
        Alert.alert("Kauf erfolgreich!", `${item.name} wurde freigeschaltet.`);
        restorePurchases();
      } else {
        Alert.alert(
          "Nicht freigeschaltet",
          "Dein Kauf wurde von Apple/Google noch nicht bestätigt. Versuche es bitte in wenigen Minuten erneut – der Skin wird automatisch freigeschaltet, sobald die Zahlung bestätigt ist."
        );
      }
    } catch (error) {
      if (!error.userCancelled) {
        Alert.alert(
          "Kauf fehlgeschlagen",
          error.message ||
            "Leider konnte der Kauf nicht abgeschlossen werden. Bitte überprüfe deine Internetverbindung oder versuche es später erneut."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenLayout style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 26,
          fontWeight: "bold",
          color: "#fff",
          marginBottom: 24,
        }}
      >
        Shop
      </Text>

      {/* Restore Button (optional) */}
      <TouchableOpacity
        onPress={restorePurchases}
        style={{
          alignSelf: "flex-end",
          marginBottom: 12,
          backgroundColor: "#444",
          borderRadius: 12,
          paddingVertical: 8,
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Käufe wiederherstellen
        </Text>
      </TouchableOpacity>

      {SHOP_ITEMS.map((item) => {
        const purchased = isUnlocked(item);
        return (
          <View
            key={item.id}
            style={{
              backgroundColor: "#222",
              borderRadius: 18,
              padding: 16,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <Image
              source={{ uri: item.skinImage }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                marginRight: 18,
              }}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
                {item.name}
              </Text>
              <Text style={{ color: "#aaa", fontSize: 15, marginTop: 4 }}>
                Charakter: {item.baseId}
              </Text>
              <Text
                style={{
                  color: "#6fcf97",
                  fontSize: 16,
                  marginTop: 8,
                  fontWeight: "bold",
                }}
              >
                {item.price} €
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleBuy(item)}
              disabled={purchased || isLoading}
              style={{
                backgroundColor: purchased ? "#454" : "#6fcf97",
                paddingVertical: 12,
                paddingHorizontal: 22,
                borderRadius: 14,
                opacity: isLoading && !purchased ? 0.7 : 1,
                marginLeft: 6,
              }}
            >
              {isLoading && !purchased ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 15,
                  }}
                >
                  {purchased ? "Gekauft" : "Kaufen"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </ScreenLayout>
  );
}
