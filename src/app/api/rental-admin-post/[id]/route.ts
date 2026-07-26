import { NextRequest, NextResponse } from 'next/server';
import { getRentalPostAdminById } from '@/server/queries';

export const revalidate = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await getRentalPostAdminById(id);

    if (!post) {
      return NextResponse.json({ message: 'Bài đăng không tồn tại!' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Lấy bài đăng theo id thành công!', rentalPost: post },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ!', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
