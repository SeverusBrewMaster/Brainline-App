import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Screens - Only the ones you currently have
import HomeScreen from './src/screens/HomeScreen';
import RiskometerScreen from './src/screens/StrokeRiskAssessmentScreen';
import UserScreen from './src/screens/HealthDashboard';
import BrainSymptoms from './src/screens/BrainSymptoms';
import Podcast from './src/screens/Podcast';
import Header from './src/components/Header';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgetPasswordScreen';
import UserProfile from './src/screens/UserProfile';
import AdminScreen from './src/screens/AdminScreen';
import './src/i18n';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Health app colors
const colors = {
  primary: '#2563eb',
  secondary: '#10b981',
  background: '#f8fafc',
  cardBackground: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  white: '#ffffff',
  border: '#e2e8f0',
};

// Enhanced Drawer Navigator with your existing screens
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false, // Using custom Header component in each screen
        drawerType: 'slide',
        drawerPosition: 'left',
        drawerStyle: {
          backgroundColor: colors.background,
          width: 280,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerActiveBackgroundColor: `${colors.primary}15`,
        drawerItemStyle: {
          borderRadius: 8,
          marginHorizontal: 8,
          marginVertical: 2,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          marginLeft: -16,
        },
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} marginRight={8}/>
          ),
        }}
      />
      
      <Drawer.Screen 
        name="Riskometer" 
        component={RiskometerScreen}
        options={{
          title: 'Risk Assessment',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="psychology" color={color} size={size} marginRight={8} />
          ),
        }}
      />
      
      <Drawer.Screen 
        name="User" 
        component={UserScreen}
        options={{
          title: 'Health Dashboard',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" color={color} size={size} marginRight={8}/>
          ),
        }}
      />
      
      <Drawer.Screen 
        name="Podcast" 
        component={Podcast}
        options={{
          title: 'Health Podcasts',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="headset-outline" color={color} size={size} marginRight={8}/>
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// Enhanced Root App
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={colors.primary} />
        
        <Stack.Navigator 
          initialRouteName="Login" 
          screenOptions={{ 
            headerShown: false,
            gestureEnabled: true,
            cardStyleInterpolator: ({ current, layouts }) => ({
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            }),
          }}
        >
          {/* Authentication Flow */}
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ title: 'Login' }}
          />
          <Stack.Screen 
            name="Admin" 
            component={AdminScreen}
            options={{ title: 'Admin' }}
          />
          <Stack.Screen 
            name="SignUp" 
            component={SignUpScreen}
            options={{ title: 'Create Account' }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{ title: 'Reset Password' }}
          />
          
          {/* Main App - Drawer Navigator */}
          <Stack.Screen 
            name="Main" 
            component={DrawerNavigator} 
            options={{ headerShown: false }}
          />
          
          {/* Additional Stack Screens (outside drawer) */}
          <Stack.Screen 
            name="BrainSymptoms" 
            component={BrainSymptoms}
            options={{ 
              title: 'Stroke Symptoms',
              gestureEnabled: true,
            }}
          />
          
          {/* Fixed naming consistency - using "Podcast" to match drawer */}
          <Stack.Screen 
            name="Podcast" 
            component={Podcast}
            options={{ 
              title: 'Health Podcasts',
              gestureEnabled: true,
            }}
          />

          <Stack.Screen 
            name="UserProfile" 
            component={UserProfile} 
            options={{ headerShown: false }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
