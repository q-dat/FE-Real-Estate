import { IRentalCategory } from '../rentalCategory/rentalCategory';

export interface IRentalPostAdmin {
  _id: string; // id bài đăng (ObjectId)
  code: string; // mã bài đăng ngắn (vd: "POST-17234")
  images: string[]; // danh sách ảnh
  phoneNumbers?: string; // danh sách số điện thoại liên hệ
  zaloLink?: string; // link Zalo liên hệ
  title: string; // tiêu đề bài đăng
  description: string; // mô tả chi tiết nội dung bài đăng
  category: IRentalCategory ; // danh mục (liên kết đến bảng danh mục)
  price: number; // giá cho thuê (VNĐ)
  priceUnit: string; // đơn vị giá (vd: "VNĐ/tháng")
  area: number; // diện tích (m2)
  province: string; // tỉnh/thành phố
  district: string; // quận/huyện
  ward?: string; // phường/xã
  address: string; // địa chỉ cụ thể
  coordinates?: { lat: number; lng: number }; // vị trí bản đồ
  amenities?: string; // tiện ích đi kèm (vd: máy lạnh, chỗ để xe,...)
  youtubeLink?: string; // link video Youtube người đăng nhập
  videoTitle?: string; // tiêu đề video minh họa
  videoDescription?: string; // mô tả ngắn cho video
  status: 'active' | 'pending' | 'expired' | 'hidden'; // trạng thái tin
  author?: string; // người đăng tin
  adminNote?: string; // ghi chú nội bộ cho admin
  createdAt: string; // ngày tạo tin
  updatedAt: string; // ngày cập nhật gần nhất
}
