import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { RentalGrid } from '@/components/userPage/rental';
import FilterBar from '@/components/userPage/filterBar/FilterBar';
import Breadcrumbs from '@/components/userPage/Breadcrumbs';
import QueryPagination from '@/components/userPage/filterBar/QueryPagination';
// 0. Mua bán nhà đất
// 1. Căn hộ cho thuê
// 2. Nhà nguyên căn
// 3. Cho thuê mặt bằng

const CATEGORY_CODE = 0;
const CATEGORY_NAME = 'Bất Động Sản Bán';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const getSingleParam = (value: string | string[] | undefined): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0) return value[0];

  return undefined;
};

const getPositiveNumberParam = (value: string | string[] | undefined, fallback: number): number => {
  const singleValue = getSingleParam(value);
  const parsedValue = Number(singleValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const page = getPositiveNumberParam(resolvedSearchParams.page, DEFAULT_PAGE);
  const limit = getPositiveNumberParam(resolvedSearchParams.limit, DEFAULT_LIMIT);

  const params: Record<string, string | number> = {
    categoryCode: CATEGORY_CODE,
    page,
    limit: limit + 1,
  };

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    const singleValue = getSingleParam(value);

    if (!singleValue) return;
    if (key === 'page' || key === 'limit') return;

    params[key] = singleValue;
  });

  const fetchedPosts = await rentalPostAdminService.getAll(params);

  const posts = fetchedPosts.slice(0, limit);
  const hasPrevPage = page > 1;
  const hasNextPage = fetchedPosts.length > limit;

  return (
    <div className="pt-mobile-padding-top xl:pt-desktop-padding-top">
      <FilterBar />
      <QueryPagination page={page} limit={limit} hasPrevPage={hasPrevPage} hasNextPage={hasNextPage} visibleCount={posts.length} />
      <Breadcrumbs label={CATEGORY_NAME} />
      <RentalGrid posts={posts} title={CATEGORY_NAME} slogan="" />
    </div>
  );
}