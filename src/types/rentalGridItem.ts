import type { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';

// Single source of truth cho search kind — type thuần, không import client hook.
export type SearchKind = 'title' | 'code';

// Type dùng chung cho grid.
// Chỉ chứa các field thực sự được RentalGrid sử dụng.
export type RentalGridItem = Pick<
  IRentalPostAdmin,
  | '_id'
  | 'images'
  | 'title'
  | 'price'
  | 'priceUnit'
  | 'area'
  | 'frontageWidth'
  | 'lotDepth'
  | 'district'
  | 'province'
  | 'code'
>;

// Danh sách field response của /api/search (whitelist).
// Không import mongoose — file type thuần.
// Dùng làm cả projection backend và contract response.
// Các field CHỈ dùng server search hoặc matchedAttributes (ward, address,
// legalStatus, furnitureStatus, direction) KHÔNG nằm đây — chúng ở
// SEARCH_INTERNAL_FIELDS (queries.ts) và chỉ hiện qua matchedAttributes.
export const RENTAL_SEARCH_RESULT_FIELDS = [
  '_id',
  'title',
  'price',
  'priceUnit',
  'area',
  'district',
  'province',
  'code',
  'images',
  'bedroomNumber',
  'floorNumber',
  'toiletNumber',
  'propertyType',
  'locationType',
  'frontageWidth',
  'lotDepth',
] as const satisfies readonly (keyof IRentalPostAdmin)[];

export type RentalSearchMatchSource =
  | 'title'
  | 'description'
  | 'address'
  | 'code'
  | 'attribute'
  | 'amenity';

export interface MatchedAttribute {
  type: string;
  displayText: string;
  matchedText?: string;
}

// Derive từ RENTAL_SEARCH_RESULT_FIELDS — không lặp danh sách.
export type RentalSearchResult = Pick<
  IRentalPostAdmin,
  (typeof RENTAL_SEARCH_RESULT_FIELDS)[number]
> & {
  matchSource: RentalSearchMatchSource;
  matchedAttributes?: MatchedAttribute[];
  matchedPhrase?: string;
};
