import Foundation
import Firebase
import FirebaseFirestore
import FirebaseAuth

@MainActor
final class FirebaseService: ObservableObject {

    private let db = Firestore.firestore()
    private var listener: ListenerRegistration?

    var currentUserId: String? { Auth.auth().currentUser?.uid }

    // MARK: - Auth

    func ensureSignedIn() async throws {
        if Auth.auth().currentUser == nil {
            try await Auth.auth().signInAnonymously()
        }
    }

    // MARK: - Real-time listener

    func startListening(weddingId: String, onUpdate: @escaping ([Photo]) -> Void) {
        listener = db.collection("weddings").document(weddingId)
            .collection("photos")
            .order(by: "timestamp", descending: true)
            .addSnapshotListener { [weak self] snapshot, error in
                guard self != nil else { return }
                if let error {
                    print("[Gallery] Firestore error: \(error.localizedDescription)")
                    return
                }
                let photos = snapshot?.documents.compactMap { Self.photo(from: $0) } ?? []
                DispatchQueue.main.async { onUpdate(photos) }
            }
    }

    func stopListening() {
        listener?.remove()
        listener = nil
    }

    // MARK: - Upload

    func uploadPhoto(_ image: UIImage, uploaderId: String, weddingId: String) async throws -> Photo {
        guard let jpegData = image.compressedForUpload() else {
            throw GalleryError.compressionFailed
        }

        let base64 = jpegData.base64EncodedString()

        let payload: [String: Any] = [
            "imageData": base64,
            "uploaderId": uploaderId,
            "timestamp": Timestamp(date: Date())
        ]

        let docRef = try await db.collection("weddings").document(weddingId)
            .collection("photos").addDocument(data: payload)

        return Photo(id: docRef.documentID, imageData: base64, uploaderId: uploaderId, timestamp: Date())
    }

    // MARK: - Delete

    func deletePhoto(_ photo: Photo, weddingId: String) async throws {
        try await db.collection("weddings").document(weddingId)
            .collection("photos").document(photo.id).delete()
    }

    // MARK: - Helpers

    private static func photo(from document: DocumentSnapshot) -> Photo? {
        guard
            let data = document.data(),
            let imageData = data["imageData"] as? String,
            let uploaderId = data["uploaderId"] as? String,
            let ts = data["timestamp"] as? Timestamp
        else { return nil }

        return Photo(id: document.documentID, imageData: imageData, uploaderId: uploaderId, timestamp: ts.dateValue())
    }
}
