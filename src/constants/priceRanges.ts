export type PriceRangeKey =
  | 'Tất cả'
  | 'Dưới 1'
  | '1 - 2'
  | '2 - 4'
  | '4 - 6'
  | '6 - 8'
  | '8 - 10'
  | '10 - 15'
  | '15 - 20'
  | '20 - 30'
  | '30 - 50'
  | '50 - 100'
  | '100 - 500'
  | 'Trên 500'
  | 'Thoả thuận';

export interface PriceRange {
  label: PriceRangeKey;
  // Dùng cho UI slider (min/max thực tế hiển thị). *Lưu ý: Giả sử max slider limit là 500*
  sliderValue: [number, number]; // [min, max] – dùng cho modal
  // Dùng cho API params
  apiParams: {
    priceFrom?: number;
    priceTo?: number;
    price?: number; // chỉ dùng cho trường hợp single value
    isNegotiable?: boolean; // cho "Thoả thuận"
  };
}

// Giả định MAX_SLIDER_LIMIT là 500 (vì mức Trên 500 là max)
const MAX_SLIDER_LIMIT = 500;

export const PRICE_RANGES: PriceRange[] = [
  {
    label: 'Tất cả',
    sliderValue: [0, MAX_SLIDER_LIMIT],
    apiParams: {},
  },
  {
    label: 'Dưới 1',
    sliderValue: [0, 1],
    apiParams: { priceTo: 1, price: 1 },
  },
  {
    label: '1 - 2',
    sliderValue: [1, 2],
    apiParams: { priceFrom: 1, priceTo: 2 },
  },
  {
    label: '2 - 4',
    sliderValue: [2, 4],
    apiParams: { priceFrom: 2, priceTo: 4 },
  },
  {
    label: '4 - 6',
    sliderValue: [4, 6],
    apiParams: { priceFrom: 4, priceTo: 6 },
  },
  {
    label: '6 - 8',
    sliderValue: [6, 8],
    apiParams: { priceFrom: 6, priceTo: 8 },
  },
  {
    label: '8 - 10',
    sliderValue: [8, 10],
    apiParams: { priceFrom: 8, priceTo: 10 },
  },
  {
    label: '10 - 15',
    sliderValue: [10, 15],
    apiParams: { priceFrom: 10, priceTo: 15 },
  },
  {
    label: '15 - 20',
    sliderValue: [15, 20],
    apiParams: { priceFrom: 15, priceTo: 20 },
  },
  // --- MỨC GIÁ MỚI THÊM VÀO ---
  {
    label: '20 - 30',
    sliderValue: [20, 30],
    apiParams: { priceFrom: 20, priceTo: 30 },
  },
  {
    label: '30 - 50',
    sliderValue: [30, 50],
    apiParams: { priceFrom: 30, priceTo: 50 },
  },
  {
    label: '50 - 100',
    sliderValue: [50, 100],
    apiParams: { priceFrom: 50, priceTo: 100 },
  },
  {
    label: '100 - 500',
    sliderValue: [100, MAX_SLIDER_LIMIT], // Sử dụng MAX_SLIDER_LIMIT = 500
    apiParams: { priceFrom: 100, priceTo: 500 },
  },
  // --- MỨC CUỐI CÙNG CẬP NHẬT ---
  {
    label: 'Trên 500',
    sliderValue: [MAX_SLIDER_LIMIT, MAX_SLIDER_LIMIT],
    apiParams: { priceFrom: 500 }, // Chỉ cần priceFrom: 500
  },
  {
    label: 'Thoả thuận',
    sliderValue: [0, 0], // Giá trị 0/0 để không ảnh hưởng đến slider
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
  // Nếu không tìm thấy, trả về toàn bộ dải giá (0 đến MAX_SLIDER_LIMIT)
  return range?.sliderValue ?? [0, MAX_SLIDER_LIMIT];
};
