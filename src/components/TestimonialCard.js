import React from 'react';
<<<<<<< HEAD
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TestimonialCard = ({ 
  image, 
  quote, 
  name, 
  role,
  rating,
  onPress,
  featured = false,
  style 
}) => {
  const renderStars = () => {
    if (!rating) return null;
    
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={16}
            color={star <= rating ? colors.warning : colors.border}
          />
        ))}
      </View>
    );
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent 
      style={[
        styles.card, 
        featured && styles.featuredCard,
        style
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={14} color={colors.white} />
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
      
      <View style={styles.imageContainer}>
        <Image 
          source={image} 
          style={styles.image} 
        />
        <View style={styles.imageOverlay}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        </View>
      </View>
      
      <Ionicons 
        name="chatbubble-outline" 
        size={32} 
        color={colors.primary} 
        style={styles.quoteIcon} 
      />
      
      <Text style={styles.quote}>"{quote}"</Text>
      
      {renderStars()}
      
      <View style={styles.authorInfo}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
      </View>
      
      <View style={styles.healthBadge}>
        <Ionicons name="heart-outline" size={16} color={colors.secondary} />
        <Text style={styles.healthBadgeText}>Health Success</Text>
      </View>
    </CardComponent>
  );
};

// Health app color scheme (consistent with your other components)
const colors = {
  primary: '#2563eb',
  secondary: '#10b981',
  success: '#10b981',
  warning: '#f59e0b',
  white: '#ffffff',
  cardBackground: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  shadow: '#000000',
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    margin: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 280,
    position: 'relative',
  },
  
  featuredCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
  },
  
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
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
  
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  
=======
import { View, Text, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const TestimonialCard = ({ image, quote, name, role }) => {
  return (
    <View style={styles.card}>
      <Image 
        source={image} 
        style={styles.image} 
      />
      <FontAwesome name="quote-left" size={24} color="#0d6efd" style={styles.quoteIcon} />
      <Text style={styles.quote}>{quote}</Text>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.role}>{role}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
<<<<<<< HEAD
    backgroundColor: colors.border,
  },
  
  imageOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 2,
  },
  
  quoteIcon: {
    marginBottom: 12,
    opacity: 0.8,
  },
  
  quote: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
    color: colors.textSecondary,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 2,
  },
  
  authorInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  
  role: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.secondary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${colors.secondary}30`,
  },
  
  healthBadgeText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default TestimonialCard;
=======
    marginBottom: 15,
  },
  quoteIcon: {
    marginBottom: 10,
  },
  quote: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
    color: '#555',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  role: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
});

export default TestimonialCard;
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
