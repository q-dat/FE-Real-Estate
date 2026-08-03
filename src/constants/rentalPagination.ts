export const RENTAL_LIMIT_OPTIONS = [10, 20, 40, 60, 100, 200] as const;

export type RentalLimit = (typeof RENTAL_LIMIT_OPTIONS)[number];

export const DEFAULT_RENTAL_PAGE = 1;
export const DEFAULT_RENTAL_LIMIT: RentalLimit = 20;

export const isRentalLimit = (value: number): value is RentalLimit => {
  return RENTAL_LIMIT_OPTIONS.some((option) => option === value);
};
