package com.wedding.gallery.ui.gallery

import android.graphics.BitmapFactory
import android.util.Base64
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.MutableTransitionState
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.scaleIn
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.wedding.gallery.data.model.Photo
import com.wedding.gallery.ui.detail.PhotoDetailScreen

private val Burgundy = Color(0xFF8B1A1A)

@Composable
fun PhotoGalleryScreen(
    weddingId: String,
    weddingCreatedBy: String,
    brideName: String,
    groomName: String,
    onBack: () -> Unit = {}
) {
    val context = LocalContext.current
    val vm: PhotoGalleryViewModel = viewModel(
        factory = PhotoGalleryViewModel.Factory(context, weddingId, weddingCreatedBy)
    )

    val photos by vm.photos.collectAsStateWithLifecycle()
    val uploadState by vm.uploadState.collectAsStateWithLifecycle()
    val error by vm.error.collectAsStateWithLifecycle()

    var selectedIndex by remember { mutableStateOf<Int?>(null) }

    val photoPicker = rememberLauncherForActivityResult(
        ActivityResultContracts.PickMultipleVisualMedia(maxItems = 20)
    ) { uris ->
        if (uris.isNotEmpty()) vm.uploadPhotos(uris)
    }

    Box(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {

        if (photos.isEmpty() && uploadState is UploadState.Idle) {
            EmptyGalleryState(
                modifier = Modifier.fillMaxSize(),
                onAddPhotos = {
                    photoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                }
            )
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(3),
                contentPadding = PaddingValues(start = 8.dp, end = 8.dp, top = 8.dp, bottom = 96.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(photos, key = { it.id }) { photo ->
                    val visibleState = remember { MutableTransitionState(false).apply { targetState = true } }
                    AnimatedVisibility(
                        visibleState = visibleState,
                        enter = scaleIn(
                            animationSpec = spring(
                                dampingRatio = Spring.DampingRatioMediumBouncy,
                                stiffness = Spring.StiffnessMedium
                            ),
                            initialScale = 0.15f
                        ) + fadeIn()
                    ) {
                        PhotoThumbnailCard(
                            photo = photo,
                            onClick = { selectedIndex = photos.indexOf(photo) }
                        )
                    }
                }
            }
        }

        if (uploadState is UploadState.Uploading) {
            LinearProgressIndicator(
                progress = { (uploadState as UploadState.Uploading).progress },
                modifier = Modifier.fillMaxWidth().align(Alignment.TopCenter),
                color = Burgundy
            )
        }

        if (uploadState is UploadState.Done) {
            Surface(
                modifier = Modifier.align(Alignment.TopCenter).padding(top = 12.dp),
                shape = CircleShape,
                color = MaterialTheme.colorScheme.surfaceVariant,
                tonalElevation = 4.dp
            ) {
                Text(
                    text = "✓ Photos uploaded!",
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp),
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }

        AddPhotosButton(
            onClick = {
                photoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
            },
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 32.dp)
        )

        if (vm.isAdmin) {
            Surface(
                modifier = Modifier.align(Alignment.TopEnd).padding(top = 12.dp, end = 12.dp),
                shape = CircleShape,
                color = Burgundy,
                tonalElevation = 4.dp
            ) {
                Text(
                    text = "👑 Admin",
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                    color = Color.White,
                    style = MaterialTheme.typography.labelSmall
                )
            }
        }
    }

    error?.let { msg ->
        AlertDialog(
            onDismissRequest = vm::clearError,
            title = { Text("Something went wrong") },
            text = { Text(msg) },
            confirmButton = { TextButton(onClick = vm::clearError) { Text("OK") } }
        )
    }

    selectedIndex?.let { idx ->
        PhotoDetailScreen(
            photos = photos,
            initialIndex = idx,
            canDelete = vm::canDelete,
            onDelete = { photo ->
                vm.deletePhoto(photo)
                if (photos.size <= 1) selectedIndex = null
            },
            onDismiss = { selectedIndex = null }
        )
    }
}

@Composable
private fun AddPhotosButton(onClick: () -> Unit, modifier: Modifier = Modifier) {
    Button(
        onClick = onClick,
        modifier = modifier,
        shape = RoundedCornerShape(50),
        colors = ButtonDefaults.buttonColors(containerColor = Burgundy),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 8.dp),
        contentPadding = PaddingValues(horizontal = 28.dp, vertical = 14.dp)
    ) {
        Icon(Icons.Default.CameraAlt, contentDescription = null, tint = Color.White)
        Spacer(Modifier.width(8.dp))
        Text("Add photos", color = Color.White, style = MaterialTheme.typography.labelLarge)
    }
}

@Composable
private fun PhotoThumbnailCard(photo: Photo, onClick: () -> Unit) {
    val tilt = remember(photo.id) {
        ((photo.id.hashCode() % 600).toFloat() / 100f) - 3f
    }
    val bitmap = remember(photo.imageData) {
        runCatching {
            val bytes = Base64.decode(photo.imageData, Base64.DEFAULT)
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size)?.asImageBitmap()
        }.getOrNull()
    }

    Column(
        modifier = Modifier
            .rotate(tilt)
            .shadow(elevation = 4.dp)
            .background(Color.White)
            .clickable(onClick = onClick)
            .padding(start = 5.dp, end = 5.dp, top = 5.dp, bottom = 20.dp)
    ) {
        if (bitmap != null) {
            Image(
                bitmap = bitmap,
                contentDescription = null,
                modifier = Modifier.aspectRatio(1f),
                contentScale = ContentScale.Crop
            )
        } else {
            Box(
                modifier = Modifier.aspectRatio(1f).background(Color(0xFFF0EEEB)),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Burgundy, modifier = Modifier.size(24.dp))
            }
        }
    }
}

@Composable
private fun EmptyGalleryState(onAddPhotos: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "📸", style = MaterialTheme.typography.displayMedium)
        Spacer(Modifier.height(16.dp))
        Text(
            text = "Be the first to share your\nmemories from the big day!",
            style = MaterialTheme.typography.titleMedium,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
