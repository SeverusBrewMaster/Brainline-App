import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Linking, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const EmergencyButton = () => {
  const handleEmergencyCall = () => {
    const emergencyNumber = Platform.OS === 'ios' ? 'telprompt:911' : 'tel:911';
    Linking.openURL(emergencyNumber);
  };

  return (
    <TouchableOpacity 
      style={styles.emergencyButton}
      onPress={handleEmergencyCall}
      activeOpacity={0.7}
    >
      <FontAwesome name="phone" size={20} color="white" style={styles.icon} />
      <Text style={styles.buttonText}>Call Emergency</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  emergencyButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  icon: {
    marginRight: 10,
  }
});

export default EmergencyButton;