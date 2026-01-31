import { IInterior } from '@/types/interiors/interiors.types';

export function mapInteriorImages(interior: IInterior): string[] {
  const result: string[] = [];

  if (interior.images) {
    result.push(interior.images);
  }

  if (interior.thumbnails?.length) {
    interior.thumbnails.forEach((src) => {
      if (src && src !== interior.images) {
        result.push(src);
      }
    });
  }

  return result;
}
