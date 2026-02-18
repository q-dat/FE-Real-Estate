import { MetadataRoute } from 'next';
import { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { IPost } from '@/types/post/post.types';
import { postService } from '@/services/post/post.service';
import { encodeObjectId } from '@/utils/DetailPage/objectIdCodec.utils';

const DOMAIN = 'https://www.nguonnhagiare.vn';

const DAILY: MetadataRoute.Sitemap[number]['changeFrequency'] = 'daily';

const slugify = (text: string): string =>
  text
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

/* Rental Posts */
async function getRentalPostSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const rentalPosts: IRentalPostAdmin[] = await rentalPostAdminService.getAll();

    if (!rentalPosts?.length) return [];

    return rentalPosts
      .filter((post) => post._id && post.title && (!post.status || post.status === 'active'))
      .map((post) => {
        const slug = slugify(post.title);
        const encodedId = encodeObjectId(post._id);

        const lastModified = post.updatedAt ? new Date(post.updatedAt) : new Date();

        const url = `${DOMAIN}/${slug}/${encodedId}`;

        return createEntry(url, lastModified, 0.8);
      });
  } catch (error) {
    console.error('[SITEMAP] Rental posts failed:', error);
    return [];
  }
}

/* News Posts */
async function getNewsPostSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const posts: IPost[] = await postService.getAll();

    if (!posts?.length) return [];

    return posts
      .filter((post) => post._id && post.slug)
      .map((post) => {
        const slug = post.slug;

        const lastModified = post.updatedAt ? new Date(post.updatedAt) : new Date();

        // const url = `${DOMAIN}/tin-tuc/${slug}/${post._id}`;
        const url = `${DOMAIN}/tin-tuc/${slug}`;

        return createEntry(url, lastModified, 0.7);
      });
  } catch (error) {
    console.error('[SITEMAP] News posts failed:', error);
    return [];
  }
}

/* Root Sitemap */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    createEntry(`${DOMAIN}`, new Date(), 1),
    createEntry(`${DOMAIN}/tin-tuc`, new Date(), 0.9),

    createEntry(`${DOMAIN}/can-ho`, new Date()),
    createEntry(`${DOMAIN}/mat-bang`, new Date()),
    createEntry(`${DOMAIN}/nha-nguyen-can`, new Date()),

    createEntry(`${DOMAIN}/bat-dong-san-ban`, new Date()),
    createEntry(`${DOMAIN}/bat-dong-san-du-an`, new Date()),

    createEntry(`${DOMAIN}/thiet-ke-noi-that`, new Date(), 0.6),
    createEntry(`${DOMAIN}/tu-van-tim-nha`, new Date(), 0.6),
    createEntry(`${DOMAIN}/lien-he-ky-gui`, new Date(), 0.6),
  ];

  const [rentalPages, newsPages] = await Promise.all([getRentalPostSitemap(), getNewsPostSitemap()]);
  // console.log('____Static Pages Count:', staticPages.length);
  // console.log('____Dynamic Pages Count:', rentalPages.length + newsPages.length);
  // console.log('____Total Pages:', [...staticPages, ...rentalPages, ...newsPages].length);

  return [...staticPages, ...rentalPages, ...newsPages];
}
