import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Linking,
  TextInput,
  Alert,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import * as Location from 'expo-location';

import Header from '../components/Header';
import Button from '../components/Button';
import SymptomCard from '../components/SymptomCard';
import AmbassadorCard from '../components/AmbassadorCard';
import TestimonialCard from '../components/TestimonialCard';

import { auth } from '../firebase/config';
import { getNextCamp, getHospitals, getAnnouncements, getUserProfile } from '../services/AppDataService';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#2563eb',
  secondary: '#10b981',
  background: '#f8fafc',
  cardBackground: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  warning: '#f59e0b',
  error: '#ef4444',
  emergency: '#dc2626',
  white: '#ffffff',
  border: '#e2e8f0',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.6)',
  success: '#10b981',
};

function toRad(v) { return (v * Math.PI) / 180; }
function haversineDistance(a, b) {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const s = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export default function HomeScreen({ navigation }) {
  const user = auth.currentUser;

  // UI state
  const [refreshing, setRefreshing] = useState(false);
  const [loadingBoot, setLoadingBoot] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [healthCamps, setHealthCamps] = useState([]);

  // Data from Firestore
  const [profile, setProfile] = useState(null);
  const [nextCamp, setNextCamp] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Location state
  const [userCoords, setUserCoords] = useState(null);
  const [nearestHospital, setNearestHospital] = useState(null);

  // Feedback form
  const [feedbackForm, setFeedbackForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    feedback: '',
    rating: 0,
  });

  const greetName = useMemo(() => {
    const displayName = profile?.profile.name || user?.displayName || user?.email || 'User';
    return String(displayName).split(' ')[0];
  }, [profile, user]);

  // Update loadCore function
  const loadCore = useCallback(async () => {
    try {
      setLoadingBoot(true);
      const uid = auth.currentUser?.uid;

      const [camp, camps, hosp, anns, prof] = await Promise.all([
        getNextCamp(), // Featured camp
        getHealthCamps(5), // Multiple camps for display
        getHospitals(),
        getAnnouncements(10),
        uid ? getUserProfile(uid) : Promise.resolve(null),
      ]);

      setNextCamp(camp);
      setHealthCamps(camps || []);
      setHospitals(hosp || []);
      setAnnouncements(anns || []);
      setProfile(prof);

    } catch (e) {
      console.error('Home load error:', e);
      Alert.alert('Error', 'Failed to load home data.');
    } finally {
      setLoadingBoot(false);
    }
  }, []);


  const fetchLocation = useCallback(async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Please enable location to find nearest hospitals.');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserCoords(location.coords);
    } catch (e) {
      console.error('Location error:', e);
      Alert.alert('Location Error', 'Unable to get location. You can still call emergency services.');
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => { loadCore(); }, [loadCore]);
  useEffect(() => { fetchLocation(); }, [fetchLocation]);

  // Compute nearest hospital when coords or hospitals change
  useEffect(() => {
    if (!userCoords || hospitals.length === 0) {
      setNearestHospital(null);
      return;
    }

    const hospitalsWithDistance = hospitals
      .filter(h => h.location?.latitude && h.location?.longitude)
      .map(h => ({
        ...h,
        distance: haversineDistance(
          { latitude: userCoords.latitude, longitude: userCoords.longitude },
          { latitude: h.location.latitude, longitude: h.location.longitude }
        )
      }))
      .sort((a, b) => a.distance - b.distance);

    // ✅ FIXED: Set the nearest hospital (first in sorted array), not the entire array
    setNearestHospital(hospitalsWithDistance.length > 0 ? hospitalsWithDistance[0] : null);
  }, [userCoords, hospitals]);


  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCore(), fetchLocation()]);
    setRefreshing(false);
  };

  const openEmergencyCall = () => {
    if (nearestHospital && nearestHospital.name) {
      const distance = nearestHospital.distance ? `${nearestHospital.distance.toFixed(1)} km away` : 'Distance unknown';

      Alert.alert(
        '🚨 Emergency Call',
        `Nearest Hospital: ${nearestHospital.name}\n${distance}\nAddress: ${nearestHospital.address || 'Address not available'}\nPhone: ${nearestHospital.phone || 'Phone not available'}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call Now',
            style: 'destructive',
            onPress: () => {
              if (nearestHospital.phone) {
                Linking.openURL(`tel:${nearestHospital.phone}`);
              } else {
                Alert.alert('No Phone', 'Phone number not available for this hospital.');
              }
            },
          },
          {
            text: 'Get Directions',
            onPress: () => openMapDirections(),
          }
        ]
      );
    } else {
      // Fallback to general emergency services
      Alert.alert('🚨 Emergency Services', 'Choose emergency service:', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Ambulance (108)', onPress: () => Linking.openURL('tel:108') },
        { text: 'Police (100)', onPress: () => Linking.openURL('tel:100') },
        { text: 'Fire (101)', onPress: () => Linking.openURL('tel:101') },
      ]);
    }
  };


  const openMapDirections = () => {
    if (nearestHospital?.location?.latitude && nearestHospital?.location?.longitude && userCoords) {
      const url = `https://www.google.com/maps/dir/${userCoords.latitude},${userCoords.longitude}/${nearestHospital.location.latitude},${nearestHospital.location.longitude}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open maps. Please check if you have a maps app installed.');
      });
    } else {
      Alert.alert('Navigation Error', 'Unable to get directions. Location data is not available.');
    }
  };

  // ✅ FIXED: Show nearby hospitals with proper validation
const showNearbyHospitals = () => {
  if (!userCoords) {
    Alert.alert('Location Required', 'Please enable location services to see nearby hospitals.');
    return;
  }

  if (hospitals.length === 0) {
    Alert.alert('No Hospitals', 'No hospital data available at the moment.');
    return;
  }

  const hospitalsWithDistance = hospitals
    .filter(h => h.location?.latitude && h.location?.longitude) // Filter valid hospitals
    .map(hospital => ({
      ...hospital,
      distance: haversineDistance(
        { latitude: userCoords.latitude, longitude: userCoords.longitude },
        { latitude: hospital.location.latitude, longitude: hospital.location.longitude }
      )
    }))
    .sort((a, b) => a.distance - b.distance);

  if (hospitalsWithDistance.length === 0) {
    Alert.alert('No Hospitals', 'No hospitals with valid location data found.');
    return;
  }

  const hospitalList = hospitalsWithDistance.slice(0, 5).map(hospital =>
    `${hospital.name}\n📍 ${hospital.distance.toFixed(1)} km away\n📞 ${hospital.phone || 'No phone available'}`
  ).join('\n\n');

  Alert.alert('🏥 Nearby Hospitals', hospitalList, [
    { text: 'OK' },
    {
      text: 'Call Nearest',
      onPress: () => {
        const nearest = hospitalsWithDistance[0];
        if (nearest?.phone) {
          Linking.openURL(`tel:${nearest.phone}`);
        } else {
          Alert.alert('No Phone', 'Phone number not available for the nearest hospital.');
        }
      }
    }
  ]);
};


  const handleFeedbackSubmit = () => {
    if (!feedbackForm.firstName || !feedbackForm.email || !feedbackForm.feedback) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields.');
      return;
    }

    Alert.alert('Thank You!', 'Your feedback has been submitted successfully. We appreciate your input!', [
      { text: 'OK', onPress: () => {
        setFeedbackForm({
          firstName: '', lastName: '', email: '', phone: '', feedback: '', rating: 0
        });
      }}
    ]);
  };

  const handleRating = (rating) => {
    setFeedbackForm(prev => ({ ...prev, rating }));
  };

  if (loadingBoot) {
    return (
      <View style={[styles.center, { flex: 1 }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Header title="Brainline" currentScreen="Home" />

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Hero Banner with Personalized Greeting */}
        <ImageBackground source={require('../../assets/banner.jpg')} style={styles.bgImage}>
          <View style={styles.contentOverlay}>
            <Ionicons name="pulse" size={48} color={colors.white} style={styles.heroIcon} />
            <Text style={styles.heroTitle}>Hi, {greetName}!</Text>
            <Text style={styles.heroSubtitle}>
              Early detection saves lives. Take charge of your brain health today.
            </Text>
            <Button
              title="Start Health Check"
              onPress={() => navigation.navigate('User')}
              style={styles.heroButton}
            />
          </View>
        </ImageBackground>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Riskometer')}
          >
            <Ionicons name="analytics" size={24} color={colors.primary} />
            <Text style={styles.actionTitle}>Risk Assessment</Text>
            <Text style={styles.actionText}>Check your stroke risk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('BrainSymptoms')}
          >
            <Ionicons name="medical" size={24} color={colors.secondary} />
            <Text style={styles.actionTitle}>Symptoms Check</Text>
            <Text style={styles.actionText}>Identify warning signs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={openEmergencyCall}
          >
            <Ionicons name="call" size={24} color={colors.emergency} />
            <Text style={styles.actionTitle}>Emergency</Text>
            <Text style={styles.actionText}>Quick contact</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Resources Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Other Resources</Text>
          {/* ✅ NEW: All Health Camps Section */}
          {healthCamps.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>🏥 Upcoming Health Camps</Text>
              <Text style={styles.sectionSubtitle}>Join our free health screening programs</Text>

              {healthCamps.map(camp => (
                <View key={camp.id} style={styles.infoCard}>
                  <Ionicons name="medical" size={24} color={colors.white} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>{camp.title}</Text>
                    <Text style={styles.infoText}>
                      📅 {camp.date ? new Date(camp.date).toLocaleDateString() : 'Date TBA'}
                      {'\n'}📍 {camp.location || 'Location TBA'}
                    </Text>
                    {camp.description && (
                      <Text style={styles.infoText}>
                        📝 {camp.description}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}


          {/* Location-based nearest hospital card */}
          {nearestHospital && (
            <View style={styles.infoCard}>
              <Ionicons name="medical" size={24} color={colors.white} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>🏥 Nearest Hospital</Text>
                <Text style={styles.infoText}>
                  {nearestHospital.name}
                  {nearestHospital.distance && ` - ${nearestHospital.distance.toFixed(1)} km away`}
                </Text>
                <View style={styles.hospitalActions}>
                  <TouchableOpacity
                    style={styles.phoneButton}
                    onPress={() => {
                      if (nearestHospital.phone) {
                        Linking.openURL(`tel:${nearestHospital.phone}`);
                      } else {
                        Alert.alert('No Phone', 'Phone number not available');
                      }
                    }}
                  >
                    <Ionicons name="call" size={16} color={colors.primary} />
                    <Text style={styles.phoneButtonText}>
                      {nearestHospital.phone || 'No phone available'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.phoneButton, { marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.2)' }]}
                    onPress={openMapDirections}
                  >
                    <Ionicons name="navigate" size={16} color={colors.white} />
                    <Text style={[styles.phoneButtonText, { color: colors.white }]}>Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          
          {/* ✅ IMPROVED: Loading and error states for location */}
          {locationLoading && (
            <View style={styles.infoCard}>
              <ActivityIndicator size="small" color={colors.white} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Finding Nearest Hospital...</Text>
                <Text style={styles.infoText}>
                  Getting your location to find the closest emergency services.
                </Text>
              </View>
            </View>
          )}
          
          {/* ✅ NEW: Show message when no location permission or no hospitals */}
          {!locationLoading && !nearestHospital && !userCoords && (
            <View style={styles.infoCard}>
              <Ionicons name="location-outline" size={24} color={colors.white} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Enable Location</Text>
                <Text style={styles.infoText}>
                  Allow location access to find the nearest emergency hospitals.
                </Text>
                <TouchableOpacity style={styles.infoButton} onPress={fetchLocation}>
                  <Text style={styles.outlineButtonText}>Enable Location</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {!locationLoading && !nearestHospital && userCoords && hospitals.length === 0 && (
            <View style={styles.infoCard}>
              <Ionicons name="medical-outline" size={24} color={colors.white} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>No Hospitals Found</Text>
                <Text style={styles.infoText}>
                  No hospital data available. Please contact emergency services directly.
                </Text>
                <TouchableOpacity 
                  style={styles.phoneButton} 
                  onPress={() => Linking.openURL('tel:108')}
                >
                  <Ionicons name="call" size={16} color={colors.primary} />
                  <Text style={styles.phoneButtonText}>Call 108 (Ambulance)</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
      
          {/* Admin-configured health camp */}
          {nextCamp && (
            <View style={styles.infoCard}>
              <Ionicons name="calendar" size={24} color={colors.white} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{nextCamp.title || 'Next Health Camp'}</Text>
                <Text style={styles.infoText}>
                  {nextCamp.description || 'Join us for a free health screening.'}{'\n'}
                  📅 {nextCamp.date || 'Date TBA'} • 📍 {nextCamp.location || 'Location TBA'}
                </Text>
              </View>
            </View>
          )}

          {/* 24/7 Emergency helpline */}
          <View style={styles.infoCard}>
            <Ionicons name="headset" size={24} color={colors.white} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>24/7 Emergency Helpline</Text>
              <Text style={styles.infoText}>For immediate medical assistance:</Text>
              <TouchableOpacity
                style={styles.phoneButton}
                onPress={() => Linking.openURL('tel:+911234567890')}
              >
                <Ionicons name="call" size={16} color={colors.primary} />
                <Text style={styles.phoneButtonText}>+91 123 456 7890</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hospital finder */}
          <View style={styles.infoCard}>
            <Ionicons name="business" size={24} color={colors.white} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Find Nearby Hospitals</Text>
              <Text style={styles.infoText}>
                {userCoords
                  ? `Found ${hospitals.length} hospitals in your area.`
                  : 'Enable location to find stroke-ready hospitals near you.'
                }
              </Text>
              <Button
                title={userCoords ? "Show All Hospitals" : "Enable Location"}
                onPress={userCoords ? showNearbyHospitals : fetchLocation}
                style={styles.infoButton}
                textStyle={styles.outlineButtonText}
              />
            </View>
          </View>
        </View>

        {/* Admin Announcements */}
        {announcements.length > 0 && (
          <View style={styles.announcementsSection}>
            <Text style={styles.sectionTitle}>📢 Latest Announcements</Text>
            {announcements.map(announcement => (
              <View key={announcement.id} style={styles.announcementCard}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementMessage}>{announcement.message}</Text>
                <Text style={styles.announcementDate}>
                  {announcement.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently posted'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Symptoms Section */}
        <View style={styles.symptomsSection}>
          <Text style={styles.sectionTitle}>Warning Signs of Stroke</Text>
          <Text style={styles.sectionSubtitle}>Remember F.A.S.T. - Face, Arms, Speech, Time</Text>

          <View style={styles.symptomsGrid}>
            <SymptomCard
              icon="balance-scale"
              title="Loss of Balance"
              description="Sudden dizziness, loss of coordination, or trouble walking."
              onPress={() => navigation.navigate('BrainSymptoms')}
            />

            <SymptomCard
              icon="eye"
              title="Vision Problems"
              description="Sudden vision changes, blurred or double vision."
              severity="warning"
              onPress={() => navigation.navigate('BrainSymptoms')}
            />

            <SymptomCard
              icon="battery-quarter"
              title="Extreme Fatigue"
              description="Unusual tiredness and lack of energy."
              onPress={() => navigation.navigate('BrainSymptoms')}
            />

            <SymptomCard
              icon="comments"
              title="Speech Problems"
              description="Slurred speech or difficulty speaking clearly."
              severity="critical"
              onPress={() => navigation.navigate('BrainSymptoms')}
            />

            <SymptomCard
              icon="head-side-virus"
              title="Severe Headache"
              description="Sudden, severe headache with no known cause."
              severity="critical"
              onPress={() => navigation.navigate('BrainSymptoms')}
            />

            <SymptomCard
              icon="question-circle"
              title="Confusion"
              description="Difficulty understanding or lack of concentration."
              severity="warning"
              onPress={() => navigation.navigate('BrainSymptoms')}
            />
          </View>

          <Button
            title="Learn More About Symptoms"
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
              <Ionicons name="fitness" size={20} color={colors.success} />
              <Text style={styles.tipText}>Exercise regularly - 30 minutes daily</Text>
            </View>
            <View style={styles.healthTip}>
              <Ionicons name="nutrition" size={20} color={colors.success} />
              <Text style={styles.tipText}>Eat a healthy, balanced diet</Text>
            </View>
            <View style={styles.healthTip}>
              <Ionicons name="pulse" size={20} color={colors.warning} />
              <Text style={styles.tipText}>Monitor blood pressure regularly</Text>
            </View>
            <View style={styles.healthTip}>
              <Ionicons name="ban" size={20} color={colors.error} />
              <Text style={styles.tipText}>Avoid smoking and excessive alcohol</Text>
            </View>
            <View style={styles.healthTip}>
              <Ionicons name="medical" size={20} color={colors.primary} />
              <Text style={styles.tipText}>Take medications as prescribed</Text>
            </View>
            <View style={styles.healthTip}>
              <Ionicons name="moon" size={20} color={colors.secondary} />
              <Text style={styles.tipText}>Get adequate sleep (7-9 hours)</Text>
            </View>
          </View>
        </View>

        {/* Community Section */}
        <View style={styles.communitySection}>
          <Text style={styles.sectionTitle}>Join Our Community</Text>
          <Text style={styles.sectionSubtitle}>Connect with others on their health journey</Text>

          <View style={styles.communityCard}>
            <Ionicons name="people" size={48} color={colors.primary} style={styles.communityIcon} />
            <Text style={styles.communityTitle}>WhatsApp Support Group</Text>
            <Text style={styles.communityText}>
              Get daily health tips, share experiences, and stay motivated with our community.
            </Text>
            <Button
              title="Join Community"
              onPress={() => {}}
              style={styles.joinButton}
            />
          </View>
        </View>

        {/* Brand Ambassadors */}
        <View style={styles.ambassadorSection}>
          <Text style={styles.sectionTitle}>Our Health Advocates</Text>

          <AmbassadorCard
            name="Shankar Mahadevan"
            role="Music Composer & Health Advocate"
            image={require('../../assets/shankar.jpg')}
            quote="Health is the real wealth. Early detection and prevention can save lives."
            onPress={() => {
              Alert.alert(
                'Shankar Mahadevan',
                'Learn more about our brand ambassador\'s health advocacy work.',
                [{ text: 'OK' }]
              );
            }}
          />

          <AmbassadorCard
            name="Supriya Vinod"
            role="Actress & Wellness Ambassador"
            image={require('../../assets/supriya.jpg')}
            quote="Taking care of your health should be your top priority. Stay informed, stay healthy."
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
          <Text style={styles.sectionSubtitle}>Help us improve our health services</Text>

          <View style={styles.feedbackForm}>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="First Name *"
                  value={feedbackForm.firstName}
                  onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, firstName: text }))}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Last Name"
                  value={feedbackForm.lastName}
                  onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, lastName: text }))}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={16} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address *"
                value={feedbackForm.email}
                onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="call" size={16} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={feedbackForm.phone}
                onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Your feedback *"
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
                  <TouchableOpacity key={star} onPress={() => handleRating(star)}>
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
              onPress={handleFeedbackSubmit}
              style={styles.submitButton}
            />
          </View>
        </View>

        {/* Enhanced Testimonials */}
        <View style={styles.testimonialSection}>
          <Text style={styles.sectionTitle}>Success Stories</Text>
          <Text style={styles.sectionSubtitle}>Real people, real results</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialScroll}>
            <TestimonialCard
              quote="The app helped me recognize stroke symptoms early. Quick action saved my life!"
              author="Rajesh K."
              role="Stroke Survivor"
              onPress={() => Alert.alert('Success Story', 'Read more about how early detection helped save a life.')}
            />

            <TestimonialCard
              quote="Regular health checkups and lifestyle changes made all the difference."
              author="Priya S."
              role="Health Enthusiast"
              onPress={() => Alert.alert('Health Journey', 'Learn about lifestyle changes that prevent strokes.')}
            />

            <TestimonialCard
              quote="The emergency feature helped us get immediate medical assistance."
              author="Dr. Amit P."
              role="Emergency Physician"
              onPress={() => Alert.alert('Emergency Response', 'Discover how quick action saves lives.')}
            />
          </ScrollView>
        </View>

        {/* Bottom spacing for floating button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Enhanced Emergency Button with location awareness */}
      <TouchableOpacity style={styles.emergencyButton} onPress={openEmergencyCall}>
        <Ionicons name="call" size={24} color={colors.white} />
        <Text style={styles.emergencyButtonText}>
          {nearestHospital ? 
            `Call ${nearestHospital.name.length > 15 ? 'Emergency' : nearestHospital.name}` : 
            'Emergency'
          }
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },

  // Hero Section
  bgImage: { height: 280, justifyContent: 'center' },
  contentOverlay: {
    backgroundColor: colors.overlay,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  heroIcon: { marginBottom: 16 },
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
  heroButton: { minWidth: 200 },

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
  infoContent: { flex: 1, marginLeft: 16 },
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
  outlineButtonText: { color: colors.white },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  phoneButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  hospitalActions: { flexDirection: 'row', marginTop: 8 },

  // Announcements Section
  announcementsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: colors.background,
  },
  announcementCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  announcementMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: colors.textMuted,
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
  symptomsSection: { paddingHorizontal: 20, paddingVertical: 32 },
  symptomsGrid: { marginBottom: 16 },
  learnMoreButton: { alignSelf: 'center', minWidth: 200 },

  // Health Section
  healthSection: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  healthTips: { marginTop: 8 },
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
  communityIcon: { marginBottom: 16 },
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
  joinButton: { minWidth: 160 },

  // Ambassador Section
  ambassadorSection: { paddingHorizontal: 20, paddingVertical: 32 },

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
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  inputContainer: { position: 'relative', marginBottom: 16, flex: 1 },
  inputIcon: { position: 'absolute', left: 12, top: 14, zIndex: 1 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingLeft: 44,
    fontSize: 16,
    color: colors.textPrimary,
  },
  halfInput: { flex: 1 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
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
  stars: { flexDirection: 'row', gap: 4 },
  submitButton: { alignSelf: 'center', minWidth: 160 },

  // Testimonial Section
  testimonialSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: colors.background,
  },
  testimonialScroll: { marginTop: 8 },

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
  bottomSpacer: { height: 100 },
});
