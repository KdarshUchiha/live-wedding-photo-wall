package com.wedding.gallery.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import java.io.ByteArrayOutputStream

object ImageCompressor {
    private const val MAX_DIMENSION = 1200
    private const val QUALITY = 72

    fun compress(context: Context, uri: Uri): ByteArray? {
        return try {
            val inputStream = context.contentResolver.openInputStream(uri) ?: return null
            val original = BitmapFactory.decodeStream(inputStream)
            inputStream.close()

            val scale = minOf(
                MAX_DIMENSION.toFloat() / original.width,
                MAX_DIMENSION.toFloat() / original.height,
                1f
            )
            val targetWidth = (original.width * scale).toInt()
            val targetHeight = (original.height * scale).toInt()

            val scaled = Bitmap.createScaledBitmap(original, targetWidth, targetHeight, true)
            original.recycle()

            val out = ByteArrayOutputStream()
            scaled.compress(Bitmap.CompressFormat.JPEG, QUALITY, out)
            scaled.recycle()

            out.toByteArray()
        } catch (e: Exception) {
            null
        }
    }
}
