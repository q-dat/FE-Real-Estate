import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/server/queries';

export const revalidate = 120;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params: Record<string, string> = {};
    ['catalog', 'published'].forEach((k) => {
      const v = searchParams.get(k);
      if (v !== null) params[k] = v;
    });

    const data = await getAllPosts(params);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240' },
    });
  } catch (e) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
