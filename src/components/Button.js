import React from 'react';
<<<<<<< HEAD
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', // Changed from 'type' to 'variant' for consistency
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style, 
  textStyle,
  fullWidth = false
}) => {
=======
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress, type = 'primary', style, textStyle }) => {
  // Button types: primary, outline, secondary
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
  return (
    <TouchableOpacity
      style={[
        styles.button,
<<<<<<< HEAD
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        loading && styles.loading,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={disabled || loading ? 1 : 0.8}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' || variant === 'secondary' || variant === 'danger' ? colors.white : colors.primary} 
          />
          <Text style={[
            styles.buttonText,
            styles[`${variant}Text`],
            styles[`${size}Text`],
            { marginLeft: 8 },
            textStyle
          ]}>
            Loading...
          </Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>
              {icon}
            </View>
          )}
          
          <Text style={[
            styles.buttonText,
            styles[`${variant}Text`],
            styles[`${size}Text`],
            textStyle
          ]}>
            {title}
          </Text>
          
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>
              {icon}
            </View>
          )}
        </View>
      )}
=======
        type === 'primary' && styles.primaryButton,
        type === 'outline' && styles.outlineButton,
        type === 'secondary' && styles.secondaryButton,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.buttonText,
          type === 'primary' && styles.primaryText,
          type === 'outline' && styles.outlineText,
          type === 'secondary' && styles.secondaryText,
          textStyle
        ]}
      >
        {title}
      </Text>
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
    </TouchableOpacity>
  );
};

<<<<<<< HEAD
// Health app color scheme (consistent with your other components)
const colors = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  secondary: '#10b981',
  tertiary: '#8b5cf6',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  white: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  background: '#f8fafc',
  shadow: '#000000',
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Button Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  tertiary: {
    backgroundColor: colors.tertiary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  outlineSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.secondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  link: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  
  // Button Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  
  // Button States
  disabled: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  loading: {
    opacity: 0.8,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Content Layout
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  
  // Text Styles
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Text Variants
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  tertiaryText: {
    color: colors.white,
  },
  dangerText: {
    color: colors.white,
  },
  warningText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  outlineSecondaryText: {
    color: colors.secondary,
  },
  ghostText: {
    color: colors.primary,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  
  // Text Sizes
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});

export default Button;
=======
const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#0d6efd',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0d6efd',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: 'white',
  },
  outlineText: {
    color: '#0d6efd',
  },
  secondaryText: {
    color: 'white',
  },
});

export default Button;
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
