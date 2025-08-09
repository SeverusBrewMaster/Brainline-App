// src/services/AuthService.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, mobileAppDB } from '../firebase/config';

class AuthService {
  async signUp(email, password, userData) {
    try {
      console.log('🔥 Starting signup process...');
      
      // Enhanced input validation
      if (!email || !password || !userData) {
        throw new Error('Missing required signup data');
      }

      if (!userData.name) {
        throw new Error('User name is required');
      }
      
      console.log('📝 Creating user with email:', email);
      
      // ✅ Create Firebase user account - returns UserCredential
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // ✅ Extract user from UserCredential object (this was the main fix)
      const user = userCredential.user;
      
      console.log('✅ UserCredential received:', {
        hasUser: !!user,
        userUID: user?.uid,
        userEmail: user?.email
      });
      
      // Validate user object
      if (!user || !user.uid) {
        throw new Error('Failed to create user - no user data received');
      }
      
      // ✅ Use email parameter as fallback (guaranteed to exist)
      const safeEmail = user.email || email;
      
      console.log('📧 Using email for profile:', safeEmail);
      console.log('🆔 User UID:', user.uid);
      
      // Create user profile document in Firestore
      const userProfileData = {
        email: safeEmail,
        profile: {
          name: userData.name || 'Unknown User',
          age: userData.age || 0,
          gender: userData.gender || 'Not specified',
          memberSince: serverTimestamp(),
          lastActive: serverTimestamp()
        },
        currentHealth: {
          latestRiskScore: 0,
          riskCategory: 'Unknown',
          totalAssessments: 0
        },
        settings: {
          notifications: true,
          reminderFrequency: 'daily',
          dataSharing: false
        }
      };
      
      console.log('💾 Saving user profile to Firestore...');
      
      // Save to Firestore with enhanced error handling
      await setDoc(doc(db, mobileAppDB.users, user.uid), userProfileData);
      
      console.log('✅ User profile created successfully');
      
      // ✅ Return the Firebase user object (not custom object)
      return user;
      
    } catch (error) {
      console.error('❌ SignUp Error Details:', {
        errorCode: error.code,
        errorMessage: error.message,
        inputEmail: email,
        hasUserData: !!userData
      });
      
      throw this.handleAuthError(error);
    }
  }

  async signIn(email, password) {
    try {
      console.log('🔥 Starting signin...');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (!user || !user.uid) {
        throw new Error('Login failed - no user data received');
      }
      
      console.log('✅ User signed in successfully:', user.uid);
      
      // Update last active - with error handling
      try {
        await updateDoc(doc(db, mobileAppDB.users, user.uid), {
          'profile.lastActive': serverTimestamp()
        });
      } catch (updateError) {
        console.warn('⚠️ Failed to update last active time:', updateError);
        // Don't fail the whole login for this
      }
      
      return user;
      
    } catch (error) {
      console.error('❌ SignIn Error:', error);
      throw this.handleAuthError(error);
    }
  }

  async signOut() {
    try {
      await signOut(auth);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ SignOut Error:', error);
      throw error;
    }
  }

  getCurrentUser() {
    try {
      const user = auth.currentUser;
      console.log('👤 Current user check:', user ? `${user.uid}` : 'No user');
      return user;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  }

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, (user) => {
      console.log('🔄 Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      callback(user);
    });
  }

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent to:', email);
    } catch (error) {
      console.error('❌ Reset Password Error:', error);
      throw this.handleAuthError(error);
    }
  }

  // ✅ Enhanced error handling for health app context
  handleAuthError(error) {
    const errorCode = error?.code || 'unknown';
    
    console.log('🔍 Processing error code:', errorCode);
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return new Error('An account already exists with this email address.');
      case 'auth/weak-password':
        return new Error('Password should be at least 6 characters long.');
      case 'auth/invalid-email':
        return new Error('Please enter a valid email address.');
      case 'auth/user-not-found':
        return new Error('No account found with this email address.');
      case 'auth/wrong-password':
        return new Error('Incorrect password. Please try again.');
      case 'auth/user-disabled':
        return new Error('This account has been disabled. Please contact support.');
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later.');
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your connection.');
      default:
        return new Error(error?.message || 'Registration failed. Please try again.');
    }
  }
}

export default new AuthService();
