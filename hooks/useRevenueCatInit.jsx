import Constants from "expo-constants";
import Purchases from "react-native-purchases";
import { useEffect } from "react";

export default function useRevenueCatInit() {
  useEffect(() => {
    const apiKey = Constants.expoConfig?.extra?.revenueCatApiKey;

    if (!apiKey) {
      console.warn(
        "RevenueCat API Key nicht gefunden! Bitte .env und app.config.js prüfen."
      );
      return;
    }

    Purchases.configure({ apiKey });
  }, []);
}
