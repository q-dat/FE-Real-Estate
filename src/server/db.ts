import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';

// Đảm bảo connection được establish trước khi query.
export async function getDb(): Promise<typeof mongoose> {
  return connectDB();
}

export { mongoose };
