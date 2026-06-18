import SwiftUI

struct PhotoThumbnailView: View {
    let photo: Photo

    private var tiltDegrees: Double {
        let hash = abs(photo.id.unicodeScalars.reduce(0) { $0 &+ Int($1.value) })
        return Double(hash % 600) / 100.0 - 3.0
    }

    var body: some View {
        Group {
            if let uiImage = photo.uiImage {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFill()
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color(.systemGray6))
            }
        }
        .aspectRatio(1, contentMode: .fill)
        .clipped()
        .padding(6)
        .padding(.bottom, 22)
        .background(Color.white)
        .shadow(color: .black.opacity(0.18), radius: 5, x: 2, y: 3)
        .rotationEffect(.degrees(tiltDegrees))
    }
}
