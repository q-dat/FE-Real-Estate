export interface IRealEstateProject {
  _id: string;
  name: string; // Tên dự án
  slug: string; // SEO
  introduction?: string; // Giới thiệu
  description?: string; // Mô tả chi tiết
  article?: string; // Bài viết
  pricing?: string; // Bảng giá (string)
  status?: string; // Tình trạng (ví dụ: "0: Đang mở bán", "1: Sắp mở bán", "2: Đã bàn giao")
  projectType?: string; // Loại hình dự án
  area?: string; // Diện tích (vd: "80–120 m2")
  investor?: string; // Chủ đầu tư
  partners?: string; // Đối tác
  location?: string; // Vị trí (text hoặc địa chỉ)
  amenities?: string; // Tiện ích
  hotline?: string;
  email?: string;
  zalo?: string;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
}
