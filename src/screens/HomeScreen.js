import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  Linking,
  TextInput,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';

// Import your enhanced components
import Header from '../components/Header';;
import Button from '../components/Button';
import SymptomCard from '../components/SymptomCard';
import AmbassadorCard from '../components/AmbassadorCard';
import EmergencyButton from '../components/EmergencyButton';
import TestimonialCard from '../components/TestimonialCard';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    feedback: '',
    rating: 0,
  });

  const handleFeedbackSubmit = () => {
    if (!feedbackForm.firstName || !feedbackForm.email || !feedbackForm.feedback) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields.');
      return;
    }
    
    Alert.alert(
      'Thank You!',
      'Your feedback has been submitted successfully. We appreciate your input!',
      [{ text: 'OK', onPress: () => {
        setFeedbackForm({
          firstName: '', lastName: '', email: '', phone: '', feedback: '', rating: 0
        });
      }}]
    );
  };

  const handleRating = (rating) => {
    setFeedbackForm(prev => ({ ...prev, rating }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header Component */}
      <Header currentScreen="Home" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <ImageBackground 
          source={require('../../assets/banner.jpg')} 
          style={styles.bgImage}
        >
          <View style={styles.contentOverlay}>
            <Ionicons name="heart-outline" size={48} color={colors.white} style={styles.heroIcon} />
            <Text style={styles.heroTitle}>Early Detection Saves Lives</Text>
            <Text style={styles.heroSubtitle}>
              Recognize stroke symptoms early and act fast. Your health matters!
            </Text>
            <Button 
              title="Start Health Check"
              variant="secondary"
              size="large"
              onPress={() => navigation.navigate('HealthCheckForm')}
              style={styles.heroButton}
            />
          </View>
        </ImageBackground>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('StrokeRiskAssessment')}
          >
            <MaterialIcons name="psychology" size={32} color={colors.primary} />
            <Text style={styles.actionTitle}>Risk Assessment</Text>
            <Text style={styles.actionText}>Check your stroke risk</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('BrainSymptoms')}
          >
            <Ionicons name="warning-outline" size={32} color={colors.warning} />
            <Text style={styles.actionTitle}>Symptoms Check</Text>
            <Text style={styles.actionText}>Identify warning signs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('EmergencyContact')}
          >
            <Ionicons name="call-outline" size={32} color={colors.emergency} />
            <Text style={styles.actionTitle}>Emergency</Text>
            <Text style={styles.actionText}>Quick contact</Text>
          </TouchableOpacity>
        </View>
        
        {/* Emergency Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Emergency Resources</Text>
          
          <View style={styles.infoCard}>
            <Ionicons name="medical-outline" size={32} color={colors.white} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Next Health Camp</Text>
              <Text style={styles.infoText}>
                Join us for a free health screening on <Text style={styles.bold}>March 15, 2025</Text>, 
                at <Text style={styles.bold}>Community Center, Main Street</Text>.
              </Text>
              <Button 
                title="Learn More"
                variant="outline"
                size="small"
                textStyle={styles.outlineButtonText}
                style={styles.infoButton}
              />
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="phone-portrait-outline" size={32} color={colors.white} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>24/7 Emergency Helpline</Text>
              <Text style={styles.infoText}>For immediate medical assistance:</Text>
              <TouchableOpacity 
                style={styles.phoneButton}
                onPress={() => Linking.openURL('tel:+911234567890')}
              >
                <Ionicons name="call" size={20} color={colors.primary} />
                <Text style={styles.phoneButtonText}>+91 123 456 7890</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="location-outline" size={32} color={colors.white} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Find Nearby Hospitals</Text>
              <Text style={styles.infoText}>
                Locate the nearest stroke-ready hospital in your area.
              </Text>
              <Button 
                title="Find Hospitals"
                variant="outline"
                size="small"
                textStyle={styles.outlineButtonText}
                style={styles.infoButton}
              />
            </View>
          </View>
        </View>
        
        {/* Symptoms Section using SymptomCard Component */}
        <View style={styles.symptomsSection}>
          <Text style={styles.sectionTitle}>Warning Signs of Stroke</Text>
          <Text style={styles.sectionSubtitle}>Remember F.A.S.T. - Face, Arms, Speech, Time</Text>
          
          <View style={styles.symptomsGrid}>
            <SymptomCard
              icon={<MaterialIcons name="balance" size={32} color={colors.primary} />}
              title="Loss of Balance"
              description="Sudden dizziness, loss of coordination, or trouble walking."
              onPress={() => navigation.navigate('BrainSymptoms')}
            />
            
            <SymptomCard
              icon={<Ionicons name="eye-outline" size={32} color={colors.primary} />}
              title="Vision Problems"
              description="Sudden vision changes, blurred or double vision."
              severity="warning"
              onPress={() => navigation.navigate('BrainSymptoms')}
            />
            
            <SymptomCard
              icon={<MaterialIcons name="airline-seat-individual-suite" size={32} color={colors.primary} />}
              title="Extreme Fatigue"
              description="Unusual tiredness and lack of energy."
              onPress={() => navigation.navigate('BrainSymptoms')}
            />
            
            <SymptomCard
              icon={<MaterialIcons name="record-voice-over" size={32} color={colors.primary} />}
              title="Speech Problems"
              description="Slurred speech or difficulty speaking clearly."
              severity="critical"
              onPress={() => navigation.navigate('BrainSymptoms')}
            />
            
            <SymptomCard
              icon={<MaterialIcons name="sentiment-very-dissatisfied" size={32} color={colors.primary} />}
              title="Severe Headache"
              description="Sudden, severe headache with no known cause."
              severity="critical"
              onPress={() => navigation.navigate('BrainSymptoms')}
            />
            
            <SymptomCard
              icon={<MaterialIcons name="psychology-alt" size={32} color={colors.primary} />}
              title="Confusion"
              description="Difficulty understanding or lack of concentration."
              severity="warning"
              onPress={() => navigation.navigate('BrainSymptoms')}
            />
          </View>
          
          <Button 
            title="Learn More About Symptoms"
            variant="primary"
            onPress={() => navigation.navigate('BrainSymptoms')}
            style={styles.learnMoreButton}
          />
        </View>
        
        {/* Brain Health Tips */}
        <View style={styles.healthSection}>
          <Text style={styles.sectionTitle}>Brain Health Tips</Text>
          <Text style={styles.sectionSubtitle}>Prevention is the best medicine</Text>
          
          <View style={styles.healthTips}>
            <View style={styles.healthTip}>
              <FontAwesome5 name="running" size={24} color={colors.secondary} />
              <Text style={styles.tipText}>Exercise regularly - 30 minutes daily</Text>
            </View>
            <View style={styles.healthTip}>
              <Ionicons name="nutrition-outline" size={24} color={colors.secondary} />
              <Text style={styles.tipText}>Eat a healthy, balanced diet</Text>
            </View>
            <View style={styles.healthTip}>
              <FontAwesome5 name="heartbeat" size={24} color={colors.secondary} />
              <Text style={styles.tipText}>Monitor blood pressure regularly</Text>
            </View>
            <View style={styles.healthTip}>
              <MaterialIcons name="smoke-free" size={24} color={colors.secondary} />
              <Text style={styles.tipText}>Avoid smoking and excessive alcohol</Text>
            </View>
            <View style={styles.healthTip}>
              <FontAwesome5 name="pills" size={24} color={colors.secondary} />
              <Text style={styles.tipText}>Take medications as prescribed</Text>
            </View>
            <View style={styles.healthTip}>
              <Ionicons name="bed-outline" size={24} color={colors.secondary} />
              <Text style={styles.tipText}>Get adequate sleep (7-9 hours)</Text>
            </View>
          </View>
        </View>
        
        {/* Community Section */}
        <View style={styles.communitySection}>
          <Text style={styles.sectionTitle}>Join Our Community</Text>
          <Text style={styles.sectionSubtitle}>
            Connect with others on their health journey
          </Text>
          
          <View style={styles.communityCard}>
            <Ionicons name="people-outline" size={48} color={colors.primary} style={styles.communityIcon} />
            <Text style={styles.communityTitle}>WhatsApp Support Group</Text>
            <Text style={styles.communityText}>
              Get daily health tips, share experiences, and stay motivated with our community.
            </Text>
            <Button 
              title="Join Community"
              variant="secondary"
              onPress={() => {}}
              style={styles.joinButton}
            />
          </View>
        </View>
        
        {/* Brand Ambassadors */}
        <View style={styles.ambassadorContainer}>
          <AmbassadorCard
            image={require('../../assets/shankar_mahadevan.jpg')}
            name="Shankar Mahadevan"
            role="Singer & Music Director"
            quote="Health awareness saves lives. Together, we can prevent strokes."
            featured={true}
            socialLinks={{
              facebook: 'https://facebook.com/shankarmahadevanofficial',
              twitter: 'https://twitter.com/shankarmahadevan',
              instagram: 'https://instagram.com/shankarmahadevan',
              linkedin: 'https://linkedin.com/in/shankarmahadevan'
            }}
            onPress={() => {
              Alert.alert(
                'Shankar Mahadevan', 
                'Learn more about our brand ambassador\'s health advocacy work.',
                [{ text: 'OK' }]
              );
            }}
          />

          <AmbassadorCard
            image={require('../../assets/supriya_vinod.jpg')}
            name="Supriya Vinod"
            role="Actress & Health Advocate"
            quote="Early detection and prevention are key to a healthy life."
            socialLinks={{
              facebook: 'https://facebook.com/supriyavinod',
              instagram: 'https://instagram.com/supriyavinod',
            }}
            onPress={() => {
              Alert.alert(
                'Supriya Vinod', 
                'Learn more about our brand ambassador\'s health advocacy work.',
                [{ text: 'OK' }]
              );
            }}
          />
        </View>
        
        {/* Feedback Form */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Share Your Feedback</Text>
          <Text style={styles.sectionSubtitle}>
            Help us improve our health services
          </Text>
          
          <View style={styles.feedbackForm}>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="First Name *"
                  placeholderTextColor={colors.placeholder}
                  value={feedbackForm.firstName}
                  onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, firstName: text }))}
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Last Name"
                  placeholderTextColor={colors.placeholder}
                  value={feedbackForm.lastName}
                  onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, lastName: text }))}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address *"
                placeholderTextColor={colors.placeholder}
                value={feedbackForm.email}
                onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={colors.placeholder}
                value={feedbackForm.phone}
                onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <MaterialIcons name="feedback" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Your Feedback *"
                placeholderTextColor={colors.placeholder}
                value={feedbackForm.feedback}
                onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, feedback: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rate our service:</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRating(star)}
                  >
                    <AntDesign 
                      name={feedbackForm.rating >= star ? "star" : "staro"} 
                      size={24} 
                      color={feedbackForm.rating >= star ? colors.warning : colors.textMuted}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <Button 
              title="Submit Feedback"
              variant="primary"
              onPress={handleFeedbackSubmit}
              style={styles.submitButton}
            />
          </View>
        </View>
        
        {/* Enhanced Testimonials */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.testimonialScroll}
        >
          <TestimonialCard
            image={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            quote="Thanks to this app, I learned the early signs of stroke and got help for my father in time. The awareness programs are truly lifesaving!"
            name="Raghav Mishra"
            role="Family Member"
            rating={5}
            featured={true}
            onPress={() => Alert.alert('Success Story', 'Read more about how early detection helped save a life.')}
          />
          
          <TestimonialCard
            image={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
            quote="The health assessments helped me understand my risk factors. I've made lifestyle changes that have improved my overall health."
            name="Priya Sharma"
            role="App User"
            rating={5}
            onPress={() => Alert.alert('Health Journey', 'Learn about lifestyle changes that prevent strokes.')}
          />
          
          <TestimonialCard
            image={{ uri: 'https://randomuser.me/api/portraits/men/55.jpg' }}
            quote="The emergency features gave me peace of mind. When my mother had symptoms, I knew exactly what to do and who to call."
            name="Jay Wagh"
            role="Caregiver"
            rating={4}
            onPress={() => Alert.alert('Emergency Response', 'Discover how quick action saves lives.')}
          />
        </ScrollView>
        
        {/* Bottom spacing for floating button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <EmergencyButton />
      
    </SafeAreaView>
  );
};

// Health app color scheme
const colors = {
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  primaryDark: '#1d4ed8',
  secondary: '#10b981',
  background: '#f8fafc',
  cardBackground: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  placeholder: '#94a3b8',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  emergency: '#dc2626',
  white: '#ffffff',
  border: '#e2e8f0',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.6)',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  
  // Hero Section
  bgImage: {
    height: 280,
    justifyContent: 'center',
  },
  contentOverlay: {
    backgroundColor: colors.overlay,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  heroIcon: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  heroButton: {
    minWidth: 200,
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Info Section
  infoSection: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: colors.white,
    alignSelf: 'flex-start',
  },
  outlineButtonText: {
    color: colors.white,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  phoneButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Common Section Styles
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  
  // Symptoms Section
  symptomsSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  symptomsGrid: {
    marginBottom: 16,
  },
  learnMoreButton: {
    alignSelf: 'center',
    minWidth: 200,
  },
  
  // Health Section
  healthSection: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  healthTips: {
    marginTop: 8,
  },
  healthTip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: 16,
  },
  
  // Community Section
  communitySection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: colors.background,
  },
  communityCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  communityIcon: {
    marginBottom: 16,
  },
  communityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  communityText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  joinButton: {
    minWidth: 160,
  },
  
  // Ambassador Section
  ambassadorSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  ambassadorCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ambassadorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  ambassadorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  ambassadorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  ambassadorRole: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  ambassadorQuote: {
    fontSize: 14,
    color: colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 12,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  
  // Feedback Section
  feedbackSection: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  feedbackForm: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
    flex: 1,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingLeft: 44, // Make room for icon
    fontSize: 16,
    color: colors.textPrimary,
  },
  halfInput: {
    flex: 1,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  submitButton: {
    alignSelf: 'center',
    minWidth: 160,
  },
  
  // Testimonial Section
  testimonialSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: colors.background,
  },
  testimonialScroll: {
    marginTop: 8,
  },
  testimonialCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginRight: 16,
    width: 280,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testimonialQuoteIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  testimonialText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  authorInfo: {
    marginLeft: 12,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  testimonialRole: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  
  // Emergency Button
  emergencyButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: colors.emergency,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
  bottomSpacer: {
    height: 100,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default HomeScreen;