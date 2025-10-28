import { NextResponse } from 'next/server';
import { RentalCategory } from '@/models/RentalCategory';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  await connectDB();
  const categories = await RentalCategory.find().sort({ createdAt: -1 });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();
  const category = await RentalCategory.create(data);
  return NextResponse.json(category, { status: 201 });
}

export async function PUT(req: Request) {
  await connectDB();
  const { _id, ...update } = await req.json();
  const category = await RentalCategory.findByIdAndUpdate(_id, update, { new: true });
  return NextResponse.json(category);
}

export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();
  await RentalCategory.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Đã xóa thành công' });
}
