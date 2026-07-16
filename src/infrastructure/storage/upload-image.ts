import type { MediaStorage } from './media-storage';

export function imageExtension(image: File): string {
  if (image.type.includes('png')) return 'png';
  if (image.type.includes('webp')) return 'webp';
  return 'jpg';
}

export async function uploadImageToMedia(storage: MediaStorage, path: string, image: File): Promise<string> {
  const buffer = Buffer.from(await image.arrayBuffer());
  return storage.upload(path, buffer, image.type);
}

export async function uploadRemoteImageToMedia(
  storage: MediaStorage,
  basePath: string,
  imageUrl: string,
): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Falha ao baixar imagem de ${imageUrl}: HTTP ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const path = `${basePath}.${ext}`;

  return storage.upload(path, buffer, contentType);
}
