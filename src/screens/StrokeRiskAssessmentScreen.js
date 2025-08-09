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

import HealthAssessmentService from '../services/HealthAssessmentService';
import { auth } from '../firebase/config';
import UserService from '../services/UserService';

// Import your enhanced components and Firebase services
import Header from '../components/Header';
import Button from '../components/Button';

// Optimized TextInput component for better performance
const OptimizedTextInput = React.memo(({ value, onChangeText, style, placeholder, keyboardType, editable = true, ...props }) => {
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
      {...props}
      style={style}
      value={localValue}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      editable={editable}
    />
  );
});

const StrokeRiskAssessmentScreen = ({ navigation }) => {
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
      <View style={styles.inputHeader}>
        {children}
        {isPreFilled && (
          <View style={styles.preFilledBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.preFilledText}>From Profile</Text>
          </View>
        )}
      </View>
    </View>
  );

  // Profile completion prompt
  const renderProfilePrompt = () => {
    if (isProfileLoaded && (!profileData || !profileData.profileCompleted)) {
      return (
        <View style={styles.profilePrompt}>
          <View style={styles.promptCard}>
            <Ionicons name="person-outline" size={24} color={colors.primary} />
            <View style={styles.promptContent}>
              <Text style={styles.promptTitle}>Complete Your Profile</Text>
              <Text style={styles.promptText}>
                Save time on future assessments by completing your profile first
              </Text>
              <TouchableOpacity 
                style={styles.promptButton}
                onPress={() => navigation.navigate('UserProfile')}
              >
                <Text style={styles.promptButtonText}>Complete Profile</Text>
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
    'Sudden numbness or weakness',
    'Confusion or trouble speaking',
    'Vision problems',
    'Severe headache',
    'Dizziness or loss of balance',
    'Facial drooping',
    'Arm weakness',
    'Speech difficulty',
    'Memory problems',
    'Walking difficulties'
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
      category = 'Low';
      recommendationText = 'You are a healthy individual. Maintain your current lifestyle with regular check-ups and preventive care.';
      rescreenInterval = 'Re-screen after 12 months';
    } else if (score >= 6 && score <= 12) {
      category = 'Moderate';
      recommendationText = 'Moderate risk detected. Consider dietary modifications, regular exercise, stress management, and follow-up with your physician for lifestyle counselling.';
      rescreenInterval = 'Lifestyle counselling recommended, re-check in 6 months';
    } else {
      category = 'High';
      recommendationText = 'High risk detected. Immediate consultation with a healthcare provider is strongly recommended for comprehensive evaluation and management.';
      rescreenInterval = 'Urgent referral to partner hospital';
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
  }, [patientVitals, lifestyle, medicalHistory, additionalFactors]);

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
          Alert.alert('Validation Error', 'Please enter your age and gender.');
          return false;
        }
        return true;
      case 2:
        if (!patientVitals.bloodPressure || !patientVitals.weight || !patientVitals.height) {
          Alert.alert('Validation Error', 'Please enter blood pressure, weight, and height.');
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
        Alert.alert('Error', 'Please log in to save your assessment.');
        return;
      }

      // Calculate risk score with debugging
      const assessmentResults = calculateRiskScore();
      console.log('🔍 Assessment results from calculation:', assessmentResults);

      // Validate results
      if (!assessmentResults || typeof assessmentResults.riskScore !== 'number') {
        console.error('❌ Invalid assessment results:', assessmentResults);
        Alert.alert('Error', 'Unable to calculate risk score. Please check all fields.');
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
          recommendations: assessmentResults.recommendations || 'Follow up with healthcare provider',
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
        '✅ Assessment Complete',
        `Your risk assessment has been saved.\nRisk Score: ${assessmentResults.riskScore}\nRisk Level: ${assessmentResults.riskCategory}`,
        [
          { 
            text: 'View Dashboard', 
            onPress: () => {
              // Navigate back and trigger refresh
              navigation.navigate('User', { refresh: true });
            }
          },
          { text: 'OK', style: 'default' }
        ]
      );

    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      Alert.alert('Error', 'Failed to save assessment. Please try again.');
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
            currentStep === index + 1 ? styles.stepDotActive : styles.stepDotInactive
          ]}
        />
      ))}
      <Text style={styles.stepText}>Step {currentStep} of {totalSteps}</Text>
    </View>
  );

  // Render basic info step with pre-filling
  const renderBasicInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Personal details and demographics</Text>

      <PreFilledIndicator isPreFilled={profileData?.demographics?.age}>
        <Text style={styles.label}>Age *</Text>
        <TextInput
          style={[
            styles.textInput,
            profileData?.demographics?.age && styles.preFilledInput
          ]}
          value={patientVitals.age}
          onChangeText={(text) => setPatientVitals(prev => ({ ...prev, age: text }))}
          placeholder="Enter your age"
          keyboardType="numeric"
        />
      </PreFilledIndicator>

      <PreFilledIndicator isPreFilled={profileData?.demographics?.gender}>
        <Text style={styles.label}>Gender *</Text>
        <View style={styles.radioGroup}>
          {['Male', 'Female'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                gender === option && styles.radioOptionSelected
              ]}
              onPress={() => setGender(option)}
            >
              <Text style={[
                styles.radioText,
                gender === option && styles.radioTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </PreFilledIndicator>

      <PreFilledIndicator isPreFilled={profileData?.demographics?.education}>
        <Text style={styles.label}>Education Level</Text>
        <View style={styles.radioGroup}>
          {['Primary', 'Secondary', 'Graduate', 'Post-graduate'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.radioOption,
                lifestyle.education === level && styles.radioOptionSelected
              ]}
              onPress={() => setLifestyle(prev => ({ ...prev, education: level }))}
            >
              <Text style={[
                styles.radioText,
                lifestyle.education === level && styles.radioTextSelected
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </PreFilledIndicator>

      <PreFilledIndicator isPreFilled={profileData?.demographics?.profession}>
        <Text style={styles.label}>Profession</Text>
        <TextInput
          style={[
            styles.textInput,
            profileData?.demographics?.profession && styles.preFilledInput
          ]}
          value={lifestyle.profession}
          onChangeText={(text) => setLifestyle(prev => ({ ...prev, profession: text }))}
          placeholder="Your profession"
        />
      </PreFilledIndicator>
    </View>
  );

  const renderVitals = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Vital Parameters</Text>
      <Text style={styles.stepSubtitle}>Physical measurements and lab values</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Blood Pressure (mmHg) *</Text>
        <OptimizedTextInput
          style={styles.textInput}
          placeholder="e.g., 120/80"
          value={patientVitals.bloodPressure}
          onChangeText={(text) => setPatientVitals(prev => ({ ...prev, bloodPressure: text }))}
        />
      </View>

      {/* Weight and Height inputs */}
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Weight (kg) *</Text>
          <OptimizedTextInput
            style={styles.numberInput}
            placeholder="e.g., 70"
            value={patientVitals.weight}
            onChangeText={(text) => setPatientVitals(prev => ({ ...prev, weight: text }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Height (cm) *</Text>
          <OptimizedTextInput
            style={styles.numberInput}
            placeholder="e.g., 170"
            value={patientVitals.height}
            onChangeText={(text) => setPatientVitals(prev => ({ ...prev, height: text }))}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Auto-calculated BMI display */}
      {patientVitals.weight && patientVitals.height && (
        <View style={styles.bmiDisplay}>
          <Text style={styles.bmiLabel}>Calculated BMI:</Text>
          <Text style={styles.bmiValue}>{calculateBMI()}</Text>
          <Text style={styles.bmiCategory}>
            {(() => {
              const bmi = parseFloat(calculateBMI());
              if (bmi < 18.5) return '(Underweight)';
              if (bmi < 25) return '(Normal)';
              if (bmi < 30) return '(Overweight)';
              return '(Obese)';
            })()}
          </Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Total Cholesterol</Text>
          <OptimizedTextInput
            style={styles.numberInput}
            placeholder="mg/dL"
            value={patientVitals.cholesterol}
            onChangeText={(text) => setPatientVitals(prev => ({ ...prev, cholesterol: text }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>LDL Cholesterol</Text>
          <OptimizedTextInput
            style={styles.numberInput}
            placeholder="mg/dL"
            value={patientVitals.ldl}
            onChangeText={(text) => setPatientVitals(prev => ({ ...prev, ldl: text }))}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>HDL Cholesterol</Text>
          <OptimizedTextInput
            style={styles.numberInput}
            placeholder="mg/dL"
            value={patientVitals.hdl}
            onChangeText={(text) => setPatientVitals(prev => ({ ...prev, hdl: text }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>HbA1c (%)</Text>
          <OptimizedTextInput
            style={styles.numberInput}
            placeholder="e.g., 6.5"
            value={patientVitals.hba1c}
            onChangeText={(text) => setPatientVitals(prev => ({ ...prev, hba1c: text }))}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Updated pollution question instead of AQI */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Do you live in a polluted area?</Text>
        <Text style={styles.questionSubtext}>
          Consider factors like heavy traffic, industrial areas, poor air quality, or frequent smog
        </Text>
        <View style={styles.radioRow}>
          {['yes', 'no'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                patientVitals.pollutedArea === option && styles.radioOptionSelected
              ]}
              onPress={() => setPatientVitals(prev => ({ ...prev, pollutedArea: option }))}
            >
              <Text style={[
                styles.radioText,
                patientVitals.pollutedArea === option && styles.radioTextSelected
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderMedicalHistory = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Medical History</Text>
      <Text style={styles.stepSubtitle}>Current and past medical conditions</Text>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Do you have Hypertension?</Text>
        <View style={styles.radioRow}>
          {['yes', 'no'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                medicalHistory.hypertension === option && styles.radioOptionSelected
              ]}
              onPress={() => setMedicalHistory(prev => ({ ...prev, hypertension: option }))}
            >
              <Text style={[
                styles.radioText,
                medicalHistory.hypertension === option && styles.radioTextSelected
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Do you have Diabetes?</Text>
        <View style={styles.radioRow}>
          {['yes', 'no'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                medicalHistory.diabetes === option && styles.radioOptionSelected
              ]}
              onPress={() => setMedicalHistory(prev => ({ ...prev, diabetes: option }))}
            >
              <Text style={[
                styles.radioText,
                medicalHistory.diabetes === option && styles.radioTextSelected
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {medicalHistory.diabetes === 'yes' && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Random Blood Sugar (mg/dL)</Text>
          <OptimizedTextInput
            style={styles.numberInput}
            placeholder="Enter value"
            value={medicalHistory.rnddiabetes}
            onChangeText={(text) => setMedicalHistory(prev => ({ ...prev, rnddiabetes: text }))}
            keyboardType="numeric"
          />
        </View>
      )}

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Do you have irregular heartbeat (Atrial Fibrillation)?</Text>
        <View style={styles.radioRow}>
          {['yes', 'no'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                medicalHistory.irregularHeartbeat === option && styles.radioOptionSelected
              ]}
              onPress={() => setMedicalHistory(prev => ({ ...prev, irregularHeartbeat: option }))}
            >
              <Text style={[
                styles.radioText,
                medicalHistory.irregularHeartbeat === option && styles.radioTextSelected
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Family history of stroke or heart disease?</Text>
        <View style={styles.radioRow}>
          {['yes', 'no'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                medicalHistory.familyHistory === option && styles.radioOptionSelected
              ]}
              onPress={() => setMedicalHistory(prev => ({ ...prev, familyHistory: option }))}
            >
              <Text style={[
                styles.radioText,
                medicalHistory.familyHistory === option && styles.radioTextSelected
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* TIA History with info icon */}
      <View style={styles.questionContainer}>
        <View style={styles.labelWithInfo}>
          <Text style={styles.questionText}>History of TIA (mini-stroke)?</Text>
          <TouchableOpacity onPress={showTIAInfo} style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.radioRow}>
          {['yes', 'no'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                additionalFactors.tiaHistory === option && styles.radioOptionSelected
              ]}
              onPress={() => setAdditionalFactors(prev => ({ ...prev, tiaHistory: option }))}
            >
              <Text style={[
                styles.radioText,
                additionalFactors.tiaHistory === option && styles.radioTextSelected
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.checkboxSection}>
        <Text style={styles.questionText}>Past Medical Conditions (Check all that apply):</Text>
        {[
          { key: 'thyroidDisease', label: 'Thyroid Disease' },
          { key: 'heartDisease', label: 'Heart Disease' },
          { key: 'asthma', label: 'Asthma' },
          { key: 'migraine', label: 'Migraine' }
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
              pastConditions[condition.key] && styles.checkboxSelected
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
  );

  const renderLifestyle = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Lifestyle Factors</Text>
      <Text style={styles.stepSubtitle}>Daily habits and behaviors</Text>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Do you exercise regularly?</Text>
        <View style={styles.radioRow}>
          {['yes', 'no'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                lifestyle.exercise === option && styles.radioOptionSelected
              ]}
              onPress={() => setLifestyle(prev => ({ ...prev, exercise: option }))}
            >
              <Text style={[
                styles.radioText,
                lifestyle.exercise === option && styles.radioTextSelected
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {lifestyle.exercise === 'yes' && (
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Exercise Frequency</Text>
          <View style={styles.radioGroup}>
            {['Daily', '3-4 times/week', '1-2 times/week', 'Occasionally'].map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.radioOption,
                  lifestyle.exerciseFrequency === freq && styles.radioOptionSelected
                ]}
                onPress={() => setLifestyle(prev => ({ ...prev, exerciseFrequency: freq }))}
              >
                <Text style={[
                  styles.radioText,
                  lifestyle.exerciseFrequency === freq && styles.radioTextSelected
                ]}>
                  {freq}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Do you smoke or use tobacco?</Text>
        <View style={styles.radioRow}>
          {['yes', 'no'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                lifestyle.smoke === option && styles.radioOptionSelected
              ]}
              onPress={() => setLifestyle(prev => ({ ...prev, smoke: option }))}
            >
              <Text style={[
                styles.radioText,
                lifestyle.smoke === option && styles.radioTextSelected
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>Do you consume alcohol?</Text>
        <View style={styles.radioRow}>
          {['yes', 'no'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                lifestyle.alcohol === option && styles.radioOptionSelected
              ]}
              onPress={() => setLifestyle(prev => ({ ...prev, alcohol: option }))}
            >
              <Text style={[
                styles.radioText,
                lifestyle.alcohol === option && styles.radioTextSelected
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {lifestyle.alcohol === 'yes' && (
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Alcohol Frequency</Text>
          <View style={styles.radioGroup}>
            {[
              { key: 'occasionally', label: 'Occasionally' },
              { key: 'weekly', label: 'Weekly' },
              { key: 'daily', label: 'Daily' },
              { key: 'multiple-daily', label: 'Multiple times daily' }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.radioOption,
                  lifestyle.alcoholFrequency === option.key && styles.radioOptionSelected
                ]}
                onPress={() => setLifestyle(prev => ({ ...prev, alcoholFrequency: option.key }))}
              >
                <Text style={[
                  styles.radioText,
                  lifestyle.alcoholFrequency === option.key && styles.radioTextSelected
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
        <Text style={styles.questionText}>Do you experience high stress levels regularly?</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>No</Text>
          <Switch
            value={additionalFactors.highStress === 'yes'}
            onValueChange={(value) => 
              setAdditionalFactors(prev => ({ ...prev, highStress: value ? 'yes' : 'no' }))
            }
            trackColor={{ false: colors.border, true: colors.warning }}
            thumbColor={colors.white}
          />
          <Text style={styles.switchLabel}>Yes</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Average Sleep Hours per Night</Text>
        <OptimizedTextInput
          style={styles.numberInput}
          placeholder="e.g., 7"
          value={additionalFactors.sleepHours}
          onChangeText={(text) => setAdditionalFactors(prev => ({ ...prev, sleepHours: text }))}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderFemaleFactors = () => (
    gender === 'Female' && (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Female-Specific Factors</Text>
        <Text style={styles.stepSubtitle}>Additional risk factors for women</Text>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Do you use oral contraceptives?</Text>
          <View style={styles.radioRow}>
            {['yes', 'no'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.radioOption,
                  femaleFactors.contraceptives === option && styles.radioOptionSelected
                ]}
                onPress={() => setFemaleFactors(prev => ({ ...prev, contraceptives: option }))}
              >
                <Text style={[
                  styles.radioText,
                  femaleFactors.contraceptives === option && styles.radioTextSelected
                ]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Are you on hormone replacement therapy?</Text>
          <View style={styles.radioRow}>
            {['yes', 'no'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.radioOption,
                  femaleFactors.hormoneTherapy === option && styles.radioOptionSelected
                ]}
                onPress={() => setFemaleFactors(prev => ({ ...prev, hormoneTherapy: option }))}
              >
                <Text style={[
                  styles.radioText,
                  femaleFactors.hormoneTherapy === option && styles.radioTextSelected
                ]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>History of pregnancy-related hypertension?</Text>
          <View style={styles.radioRow}>
            {['yes', 'no'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.radioOption,
                  femaleFactors.pregnancyHypertension === option && styles.radioOptionSelected
                ]}
                onPress={() => setFemaleFactors(prev => ({ ...prev, pregnancyHypertension: option }))}
              >
                <Text style={[
                  styles.radioText,
                  femaleFactors.pregnancyHypertension === option && styles.radioTextSelected
                ]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
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
      <Text style={styles.stepTitle}>Current Symptoms</Text>
      <Text style={styles.stepSubtitle}>Check any symptoms you're currently experiencing</Text>

      <View style={styles.symptomsGrid}>
        {symptomOptions.map((symptom) => (
          <TouchableOpacity
            key={symptom}
            style={[
              styles.symptomItem,
              symptoms.includes(symptom) && styles.symptomItemSelected
            ]}
            onPress={() => toggleSymptom(symptom)}
          >
            <View style={[
              styles.symptomCheckbox,
              symptoms.includes(symptom) && styles.symptomCheckboxSelected
            ]}>
              {symptoms.includes(symptom) && (
                <Ionicons name="checkmark" size={16} color={colors.white} />
              )}
            </View>
            <Text style={[
              styles.symptomText,
              symptoms.includes(symptom) && styles.symptomTextSelected
            ]}>
              {symptom}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {symptoms.length > 0 && (
        <View style={styles.urgentWarning}>
          <Ionicons name="warning" size={24} color={colors.error} />
          <Text style={styles.urgentWarningText}>
            If you're experiencing these symptoms, please seek immediate medical attention and call emergency services.
          </Text>
        </View>
      )}
    </View>
  );

  const renderResults = () => (
    <View style={styles.resultsContainer}>
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>Your Stroke Risk Assessment</Text>
        <Text style={styles.scoreValue}>{results.riskScore}/21</Text>
        <View style={[
          styles.riskBadge,
          {
            backgroundColor: 
              results.riskCategory === 'Low' ? colors.success :
              results.riskCategory === 'Moderate' ? colors.warning :
              colors.error
          }
        ]}>
          <Text style={styles.riskBadgeText}>{results.riskCategory} Risk</Text>
        </View>
      </View>

      <View style={styles.recommendationCard}>
        <Text style={styles.recommendationTitle}>Recommendations</Text>
        <Text style={styles.recommendationText}>{results.recommendations}</Text>
        
        {results.urgentReferral && (
          <View style={styles.urgentReferral}>
            <MaterialIcons name="local-hospital" size={24} color={colors.error} />
            <Text style={styles.urgentReferralText}>
              Urgent medical consultation recommended. Please contact your healthcare provider immediately.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <Button
          title="Find Healthcare Provider"
          variant="primary"
          size="large"
          icon={<MaterialIcons name="local-hospital" size={20} color={colors.white} />}
          onPress={() => {
            Alert.alert(
              'Healthcare Providers',
              'We recommend consulting with a qualified healthcare provider for proper evaluation.',
              [{ text: 'OK' }]
            );
          }}
          style={styles.actionButton}
        />

        <Button
          title="View Stroke Symptoms"
          variant="outline"
          size="large"
          icon={<Ionicons name="warning-outline" size={20} color={colors.primary} />}
          onPress={() => navigation.navigate('BrainSymptoms')}
          style={styles.actionButton}
        />

        <Button
          title="Retake Assessment"
          variant="ghost"
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
        />
      </View>

      <View style={styles.disclaimerCard}>
        <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
        <Text style={styles.disclaimerText}>
          <Text style={styles.disclaimerTitle}>Medical Disclaimer: </Text>
          This assessment is based on established medical camp protocols and is for educational purposes only. 
          It does not replace professional medical diagnosis or treatment. Always consult healthcare providers for medical advice.
        </Text>
      </View>
    </View>
  );

  if (showResults) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <Header 
          title="Assessment Results" 
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.resultsContainer}>
            <Text style={styles.scoreTitle}>Your Stroke Risk Assessment</Text>
            
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>{results.riskScore}/21</Text>
              <View style={[styles.riskBadge, { backgroundColor: 
                results.riskCategory === 'Low' ? colors.success :
                results.riskCategory === 'Moderate' ? colors.warning : colors.error
              }]}>
                <Text style={styles.riskBadgeText}>{results.riskCategory} Risk</Text>
              </View>
            </View>

            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>Recommendations</Text>
              <Text style={styles.recommendationText}>{results.recommendations}</Text>
              
              {results.urgentReferral && (
                <View style={styles.urgentReferral}>
                  <Ionicons name="warning" size={20} color={colors.error} />
                  <Text style={styles.urgentReferralText}>
                    Urgent medical consultation recommended. Please contact your healthcare provider immediately.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actionButtons}>
              <Button
                title="Find Healthcare Providers"
                onPress={() => {
                  Alert.alert(
                    'Healthcare Providers',
                    'We recommend consulting with a qualified healthcare provider for proper evaluation.',
                    [{ text: 'OK' }]
                  );
                }}
                style={styles.actionButton}
              />
              
              <Button
                title="Check Brain Stroke Symptoms"
                onPress={() => navigation.navigate('BrainSymptoms')}
                style={styles.actionButton}
              />
              
              <Button
                title="Take New Assessment"
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
              />
            </View>

            <View style={styles.disclaimerCard}>
              <Ionicons name="information-circle" size={20} color={colors.warning} />
              <View>
                <Text style={styles.disclaimerTitle}>Medical Disclaimer:</Text>
                <Text style={styles.disclaimerText}>
                  This assessment is based on established medical camp protocols and is for educational purposes only.
                  It does not replace professional medical diagnosis or treatment. Always consult healthcare providers for medical advice.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <Header 
        title="Stroke Risk Assessment" 
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.headerSection}>
        <Text style={styles.mainTitle}>Comprehensive Stroke Risk Assessment</Text>
        <Text style={styles.subtitle}>Based on validated medical camp protocols used in health screenings</Text>
      </View>

      {renderStepIndicator()}
      {renderProfilePrompt()}
      

      <ScrollView style={styles.scrollView}>
        {currentStep === 1 && renderBasicInfo()}
        {currentStep === 2 && renderVitals()}
        {currentStep === 3 && renderMedicalHistory()}
        {currentStep === 4 && renderLifestyle()}
        {currentStep === 5 && (gender === 'Female' ? renderFemaleFactors() : renderSymptoms())}
        {currentStep === 6 && renderSymptoms()}
      </ScrollView>

      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <Button
            title="Previous"
            onPress={prevStep}
            style={styles.navButton}
            variant="outline"
          />
        )}
        
        <Button
          title={loading ? "Saving..." : (currentStep === totalSteps ? "Complete Assessment" : "Next")}
          onPress={nextStep}
          style={styles.navButton}
          disabled={loading}
          iconPosition="right"
        />
      </View>
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
  
  // // Pre-filled input styles
  // inputContainer: {
  //   marginBottom: 16,
  // },
  // inputHeader: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   marginBottom: 8,
  // },
  // preFilledBadge: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: `${colors.success}15`,
  //   paddingHorizontal: 8,
  //   paddingVertical: 4,
  //   borderRadius: 12,
  // },
  // preFilledText: {
  //   fontSize: 10,
  //   color: colors.success,
  //   marginLeft: 4,
  //   fontWeight: '500',
  // },
  // preFilledInput: {
  //   borderColor: colors.success,
  //   backgroundColor: `${colors.success}08`,
  // },
  
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
  
  inputContainer: {
    flex: 1,
    marginBottom: 16,
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