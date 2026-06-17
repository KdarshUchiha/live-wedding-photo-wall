import Foundation

struct Photo: Identifiable, Codable, Hashable {
    let id: String
    let url: URL
    let uploaderId: String
    let timestamp: Date

    static func == (lhs: Photo, rhs: Photo) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

enum GalleryError: LocalizedError {
    case compressionFailed
    case uploadFailed(String)
    case deleteFailed(String)
    case notAuthenticated

    var errorDescription: String? {
        switch self {
        case .compressionFailed: return "Failed to process the image."
        case .uploadFailed(let msg): return "Upload failed: \(msg)"
        case .deleteFailed(let msg): return "Delete failed: \(msg)"
        case .notAuthenticated: return "Please wait, signing you in…"
        }
    }
}
