
import { googleFileLinks } from './linkForGoogleFiles';

/**
 * Извлекает ID файла из различных форматов ссылок Google Drive.
 * Поддерживает:
 * - https://drive.google.com/file/d/ID/view
 * - https://drive.google.com/open?id=ID
 * - https://drive.google.com/uc?id=ID
 */
export const getDriveFileId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/, // Стандартная ссылка /file/d/...
    /id=([a-zA-Z0-9_-]+)/    // Ссылка с параметром id=...
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Если передан чистый ID (без URL)
  if (/^[a-zA-Z0-9_-]+$/.test(url)) {
      return url;
  }

  return null;
};

/**
 * Конвертирует обычную ссылку на файл Google Drive в ссылку на миниатюру/изображение.
 * 
 * @param url Ссылка на файл (например: https://drive.google.com/file/d/ID/view) или ID файла.
 * @param size Желаемый размер. 
 *             Если передано число (например, 400), будет использовано как ширина (w400).
 *             Если строка, то используется как есть (например, 'w800', 'h600', 's200').
 *             По умолчанию 'w2000' (почти оригинал).
 * @returns Ссылка формата https://drive.google.com/thumbnail?id=ID&sz=SIZE или null, если ID не найден.
 */
export const getDriveThumbnailUrl = (url: string, size: number | string = 'w2000'): string | null => {
  const id = getDriveFileId(url);
  if (!id) return null;

  let sizeParam = String(size);
  // Если передано просто число, считаем это шириной
  if (typeof size === 'number') {
    sizeParam = `w${size}`;
  }
  
  return `https://drive.google.com/thumbnail?id=${id}&sz=${sizeParam}`;
};

/**
 * Получает прямую ссылку на изображение, используя его уникальное имя из реестра linkForGoogleFiles.
 * 
 * @param name Уникальное имя файла (ключ в googleFileLinks).
 * @param size Желаемый размер (по умолчанию w2000).
 */
export const getImgByName = (name: string, size: number | string = 'w2000'): string | null => {
  const url = googleFileLinks[name];
  
  if (!url) {
    console.warn(`[DriveUtils] Файл с именем "${name}" не найден в реестре linkForGoogleFiles.`);
    return null;
  }

  return getDriveThumbnailUrl(url, size);
};
