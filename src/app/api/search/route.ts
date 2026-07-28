import { NextRequest, NextResponse } from 'next/server';
import { searchRentalPosts } from '@/server/queries';
import type { SearchKind } from '@/types/rentalGridItem';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const keyword = (req.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 100);
  const rawType = req.nextUrl.searchParams.get('type');
  const searchType: SearchKind = rawType === 'code' ? 'code' : 'title';

  if (!keyword) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchRentalPosts(keyword, 8, searchType);

    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Search error:', error);

    return NextResponse.json({ results: [], error: 'search_failed' }, { status: 500 });
  }
}
