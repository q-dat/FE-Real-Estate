import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
// Tải lên Cloudinary
export async function uploadToCloudinary(file: Blob, folder: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

  return await cloudinary.uploader.upload(base64, {
    folder,
    format: 'webp',
    transformation: [{ width: 300, height: 300, crop: 'fill' }],
  });
}
export default cloudinary;
