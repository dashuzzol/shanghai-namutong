/**
 * Image compression and optimization utility for Product and Category images.
 * Supports: JPG, JPEG, PNG, WEBP.
 * Automatically resizes large camera/phone photos to max 1000x1000 while maintaining aspect ratio,
 * compressing them to optimized WebP/JPEG data URLs for blazing-fast loading and reliable storage.
 */

export interface CompressedImageResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
  width: number;
  height: number;
  fileName: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function isSupportedImageFormat(file: File): boolean {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
  const fileType = file.type.toLowerCase();
  if (allowedMimeTypes.includes(fileType)) return true;

  // Extension fallback check
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp';
}

export async function compressProductImage(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.84
): Promise<CompressedImageResult> {
  if (!isSupportedImageFormat(file)) {
    throw new Error(
      'অনুগ্রহ করে সঠিক ফরম্যাটের ছবি আপলোড করুন (JPG, JPEG, PNG, WEBP) / Please select a JPG, JPEG, PNG, or WEBP image.'
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('ছবি লোড করতে সমস্যা হয়েছে / Failed to read the selected image file.'));
    };

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        reject(new Error('ইমেজ ডাটা রিড করা সম্ভব হয়নি / Empty image data received.'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        reject(new Error('ছবি প্রসেস করতে ব্যর্থ হয়েছে / Failed to process image file.'));
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale proportionally if larger than maximum bounds
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback if canvas context is unavailable
          const approxBytes = Math.round((result.length * 3) / 4);
          resolve({
            dataUrl: result,
            originalSize: file.size,
            compressedSize: approxBytes,
            originalSizeFormatted: formatFileSize(file.size),
            compressedSizeFormatted: formatFileSize(approxBytes),
            width: img.width,
            height: img.height,
            fileName: file.name,
          });
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for optimal size/quality; fallback to JPEG
        let dataUrl = '';
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Calculate compressed byte size from base64
        const base64Data = dataUrl.split(',')[1] || '';
        const compressedBytes = Math.round((base64Data.length * 3) / 4);

        resolve({
          dataUrl,
          originalSize: file.size,
          compressedSize: compressedBytes,
          originalSizeFormatted: formatFileSize(file.size),
          compressedSizeFormatted: formatFileSize(compressedBytes),
          width,
          height,
          fileName: file.name,
        });
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  });
}

export async function compressMultipleProductImages(
  files: FileList | File[],
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.84
): Promise<CompressedImageResult[]> {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) {
    return [];
  }

  const results: CompressedImageResult[] = [];
  const errors: string[] = [];

  for (const file of fileArray) {
    if (!isSupportedImageFormat(file)) {
      errors.push(`"${file.name}" is not a supported image format (JPG, JPEG, PNG, WEBP).`);
      continue;
    }
    try {
      const res = await compressProductImage(file, maxWidth, maxHeight, quality);
      results.push(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to process ${file.name}`;
      errors.push(msg);
    }
  }

  if (results.length === 0 && errors.length > 0) {
    throw new Error(errors[0]);
  }

  return results;
}
