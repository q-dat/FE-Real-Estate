import { NextResponse } from 'next/server';
import { getServerApiUrl } from '@/hooks/useApiUrl';

export async function GET() {
  try {
    const res = await fetch(getServerApiUrl('api/rental-categories'), {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Backend not ready');
    }

    return NextResponse.json({
      status: 'ok',
      backend: 'alive',
      timestamp: Date.now(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        status: 'error',
        backend: 'sleeping',
      },
      { status: 503 }
    );
  }
}
