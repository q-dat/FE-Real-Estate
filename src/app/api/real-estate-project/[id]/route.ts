import { NextRequest, NextResponse } from 'next/server';
import { getRealEstateProjectById } from '@/server/queries';

export const revalidate = 300;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getRealEstateProjectById(id);

    if (!project) {
      return NextResponse.json({ message: 'Dự án không tồn tại!' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Lấy dự án theo id thành công!', project },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
