import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';
import { 
  DrawerContentScrollView, 
  DrawerItemList, 
  DrawerItem 
} from '@react-navigation/drawer';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import StrokeRiskAssessmentScreen from '../screens/StrokeRiskAssessmentScreen';
import HealthDashboard from '../screens/HealthDashboard';
import BrainStrokeSymptoms from '../screens/BrainStrokeSymptoms';
import Podcast from '../screens/Podcast';
import UserProfile from '../screens/UserProfile';

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

// FIX: Custom Drawer Content Component with Proper Spacing
function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: colors.background }}>
      {/* Header Section */}
      <View style={customDrawerStyles.headerSection}>
        <Text style={customDrawerStyles.appTitle}>StrokeGuard</Text>
        <Text style={customDrawerStyles.appSubtitle}>Health Management</Text>
      </View>
      
      {/* Menu Items with Custom Spacing */}
      <View style={customDrawerStyles.menuSection}>
        <DrawerItem
          label="Home"
          icon={({ color, size, focused }) => (
            <View style={customDrawerStyles.iconContainer}>
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={20} 
                color={color} 
              />
            </View>
          )}
          labelStyle={customDrawerStyles.labelStyle}
          style={customDrawerStyles.drawerItem}
          onPress={() => props.navigation.navigate('Home')}
          focused={props.state.index === 0}
        />
        
        <DrawerItem
          label="Health Dashboard"
          icon={({ color, size, focused }) => (
            <View style={customDrawerStyles.iconContainer}>
              <Ionicons 
                name={focused ? "pulse" : "pulse-outline"} 
                size={20} 
                color={color} 
              />
            </View>
          )}
          labelStyle={customDrawerStyles.labelStyle}
          style={customDrawerStyles.drawerItem}
          onPress={() => props.navigation.navigate('User')}
          focused={props.state.index === 1}
        />
        
        <DrawerItem
          label="Risk Assessment"
          icon={({ color, size, focused }) => (
            <View style={customDrawerStyles.iconContainer}>
              <Ionicons 
                name={focused ? "analytics" : "analytics-outline"} 
                size={20} 
                color={color} 
              />
            </View>
          )}
          labelStyle={customDrawerStyles.labelStyle}
          style={customDrawerStyles.drawerItem}
          onPress={() => props.navigation.navigate('Riskometer')}
          focused={props.state.index === 2}
        />
        
        <DrawerItem
          label="Brain Symptoms"
          icon={({ color, size, focused }) => (
            <View style={customDrawerStyles.iconContainer}>
              <MaterialIcons 
                name="psychology" 
                size={20} 
                color={color} 
              />
            </View>
          )}
          labelStyle={customDrawerStyles.labelStyle}
          style={customDrawerStyles.drawerItem}
          onPress={() => props.navigation.navigate('BrainSymptoms')}
          focused={props.state.index === 3}
        />
        
        <DrawerItem
          label="Health Podcasts"
          icon={({ color, size, focused }) => (
            <View style={customDrawerStyles.iconContainer}>
              <Ionicons 
                name={focused ? "headset" : "headset-outline"} 
                size={20} 
                color={color} 
              />
            </View>
          )}
          labelStyle={customDrawerStyles.labelStyle}
          style={customDrawerStyles.drawerItem}
          onPress={() => props.navigation.navigate('Podcast')}
          focused={props.state.index === 4}
        />
      </View>
      
      {/* User Profile Section */}
      <View style={customDrawerStyles.profileSection}>
        <TouchableOpacity 
          style={customDrawerStyles.profileButton}
          onPress={() => props.navigation.navigate('UserProfile')}
        >
          <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
          <Text style={customDrawerStyles.profileText}>My Profile</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

// Custom styles for drawer content
const customDrawerStyles = {
  headerSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuSection: {
    paddingVertical: 10,
  },
  drawerItem: {
    marginHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12, // FIX: Proper spacing between icon and text
  },
  labelStyle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: -16, // FIX: Reduce default spacing
  },
  profileSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
  },
  profileText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 12,
  },
};

// Stack Navigator for each main section
function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
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

// Drawer Screens Component with Custom Content
function DrawerScreens() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: colors.background,
          width: 280, // FIX: Standard width instead of 340
        },
        drawerActiveBackgroundColor: `${colors.primary}15`,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreenWithHeader} />
      <Drawer.Screen name="User" component={HealthDashboardWithHeader} />
      <Drawer.Screen name="Riskometer" component={StrokeRiskAssessmentScreenWithHeader} />
      <Drawer.Screen name="BrainSymptoms" component={BrainStrokeSymptomsWithHeader} />
      <Drawer.Screen name="Podcast" component={PodcastWithHeader} />
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
