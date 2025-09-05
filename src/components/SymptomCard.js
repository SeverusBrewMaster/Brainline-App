import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const SymptomCard = ({ 
  icon, 
  iconType = 'ionicons', // 'ionicons', 'material', or 'text'
  title, 
  description, 
  severity = 'normal', // 'normal', 'warning', 'critical'
  onPress,
  style
}) => {
  
  const renderIcon = () => {
    if (typeof icon === 'string' && iconType === 'text') {
      // For emoji or text icons
      return <Text style={styles.textIcon}>{icon}</Text>;
    } else if (typeof icon === 'string') {
      // For icon name strings
      const IconComponent = iconType === 'material' ? MaterialIcons : Ionicons;
      return (
        <IconComponent 
          name={icon} 
          size={32} 
          color={colors.primary} 
        />
      );
    } else {
      // For JSX icon components
      return icon;
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent 
      style={[
        styles.card, 
        styles[severity],
        style
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {severity !== 'normal' && (
        <View style={[styles.severityBadge, styles[`${severity}Badge`]]}>
          <Text style={styles.severityText}>
            {severity === 'warning' ? '⚠️ Monitor' : '🚨 Urgent'}
          </Text>
        </View>
      )}
    </CardComponent>
  );
};

// Health app color scheme (consistent with your other components)
const colors = {
  primary: '#2563eb',
  cardBackground: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  warning: '#f59e0b',
  error: '#ef4444',
  success: '#10b981',
  border: '#e2e8f0',
  shadow: '#000000',
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    margin: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  
  // Severity variants
  normal: {
    borderColor: colors.border,
  },
  warning: {
    borderColor: colors.warning,
    borderWidth: 2,
    backgroundColor: `${colors.warning}05`,
  },
  critical: {
    borderColor: colors.error,
    borderWidth: 2,
    backgroundColor: `${colors.error}05`,
  },
  
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
    height: 40,
    justifyContent: 'center',
  },
  
  textIcon: {
    fontSize: 32,
  },
  
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  
  severityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  
  warningBadge: {
    backgroundColor: colors.warning,
  },
  
  criticalBadge: {
    backgroundColor: colors.error,
  },
  
  severityText: {
    color: colors.cardBackground,
    fontSize: 10,
    fontWeight: '600',
  },
});

export default SymptomCard;
