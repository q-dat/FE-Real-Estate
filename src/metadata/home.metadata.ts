import { Metadata } from 'next';

const BRAND = 'Nguồn Nhà Giá Rẻ';
const DOMAIN = 'https://www.nguonnhagiare.vn';

const titleBase = `${BRAND} | Bất Động Sản TP.HCM Chính Chủ, Giá Tốt 2026`;

const descriptionBase =
  `${BRAND} là nền tảng dữ liệu bất động sản minh bạch tại TP.HCM. ` +
  `Tìm kiếm mua bán, cho thuê nhà đất chính chủ, so sánh giá, ` +
  `xem dữ liệu thị trường cập nhật liên tục và ra quyết định chính xác.`;

export const homeMetadata: Metadata = {
  metadataBase: new URL(DOMAIN),

  title: {
    default: titleBase,
    template: `%s | ${BRAND}`,
  },

  description: descriptionBase,

  keywords: [
    BRAND,
    'Nguon Nha Gia Re',
    'nguon nha gia re',
    'bất động sản TP.HCM',
    'nhà đất giá rẻ',
    'mua bán nhà chính chủ',
    'cho thuê nhà TP.HCM',
    'căn hộ chung cư giá tốt',
    'đất nền TP.HCM',
    'bản đồ bất động sản',
    'dữ liệu bất động sản minh bạch',
    'so sánh giá nhà đất',
    'định giá bất động sản',
  ],

  alternates: {
    canonical: '/',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },

  icons: {
    icon: '/favicon.png',
  },

  openGraph: {
    type: 'website',
    url: DOMAIN,
    siteName: BRAND,
    title: titleBase,
    description: descriptionBase,
    images: [
      {
        url: '/favicon.png',
        width: 1200,
        height: 630,
        alt: `${BRAND} - Nền tảng dữ liệu bất động sản`,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: titleBase,
    description: descriptionBase,
    images: ['/favicon.png'],
  },
};
