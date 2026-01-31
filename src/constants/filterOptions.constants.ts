// src/constants/filterOptions.ts

export const DIRECTIONS = [
  'Đông', 'Tây', 'Nam', 'Bắc',
  'Đông Nam', 'Đông Bắc', 'Tây Nam', 'Tây Bắc'
];

export const FURNITURE_STATUS = [
  { label: 'Nội thất đầy đủ', value: 'Đầy đủ' },
  { label: 'Hoàn thiện cơ bản', value: 'Cơ bản' },
  { label: 'Nhà trống', value: 'Không có' },
];

export const LEGAL_STATUS = [
  'Sổ hồng', 'Sổ đỏ', 'Hợp đồng mua bán', 'Đang chờ sổ'
];

export const LOCATION_TYPE = [
  { label: 'Mặt tiền', value: 'Mặt tiền' },
  { label: 'Trong hẻm', value: 'Hẻm' },
];

// Admin filters
export const POST_STATUS = [
  { label: 'Đang hiển thị', value: 'active', color: 'text-green-600 bg-green-50' },
  { label: 'Chờ duyệt', value: 'pending', color: 'text-yellow-600 bg-yellow-50' },
  { label: 'Đã ẩn', value: 'hidden', color: 'text-gray-600 bg-gray-50' },
  { label: 'Hết hạn', value: 'expired', color: 'text-red-600 bg-red-50' },
];

export const POST_TYPES = [
  { label: 'Tin thường', value: 'basic' },
  { label: 'VIP 1', value: 'vip1' },
  { label: 'VIP 2', value: 'vip2' },
  { label: 'VIP 3', value: 'vip3' },
  { label: 'Nổi bật', value: 'highlight' },
];