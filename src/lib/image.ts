const THUMB_MAX = 480
const FULL_MAX = 1600
const THUMB_QUALITY = 0.78
const FULL_QUALITY = 0.85

export interface ProcessedImage {
  thumbBlob: Blob
  fullBlob: Blob
  width: number
  height: number
}

function drawScaled(bitmap: ImageBitmap, maxDim: number): HTMLCanvasElement {
  const { width, height } = bitmap
  const scale = Math.min(1, maxDim / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) return resolve(blob)
        canvas.toBlob(
          (jpegBlob) => (jpegBlob ? resolve(jpegBlob) : reject(new Error('Image encoding failed'))),
          'image/jpeg',
          quality,
        )
      },
      'image/webp',
      quality,
    )
  })
}

/**
 * Downscales an imported photo into a small grid thumbnail and a
 * medium-resolution viewer copy, so we never keep multi-megabyte
 * originals in IndexedDB or pay for decoding them in the grid.
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  const bitmap = await createImageBitmap(file)
  try {
    const { width, height } = bitmap
    const [fullBlob, thumbBlob] = await Promise.all([
      canvasToBlob(drawScaled(bitmap, FULL_MAX), FULL_QUALITY),
      canvasToBlob(drawScaled(bitmap, THUMB_MAX), THUMB_QUALITY),
    ])
    return { thumbBlob, fullBlob, width, height }
  } finally {
    bitmap.close()
  }
}
