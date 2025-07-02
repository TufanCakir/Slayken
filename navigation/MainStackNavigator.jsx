import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useThemeContext } from "../context/ThemeContext";

// Alle Screens zentral importiert
import StartScreen from "../screens/StartScreen";
import HomeScreen from "../screens/HomeScreen";
import StoryScreen from "../screens/StoryScreen";
import EndlessModeScreen from "../screens/EndlessModeScreen";
import EventScreen from "../screens/EventScreen";
import NewsScreen from "../screens/NewsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import GiftScreen from "../screens/GiftScreen";
import MissionScreen from "../screens/MissionScreen";
import ShopScreen from "../screens/ShopScreen";
import ExchangeScreen from "../screens/ExchangeScreen";
import CreateCharacterScreen from "../screens/CreateCharacterScreen";
import CharacterSelectScreen from "../screens/CharacterSelectScreen";
import CharacterOverviewScreen from "../screens/CharacterOverviewScreen";
import TutorialStartScreen from "../screens/TutorialStartScreen";
import VictoryScreen from "../screens/VictoryScreen";
import ToSScreen from "../screens/ToSScreen";
import LoginScreen from "../screens/LoginScreen";
import PreBattleInfoScreen from "../screens/PreBattleInfoScreen";
import TeaserScreen from "../screens/TeaserScreen";
import CharacterEquipmentScreen from "../screens/CharacterEquipmentScreen";

const Stack = createNativeStackNavigator();

// Hilfsfunktion für die Übergabe von Assets/Props an alle Screens
function withAssets(ScreenComponent, assets) {
  return function WrappedScreen(props) {
    return <ScreenComponent {...props} {...assets} />;
  };
}

export default function MainStackNavigator({ data, localUris, imageMap }) {
  const { theme, uiThemeType } = useThemeContext();

  const assets = { data, localUris, imageMap };
  const defaultOptions = {
    headerShown: false,
    gestureEnabled: true,
    animation: Platform.OS === "ios" ? "default" : "slide_from_right",
    presentation: "card",
    contentStyle: {
      backgroundColor: "transparent",
    },
  };

  return (
    <Stack.Navigator
      initialRouteName="StartScreen"
      screenOptions={defaultOptions}
    >
      {/* Main Screens */}
      <Stack.Screen
        name="StartScreen"
        component={withAssets(StartScreen, assets)}
      />
      <Stack.Screen
        name="HomeScreen"
        component={withAssets(HomeScreen, assets)}
      />
      <Stack.Screen
        name="StoryScreen"
        component={withAssets(StoryScreen, assets)}
      />
      <Stack.Screen
        name="EndlessModeScreen"
        component={withAssets(EndlessModeScreen, assets)}
      />
      <Stack.Screen
        name="EventScreen"
        component={withAssets(EventScreen, assets)}
      />
      <Stack.Screen
        name="NewsScreen"
        component={withAssets(NewsScreen, assets)}
      />
      <Stack.Screen
        name="SettingsScreen"
        component={withAssets(SettingsScreen, assets)}
      />
      <Stack.Screen
        name="GiftScreen"
        component={withAssets(GiftScreen, assets)}
      />
      <Stack.Screen
        name="MissionScreen"
        component={withAssets(MissionScreen, assets)}
      />
      <Stack.Screen
        name="ShopScreen"
        component={withAssets(ShopScreen, assets)}
      />
      <Stack.Screen
        name="ToSScreen"
        component={withAssets(ToSScreen, assets)}
      />
      <Stack.Screen
        name="ExchangeScreen"
        component={withAssets(ExchangeScreen, assets)}
      />
      <Stack.Screen
        name="LoginScreen"
        component={withAssets(LoginScreen, assets)}
      />
      <Stack.Screen
        name="TeaserScreen"
        component={withAssets(TeaserScreen, assets)}
      />
      <Stack.Screen
        name="PreBattleInfoScreen"
        component={withAssets(PreBattleInfoScreen, assets)}
      />
      <Stack.Screen
        name="CreateCharacterScreen"
        component={withAssets(CreateCharacterScreen, assets)}
      />
      <Stack.Screen
        name="CharacterSelectScreen"
        component={withAssets(CharacterSelectScreen, assets)}
      />
      <Stack.Screen
        name="CharacterOverviewScreen"
        component={withAssets(CharacterOverviewScreen, assets)}
      />
      <Stack.Screen
        name="CharacterEquipmentScreen"
        component={withAssets(CharacterEquipmentScreen, assets)}
      />

      {/* Modals/Transparente Overlays */}
      <Stack.Group
        screenOptions={{
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="TutorialStartScreen"
          component={withAssets(TutorialStartScreen, assets)}
        />
        <Stack.Screen
          name="VictoryScreen"
          component={withAssets(VictoryScreen, assets)}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}
