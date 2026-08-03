import Breadcrumbs from '@/components/userPage/Breadcrumbs';
import FilterBar from '@/components/userPage/filterBar/FilterBar';
import FixedQueryPagination from '@/components/userPage/filterBar/FixedQueryPagination';
import { RentalGrid } from '@/components/userPage/rental';
import {
  DEFAULT_RENTAL_LIMIT,
  DEFAULT_RENTAL_PAGE,
  isRentalLimit,
} from '@/constants/rentalPagination';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
// 0. Mua bán nhà đất
// 1. Căn hộ cho thuê
// 2. Nhà nguyên căn
// 3. Cho thuê mặt bằng
const CATEGORY_CODE = 0;
const CATEGORY_NAME = 'Bất Động Sản Bán';

type SearchParams = Record<
  string,
  string | string[] | undefined
>;

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const getSingleParam = (
  value: string | string[] | undefined,
): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }

  return undefined;
};

const getPositiveIntegerParam = (
  value: string | string[] | undefined,
  fallback: number,
): number => {
  const singleValue = getSingleParam(value);
  const parsedValue = Number(singleValue);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0
  ) {
    return fallback;
  }

  return parsedValue;
};

export default async function Page({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await searchParams;

  const requestedPage = getPositiveIntegerParam(
    resolvedSearchParams.page,
    DEFAULT_RENTAL_PAGE,
  );

  const requestedLimit = getPositiveIntegerParam(
    resolvedSearchParams.limit,
    DEFAULT_RENTAL_LIMIT,
  );

  const limit = isRentalLimit(requestedLimit)
    ? requestedLimit
    : DEFAULT_RENTAL_LIMIT;

  const params: Record<
    string,
    string | number | undefined
  > = {
    page: requestedPage,
    limit,
  };

  Object.entries(resolvedSearchParams).forEach(
    ([key, value]) => {
      if (
        key === 'page' ||
        key === 'limit' ||
        key === 'categoryCode'
      ) {
        return;
      }

      const singleValue = getSingleParam(value);

      if (!singleValue) {
        return;
      }

      params[key] = singleValue;
    },
  );

  // Gán sau cùng để query trên URL không thể đổi category
  // cố định của trang này.
  params.categoryCode = CATEGORY_CODE;

  const data =
    await rentalPostAdminService.getList(params);

  return (
    <div className="pt-mobile-padding-top xl:pt-desktop-padding-top">
      <FilterBar />

      <Breadcrumbs label={CATEGORY_NAME} />

      <RentalGrid
        posts={data.rentalPosts}
        title={CATEGORY_NAME}
        slogan=""
      />

      <FixedQueryPagination
        {...data.pagination}
        visibleCount={data.visibleCount}
      />
    </div>
  );
}