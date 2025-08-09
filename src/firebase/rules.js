// This file is for reference only. Actual Firebase security rules 
// must be deployed to firestore.rules file in your project root.

export const securityRulesReference = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Health Camp Collections (existing - untouched)
    match /healthCampPatients/{document} {
      allow read, write: if request.auth != null && 
        request.auth.token.campStaff == true;
    }
    
    match /campScreenings/{document} {
      allow read, write: if request.auth != null && 
        request.auth.token.campStaff == true;
    }
    
    // Mobile App Collections (isolated)
    match /mobileAppUsers/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
      
      // User's health data subcollections
      match /{subcollection}/{document} {
        allow read, write: if request.auth != null && 
          request.auth.uid == userId;
      }
    }
    
    // Shared mobile app content
    match /mobileAppContent/{document} {
      allow read: if request.auth != null;
    }
    
    match /mobileAppProviders/{document} {
      allow read: if request.auth != null;
    }
  }
}`;

// To deploy these rules, create a 'firestore.rules' file in your project root
// and copy the rules above (without the template literals)
// Then run: firebase deploy --only firestore:rules
