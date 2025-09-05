import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { ADMIN_EMAIL } from '../config/constants';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgetPasswordScreen';

// App Screens
import HomeScreen from '../screens/HomeScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [authKey, setAuthKey] = useState(0); // 🔑 KEY TO FORCE RE-RENDER

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔄 Auth state changed:', user ? `${user.email} (${user.uid})` : 'No user');
      
      setUser(user);
      setIsAdmin(user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
      
      if (initializing) {
        setInitializing(false);
      }
      
      // 🚀 FORCE NAVIGATOR TO RE-MOUNT BY CHANGING KEY
      setAuthKey(prev => prev + 1);
      
      console.log('✅ Auth update complete. Admin status:', user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading StrokeGuard...</Text>
      </View>
    );
  }

  // 🎯 LOG NAVIGATION DECISION
  console.log('🎯 Rendering navigation:', { 
    hasUser: !!user, 
    isAdmin, 
    email: user?.email,
    authKey 
  });

  return (
    <NavigationContainer key={authKey}> {/* 🔑 KEY FORCES COMPLETE RE-MOUNT */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : isAdmin ? (
          // Admin Stack
          <Stack.Screen name="Admin" component={AdminScreen} />
        ) : (
          // User Stack
          <Stack.Screen name="Home" component={HomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
});
