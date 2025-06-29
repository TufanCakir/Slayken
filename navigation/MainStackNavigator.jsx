// navigation/MainStackNavigator.js
import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useThemeContext } from "../context/ThemeContext";

// Screens...
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

const Stack = createNativeStackNavigator();

export default function MainStackNavigator({ data, localUris, imageMap }) {
  const { theme, uiThemeType } = useThemeContext();

  const defaultOptions = {
    headerShown: false,
    gestureEnabled: true,
    animation: Platform.OS === "ios" ? "default" : "slide_from_right",
    presentation: "card",
    contentStyle: {
      backgroundColor: uiThemeType === "dark" ? theme.bgDark : theme.bgLight,
    },
  };

  // Helper für prop-injection (inkl. Kommentar für Übersicht)
  function withAssets(ScreenComponent) {
    // Mit React.memo für stabile Props (optional, aber hilfreich!)
    return function WrappedScreen(props) {
      return (
        <ScreenComponent
          {...props}
          data={data}
          localUris={localUris}
          imageMap={imageMap}
        />
      );
    };
  }

  return (
    <Stack.Navigator
      initialRouteName="StartScreen"
      screenOptions={defaultOptions}
    >
      <Stack.Screen name="StartScreen" component={withAssets(StartScreen)} />
      <Stack.Screen name="HomeScreen" component={withAssets(HomeScreen)} />
      <Stack.Screen name="StoryScreen" component={withAssets(StoryScreen)} />
      <Stack.Screen
        name="EndlessModeScreen"
        component={withAssets(EndlessModeScreen)}
      />
      <Stack.Screen name="EventScreen" component={withAssets(EventScreen)} />
      <Stack.Screen name="NewsScreen" component={withAssets(NewsScreen)} />
      <Stack.Screen
        name="SettingsScreen"
        component={withAssets(SettingsScreen)}
      />
      <Stack.Screen name="GiftScreen" component={withAssets(GiftScreen)} />
      <Stack.Screen
        name="MissionScreen"
        component={withAssets(MissionScreen)}
      />
      <Stack.Screen name="ShopScreen" component={withAssets(ShopScreen)} />
      <Stack.Screen name="ToSScreen" component={withAssets(ToSScreen)} />
      <Stack.Screen
        name="ExchangeScreen"
        component={withAssets(ExchangeScreen)}
      />
      <Stack.Screen name="LoginScreen" component={withAssets(LoginScreen)} />
      <Stack.Screen name="TeaserScreen" component={withAssets(TeaserScreen)} />
      <Stack.Screen
        name="PreBattleInfoScreen"
        component={withAssets(PreBattleInfoScreen)}
      />
      <Stack.Screen
        name="CreateCharacterScreen"
        component={withAssets(CreateCharacterScreen)}
      />
      <Stack.Screen
        name="CharacterSelectScreen"
        component={withAssets(CharacterSelectScreen)}
      />
      <Stack.Screen
        name="CharacterOverviewScreen"
        component={withAssets(CharacterOverviewScreen)}
      />
      <Stack.Group
        screenOptions={{
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="TutorialStartScreen"
          component={withAssets(TutorialStartScreen)}
        />
        <Stack.Screen
          name="VictoryScreen"
          component={withAssets(VictoryScreen)}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}
