/** Create a compact JPEG data URL for displaying a scanned item in listings. */
export async function makeListingImageDataUrl(file: File): Promise<string | undefined> {
  try {
    const bitmap = await createImageBitmap(file);
    const longestEdge = 720;
    const scale = Math.min(1, longestEdge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
    if (!blob) return undefined;
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not prepare image."));
      reader.onerror = () => reject(new Error("Could not prepare image."));
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

/** Convert the original capture for the existing authenticated scan-history API. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read image."));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}
