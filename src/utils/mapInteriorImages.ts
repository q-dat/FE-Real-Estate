import { IInterior } from '@/types/type/interiors/interiors';

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
