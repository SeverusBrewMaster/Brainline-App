import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { AuthService } from '../services';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
  if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
    Alert.alert('Invalid Email', 'Please enter a valid email address.');
    return;
  }
  
  setLoading(true);
  
  try {
    await AuthService.resetPassword(email.trim());
    
    Alert.alert(
      'Password Reset Email Sent',
      'Check your email for instructions to reset your password.',
      [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]
    );
    
  } catch (error) {
    console.error('Reset password error:', error);
    
    let errorMessage = 'Failed to send reset email. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
    }
    
    Alert.alert('Error', errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleEmailChange = (text) => {
    setEmail(text);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors({ ...errors, email: null });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/Strokelogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title and Description */}
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Don't worry! Enter your email address below and we'll send you a secure link to reset your password.
        </Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email address"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            editable={!loading && !emailSent}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        {/* Send Reset Link Button */}
        <TouchableOpacity
          style={[
            styles.button, 
            (loading || emailSent) && styles.buttonDisabled
          ]}
          onPress={handleResetPassword}
          disabled={loading || emailSent}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {emailSent ? 'Reset Link Sent' : 'Send Reset Link'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Success Message */}
        {emailSent && (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successText}>
              Check your email for reset instructions
            </Text>
          </View>
        )}

        {/* Back to Login */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back to Sign In</Text>
        </TouchableOpacity>

        {/* Help Section */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you don't receive the email within a few minutes, check your spam folder or contact our support team.
          </Text>
        </View>

        {/* Security Message */}
        <Text style={styles.securityText}>
          🔒 Your account security is our priority
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

// Same design system colors from Login/SignUp screens
const colors = {
  primary: '#2563eb',
  background: '#f8fafc',
  cardBackground: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  placeholder: '#94a3b8',
  success: '#10b981',
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
    width: 320,
    height: 160,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  inputContainer: {
    marginBottom: 24,
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
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
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
    backgroundColor: colors.success,
    shadowOpacity: 0.2,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  successIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  successText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  helpContainer: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  securityText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default ForgotPasswordScreen;
