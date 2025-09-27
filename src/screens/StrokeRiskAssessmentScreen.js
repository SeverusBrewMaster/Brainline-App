import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import HealthAssessmentService from '../services/HealthAssessmentService';
import { auth } from '../firebase/config';
import UserService from '../services/UserService';

// Import your enhanced components and Firebase services
import Header from '../components/Header';
import Button from '../components/Button';

// Optimized TextInput component for better performance
const OptimizedTextInput = React.memo(({ value, onChangeText, style, placeholder, keyboardType, editable = true, ...props }) => {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState(value || '');
  const timeoutRef = useRef();

  React.useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChangeText = useCallback((text) => {
    setLocalValue(text);
    // Debounce the state update to reduce re-renders
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChangeText(text);
    }, 300);
  }, [onChangeText]);

  return (
    <TextInput
      style={style}
      placeholder={placeholder}
      value={localValue}
      onChangeText={handleChangeText}
      keyboardType={keyboardType}
      editable={editable}
      {...props}
    />
  );
});

const StrokeRiskAssessmentScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Patient vitals
  const [patientVitals, setPatientVitals] = useState({
    age: '',
    weight: '',
    height: '',
    bloodPressure: '',
    ldl: '',
    hdl: '',
    cholesterol: '',
    hba1c: '',
    pollutedArea: '',
    atherogenicRisk: ''
  });

  const [profileData, setProfileData] = useState(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Lifestyle factors
  const [lifestyle, setLifestyle] = useState({
    exercise: '',
    exerciseFrequency: '',
    diet: '',
    outsideFood: '',
    education: '',
    profession: '',
    alcohol: '',
    smoke: '',
    alcoholFrequency: ''
  });

  // Medical history
  const [medicalHistory, setMedicalHistory] = useState({
    hypertension: '',
    diabetes: '',
    rnddiabetes: '',
    irregularHeartbeat: '',
    snoring: '',
    bpCheckFrequency: '',
    familyHistory: ''
  });

  // Additional risk factors
  const [additionalFactors, setAdditionalFactors] = useState({
    highStress: 'no',
    sleepHours: '',
    tiaHistory: 'no'
  });

  // Past conditions
  const [pastConditions, setPastConditions] = useState({
    thyroidDisease: false,
    heartDisease: false,
    asthma: false,
    migraine: false
  });

  // Female-specific factors
  const [femaleFactors, setFemaleFactors] = useState({
    contraceptives: '',
    hormoneTherapy: '',
    pregnancyHypertension: ''
  });

  // Symptoms checklist
  const [symptoms, setSymptoms] = useState([]);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [gender, setGender] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    riskScore: 0,
    riskCategory: '',
    recommendations: '',
    urgentReferral: false
  });

  const totalSteps = 6;

  // Load user profile for pre-filling
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const profile = await UserService.getProfileForAssessment(currentUser.uid);
      if (profile && profile.profileCompleted) {
        setProfileData(profile);
        
        // Pre-fill form data from profile
        if (profile.demographics.age) {
          setPatientVitals(prev => ({
            ...prev,
            age: profile.demographics.age.toString()
          }));
        }

        if (profile.demographics.gender) {
          setGender(profile.demographics.gender);
        }

        if (profile.physicalInfo.height) {
          setPatientVitals(prev => ({
            ...prev,
            height: profile.physicalInfo.height.toString()
          }));
        }

        if (profile.physicalInfo.weight) {
          setPatientVitals(prev => ({
            ...prev,
            weight: profile.physicalInfo.weight.toString()
          }));
        }

        if (profile.demographics.education) {
          setLifestyle(prev => ({
            ...prev,
            education: profile.demographics.education
          }));
        }

        if (profile.demographics.profession) {
          setLifestyle(prev => ({
            ...prev,
            profession: profile.demographics.profession
          }));
        }

        // Pre-fill medical history
        if (profile.medicalHistory.hypertension !== undefined) {
          setMedicalHistory(prev => ({
            ...prev,
            hypertension: profile.medicalHistory.hypertension ? 'yes' : 'no'
          }));
        }

        if (profile.medicalHistory.diabetes !== undefined) {
          setMedicalHistory(prev => ({
            ...prev,
            diabetes: profile.medicalHistory.diabetes ? 'yes' : 'no'
          }));
        }

        if (profile.familyHistory.stroke !== undefined) {
          setMedicalHistory(prev => ({
            ...prev,
            familyHistory: profile.familyHistory.stroke ? 'yes' : 'no'
          }));
        }

        console.log('✅ Profile data loaded and form pre-filled');
      }

      setIsProfileLoaded(true);
    } catch (error) {
      console.error('Error loading user profile for assessment:', error);
      setIsProfileLoaded(true);
    }
  };

  // Pre-filled indicator component
  const PreFilledIndicator = ({ isPreFilled, children }) => (
    <View style={styles.inputContainer}>
      {children}
      {isPreFilled && (
        <View style={styles.preFilledBadge}>
          <Ionicons name="checkmark-circle" size={12} color={colors.success} />
          <Text style={styles.preFilledText}>{t('from_profile')}</Text>
        </View>
      )}
    </View>
  );

  // Profile completion prompt
  const renderProfilePrompt = () => {
    if (isProfileLoaded && (!profileData || !profileData.profileCompleted)) {
      return (
        <View style={styles.profilePrompt}>
          <View style={styles.promptCard}>
            <Ionicons name="person-circle" size={24} color={colors.primary} />
            <View style={styles.promptContent}>
              <Text style={styles.promptTitle}>{t('complete_your_profile')}</Text>
              <Text style={styles.promptText}>
                {t('save_time_future_assessments')}
              </Text>
              <TouchableOpacity
                style={styles.promptButton}
                onPress={() => navigation.navigate('UserProfile')}
              >
                <Text style={styles.promptButtonText}>{t('complete_profile')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  // Symptom options
  const symptomOptions = [
    t('sudden_numbness_weakness'),
    t('confusion_trouble_speaking'),
    t('vision_problems'),
    t('severe_headache'),
    t('dizziness_loss_balance'),
    t('facial_drooping'),
    t('arm_weakness'),
    t('speech_difficulty'),
    t('memory_problems'),
    t('walking_difficulties')
  ];

  // Calculate BMI with memoization
  const calculateBMI = useCallback(() => {
    const weightNum = parseFloat(patientVitals.weight);
    const heightNum = parseFloat(patientVitals.height);
    if (weightNum && heightNum) {
      return (weightNum / (heightNum / 100) ** 2).toFixed(1);
    }
    return '';
  }, [patientVitals.weight, patientVitals.height]);

  // Updated risk calculation
  const calculateRiskScore = useCallback(() => {
    let score = 0;
    console.log('🔍 Starting risk calculation...');

    // Parse numeric values
    const ageNum = parseInt(patientVitals.age) || 0;
    const sleepNum = parseInt(additionalFactors.sleepHours) || 8;
    const hba1cNum = parseFloat(patientVitals.hba1c) || 0;
    const rnddiabetesNum = parseFloat(medicalHistory.rnddiabetes) || 0;

    // Parse blood pressure
    const bpParts = patientVitals.bloodPressure.split('/');
    const systolic = parseInt(bpParts[0]) || 0;
    const diastolic = parseInt(bpParts[1]) || 0;

    // Parse cholesterol values
    const ldlNum = parseFloat(patientVitals.ldl) || 0;
    const hdlNum = parseFloat(patientVitals.hdl) || 0;
    const cholesterolNum = parseFloat(patientVitals.cholesterol) || 0;
    const atherogenicNum = parseFloat(patientVitals.atherogenicRisk) || 0;

    // Apply scoring algorithm
    if (lifestyle.smoke === 'yes') score += 1;

    // Hypertension
    if (systolic > 160 || diastolic > 100) {
      score += 3;
    } else if (systolic > 140 || diastolic > 90) {
      score += 2;
    }

    // Age factor
    if (ageNum > 60) score += 1;

    // Alcohol abuse
    if (lifestyle.alcoholFrequency === 'daily' || lifestyle.alcoholFrequency === 'multiple-daily') {
      score += 1;
    }

    // Atrial fibrillation
    if (medicalHistory.irregularHeartbeat === 'yes') score += 2;

    // Diabetes
    if (medicalHistory.diabetes === 'yes' || rnddiabetesNum > 160) {
      if (hba1cNum >= 7) {
        score += 2;
      } else if (hba1cNum > 6.5 && hba1cNum < 7) {
        score += 1;
      } else {
        score += 2;
      }
    }

    // Lipid Profile
    const hasHighCholesterol = cholesterolNum > 240;
    const hasHighLDL = ldlNum > 160;
    const hasLowHDL = hdlNum < 40;
    const hasBorderlineCholesterol = cholesterolNum > 200 && cholesterolNum <= 240;
    const hasBorderlineAIP = atherogenicNum > 0.11 && atherogenicNum <= 0.21;
    const hasHighAIP = atherogenicNum > 0.21;
    const hasBorderlineLDL = ldlNum > 100 && ldlNum <= 160;
    const hasBorderlineHDL = hdlNum >= 40 && hdlNum < 60;

    if (hasHighCholesterol || hasHighLDL || hasLowHDL || hasHighAIP) {
      score += 2;
    } else if (hasBorderlineCholesterol || hasBorderlineLDL || hasBorderlineHDL || hasBorderlineAIP) {
      score += 1;
    }

    // High stress levels
    if (additionalFactors.highStress === 'yes') score += 1;

    // No exercise
    if (lifestyle.exercise === 'no') score += 1;

    // BMI >30 (obesity)
    if (patientVitals.weight && patientVitals.height) {
      const bmi = parseFloat(patientVitals.weight) / (parseFloat(patientVitals.height) / 100) ** 2;
      if (bmi > 30) score += 1;
    }

    // History of TIA
    if (additionalFactors.tiaHistory === 'yes') score += 2;

    // Sleep deprivation
    if (sleepNum < 6) score += 1;

    // Pollution exposure
    if (patientVitals.pollutedArea === 'yes') score += 1;

    // Family history
    if (medicalHistory.familyHistory === 'yes') score += 2;

    // Determine risk category
    let category = '';
    let recommendationText = '';
    let rescreenInterval = '';
    let urgentReferral = false;

    if (score <= 5) {
      category = t('low');
      recommendationText = t('low_risk_recommendation');
      rescreenInterval = t('rescreen_12_months');
    } else if (score >= 6 && score <= 12) {
      category = t('moderate');
      recommendationText = t('moderate_risk_recommendation');
      rescreenInterval = t('lifestyle_counseling_6_months');
    } else {
      category = t('high');
      recommendationText = t('high_risk_recommendation');
      rescreenInterval = t('urgent_referral_partner_hospital');
      urgentReferral = true;
    }

    console.log('🔍 Final calculated score:', score);
    console.log('🔍 Risk category:', category);

    // Return consistent field names that match dashboard expectations
    return {
      riskScore: score,
      riskCategory: category,
      recommendations: recommendationText,
      rescreenInterval,
      urgentReferral
    };
  }, [patientVitals, lifestyle, medicalHistory, additionalFactors, t]);

  const toggleSymptom = useCallback((symptom) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  }, []);

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!patientVitals.age || !gender) {
          Alert.alert(t('validation_error'), t('please_enter_age_gender'));
          return false;
        }
        return true;
      case 2:
        if (!patientVitals.bloodPressure || !patientVitals.weight || !patientVitals.height) {
          Alert.alert(t('validation_error'), t('please_enter_bp_weight_height'));
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Firebase integration for saving assessment
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert(t('error'), t('please_login_save_assessment'));
        return;
      }

      // Calculate risk score with debugging
      const assessmentResults = calculateRiskScore();
      console.log('🔍 Assessment results from calculation:', assessmentResults);

      // Validate results
      if (!assessmentResults || typeof assessmentResults.riskScore !== 'number') {
        console.error('❌ Invalid assessment results:', assessmentResults);
        Alert.alert(t('error'), t('unable_calculate_risk_score'));
        return;
      }

      // Prepare assessment data with consistent structure
      const assessmentData = {
        demographics: {
          age: parseInt(patientVitals.age),
          gender: gender,
          education: lifestyle.education,
          profession: lifestyle.profession
        },
        vitals: {
          weight: parseFloat(patientVitals.weight),
          height: parseFloat(patientVitals.height),
          bmi: parseFloat(calculateBMI()),
          bloodPressure: patientVitals.bloodPressure,
          systolic: parseInt(patientVitals.bloodPressure.split('/')[0]) || 0,
          diastolic: parseInt(patientVitals.bloodPressure.split('/')[1]) || 0
        },
        labResults: {
          totalCholesterol: parseFloat(patientVitals.cholesterol) || null,
          ldlCholesterol: parseFloat(patientVitals.ldl) || null,
          hdlCholesterol: parseFloat(patientVitals.hdl) || null,
          hba1c: parseFloat(patientVitals.hba1c) || null
        },
        environmental: {
          pollutedArea: patientVitals.pollutedArea === 'yes'
        },
        lifestyle: {
          smoking: lifestyle.smoke === 'yes',
          alcohol: lifestyle.alcohol === 'yes',
          alcoholFrequency: lifestyle.alcoholFrequency,
          exercise: lifestyle.exercise === 'yes',
          exerciseFrequency: lifestyle.exerciseFrequency,
          highStress: additionalFactors.highStress === 'yes',
          sleepHours: parseFloat(additionalFactors.sleepHours) || null
        },
        medicalHistory: {
          hypertension: medicalHistory.hypertension === 'yes',
          diabetes: medicalHistory.diabetes === 'yes',
          atrialFibrillation: medicalHistory.irregularHeartbeat === 'yes',
          familyHistory: medicalHistory.familyHistory === 'yes',
          tiaHistory: additionalFactors.tiaHistory === 'yes'
        },
        // Ensure results structure matches what dashboard expects
        results: {
          riskScore: assessmentResults.riskScore,
          riskCategory: assessmentResults.riskCategory,
          recommendations: assessmentResults.recommendations || t('follow_up_healthcare_provider'),
          rescreenInterval: assessmentResults.rescreenInterval,
          urgentReferral: assessmentResults.urgentReferral
        },
        symptoms: {
          hasSymptoms: symptoms.length > 0,
          activeSymptoms: symptoms,
          symptomSeverity: symptoms.length > 3 ? 'severe' :
            symptoms.length > 1 ? 'moderate' : 'mild'
        }
      };

      console.log('🔍 Assessment data to save:', assessmentData);
      console.log('🔍 Risk score being saved:', assessmentData.results.riskScore);

      // Save to Firebase
      const assessmentId = await HealthAssessmentService.saveHealthAssessment(
        currentUser.uid,
        assessmentData
      );

      console.log('✅ Assessment saved with ID:', assessmentId);

      // Show results
      setResults(assessmentResults);
      setShowResults(true);

      // Success alert with navigation back to dashboard
      Alert.alert(
        t('assessment_complete'),
        t('assessment_saved_details', {
          riskScore: assessmentResults.riskScore,
          riskLevel: assessmentResults.riskCategory
        }),
        [
          {
            text: t('view_dashboard'),
            onPress: () => {
              // Navigate back and trigger refresh
              navigation.navigate('User', { refresh: true });
            }
          },
          { text: t('ok'), style: 'default' }
        ]
      );

    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      Alert.alert(t('error'), t('failed_save_assessment'));
    } finally {
      setLoading(false);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[...Array(totalSteps)].map((_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index < currentStep ? styles.stepDotActive : styles.stepDotInactive,
          ]}
        />
      ))}
      <Text style={styles.stepText}>{t('step_of', { current: currentStep, total: totalSteps })}</Text>
    </View>
  );

  // Render basic info step with pre-filling
  const renderBasicInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('basic_information')}</Text>
      <Text style={styles.stepSubtitle}>{t('personal_details_demographics')}</Text>
      
      <PreFilledIndicator isPreFilled={profileData?.demographics?.age}>
        <Text style={styles.label}>{t('age')} *</Text>
        <OptimizedTextInput
          style={styles.textInput}
          value={patientVitals.age}
          onChangeText={(text) => setPatientVitals(prev => ({ ...prev, age: text }))}
          placeholder={t('enter_your_age')}
          keyboardType="numeric"
        />
      </PreFilledIndicator>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t('gender')} *</Text>
        <View style={styles.radioGroup}>
          {[
            { key: 'Male', label: t('male') },
            { key: 'Female', label: t('female') }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.radioOption,
                gender === option.key && styles.radioOptionSelected,
              ]}
              onPress={() => setGender(option.key)}
            >
              <Text style={[
                styles.radioText,
                gender === option.key && styles.radioTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t('education_level')}</Text>
        <View style={styles.radioGroup}>
          {[
            { key: 'Primary', label: t('primary') },
            { key: 'Secondary', label: t('secondary') },
            { key: 'Graduate', label: t('graduate') },
            { key: 'Post-graduate', label: t('post_graduate') }
          ].map((level) => (
            <TouchableOpacity
              key={level.key}
              style={[
                styles.radioOption,
                lifestyle.education === level.key && styles.radioOptionSelected,
              ]}
              onPress={() => setLifestyle(prev => ({ ...prev, education: level.key }))}
            >
              <Text style={[
                styles.radioText,
                lifestyle.education === level.key && styles.radioTextSelected,
              ]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('profession')}</Text>
        <OptimizedTextInput
          style={styles.textInput}
          value={lifestyle.profession}
          onChangeText={(text) => setLifestyle(prev => ({ ...prev, profession: text }))}
          placeholder={t('your_profession')}
        />
      </View>
    </View>
  );

  const renderVitals = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('vital_parameters')}</Text>
      <Text style={styles.stepSubtitle}>{t('physical_measurements_lab_values')}</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('blood_pressure_mmhg')} *</Text>
        <OptimizedTextInput
          style={styles.textInput}
          value={patientVitals.bloodPressure}
          onChangeText={(text) => setPatientVitals(prev => ({ ...prev, bloodPressure: text }))}
          placeholder={t('systolic_diastolic')}
        />
      </View>

      <View style={styles.inputRow}>
        <PreFilledIndicator isPreFilled={profileData?.physicalInfo?.weight}>
          <Text style={styles.label}>{t('weight_kg')} *</Text>
          <OptimizedTextInput
            style={styles.numberInput}
            value={patientVitals.weight}
            onChangeText={(text) => setPatientVitals(prev => ({ ...prev, weight: text }))}
            keyboardType="numeric"
            placeholder={t('weight')}
          />
        </PreFilledIndicator>

        <PreFilledIndicator isPreFilled={profileData?.physicalInfo?.height}>
          <Text style={styles.label}>{t('height_cm')} *</Text>
          <OptimizedTextInput
            style={styles.numberInput}
            value={patientVitals.height}
            onChangeText={(text) => setPatientVitals(prev => ({ ...prev, height: text }))}
            keyboardType="numeric"
            placeholder={t('height')}
          />
        </PreFilledIndicator>
      </View>

      {/* Auto-calculated BMI display */}
      {patientVitals.weight && patientVitals.height && (
        <View style={styles.bmiDisplay}>
          <Text style={styles.bmiLabel}>{t('calculated_bmi')}:</Text>
          <Text style={styles.bmiValue}>{calculateBMI()}</Text>
          <Text style={styles.bmiCategory}>
            {(() => {
              const bmi = parseFloat(calculateBMI());
              if (bmi < 18.5) return t('underweight');
              if (bmi < 25) return t('normal');
              if (bmi < 30) return t('overweight');
              return t('obese');
            })()}
          </Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('total_cholesterol')}</Text>
        <OptimizedTextInput
          style={styles.numberInput}
          value={patientVitals.cholesterol}
          onChangeText={(text) => setPatientVitals(prev => ({ ...prev, cholesterol: text }))}
          keyboardType="numeric"
          placeholder={t('mg_dl')}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('ldl_cholesterol')}</Text>
        <OptimizedTextInput
          style={styles.numberInput}
          value={patientVitals.ldl}
          onChangeText={(text) => setPatientVitals(prev => ({ ...prev, ldl: text }))}
          keyboardType="numeric"
          placeholder={t('mg_dl')}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('hdl_cholesterol')}</Text>
        <OptimizedTextInput
          style={styles.numberInput}
          value={patientVitals.hdl}
          onChangeText={(text) => setPatientVitals(prev => ({ ...prev, hdl: text }))}
          keyboardType="numeric"
          placeholder={t('mg_dl')}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('hba1c_percent')}</Text>
        <OptimizedTextInput
          style={styles.numberInput}
          value={patientVitals.hba1c}
          onChangeText={(text) => setPatientVitals(prev => ({ ...prev, hba1c: text }))}
          keyboardType="numeric"
          placeholder={t('percentage')}
        />
      </View>

      {/* Updated pollution question instead of AQI */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t('live_in_polluted_area')}</Text>
        <Text style={styles.questionSubtext}>
          {t('consider_factors_traffic_industrial')}
        </Text>
        <View style={styles.radioGroup}>
          {[
            { key: 'yes', label: t('yes') },
            { key: 'no', label: t('no') }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.radioOption,
                patientVitals.pollutedArea === option.key && styles.radioOptionSelected,
              ]}
              onPress={() => setPatientVitals(prev => ({ ...prev, pollutedArea: option.key }))}
            >
              <Text style={[
                styles.radioText,
                patientVitals.pollutedArea === option.key && styles.radioTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderMedicalHistory = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('medical_history')}</Text>
      <Text style={styles.stepSubtitle}>{t('current_past_medical_conditions')}</Text>
      
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t('do_you_have_hypertension')}</Text>
        <View style={styles.radioGroup}>
          {[
            { key: 'yes', label: t('yes') },
            { key: 'no', label: t('no') }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.radioOption,
                medicalHistory.hypertension === option.key && styles.radioOptionSelected,
              ]}
              onPress={() => setMedicalHistory(prev => ({ ...prev, hypertension: option.key }))}
            >
              <Text style={[
                styles.radioText,
                medicalHistory.hypertension === option.key && styles.radioTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t('do_you_have_diabetes')}</Text>
        <View style={styles.radioGroup}>
          {[
            { key: 'yes', label: t('yes') },
            { key: 'no', label: t('no') }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.radioOption,
                medicalHistory.diabetes === option.key && styles.radioOptionSelected,
              ]}
              onPress={() => setMedicalHistory(prev => ({ ...prev, diabetes: option.key }))}
            >
              <Text style={[
                styles.radioText,
                medicalHistory.diabetes === option.key && styles.radioTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {medicalHistory.diabetes === 'yes' && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('random_blood_sugar_mg_dl')}</Text>
          <OptimizedTextInput
            style={styles.numberInput}
            value={medicalHistory.rnddiabetes}
            onChangeText={(text) => setMedicalHistory(prev => ({ ...prev, rnddiabetes: text }))}
            keyboardType="numeric"
            placeholder={t('mg_dl')}
          />
        </View>
      )}

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t('irregular_heartbeat_atrial_fib')}</Text>
        <View style={styles.radioGroup}>
          {[
            { key: 'yes', label: t('yes') },
            { key: 'no', label: t('no') }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.radioOption,
                medicalHistory.irregularHeartbeat === option.key && styles.radioOptionSelected,
              ]}
              onPress={() => setMedicalHistory(prev => ({ ...prev, irregularHeartbeat: option.key }))}
            >
              <Text style={[
                styles.radioText,
                medicalHistory.irregularHeartbeat === option.key && styles.radioTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t('family_history_stroke_heart')}</Text>
        <View style={styles.radioGroup}>
          {[
            { key: 'yes', label: t('yes') },
            { key: 'no', label: t('no') }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.radioOption,
                medicalHistory.familyHistory === option.key && styles.radioOptionSelected,
              ]}
              onPress={() => setMedicalHistory(prev => ({ ...prev, familyHistory: option.key }))}
            >
              <Text style={[
                styles.radioText,
                medicalHistory.familyHistory === option.key && styles.radioTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t('history_tia_mini_stroke')}</Text>
        <View style={styles.radioGroup}>
          {[
            { key: 'yes', label: t('yes') },
            { key: 'no', label: t('no') }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.radioOption,
                additionalFactors.tiaHistory === option.key && styles.radioOptionSelected,
              ]}
              onPress={() => setAdditionalFactors(prev => ({ ...prev, tiaHistory: option.key }))}
            >
              <Text style={[
                styles.radioText,
                additionalFactors.tiaHistory === option.key && styles.radioTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t('past_medical_conditions_check_all')}:</Text>
        <View style={styles.checkboxSection}>
          {[
            { key: 'thyroidDisease', label: t('thyroid_disease') },
            { key: 'heartDisease', label: t('heart_disease') },
            { key: 'asthma', label: t('asthma') },
            { key: 'migraine', label: t('migraine') }
          ].map(condition => (
            <TouchableOpacity
              key={condition.key}
              style={styles.checkboxItem}
              onPress={() => setPastConditions(prev => ({
                ...prev,
                [condition.key]: !prev[condition.key]
              }))}
            >
              <View style={[
                styles.checkbox,
                pastConditions[condition.key] && styles.checkboxSelected,
              ]}>
                {pastConditions[condition.key] && (
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{condition.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderLifestyle = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('lifestyle_factors')}</Text>
      <Text style={styles.stepSubtitle}>{t('daily_habits_behaviors')}</Text>
      
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t('do_you_exercise_regularly')}</Text>
        <View style={styles.radioGroup}>
          {[
            { key: 'yes', label: t('yes') },
            { key: 'no', label: t('no') }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.radioOption,
                lifestyle.exercise === option.key && styles.radioOptionSelected,
              ]}
              onPress={() => setLifestyle(prev => ({ ...prev, exercise: option.key }))}
            >
              <Text style={[
                styles.radioText,
                lifestyle.exercise === option.key && styles.radioTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {lifestyle.exercise === 'yes' && (
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{t('exercise_frequency')}</Text>
          <View style={styles.radioGroup}>
            {[
              { key: 'Daily', label: t('daily') },
              { key: '3-4 times/week', label: t('3_4_times_week') },
              { key: '1-2 times/week', label: t('1_2_times_week') },
              { key: 'Occasionally', label: t('occasionally') }
            ].map((freq) => (
              <TouchableOpacity
                key={freq.key}
                style={[
                  styles.radioOption,
                  lifestyle.exerciseFrequency === freq.key && styles.radioOptionSelected,
                ]}
                onPress={() => setLifestyle(prev => ({ ...prev, exerciseFrequency: freq.key }))}
              >
                <Text style={[
                  styles.radioText,
                  lifestyle.exerciseFrequency === freq.key && styles.radioTextSelected,
                ]}>
                  {freq.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t('do_you_smoke_tobacco')}</Text>
        <View style={styles.radioGroup}>
          {[
            { key: 'yes', label: t('yes') },
            { key: 'no', label: t('no') }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.radioOption,
                lifestyle.smoke === option.key && styles.radioOptionSelected,
              ]}
              onPress={() => setLifestyle(prev => ({ ...prev, smoke: option.key }))}
            >
              <Text style={[
                styles.radioText,
                lifestyle.smoke === option.key && styles.radioTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t('do_you_consume_alcohol')}</Text>
        <View style={styles.radioGroup}>
          {[
            { key: 'yes', label: t('yes') },
            { key: 'no', label: t('no') }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.radioOption,
                lifestyle.alcohol === option.key && styles.radioOptionSelected,
              ]}
              onPress={() => setLifestyle(prev => ({ ...prev, alcohol: option.key }))}
            >
              <Text style={[
                styles.radioText,
                lifestyle.alcohol === option.key && styles.radioTextSelected,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {lifestyle.alcohol === 'yes' && (
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{t('alcohol_frequency')}</Text>
          <View style={styles.radioGroup}>
            {[
              { key: 'occasionally', label: t('occasionally') },
              { key: 'weekly', label: t('weekly') },
              { key: 'daily', label: t('daily') },
              { key: 'multiple-daily', label: t('multiple_times_daily') }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.radioOption,
                  lifestyle.alcoholFrequency === option.key && styles.radioOptionSelected,
                ]}
                onPress={() => setLifestyle(prev => ({ ...prev, alcoholFrequency: option.key }))}
              >
                <Text style={[
                  styles.radioText,
                  lifestyle.alcoholFrequency === option.key && styles.radioTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Simple stress yes/no question with switch */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{t('high_stress_levels_regularly')}</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>{t('no')}</Text>
          <Switch
            value={additionalFactors.highStress === 'yes'}
            onValueChange={(value) => setAdditionalFactors(prev => ({ ...prev, highStress: value ? 'yes' : 'no' }))}
            trackColor={{ false: colors.border, true: colors.warning }}
            thumbColor={colors.white}
          />
          <Text style={styles.switchLabel}>{t('yes')}</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('average_sleep_hours_night')}</Text>
        <OptimizedTextInput
          style={styles.numberInput}
          value={additionalFactors.sleepHours}
          onChangeText={(text) => setAdditionalFactors(prev => ({ ...prev, sleepHours: text }))}
          keyboardType="numeric"
          placeholder={t('hours')}
        />
      </View>
    </View>
  );

  const renderFemaleFactors = () => (
    gender === 'Female' && (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>{t('female_specific_factors')}</Text>
        <Text style={styles.stepSubtitle}>{t('additional_risk_factors_women')}</Text>
        
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{t('use_oral_contraceptives')}</Text>
          <View style={styles.radioGroup}>
            {[
              { key: 'yes', label: t('yes') },
              { key: 'no', label: t('no') }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.radioOption,
                  femaleFactors.contraceptives === option.key && styles.radioOptionSelected,
                ]}
                onPress={() => setFemaleFactors(prev => ({ ...prev, contraceptives: option.key }))}
              >
                <Text style={[
                  styles.radioText,
                  femaleFactors.contraceptives === option.key && styles.radioTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{t('hormone_replacement_therapy')}</Text>
          <View style={styles.radioGroup}>
            {[
              { key: 'yes', label: t('yes') },
              { key: 'no', label: t('no') }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.radioOption,
                  femaleFactors.hormoneTherapy === option.key && styles.radioOptionSelected,
                ]}
                onPress={() => setFemaleFactors(prev => ({ ...prev, hormoneTherapy: option.key }))}
              >
                <Text style={[
                  styles.radioText,
                  femaleFactors.hormoneTherapy === option.key && styles.radioTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{t('pregnancy_related_hypertension')}</Text>
          <View style={styles.radioGroup}>
            {[
              { key: 'yes', label: t('yes') },
              { key: 'no', label: t('no') }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.radioOption,
                  femaleFactors.pregnancyHypertension === option.key && styles.radioOptionSelected,
                ]}
                onPress={() => setFemaleFactors(prev => ({ ...prev, pregnancyHypertension: option.key }))}
              >
                <Text style={[
                  styles.radioText,
                  femaleFactors.pregnancyHypertension === option.key && styles.radioTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    )
  );

  const renderSymptoms = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('current_symptoms')}</Text>
      <Text style={styles.stepSubtitle}>{t('check_symptoms_experiencing')}</Text>
      
      <View style={styles.symptomsGrid}>
        {symptomOptions.map((symptom) => (
          <TouchableOpacity
            key={symptom}
            style={[
              styles.symptomItem,
              symptoms.includes(symptom) && styles.symptomItemSelected,
            ]}
            onPress={() => toggleSymptom(symptom)}
          >
            <View style={[
              styles.symptomCheckbox,
              symptoms.includes(symptom) && styles.symptomCheckboxSelected,
            ]}>
              {symptoms.includes(symptom) && (
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              )}
            </View>
            <Text style={[
              styles.symptomText,
              symptoms.includes(symptom) && styles.symptomTextSelected,
            ]}>
              {symptom}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {symptoms.length > 0 && (
        <View style={styles.urgentWarning}>
          <Ionicons name="warning" size={20} color={colors.error} />
          <Text style={styles.urgentWarningText}>
            {t('experiencing_symptoms_seek_immediate_care')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderResults = () => (
    <View style={styles.resultsContainer}>
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>{t('your_stroke_risk_assessment')}</Text>
        <Text style={styles.scoreValue}>{results.riskScore}/21</Text>
        <View style={[
          styles.riskBadge,
          { backgroundColor: results.riskCategory === t('low') ? colors.success : 
                           results.riskCategory === t('moderate') ? colors.warning : colors.error }
        ]}>
          <Text style={styles.riskBadgeText}>{results.riskCategory} {t('risk')}</Text>
        </View>
      </View>

      <View style={styles.recommendationCard}>
        <Text style={styles.recommendationTitle}>{t('recommendations')}</Text>
        <Text style={styles.recommendationText}>{results.recommendations}</Text>
        
        {results.urgentReferral && (
          <View style={styles.urgentReferral}>
            <Ionicons name="warning" size={20} color={colors.error} />
            <Text style={styles.urgentReferralText}>
              {t('urgent_medical_consultation_recommended')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <Button
          title={t('find_healthcare_providers')}
          onPress={() => {
            Alert.alert(
              t('healthcare_providers'),
              t('recommend_consulting_qualified_provider'),
              [{ text: t('ok') }]
            );
          }}
          style={styles.actionButton}
        />

        <Button
          title={t('learn_about_symptoms')}
          onPress={() => navigation.navigate('BrainSymptoms')}
          style={styles.actionButton}
        />

        <Button
          title={t('retake_assessment')}
          onPress={() => {
            setShowResults(false);
            setCurrentStep(1);
            // Reset all form data
            setPatientVitals({ age: '', weight: '', height: '', bloodPressure: '', ldl: '', hdl: '', cholesterol: '', hba1c: '', pollutedArea: '', atherogenicRisk: '' });
            setLifestyle({ exercise: '', exerciseFrequency: '', diet: '', outsideFood: '', education: '', profession: '', alcohol: '', smoke: '', alcoholFrequency: '' });
            setMedicalHistory({ hypertension: '', diabetes: '', rnddiabetes: '', irregularHeartbeat: '', snoring: '', bpCheckFrequency: '', familyHistory: '' });
            setAdditionalFactors({ highStress: 'no', sleepHours: '', tiaHistory: 'no' });
            setPastConditions({ thyroidDisease: false, heartDisease: false, asthma: false, migraine: false });
            setFemaleFactors({ contraceptives: '', hormoneTherapy: '', pregnancyHypertension: '' });
            setSymptoms([]);
            setGender('');
          }}
          style={styles.actionButton}
        />
      </View>

      <View style={styles.disclaimerCard}>
        <Ionicons name="information-circle" size={20} color={colors.warning} />
        <Text style={styles.disclaimerText}>
          <Text style={styles.disclaimerTitle}>{t('medical_disclaimer')}:</Text>
          {'\n'}{t('assessment_educational_purposes_disclaimer')}
        </Text>
      </View>
    </View>
  );

  if (showResults) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
        {renderResults()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      
      {/* Fixed Header with proper spacing */}
      <View style={styles.headerSection}>
        <Text style={styles.mainTitle}>{t('comprehensive_stroke_risk_assessment')}</Text>
        <Text style={styles.subtitle}>{t('based_validated_medical_protocols')}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {renderStepIndicator()}
        {renderProfilePrompt()}

        {currentStep === 1 && renderBasicInfo()}
        {currentStep === 2 && renderVitals()}
        {currentStep === 3 && renderMedicalHistory()}
        {currentStep === 4 && renderLifestyle()}
        {currentStep === 5 && (gender === 'Female' ? renderFemaleFactors() : renderSymptoms())}
        {currentStep === 6 && renderSymptoms()}

        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <Button
              title={t('previous')}
              onPress={prevStep}
              style={[styles.navButton, { backgroundColor: colors.textMuted }]}
            />
          )}
          <Button
            title={loading ? t('saving') : (currentStep === totalSteps ? t('complete_assessment') : t('next'))}
            onPress={nextStep}
            disabled={loading}
            style={styles.navButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Complete styles object with all the new pre-fill styles
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
  error: '#ef4444',
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
  // Pre-filled input styles
  inputContainer: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  preFilledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    position: 'absolute',
    top: -8,
    right: 8,
  },
  preFilledText: {
    fontSize: 10,
    color: colors.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  preFilledInput: {
    borderColor: colors.success,
    backgroundColor: `${colors.success}08`,
  },
  // Profile prompt styles
  profilePrompt: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  promptCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  promptContent: {
    marginLeft: 12,
    flex: 1,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  promptText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  promptButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  promptButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  headerSection: {
    backgroundColor: colors.cardBackground,
    padding: 24,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 3,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotInactive: {
    backgroundColor: colors.border,
  },
  stepText: {
    marginLeft: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stepContainer: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  labelWithInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoButton: {
    marginLeft: 8,
    padding: 4,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  numberInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  bmiDisplay: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bmiLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  bmiCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginHorizontal: 12,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
    fontWeight: '500',
  },
  questionSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  radioRow: {
    flexDirection: 'row',
    gap: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioOption: {
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radioOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radioText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  radioTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  checkboxSection: {
    marginTop: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  symptomsGrid: {
    marginBottom: 16,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  symptomItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  symptomCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomCheckboxSelected: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  symptomText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  symptomTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  urgentWarning: {
    flexDirection: 'row',
    backgroundColor: `${colors.error}15`,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    alignItems: 'flex-start',
  },
  urgentWarningText: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
    marginLeft: 12,
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  // Results styles
  resultsContainer: {
    padding: 20,
  },
  scoreCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreTitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  riskBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  riskBadgeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  urgentReferral: {
    flexDirection: 'row',
    backgroundColor: `${colors.error}15`,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  urgentReferralText: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
    marginLeft: 12,
    lineHeight: 20,
  },
  actionButtons: {
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginLeft: 12,
  },
  disclaimerTitle: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
});

export default StrokeRiskAssessmentScreen;
