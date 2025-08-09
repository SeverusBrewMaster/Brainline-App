import { addDoc, collection, query, orderBy, limit, getDocs, doc } from 'firebase/firestore';
import { db, mobileAppDB } from '../firebase/config';
import UserService from './UserService';

class HealthAssessmentService {
  async saveHealthAssessment(userId, assessmentData) {
    try {
      const assessment = {
        ...assessmentData,
        userId,
        assessmentDate: new Date(),
        createdAt: new Date()
      };

      const docRef = await addDoc(
        collection(db, mobileAppDB.healthAssessments(userId)), 
        assessment
      );

      // FIX: Check if results exist and have valid values
      if (assessmentData.results && typeof assessmentData.results.riskScore === 'number') {
        await UserService.updateCurrentHealth(userId, {
          riskScore: assessmentData.results.riskScore,
          riskCategory: assessmentData.results.riskCategory || 'Unknown'
        });
      } else {
        console.warn('⚠️ Assessment results missing or invalid:', assessmentData.results);
      }

      return docRef.id;
    } catch (error) {
      console.error('Error saving assessment:', error);
      throw error;
    }
  }

  async getLatestAssessment(userId) {
    try {
      const q = query(
        collection(db, mobileAppDB.healthAssessments(userId)), // Use helper
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
      console.error('Error fetching latest assessment:', error);
      return null;
    }
  }

  async getAssessmentHistory(userId, limitCount = 10) {
    try {
      const q = query(
        collection(db, mobileAppDB.healthAssessments(userId)), // Use helper
        orderBy('assessmentDate', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching assessment history:', error);
      return [];
    }
  }
}

export default new HealthAssessmentService();
