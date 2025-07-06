import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import GardenScreen from '../screens/GardenScreen';
import FriendsScreen from '../screens/FriendsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FriendsStack from './FriendsStack';

const Tab = createBottomTabNavigator();

function EmojiIcon({ emoji }) {
  return <Text style={{ fontSize: 18 }}>{emoji}</Text>;
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => {
          let emoji = '❓';
          if (route.name === 'Garden') emoji = '🌿';
          else if (route.name === 'Friends') emoji = '🌷';
          else if (route.name === 'Messages') emoji = '💌';
          else if (route.name === 'Settings') emoji = '⚙️';
          return <EmojiIcon emoji={emoji} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Garden" component={GardenScreen} />
      <Tab.Screen name="Friends" component={FriendsStack} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
