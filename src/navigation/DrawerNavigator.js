import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import StrokeRiskAssessmentScreen from '../screens/StrokeRiskAssessmentScreen';
import HealthDashboard from '../screens/HealthDashboard';
import BrainStrokeSymptoms from '../screens/BrainStrokeSymptoms';
import Podcast from '../screens/Podcast';

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

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false, // Using custom Header component in screens
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
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      
      <Drawer.Screen 
        name="Riskometer" 
        component={StrokeRiskAssessmentScreen}
        options={{
          title: 'Risk Assessment',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="psychology" color={color} size={size} />
          ),
        }}
      />
      
      <Drawer.Screen 
        name="User" 
        component={HealthDashboard}
        options={{
          title: 'Health Dashboard',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" color={color} size={size} />
          ),
        }}
      />
      
      <Drawer.Screen 
        name="BrainSymptoms" 
        component={BrainStrokeSymptoms}
        options={{
          title: 'Stroke Symptoms',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="warning-outline" color={color} size={size} />
          ),
        }}
      />
      
      <Drawer.Screen 
        name="Podcast" 
        component={Podcast}
        options={{
          title: 'Health Podcasts',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="headset-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
