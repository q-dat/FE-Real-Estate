// src/constants/priceRanges.ts

export type PriceRangeKey =
  | 'Tất cả'
  | 'Dưới 1 triệu'
  | '1 - 2 triệu'
  | '2 - 4 triệu'
  | '4 - 6 triệu'
  | '6 - 8 triệu'
  | '8 - 10 triệu'
  | '10 - 15 triệu'
  | '15 - 20 triệu'
  | 'Trên 20 triệu'
  | 'Thoả thuận';

export interface PriceRange {
  label: PriceRangeKey;
  // Dùng cho UI slider (min/max thực tế hiển thị)
  sliderValue: [number, number]; // [min, max] – dùng cho modal
  // Dùng cho API params
  apiParams: {
    priceFrom?: number;
    priceTo?: number;
    price?: number; // chỉ dùng cho trường hợp single value (Dưới X triệu)
    isNegotiable?: boolean; // cho "Thoả thuận"
  };
}

export const PRICE_RANGES: PriceRange[] = [
  {
    label: 'Tất cả',
    sliderValue: [0, 20],
    apiParams: {},
  },
  {
    label: 'Dưới 1 triệu',
    sliderValue: [0, 1],
    apiParams: { priceTo: 1, price: 1 }, // price: 1 để backend xử lý riêng nếu cần
  },
  {
    label: '1 - 2 triệu',
    sliderValue: [1, 2],
    apiParams: { priceFrom: 1, priceTo: 2 },
  },
  {
    label: '2 - 4 triệu',
    sliderValue: [2, 4],
    apiParams: { priceFrom: 2, priceTo: 4 },
  },
  {
    label: '4 - 6 triệu',
    sliderValue: [4, 6],
    apiParams: { priceFrom: 4, priceTo: 6 },
  },
  {
    label: '6 - 8 triệu',
    sliderValue: [6, 8],
    apiParams: { priceFrom: 6, priceTo: 8 },
  },
  {
    label: '8 - 10 triệu',
    sliderValue: [8, 10],
    apiParams: { priceFrom: 8, priceTo: 10 },
  },
  {
    label: '10 - 15 triệu',
    sliderValue: [10, 15],
    apiParams: { priceFrom: 10, priceTo: 15 },
  },
  {
    label: '15 - 20 triệu',
    sliderValue: [15, 20],
    apiParams: { priceFrom: 15, priceTo: 20 },
  },
  {
    label: 'Trên 20 triệu',
    sliderValue: [20, 100],
    apiParams: { priceFrom: 20 },
  },
  {
    label: 'Thoả thuận',
    sliderValue: [0, 0],
    apiParams: { isNegotiable: true },
  },
];

// Helper để lấy apiParams từ label
export const getPriceParamsFromLabel = (label: PriceRangeKey) => {
  const range = PRICE_RANGES.find((r) => r.label === label);
  return range?.apiParams ?? {};
};

// Helper để lấy slider value từ label
export const getSliderValueFromLabel = (label: PriceRangeKey): [number, number] => {
  const range = PRICE_RANGES.find((r) => r.label === label);
  return range?.sliderValue ?? [0, 20];
};