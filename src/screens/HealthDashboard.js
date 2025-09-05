import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
// Firebase imports
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import DashboardService from '../services/MobileDashboardService';
import Header from '../components/Header';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

const HealthDashboard = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  
  // State management
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        loadDashboardData(user.uid);
      } else {
        setLoading(false);
        navigation.navigate('Login');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // FIX: Listen for route params to refresh dashboard
  useEffect(() => {
    if (route?.params?.refresh && user) {
      console.log('🔄 Dashboard refresh triggered by route params');
      loadDashboardData(user.uid);
    }
  }, [route?.params?.refresh, user]);

  useEffect(() => {
    let unsubscribe;
    if (user) {
      // Set up real-time listener for user data updates
      try {
        unsubscribe = DashboardService.subscribeToUserData(user.uid, (userData) => {
          console.log('🔄 Real-time user data update:', userData);
          setDashboardData(prev => ({
            ...prev,
            userProfile: userData
          }));
        });
      } catch (error) {
        console.error('Error setting up real-time listener:', error);
      }
    }

    return () => {
      // FIX: Check if unsubscribe is actually a function before calling
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user]);

  const loadDashboardData = async (userId) => {
    try {
      setLoading(true);
      console.log('📊 Loading dashboard data for user:', userId);
      
      const data = await DashboardService.getDashboardData(userId);
      console.log('📊 Dashboard data loaded:', data);
      
      setDashboardData(data);
    } catch (error) {
      console.error('Dashboard load error:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    await loadDashboardData(user.uid);
    setRefreshing(false);
  };

  // FIX: Updated risk calculation with proper field names and debugging
  const calculateRiskScore = () => {
    console.log('🔍 Dashboard - calculating risk score...');
    console.log('🔍 Dashboard - dashboardData:', dashboardData);
    console.log('🔍 Dashboard - latestAssessment:', dashboardData?.latestAssessment);
    
    if (!dashboardData?.latestAssessment) {
      console.log('🔍 Dashboard - No latest assessment found');
      return 0;
    }
    
    const assessment = dashboardData.latestAssessment;
    console.log('🔍 Dashboard - assessment.results:', assessment.results);
    
    // FIX: Check for both riskScore and score (for backward compatibility)
    const riskScore = assessment.results?.riskScore || assessment.results?.score || 0;
    console.log('🔍 Dashboard - extracted risk score:', riskScore);
    
    return riskScore;
  };

  // FIX: Updated getRiskCategory with proper field names
  const getRiskCategory = (score) => {
    if (score <= 3) return { category: 'Low', color: colors.success, bgColor: `${colors.success}15` };
    if (score <= 7) return { category: 'Moderate', color: colors.warning, bgColor: `${colors.warning}15` };
    return { category: 'High', color: colors.error, bgColor: `${colors.error}15` };
  };

  // FIX: Updated personalized tips with proper data handling
  const getPersonalizedTips = () => {
    if (!dashboardData?.latestAssessment) return [];
    
    const tips = [];
    const assessment = dashboardData.latestAssessment;
    const factors = assessment.medicalHistory || {};
    const lifestyle = assessment.lifestyle || {};

    if (factors.hypertension) tips.push('Monitor blood pressure daily and limit sodium intake');
    if (factors.diabetes) tips.push('Check blood sugar regularly and maintain a balanced diet');
    if (lifestyle.exercise === false) tips.push('Aim for 150 minutes of moderate exercise per week');
    if (lifestyle.smoking) tips.push('Consider a smoking cessation program');

    return tips.slice(0, 3); // Show top 3 tips
  };

  // FIX: Helper function to safely format dates
  const formatAssessmentDate = (assessmentDate) => {
    try {
      if (assessmentDate && assessmentDate.toDate) {
        return assessmentDate.toDate().toLocaleDateString();
      } else if (assessmentDate instanceof Date) {
        return assessmentDate.toLocaleDateString();
      } else if (typeof assessmentDate === 'string') {
        return new Date(assessmentDate).toLocaleDateString();
      }
      return 'Unknown date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Authentication check
  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your health dashboard...</Text>
      </View>
    );
  }

  // No data state
  if (!dashboardData?.userProfile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Unable to load dashboard data</Text>
        <Button
          title="Retry"
          onPress={() => loadDashboardData(user.uid)}
        />
      </View>
    );
  }

  const userProfile = dashboardData.userProfile;
  const latestAssessment = dashboardData.latestAssessment;
  const riskScore = latestAssessment ? calculateRiskScore() : 0;
  const risk = getRiskCategory(riskScore);
  const personalizedTips = getPersonalizedTips();

  // FIX: Updated console logging for debugging
  console.log('🔍 Dashboard - Final display values:', {
    riskScore,
    riskCategory: risk.category,
    latestAssessmentExists: !!latestAssessment,
    userProfileExists: !!userProfile,
    latestAssessmentDate: latestAssessment?.assessmentDate,
    assessmentHistoryCount: dashboardData?.assessmentHistory?.length || 0
  });

  // FIX: Updated risk trend calculation with proper data handling
  const getRiskTrend = () => {
    console.log('📊 Dashboard - Getting risk trend...');
    console.log('📊 Dashboard - Assessment history:', dashboardData?.assessmentHistory);
    
    if (!dashboardData?.assessmentHistory || dashboardData.assessmentHistory.length === 0) {
      console.log('📊 Dashboard - No assessment history, using current score only');
      return [riskScore]; // Current score only
    }
    
    // Extract risk scores from assessment history (chronologically)
    const scores = dashboardData.assessmentHistory
      .map(assessment => {
        const score = assessment.results?.riskScore || assessment.results?.score || 0;
        console.log('📊 Assessment score extracted:', score, 'from:', assessment.results);
        return score;
      })
      .reverse(); // Show chronologically (oldest to newest)
    
    console.log('📊 Dashboard - Final risk trend scores:', scores);
    return scores;
  };

  // FIX: Assessment History Component
  const renderAssessmentHistory = () => {
    if (!dashboardData?.assessmentHistory || dashboardData.assessmentHistory.length <= 1) {
      return null; // Don't show if only one or no assessments
    }

    return (
      <View style={styles.assessmentHistorySection}>
        <Text style={styles.sectionTitle}>Assessment History</Text>
        <View style={styles.assessmentHistoryCard}>
          {dashboardData.assessmentHistory.slice(0, 5).map((assessment, index) => {
            const score = assessment.results?.riskScore || assessment.results?.score || 0;
            const category = assessment.results?.riskCategory || assessment.results?.category || 'Unknown';
            const date = formatAssessmentDate(assessment.assessmentDate);
            const risk = getRiskCategory(score);
            
            return (
              <View key={assessment.id || index} style={styles.assessmentHistoryItem}>
                <View style={styles.assessmentHistoryLeft}>
                  <View style={[styles.assessmentScoreBadge, { backgroundColor: risk.color }]}>
                    <Text style={styles.assessmentScoreText}>{score}</Text>
                  </View>
                  <View style={styles.assessmentHistoryInfo}>
                    <Text style={styles.assessmentHistoryCategory}>{category} Risk</Text>
                    <Text style={styles.assessmentHistoryDate}>{date}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.viewAssessmentButton}
                  onPress={() => Alert.alert('Assessment Details', `Risk Score: ${score}\nCategory: ${category}\nDate: ${date}`)}
                >
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            );
          })}
          
          {dashboardData.assessmentHistory.length > 5 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => Alert.alert('Assessment History', 'Full history view coming soon!')}
            >
              <Text style={styles.viewAllText}>View All {dashboardData.assessmentHistory.length} Assessments</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const riskTrend = getRiskTrend();

  // FIX: Enhanced trend chart component
  const renderTrendChart = (riskTrend) => {
    if (riskTrend.length <= 1) {
      return (
        <View style={styles.trendContainer}>
          <Text style={styles.trendTitle}>Risk Trend</Text>
          <View style={styles.noTrendData}>
            <Text style={styles.noTrendText}>Take more assessments to see your risk trend</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.trendContainer}>
        <Text style={styles.trendTitle}>Risk Trend (Last {riskTrend.length} Assessments)</Text>
        <View style={styles.trendChart}>
          {riskTrend.map((score, index) => {
            const height = Math.max((score / 21) * 100, 5);
            const color = score <= 3 ? colors.success : score <= 7 ? colors.warning : colors.error;
            
            return (
              <View key={index} style={styles.trendBar}>
                <View 
                  style={[
                    styles.trendBarFill, 
                    { 
                      height: `${height}%`,
                      backgroundColor: color
                    }
                  ]} 
                />
                <Text style={styles.trendValue}>{score}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Enhanced metric card with real data
  const renderEnhancedMetricCard = (title, value, icon, status, trend) => (
    <TouchableOpacity
      key={title}
      style={styles.metricCard}
      onPress={() => Alert.alert(title, `Current value: ${value}\nStatus: ${status}`)}
    >
      <View style={styles.metricHeader}>
        <View>
          <Text style={styles.metricTitle}>{title}</Text>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={[styles.metricStatus, { 
            color: status === 'Normal' ? colors.success : colors.warning 
          }]}>
            {status}
          </Text>
        </View>
        {trend && (
          <Ionicons 
            name={trend === 'up' ? 'trending-up' : 'trending-down'} 
            size={20} 
            color={trend === 'up' ? colors.error : colors.success} 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  // Risk factor with action button using real data
  const renderActionableRiskFactor = (title, isRisk, icon, actionText) => (
    <View key={title} style={styles.riskFactorItem}>
      <Ionicons name={icon} size={20} color={isRisk ? colors.error : colors.success} />
      <Text style={styles.riskFactorText}>{title}</Text>
      {isRisk && (
        <TouchableOpacity 
          style={styles.actionChip}
          onPress={() => Alert.alert('Action Required', `${actionText} for ${title}`)}
        >
          <Text style={styles.actionChipText}>Action</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const handleExportReport = () => {
    Alert.alert(
      'Export Health Report',
      'Your comprehensive health report will be generated and shared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export PDF',
          onPress: () => Alert.alert('Success', 'Health report exported successfully!')
        },
        {
          text: 'Share',
          onPress: () => Alert.alert('Shared', 'Health report shared with your healthcare provider!')
        }
      ]
    );
  };

  const handleScheduleFollowup = () => {
    Alert.alert(
      'Schedule Follow-up',
      'Choose your preferred follow-up option:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Video Consultation',
          onPress: () => Alert.alert('Scheduled', 'Video consultation scheduled!')
        },
        {
          text: 'In-person Visit',
          onPress: () => Alert.alert('Scheduled', 'In-person appointment scheduled!')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Fixed Header with proper spacing */}
      <View style={styles.headerContainer}>
        <Header 
          navigation={navigation} 
          title="Health Dashboard" 
          currentScreen="User"
          rightIcon="refresh"
        onRightPress={handleRefresh}
        />
      </View>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        
        {/* Welcome Section with Real User Data */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {userProfile.profile?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </Text>
            </View>
            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeTitle}>
                Welcome back, {userProfile.profile?.name?.split(' ')[0] || 'User'}!
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Last assessment: {latestAssessment 
                  ? formatAssessmentDate(latestAssessment.assessmentDate)
                  : 'No assessments yet'
                }
              </Text>
            </View>
          
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="person-outline" size={24} color={colors.textSecondary} 
              onPress={() => navigation.navigate('UserProfile')}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Risk Score Section with Real Data */}
        <View style={styles.riskSection}>
          <Text style={styles.sectionTitle}>Current Risk Assessment</Text>
          <View style={[styles.riskCard, { borderColor: risk.color }]}>
            <View style={styles.riskScoreContainer}>
              <View style={[styles.riskScoreCircle, { backgroundColor: risk.color }]}>
                <Text style={styles.riskScoreValue}>{riskScore}</Text>
                <Text style={styles.riskScoreMax}>/21</Text>
              </View>
              <View style={styles.riskInfo}>
                <Text style={[styles.riskCategory, { color: risk.color }]}>
                  {risk.category} Risk
                </Text>
                <Text style={styles.riskDescription}>
                  {risk.category === 'Low' ? 'Keep up the great work!' :
                   risk.category === 'Moderate' ? 'Some lifestyle changes needed' :
                   'Immediate medical attention recommended'}
                </Text>
              </View>
            </View>

            {/* FIX: Enhanced Risk Trend Chart */}
            {renderTrendChart(riskTrend)}

            <TouchableOpacity
              style={[styles.quickAssessmentCard, { backgroundColor: risk.bgColor }]}
              onPress={() => navigation.navigate('Riskometer')}
            >
              <Text style={[styles.quickActionText, { color: risk.color }]}>
                Take New Assessment
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FIX: Add Assessment History Section */}
        {renderAssessmentHistory()}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Riskometer')}
            >
              <Ionicons name="analytics-outline" size={32} color={colors.primary} />
              <Text style={styles.quickActionText}>New Assessment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('BrainSymptoms')}
            >
              <Ionicons name="pulse-outline" size={32} color={colors.secondary} />
              <Text style={styles.quickActionText}>Check Symptoms</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Podcast')}
            >
              <Ionicons name="headset-outline" size={32} color={colors.warning} />
              <Text style={styles.quickActionText}>Health Podcasts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => Alert.alert('Emergency', 'Call emergency services?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call 911', onPress: () => Alert.alert('Calling...') }
              ])}
            >
              <Ionicons name="warning-outline" size={32} color={colors.error} />
              <Text style={styles.quickActionText}>Emergency</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Metrics with Real Data */}
        {latestAssessment && (
          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>Health Metrics</Text>
            <View style={styles.metricsGrid}>
              {renderEnhancedMetricCard(
                'BMI',
                latestAssessment.vitals?.bmi?.toFixed(1) || 'N/A',
                'body-outline',
                latestAssessment.vitals?.bmi > 25 ? 'High' : 'Normal',
                null
              )}
              {renderEnhancedMetricCard(
                'Blood Pressure',
                `${latestAssessment.vitals?.systolic || 'N/A'}/${latestAssessment.vitals?.diastolic || 'N/A'}`,
                'heart-outline',
                latestAssessment.vitals?.systolic > 140 ? 'High' : 'Normal',
                null
              )}
            </View>
          </View>
        )}

        {/* Personalized Tips with Real Data */}
        {personalizedTips.length > 0 && (
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>Personalized Health Tips</Text>
            {personalizedTips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <Ionicons name="bulb-outline" size={20} color={colors.secondary} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Risk Factors with Real Data */}
        {latestAssessment && (
          <View style={styles.riskFactorsSection}>
            <Text style={styles.sectionTitle}>Risk Factors</Text>
            <View style={styles.riskFactorsCard}>
              {renderActionableRiskFactor(
                'High Blood Pressure', 
                latestAssessment.medicalHistory?.hypertension, 
                'fitness', 
                'Monitor daily BP'
              )}
              {renderActionableRiskFactor(
                'Diabetes', 
                latestAssessment.medicalHistory?.diabetes, 
                'medical', 
                'Check blood sugar'
              )}
              {renderActionableRiskFactor(
                'Sedentary Lifestyle', 
                !latestAssessment.lifestyle?.exercise, 
                'walk', 
                'Start exercise plan'
              )}
              {renderActionableRiskFactor(
                'Family History', 
                latestAssessment.medicalHistory?.familyHistory, 
                'people', 
                'Regular screening'
              )}
              {renderActionableRiskFactor(
                'Smoking', 
                latestAssessment.lifestyle?.smoking, 
                'ban', 
                'Cessation program'
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsSection}>
          <Button
            title="Export Health Report"
            onPress={handleExportReport}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Health app color scheme
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

// Complete StyleSheet with all components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    fontSize: 22,
    color: colors.textSecondary,
    marginTop: 16,
  },
  errorText: {
    fontSize: 22,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  // Welcome Section
  welcomeCard: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  // Risk Section
  riskSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  riskCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  riskScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  riskScoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  riskScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  riskScoreMax: {
    fontSize: 18,
    color: colors.white,
    marginTop: -4,
  },
  riskInfo: {
    flex: 1,
  },
  riskCategory: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  riskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Trend Chart
  trendContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  trendTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 80,
    alignItems: 'flex-end',
  },
  trendBar: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    height: 90,
    justifyContent: 'flex-end',
  },
  trendBarFill: {
    width: '100%',
    borderRadius: 2,
    minHeight: 4,
  },
  trendValue: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 4,
  },
  // FIX: New Trend Chart Styles
  noTrendData: {
    padding: 20,
    alignItems: 'center',
  },
  noTrendText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  trendIndex: {
    fontSize: 8,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trendLegend: {
    marginTop: 8,
    alignItems: 'center',
  },
  trendLegendText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  // FIX: Assessment History Styles
  assessmentHistorySection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  assessmentHistoryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assessmentHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  assessmentHistoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assessmentScoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assessmentScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  assessmentHistoryInfo: {
    flex: 1,
  },
  assessmentHistoryCategory: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  assessmentHistoryDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  viewAssessmentButton: {
    padding: 8,
  },
  viewAllButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  // Quick Actions
  quickActionsSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: (width - 60) / 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAssessmentCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: (width - 60) / 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Metrics Section
  metricsSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metricStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Tips Section
  tipsSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  tipCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  tipText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  // Risk Factors Section
  riskFactorsSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  riskFactorsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  riskFactorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskFactorText: {
    fontSize: 18,
    color: colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  actionChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionChipText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '500',
  },
  // Action Buttons
  actionButtonsSection: {
    marginTop: 24,
    marginHorizontal: 20,
    marginBottom: 40,
  },
  actionButton: {
    marginBottom: 12,
  },
});

export default HealthDashboard;
