import SwiftUI
import PhotosUI

struct PhotoPicker: UIViewControllerRepresentable {
    let onSelected: ([UIImage]) -> Void

    func makeUIViewController(context: Context) -> PHPickerViewController {
        var config = PHPickerConfiguration(photoLibrary: .shared())
        config.selectionLimit = 20
        config.filter = .images
        let picker = PHPickerViewController(configuration: config)
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: PHPickerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(onSelected: onSelected) }

    final class Coordinator: NSObject, PHPickerViewControllerDelegate {
        private let onSelected: ([UIImage]) -> Void

        init(onSelected: @escaping ([UIImage]) -> Void) {
            self.onSelected = onSelected
        }

        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            picker.dismiss(animated: true)

            guard !results.isEmpty else { return }

            let group = DispatchGroup()
            var images: [UIImage] = []
            let lock = NSLock()

            for result in results {
                guard result.itemProvider.canLoadObject(ofClass: UIImage.self) else { continue }
                group.enter()
                result.itemProvider.loadObject(ofClass: UIImage.self) { object, _ in
                    defer { group.leave() }
                    guard let image = object as? UIImage else { return }
                    lock.withLock { images.append(image) }
                }
            }

            group.notify(queue: .main) { self.onSelected(images) }
        }
    }
}
