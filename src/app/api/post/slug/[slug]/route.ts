import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug } from '@/server/queries';

export const revalidate = 120;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json({ message: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Lấy bài viết thành công', post },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
