import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    // FE giờ tự query DB, health check kết nối MongoDB trực tiếp (không cần BE)
    await connectDB();

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      timestamp: Date.now(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        status: 'error',
        db: 'unavailable',
        message: e instanceof Error ? e.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
