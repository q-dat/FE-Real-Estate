import { ReactNode } from 'react';
import { homeMetadata } from '@/metadata/home.metadata';

export const metadata = homeMetadata;

export default function RootLayout({ children }: { children: ReactNode }) {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Nguồn Nhà Giá Rẻ',
      url: 'https://www.nguonnhagiare.vn',
      logo: 'https://www.nguonnhagiare.vn/favicon.png',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Nguồn Nhà Giá Rẻ',
      url: 'https://www.nguonnhagiare.vn',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.nguonnhagiare.vn/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <html lang="vi">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {children}
      </body>
    </html>
  );
}
