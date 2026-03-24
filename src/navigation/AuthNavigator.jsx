import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '@/features/auth/screens/WelcomeScreen';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import RegisterScreen from '@/features/auth/screens/RegisterScreen';
import useAuthStore from '@/store/authStore';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const hasSeenWelcome = useAuthStore((state) => state.hasSeenWelcome);

  return (
    <Stack.Navigator
      initialRouteName={hasSeenWelcome ? 'Login' : 'Welcome'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
