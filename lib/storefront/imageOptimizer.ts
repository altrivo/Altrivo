/**
 * Cloudinary & General Image Optimization Helper
 * Ensures responsive resolutions, auto-format (f_auto), auto-quality (q_auto), and zero CLS.
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "scale" | "fit" | "thumb";
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
}

export function formatCloudinaryUrl(url: string, options: ImageOptimizationOptions = {}): string {
  if (!url) return "";

  // If it's a Cloudinary URL, inject transformations
  if (url.includes("res.cloudinary.com")) {
    const { width = 800, height, crop = "fill", quality = "auto", format = "auto" } = options;

    const transformParts: string[] = [`f_${format}`, `q_${quality}`];
    if (width) transformParts.push(`w_${width}`);
    if (height) transformParts.push(`h_${height}`);
    if (crop) transformParts.push(`c_${crop}`);

    const transformString = transformParts.join(",");

    // Insert transformations before the version/filename part
    if (url.includes("/upload/")) {
      return url.replace("/upload/", `/upload/${transformString}/`);
    }
  }

  return url;
}

export const optimizeCloudinaryUrl = formatCloudinaryUrl;

export function generateImageSrcSet(url: string, widths: number[] = [320, 640, 768, 1024, 1280]): string {
  if (!url || !url.includes("res.cloudinary.com")) {
    return "";
  }

  return widths
    .map((w) => `${formatCloudinaryUrl(url, { width: w })} ${w}w`)
    .join(", ");
}
