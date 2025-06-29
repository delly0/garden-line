import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import GardenScreen from './screens/GardenScreen';
import MessagesScreen from './screens/MessagesScreen';
import SettingsScreen from './screens/SettingsScreen';

// Icons (optional): Using emoji for now
function EmojiIcon({ emoji }) {
  return <Text style={{ fontSize: 18 }}>{emoji}</Text>;
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: () => {
            let emoji = '❓';
            if (route.name === 'Garden') emoji = '🌿';
            else if (route.name === 'Messages') emoji = '💌';
            else if (route.name === 'Settings') emoji = '⚙️';
            return <EmojiIcon emoji={emoji} />;
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Garden" component={GardenScreen} />
        <Tab.Screen name="Messages" component={MessagesScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
