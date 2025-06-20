import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ClockScreen from './ClockScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Clock">
        <Stack.Screen name="Clock" component={ClockScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}