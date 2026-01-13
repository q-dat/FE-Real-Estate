import { IRentalCategory } from '../rentalCategory/rentalCategory';

export interface IRentalAuthorProfile {
  avatar?: string;
  displayName?: string;
  username?: string;
  aboutMe?: string;
  instagram?: string;
  messenger?: string;
  facebook?: string;
  viberNumber?: string;
  phoneNumber?: string;
  zaloNumber?: string;
}

export interface IRentalAuthor {
  _id: string;
  email?: string;
  avatar?: string;
  profile?: IRentalAuthorProfile;
}
export interface IRentalPostAdmin {
  _id: string; // id bài đăng (ObjectId)
  code: string; // mã bài đăng ngắn (vd: "POST-17234")
  images: string[]; // danh sách ảnh
  title: string; // tiêu đề bài đăng
  description: string; // mô tả chi tiết nội dung bài đăng
  category: IRentalCategory; // danh mục (liên kết đến bảng danh mục)
  propertyType?: string; // loại hình bất động sản (vd: "Căn hộ", "Nhà phố",...)
  locationType?: string; // loại hình vị trí (vd: "đường lớn", "hẻm",...)
  direction?: string; // hướng nhà (vd: "Đông", "Tây",...)
  price: number; // Giá bán hoặc giá thuê
  priceUnit: string; // VD: "Tỷ", "Triệu/m²", "/tháng", "/m²"...
  pricePerM2?: number; // giá theo m2 (VNĐ/m2)
  area: number; // diện tích (m2)
  length?: string; // chiều dài
  width?: string; // chiều ngang
  backSize?: string; // mặt hậu
  floorNumber?: number; // số tầng
  bedroomNumber?: number; // số phòng ngủ
  toiletNumber?: number; // số toilet
  legalStatus?: string; // tình trạng pháp lý (vd: "sổ hồng", "sổ đỏ",...)
  furnitureStatus?: string; // tình trạng nội thất (vd: "đầy đủ", "chưa có",...)
  province: string; // tỉnh/thành phố
  district: string; // quận/huyện
  ward?: string; // phường/xã
  address: string; // địa chỉ cụ thể
  amenities?: string; // tiện ích đi kèm (vd: máy lạnh, chỗ để xe,...)
  youtubeLink?: string; // link video Youtube người đăng nhập
  videoTitle?: string; // tiêu đề video minh họa
  videoDescription?: string; // mô tả ngắn cho video
  postType: 'basic' | 'vip1' | 'vip2' | 'vip3' | 'highlight'; // loại tin
  status: 'active' | 'pending' | 'expired' | 'hidden'; // trạng thái tin
  author?: IRentalAuthor; // người đăng tin
  adminNote?: string; // ghi chú nội bộ cho admin
  adminImages?: string[]; // hình ảnh dành cho quản trị viên
  postedAt?: Date; // ngày đăng tin
  expiredAt?: Date; // ngày hết hạn tin
  createdAt: string; // ngày tạo tin
  updatedAt: string; // ngày cập nhật gần nhất
}

export interface IRentalFavoriteLite {
  _id: string;
  title: string;
  price: number;
  priceUnit: string;
  area: number;
  district: string;
  province: string;
  image?: string;
}

export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
}

export interface Ward {
  code: number;
  name: string;
}
