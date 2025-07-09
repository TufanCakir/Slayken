import "dotenv/config";

export default {
  expo: {
    name: "Slayken",
    slug: "slayken",
    version: "2.0.3",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      enabled: true,
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/7093121d-57da-48ed-b15c-1d419bfa27f4",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.tufancakir.myslayken",
      buildNumber: "17",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["expo-localization"],
    runtimeVersion: {
      policy: "appVersion",
    },
    extra: {
      eas: {
        projectId: "7093121d-57da-48ed-b15c-1d419bfa27f4",
      },
      revenueCatApiKey: process.env.REVENUECAT_PUBLIC_API_KEY,
    },
  },
};
