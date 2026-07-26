import { NextRequest, NextResponse } from 'next/server';
import { getAllRealEstateProjects } from '@/server/queries';

export const revalidate = 300;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params: Record<string, string> = {};
    ['status', 'projectType', 'investor'].forEach((k) => {
      const v = searchParams.get(k);
      if (v) params[k] = v;
    });

    const data = await getAllRealEstateProjects(params);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (e) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
