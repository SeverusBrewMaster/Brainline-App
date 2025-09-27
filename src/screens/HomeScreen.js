import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Dimensions,
  StatusBar, ActivityIndicator, RefreshControl, Alert, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';

import Header from '../components/Header';
import Button from '../components/Button';
import SymptomCard from '../components/SymptomCard';
import AmbassadorCard from '../components/AmbassadorCard';
import TestimonialCard from '../components/TestimonialCard';

import { auth } from '../firebase/config';
import {
  getNextCamp, getHospitals, getAnnouncements, getUserProfile, getHealthCamps
} from '../services/AppDataService';

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
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) *
    Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
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
    const displayName = profile?.profile.name || user?.displayName || user?.email || t('user');
    return String(displayName).split(' ')[0];
  }, [profile, user, t]);

  // Update loadCore function
  const loadCore = useCallback(async () => {
    try {
      setLoadingBoot(true);
      const uid = auth.currentUser?.uid;
      const [camp, camps, hosp, anns, prof] = await Promise.all([
        getNextCamp(),
        getHealthCamps(5),
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
      Alert.alert(t('error'), t('failed_to_load_home_data'));
    } finally {
      setLoadingBoot(false);
    }
  }, [t]);

  const fetchLocation = useCallback(async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('location_permission'), t('please_enable_location'));
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserCoords(location.coords);
    } catch (e) {
      console.error('Location error:', e);
      Alert.alert(t('location_error'), t('unable_to_get_location'));
    } finally {
      setLocationLoading(false);
    }
  }, [t]);

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

    setNearestHospital(hospitalsWithDistance.length > 0 ? hospitalsWithDistance[0] : null);
  }, [userCoords, hospitals]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCore(), fetchLocation()]);
    setRefreshing(false);
  };

  const openEmergencyCall = () => {
    if (nearestHospital && nearestHospital.name) {
      const distance = nearestHospital.distance ? t('distance_away', { distance: nearestHospital.distance.toFixed(1) }) : t('distance_unknown');
      Alert.alert(
        t('emergency_call'),
        t('nearest_hospital_info', {
          name: nearestHospital.name,
          distance: distance,
          address: nearestHospital.address || t('address_not_available'),
          phone: nearestHospital.phone || t('phone_not_available')
        }),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('call_now'),
            style: 'destructive',
            onPress: () => {
              if (nearestHospital.phone) {
                Linking.openURL(`tel:${nearestHospital.phone}`);
              } else {
                Alert.alert(t('no_phone'), t('phone_not_available_hospital'));
              }
            },
          },
          {
            text: t('get_directions'),
            onPress: () => openMapDirections(),
          }
        ]
      );
    } else {
      Alert.alert(t('emergency_services'), t('choose_emergency_service'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('ambulance_108'), onPress: () => Linking.openURL('tel:108') },
        { text: t('police_100'), onPress: () => Linking.openURL('tel:100') },
        { text: t('fire_101'), onPress: () => Linking.openURL('tel:101') },
      ]);
    }
  };

  const openMapDirections = () => {
    if (nearestHospital?.location?.latitude && nearestHospital?.location?.longitude && userCoords) {
      const url = `https://www.google.com/maps/dir/${userCoords.latitude},${userCoords.longitude}/${nearestHospital.location.latitude},${nearestHospital.location.longitude}`;
      Linking.openURL(url).catch(() => {
        Alert.alert(t('error'), t('unable_to_open_maps'));
      });
    } else {
      Alert.alert(t('navigation_error'), t('unable_to_get_directions'));
    }
  };

  const showNearbyHospitals = () => {
    if (!userCoords) {
      Alert.alert(t('location_required'), t('please_enable_location_hospitals'));
      return;
    }

    if (hospitals.length === 0) {
      Alert.alert(t('no_hospitals'), t('no_hospital_data_available'));
      return;
    }

    const hospitalsWithDistance = hospitals
      .filter(h => h.location?.latitude && h.location?.longitude)
      .map(hospital => ({
        ...hospital,
        distance: haversineDistance(
          { latitude: userCoords.latitude, longitude: userCoords.longitude },
          { latitude: hospital.location.latitude, longitude: hospital.location.longitude }
        )
      }))
      .sort((a, b) => a.distance - b.distance);

    if (hospitalsWithDistance.length === 0) {
      Alert.alert(t('no_hospitals'), t('no_hospitals_valid_location'));
      return;
    }

    const hospitalList = hospitalsWithDistance.slice(0, 5).map(hospital =>
      `${hospital.name}\n📍 ${hospital.distance.toFixed(1)} km ${t('away')}\n📞 ${hospital.phone || t('no_phone_available')}`
    ).join('\n\n');

    Alert.alert(t('nearby_hospitals'), hospitalList, [
      { text: t('ok') },
      {
        text: t('call_nearest'),
        onPress: () => {
          const nearest = hospitalsWithDistance[0];
          if (nearest?.phone) {
            Linking.openURL(`tel:${nearest.phone}`);
          } else {
            Alert.alert(t('no_phone'), t('phone_not_available_nearest'));
          }
        }
      }
    ]);
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackForm.firstName || !feedbackForm.email || !feedbackForm.feedback) {
      Alert.alert(t('incomplete_form'), t('please_fill_required_fields'));
      return;
    }

    Alert.alert(t('thank_you'), t('feedback_submitted_successfully'), [
      {
        text: t('ok'), onPress: () => {
          setFeedbackForm({
            firstName: '', lastName: '', email: '', phone: '', feedback: '', rating: 0
          });
        }
      }
    ]);
  };

  const handleRating = (rating) => {
    setFeedbackForm(prev => ({ ...prev, rating }));
  };

  if (loadingBoot) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('loading_dashboard')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <Header />
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{t('hi_greet', { name: greetName })}</Text>
          <Text style={styles.heroSubtitle}>{t('early_detection_saves')}</Text>
          <Button title={t('start_health_check')} onPress={() => navigation.navigate('User')} style={styles.heroButton} />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Riskometer')}>
            <Ionicons name="ios-heart" size={24} color={colors.primary} />
            <Text style={styles.actionTitle}>{t('risk_assessment')}</Text>
            <Text style={styles.actionText}>{t('check_your_stroke_risk')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('BrainSymptoms')}>
            <AntDesign name="warning" size={24} color={colors.warning} />
            <Text style={styles.actionTitle}>{t('symptoms_check')}</Text>
            <Text style={styles.actionText}>{t('identify_warning_signs')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={openEmergencyCall}>
            <Ionicons name="alert-circle" size={24} color={colors.emergency} />
            <Text style={styles.actionTitle}>{t('emergency')}</Text>
            <Text style={styles.actionText}>{t('quick_contact')}</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Resources Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{t('other_resources')}</Text>

          {/* All Health Camps Section */}
          {healthCamps.length > 0 && (
            <View style={styles.infoCard}>
              <Ionicons name="medical" size={24} color={colors.white} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{t('upcoming_health_camps')}</Text>
                <Text style={styles.infoText}>{t('join_free_health_screening')}</Text>
                {healthCamps.map((camp, index) => (
                  <View key={index} style={{ marginTop: 12 }}>
                    <Text style={styles.infoTitle}>{camp.title}</Text>
                    <Text style={styles.infoText}>
                      📅 {camp.date ? new Date(camp.date).toLocaleDateString() : t('date_tba')}
                      {'\n'}📍 {camp.location || t('location_tba')}
                    </Text>
                    {camp.description && (
                      <Text style={styles.infoText}>📝 {camp.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Location-based nearest hospital card */}
          {nearestHospital && (
            <View style={styles.infoCard}>
              <Ionicons name="location" size={24} color={colors.white} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{t('nearest_hospital')}</Text>
                <Text style={styles.infoText}>
                  {nearestHospital.name}
                  {nearestHospital.distance && ` - ${nearestHospital.distance.toFixed(1)} ${t('km_away')}`}
                </Text>
                <View style={styles.hospitalActions}>
                  <TouchableOpacity
                    style={styles.phoneButton}
                    onPress={() => {
                      if (nearestHospital.phone) {
                        Linking.openURL(`tel:${nearestHospital.phone}`);
                      } else {
                        Alert.alert(t('no_phone'), t('phone_not_available'));
                      }
                    }}
                  >
                    <Ionicons name="call" size={16} color={colors.primary} />
                    <Text style={styles.phoneButtonText}>{nearestHospital.phone || t('no_phone_available')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.phoneButton} onPress={openMapDirections}>
                    <Text style={styles.phoneButtonText}>{t('directions')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Loading and error states for location */}
          {locationLoading && (
            <View style={styles.infoCard}>
              <ActivityIndicator size={24} color={colors.white} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{t('finding_nearest_hospital')}</Text>
                <Text style={styles.infoText}>{t('getting_location_emergency')}</Text>
              </View>
            </View>
          )}

          {/* Show message when no location permission or no hospitals */}
          {!locationLoading && !nearestHospital && !userCoords && (
            <View style={styles.infoCard}>
              <Ionicons name="location-outline" size={24} color={colors.white} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{t('enable_location')}</Text>
                <Text style={styles.infoText}>{t('allow_location_access')}</Text>
                <Button title={t('enable_location')} onPress={fetchLocation} style={styles.infoButton} />
              </View>
            </View>
          )}

          {!locationLoading && !nearestHospital && userCoords && hospitals.length === 0 && (
            <View style={styles.infoCard}>
              <Ionicons name="warning" size={24} color={colors.white} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{t('no_hospitals_found')}</Text>
                <Text style={styles.infoText}>{t('no_hospital_data_contact_emergency')}</Text>
                <TouchableOpacity
                  style={styles.phoneButton}
                  onPress={() => Linking.openURL('tel:108')}
                >
                  <Text style={styles.phoneButtonText}>{t('call_108_ambulance')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Admin-configured health camp */}
          {nextCamp && (
            <View style={styles.infoCard}>
              <Ionicons name="calendar" size={24} color={colors.white} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{nextCamp.title || t('next_health_camp')}</Text>
                <Text style={styles.infoText}>
                  {nextCamp.description || t('join_free_health_screening')}{'\n'}
                  📅 {nextCamp.date || t('date_tba')} • 📍 {nextCamp.location || t('location_tba')}
                </Text>
              </View>
            </View>
          )}

          {/* 24/7 Emergency helpline */}
          <View style={styles.infoCard}>
            <Ionicons name="call" size={24} color={colors.white} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{t('emergency_helpline_24_7')}</Text>
              <Text style={styles.infoText}>{t('immediate_medical_assistance')}</Text>
              <TouchableOpacity
                style={styles.phoneButton}
                onPress={() => Linking.openURL('tel:+911234567890')}
              >
                <Text style={styles.phoneButtonText}>+91 123 456 7890</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hospital finder */}
          <View style={styles.infoCard}>
            <Ionicons name="search" size={24} color={colors.white} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{t('find_nearby_hospitals')}</Text>
              <Text style={styles.infoText}>
                {userCoords
                  ? t('found_hospitals_in_area', { count: hospitals.length })
                  : t('enable_location_stroke_hospitals')
                }
              </Text>
              <Button title={t('view_hospitals')} onPress={showNearbyHospitals} style={styles.infoButton} />
            </View>
          </View>
        </View>

        {/* Admin Announcements */}
        {announcements.length > 0 && (
          <View style={styles.announcementsSection}>
            <Text style={styles.sectionTitle}>{t('latest_announcements')}</Text>
            {announcements.map((announcement, index) => (
              <View key={index} style={styles.announcementCard}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementMessage}>{announcement.message}</Text>
                <Text style={styles.announcementDate}>
                  {announcement.createdAt?.toDate?.()?.toLocaleDateString() || t('recently_posted')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Symptoms Section */}
        <View style={styles.symptomsSection}>
          <Text style={styles.sectionTitle}>{t('warning_signs_stroke')}</Text>
          <Text style={styles.sectionSubtitle}>{t('remember_fast')}</Text>
          <View style={styles.symptomsGrid}>
            <SymptomCard
              icon="face-outline"
              title={t('face_drooping')}
              description={t('face_drooping_desc')}
              onPress={() => navigation.navigate('BrainSymptoms')}
            />
            <SymptomCard
              icon="hand-left-outline"
              title={t('arm_weakness')}
              description={t('arm_weakness_desc')}
              onPress={() => navigation.navigate('BrainSymptoms')}
            />
            <SymptomCard
              icon="chatbox-outline"
              title={t('speech_difficulty')}
              description={t('speech_difficulty_desc')}
              onPress={() => navigation.navigate('BrainSymptoms')}
            />
            <SymptomCard
              icon="time-outline"
              title={t('time_call')}
              description={t('time_call_desc')}
              onPress={() => navigation.navigate('BrainSymptoms')}
            />
            <SymptomCard
              icon="eye-outline"
              title={t('vision_loss')}
              description={t('vision_loss_desc')}
              onPress={() => navigation.navigate('BrainSymptoms')}
            />
            <SymptomCard
              icon="pulse-outline"
              title={t('sudden_headache')}
              description={t('sudden_headache_desc')}
              onPress={() => navigation.navigate('BrainSymptoms')}
            />
          </View>
          <Button
            title={t('learn_more_symptoms')}
            onPress={() => navigation.navigate('BrainSymptoms')}
            style={styles.learnMoreButton}
          />
        </View>

        {/* Brain Health Tips */}
        <View style={styles.healthSection}>
          <Text style={styles.sectionTitle}>{t('brain_health_tips')}</Text>
          <Text style={styles.sectionSubtitle}>{t('prevention_best_medicine')}</Text>
          <View style={styles.healthTips}>
            <View style={styles.healthTip}>
              <Ionicons name="fitness" size={20} color={colors.primary} />
              <Text style={styles.tipText}>{t('exercise_regularly')}</Text>
            </View>
            <View style={styles.healthTip}>
              <Ionicons name="restaurant" size={20} color={colors.primary} />
              <Text style={styles.tipText}>{t('eat_healthy_diet')}</Text>
            </View>
            <View style={styles.healthTip}>
              <Ionicons name="heart" size={20} color={colors.primary} />
              <Text style={styles.tipText}>{t('monitor_blood_pressure')}</Text>
            </View>
            <View style={styles.healthTip}>
              <Ionicons name="ban" size={20} color={colors.primary} />
              <Text style={styles.tipText}>{t('avoid_smoking_alcohol')}</Text>
            </View>
            <View style={styles.healthTip}>
              <Ionicons name="medical" size={20} color={colors.primary} />
              <Text style={styles.tipText}>{t('take_medications_prescribed')}</Text>
            </View>
            <View style={styles.healthTip}>
              <Ionicons name="bed" size={20} color={colors.primary} />
              <Text style={styles.tipText}>{t('get_adequate_sleep')}</Text>
            </View>
          </View>
        </View>

        {/* Community Section */}
        <View style={styles.communitySection}>
          <Text style={styles.sectionTitle}>{t('join_our_community')}</Text>
          <View style={styles.communityCard}>
            <Ionicons name="people" size={40} color={colors.primary} style={styles.communityIcon} />
            <Text style={styles.communityTitle}>{t('whatsapp_support_group')}</Text>
            <Text style={styles.communityText}>{t('get_daily_health_tips')}</Text>
            <Button
              title={t('join_community')}
              onPress={() => Linking.openURL('https://wa.me/your-whatsapp-group-link')}
              style={styles.joinButton}
            />
          </View>
        </View>

        {/* Brand Ambassadors */}
        <View style={styles.ambassadorSection}>
          <Text style={styles.sectionTitle}>{t('our_health_advocates')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <AmbassadorCard
              name="Shankar Mahadevan"
              image={require('../assets/shankar.jpg')}
              onPress={() => {
                Alert.alert(
                  'Shankar Mahadevan',
                  t('learn_more_ambassador_advocacy'),
                  [{ text: t('ok') }]
                );
              }}
            />
            <AmbassadorCard
              name="Supriya Vinod"
              image={require('../assets/supriya.jpg')}
              onPress={() => {
                Alert.alert(
                  'Supriya Vinod',
                  t('learn_more_ambassador_advocacy'),
                  [{ text: t('ok') }]
                );
              }}
            />
          </ScrollView>
        </View>

        {/* Feedback Form */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>{t('share_your_feedback')}</Text>
          <Text style={styles.sectionSubtitle}>{t('help_improve_health_services')}</Text>
          <View style={styles.feedbackForm}>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder={t('first_name')}
                  value={feedbackForm.firstName}
                  onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, firstName: text }))}
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder={t('last_name')}
                  value={feedbackForm.lastName}
                  onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, lastName: text }))}
                />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('email_address')}
                value={feedbackForm.email}
                onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('phone_number')}
                value={feedbackForm.phone}
                onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('your_feedback')}
                value={feedbackForm.feedback}
                onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, feedback: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>{t('rate_our_service')}:</Text>
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
            <Button title={t('submit_feedback')} onPress={handleFeedbackSubmit} style={styles.submitButton} />
          </View>
        </View>

        {/* Enhanced Testimonials */}
        <View style={styles.testimonialSection}>
          <Text style={styles.sectionTitle}>{t('success_stories')}</Text>
          <Text style={styles.sectionSubtitle}>{t('real_people_real_results')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialScroll}>
            <TestimonialCard
              name="Rajesh Kumar"
              story={t('testimonial_story_1')}
              onPress={() => Alert.alert(t('success_story'), t('testimonial_detail_1'))}
            />
            <TestimonialCard
              name="Priya Sharma"
              story={t('testimonial_story_2')}
              onPress={() => Alert.alert(t('health_journey'), t('testimonial_detail_2'))}
            />
            <TestimonialCard
              name="Dr. Amit Verma"
              story={t('testimonial_story_3')}
              onPress={() => Alert.alert(t('emergency_response'), t('testimonial_detail_3'))}
            />
          </ScrollView>
        </View>

        {/* Bottom spacing for floating button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Enhanced Emergency Button with location awareness */}
      <TouchableOpacity style={styles.emergencyButton} onPress={openEmergencyCall}>
        <Ionicons name="call" size={20} color={colors.white} />
        <Text style={styles.emergencyButtonText}>
          {nearestHospital ?
            t('call_hospital', { name: nearestHospital.name.length > 15 ? t('emergency') : nearestHospital.name }) :
            t('emergency')
          }
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: colors.background
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },

  // Hero Section
  heroSection: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
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
    marginRight: 8,
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
