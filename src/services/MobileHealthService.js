// src/services/MobileHealthService.js
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db, mobileAppDB } from '../firebase/config';

class MobileHealthService {
  async saveAssessment(userId, assessmentData) {
    try {
      // Create assessment document
      const assessmentRef = doc(collection(db, mobileAppDB.healthAssessments(userId)));
      
      const assessment = {
        ...assessmentData,
        assessmentId: assessmentRef.id,
        userId,
        assessmentDate: serverTimestamp(),
        source: 'mobile_app'
      };
      
      // Save assessment to user's subcollection
      await setDoc(assessmentRef, assessment);
      
      // Update user's current health summary
      await updateDoc(doc(db, mobileAppDB.users, userId), {
        'currentHealth.latestRiskScore': assessmentData.results?.riskScore || 0,
        'currentHealth.riskCategory': assessmentData.results?.riskCategory || 'Unknown',
        'currentHealth.lastAssessmentDate': serverTimestamp(),
        'currentHealth.totalAssessments': increment(1)
      });
      
      // Save health metrics for trending
      await this.saveHealthMetrics(userId, {
        date: new Date().toISOString().split('T')[0],
        weight: assessmentData.vitals?.weight,
        bmi: assessmentData.vitals?.bmi,
        systolicBP: assessmentData.vitals?.systolic,
        diastolicBP: assessmentData.vitals?.diastolic,
        riskScore: assessmentData.results?.riskScore,
        source: 'assessment'
      });
      
      // Generate personalized tips
      await this.generatePersonalizedTips(userId, assessmentData);
      
      console.log('✅ Assessment saved:', assessmentRef.id);
      return assessmentRef.id;
    } catch (error) {
      console.error('❌ Save Assessment Error:', error);
      throw error;
    }
  }

  async getLatestAssessment(userId) {
    try {
      const q = query(
        collection(db, mobileAppDB.healthAssessments(userId)),
        orderBy('assessmentDate', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Get Latest Assessment Error:', error);
      throw error;
    }
  }

  async getAssessmentHistory(userId, limitCount = 10) {
    try {
      const q = query(
        collection(db, mobileAppDB.healthAssessments(userId)),
        orderBy('assessmentDate', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Get Assessment History Error:', error);
      throw error;
    }
  }

  async saveHealthMetrics(userId, metricsData) {
    try {
      const metricsRef = doc(db, mobileAppDB.healthMetrics(userId), metricsData.date);
      await setDoc(metricsRef, {
        ...metricsData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Save Health Metrics Error:', error);
      throw error;
    }
  }

  async generatePersonalizedTips(userId, assessmentData) {
    try {
      const tips = [];
      const riskFactors = assessmentData.medicalHistory || {};
      const lifestyle = assessmentData.lifestyle || {};
      
      // Generate tips based on risk factors
      if (riskFactors.hypertension) {
        tips.push({
          category: 'monitoring',
          title: 'Blood Pressure Monitoring',
          text: 'Monitor your blood pressure daily and maintain a log to share with your doctor.',
          priority: 'high',
          basedOnFactors: ['hypertension']
        });
      }
      
      if (riskFactors.diabetes) {
        tips.push({
          category: 'diet',
          title: 'Blood Sugar Management',
          text: 'Check blood sugar regularly and follow a balanced, low-glycemic diet.',
          priority: 'high',
          basedOnFactors: ['diabetes']
        });
      }
      
      if (lifestyle.sedentaryLifestyle) {
        tips.push({
          category: 'exercise',
          title: 'Daily Physical Activity',
          text: 'Aim for 150 minutes of moderate exercise per week, starting with 30-minute daily walks.',
          priority: 'medium',
          basedOnFactors: ['sedentaryLifestyle']
        });
      }
      
      // Save tips to user's subcollection
      for (const tip of tips) {
        const tipRef = doc(collection(db, mobileAppDB.personalizedTips(userId)));
        await setDoc(tipRef, {
          ...tip,
          isActive: true,
          createdDate: serverTimestamp(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          completed: false
        });
      }
      
      console.log('✅ Generated', tips.length, 'personalized tips');
    } catch (error) {
      console.error('❌ Generate Tips Error:', error);
      throw error;
    }
  }
}

export default new MobileHealthService();
