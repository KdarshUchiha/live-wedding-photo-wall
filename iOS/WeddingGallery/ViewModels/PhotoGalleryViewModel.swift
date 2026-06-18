import SwiftUI
import Combine

enum UploadState: Equatable {
    case idle
    case uploading(progress: Double)
    case done
    case failed(String)
}

@MainActor
final class PhotoGalleryViewModel: ObservableObject {

    @Published var photos: [Photo] = []
    @Published var uploadState: UploadState = .idle
    @Published var alertMessage: String?

    private let service: FirebaseService
    private let weddingId: String

    init(service: FirebaseService = FirebaseService(), weddingId: String) {
        self.service = service
        self.weddingId = weddingId
        Task { await boot() }
    }

    private func boot() async {
        do {
            try await service.ensureSignedIn()
        } catch {
            alertMessage = error.localizedDescription
        }
        service.startListening(weddingId: weddingId) { [weak self] photos in
            withAnimation(.spring(response: 0.45, dampingFraction: 0.68)) {
                self?.photos = photos
            }
        }
    }

    func uploadPhotos(_ images: [UIImage]) {
        guard let userId = service.currentUserId else {
            alertMessage = GalleryError.notAuthenticated.errorDescription
            return
        }

        uploadState = .uploading(progress: 0)
        let total = Double(images.count)

        Task {
            do {
                for (i, image) in images.enumerated() {
                    _ = try await service.uploadPhoto(image, uploaderId: userId, weddingId: weddingId)
                    uploadState = .uploading(progress: Double(i + 1) / total)
                }
                uploadState = .done
                try? await Task.sleep(nanoseconds: 1_500_000_000)
                uploadState = .idle
            } catch {
                uploadState = .failed(error.localizedDescription)
                alertMessage = error.localizedDescription
            }
        }
    }

    func deletePhoto(_ photo: Photo) {
        Task {
            do {
                try await service.deletePhoto(photo, weddingId: weddingId)
            } catch {
                alertMessage = error.localizedDescription
            }
        }
    }

    func canDelete(_ photo: Photo) -> Bool {
        service.currentUserId == photo.uploaderId
    }

    deinit {
        service.stopListening()
    }
}
