import { NextRequest, NextResponse } from 'next/server';
import { getRealEstateProjectBySlug } from '@/server/queries';

export const revalidate = 300;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const project = await getRealEstateProjectBySlug(slug);

    if (!project) {
      return NextResponse.json({ message: 'Dự án không tồn tại!' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Lấy dự án theo slug thành công!', project },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
