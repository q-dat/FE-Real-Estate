import { slugify } from '@/lib/slugify';
import { IPost } from '@/types/post/post.types';

interface NewsArticleJsonLdProps {
  post: IPost;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toIsoDate(date: Date | string | undefined): string {
  if (!date) return new Date().toISOString();

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString();
  }

  return parsedDate.toISOString();
}

function getAbsoluteImageUrl(image: string | undefined, siteUrl: string): string {
  if (!image) return `${siteUrl}/images/news-default-thumbnail.jpg`;

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  if (image.startsWith('/')) {
    return `${siteUrl}${image}`;
  }

  return `${siteUrl}/${image}`;
}

export default function NewsArticleJsonLd({ post }: NewsArticleJsonLdProps) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nguonnhagiare.vn').replace(/\/$/, '');

  const title = post.title || 'Tin tức bất động sản';
  const slug = post.slug || slugify(title);
  const canonicalUrl = `${siteUrl}/tin-tuc/${slug}-${post._id}`;

  const plainContent = stripHtml(post.content || '');
  const description =
    plainContent.length > 160 ? `${plainContent.slice(0, 157).trim()}...` : plainContent || title;

  const imageUrl = getAbsoluteImageUrl(post.image, siteUrl);
  const publishedTime = toIsoDate(post.createdAt);
  const modifiedTime = toIsoDate(post.updatedAt || post.createdAt);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: title,
    description,
    image: [imageUrl],
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: {
      '@type': 'Organization',
      name: 'Nguồn Nhà Giá Rẻ',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nguồn Nhà Giá Rẻ',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  );
}