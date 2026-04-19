import { MetadataRoute } from 'next';
import { IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { IPost } from '@/types/post/post.types';
import { postService } from '@/services/post/post.service';
import { slugify } from '@/lib/slugify';

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nguonnhagiare.vn';

// Hàm helper chuẩn hóa
const createEntry = (
  url: string,
  lastModified: Date,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'daily'
): MetadataRoute.Sitemap[number] => ({
  url,
  lastModified,
  changeFrequency,
  priority,
});

/* Rental Posts */
async function getRentalPostSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Lưu ý kiến trúc: Ở dự án lớn, không nên dùng getAll() nếu vượt quá 10.000 record.
    // Nên gọi API lấy ra mảng chứa { _id, title, updatedAt } thôi để tối ưu RAM.
    const rentalPosts: IRentalPostAdmin[] = await rentalPostAdminService.getAll();

    if (!rentalPosts?.length) return [];

    return rentalPosts
      .filter((post) => post._id && post.title && (!post.status || post.status === 'active'))
      .map((post) => {
        const slug = slugify(post.title);
        const lastModified = post.updatedAt ? new Date(post.updatedAt) : new Date();

        // CẬP NHẬT: Khớp chuẩn xác với file [..slug]/page.tsx (để ở root domain)
        const url = `${DOMAIN}/${slug}-${post._id}`;

        return createEntry(url, lastModified, 0.8, 'daily');
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

        const url = `${DOMAIN}/tin-tuc/${slug}-${post._id}`;

        return createEntry(url, lastModified, 0.7, 'daily');
      });
  } catch (error) {
    console.error('[SITEMAP] News posts failed:', error);
    return [];
  }
}

/* Root Sitemap */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    // Trang chủ: Tần suất thay đổi liên tục, độ ưu tiên cao nhất
    createEntry(`${DOMAIN}`, new Date(), 1.0, 'hourly'),

    // Các trang danh mục: Chứa danh sách bài viết mới mỗi ngày
    createEntry(`${DOMAIN}/tin-tuc`, new Date(), 0.9, 'hourly'),
    createEntry(`${DOMAIN}/can-ho`, new Date(), 0.9, 'hourly'),
    createEntry(`${DOMAIN}/mat-bang`, new Date(), 0.9, 'hourly'),
    createEntry(`${DOMAIN}/nha-nguyen-can`, new Date(), 0.9, 'hourly'),
    createEntry(`${DOMAIN}/bat-dong-san-ban`, new Date(), 0.9, 'hourly'),
    createEntry(`${DOMAIN}/bat-dong-san-du-an`, new Date(), 0.9, 'hourly'),

    // Các trang tĩnh ít thay đổi
    createEntry(`${DOMAIN}/thiet-ke-noi-that`, new Date(), 0.6, 'monthly'),
    createEntry(`${DOMAIN}/tu-van-tim-nha`, new Date(), 0.6, 'monthly'),
    createEntry(`${DOMAIN}/lien-he-ky-gui`, new Date(), 0.6, 'monthly'),
  ];

  const [rentalPages, newsPages] = await Promise.all([getRentalPostSitemap(), getNewsPostSitemap()]);

  return [...staticPages, ...rentalPages, ...newsPages];
}
