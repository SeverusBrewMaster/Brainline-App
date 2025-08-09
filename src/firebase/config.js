// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyCRnEWKEyJmFy6d6Qy0odJRDvVRWqgIHVg",
  authDomain: "brain-stroke-e42b1.firebaseapp.com",
  projectId: "brain-stroke-e42b1",
  storageBucket: "brain-stroke-e42b1.firebasestorage.app",
  messagingSenderId: "44670502149",
  appId: "1:44670502149:web:dbc5dcdf262dbe5bd5636c",
  measurementId: "G-JG69TSQZQW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth (simple version - no AsyncStorage needed)
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Debug Firebase initialization
console.log('🔥 Firebase Initialized:', {
  app: !!app,
  auth: !!auth,
  db: !!db,
  authCurrentUser: auth.currentUser
});

// Mobile app database collections (isolated from health camp data)
export const mobileAppDB = {
  // Main users collection for mobile app
  users: 'mobileAppUsers',
  
  // User-specific health data subcollection paths
  healthAssessments: (userId) => `mobileAppUsers/${userId}/healthAssessments`,
  healthMetrics: (userId) => `mobileAppUsers/${userId}/healthMetrics`,
  personalizedTips: (userId) => `mobileAppUsers/${userId}/personalizedTips`,
  reminders: (userId) => `mobileAppUsers/${userId}/reminders`,
  emergencyContacts: (userId) => `mobileAppUsers/${userId}/emergencyContacts`,
  symptoms: (userId) => `mobileAppUsers/${userId}/symptoms`,
  
  // Shared mobile app collections
  content: 'mobileAppContent',
  providers: 'mobileAppProviders'
};

// Export Firebase services
export { auth, db };
export default app;
