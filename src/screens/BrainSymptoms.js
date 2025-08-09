import React from 'react';
<<<<<<< HEAD
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import your enhanced components
import Header from '../components/Header';
import SymptomCard from '../components/SymptomCard';
import Button from '../components/Button';

const BrainStrokeSymptoms = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const symptoms = [
    {
      icon: <MaterialIcons name="balance" size={32} color={colors.primary} />,
      title: "Loss of Balance",
      description: "Difficulty in coordination and frequent stumbling while walking or standing.",
      severity: "warning",
      fastSymbol: "B" // F.A.S.T. - Balance
    },
    {
      icon: <Ionicons name="eye-outline" size={32} color={colors.primary} />,
      title: "Vision Problems",
      description: "Sudden blurry vision or loss of sight in one or both eyes.",
      severity: "critical",
      fastSymbol: "F" // F.A.S.T. - Face (includes vision)
    },
    {
      icon: <MaterialIcons name="airline-seat-individual-suite" size={32} color={colors.primary} />,
      title: "Early Morning Dizziness",
      description: "Feeling lightheaded or faint right after waking up.",
      severity: "normal"
    },
    {
      icon: <Ionicons name="happy-outline" size={32} color={colors.primary} />,
      title: "Facial Weakness",
      description: "One side of the face drooping or difficulty in smiling.",
      severity: "critical",
      fastSymbol: "F" // F.A.S.T. - Face
    },
    {
      icon: <Ionicons name="battery-half-outline" size={32} color={colors.primary} />,
      title: "Extreme Fatigue",
      description: "Unusual tiredness and lack of energy throughout the day.",
      severity: "warning"
    },
    {
      icon: <Ionicons name="hand-left-outline" size={32} color={colors.primary} />,
      title: "Arm Weakness",
      description: "Difficulty in lifting or controlling one arm properly.",
      severity: "critical",
      fastSymbol: "A" // F.A.S.T. - Arms
    },
    {
      icon: <MaterialIcons name="record-voice-over" size={32} color={colors.primary} />,
      title: "Speech Disturbance",
      description: "Slurred speech or difficulty in forming words clearly.",
      severity: "critical",
      fastSymbol: "S" // F.A.S.T. - Speech
    },
    {
      icon: <MaterialIcons name="sentiment-very-dissatisfied" size={32} color={colors.primary} />,
      title: "Severe Headache",
      description: "Terrible headache with no known cause, often sudden and intense.",
      severity: "critical"
    },
    {
      icon: <MaterialIcons name="psychology-alt" size={32} color={colors.primary} />,
      title: "Lack of Concentration",
      description: "Difficulty focusing, confusion, or memory loss.",
      severity: "warning"
    },
  ];

  const handleSymptomPress = (symptom) => {
    Alert.alert(
      symptom.title,
      `${symptom.description}\n\n${
        symptom.severity === 'critical' 
          ? '🚨 This is a critical warning sign. Seek immediate medical attention if experiencing this symptom.' 
          : symptom.severity === 'warning'
          ? '⚠️ This symptom warrants medical consultation if persistent.'
          : 'ℹ️ Monitor this symptom and consult a healthcare provider if it worsens.'
      }`,
      [
        { text: 'OK', style: 'default' },
        { 
          text: 'Emergency Call', 
          style: 'destructive',
          onPress: () => Alert.alert(
            'Emergency Services',
            'Call 911 immediately?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Call 911', onPress: () => Linking.openURL('tel:911') }
            ]
          )
        }
      ]
    );
  };

  const handleEmergencyInfo = () => {
    Alert.alert(
      'F.A.S.T. Test',
      '🧠 Remember F.A.S.T. for stroke recognition:\n\n' +
      'F - Face drooping\n' +
      'A - Arm weakness\n' +
      'S - Speech difficulty\n' +
      'T - Time to call emergency services\n\n' +
      'If you notice any of these signs, call 911 immediately!',
      [{ text: 'Understood' }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <Header 
        navigation={navigation} 
        title="Symptoms" 
        currentScreen="BrainSymptoms" 
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Brain Stroke Warning Signs</Text>
          <Text style={styles.subtitle}>
            Recognize these symptoms early and act fast. Every minute matters.
          </Text>
          
          <TouchableOpacity 
            style={styles.fastCard}
            onPress={handleEmergencyInfo}
          >
            <Text style={styles.fastTitle}>F.A.S.T. Test</Text>
            <Text style={styles.fastDescription}>
              Learn the quick stroke recognition method
            </Text>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Critical Symptoms Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 Critical Warning Signs</Text>
          <Text style={styles.sectionSubtitle}>Seek immediate medical attention</Text>
          
          {symptoms.filter(s => s.severity === 'critical').map((symptom, index) => (
            <View key={`critical-${index}`} style={styles.symptomContainer}>
              {symptom.fastSymbol && (
                <View style={styles.fastBadge}>
                  <Text style={styles.fastBadgeText}>{symptom.fastSymbol}</Text>
                </View>
              )}
              <SymptomCard
                icon={symptom.icon}
                title={symptom.title}
                description={symptom.description}
                severity={symptom.severity}
                onPress={() => handleSymptomPress(symptom)}
                style={styles.symptomCard}
              />
            </View>
          ))}
        </View>
        
        {/* Warning Symptoms Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Warning Signs</Text>
          <Text style={styles.sectionSubtitle}>Monitor closely and consult doctor</Text>
          
          {symptoms.filter(s => s.severity === 'warning').map((symptom, index) => (
            <SymptomCard
              key={`warning-${index}`}
              icon={symptom.icon}
              title={symptom.title}
              description={symptom.description}
              severity={symptom.severity}
              onPress={() => handleSymptomPress(symptom)}
              style={styles.symptomCard}
            />
          ))}
        </View>
        
        {/* Additional Symptoms Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Additional Symptoms</Text>
          <Text style={styles.sectionSubtitle}>Be aware of these signs</Text>
          
          {symptoms.filter(s => s.severity === 'normal').map((symptom, index) => (
            <SymptomCard
              key={`normal-${index}`}
              icon={symptom.icon}
              title={symptom.title}
              description={symptom.description}
              severity={symptom.severity}
              onPress={() => handleSymptomPress(symptom)}
              style={styles.symptomCard}
            />
          ))}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title="Take Risk Assessment"
            variant="primary"
            size="large"
            icon={<MaterialIcons name="psychology" size={20} color={colors.white} />}
            onPress={() => navigation.navigate('StrokeRiskAssessment')}
            style={styles.actionButton}
          />
          
          <Button
            title="Emergency Contacts"
            variant="danger"
            size="large"
            icon={<Ionicons name="call" size={20} color={colors.white} />}
            onPress={() => navigation.navigate('EmergencyContact')}
            style={styles.actionButton}
          />
        </View>
        
        {/* Educational Note */}
        <View style={styles.noteSection}>
          <Ionicons name="medical-outline" size={24} color={colors.secondary} />
          <Text style={styles.noteText}>
            Remember: This information is for educational purposes only. 
            Always consult with healthcare professionals for medical advice.
          </Text>
        </View>
      </ScrollView>
    </View>
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
  warning: '#f59e0b',
  error: '#ef4444',
  success: '#10b981',
  white: '#ffffff',
  border: '#e2e8f0',
  shadow: '#000000',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: 100,
  },
  
  headerSection: {
    backgroundColor: colors.cardBackground,
    padding: 24,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  
  fastCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  fastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    flex: 1,
  },
  
  fastDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 2,
    marginHorizontal: 12,
  },
  
  section: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  
  symptomContainer: {
    position: 'relative',
    marginHorizontal: 20,
  },
  
  fastBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: colors.white,
  },
  
  fastBadgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  symptomCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  
  actionButton: {
    marginBottom: 12,
  },
  
  noteSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  
  noteText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginLeft: 12,
=======
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const BrainStrokeSymptoms = () => {
  const symptoms = [
    {
      title: "Loss of Balance",
      description: "Difficulty in coordination and frequent stumbling.",
      icon: "walking",
    },
    {
      title: "Eye Problem",
      description: "Sudden blurry vision or loss of sight in one or both eyes.",
      icon: "eye",
    },
    {
      title: "Early Morning Dizziness",
      description: "Feeling lightheaded or faint right after waking up.",
      icon: "bed",
    },
    {
      title: "Facial Weakness",
      description: "One side of the face drooping or difficulty in smiling.",
      icon: "sad-tear",
    },
    {
      title: "Extreme Fatigue",
      description: "Unusual tiredness and lack of energy throughout the day.",
      icon: "battery-empty",
    },
    {
      title: "Arm Weakness",
      description: "Difficulty in lifting or controlling one arm properly.",
      icon: "hand-paper",
    },
    {
      title: "Speech Disturbance",
      description: "Slurred speech or difficulty in forming words.",
      icon: "microphone-alt-slash",
    },
    {
      title: "Terrible Headache",
      description: "Severe headache with no known cause, often sudden.",
      icon: "head-side-virus",
    },
    {
      title: "Lack of Concentration",
      description: "Difficulty focusing, confusion, or memory loss.",
      icon: "user-clock",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Brain Stroke Symptoms</Text>
      {symptoms.map((symptom, index) => (
        <View key={index} style={styles.symptomBox}>
          <Icon name={symptom.icon} size={40} color="#0d6efd" style={styles.icon} />
          <Text style={styles.symptomTitle}>{symptom.title}</Text>
          <Text style={styles.symptomDescription}>{symptom.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d6efd',
    textAlign: 'center',
    marginBottom: 20,
  },
  symptomBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  icon: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  symptomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d6efd',
    textAlign: 'center',
    marginBottom: 5,
  },
  symptomDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
>>>>>>> 3af4c8bbfd4c76e4139eaf99b6ee9328453f1008
  },
});

export default BrainStrokeSymptoms;
