# iOS Live Wedding Photo Wall — Setup

## Firebase Setup

1. Create a Firebase project at console.firebase.google.com
2. Add an iOS app with your bundle ID
3. Download GoogleService-Info.plist and add it to your Xcode project target
4. Enable Anonymous Authentication in Firebase Console → Authentication → Sign-in methods
5. Create a Firestore database (start in test mode, then apply rules below)

Note: Firebase Storage is NOT required — photos are stored as base64 in Firestore.

## Swift Package Dependencies (Xcode → File → Add Packages)

- https://github.com/firebase/firebase-ios-sdk
  Select: FirebaseFirestore, FirebaseAuth
  (Do NOT add FirebaseStorage — it is no longer needed)

## Firestore Security Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /weddings/{weddingId} {
      allow read, create: if request.auth != null;
      allow delete: if request.auth != null && resource.data.createdBy == request.auth.uid;
      match /photos/{photoId} {
        allow read, create: if request.auth != null;
        allow delete: if request.auth != null && resource.data.uploaderId == request.auth.uid;
      }
      match /videos/{videoId} {
        allow read, create: if request.auth != null;
        allow delete: if request.auth != null && resource.data.uploaderId == request.auth.uid;
      }
    }
  }
}

## App Entry Point

In your App file, call FirebaseApp.configure() in init():

import SwiftUI
import Firebase

@main
struct WeddingApp: App {
    init() { FirebaseApp.configure() }
    var body: some Scene {
        WindowGroup {
            NavigationStack {
                PhotoGalleryView()
            }
        }
    }
}
