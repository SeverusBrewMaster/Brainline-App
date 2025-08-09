import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db, mobileAppDB } from '../firebase/config';

class MobileDashboardService {
  async getDashboardData(userId) {
    try {
      const [
        userProfile,
        latestAssessment,
        assessmentHistory, // FIX: Ensure this is called
        healthMetrics,
        personalizedTips,
        reminders
      ] = await Promise.all([
        this.getUserProfile(userId),
        this.getLatestAssessment(userId),
        this.getAssessmentHistory(userId, 10), // FIX: Add this method call
        this.getHealthMetricsTrend(userId, 30),
        this.getPersonalizedTips(userId),
        this.getUpcomingReminders(userId)
      ]);
      
      console.log('📊 Dashboard Service - Assessment History:', assessmentHistory);
      
      return {
        userProfile,
        latestAssessment,
        assessmentHistory, // FIX: Include in return
        healthMetrics,
        personalizedTips,
        reminders
      };
    } catch (error) {
      console.error('❌ Get Dashboard Data Error:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const docRef = doc(db, mobileAppDB.users, userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('❌ Get User Profile Error:', error);
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
      return !querySnapshot.empty ? {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      } : null;
    } catch (error) {
      console.error('❌ Get Latest Assessment Error:', error);
      throw error;
    }
  }

  // FIX: Add proper assessment history method
  async getAssessmentHistory(userId, limitCount = 10) {
    try {
      console.log('📊 Fetching assessment history for user:', userId);
      
      const q = query(
        collection(db, mobileAppDB.healthAssessments(userId)),
        orderBy('assessmentDate', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📊 Assessment History Retrieved:', history.length, 'assessments');
      return history;
    } catch (error) {
      console.error('❌ Get Assessment History Error:', error);
      return [];
    }
  }

  async getHealthMetricsTrend(userId, days = 30) {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      
      const q = query(
        collection(db, mobileAppDB.healthMetrics(userId)),
        where('createdAt', '>=', fromDate),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('❌ Get Health Metrics Trend Error:', error);
      return [];
    }
  }

  async getPersonalizedTips(userId, limitCount = 5) {
    try {
      const q = query(
        collection(db, mobileAppDB.personalizedTips(userId)),
        where('isActive', '==', true),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Get Personalized Tips Error:', error);
      return [];
    }
  }

  async getUpcomingReminders(userId, limitCount = 5) {
    try {
      const q = query(
        collection(db, mobileAppDB.reminders(userId)),
        orderBy('dateTime', 'asc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Get Upcoming Reminders Error:', error);
      return [];
    }
  }

  // FIX: Proper real-time listener that returns unsubscribe function
  subscribeToUserData(userId, callback) {
    try {
      const userDocRef = doc(db, mobileAppDB.users, userId);
      
      // Return the unsubscribe function directly from onSnapshot
      return onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          callback(doc.data());
        }
      }, (error) => {
        console.error('Real-time listener error:', error);
      });
    } catch (error) {
      console.error('Subscribe to user data error:', error);
      // Return a dummy function to prevent errors
      return () => {};
    }
  }
}

export default new MobileDashboardService();
