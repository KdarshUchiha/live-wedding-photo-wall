import Foundation
import Firebase
import FirebaseFirestore
import FirebaseStorage
import FirebaseAuth

@MainActor
final class FirebaseService: ObservableObject {

    private let db = Firestore.firestore()
    private let storage = Storage.storage()
    private var listener: ListenerRegistration?

    var currentUserId: String? { Auth.auth().currentUser?.uid }

    // MARK: - Auth

    func ensureSignedIn() async throws {
        if Auth.auth().currentUser == nil {
            try await Auth.auth().signInAnonymously()
        }
    }

    // MARK: - Real-time listener

    func startListening(onUpdate: @escaping ([Photo]) -> Void) {
        listener = db.collection("photos")
            .order(by: "timestamp", descending: true)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self else { return }
                if let error {
                    print("[Gallery] Firestore error: \(error.localizedDescription)")
                    return
                }
                let photos = snapshot?.documents.compactMap { self.photo(from: $0) } ?? []
                DispatchQueue.main.async { onUpdate(photos) }
            }
    }

    func stopListening() {
        listener?.remove()
        listener = nil
    }

    // MARK: - Upload

    func uploadPhoto(_ image: UIImage, uploaderId: String) async throws -> Photo {
        guard let data = image.compressedForUpload() else {
            throw GalleryError.compressionFailed
        }

        let filename = "\(UUID().uuidString).jpg"
        let ref = storage.reference().child("photos/\(filename)")

        let metadata = StorageMetadata()
        metadata.contentType = "image/jpeg"

        _ = try await ref.putDataAsync(data, metadata: metadata)
        let downloadURL = try await ref.downloadURL()

        let payload: [String: Any] = [
            "url": downloadURL.absoluteString,
            "uploaderId": uploaderId,
            "timestamp": Timestamp(date: Date())
        ]

        let docRef = try await db.collection("photos").addDocument(data: payload)

        return Photo(id: docRef.documentID, url: downloadURL, uploaderId: uploaderId, timestamp: Date())
    }

    // MARK: - Delete

    func deletePhoto(_ photo: Photo) async throws {
        // Remove from Storage
        let storageRef = storage.reference(forURL: photo.url.absoluteString)
        try await storageRef.delete()

        // Remove from Firestore
        try await db.collection("photos").document(photo.id).delete()
    }

    // MARK: - Helpers

    private func photo(from document: DocumentSnapshot) -> Photo? {
        guard
            let data = document.data(),
            let urlString = data["url"] as? String,
            let url = URL(string: urlString),
            let uploaderId = data["uploaderId"] as? String,
            let ts = data["timestamp"] as? Timestamp
        else { return nil }

        return Photo(id: document.documentID, url: url, uploaderId: uploaderId, timestamp: ts.dateValue())
    }
}
