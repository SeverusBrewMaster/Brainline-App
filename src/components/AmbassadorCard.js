import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  Linking,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AmbassadorCard = ({ 
  image, 
  name, 
  role, 
  quote,
  socialLinks = {},
  onPress,
  featured = false 
}) => {
  
  const handleSocialPress = (platform, url) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', `Unable to open ${platform}. Please try again later.`);
      });
    } else {
      Alert.alert('Coming Soon', `${name}'s ${platform} profile will be available soon.`);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, featured && styles.featuredCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
        {featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={16} color={colors.white} />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
        
        {quote && (
          <Text style={styles.quote}>"{quote}"</Text>
        )}
        
        <View style={styles.socialIcons}>
          <TouchableOpacity 
            style={styles.socialIcon}
            onPress={() => handleSocialPress('Facebook', socialLinks.facebook)}
          >
            <Ionicons name="logo-facebook" size={24} color="#1877f2" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialIcon}
            onPress={() => handleSocialPress('Twitter', socialLinks.twitter)}
          >
            <Ionicons name="logo-twitter" size={24} color="#1da1f2" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialIcon}
            onPress={() => handleSocialPress('Instagram', socialLinks.instagram)}
          >
            <Ionicons name="logo-instagram" size={24} color="#e4405f" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialIcon}
            onPress={() => handleSocialPress('LinkedIn', socialLinks.linkedin)}
          >
            <Ionicons name="logo-linkedin" size={24} color="#0077b5" />
          </TouchableOpacity>
        </View>
        
        {/* Health advocacy badge */}
        <View style={styles.advocacyBadge}>
          <Ionicons name="heart-outline" size={16} color={colors.secondary} />
          <Text style={styles.advocacyText}>Health Advocate</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Health app color scheme (consistent with your other components)
const colors = {
  primary: '#2563eb',
  secondary: '#10b981',
  background: '#f8fafc',
  cardBackground: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  success: '#10b981',
  warning: '#f59e0b',
  white: '#ffffff',
  border: '#e2e8f0',
  shadow: '#000000',
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuredCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 120,
    height: 160,
    backgroundColor: colors.background,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  info: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  quote: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 12,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  socialIcons: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  socialIcon: {
    marginRight: 16,
    padding: 4,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  advocacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: `${colors.secondary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.secondary}30`,
  },
  advocacyText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default AmbassadorCard;
