import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// Import your enhanced components
import Header from '../components/Header';
import SymptomCard from '../components/SymptomCard';
import Button from '../components/Button';

const BrainStrokeSymptoms = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const symptoms = [
    {
      icon: <MaterialIcons name="accessibility" size={24} color="#f59e0b" />,
      title: t('loss_of_balance'),
      description: t('loss_of_balance_desc'),
      severity: "warning",
      fastSymbol: "B" // F.A.S.T. - Balance
    },
    {
      icon: <Ionicons name="eye-off" size={24} color="#ef4444" />,
      title: t('vision_problem'),
      description: t('vision_problem_desc'),
      severity: "critical",
      fastSymbol: "F" // F.A.S.T. - Face (includes vision)
    },
    {
      icon: <MaterialIcons name="rotate-left" size={24} color="#64748b" />,
      title: t('early_morning_dizziness'),
      description: t('early_morning_dizziness_desc'),
      severity: "normal"
    },
    {
      icon: <Ionicons name="sad" size={24} color="#ef4444" />,
      title: t('facial_weakness'),
      description: t('facial_weakness_desc'),
      severity: "critical",
      fastSymbol: "F" // F.A.S.T. - Face
    },
    {
      icon: <MaterialIcons name="battery-alert" size={24} color="#f59e0b" />,
      title: t('extreme_fatigue'),
      description: t('extreme_fatigue_desc'),
      severity: "warning"
    },
    {
      icon: <Ionicons name="hand-left" size={24} color="#ef4444" />,
      title: t('arms_weakness'),
      description: t('arms_weakness_desc'),
      severity: "critical",
      fastSymbol: "A" // F.A.S.T. - Arms
    },
    {
      icon: <Ionicons name="chatbox" size={24} color="#ef4444" />,
      title: t('speech_disturbance'),
      description: t('speech_disturbance_desc'),
      severity: "critical",
      fastSymbol: "S" // F.A.S.T. - Speech
    },
    {
      icon: <MaterialIcons name="flash-on" size={24} color="#ef4444" />,
      title: t('severe_headache'),
      description: t('severe_headache_desc'),
      severity: "critical"
    },
    {
      icon: <MaterialIcons name="psychology" size={24} color="#f59e0b" />,
      title: t('lack_of_concentration'),
      description: t('lack_of_concentration_desc'),
      severity: "warning"
    },
  ];

  const handleSymptomPress = (symptom) => {
    const severityMessage = symptom.severity === 'critical'
      ? t('critical_warning_message')
      : symptom.severity === 'warning'
      ? t('warning_symptom_message')
      : t('monitor_symptom_message');

    Alert.alert(
      symptom.title,
      `${symptom.description}\n\n${severityMessage}`,
      [
        { text: t('ok'), style: 'default' },
        ...(symptom.severity === 'critical' ? [{
          text: t('emergencys_call'),
          style: 'destructive',
          onPress: () => Alert.alert(
            t('emergency_services'),
            t('call_emergency_immediately'),
            [
              { text: t('cancel'), style: 'cancel' },
              { 
                text: t('call_emergency_number'), 
                onPress: () => Linking.openURL('tel:108') 
              }
            ]
          )
        }] : [])
      ]
    );
  };

  const handleEmergencyInfo = () => {
    Alert.alert(
      t('fast_test'),
      t('fast_test_description'),
      [{ text: t('understood') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <Header />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>{t('brain_stroke_warning_signs')}</Text>
          <Text style={styles.subtitle}>
            {t('recognize_symptoms_early_act_fast')}
          </Text>
          
          <TouchableOpacity style={styles.fastCard} onPress={handleEmergencyInfo}>
            <Text style={styles.fastTitle}>{t('fast_test')}</Text>
            <Text style={styles.fastDescription}>
              {t('learn_quick_stroke_recognition')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Critical Symptoms Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('critical_warning_signs_emoji')}</Text>
          <Text style={styles.sectionSubtitle}>{t('seek_immediate_medical_attention')}</Text>
          
          {symptoms.filter(s => s.severity === 'critical').map((symptom, index) => (
            <View key={index} style={styles.symptomContainer}>
              {symptom.fastSymbol && (
                <View style={styles.fastBadge}>
                  <Text style={styles.fastBadgeText}>{symptom.fastSymbol}</Text>
                </View>
              )}
              <SymptomCard
                icon={symptom.icon}
                title={symptom.title}
                description={symptom.description}
                onPress={() => handleSymptomPress(symptom)}
                style={styles.symptomCard}
              />
            </View>
          ))}
        </View>

        {/* Warning Symptoms Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('warning_signs_emoji')}</Text>
          <Text style={styles.sectionSubtitle}>{t('monitor_closely_consult_doctor')}</Text>
          
          {symptoms.filter(s => s.severity === 'warning').map((symptom, index) => (
            <SymptomCard
              key={index}
              icon={symptom.icon}
              title={symptom.title}
              description={symptom.description}
              onPress={() => handleSymptomPress(symptom)}
              style={styles.symptomCard}
            />
          ))}
        </View>

        {/* Additional Symptoms Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('additional_symptoms_emoji')}</Text>
          <Text style={styles.sectionSubtitle}>{t('be_aware_these_signs')}</Text>
          
          {symptoms.filter(s => s.severity === 'normal').map((symptom, index) => (
            <SymptomCard
              key={index}
              icon={symptom.icon}
              title={symptom.title}
              description={symptom.description}
              onPress={() => handleSymptomPress(symptom)}
              style={styles.symptomCard}
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title={t('take_risk_assessment')}
            onPress={() => navigation.navigate('StrokeRiskAssessment')}
            style={styles.actionButton}
          />
          
          <Button
            title={t('emergency_contacts')}
            onPress={() => navigation.navigate('EmergencyContact')}
            style={styles.actionButton}
          />
        </View>

        {/* Educational Note */}
        <View style={styles.noteSection}>
          <MaterialIcons name="info" size={20} color={colors.secondary} />
          <Text style={styles.noteText}>
            {t('educational_disclaimer')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
});

export default BrainStrokeSymptoms;
