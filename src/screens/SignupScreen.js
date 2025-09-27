import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AuthService } from '../services';
import UserService from '../services/UserService';

const SignupScreen = ({ navigation }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '', // Added for health app
  });
  
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = t('full_name_required');
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t('please_enter_full_name');
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t('email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('please_enter_valid_email_address');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('password_required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('password_must_be_8_characters');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('password_must_contain_upper_lower_number');
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('please_confirm_password');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwords_do_not_match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setErrors({});
    
    try {
      const signupData = {
        name: formData.fullName.trim(),
        age: 25, // You can ask for this in the form or set default
        gender: 'Not specified' // You can ask for this in the form
      };

      // Your existing Firebase auth signup
      const user = await AuthService.signUp(
        formData.email.trim(),
        formData.password,
        signupData
      );

      // NEW: Create user profile in database
      await UserService.createUserProfile(user.uid, signupData);
      
      console.log('✅ Signup completed with profile:', user.uid);
      
      Alert.alert(
        t('account_created'),
        t('welcome_to_strokeguard'),
        [{
          text: t('continue'),
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }]
      );
      
    } catch (error) {
      console.error('❌ SignUp failed:', error);
      
      let errorMessage = t('signup_failed_try_again');
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = t('email_already_exists');
          break;
        case 'auth/weak-password':
          errorMessage = t('password_too_weak');
          break;
        case 'auth/invalid-email':
          errorMessage = t('please_enter_valid_email_address');
          break;
        case 'auth/network-request-failed':
          errorMessage = t('network_error_check_connection');
          break;
        default:
          if (error.message) {
            errorMessage = error.message;
          }
      }
      
      Alert.alert(t('signup_error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.apptitle}>{t('brainline')}</Text>

        {/* Title */}
        <Text style={styles.title}>{t('create_account')}</Text>
        <Text style={styles.subtitle}>{t('join_health_monitoring_community')}</Text>

        {/* Full Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            placeholder={t('full_name')}
            placeholderTextColor={colors.placeholder}
            value={formData.fullName}
            onChangeText={(text) => handleInputChange('fullName', text)}
            autoCapitalize="words"
            textContentType="name"
            editable={!loading}
          />
          {errors.fullName && (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          )}
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder={t('email_address')}
            placeholderTextColor={colors.placeholder}
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            editable={!loading}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, errors.password && styles.inputError]}
              placeholder={t('password')}
              placeholderTextColor={colors.placeholder}
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              secureTextEntry={!passwordVisible}
              textContentType="newPassword"
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setPasswordVisible(!passwordVisible)}
              disabled={loading}
            >
              <Ionicons 
                name={passwordVisible ? "eye" : "eye-off"} 
                size={24} 
                color={colors.textMuted} 
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
              placeholder={t('confirm_password')}
              placeholderTextColor={colors.placeholder}
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              secureTextEntry={!confirmPasswordVisible}
              textContentType="newPassword"
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              disabled={loading}
            >
              <Ionicons 
                name={confirmPasswordVisible ? "eye" : "eye-off"} 
                size={24} 
                color={colors.textMuted} 
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </View>

        {/* Password Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>{t('password_requirements')}:</Text>
          <Text style={styles.requirementText}>• {t('at_least_8_characters')}</Text>
          <Text style={styles.requirementText}>• {t('one_uppercase_lowercase_letter')}</Text>
          <Text style={styles.requirementText}>• {t('at_least_one_number')}</Text>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.loadingText}>{t('creating_account')}</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>{t('create_account')}</Text>
          )}
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <Text style={styles.termsText}>
          {t('by_creating_account_agree')} <Text style={styles.linkText}>{t('terms_of_service')}</Text> {t('and')} <Text style={styles.linkText}>{t('privacy_policy')}</Text>
        </Text>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>{t('already_have_account')} </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={[styles.loginLink, loading && styles.linkDisabled]}>
              {t('sign_in')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Health Data Security Message */}
        <Text style={styles.securityText}>
          {t('health_information_encrypted_secure')}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Same design system colors from Login screen
const colors = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  background: '#f8fafc',
  cardBackground: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  placeholder: '#94a3b8',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  white: '#ffffff',
  border: '#e2e8f0',
  shadow: '#000000',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 24,
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 8,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 240,
    height: 120,
  },
  apptitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.cardBackground,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: colors.cardBackground,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingRight: 50, // Make room for eye button
    borderRadius: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 16,
    padding: 4,
  },
  eyeText: {
    fontSize: 20,
    color: colors.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  requirementsContainer: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  linkDisabled: {
    color: colors.textMuted,
  },
  securityText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default SignupScreen;
