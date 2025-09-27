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
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth } from '../firebase/config';
import UserService from '../services/UserService';
import Header from '../components/Header';
import Button from '../components/Button';

const UserProfile = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [dateError, setDateError] = useState('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
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

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  ];

  const changeLanguage = async (langCode) => {
    try {
      await i18n.changeLanguage(langCode);
      await AsyncStorage.setItem('language', langCode);
      setShowLanguageModal(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

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
      Alert.alert(t('error'), t('failed_load_profile_data'));
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
        setDateError(t('please_enter_valid_date'));
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
        Alert.alert(t('error'), t('please_login_save_profile'));
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.gender) {
        Alert.alert(t('error'), t('please_fill_required_fields_name_gender'));
        return;
      }

      // Validate date if provided
      if (formData.dateOfBirth && !validateDate(formData.dateOfBirth)) {
        Alert.alert(t('error'), t('please_enter_valid_date_format'));
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
        t('success'),
        t('profile_saved_successfully'),
        [
          {
            text: t('continue'),
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(t('error'), t('failed_save_profile_try_again'));
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
        maxLength={maxLength}
        editable={!saving}
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
        placeholder={t('date_format_placeholder')}
        keyboardType="numeric"
        maxLength={10}
        editable={!saving}
      />
      <Text style={styles.helperText}>
        {t('date_format_helper')}
      </Text>
      {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
      {value && validateDate(value) && (
        <Text style={styles.successText}>
          ✓ {t('age_calculated', { age: formData.age })}
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
          style={styles.picker}
          onValueChange={onValueChange}
          enabled={!saving}
        >
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
          onValueChange(newValue);
          setFormData(prev => ({
            ...prev,
            [section]: {
              ...prev[section],
              [label.toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '')]: newValue
            }
          }));
        }}
        trackColor={{ false: '#767577', true: colors.primary }}
        thumbColor={value ? colors.white : '#f4f3f4'}
        disabled={saving}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading_your_profile')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <Header />
      
      <ScrollView style={styles.scrollView}>
        {/* Basic Demographics */}
        {renderSectionHeader(t('basic_demographics'), t('essential_personal_information'))}
        <View style={styles.card}>
          {renderTextInput(
            t('full_name'), 
            formData.name, 
            (text) => setFormData(prev => ({ ...prev, name: text })),
            t('enter_full_name_placeholder'),
            true
          )}
          
          {renderDateInput(
            t('date_of_birth'),
            formData.dateOfBirth,
            handleDateChange,
            false
          )}
          
          {renderTextInput(
            t('age_years'), 
            formData.age, 
            (text) => setFormData(prev => ({ ...prev, age: text })),
            t('calculated_automatically'),
            false,
            'numeric'
          )}
          
          {renderPicker(
            t('gender'),
            formData.gender,
            (value) => setFormData(prev => ({ ...prev, gender: value })),
            [
              { label: t('select_gender'), value: '' },
              { label: t('male'), value: 'Male' },
              { label: t('female'), value: 'Female' },
              { label: t('prefer_not_to_say'), value: 'Other' }
            ],
            true
          )}
          
          {renderPicker(
            t('education_level'),
            formData.education,
            (value) => setFormData(prev => ({ ...prev, education: value })),
            [
              { label: t('select_education'), value: '' },
              { label: t('primary_education'), value: 'Primary' },
              { label: t('secondary_education'), value: 'Secondary' },
              { label: t('graduate'), value: 'Graduate' },
              { label: t('post_graduate'), value: 'Post-graduate' },
              { label: t('doctorate'), value: 'Doctorate' }
            ]
          )}
          
          {renderTextInput(
            t('profession'), 
            formData.profession, 
            (text) => setFormData(prev => ({ ...prev, profession: text })),
            t('your_occupation')
          )}
          
          {renderTextInput(
            t('phone_number'), 
            formData.phoneNumber, 
            (text) => setFormData(prev => ({ ...prev, phoneNumber: text })),
            t('contact_number'),
            false,
            'phone-pad'
          )}
        </View>

        {/* Physical Information */}
        {renderSectionHeader(t('physical_information'), t('body_measurements_health_metrics'))}
        <View style={styles.card}>
          {renderTextInput(
            t('height_cm'), 
            formData.height, 
            (text) => setFormData(prev => ({ ...prev, height: text })),
            t('height_centimeters'),
            false,
            'numeric'
          )}
          
          {renderTextInput(
            t('weight_kg'), 
            formData.weight, 
            (text) => setFormData(prev => ({ ...prev, weight: text })),
            t('weight_kilograms'),
            false,
            'numeric'
          )}
          
          {renderPicker(
            t('blood_type'),
            formData.bloodType,
            (value) => setFormData(prev => ({ ...prev, bloodType: value })),
            [
              { label: t('select_blood_type'), value: '' },
              { label: 'A+', value: 'A+' },
              { label: 'A-', value: 'A-' },
              { label: 'B+', value: 'B+' },
              { label: 'B-', value: 'B-' },
              { label: 'AB+', value: 'AB+' },
              { label: 'AB-', value: 'AB-' },
              { label: 'O+', value: 'O+' },
              { label: 'O-', value: 'O-' },
              { label: t('unknown'), value: 'Unknown' }
            ]
          )}
        </View>

        {/* Medical History */}
        {renderSectionHeader(t('medical_history'), t('current_chronic_conditions'))}
        <View style={styles.card}>
          {renderSwitch(
            t('hypertension_high_bp'), 
            formData.chronicConditions.hypertension,
            (value) => {},
            'chronicConditions'
          )}
          
          {formData.chronicConditions.hypertension && renderSwitch(
            t('hypertension_controlled'), 
            formData.chronicConditions.hypertensionControlled,
            (value) => {},
            'chronicConditions'
          )}
          
          {renderSwitch(
            t('diabetes'), 
            formData.chronicConditions.diabetes,
            (value) => {},
            'chronicConditions'
          )}
          
          {renderSwitch(
            t('heart_disease'), 
            formData.chronicConditions.heartDisease,
            (value) => {},
            'chronicConditions'
          )}
          
          {renderSwitch(
            t('atrial_fibrillation'), 
            formData.chronicConditions.atrialFibrillation,
            (value) => {},
            'chronicConditions'
          )}
          
          {renderSwitch(
            t('thyroid_disease'), 
            formData.chronicConditions.thyroidDisease,
            (value) => {},
            'chronicConditions'
          )}
          
          {renderSwitch(
            t('asthma'), 
            formData.chronicConditions.asthma,
            (value) => {},
            'chronicConditions'
          )}
          
          {renderSwitch(
            t('migraine'), 
            formData.chronicConditions.migraine,
            (value) => {},
            'chronicConditions'
          )}
        </View>

        {/* Family History */}
        {renderSectionHeader(t('family_history'), t('family_medical_conditions'))}
        <View style={styles.card}>
          {renderSwitch(
            t('family_stroke'), 
            formData.familyHistory.stroke,
            (value) => {},
            'familyHistory'
          )}
          
          {renderSwitch(
            t('family_heart_disease'), 
            formData.familyHistory.heartDisease,
            (value) => {},
            'familyHistory'
          )}
          
          {renderSwitch(
            t('family_diabetes'), 
            formData.familyHistory.diabetes,
            (value) => {},
            'familyHistory'
          )}
          
          {renderSwitch(
            t('family_hypertension'), 
            formData.familyHistory.hypertension,
            (value) => {},
            'familyHistory'
          )}
        </View>

        {/* Emergency Contact */}
        {renderSectionHeader(t('emergency_contact'), t('person_contact_emergency'))}
        <View style={styles.card}>
          {renderTextInput(
            t('contact_name'), 
            formData.emergencyContact.name, 
            (text) => setFormData(prev => ({ 
              ...prev, 
              emergencyContact: { ...prev.emergencyContact, name: text }
            })),
            t('emergency_contact_full_name')
          )}
          
          {renderTextInput(
            t('relationship'), 
            formData.emergencyContact.relationship, 
            (text) => setFormData(prev => ({ 
              ...prev, 
              emergencyContact: { ...prev.emergencyContact, relationship: text }
            })),
            t('relationship_to_contact')
          )}
          
          {renderTextInput(
            t('emergency_phone'), 
            formData.emergencyContact.phone, 
            (text) => setFormData(prev => ({ 
              ...prev, 
              emergencyContact: { ...prev.emergencyContact, phone: text }
            })),
            t('emergency_contact_phone_number'),
            false,
            'phone-pad'
          )}
        </View>

        {/* App Preferences - Language Selection */}
        {renderSectionHeader(t('app_preferences'), t('customize_app_experience'))}
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('app_language')}</Text>
            <TouchableOpacity 
              style={styles.languageSelector}
              onPress={() => setShowLanguageModal(true)}
            >
              <View style={styles.languageSelectorContent}>
                <Text style={styles.languageFlag}>{currentLanguage.flag}</Text>
                <Text style={styles.languageSelectorText}>{currentLanguage.name}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={saving ? t('saving_profile') : t('save_profile')}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('select_language')}</Text>
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageItem,
                    i18n.language === item.code && styles.selectedLanguage
                  ]}
                  onPress={() => changeLanguage(item.code)}
                >
                  <Text style={styles.languageFlag}>{item.flag}</Text>
                  <Text style={styles.languageName}>{item.name}</Text>
                  {i18n.language === item.code && (
                    <Ionicons name="checkmark" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  textMuted: '#94a3b8',
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
  // Language selector styles
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  languageSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 18,
    marginRight: 12,
  },
  languageSelectorText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: colors.textPrimary,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedLanguage: {
    backgroundColor: '#e0f2fe',
  },
  languageName: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    color: colors.textPrimary,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserProfile;
