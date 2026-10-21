/**
 * Image processing utilities optimized for WebP format
 */

export async function fileToWebPDataUrl(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.9
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export exclusively in WebP
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        resolve(webpDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Processes a photograph of a signature written on white paper:
 * 1. Grayscales and enhances contrast
 * 2. Thresholds near-white paper pixels into transparency
 * 3. Keeps clean, dark ink strokes
 * 4. Outputs as WebP
 */
export async function processSignaturePhoto(
  file: File,
  threshold = 210,
  contrast = 1.3
): Promise<string> {
  const baseWebP = await fileToWebPDataUrl(file, 1000, 600, 0.95);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(baseWebP);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Luminance
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        // Contrast adjustment
        gray = ((gray - 128) * contrast) + 128;

        if (gray > threshold) {
          // Transparent background for white/light paper
          data[i + 3] = 0;
        } else {
          // Dark ink stroke (deep blue/black)
          const inkIntensity = Math.max(0, Math.min(255, gray));
          data[i] = Math.round(inkIntensity * 0.1);     // subtle navy tint
          data[i + 1] = Math.round(inkIntensity * 0.2);
          data[i + 2] = Math.round(inkIntensity * 0.4);
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/webp', 0.95));
    };
    img.onerror = () => resolve(baseWebP);
    img.src = baseWebP;
  });
}
