import { Metadata } from 'next';

const titleBase = 'Bất động sản TP.HCM - Mua bán, cho thuê, dữ liệu minh bạch • 12/2025';
const descriptionBase =
  'Nguonnhagiare.vn - Nền tảng dữ liệu bất động sản hiện đại, minh bạch và cập nhật liên tục. Hỗ trợ tìm kiếm nhanh, so sánh hiệu quả và ra quyết định chính xác về mua bán - cho thuê nhà đất tại TP.HCM.';

export const homeMetadata: Metadata = {
  icons: {
    icon: '/favicon.png',
  },
  title: titleBase,
  description: descriptionBase,
  keywords: [
    'bất động sản',
    'nhà đất',
    'mua bán nhà đất',
    'cho thuê nhà',
    'cho thuê căn hộ',
    'căn hộ chung cư',
    'nhà phố',
    'đất nền',
    'bất động sản TP.HCM',
    'bất động sản giá rẻ',
    'bán nhà chính chủ',
    'thuê nhà nguyên căn',
    'chung cư giá tốt',
    'thị trường bất động sản 2025',
    'dữ liệu bất động sản',
    'nền tảng bất động sản',
    'tìm nhà nhanh',
    'so sánh bất động sản',
    'Nguonnhagiare.vn',
    'nguon nhagiare',
    'nguon nha gia re',
    'bất động sản chính chủ',
    'bản đồ bất động sản',
    'nhà đất minh bạch',
    'tin đăng nhà đất',
    'thông tin quy hoạch',
    'dịch vụ bất động sản',
    'định giá bất động sản',
    'giao dịch bất động sản an toàn',
  ],
  robots: 'index, follow',
  metadataBase: new URL('https://www.nguonnhagiare.vn'),
  openGraph: {
    title: titleBase,
    description: descriptionBase,
    url: 'https://www.nguonnhagiare.vn',
    siteName: 'Nguonnhagiare.vn',
    images: [
      {
        url: '/favicon.png',
        width: 1200,
        height: 630,
        alt: 'Nguonnhagiare.vn - Nền tảng dữ liệu bất động sản hiện đại',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: titleBase,
    description: descriptionBase,
    images: ['/favicon.png'],
  },
};
