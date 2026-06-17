import SwiftUI

private let burgundy = Color(red: 0.188, green: 0.0, blue: 0.0)

private struct DetailPresentation: Identifiable {
    let id: Int
}

struct PhotoGalleryView: View {
    @StateObject private var viewModel = PhotoGalleryViewModel()

    @State private var showPicker = false
    @State private var detail: DetailPresentation?

    private let columns = [
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8)
    ]

    var body: some View {
        ZStack(alignment: .bottom) {
            galleryContent
            addPhotosButton
        }
        .navigationTitle("Photo Wall")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showPicker) {
            PhotoPicker { images in
                viewModel.uploadPhotos(images)
            }
        }
        .fullScreenCover(item: $detail) { presentation in
            PhotoDetailView(
                photos: viewModel.photos,
                currentIndex: Binding(
                    get: { detail?.id ?? presentation.id },
                    set: { detail = DetailPresentation(id: $0) }
                ),
                canDelete: viewModel.canDelete,
                onDelete: { photo in
                    viewModel.deletePhoto(photo)
                    if viewModel.photos.count <= 1 { detail = nil }
                },
                onDismiss: { detail = nil }
            )
        }
        .overlay(uploadOverlay, alignment: .top)
        .alert("Error", isPresented: Binding(
            get: { viewModel.alertMessage != nil },
            set: { if !$0 { viewModel.alertMessage = nil } }
        )) {
            Button("OK") { viewModel.alertMessage = nil }
        } message: {
            Text(viewModel.alertMessage ?? "")
        }
    }

    // MARK: - Sub-views

    @ViewBuilder
    private var galleryContent: some View {
        if viewModel.photos.isEmpty {
            emptyState
        } else {
            ScrollView {
                LazyVGrid(columns: columns, spacing: 8) {
                    ForEach(Array(viewModel.photos.enumerated()), id: \.element.id) { index, photo in
                        PhotoThumbnailView(photo: photo)
                            .transition(
                                .asymmetric(
                                    insertion: .scale(scale: 0.15, anchor: .center)
                                        .combined(with: .opacity)
                                        .combined(with: .offset(y: -30)),
                                    removal: .opacity
                                )
                            )
                            .onTapGesture { detail = DetailPresentation(id: index) }
                    }
                }
                .padding(.horizontal, 12)
                .padding(.top, 12)
                .padding(.bottom, 100)
                .animation(.spring(response: 0.45, dampingFraction: 0.68), value: viewModel.photos.map(\.id))
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "photo.on.rectangle.angled")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)
            Text("Be the first to share\nyour memories from the big day!")
                .font(.title3.weight(.medium))
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
            Text("Tap \u{201C}Add photos\u{201D} below to begin.")
                .font(.subheadline)
                .foregroundStyle(.tertiary)
        }
        .padding(40)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var addPhotosButton: some View {
        Button { showPicker = true } label: {
            Label("Add photos", systemImage: "camera.fill")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.white)
                .padding(.horizontal, 28)
                .padding(.vertical, 14)
                .background(
                    Capsule()
                        .fill(.regularMaterial)
                        .overlay(Capsule().fill(burgundy.opacity(0.9)))
                        .overlay(Capsule().strokeBorder(.white.opacity(0.15), lineWidth: 0.5))
                )
                .shadow(color: .black.opacity(0.28), radius: 10, x: 0, y: 4)
        }
        .padding(.bottom, 34)
    }

    @ViewBuilder
    private var uploadOverlay: some View {
        switch viewModel.uploadState {
        case .uploading(let progress):
            ProgressView(value: progress)
                .tint(burgundy)
                .frame(height: 3)
                .transition(.opacity)
        case .done:
            HStack(spacing: 8) {
                Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                Text("Photos uploaded!").font(.subheadline.weight(.medium))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(.regularMaterial, in: Capsule())
            .padding(.top, 8)
            .transition(.move(edge: .top).combined(with: .opacity))
        default:
            EmptyView()
        }
    }
}
