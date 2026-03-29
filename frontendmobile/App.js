import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StatusBar, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { setSessionExpiredCallback } from './src/config/api';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import TasksScreen from './src/screens/TasksScreen';
import SessionExpiredModal from './src/components/SessionExpiredModal';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const hideNavBarTimeout = useRef(null);

  useEffect(() => {
    checkAuth();
    configureNavigationBar();

    // Set up session expired callback
    setSessionExpiredCallback(() => {
      setShowSessionExpired(true);
    });

    // Listen for visibility changes and auto-hide after 3 seconds
    const subscription = NavigationBar.addVisibilityListener(({ visibility }) => {
      if (visibility === 'visible' && Platform.OS === 'android') {
        // Clear any existing timeout
        if (hideNavBarTimeout.current) {
          clearTimeout(hideNavBarTimeout.current);
        }
        // Set new timeout to hide after 3 seconds
        hideNavBarTimeout.current = setTimeout(() => {
          NavigationBar.setVisibilityAsync('hidden');
        }, 3000);
      }
    });

    return () => {
      subscription.remove();
      if (hideNavBarTimeout.current) {
        clearTimeout(hideNavBarTimeout.current);
      }
    };
  }, []);

  const configureNavigationBar = async () => {
    if (Platform.OS === 'android') {
      await NavigationBar.setBackgroundColorAsync('#2d0f0f');
      await NavigationBar.setButtonStyleAsync('light');
      // Hide the navigation bar (swipe up to show)
      await NavigationBar.setVisibilityAsync('hidden');
    }
  };

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  };

  const handleSessionExpiredLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setShowSessionExpired(false);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2d0f0f' }}>
        <ActivityIndicator size="large" color="#c85050" />
      </View>
    );
  }

  return (
    <>
      <StatusBar hidden={true} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onLogin={() => setIsAuthenticated(true)} />}
              </Stack.Screen>
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          ) : (
            <Stack.Screen name="Dashboard">
              {(props) => <TasksScreen {...props} onLogout={() => setIsAuthenticated(false)} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Session Expired Modal */}
      <SessionExpiredModal
        visible={showSessionExpired}
        onLogout={handleSessionExpiredLogout}
      />
    </>
  );
}
