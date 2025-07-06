import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FriendsScreen from '../screens/FriendsScreen';
import FriendGardenScreen from '../screens/FriendGardenScreen';

const Stack = createNativeStackNavigator();

export default function FriendsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FriendsHome" component={FriendsScreen} options={{ title: 'Friends' }} />
      <Stack.Screen
        name="FriendGarden"
        component={FriendGardenScreen}
        options={({ route }) => ({ title: `${route.params.userName}'s Garden` })}
      />
    </Stack.Navigator>
  );
}
