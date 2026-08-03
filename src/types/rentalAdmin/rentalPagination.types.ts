import type { IRentalPostAdmin } from './rentalAdmin.types';

export interface RentalPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RentalPostAdminListResponse {
  message: string;
  count: number;
  visibleCount: number;
  pagination: RentalPaginationMeta;
  rentalPosts: IRentalPostAdmin[];
}
