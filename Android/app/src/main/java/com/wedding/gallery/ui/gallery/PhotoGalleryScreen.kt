package com.wedding.gallery.ui.gallery

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.MutableTransitionState
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.scaleIn
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.wedding.gallery.data.model.Photo
import com.wedding.gallery.ui.detail.PhotoDetailScreen

private val Burgundy = Color(0xFF300000)

@Composable
fun PhotoGalleryScreen(
    onBack: () -> Unit = {}
) {
    val context = LocalContext.current
    val vm: PhotoGalleryViewModel = viewModel(factory = PhotoGalleryViewModel.Factory(context))

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
                    photoPicker.launch(
                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                    )
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

        // Upload progress bar
        if (uploadState is UploadState.Uploading) {
            LinearProgressIndicator(
                progress = { (uploadState as UploadState.Uploading).progress },
                modifier = Modifier.fillMaxWidth().align(Alignment.TopCenter),
                color = Burgundy
            )
        }

        // Upload done toast
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

        // Floating pill button
        AddPhotosButton(
            onClick = {
                photoPicker.launch(
                    PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                )
            },
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 32.dp)
        )
    }

    // Error dialog
    error?.let { msg ->
        AlertDialog(
            onDismissRequest = vm::clearError,
            title = { Text("Something went wrong") },
            text = { Text(msg) },
            confirmButton = { TextButton(onClick = vm::clearError) { Text("OK") } }
        )
    }

    // Full-screen detail
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
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 8.dp, pressedElevation = 4.dp),
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

    Column(
        modifier = Modifier
            .rotate(tilt)
            .shadow(elevation = 4.dp)
            .background(Color.White)
            .clickable(onClick = onClick)
            .padding(start = 5.dp, end = 5.dp, top = 5.dp, bottom = 20.dp)
    ) {
        AsyncImage(
            model = photo.url,
            contentDescription = null,
            modifier = Modifier.aspectRatio(1f),
            contentScale = ContentScale.Crop
        )
    }
}

@Composable
private fun EmptyGalleryState(onAddPhotos: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "📸",
            style = MaterialTheme.typography.displayMedium
        )
        Spacer(Modifier.height(16.dp))
        Text(
            text = "Be the first to share your\nmemories from the big day!",
            style = MaterialTheme.typography.titleMedium,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = "Tap "Add photos" below to begin.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.outline
        )
    }
}
