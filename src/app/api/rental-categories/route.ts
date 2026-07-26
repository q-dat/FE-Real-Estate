import { NextResponse } from 'next/server';
import { getAllRentalCategories } from '@/server/queries';

export const revalidate = 300;

export async function GET() {
  try {
    const list = await getAllRentalCategories();
    return NextResponse.json(list, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (e) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
