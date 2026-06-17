# iOS Live Photo Wall — Setup

## Firebase Setup

1. Create a Firebase project at console.firebase.google.com
2. Add an iOS app with your bundle ID
3. Download GoogleService-Info.plist and add it to your Xcode project target
4. Enable Anonymous Authentication in Firebase Console → Authentication → Sign-in methods
5. Create a Firestore database (start in test mode, then apply rules below)
6. Enable Firebase Storage

## Swift Package Dependencies (Xcode → File → Add Packages)

- https://github.com/firebase/firebase-ios-sdk
  Select: FirebaseFirestore, FirebaseStorage, FirebaseAuth

## Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /photos/{photoId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.uploaderId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.uploaderId == request.auth.uid;
    }
  }
}
```

## Storage Security Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{filename} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024;
      allow delete: if request.auth != null;
    }
  }
}
```

## App Entry Point

In your App file, call FirebaseApp.configure() in init():

```swift
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
```
