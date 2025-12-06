import { IRentalAuthor } from '../rentalAuthor/rentalAuthor';
import { IRentalCategory } from '../rentalCategory/rentalCategory';

/**
 * RentalPost - Bài đăng cho thuê / tìm người ở ghép / nhà, mặt bằng
 */
export interface IRentalPost {
  _id: string; // id bài đăng (ObjectId)
  code: string; // mã bài đăng ngắn (vd: "POST-17234")

  /** THÔNG TIN CƠ BẢN */
  title: string; // tiêu đề bài đăng
  description: string; // mô tả chi tiết nội dung bài đăng

  category: IRentalCategory; // danh mục (liên kết đến bảng danh mục)

  price: number; // giá cho thuê (VNĐ)
  priceUnit: string; // đơn vị giá (vd: "VNĐ/tháng")
  area: number; // diện tích (m2)

  province: string; // tỉnh/thành phố
  district: string; // quận/huyện
  ward?: string; // phường/xã
  address: string; // địa chỉ cụ thể

  /** HÌNH ẢNH & VIDEO */
  images: string[]; // danh sách ảnh
  amenities?: string[]; // tiện ích đi kèm (vd: máy lạnh, chỗ để xe,...)

  youtubeLink?: string; // link video Youtube người đăng nhập
  videoTitle?: string; // tiêu đề video minh họa
  videoDescription?: string; // mô tả ngắn cho video

  /** TRẠNG THÁI & LOẠI TIN */
  postType: 'basic' | 'vip1' | 'vip2' | 'vip3' | 'highlight'; // loại tin (ảnh hưởng hiển thị)
  fastRent: 0 | 1; // Thuê nhanh (0 = tắt, 1 = bật)
  status: 'active' | 'pending' | 'expired' | 'hidden'; // trạng thái tin
  isApproved: boolean; // tin đã được admin duyệt chưa

  /** GÓI ĐĂNG TIN */
  postPackage: {
    packageName: 'Tin thường' | 'VIP1' | 'VIP2' | 'VIP3'; // tên gói
    pricePerDay: number; // giá mỗi ngày (VNĐ)
    days: number; // số ngày đăng
    totalPrice: number; // tổng tiền (tính = pricePerDay * days)
    purchasedAt?: string; // ngày mua gói
    expiredAt?: string; // ngày hết hạn gói
    autoExtend?: boolean; // có bật gia hạn tự động không
  };

  /** ĐẨY TIN TỰ ĐỘNG */
  autoBoost?: {
    enabled: boolean; // true = bật tự động đẩy tin
    intervalHours: number; // ví dụ: 7h/lần
    lastBoostAt?: string; // thời điểm đẩy gần nhất
    nextBoostAt?: string; // thời điểm dự kiến đẩy tiếp
  };

  /** THỐNG KÊ & TƯƠNG TÁC */
  views: number; // số lượt xem
  favoritesCount: number; // số lượt yêu thích

  /** THÔNG TIN NGƯỜI ĐĂNG */
  author: IRentalAuthor; // người đăng tin

  /** THỜI GIAN & QUẢN TRỊ */
  expiredAt?: string; // ngày hết hạn tin
  adminNote?: string; // ghi chú nội bộ cho admin
  createdAt: string; // ngày tạo tin
  updatedAt: string; // ngày cập nhật gần nhất
}
