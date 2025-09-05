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
  title = "Brainline",
  showTabs = false, // Disabled tabs as per your request
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
              navigation.navigate('Login');
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Open drawer menu
  const handleMenuPress = () => {
    navigation.openDrawer();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Left side - Menu + Logo + Title */}
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleMenuPress}
            >
              <Ionicons name="menu" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <Image
              source={require('../../assets/Strokelogo.png')}
              style={styles.logoImage}
              // resizeMode="contain"
              size={150}
              
            />
            <Text style={styles.logoText}>{title}</Text>
          </View>

          {/* Right side - Only Logout button */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Navigation tabs section removed as per your request */}
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
    backgroundColor: "white",
    paddingBottom: 12, // Increased since no tabs below
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
    flex: 1, // Take all remaining space
  },
  logoImage: {
    width: 70,
    height: 40,
    marginRight: 8,
    marginLeft: 12,
  },
  logoText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default Header;
