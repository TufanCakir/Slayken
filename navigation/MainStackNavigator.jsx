import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import StartScreen from "../screens/StartScreen";
import HomeScreen from "../screens/HomeScreen";
import StoryScreen from "../screens/StoryScreen";
import ShowdownScreen from "../screens/ShowdownScreen";
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
import TutorialStartScreen from "../screens/TutorialStartScreen";
import VictoryScreen from "../screens/VictoryScreen";
import ToSScreen from "../screens/ToSScreen";
import LoginScreen from "../screens/LoginScreen";
import PreBattleInfoScreen from "../screens/PreBattleInfoScreen";
import TeaserScreen from "../screens/TeaserScreen";
import InventoryScreen from "../screens/InventoryScreen";
import CharacterOverviewScreen from "../screens/CharacterOverviewScreen";
import ValuablesScreen from "../screens/ValuablesScreen";
import DimensionScreen from "../screens/DimensionScreen";

const Stack = createNativeStackNavigator();

const defaultOptions = {
  headerShown: false,
  gestureEnabled: true,
  animation: Platform.OS === "ios" ? "default" : "slide_from_right",
  presentation: "card",
};

const modalScreenOptions = {
  presentation: "transparentModal",
  animation: "fade",
  headerShown: false,
};

const mainScreens = [
  { name: "StartScreen", component: StartScreen },
  { name: "HomeScreen", component: HomeScreen },
  { name: "StoryScreen", component: StoryScreen },
  { name: "ShowdownScreen", component: ShowdownScreen },
  { name: "EventScreen", component: EventScreen },
  { name: "EndlessModeScreen", component: EndlessModeScreen },
  { name: "NewsScreen", component: NewsScreen },
  { name: "SettingsScreen", component: SettingsScreen },
  { name: "GiftScreen", component: GiftScreen },
  { name: "MissionScreen", component: MissionScreen },
  { name: "ShopScreen", component: ShopScreen },
  { name: "ToSScreen", component: ToSScreen },
  { name: "ExchangeScreen", component: ExchangeScreen },
  { name: "LoginScreen", component: LoginScreen },
  { name: "TeaserScreen", component: TeaserScreen },
  { name: "InventoryScreen", component: InventoryScreen },
  { name: "ValuablesScreen", component: ValuablesScreen },
  { name: "DimensionScreen", component: DimensionScreen },
  { name: "PreBattleInfoScreen", component: PreBattleInfoScreen },
  { name: "CreateCharacterScreen", component: CreateCharacterScreen },
  { name: "CharacterSelectScreen", component: CharacterSelectScreen },
  { name: "CharacterOverviewScreen", component: CharacterOverviewScreen },
];

const modalScreens = [
  { name: "TutorialStartScreen", component: TutorialStartScreen },
  { name: "VictoryScreen", component: VictoryScreen },
];

export default function MainStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="StartScreen"
      screenOptions={defaultOptions}
    >
      {mainScreens.map(({ name, component }) => (
        <Stack.Screen key={name} name={name} component={component} />
      ))}

      <Stack.Group screenOptions={modalScreenOptions}>
        {modalScreens.map(({ name, component }) => (
          <Stack.Screen key={name} name={name} component={component} />
        ))}
      </Stack.Group>
    </Stack.Navigator>
  );
}
