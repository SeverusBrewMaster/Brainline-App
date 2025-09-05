// src/services/AppDataService.js
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

// ✅ UPDATED: Get recent health camps for HomeScreen
export async function getHealthCamps(limitCount = 3) {
  try {
    const ref = doc(db, 'adminConfig', 'healthCamps');
    const snap = await getDoc(ref);
    
    if (snap.exists() && snap.data().camps) {
      return snap.data().camps
        .map((camp, index) => ({
          id: camp.id || `camp_${index}`,
          ...camp
        }))
        .sort((a, b) => {
          // Sort by date descending (newest first)
          if (a.date && b.date) {
            return new Date(b.date) - new Date(a.date);
          }
          return 0;
        })
        .slice(0, limitCount); // Limit number of camps to show
    }
    return [];
  } catch (error) {
    console.error('Error getting health camps:', error);
    return [];
  }
}

// ✅ UPDATED: Get the most recent camp for featured display
export async function getNextCamp() {
  try {
    const camps = await getHealthCamps(1);
    return camps.length > 0 ? camps[0] : null;
  } catch (error) {
    console.error('Error getting next camp:', error);
    return null;
  }
}

export async function getHospitals() {
  try {
    const ref = doc(db, 'adminConfig', 'hospital');
    const snap = await getDoc(ref);
    
    if (snap.exists() && snap.data().hospitals) {
      return snap.data().hospitals.map((hospital, index) => ({
        id: hospital.id || `hospital_${index}`,
        ...hospital
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting hospitals:', error);
    return [];
  }
}

export async function getAnnouncements(limitCount = 10) {
  try {
    const ref = doc(db, 'adminConfig', 'announcement');
    const snap = await getDoc(ref);
    
    if (snap.exists() && snap.data().announcements) {
      return snap.data().announcements
        .map((announcement, index) => ({
          id: announcement.id || `announcement_${index}`,
          ...announcement
        }))
        .sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return 0;
        })
        .slice(0, limitCount);
    }
    return [];
  } catch (error) {
    console.error('Error getting announcements:', error);
    return [];
  }
}

export async function getUserProfile(uid) {
  if (!uid) return null;
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
