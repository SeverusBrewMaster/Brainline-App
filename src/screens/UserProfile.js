import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  Switch,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import { auth } from '../firebase/config';
import UserService from '../services/UserService';
import Header from '../components/Header';
import Button from '../components/Button';

const UserProfile = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [dateError, setDateError] = useState('');
  
  const [formData, setFormData] = useState({
    // Basic Demographics
    name: '',
    age: '',
    dateOfBirth: '',
    gender: '',
    education: '',
    profession: '',
    phoneNumber: '',
    
    // Physical Information
    height: '',
    weight: '',
    bloodType: '',
    
    // Medical History
    chronicConditions: {
      hypertension: false,
      hypertensionControlled: false,
      diabetes: false,
      heartDisease: false,
      atrialFibrillation: false,
      thyroidDisease: false,
      asthma: false,
      migraine: false
    },
    
    // Family History
    familyHistory: {
      stroke: false,
      heartDisease: false,
      diabetes: false,
      hypertension: false
    },
    
    // Emergency Contact
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigation.navigate('Login');
        return;
      }

      const profile = await UserService.getUserProfile(currentUser.uid);
      
      if (profile) {
        setUserProfile(profile);
        
        // Format existing date for display
        let dateOfBirth = '';
        if (profile.profile?.dateOfBirth) {
          // Handle different date formats
          try {
            const date = new Date(profile.profile.dateOfBirth);
            if (!isNaN(date.getTime())) {
              dateOfBirth = formatDateForInput(date);
            }
          } catch (error) {
            console.log('Error parsing existing date:', error);
          }
        }
        
        // Pre-fill form with existing data
        setFormData({
          name: profile.profile?.name || '',
          age: profile.profile?.age?.toString() || '',
          dateOfBirth: dateOfBirth,
          gender: profile.profile?.gender || '',
          education: profile.profile?.education || '',
          profession: profile.profile?.profession || '',
          phoneNumber: profile.profile?.phoneNumber || '',
          height: profile.profile?.physicalInfo?.height?.toString() || '',
          weight: profile.profile?.physicalInfo?.weight?.toString() || '',
          bloodType: profile.profile?.physicalInfo?.bloodType || '',
          chronicConditions: {
            ...formData.chronicConditions,
            ...profile.profile?.chronicConditions
          },
          familyHistory: {
            ...formData.familyHistory,
            ...profile.profile?.familyHistory
          },
          emergencyContact: {
            ...formData.emergencyContact,
            ...profile.profile?.emergencyContact
          }
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Date formatting and validation functions
  const formatDateForInput = (date) => {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const validateDate = (dateString) => {
    // Check format YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    
    // Check if it's a valid date
    const date = new Date(dateString);
    const isValid = date instanceof Date && !isNaN(date.getTime());
    
    // Check if the date is not in the future
    const today = new Date();
    const isFuture = date > today;
    
    // Check if the date is reasonable (after 1900)
    const minDate = new Date('1900-01-01');
    const isTooOld = date < minDate;
    
    return isValid && !isFuture && !isTooOld;
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age > 0 ? age.toString() : '';
  };

  const handleDateChange = (text) => {
    // Auto-format input as user types
    let formattedText = text.replace(/[^\d]/g, ''); // Remove non-digits
    
    if (formattedText.length >= 4) {
      formattedText = formattedText.substring(0, 4) + '-' + formattedText.substring(4);
    }
    if (formattedText.length >= 7) {
      formattedText = formattedText.substring(0, 7) + '-' + formattedText.substring(7, 9);
    }
    
    // Limit to 10 characters (YYYY-MM-DD)
    if (formattedText.length > 10) {
      formattedText = formattedText.substring(0, 10);
    }
    
    setFormData(prev => ({ ...prev, dateOfBirth: formattedText }));
    
    // Clear previous error
    setDateError('');
    
    // Validate and calculate age if complete date
    if (formattedText.length === 10) {
      if (validateDate(formattedText)) {
        const age = calculateAge(formattedText);
        setFormData(prev => ({ ...prev, age: age }));
        setDateError('');
      } else {
        setDateError('Please enter a valid date');
        setFormData(prev => ({ ...prev, age: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, age: '' }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        Alert.alert('Error', 'Please log in to save your profile');
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.gender) {
        Alert.alert('Error', 'Please fill in all required fields (Name, Gender)');
        return;
      }

      // Validate date if provided
      if (formData.dateOfBirth && !validateDate(formData.dateOfBirth)) {
        Alert.alert('Error', 'Please enter a valid date of birth in YYYY-MM-DD format');
        return;
      }

      const profileData = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender,
        education: formData.education,
        profession: formData.profession,
        phoneNumber: formData.phoneNumber,
        physicalInfo: {
          height: formData.height ? parseInt(formData.height) : null,
          weight: formData.weight ? parseInt(formData.weight) : null,
          bloodType: formData.bloodType
        },
        chronicConditions: formData.chronicConditions,
        familyHistory: formData.familyHistory,
        emergencyContact: formData.emergencyContact,
        profileCompleted: true,
        lastUpdated: new Date()
      };

      await UserService.updateUserProfile(currentUser.uid, profileData);

      Alert.alert(
        'Success',
        'Your profile has been saved successfully!',
        [
          {
            text: 'Continue',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderSectionHeader = (title, subtitle) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderTextInput = (label, value, onChangeText, placeholder, required = false, keyboardType = 'default', maxLength) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize="words"
        maxLength={maxLength}
      />
    </View>
  );

  // Enhanced date input component
  const renderDateInput = (label, value, onChangeText, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.textInput, dateError ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder="YYYY-MM-DD"
        keyboardType="numeric"
        maxLength={10}
      />
      <Text style={styles.helperText}>
        Enter date in YYYY-MM-DD format (e.g., 1990-01-15)
      </Text>
      {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
      {value && validateDate(value) && (
        <Text style={styles.successText}>
          ✓ Age: {formData.age} years
        </Text>
      )}
    </View>
  );

  const renderPicker = (label, selectedValue, onValueChange, items, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          <Picker.Item label={`Select ${label}`} value="" />
          {items.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  );

  const renderSwitch = (label, value, onValueChange, section) => (
    <View style={styles.switchContainer}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={(newValue) => {
          setFormData(prev => ({
            ...prev,
            [section]: {
              ...prev[section],
              [label.toLowerCase().replace(' ', '')]: newValue
            }
          }));
        }}
        trackColor={{ false: '#767577', true: colors.primary }}
        thumbColor={value ? colors.white : '#f4f3f4'}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <Header 
        title="My Profile" 
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView}>
        {/* Basic Information */}
        {renderSectionHeader('Basic Information', 'This information will auto-fill in assessments')}
        <View style={styles.card}>
          {renderTextInput('Full Name', formData.name, 
            (text) => setFormData(prev => ({ ...prev, name: text })), 
            'Enter your full name', true)}
          
          {/* Enhanced Date Input */}
          {renderDateInput('Date of Birth', formData.dateOfBirth, handleDateChange)}
          
          {/* Age field - now auto-calculated and read-only */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={[styles.textInput, styles.readOnlyInput]}
              value={formData.age}
              placeholder="Calculated from date of birth"
              editable={false}
            />
            <Text style={styles.helperText}>
              Age is automatically calculated from your date of birth
            </Text>
          </View>
          
          {renderPicker('Gender', formData.gender, 
            (value) => setFormData(prev => ({ ...prev, gender: value })),
            [
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Other', value: 'Other' }
            ], true)}
          
          {renderPicker('Education Level', formData.education, 
            (value) => setFormData(prev => ({ ...prev, education: value })),
            [
              { label: 'High School', value: 'High School' },
              { label: 'Undergraduate', value: 'Undergraduate' },
              { label: 'Graduate', value: 'Graduate' },
              { label: 'Post Graduate', value: 'Post Graduate' }
            ])}
          
          {renderTextInput('Profession', formData.profession, 
            (text) => setFormData(prev => ({ ...prev, profession: text })), 
            'Your profession/occupation')}
          
          {renderTextInput('Phone Number', formData.phoneNumber, 
            (text) => setFormData(prev => ({ ...prev, phoneNumber: text })), 
            '+1234567890', false, 'phone-pad')}
        </View>

        {/* Physical Information */}
        {renderSectionHeader('Physical Information')}
        <View style={styles.card}>
          {renderTextInput('Height (cm)', formData.height, 
            (text) => setFormData(prev => ({ ...prev, height: text })), 
            'Height in centimeters', false, 'numeric')}
          {renderTextInput('Weight (kg)', formData.weight, 
            (text) => setFormData(prev => ({ ...prev, weight: text })), 
            'Weight in Kg', false, 'numeric')}
          
          {renderPicker('Blood Type', formData.bloodType, 
            (value) => setFormData(prev => ({ ...prev, bloodType: value })),
            [
              { label: 'A+', value: 'A+' },
              { label: 'A-', value: 'A-' },
              { label: 'B+', value: 'B+' },
              { label: 'B-', value: 'B-' },
              { label: 'AB+', value: 'AB+' },
              { label: 'AB-', value: 'AB-' },
              { label: 'O+', value: 'O+' },
              { label: 'O-', value: 'O-' }
            ])}
        </View>

        {/* Medical History */}
        {renderSectionHeader('Medical History', 'Check all conditions that apply to you')}
        <View style={styles.card}>
          {renderSwitch('Hypertension', formData.chronicConditions.hypertension, null, 'chronicConditions')}
          {renderSwitch('Diabetes', formData.chronicConditions.diabetes, null, 'chronicConditions')}
          {renderSwitch('Heart Disease', formData.chronicConditions.heartDisease, null, 'chronicConditions')}
          {renderSwitch('Atrial Fibrillation', formData.chronicConditions.atrialFibrillation, null, 'chronicConditions')}
          {renderSwitch('Thyroid Disease', formData.chronicConditions.thyroidDisease, null, 'chronicConditions')}
          {renderSwitch('Asthma', formData.chronicConditions.asthma, null, 'chronicConditions')}
          {renderSwitch('Migraine', formData.chronicConditions.migraine, null, 'chronicConditions')}
        </View>

        {/* Family History */}
        {renderSectionHeader('Family History', 'Check if any immediate family members have these conditions')}
        <View style={styles.card}>
          {renderSwitch('Stroke', formData.familyHistory.stroke, null, 'familyHistory')}
          {renderSwitch('Heart Disease', formData.familyHistory.heartDisease, null, 'familyHistory')}
          {renderSwitch('Diabetes', formData.familyHistory.diabetes, null, 'familyHistory')}
          {renderSwitch('Hypertension', formData.familyHistory.hypertension, null, 'familyHistory')}
        </View>

        {/* Emergency Contact */}
        {renderSectionHeader('Emergency Contact')}
        <View style={styles.card}>
          {renderTextInput('Contact Name', formData.emergencyContact.name, 
            (text) => setFormData(prev => ({ 
              ...prev, 
              emergencyContact: { ...prev.emergencyContact, name: text }
            })), 
            'Emergency contact name')}
          
          {renderPicker('Relationship', formData.emergencyContact.relationship, 
            (value) => setFormData(prev => ({ 
              ...prev, 
              emergencyContact: { ...prev.emergencyContact, relationship: value }
            })),
            [
              { label: 'Spouse', value: 'Spouse' },
              { label: 'Parent', value: 'Parent' },
              { label: 'Child', value: 'Child' },
              { label: 'Sibling', value: 'Sibling' },
              { label: 'Friend', value: 'Friend' },
              { label: 'Other', value: 'Other' }
            ])}
          
          {renderTextInput('Phone Number', formData.emergencyContact.phone, 
            (text) => setFormData(prev => ({ 
              ...prev, 
              emergencyContact: { ...prev.emergencyContact, phone: text }
            })), 
            '+1234567890', false, 'phone-pad')}
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={saving ? "Saving..." : "Save Profile"}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const colors = {
  primary: '#2563eb',
  secondary: '#10b981',
  background: '#f8fafc',
  cardBackground: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  white: '#ffffff',
  border: '#e2e8f0',
  required: '#ef4444',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: colors.required,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  readOnlyInput: {
    backgroundColor: colors.background,
    color: colors.textSecondary,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: colors.success,
    marginTop: 4,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  picker: {
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
});

export default UserProfile;