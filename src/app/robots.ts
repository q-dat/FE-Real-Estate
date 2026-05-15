import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nguonnhagiare.vn';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/cms/',
          '/cms/*',
          '/api/admin/',
          '/api/admin/*',
          '/auth/',
          '/auth/*',
          '/*?_rsc=',
          '/*?*preview=',
          '/*?*token=',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
