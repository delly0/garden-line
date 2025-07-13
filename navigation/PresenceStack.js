import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PresenceTabs from '../screens/PresenceTabs';
import SharedPresenceScreen from '../screens/SharedPrescenceScreen';

const Stack = createNativeStackNavigator();

export default function PresenceStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PresenceHome" component={PresenceTabs} options={{ title: 'Presence' }} />
      <Stack.Screen
        name="SharedPresence"
        component={SharedPresenceScreen}
        options={({ route }) => ({ title: `Shared Space with ${route.params?.friendName}` })}
      />
    </Stack.Navigator>
  );
}
