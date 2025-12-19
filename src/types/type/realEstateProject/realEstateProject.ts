export interface IRealEstateProject {
  _id: string
  name: string // Tên dự án
  images: string
  thumbnails?: string[]
  province?: string // tỉnh/thành phố
  district?: string // quận/huyện
  ward?: string // phường/xã
  address: string // địa chỉ cụ thể
  slug: string // SEO
  introduction?: string // Giới thiệu
  description?: string // Mô tả chi tiết
  article?: string // Bài viết
  pricing?: string // Bảng giá (string)
  status?: string // Tình trạng (ví dụ: "0: Đang mở bán", "1: Sắp mở bán", "2: Đã bàn giao")
  projectType?: string // Loại hình dự án
  area?: string // Diện tích (vd: "80–120 m2")
  investor?: string // Chủ đầu tư
  partners?: string // Đối tác
  amenities?: string // Tiện ích (text / HTML)
  hotline?: string
  email?: string
  zalo?: string
  message?: string
  createdAt?: string
  updatedAt?: string
}
