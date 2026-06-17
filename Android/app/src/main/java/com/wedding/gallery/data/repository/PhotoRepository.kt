package com.wedding.gallery.data.repository

import android.content.Context
import android.net.Uri
import com.wedding.gallery.data.model.Photo
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.storage.FirebaseStorage
import com.wedding.gallery.util.ImageCompressor
import java.util.UUID

class PhotoRepository(private val context: Context) {

    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    private val storage = FirebaseStorage.getInstance()

    val currentUserId: String? get() = auth.currentUser?.uid

    suspend fun ensureSignedIn() {
        if (auth.currentUser == null) {
            auth.signInAnonymously().await()
        }
    }

    fun getPhotosFlow(): Flow<List<Photo>> = callbackFlow {
        val listener = db.collection("photos")
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val photos = snapshot?.documents?.mapNotNull { doc ->
                    val url = doc.getString("url") ?: return@mapNotNull null
                    val uploaderId = doc.getString("uploaderId") ?: return@mapNotNull null
                    val timestamp = doc.getLong("timestamp") ?: 0L
                    Photo(id = doc.id, url = url, uploaderId = uploaderId, timestamp = timestamp)
                } ?: emptyList()
                trySend(photos)
            }
        awaitClose { listener.remove() }
    }

    suspend fun uploadPhoto(uri: Uri, uploaderId: String): Photo {
        val compressed = ImageCompressor.compress(context, uri)
            ?: throw IllegalStateException("Image compression failed")

        val filename = "${UUID.randomUUID()}.jpg"
        val ref = storage.reference.child("photos/$filename")

        ref.putBytes(compressed).await()
        val downloadUrl = ref.downloadUrl.await().toString()

        val payload = hashMapOf(
            "url" to downloadUrl,
            "uploaderId" to uploaderId,
            "timestamp" to System.currentTimeMillis()
        )

        val docRef = db.collection("photos").add(payload).await()

        return Photo(
            id = docRef.id,
            url = downloadUrl,
            uploaderId = uploaderId,
            timestamp = System.currentTimeMillis()
        )
    }

    suspend fun deletePhoto(photo: Photo) {
        storage.getReferenceFromUrl(photo.url).delete().await()
        db.collection("photos").document(photo.id).delete().await()
    }
}
