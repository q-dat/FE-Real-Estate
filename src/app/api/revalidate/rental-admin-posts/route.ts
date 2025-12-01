import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST() {
  revalidateTag('rental-admin-posts');
  revalidatePath('/admin/rental-posts');

  return NextResponse.json({ revalidated: true });
}
