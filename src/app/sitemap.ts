import { MetadataRoute } from 'next';
import { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { IPost } from '@/types/post/post.types';
import { postService } from '@/services/post/post.service';
import { slugify } from '@/lib/slugify';

const DOMAIN = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nguonnhagiare.vn').replace(/\/$/, '');

type SitemapChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency'];

function createEntry(
  url: string,
  lastModified: Date,
  priority: number,
  changeFrequency: SitemapChangeFrequency = 'daily'
): MetadataRoute.Sitemap[number] {
  return {
    url,
    lastModified,
    changeFrequency,
    priority,
  };
}

function getValidDate(input?: string | Date): Date {
  if (!input) return new Date();

  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function getRentalPostSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const rentalPosts: IRentalPostAdmin[] = await rentalPostAdminService.getAll();

    return rentalPosts
      .filter((post) => post._id && post.title && (!post.status || post.status === 'active'))
      .map((post) => {
        const slug = slugify(post.title);
        const url = `${DOMAIN}/${slug}-${post._id}`;

        return createEntry(url, getValidDate(post.updatedAt || post.postedAt), 0.8, 'daily');
      });
  } catch (error) {
    console.error('[SITEMAP] Rental posts failed:', error);
    return [];
  }
}

async function getNewsPostSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const posts: IPost[] = await postService.getAll();

    return posts
      .filter((post) => post._id && (post.slug || post.title))
      .map((post) => {
        const slug = post.slug || slugify(post.title || 'tin-tuc');
        const url = `${DOMAIN}/tin-tuc/${slug}-${post._id}`;

        return createEntry(url, getValidDate(post.updatedAt || post.createdAt), 0.75, 'daily');
      });
  } catch (error) {
    console.error('[SITEMAP] News posts failed:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    createEntry(`${DOMAIN}`, new Date(), 1.0, 'daily'),
    createEntry(`${DOMAIN}/tin-tuc`, new Date(), 0.9, 'daily'),
    createEntry(`${DOMAIN}/can-ho`, new Date(), 0.8, 'daily'),
    createEntry(`${DOMAIN}/mat-bang`, new Date(), 0.8, 'daily'),
    createEntry(`${DOMAIN}/nha-nguyen-can`, new Date(), 0.8, 'daily'),
    createEntry(`${DOMAIN}/bat-dong-san-ban`, new Date(), 0.8, 'daily'),
    createEntry(`${DOMAIN}/bat-dong-san-du-an`, new Date(), 0.8, 'daily'),
    createEntry(`${DOMAIN}/thiet-ke-noi-that`, new Date(), 0.5, 'monthly'),
    createEntry(`${DOMAIN}/tu-van-tim-nha`, new Date(), 0.5, 'monthly'),
    createEntry(`${DOMAIN}/lien-he-ky-gui`, new Date(), 0.5, 'monthly'),
  ];

  const [rentalPages, newsPages] = await Promise.all([getRentalPostSitemap(), getNewsPostSitemap()]);

  return [...staticPages, ...rentalPages, ...newsPages];
}
