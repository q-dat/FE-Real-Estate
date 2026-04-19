import { permanentRedirect, notFound } from 'next/navigation';
import { postService } from '@/services/post/post.service';
import ClientPostDetailPage from './ClientPostDetailPage';
import { generateNewsPostMetadata } from '@/metadata/news/news-post.metadata';

type PageProps = {
  params: Promise<{ slug: string[] }>;
};
export async function generateMetadata({ params }: PageProps) {
  const { slug: paramsArray } = await params;

  if (!paramsArray || paramsArray.length === 0) return {};

  const parts = paramsArray.length > 1 ? paramsArray : paramsArray[0].split('-');
  const potentialId = parts[parts.length - 1];

  const isMongoId = /^[a-fA-F0-9]{24}$/.test(potentialId);

  if (!isMongoId) {
    return {
      title: 'Không tìm thấy bài viết - Nguồn Nhà Giá Rẻ',
      description: 'Bài viết không tồn tại hoặc đã bị xóa.',
      robots: 'noindex, nofollow',
    };
  }

  const post = await postService.getFallback(potentialId);

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết - Nguồn Nhà Giá Rẻ',
      robots: 'noindex, nofollow',
    };
  }

  // Gọi hàm build meta chuẩn SEO
  return generateNewsPostMetadata(post);
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug: paramsArray } = await params;

  if (!paramsArray || paramsArray.length === 0) {
    return notFound();
  }

  // Khởi tạo các biến để phân tích URL
  let potentialId = '';
  let rawSlug = '';
  let needsRedirect = false;

  if (paramsArray.length > 1) {
    // Trường hợp URL từ hệ thống cũ có dấu gạch chéo: /tin-tuc/slug/id
    rawSlug = paramsArray[0];
    potentialId = paramsArray[paramsArray.length - 1];
    needsRedirect = true;
  } else {
    // Trường hợp URL định dạng mới: /tin-tuc/slug-id
    const parts = paramsArray[0].split('-');
    potentialId = parts[parts.length - 1];
    rawSlug = parts.slice(0, -1).join('-');
  }

  // Kiểm tra định dạng ID (24 ký tự hex của MongoDB)
  const isMongoId = /^[a-fA-F0-9]{24}$/.test(potentialId);

  if (isMongoId) {
    const post = await postService.getFallback(potentialId);

    if (!post) {
      return notFound();
    }

    // So sánh đối chiếu slug để đảm bảo tính nhất quán của URL (Self-healing)
    if (needsRedirect || post.slug !== rawSlug) {
      permanentRedirect(`/tin-tuc/${post.slug}-${post._id}`);
    }

    return <ClientPostDetailPage post={post} relatedPosts={[]} catalogWithPosts={[]} />;
  }

  // Xử lý fallback cho các URL cũ chỉ chứa slug
  const querySlug = paramsArray.join('/');
  const postFallback = await postService.getBySlug(querySlug);

  if (!postFallback || !postFallback._id) {
    return notFound();
  }

  permanentRedirect(`/tin-tuc/${postFallback.slug}-${postFallback._id}`);
}
