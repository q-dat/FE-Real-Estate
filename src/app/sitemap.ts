import { MetadataRoute } from 'next';
import { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import { rentalPostAdminService } from '@/services/rentalPostAdmin.service';
import { encodeObjectId } from '@/utils/DetailPage/objectIdCodec.utils';

//  Constants
const DOMAIN = 'https://www.nguonnhagiare.vn';

const DAILY: MetadataRoute.Sitemap[number]['changeFrequency'] = 'daily';

//  Utils
const slugify = (text: string): string =>
  text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createEntry = (url: string, lastModified: Date, priority = 0.7): MetadataRoute.Sitemap[number] => ({
  url,
  lastModified,
  changeFrequency: DAILY,
  priority,
});

//  Dynamic Posts Sitemap
async function getPostSitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [];

  try {
    const posts: IRentalPostAdmin[] = await rentalPostAdminService.getAll();

    if (!posts.length) return sitemap;

    for (const post of posts) {
      if (!post._id || !post.title) continue;
      if (post.status && post.status !== 'active') continue;

      const slug = slugify(post.title);
      if (!slug) continue;

      const rawId = post._id;
      const encodedId = encodeObjectId(rawId);
      const lastModified = post.updatedAt ? new Date(post.updatedAt) : new Date();

      // Canonical: /slug/id
      const canonicalUrl = `${DOMAIN}/${slug}/${rawId}`;

      // Variants SEO
      const slugOnlyUrl = `${DOMAIN}/${slug}`;
      const slugEncodedIdUrl = `${DOMAIN}/${slug}/${encodedId}`;
      const slugRawIdDashUrl = `${DOMAIN}/${slug}-${rawId}`;
      const slugEncodedIdDashUrl = `${DOMAIN}/${slug}-${encodedId}`;
      const codeUrl = `${DOMAIN}/c/${post.code}`;

      sitemap.push(
        createEntry(canonicalUrl, lastModified, 0.8),
        createEntry(slugOnlyUrl, lastModified, 0.6),
        createEntry(slugEncodedIdUrl, lastModified, 0.5),
        createEntry(slugRawIdDashUrl, lastModified, 0.5),
        createEntry(slugEncodedIdDashUrl, lastModified, 0.5),
        createEntry(codeUrl, lastModified, 0.4)
      );
    }
  } catch (error) {
    console.error('[SITEMAP] getPostSitemap failed:', error);
  }

  return sitemap;
}

//  Static + Dynamic
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    createEntry(`${DOMAIN}`, new Date(), 1),

    createEntry(`${DOMAIN}/can-ho`, new Date()),
    createEntry(`${DOMAIN}/mat-bang`, new Date()),
    createEntry(`${DOMAIN}/nha-nguyen-can`, new Date()),

    createEntry(`${DOMAIN}/bat-dong-san-ban`, new Date()),
    createEntry(`${DOMAIN}/bat-dong-san-du-an`, new Date()),

    createEntry(`${DOMAIN}/thiet-ke-noi-that`, new Date(), 0.6),
    createEntry(`${DOMAIN}/tu-van-tim-nha`, new Date(), 0.6),
    createEntry(`${DOMAIN}/lien-he-ky-gui`, new Date(), 0.6),
  ];

  const postPages = await getPostSitemap();
  console.log('____Static Pages Count:', staticPages.length); // Debug
  console.log('____Dynamic Pages Count:', postPages.length); // Debug
  console.log('____Total Pages:', [...staticPages, ...postPages].length); // Debug

  return [...staticPages, ...postPages].slice(0, 5000);
}
