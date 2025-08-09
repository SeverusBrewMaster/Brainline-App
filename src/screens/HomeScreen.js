<<<<<<< HEAD
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
=======
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ImageBackground, 
  Linking,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Button from '../components/Button';
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [userCoords, setUserCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nearestHospital, setNearestHospital] = useState(null);

  const hospitals = [
    {
      name: 'MGM,Vashi',
      phone: '14466',
      location: { latitude: 19.0723, longitude: 72.9936 },
    },
    {
      name: 'Apollo Hospital',
      phone: '1066',
      location: { latitude: 19.0207, longitude: 73.0291 },
    },
    {
      name: 'Medicover, Kharghar',
      phone: '040 6833 4455',
      location: { latitude: 19.0364, longitude: 73.0764 },
    },
  ];

  // Function to calculate distance between two coordinates (Haversine Formula)
  const getDistance = (loc1, loc2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in kilometers
    const dLat = toRad(loc2.latitude - loc1.latitude);
    const dLon = toRad(loc2.longitude - loc1.longitude);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(loc1.latitude)) *
        Math.cos(toRad(loc2.latitude)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Returns distance in kilometers
  };

  // Request location permission and fetch the user's current location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required.');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserCoords(location.coords);

        // Find the nearest hospital based on the current location
        const nearest = hospitals.reduce((prev, curr) => {
          const prevDist = getDistance(location.coords, prev.location);
          const currDist = getDistance(location.coords, curr.location);
          return prevDist < currDist ? prev : curr;
        });
        
        setNearestHospital(nearest);
        setLoading(false);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Something went wrong during location fetching.');
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  // Function to open emergency call for the nearest hospital
  const openEmergencyCall = () => {
    if (nearestHospital) {
      Alert.alert(
        'Emergency Call',
        `Nearest: ${nearestHospital.name}\nPhone: ${nearestHospital.phone}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call Now',
            onPress: () => Linking.openURL(`tel:${nearestHospital.phone}`),
          },
        ]
      );
    }
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
  };

  return (
    <SafeAreaView style={styles.container}>
<<<<<<< HEAD
      {/* Enhanced Header Component */}
      <Header currentScreen="Home" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
=======
      <Header navigation={navigation} />
      
      <ScrollView style={styles.scrollView}>
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
        {/* Hero Banner */}
        <ImageBackground 
          source={require('../../assets/banner.jpg')} 
          style={styles.bgImage}
        >
          <View style={styles.contentOverlay}>
<<<<<<< HEAD
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
=======
            <Text style={styles.heroTitle}>Early Detection Saves Lives</Text>
            <Text style={styles.heroSubtitle}>Recognize the symptoms early and act fast. Your health matters!</Text>
          </View>
        </ImageBackground>

        {/* Loading state */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0d6efd" />
            <Text>Locating the nearest hospital...</Text>
          </View>
        ) : (
          <>
            {/* Emergency Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Icon name="hand-holding-heart" size={40} color="#fff" />
                <Text style={styles.infoTitle}>Next NGO Camp</Text>
                <Text style={styles.infoText}>Join us for a free health camp on <Text style={styles.bold}>date</Text>, at <Text style={styles.bold}>Location</Text>.</Text>
                <Button 
                  title="Learn More" 
                  onPress={() => {}} 
                  style={styles.outlineButton} 
                  textStyle={styles.outlineButtonText}
                />
              </View>

              <View style={styles.infoCard}>
                <Icon name="phone-alt" size={40} color="#fff" />
                <Text style={styles.infoTitle}>Emergency Contact</Text>
                <Text style={styles.infoText}>For immediate assistance, call:</Text>
                <Button 
                  title="+91 123 456 7890" 
                  onPress={() => Linking.openURL('tel:+911234567890')} 
                  style={styles.outlineButton} 
                  textStyle={styles.outlineButtonText}
                />
              </View>

              <View style={styles.infoCard}>
                <Icon name="hospital" size={40} color="#fff" />
                <Text style={styles.infoTitle}>Contact Your Nearby Hospital</Text>
                <Text style={styles.infoText}>For immediate assistance, please reach out to your nearest hospital.</Text>
                <Button 
                  title="Call Nearest Hospital" 
                  onPress={openEmergencyCall} 
                  style={styles.outlineButton} 
                  textStyle={styles.outlineButtonText}
                />
              </View>
            </View>
          </>
        )}
<View style={styles.symptomsSection}>
          <Text style={styles.sectionTitle}>Symptoms of Brain Stroke</Text>
          
          <View style={styles.symptomsGrid}>
            {/* Balance */}
            <View style={styles.symptomBox}>
              <Icon name="people-arrows" size={30} color="#0d6efd" />
              <Text style={styles.symptomTitle}>Loss of Balance</Text>
              <Text style={styles.symptomText}>Difficulty in maintaining balance and coordination while walking or standing.</Text>
            </View>
            
            {/* Eye Problems */}
            <View style={styles.symptomBox}>
              <Icon name="eye" size={30} color="#0d6efd" />
              <Text style={styles.symptomTitle}>Eye Problems</Text>
              <Text style={styles.symptomText}>Sudden vision changes, including blurred or double vision.</Text>
            </View>
            
            {/* Fatigue */}
            <View style={styles.symptomBox}>
              <Icon name="battery-empty" size={30} color="#0d6efd" />
              <Text style={styles.symptomTitle}>Extreme Fatigue</Text>
              <Text style={styles.symptomText}>Unusual tiredness and lack of energy throughout the day.</Text>
            </View>
            
            {/* Speech */}
            <View style={styles.symptomBox}>
              <Icon name="microphone-alt-slash" size={30} color="#0d6efd" />
              <Text style={styles.symptomTitle}>Speech Disturbance</Text>
              <Text style={styles.symptomText}>Slurred speech or difficulty in speaking clearly.</Text>
            </View>
            
            {/* Headache */}
            <View style={styles.symptomBox}>
              <Icon name="head-side-virus" size={30} color="#0d6efd" />
              <Text style={styles.symptomTitle}>Terrible Headache</Text>
              <Text style={styles.symptomText}>Severe and sudden headaches with no known cause.</Text>
            </View>
            
            {/* Concentration */}
            <View style={styles.symptomBox}>
              <Icon name="user-clock" size={30} color="#0d6efd" />
              <Text style={styles.symptomTitle}>Lack of Concentration</Text>
              <Text style={styles.symptomText}>Difficulty in focusing or staying attentive.</Text>
            </View>
          </View>
          
          <Button 
            title="Learn More" 
            onPress={() => navigation.navigate('BrainSymptoms')} 
            style={styles.learnMoreButton} 
            textStyle={styles.learnMoreButtonText}
          />
        </View>
        
        {/* Brain Health Section */}
        <View style={styles.brainHealthSection}>
          <View style={styles.imageContainer}>
            <Image 
              source={require('../../assets/image1.jpg')} 
              style={styles.overlappingImage1} 
            />
            <Image 
              source={require('../../assets/image2.jpg')} 
              style={styles.overlappingImage2} 
            />
          </View>
          
          <View style={styles.healthContent}>
            <Text style={styles.healthSectionTag}>Making your brain healthy</Text>
            <Text style={styles.healthSectionTitle}>Best Care For Your Brain</Text>
            <Text style={styles.healthSectionText}>
              Taking care of your brain is essential to prevent strokes and maintain cognitive health.
              Stay physically active, eat a balanced diet rich in nutrients, manage stress levels,
              monitor blood pressure, avoid smoking, and get regular check-ups. A healthy brain
              leads to a healthier life.
            </Text>
            
            <View style={styles.healthListContainer}>
              <View style={styles.healthListItem}>
                <Icon name="check-circle" size={16} color="#0d6efd" />
                <Text style={styles.healthListText}>Regular Exercises.</Text>
              </View>
              <View style={styles.healthListItem}>
                <Icon name="check-circle" size={16} color="#0d6efd" />
                <Text style={styles.healthListText}>Visiting doctors in case of slightest inconvenience.</Text>
              </View>
              <View style={styles.healthListItem}>
                <Icon name="check-circle" size={16} color="#0d6efd" />
                <Text style={styles.healthListText}>Checking your BMI on regular basis.</Text>
              </View>
              <View style={styles.healthListItem}>
                <Icon name="check-circle" size={16} color="#0d6efd" />
                <Text style={styles.healthListText}>Avoid Alcohol Consumption.</Text>
              </View>
            </View>
            
            <Button 
              title="Learn More" 
              onPress={() => {}} 
              style={styles.outlinePrimaryButton} 
              textStyle={styles.outlinePrimaryButtonText}
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
            />
          </View>
        </View>
        
<<<<<<< HEAD
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
=======
        {/* Connect Section */}
        <View style={styles.connectSection}>
          <Text style={styles.connectTitle}>CONNECT WITH US</Text>
          <Text style={styles.connectSubtitle}>Scan the QR code to join our community on WhatsApp</Text>
          
          <View style={styles.connectContainer}>
            <View style={styles.qrCard}>
              <Text style={styles.qrCardTitle}>Join Our Community</Text>
              <Text style={styles.qrCardText}>Use your WhatsApp camera to scan the QR code.</Text>
              <Image 
                source={require('../../assets/qr_code.png')} 
                style={styles.qrImage} 
              />
              <Button 
                  title="Join Now" 
                  onPress={() => Linking.openURL('https://chat.whatsapp.com/DxUgodzYXTYF3xijfcPBoQ')} 
                  style={styles.primaryButton} 
                  textStyle={styles.primaryButtonText}
                />

            </View>
            
            <View style={styles.howToJoinContainer}>
              <Text style={styles.howToJoinTitle}>How to Join?</Text>
              <Text style={styles.howToJoinStep}>• Open WhatsApp App</Text>
              <Text style={styles.howToJoinStep}>• Click Camera / QR icon to scan</Text>
              <Text style={styles.howToJoinStep}>• Join our growing community</Text>
            </View>
          </View>
        </View>
        
        {/* Ambassador Section */}
        <View style={styles.ambassadorSection}>
          <Text style={styles.ambassadorTitle}>Our Brand Ambassadors</Text>
          <Text style={styles.ambassadorSubtitle}>We are honored to be represented by these distinguished personalities.</Text>
          
          <View style={styles.ambassadorContainer}>
            <View style={styles.ambassadorCard}>
              <Image 
                source={require('../../assets/shankar_mahadevan.jpg')} 
                style={styles.ambassadorImage} 
              />
              <View style={styles.ambassadorInfo}>
                <Text style={styles.ambassadorName}>Shankar Mahadevan</Text>
                <Text style={styles.ambassadorRole}>Indian Singer & Music Director</Text>
                <View style={styles.socialIcons}>
                  <TouchableOpacity>
                    <Icon name="facebook" size={20} color="#3b5998" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Icon name="twitter" size={20} color="#1DA1F2" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Icon name="instagram" size={20} color="#C13584" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.ambassadorCard}>
              <Image 
                source={require('../../assets/supriya_vinod.jpg')} 
                style={styles.ambassadorImage} 
              />
              <View style={styles.ambassadorInfo}>
                <Text style={styles.ambassadorName}>Supriya Vinod</Text>
                <Text style={styles.ambassadorRole}>Marathi Actress & Costume Designer</Text>
                <View style={styles.socialIcons}>
                  <TouchableOpacity>
                    <Icon name="facebook" size={20} color="#3b5998" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Icon name="twitter" size={20} color="#1DA1F2" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Icon name="instagram" size={20} color="#C13584" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        {/* Feedback Form */}
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>FEEDBACK FORM</Text>
          <View style={styles.formBox}>
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.input}>
                <Text style={styles.inputPlaceholder}>First Name</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.input}>
                <Text style={styles.inputPlaceholder}>Last Name</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.input}>
                <Text style={styles.inputPlaceholder}>Email</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.input}>
                <Text style={styles.inputPlaceholder}>Phone Number</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <TouchableOpacity style={[styles.input, styles.textArea]}>
                <Text style={styles.inputPlaceholder}>Your Feedback</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rate Us:</Text>
              <View style={styles.stars}>
                <Icon name="star" size={24} color="#ccc" />
                <Icon name="star" size={24} color="#ccc" />
                <Icon name="star" size={24} color="#ccc" />
                <Icon name="star" size={24} color="#ccc" />
                <Icon name="star" size={24} color="#ccc" />
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
              </View>
            </View>
            
            <Button 
<<<<<<< HEAD
              title="Submit Feedback"
              variant="primary"
              onPress={handleFeedbackSubmit}
              style={styles.submitButton}
=======
              title="Submit Feedback" 
              onPress={() => {}} 
              style={styles.primaryButton} 
              textStyle={styles.primaryButtonText}
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
            />
          </View>
        </View>
        
<<<<<<< HEAD
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
=======
        {/* Testimonials Section */}
        <View style={styles.testimonialSection}>
          <Text style={styles.testimonialSectionTitle}>OUR TESTIMONIALS</Text>
          <Text style={styles.testimonialHeading}>Our Patients Say</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialScroll}>
            <View style={styles.testimonialCard}>
              <Image 
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
                style={styles.testimonialImage} 
              />
              <Icon name="quote-left" size={20} color="#0d6efd" style={styles.quoteIcon} />
              <Text style={styles.testimonialText}>"Thanks to this NGO, I learned the early signs of stroke and got help for my father in time. Their awareness programs are lifesaving!"</Text>
              <Text style={styles.testimonialName}>Raghav Mishra</Text>
              <Text style={styles.testimonialRole}>Patient's Family Member</Text>
            </View>
            
            <View style={styles.testimonialCard}>
              <Image 
                source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} 
                style={styles.testimonialImage} 
              />
              <Icon name="quote-left" size={20} color="#0d6efd" style={styles.quoteIcon} />
              <Text style={styles.testimonialText}>"The awareness campaigns are incredible. I now understand the importance of stroke prevention and early diagnosis!"</Text>
              <Text style={styles.testimonialName}>Pandurang Kokate</Text>
              <Text style={styles.testimonialRole}>Patient</Text>
            </View>
            
            <View style={styles.testimonialCard}>
              <Image 
                source={{ uri: 'https://randomuser.me/api/portraits/men/55.jpg' }} 
                style={styles.testimonialImage} 
              />
              <Icon name="quote-left" size={20} color="#0d6efd" style={styles.quoteIcon} />
              <Text style={styles.testimonialText}>"Volunteering here has been life-changing. Helping spread awareness has saved lives and made a real difference!"</Text>
              <Text style={styles.testimonialName}>Jay Wagh</Text>
              <Text style={styles.testimonialRole}>Volunteer</Text>
            </View>
          </ScrollView>
        </View>       
      </ScrollView>
      
      {/* Emergency Button */}
      <TouchableOpacity style={styles.emergencyButton} onPress={openEmergencyCall}>
        <Text style={styles.emergencyButtonText}>Call Emergency</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
  },
  scrollView: {
    flex: 1,
  },
<<<<<<< HEAD
  
  // Hero Section
  bgImage: {
    height: 280,
    justifyContent: 'center',
  },
  contentOverlay: {
    backgroundColor: colors.overlay,
    padding: 24,
=======
  bgImage: {
    height: 250,
    justifyContent: 'center',
  },
  contentOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
<<<<<<< HEAD
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
=======
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#0d6efd',
    padding: 20,
  },
  infoCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  outlineButton: {
    borderColor: '#fff',
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  outlineButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  symptomsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  symptomBox: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  symptomTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  symptomText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6c757d',
  },
  learnMoreButton: {
    borderColor: '#0d6efd',
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 15,
  },
  learnMoreButtonText: {
    color: '#0d6efd',
    fontWeight: '600',
  },
  brainHealthSection: {
    padding: 20,
  },
  imageContainer: {
    height: 240,
    marginBottom: 20,
    position: 'relative',
  },
  overlappingImage1: {
    width: '50%',
    height: 150,
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 8,
  },
  overlappingImage2: {
    width: '60%',
    height: 180,
    position: 'absolute',
    top: 40,
    right: 0,
    borderRadius: 8,
  },
  healthContent: {
    marginTop: 30,
  },
  healthSectionTag: {
    color: '#0d6efd',
    marginBottom: 5,
  },
  healthSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  healthSectionText: {
    color: '#6c757d',
    lineHeight: 22,
    marginBottom: 15,
  },
  healthListContainer: {
    marginVertical: 15,
  },
  healthListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthListText: {
    marginLeft: 10,
  },
  outlinePrimaryButton: {
    borderColor: '#0d6efd',
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  outlinePrimaryButtonText: {
    color: '#0d6efd',
    fontWeight: '600',
  },
  connectSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  connectTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  connectSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#6c757d',
  },
  connectContainer: {
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  qrCardTitle: {
    color: '#0d6efd',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  qrCardText: {
    color: '#6c757d',
    marginBottom: 15,
    textAlign: 'center',
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#0d6efd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  howToJoinContainer: {
    marginTop: 20,
    width: '90%',
  },
  howToJoinTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  howToJoinStep: {
    fontSize: 16,
    marginBottom: 5,
  },
  ambassadorSection: {
    padding: 20,
  },
  ambassadorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  ambassadorSubtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#6c757d',
  },
  ambassadorContainer: {
    marginBottom: 20,
  },
  ambassadorCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
  },
  ambassadorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
<<<<<<< HEAD
    marginRight: 16,
  },
  ambassadorInfo: {
    flex: 1,
=======
  },
  ambassadorInfo: {
    flex: 1,
    marginLeft: 15,
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
    justifyContent: 'center',
  },
  ambassadorName: {
    fontSize: 18,
    fontWeight: 'bold',
<<<<<<< HEAD
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
=======
    marginBottom: 3,
  },
  ambassadorRole: {
    color: '#6c757d',
    marginBottom: 8,
  },
  socialIcons: {
    flexDirection: 'row',
    width: 100,
    justifyContent: 'space-between',
  },
  feedbackContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  feedbackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  formBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  inputPlaceholder: {
    color: '#6c757d',
  },
  textArea: {
    height: 100,
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
<<<<<<< HEAD
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
=======
    marginRight: 10,
    fontSize: 16,
  },
  stars: {
    flexDirection: 'row',
  },
  testimonialSection: {
    padding: 20,
  },
  testimonialSectionTitle: {
    fontSize: 16,
    color: '#0d6efd',
    textAlign: 'center',
    marginBottom: 5,
  },
  testimonialHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  testimonialScroll: {
    marginTop: 10,
  },
  testimonialCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginRight: 15,
    width: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testimonialImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 15,
  },
  quoteIcon: {
    marginBottom: 10,
  },
  testimonialText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    color: '#6c757d',
    lineHeight: 22,
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: 'bold',
<<<<<<< HEAD
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
=======
  },
  testimonialRole: {
    fontSize: 14,
    color: '#6c757d',
  },
  emergencyButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#dc3545',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emergencyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  }
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
});

export default HomeScreen;