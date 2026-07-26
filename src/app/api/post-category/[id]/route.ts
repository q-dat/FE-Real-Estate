import { NextRequest, NextResponse } from 'next/server';
import { getPostCategoryById } from '@/server/queries';

export const revalidate = 300;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const c = await getPostCategoryById(id);

    if (!c) {
      return NextResponse.json({ message: 'Không tìm thấy danh mục' }, { status: 404 });
    }

    return NextResponse.json({ postCategory: c });
  } catch (e) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
