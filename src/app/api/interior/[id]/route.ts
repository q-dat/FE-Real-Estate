import { NextRequest, NextResponse } from 'next/server';
import { getInteriorById } from '@/server/queries';

export const revalidate = 120;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await getInteriorById(id);

    if (!item) {
      return NextResponse.json({ message: 'Không tìm thấy' }, { status: 404 });
    }

    return NextResponse.json(
      { interior: item },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
