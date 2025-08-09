// firebase.js (or firebaseConfig.js)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these values with your actual Firebase project credentials
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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
