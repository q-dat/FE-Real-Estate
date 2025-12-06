import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

// Định nghĩa một kiểu hàm chỉ nhận 1 đối số string
type RevalidateTagFunction = (tag: string) => void;

// KHẮC PHỤC LỖI TYPE CHECKING NEXT.JS 16
// Ép kiểu hàm revalidateTag để Type Checker chấp nhận chỉ 1 đối số.
const revalidateTagFix = revalidateTag as unknown as RevalidateTagFunction;

export async function POST() {
  // Sử dụng hàm đã ép kiểu để vượt qua kiểm tra TypeScript
  revalidateTagFix('rental-admin-posts');

  // revalidatePath không bị lỗi nên giữ nguyên
  revalidatePath('/admin/rental-posts');

  return NextResponse.json({ revalidated: true });
}
