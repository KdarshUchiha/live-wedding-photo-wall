# Web — Live Wedding Photo Wall Setup

## Firebase Setup

1. Create a Firebase project at console.firebase.google.com
2. Add a Web app, copy the firebaseConfig object
3. Paste config values into src/firebase.ts
4. Enable Anonymous Authentication
5. Create Firestore database + Firebase Storage
6. Apply security rules from iOS/SETUP.md (identical rules work for web)

## Install & Run

npm install
npm run dev

## Build for production

npm run build
npm run preview

## Deploy to Firebase Hosting (optional)

npm install -g firebase-tools
firebase login
firebase init hosting   # set public dir to: dist
npm run build
firebase deploy
