import SwiftUI

struct PhotoDetailView: View {
    let photos: [Photo]
    @Binding var currentIndex: Int
    let canDelete: (Photo) -> Bool
    let onDelete: (Photo) -> Void
    let onDismiss: () -> Void

    @State private var showDeleteConfirm = false

    private var currentPhoto: Photo { photos[currentIndex] }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            TabView(selection: $currentIndex) {
                ForEach(Array(photos.enumerated()), id: \.element.id) { index, photo in
                    Group {
                        if let uiImage = photo.uiImage {
                            Image(uiImage: uiImage)
                                .resizable()
                                .scaledToFit()
                                .frame(maxWidth: .infinity, maxHeight: .infinity)
                        } else {
                            ProgressView()
                                .tint(.white)
                        }
                    }
                    .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .ignoresSafeArea()

            VStack {
                HStack {
                    Button(action: onDismiss) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2)
                            .foregroundStyle(.white.opacity(0.9))
                            .symbolRenderingMode(.hierarchical)
                    }
                    .padding()

                    Spacer()

                    Text("\(currentIndex + 1) / \(photos.count)")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.white.opacity(0.85))
                        .padding(.trailing)
                }
                .background(
                    LinearGradient(colors: [.black.opacity(0.55), .clear], startPoint: .top, endPoint: .bottom)
                )
                Spacer()
            }
            .ignoresSafeArea(edges: .top)

            if canDelete(currentPhoto) {
                VStack {
                    Spacer()
                    Button(role: .destructive) {
                        showDeleteConfirm = true
                    } label: {
                        Label("Delete photo", systemImage: "trash")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(Color.red.opacity(0.85), in: Capsule())
                    }
                    .padding(.bottom, 40)
                }
            }
        }
        .confirmationDialog("Delete this photo?", isPresented: $showDeleteConfirm, titleVisibility: .visible) {
            Button("Delete", role: .destructive) {
                onDelete(currentPhoto)
                if photos.count <= 1 { onDismiss() }
            }
            Button("Cancel", role: .cancel) {}
        }
    }
}
