# Firebase Setup Instructions

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select an existing project
3. Follow the setup wizard to create your project

## 2. Enable Firestore Database

1. In Firebase Console, go to "Firestore Database" in the left sidebar
2. Click "Create Database"
3. Select "Start in production mode" (or test mode for development)
4. Choose your location and click "Enable"

## 3. Get Service Account Key

1. Go to Project Settings (gear icon) → Service Accounts
2. Click "Generate New Private Key"
3. Save the downloaded JSON file as `firebaseServiceAccount.json` in your server directory
4. Make sure to add this file to your `.gitignore` to protect credentials

## 4. Environment Variables

Create a `.env` file in the server directory with:

```
GOOGLE_APPLICATION_CREDENTIALS="./firebaseServiceAccount.json"
FIRESTORE_DATABASE_URL="https://your-project-id.firebaseio.com"
PORT=3000
BASE_URL=https://dailybugle.tech
```

## 5. Firestore Security Rules

Update Firestore security rules to allow read/write access:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /urls/{document} {
      allow read, write: if true;  // Adjust for your security needs
    }
  }
}
```

## 6. Add Firebase Admin SDK

In your server package.json, include:

```
"firebase-admin": "^11.0.0"
```
