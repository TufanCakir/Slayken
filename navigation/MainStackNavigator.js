// navigation/MainStackNavigator.js
import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useThemeContext } from "../context/ThemeContext";

// Screens
import StartScreen from "../screens/StartScreen";
import HomeScreen from "../screens/HomeScreen";
import StoryScreen from "../screens/StoryScreen";
import BattleScreen from "../screens/BattleScreen";
import EventScreen from "../screens/EventScreen";
import NewsScreen from "../screens/NewsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import GiftScreen from "../screens/GiftScreen";
import MissionScreen from "../screens/MissionScreen";
import BossScreenView from "../screens/BossScreenView";
import ShopScreen from "../screens/ShopScreen";
import TeamSelectionScreen from "../screens/TeamSelectionScreen";
import SummonScreen from "../screens/SummonScreen";
import SummonResultScreen from "../screens/SummonResultScreen";
import ExchangeScreen from "../screens/ExchangeScreen";

// Modals
import TutorialStartScreen from "../screens/TutorialStartScreen";
import VictoryScreen from "../screens/VictoryScreen";
import ToSScreen from "../screens/ToSScreen";

const Stack = createNativeStackNavigator();

export default function MainStackNavigator({ data }) {
  const { theme, uiThemeType } = useThemeContext();

  // Default options for all 'card' screens
  const defaultOptions = {
    headerShown: false,
    gestureEnabled: true,
    animation: Platform.OS === "ios" ? "default" : "slide_from_right",
    presentation: "card",
    contentStyle: {
      backgroundColor: uiThemeType === "dark" ? theme.bgDark : theme.bgLight,
    },
  };

  return (
    <Stack.Navigator
      initialRouteName="StartScreen"
      screenOptions={defaultOptions}
    >
      {/* App entry & main screens */}
      <Stack.Screen name="StartScreen" component={StartScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="StoryScreen" component={StoryScreen} />
      <Stack.Screen name="BattleScreen" component={BattleScreen} />
      <Stack.Screen name="EventScreen" component={EventScreen} />
      <Stack.Screen name="NewsScreen" component={NewsScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="GiftScreen" component={GiftScreen} />
      <Stack.Screen name="MissionScreen" component={MissionScreen} />
      <Stack.Screen name="BossScreenView" component={BossScreenView} />
      <Stack.Screen name="ShopScreen" component={ShopScreen} />
      <Stack.Screen name="ToSScreen" component={ToSScreen} />
      <Stack.Screen name="SummonScreen" component={SummonScreen} />
      <Stack.Screen name="SummonResultScreen" component={SummonResultScreen} />
      <Stack.Screen name="ExchangeScreen" component={ExchangeScreen} />
      <Stack.Screen
        name="TeamSelectionScreen"
        component={TeamSelectionScreen}
      />

      {/* Modals (Tutorial, Victory) */}
      <Stack.Group
        screenOptions={{
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="TutorialStartScreen"
          component={TutorialStartScreen}
        />
        <Stack.Screen name="VictoryScreen" component={VictoryScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
