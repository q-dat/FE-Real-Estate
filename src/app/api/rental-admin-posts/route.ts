import { NextRequest, NextResponse } from 'next/server';
import { getAllRentalPostsAdmin } from '@/server/queries';

export const revalidate = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params: Record<string, string | number | undefined> = {};

    const keys = [
      'page', 'limit', 'catalogID', 'categoryCode', 'title', 'code',
      'price', 'priceFrom', 'priceTo', 'area', 'areaFrom', 'areaTo',
      'frontageWidth', 'lotDepth', 'backSize', 'pricePerM2From', 'pricePerM2To',
      'province', 'district', 'ward', 'propertyType', 'locationType', 'direction',
      'legalStatus', 'furnitureStatus', 'bedroomNumber', 'toiletNumber', 'floorNumber',
      'postType', 'status', 'author',
    ];

    keys.forEach((k) => {
      const v = searchParams.get(k);
      if (v !== null && v !== '') params[k] = v;
    });

    const data = await getAllRentalPostsAdmin(params);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (e) {
    return NextResponse.json(
      { message: 'Lỗi máy chủ', error: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
