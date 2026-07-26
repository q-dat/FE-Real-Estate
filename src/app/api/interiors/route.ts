import { NextRequest, NextResponse } from 'next/server';
import { getAllInteriors } from '@/server/queries';

export const revalidate = 120;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params: Record<string, string> = {};
    ['category', 'status'].forEach((k) => {
      const v = searchParams.get(k);
      if (v) params[k] = v;
    });

    const list = await getAllInteriors(params);
    return NextResponse.json(
      { interiors: list },
      { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240' } }
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
