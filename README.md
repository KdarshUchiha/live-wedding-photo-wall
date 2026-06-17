# Live Wedding Photo Wall

A real-time collaborative photo gallery for wedding guests — available on **iOS** (SwiftUI) and **Android** (Jetpack Compose).

Guests can upload photos during the event, which appear instantly in a shared animated collage for everyone to view.

## Features

- **Real-time sync** — photos appear for all guests instantly via Firebase Firestore listeners
- **Guest upload** — select up to 20 photos from the library or camera
- **Physics animations** — new photos fly in with a spring bounce effect
- **Polaroid style** — thumbnails display with a white border and subtle random tilt
- **Full-screen viewer** — swipe through all photos with smooth paging
- **Owner delete** — guests can delete only their own photos; confirmation required
- **Offline-safe** — client-side compression (1200px, JPEG 72%) before upload

## Project Structure

```
├── iOS/
│   ├── WeddingGallery/
│   │   ├── Models/Photo.swift
│   │   ├── Utilities/ImageCompressor.swift
│   │   ├── Services/FirebaseService.swift
│   │   ├── ViewModels/PhotoGalleryViewModel.swift
│   │   └── Views/
│   │       ├── PhotoGalleryView.swift     ← root gallery grid
│   │       ├── PhotoThumbnailView.swift   ← polaroid card
│   │       ├── PhotoDetailView.swift      ← full-screen pager
│   │       └── PhotoPickerView.swift      ← PHPickerViewController wrapper
│   └── SETUP.md
│
└── Android/
    ├── app/src/main/java/com/wedding/gallery/
    │   ├── data/model/Photo.kt
    │   ├── data/repository/PhotoRepository.kt
    │   ├── util/ImageCompressor.kt
    │   └── ui/
    │       ├── gallery/PhotoGalleryScreen.kt
    │       ├── gallery/PhotoGalleryViewModel.kt
    │       └── detail/PhotoDetailScreen.kt
    ├── app/build.gradle
    ├── build.gradle
    └── SETUP.md
```

## Quick Start

### Firebase (required for both platforms)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Anonymous Authentication**
3. Create a **Firestore** database
4. Enable **Firebase Storage**
5. Apply the security rules from the platform `SETUP.md`

### iOS

1. Add an iOS app in Firebase Console → download `GoogleService-Info.plist` → add to Xcode target
2. Add Firebase via Swift Package Manager: `https://github.com/firebase/firebase-ios-sdk`
   - Select: `FirebaseFirestore`, `FirebaseStorage`, `FirebaseAuth`
3. See `iOS/SETUP.md` for the full app entry point and rules

### Android

1. Add an Android app in Firebase Console → download `google-services.json` → place in `app/`
2. Sync Gradle — all dependencies are declared in `app/build.gradle`
3. See `Android/SETUP.md` for permissions and entry point

## Tech Stack

| | iOS | Android |
|---|---|---|
| UI | SwiftUI | Jetpack Compose |
| Real-time DB | Firebase Firestore | Firebase Firestore |
| Storage | Firebase Storage | Firebase Storage |
| Auth | Firebase Auth (anonymous) | Firebase Auth (anonymous) |
| Image loading | `AsyncImage` | Coil 2.5 |
| Animations | SwiftUI spring transitions | Compose spring `AnimatedVisibility` |
