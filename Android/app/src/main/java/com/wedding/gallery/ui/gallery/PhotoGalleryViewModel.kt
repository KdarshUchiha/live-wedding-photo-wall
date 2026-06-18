package com.wedding.gallery.ui.gallery

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.wedding.gallery.data.model.Photo
import com.wedding.gallery.data.repository.PhotoRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed class UploadState {
    object Idle : UploadState()
    data class Uploading(val progress: Float) : UploadState()
    object Done : UploadState()
    data class Failed(val message: String) : UploadState()
}

class PhotoGalleryViewModel(
    private val repository: PhotoRepository,
    private val weddingId: String,
    private val weddingCreatedBy: String
) : ViewModel() {

    val photos: StateFlow<List<Photo>> = repository.getPhotosFlow(weddingId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    private val _uploadState = MutableStateFlow<UploadState>(UploadState.Idle)
    val uploadState: StateFlow<UploadState> = _uploadState.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        viewModelScope.launch {
            try { repository.ensureSignedIn() }
            catch (e: Exception) { _error.value = "Sign-in failed: ${e.message}" }
        }
    }

    fun uploadPhotos(uris: List<Uri>) {
        val userId = repository.currentUserId ?: run {
            _error.value = "Not signed in yet, please try again."
            return
        }
        viewModelScope.launch {
            val total = uris.size.toFloat()
            _uploadState.value = UploadState.Uploading(0f)
            try {
                uris.forEachIndexed { i, uri ->
                    repository.uploadPhoto(uri, userId, weddingId)
                    _uploadState.value = UploadState.Uploading((i + 1) / total)
                }
                _uploadState.value = UploadState.Done
                kotlinx.coroutines.delay(1_500)
                _uploadState.value = UploadState.Idle
            } catch (e: Exception) {
                _uploadState.value = UploadState.Failed(e.message ?: "Upload failed")
                _error.value = e.message
            }
        }
    }

    fun deletePhoto(photo: Photo) {
        viewModelScope.launch {
            try { repository.deletePhoto(photo, weddingId) }
            catch (e: Exception) { _error.value = "Delete failed: ${e.message}" }
        }
    }

    val isAdmin: Boolean get() = repository.currentUserId == weddingCreatedBy

    fun canDelete(photo: Photo): Boolean = isAdmin || repository.currentUserId == photo.uploaderId

    fun clearError() { _error.value = null }

    class Factory(
        private val context: Context,
        private val weddingId: String,
        private val weddingCreatedBy: String
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            PhotoGalleryViewModel(PhotoRepository(context), weddingId, weddingCreatedBy) as T
    }
}
