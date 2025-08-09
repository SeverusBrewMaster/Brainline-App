import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

const Header = ({
  title = "StrokeGuard",
  showTabs = true,
  currentScreen = "Home"
}) => {
  const navigation = useNavigation();
  const route = useRoute();

  // Enhanced logout function
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              console.log('✅ User logged out successfully');
              // Navigation will be handled automatically by AppNavigator
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  // NEW: Navigate to UserProfile
  const handleProfilePress = () => {
    navigation.navigate('UserProfile');
  };

  // NEW: Open drawer menu
  const handleMenuPress = () => {
    navigation.openDrawer();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Left side - Menu + Logo */}
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleMenuPress}
            >
              <Ionicons name="menu" size={24} color={colors.white} />
            </TouchableOpacity>
            
            <Image
              source={require('../../assets/logo.png')} // Update path as needed
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>{title}</Text>
          </View>

          {/* Right side - Profile + Logout */}
          <View style={styles.headerRight}>
            {/* NEW: Profile Button */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleProfilePress}
            >
              <Ionicons name="person-circle-outline" size={24} color={colors.white} />
            </TouchableOpacity>

            {/* Podcast Button */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('Podcast')}
            >
              <Ionicons name="headset-outline" size={24} color={colors.white} />
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Tabs */}
        {showTabs && (
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, currentScreen === 'Home' && styles.activeTab]}
              onPress={() => navigation.navigate('Home')}
            >
              <Ionicons 
                name="home-outline" 
                size={16} 
                color={currentScreen === 'Home' ? colors.primary : colors.white} 
              />
              <Text style={[
                styles.tabText, 
                currentScreen === 'Home' && styles.activeTabText
              ]}>
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, currentScreen === 'User' && styles.activeTab]}
              onPress={() => navigation.navigate('User')}
            >
              <Ionicons 
                name="pulse-outline" 
                size={16} 
                color={currentScreen === 'User' ? colors.primary : colors.white} 
              />
              <Text style={[
                styles.tabText, 
                currentScreen === 'User' && styles.activeTabText
              ]}>
                Dashboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, currentScreen === 'Riskometer' && styles.activeTab]}
              onPress={() => navigation.navigate('Riskometer')}
            >
              <Ionicons 
                name="analytics-outline" 
                size={16} 
                color={currentScreen === 'Riskometer' ? colors.primary : colors.white} 
              />
              <Text style={[
                styles.tabText, 
                currentScreen === 'Riskometer' && styles.activeTabText
              ]}>
                Risk
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, currentScreen === 'Podcast' && styles.activeTab]}
              onPress={() => navigation.navigate('Podcast')}
            >
              <Ionicons 
                name="headset-outline" 
                size={16} 
                color={currentScreen === 'Podcast' ? colors.primary : colors.white} 
              />
              <Text style={[
                styles.tabText, 
                currentScreen === 'Podcast' && styles.activeTabText
              ]}>
                Podcast
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

const colors = {
  primary: '#0c4cd6ff',
  primaryDark: '#1d4ed8',
  secondary: '#10b981',
  white: '#ffffff',
  textPrimary: '#1e293b',
  shadow: '#000000',
  error: '#ef4444',
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 64,
    height: 32,
    marginRight: 6,
    marginLeft: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 4,
  },
  activeTab: {
    backgroundColor: colors.white,
  },
  tabText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default Header;
