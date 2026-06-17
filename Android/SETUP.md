# Android Live Photo Wall — Setup

## Firebase Setup

1. Create a Firebase project at console.firebase.google.com
2. Add an Android app with package name: com.wedding.gallery
3. Download google-services.json and place it in app/ directory
4. Enable Anonymous Authentication in Firebase Console → Authentication → Sign-in methods
5. Create a Firestore database (start in test mode, then apply rules)
6. Enable Firebase Storage

## AndroidManifest.xml permissions to add

Add inside <manifest>:
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

## Entry point (MainActivity.kt)

```kotlin
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.wedding.gallery.ui.gallery.PhotoGalleryScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                PhotoGalleryScreen()
            }
        }
    }
}
```

## Firestore Security Rules

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

## Storage Security Rules

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
