package com.wedding.gallery.data.repository

import android.content.Context
import android.net.Uri
import android.util.Base64
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.wedding.gallery.data.model.Photo
import com.wedding.gallery.util.ImageCompressor
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class PhotoRepository(private val context: Context) {

    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    val currentUserId: String? get() = auth.currentUser?.uid

    suspend fun ensureSignedIn() {
        if (auth.currentUser == null) {
            auth.signInAnonymously().await()
        }
    }

    fun getPhotosFlow(weddingId: String): Flow<List<Photo>> = callbackFlow {
        val listener = db.collection("weddings").document(weddingId)
            .collection("photos")
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val photos = snapshot?.documents?.mapNotNull { doc ->
                    val imageData = doc.getString("imageData") ?: return@mapNotNull null
                    val uploaderId = doc.getString("uploaderId") ?: return@mapNotNull null
                    val timestamp = doc.getLong("timestamp") ?: 0L
                    Photo(id = doc.id, imageData = imageData, uploaderId = uploaderId, timestamp = timestamp)
                } ?: emptyList()
                trySend(photos)
            }
        awaitClose { listener.remove() }
    }

    suspend fun uploadPhoto(uri: Uri, uploaderId: String, weddingId: String): Photo {
        val compressed = ImageCompressor.compress(context, uri)
            ?: throw IllegalStateException("Image compression failed")

        val base64 = Base64.encodeToString(compressed, Base64.DEFAULT)

        val payload = hashMapOf(
            "imageData" to base64,
            "uploaderId" to uploaderId,
            "timestamp" to System.currentTimeMillis()
        )

        val docRef = db.collection("weddings").document(weddingId)
            .collection("photos").add(payload).await()

        return Photo(
            id = docRef.id,
            imageData = base64,
            uploaderId = uploaderId,
            timestamp = System.currentTimeMillis()
        )
    }

    suspend fun deletePhoto(photo: Photo, weddingId: String) {
        db.collection("weddings").document(weddingId)
            .collection("photos").document(photo.id).delete().await()
    }
}
