import React, { Suspense, memo } from "react";
import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GlassSpinner from "../components/GlassSpinner";

// Lazy-loaded Screens
const screens = {
  StartScreen: React.lazy(() => import("../screens/StartScreen")),
  HomeScreen: React.lazy(() => import("../screens/HomeScreen")),
  StoryScreen: React.lazy(() => import("../screens/StoryScreen")),
  ShowdownScreen: React.lazy(() => import("../screens/ShowdownScreen")),
  EndlessModeScreen: React.lazy(() => import("../screens/EndlessModeScreen")),
  EventScreen: React.lazy(() => import("../screens/EventScreen")),
  NewsScreen: React.lazy(() => import("../screens/NewsScreen")),
  SettingsScreen: React.lazy(() => import("../screens/SettingsScreen")),
  GiftScreen: React.lazy(() => import("../screens/GiftScreen")),
  MissionScreen: React.lazy(() => import("../screens/MissionScreen")),
  ShopScreen: React.lazy(() => import("../screens/ShopScreen")),
  ExchangeScreen: React.lazy(() => import("../screens/ExchangeScreen")),
  CreateCharacterScreen: React.lazy(() =>
    import("../screens/CreateCharacterScreen")
  ),
  CharacterSelectScreen: React.lazy(() =>
    import("../screens/CharacterSelectScreen")
  ),
  TutorialStartScreen: React.lazy(() =>
    import("../screens/TutorialStartScreen")
  ),
  VictoryScreen: React.lazy(() => import("../screens/VictoryScreen")),
  ToSScreen: React.lazy(() => import("../screens/ToSScreen")),
  LoginScreen: React.lazy(() => import("../screens/LoginScreen")),
  PreBattleInfoScreen: React.lazy(() =>
    import("../screens/PreBattleInfoScreen")
  ),
  TeaserScreen: React.lazy(() => import("../screens/TeaserScreen")),
  InventoryScreen: React.lazy(() => import("../screens/InventoryScreen")),
  CharacterOverviewScreen: React.lazy(() =>
    import("../screens/CharacterOverviewScreen")
  ),
  ValuablesScreen: React.lazy(() => import("../screens/ValuablesScreen")),
  DimensionScreen: React.lazy(() => import("../screens/DimensionScreen")),
};

// Suspense HOC with memo for performance and stable props
const withSuspense = (Component) =>
  memo((props) => (
    <Suspense fallback={<GlassSpinner size={48} />}>
      <Component {...props} />
    </Suspense>
  ));

const Stack = createNativeStackNavigator();

// Screens that should be presented with default card style
const defaultScreenNames = [
  "StartScreen",
  "HomeScreen",
  "StoryScreen",
  "ShowdownScreen",
  "EndlessModeScreen",
  "EventScreen",
  "NewsScreen",
  "SettingsScreen",
  "GiftScreen",
  "MissionScreen",
  "ShopScreen",
  "ExchangeScreen",
  "CreateCharacterScreen",
  "CharacterSelectScreen",
  "ToSScreen",
  "LoginScreen",
  "PreBattleInfoScreen",
  "TeaserScreen",
  "InventoryScreen",
  "CharacterOverviewScreen",
  "ValuablesScreen",
  "DimensionScreen",
];

// Screens that should be modals with transparent background
const transparentModalScreenNames = ["TutorialStartScreen", "VictoryScreen"];

export default function MainStackNavigator() {
  const defaultOptions = {
    headerShown: false,
    gestureEnabled: true,
    animation: Platform.OS === "ios" ? "default" : "slide_from_right",
    presentation: "card",
  };

  const transparentModalOptions = {
    presentation: "transparentModal",
    animation: "fade",
    headerShown: false,
    contentStyle: { backgroundColor: "transparent" },
  };

  return (
    <Stack.Navigator
      initialRouteName="StartScreen"
      screenOptions={defaultOptions}
    >
      {defaultScreenNames.map((name) => (
        <Stack.Screen
          key={name}
          name={name}
          component={withSuspense(screens[name])}
        />
      ))}

      <Stack.Group screenOptions={transparentModalOptions}>
        {transparentModalScreenNames.map((name) => (
          <Stack.Screen
            key={name}
            name={name}
            component={withSuspense(screens[name])}
          />
        ))}
      </Stack.Group>
    </Stack.Navigator>
  );
}
