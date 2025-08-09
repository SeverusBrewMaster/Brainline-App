import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, mobileAppDB } from '../firebase/config';

class UserService {
  async createUserProfile(userId, userData) {
    try {
      await setDoc(doc(db, mobileAppDB.users, userId), {
        profile: {
          name: userData.name,
          age: userData.age,
          gender: userData.gender,
          memberSince: new Date(),
          lastActive: new Date(),
          profileCompleted: false // Initially false until user completes profile
        },
        currentHealth: {
          latestRiskScore: 0,
          riskCategory: 'Unknown'
        },
        settings: {
          notifications: true,
          autoFillFromProfile: true, // New setting
          preferences: {
            language: 'en',
            theme: 'light',
            reminderFrequency: 'daily'
          }
        }
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const docRef = doc(db, mobileAppDB.users, userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Enhanced profile update method
  async updateUserProfile(userId, profileData) {
    try {
      await updateDoc(doc(db, mobileAppDB.users, userId), {
        profile: {
          ...profileData,
          lastActive: new Date()
        }
      });
      console.log('✅ User profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async updateCurrentHealth(userId, healthData) {
    try {
      const updateData = {};
      
      if (typeof healthData.riskScore === 'number') {
        updateData['currentHealth.latestRiskScore'] = healthData.riskScore;
      }
      
      if (healthData.riskCategory && typeof healthData.riskCategory === 'string') {
        updateData['currentHealth.riskCategory'] = healthData.riskCategory;
      }
      
      updateData['currentHealth.lastAssessmentDate'] = new Date();

      if (Object.keys(updateData).length > 1) {
        await updateDoc(doc(db, mobileAppDB.users, userId), updateData);
        console.log('✅ Health data updated successfully');
      }
    } catch (error) {
      console.error('Error updating health data:', error);
      throw error;
    }
  }

  // Get profile data for pre-filling assessments
  async getProfileForAssessment(userId) {
    try {
      const profile = await this.getUserProfile(userId);
      
      if (!profile?.profile) {
        return null;
      }

      // Return only the data needed for pre-filling assessments
      return {
        demographics: {
          age: profile.profile.age,
          gender: profile.profile.gender,
          education: profile.profile.education,
          profession: profile.profile.profession
        },
        physicalInfo: {
          height: profile.profile.physicalInfo?.height
        },
        medicalHistory: profile.profile.chronicConditions || {},
        familyHistory: profile.profile.familyHistory || {},
        profileCompleted: profile.profile.profileCompleted || false
      };
    } catch (error) {
      console.error('Error getting profile for assessment:', error);
      return null;
    }
  }
}

export default new UserService();
