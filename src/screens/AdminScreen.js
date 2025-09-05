import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { auth } from '../firebase/config';
import { ADMIN_EMAIL } from '../config/constants';
import AdminService from '../services/AdminService';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

const colors = {
  primary: '#2563eb',
  secondary: '#10b981',
  background: '#f8fafc',
  card: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#10b981',
  shadow: '#000000',
  accent: '#f59e0b',
};

const formatDateForDisplay = (date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const CustomDatePicker = ({ visible, onClose, onSelectDate, initialDate }) => {
  const [tempDate, setTempDate] = useState(initialDate || new Date());

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear + i);
  const daysInMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);

  const handleConfirm = () => {
    onSelectDate(tempDate);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerModal}>
          <Text style={styles.datePickerTitle}>Select Camp Date</Text>
          
          <View style={styles.selectedDateDisplay}>
            <Text style={styles.selectedDateText}>
              {formatDateForDisplay(tempDate)}
            </Text>
          </View>

          <View style={styles.datePickerRow}>
            <View style={styles.datePickerColumn}>
              <Text style={styles.datePickerLabel}>Month</Text>
              <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.datePickerItem,
                      tempDate.getMonth() === index && styles.selectedDateItem
                    ]}
                    onPress={() => {
                      const newMonthDays = new Date(tempDate.getFullYear(), index + 1, 0).getDate();
                      const adjustedDay = Math.min(tempDate.getDate(), newMonthDays);
                      setTempDate(new Date(tempDate.getFullYear(), index, adjustedDay));
                    }}
                  >
                    <Text style={[
                      styles.datePickerItemText,
                      tempDate.getMonth() === index && styles.selectedDateItemText
                    ]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.datePickerColumn}>
              <Text style={styles.datePickerLabel}>Day</Text>
              <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.datePickerItem,
                      tempDate.getDate() === day && styles.selectedDateItem
                    ]}
                    onPress={() => setTempDate(new Date(tempDate.getFullYear(), tempDate.getMonth(), day))}
                  >
                    <Text style={[
                      styles.datePickerItemText,
                      tempDate.getDate() === day && styles.selectedDateItemText
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.datePickerColumn}>
              <Text style={styles.datePickerLabel}>Year</Text>
              <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.datePickerItem,
                      tempDate.getFullYear() === year && styles.selectedDateItem
                    ]}
                    onPress={() => setTempDate(new Date(year, tempDate.getMonth(), tempDate.getDate()))}
                  >
                    <Text style={[
                      styles.datePickerItemText,
                      tempDate.getFullYear() === year && styles.selectedDateItemText
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.datePickerButtons}>
            <TouchableOpacity style={styles.datePickerButton} onPress={onClose}>
              <Text style={styles.datePickerButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.datePickerButton, styles.confirmButton]} 
              onPress={handleConfirm}
            >
              <Text style={[styles.datePickerButtonText, styles.confirmButtonText]}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function AdminScreen({ navigation }) {
  const [loading, setLoading] = useState(true);

  // Section collapse state
  const [expandedSections, setExpandedSections] = useState({
    camps: false,
    hospitals: false,
    announcements: false,
  });

  // ✅ UPDATED: Health Camps state (now multiple camps)
  const [healthCamps, setHealthCamps] = useState([]);
  const [editingCampId, setEditingCampId] = useState(null);
  const [campForm, setCampForm] = useState({
    title: '',
    location: '',
    description: '',
  });
  const [campDate, setCampDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Hospitals state
  const [hospitals, setHospitals] = useState([]);
  const [editingHospitalId, setEditingHospitalId] = useState(null);
  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [locationLoading, setLocationLoading] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert('Not Authenticated', 'Please log in again.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]);
          return;
        }

        const userEmail = currentUser.email?.toLowerCase();
        const adminEmail = ADMIN_EMAIL.toLowerCase();
        
        console.log('🔍 Verifying admin access:', { userEmail, adminEmail });
        
        if (userEmail !== adminEmail) {
          Alert.alert('Access Denied', 'Admin access required.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]);
          return;
        }

        await AsyncStorage.setItem('adminVerified', 'true');
        console.log('✅ Admin access verified');
        loadData();
      } catch (error) {
        console.error('Admin verification error:', error);
        Alert.alert('Verification Error', 'Please try logging in again.');
      }
    };

    verifyAdminAccess();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // ✅ Load all data types
      const [camps, hosp, ann] = await Promise.all([
        AdminService.listHealthCamps(),
        AdminService.listHospitals(),
        AdminService.listAnnouncements()
      ]);
      
      setHealthCamps(camps);
      setHospitals(hosp);
      setAnnouncements(ann);
      
    } catch (e) {
      console.error('Admin load error:', e);
      Alert.alert('Error', 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ✅ UPDATED: Health Camp functions
  const resetCampForm = () => {
    console.log('🔄 Resetting camp form...');
    setEditingCampId(null);
    setCampForm({
      title: '',
      location: '',
      description: '',
    });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCampDate(tomorrow);
    console.log('✅ Camp form reset complete');
  };

  const handleSaveCamp = async () => {
    if (!campForm.title || !campForm.location) {
      Alert.alert('Validation', 'Title and location are required.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (campDate < today) {
      Alert.alert('Invalid Date', 'Camp date cannot be in the past.');
      return;
    }

    try {
      const campData = {
        title: campForm.title,
        date: campDate.toISOString(),
        location: campForm.location,
        description: campForm.description,
      };

      if (editingCampId) {
        await AdminService.updateHealthCamp(editingCampId, campData);
        Alert.alert('Success', 'Health camp updated successfully!');
      } else {
        await AdminService.addHealthCamp(campData);
        Alert.alert('Success', 'Health camp added successfully!');
      }

      resetCampForm();
      await loadData();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save camp.');
    }
  };

  const handleEditCamp = (camp) => {
    setEditingCampId(camp.id);
    setCampForm({
      title: camp.title || '',
      location: camp.location || '',
      description: camp.description || '',
    });
    setCampDate(camp.date ? new Date(camp.date) : new Date());
    setExpandedSections(prev => ({ ...prev, camps: true }));
  };

  const handleDeleteCamp = (id) => {
    Alert.alert('Delete Health Camp', 'Are you sure you want to delete this health camp?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AdminService.deleteHealthCamp(id);
            await loadData();
            Alert.alert('Success', 'Health camp deleted successfully!');
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to delete health camp.');
          }
        }
      }
    ]);
  };

  // Hospital functions
  const resetHospitalForm = () => {
    setEditingHospitalId(null);
    setHospitalForm({ name: '', phone: '', address: '', latitude: '', longitude: '' });
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to get current location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      setHospitalForm(prev => ({
        ...prev,
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
      }));
      
      Alert.alert('Success', 'Current location captured successfully!');
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get current location. Please enter coordinates manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const validateCoordinates = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) return false;
    if (latitude < -90 || latitude > 90) return false;
    if (longitude < -180 || longitude > 180) return false;
    
    return true;
  };

  const handleSaveHospital = async () => {
    const { name, phone, address, latitude, longitude } = hospitalForm;
    
    if (!name || !phone || !address || !latitude || !longitude) {
      Alert.alert('Validation', 'All hospital fields are required.');
      return;
    }

    if (!validateCoordinates(latitude, longitude)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude (-90 to 90) and longitude (-180 to 180) values.');
      return;
    }

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }

    try {
      const hospitalData = {
        name,
        phone,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      };

      if (editingHospitalId) {
        await AdminService.updateHospital(editingHospitalId, hospitalData);
        Alert.alert('Success', 'Hospital updated successfully!');
      } else {
        await AdminService.addHospital(hospitalData);
        Alert.alert('Success', 'Hospital added successfully!');
      }

      resetHospitalForm();
      await loadData();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save hospital.');
    }
  };

  const handleEditHospital = (hospital) => {
    setEditingHospitalId(hospital.id);
    setHospitalForm({
      name: hospital.name || '',
      phone: hospital.phone || '',
      address: hospital.address || '',
      latitude: String(hospital.location?.latitude ?? ''),
      longitude: String(hospital.location?.longitude ?? ''),
    });
    setExpandedSections(prev => ({ ...prev, hospitals: true }));
  };

  const handleDeleteHospital = (id) => {
    Alert.alert('Delete Hospital', 'Are you sure you want to delete this hospital?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AdminService.deleteHospital(id);
            await loadData();
            Alert.alert('Success', 'Hospital deleted successfully!');
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to delete hospital.');
          }
        }
      }
    ]);
  };

  // Announcement functions
  const resetAnnouncementForm = () => {
    setAnnTitle('');
    setAnnMessage('');
  };

  const handleSendAnnouncement = async () => {
    if (!annTitle || !annMessage) {
      Alert.alert('Validation', 'Title and message are required.');
      return;
    }

    try {
      await AdminService.addAnnouncement({
        title: annTitle,
        message: annMessage,
        audience: 'all'
      });

      await loadData();
      Alert.alert('Success', 'Announcement sent to all users!');
      resetAnnouncementForm();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to send announcement.');
    }
  };

  const handleDeleteAnnouncement = (id) => {
    Alert.alert('Delete Announcement', 'Are you sure you want to delete this announcement?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AdminService.deleteAnnouncement(id);
            await loadData();
            Alert.alert('Success', 'Announcement deleted successfully!');
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to delete announcement.');
          }
        }
      }
    ]);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', onPress: () => navigation.navigate('Login') }
    ]);
  };

  const SectionHeader = ({ title, section, icon }) => (
    <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(section)}>
      <Text style={styles.sectionTitle}>
        {icon} {title}
      </Text>
      <Ionicons 
        name={expandedSections[section] ? "chevron-up" : "chevron-down"} 
        size={20} 
        color={colors.textPrimary} 
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.center, { flex: 1 }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Loading admin panel...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ✅ SIMPLIFIED: Health Camps Management - No Status */}
        <SectionHeader title="Health Camps Management" section="camps" icon="🏥" />
        {expandedSections.camps && (
          <>
            {/* Add/Edit Camp Form */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {editingCampId ? '✏️ Edit Health Camp' : '➕ Add New Health Camp'}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Camp Title *"
                value={campForm.title}
                onChangeText={(v) => setCampForm(prev => ({ ...prev, title: v }))}
              />
              
              <TouchableOpacity 
                style={styles.datePickerTrigger} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateInputText}>
                  📅 {formatDateForDisplay(campDate)}
                </Text>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </TouchableOpacity>
              
              <TextInput
                style={styles.input}
                placeholder="Location *"
                value={campForm.location}
                onChangeText={(v) => setCampForm(prev => ({ ...prev, location: v }))}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={campForm.description}
                onChangeText={(v) => setCampForm(prev => ({ ...prev, description: v }))}
                multiline
                numberOfLines={3}
              />
              
              <View style={styles.row}>
                <Button
                  title={editingCampId ? 'Update Camp' : 'Add Camp'}
                  onPress={handleSaveCamp}
                  style={{ flex: 1 }}
                />
                {editingCampId && (
                  <Button
                    title="Cancel"
                    onPress={resetCampForm}
                    style={[styles.cancelBtn, { flex: 1, marginLeft: 8 }]}
                    textStyle={{ color: colors.textPrimary }}
                  />
                )}
              </View>
            </View>
              
            {/* Health Camps List */}
            {healthCamps.map(camp => (
              <View key={camp.id} style={styles.campItem}>
                <View style={styles.campInfo}>
                  <Text style={styles.campTitle}>{camp.title}</Text>
                  <Text style={styles.campDetail}>
                    📅 {camp.date ? new Date(camp.date).toLocaleDateString() : 'No date'}
                  </Text>
                  <Text style={styles.campDetail}>📍 {camp.location}</Text>
                  {camp.description && (
                    <Text style={styles.campDetail}>📝 {camp.description}</Text>
                  )}
                </View>
                <View style={styles.campActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#EEF2FF' }]}
                    onPress={() => handleEditCamp(camp)}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => handleDeleteCamp(camp.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}


        {/* Hospital Management */}
        <SectionHeader title="Emergency Hospitals" section="hospitals" icon="🚑" />
        {expandedSections.hospitals && (
          <>
            {/* Add/Edit Hospital Form */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {editingHospitalId ? '✏️ Edit Hospital' : '➕ Add New Hospital'}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Hospital Name *"
                value={hospitalForm.name}
                onChangeText={(v) => setHospitalForm(prev => ({ ...prev, name: v }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number *"
                value={hospitalForm.phone}
                onChangeText={(v) => setHospitalForm(prev => ({ ...prev, phone: v }))}
                keyboardType="phone-pad"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Address *"
                value={hospitalForm.address}
                onChangeText={(v) => setHospitalForm(prev => ({ ...prev, address: v }))}
                multiline
              />
              
              <View style={styles.locationSection}>
                <Text style={styles.locationTitle}>📍 Location Coordinates</Text>
                <TouchableOpacity 
                  style={styles.locationBtn} 
                  onPress={getCurrentLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons name="location" size={20} color={colors.primary} />
                  )}
                  <Text style={styles.locationBtnText}>
                    {locationLoading ? 'Getting Location...' : 'Use Current Location'}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Latitude *"
                    value={hospitalForm.latitude}
                    onChangeText={(v) => setHospitalForm(prev => ({ ...prev, latitude: v }))}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Longitude *"
                    value={hospitalForm.longitude}
                    onChangeText={(v) => setHospitalForm(prev => ({ ...prev, longitude: v }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.row}>
                <Button
                  title={editingHospitalId ? 'Update Hospital' : 'Add Hospital'}
                  onPress={handleSaveHospital}
                  style={{ flex: 1 }}
                />
                {editingHospitalId && (
                  <Button
                    title="Cancel"
                    onPress={resetHospitalForm}
                    style={[styles.cancelBtn, { flex: 1, marginLeft: 8 }]}
                    textStyle={{ color: colors.textPrimary }}
                  />
                )}
              </View>
            </View>

            {/* Hospitals List */}
            {hospitals.map(hospital => (
              <View key={hospital.id} style={styles.hospitalItem}>
                <View style={styles.hospitalInfo}>
                  <Text style={styles.hospitalName}>{hospital.name}</Text>
                  <Text style={styles.hospitalDetail}>📞 {hospital.phone}</Text>
                  <Text style={styles.hospitalDetail}>📍 {hospital.address}</Text>
                  {hospital.location && (
                    <Text style={styles.hospitalDetail}>
                      🌐 {hospital.location.latitude.toFixed(4)}, {hospital.location.longitude.toFixed(4)}
                    </Text>
                  )}
                </View>
                <View style={styles.hospitalActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#EEF2FF' }]}
                    onPress={() => handleEditHospital(hospital)}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => handleDeleteHospital(hospital.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ✅ UPDATED: Announcements Management */}
        <SectionHeader title="Announcements Management" section="announcements" icon="📢" />
        {expandedSections.announcements && (
          <View style={styles.card}>
            {/* Send New Announcement */}
            <Text style={styles.cardTitle}>➕ Send New Announcement</Text>
            <TextInput
              style={styles.input}
              placeholder="Announcement Title *"
              value={annTitle}
              onChangeText={setAnnTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Message for all users *"
              value={annMessage}
              onChangeText={setAnnMessage}
              multiline
              numberOfLines={4}
            />
            <Button title="Send to All Users" onPress={handleSendAnnouncement} />

            {/* Announcements List */}
            {announcements.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.cardTitle}>📝 All Announcements</Text>
                {announcements.map(ann => (
                  <View key={ann.id} style={styles.announcementItem}>
                    <View style={styles.announcementContent}>
                      <Text style={styles.annTitle}>{ann.title}</Text>
                      <Text style={styles.annMessage}>{ann.message}</Text>
                      <Text style={styles.annDate}>
                        {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : 'Recent'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                      onPress={() => handleDeleteAnnouncement(ann.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Custom Date Picker Modal */}
      <CustomDatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={(date) => setCampDate(date)}
        initialDate={campDate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: colors.background },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  signOutBtn: {
    padding: 8,
  },
  
  scroll: { padding: 16 },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  
  // Status selector styles
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statusButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  statusButtonTextSelected: {
    color: colors.card,
    fontWeight: '600',
  },
  
  // Fixed date picker styles
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  dateInputText: {
    fontSize: 26,
    color: colors.textPrimary,
  },
  
  locationSection: {
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  locationBtnText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  cancelBtn: {
    backgroundColor: '#e5e7eb',
  },
  
  // Health Camp Item styles
  campItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  campInfo: {
    flex: 1,
  },
  campTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  campDetail: {
    fontSize: 24,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  campActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 22,
    fontWeight: '600',
  },
  
  hospitalItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  hospitalDetail: {
    fontSize: 24,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  hospitalActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
  },
  
  announcementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  announcementContent: {
    flex: 1,
  },
  annTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  annMessage: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  annDate: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  
  // Custom Date Picker Styles (keeping existing ones)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  datePickerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  selectedDateDisplay: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  datePickerColumn: {
    flex: 1,
  },
  datePickerLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  datePickerScroll: {
    height: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  datePickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  selectedDateItem: {
    backgroundColor: colors.primary,
  },
  datePickerItemText: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  selectedDateItemText: {
    color: '#fff',
    fontWeight: '600',
  },
  datePickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  datePickerButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  confirmButtonText: {
    color: '#fff',
  },
});
