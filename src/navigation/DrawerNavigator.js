import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import StrokeRiskAssessmentScreen from '../screens/StrokeRiskAssessmentScreen';
import HealthDashboard from '../screens/HealthDashboard';
import BrainStrokeSymptoms from '../screens/BrainStrokeSymptoms';
import Podcast from '../screens/Podcast';
import UserProfile from '../screens/UserProfile'; // NEW: Import UserProfile

// Import custom header
import Header from '../components/Header';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Health app colors
const colors = {
  primary: '#2563eb',
  secondary: '#10b981',
  background: '#f8fafc',
  white: '#ffffff',
  textSecondary: '#64748b',
  border: '#e2e8f0',
};

// Stack Navigator for each main section (to include UserProfile as modal)
function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We'll use custom header
      }}
    >
      {/* Main Drawer Navigation */}
      <Stack.Screen name="DrawerScreens" component={DrawerScreens} />
      
      {/* UserProfile as a modal screen */}
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfile}
        options={{
          headerShown: true,
          presentation: 'modal',
          headerTitle: 'My Profile',
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
}

// Drawer Screens Component
function DrawerScreens() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false, // We use custom header
        drawerStyle: {
          backgroundColor: colors.background,
          width: 280,
        },
        drawerActiveBackgroundColor: `${colors.primary}15`,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          marginLeft: -20,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreenWithHeader}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen
        name="User"
        component={HealthDashboardWithHeader}
        options={{
          title: 'Health Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="pulse-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen
        name="Riskometer"
        component={StrokeRiskAssessmentScreenWithHeader}
        options={{
          title: 'Risk Assessment',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen
        name="BrainSymptoms"
        component={BrainStrokeSymptomsWithHeader}
        options={{
          title: 'Brain Symptoms',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="psychology" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen
        name="Podcast"
        component={PodcastWithHeader}
        options={{
          title: 'Health Podcasts',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="headset-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// Screen components with headers
const HomeScreenWithHeader = ({ navigation }) => (
  <>
    <Header title="StrokeGuard" navigation={navigation} currentScreen="Home" />
    <HomeScreen navigation={navigation} />
  </>
);

const HealthDashboardWithHeader = ({ navigation }) => (
  <>
    <Header title="Health Dashboard" navigation={navigation} currentScreen="User" />
    <HealthDashboard navigation={navigation} />
  </>
);

const StrokeRiskAssessmentScreenWithHeader = ({ navigation }) => (
  <>
    <Header title="Risk Assessment" navigation={navigation} currentScreen="Riskometer" />
    <StrokeRiskAssessmentScreen navigation={navigation} />
  </>
);

const BrainStrokeSymptomsWithHeader = ({ navigation }) => (
  <>
    <Header title="Brain Symptoms" navigation={navigation} currentScreen="BrainSymptoms" />
    <BrainStrokeSymptoms navigation={navigation} />
  </>
);

const PodcastWithHeader = ({ navigation }) => (
  <>
    <Header title="Health Podcasts" navigation={navigation} currentScreen="Podcast" />
    <Podcast navigation={navigation} />
  </>
);

// Export the main stack navigator
export default function DrawerNavigator() {
  return <MainStackNavigator />;
}
