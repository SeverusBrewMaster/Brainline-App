import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp, 
  arrayUnion 
} from 'firebase/firestore';
import { auth } from '../firebase/config';

const db = getFirestore();

// ✅ SIMPLIFIED: Health Camps - No status tags, just simple array
const listHealthCamps = async () => {
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
        });
    }
    return [];
  } catch (error) {
    console.error('Error listing health camps:', error);
    throw error;
  }
};

const addHealthCamp = async (camp) => {
  // Simple camp data without status
  const campData = {
    id: `camp_${Date.now()}`, 
    title: camp.title,
    date: camp.date,
    location: camp.location,
    description: camp.description,
    createdAt: new Date().toISOString(),
    createdBy: auth.currentUser?.uid || 'system',
  };

  try {
    const ref = doc(db, 'adminConfig', 'healthCamps');
    
    await updateDoc(ref, {
      camps: arrayUnion(campData),
      lastUpdated: serverTimestamp(),
    });
    
    console.log('✅ Health camp added successfully');
    return { id: campData.id };
  } catch (error) {
    if (error.code === 'not-found') {
      const ref = doc(db, 'adminConfig', 'healthCamps');
      await setDoc(ref, {
        camps: [campData],
        lastUpdated: serverTimestamp(),
      });
      console.log('✅ Health camp document created and camp added');
      return { id: campData.id };
    }
    
    console.error('❌ Error adding health camp:', error);
    throw error;
  }
};

const updateHealthCamp = async (id, campUpdate) => {
  try {
    const camps = await listHealthCamps();
    
    const updatedCamps = camps.map(camp => {
      if (camp.id === id) {
        return {
          ...camp,
          title: campUpdate.title,
          date: campUpdate.date,
          location: campUpdate.location,
          description: campUpdate.description,
          updatedAt: new Date().toISOString(),
          updatedBy: auth.currentUser?.uid || 'system',
        };
      }
      return camp;
    });
    
    const ref = doc(db, 'adminConfig', 'healthCamps');
    await updateDoc(ref, {
      camps: updatedCamps,
      lastUpdated: serverTimestamp(),
    });
    
    console.log('✅ Health camp updated successfully');
  } catch (error) {
    console.error('❌ Error updating health camp:', error);
    throw error;
  }
};

const deleteHealthCamp = async (id) => {
  try {
    const camps = await listHealthCamps();
    const updatedCamps = camps.filter(camp => camp.id !== id);
    
    const ref = doc(db, 'adminConfig', 'healthCamps');
    await updateDoc(ref, {
      camps: updatedCamps,
      lastUpdated: serverTimestamp(),
    });
    
    console.log('✅ Health camp deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting health camp:', error);
    throw error;
  }
};

// Keep existing hospital functions...
const listHospitals = async () => {
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
    console.error('Error listing hospitals:', error);
    throw error;
  }
};

const addHospital = async (hospital) => {
  const hospitalData = {
    id: `hospital_${Date.now()}`, 
    name: hospital.name,
    phone: hospital.phone,
    address: hospital.address,
    location: {
      latitude: Number(hospital.latitude),
      longitude: Number(hospital.longitude),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: auth.currentUser?.uid || 'system',
  };

  try {
    const ref = doc(db, 'adminConfig', 'hospital');
    
    await updateDoc(ref, {
      hospitals: arrayUnion(hospitalData),
      lastUpdated: serverTimestamp(),
    });
    
    console.log('✅ Hospital added successfully');
    return { id: hospitalData.id };
  } catch (error) {
    if (error.code === 'not-found') {
      const ref = doc(db, 'adminConfig', 'hospital');
      await setDoc(ref, {
        hospitals: [hospitalData],
        lastUpdated: serverTimestamp(),
      });
      console.log('✅ Hospital document created and hospital added');
      return { id: hospitalData.id };
    }
    
    console.error('❌ Error adding hospital:', error);
    throw error;
  }
};

const updateHospital = async (id, hospitalUpdate) => {
  try {
    const hospitals = await listHospitals();
    
    const updatedHospitals = hospitals.map(hospital => {
      if (hospital.id === id) {
        return {
          ...hospital,
          name: hospitalUpdate.name,
          phone: hospitalUpdate.phone,
          address: hospitalUpdate.address,
          location: {
            latitude: Number(hospitalUpdate.latitude),
            longitude: Number(hospitalUpdate.longitude),
          },
          updatedAt: new Date().toISOString(),
          updatedBy: auth.currentUser?.uid || 'system',
        };
      }
      return hospital;
    });
    
    const ref = doc(db, 'adminConfig', 'hospital');
    await updateDoc(ref, {
      hospitals: updatedHospitals,
      lastUpdated: serverTimestamp(),
    });
    
    console.log('✅ Hospital updated successfully');
  } catch (error) {
    console.error('❌ Error updating hospital:', error);
    throw error;
  }
};

const deleteHospital = async (id) => {
  try {
    const hospitals = await listHospitals();
    const updatedHospitals = hospitals.filter(hospital => hospital.id !== id);
    
    const ref = doc(db, 'adminConfig', 'hospital');
    await updateDoc(ref, {
      hospitals: updatedHospitals,
      lastUpdated: serverTimestamp(),
    });
    
    console.log('✅ Hospital deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting hospital:', error);
    throw error;
  }
};

// Keep existing announcement functions...
const listAnnouncements = async () => {
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
        });
    }
    return [];
  } catch (error) {
    console.error('Error listing announcements:', error);
    throw error;
  }
};

const addAnnouncement = async ({ title, message, audience = 'all' }) => {
  const announcementData = {
    id: `announcement_${Date.now()}`, 
    title,
    message,
    audience,
    createdAt: new Date().toISOString(),
    createdBy: auth.currentUser?.uid || 'system',
    createdByEmail: auth.currentUser?.email || 'unknown',
  };

  try {
    const ref = doc(db, 'adminConfig', 'announcement');
    
    await updateDoc(ref, {
      announcements: arrayUnion(announcementData),
      lastUpdated: serverTimestamp(),
    });
    
    console.log('✅ Announcement added successfully');
    return { id: announcementData.id };
  } catch (error) {
    if (error.code === 'not-found') {
      const ref = doc(db, 'adminConfig', 'announcement');
      await setDoc(ref, {
        announcements: [announcementData],
        lastUpdated: serverTimestamp(),
      });
      console.log('✅ Announcement document created and announcement added');
      return { id: announcementData.id };
    }
    
    console.error('❌ Error adding announcement:', error);
    throw error;
  }
};

const deleteAnnouncement = async (id) => {
  try {
    const announcements = await listAnnouncements();
    const updatedAnnouncements = announcements.filter(announcement => announcement.id !== id);
    
    const ref = doc(db, 'adminConfig', 'announcement');
    await updateDoc(ref, {
      announcements: updatedAnnouncements,
      lastUpdated: serverTimestamp(),
    });
    
    console.log('✅ Announcement deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting announcement:', error);
    throw error;
  }
};

export default {
  // Simplified Health Camps
  listHealthCamps,
  addHealthCamp,
  updateHealthCamp,
  deleteHealthCamp,
  // Keep existing exports
  listHospitals,
  addHospital,
  updateHospital,
  deleteHospital,
  listAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
};
