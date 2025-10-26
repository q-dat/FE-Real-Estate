export interface RentalPost {
  id: string;
  title: string;
  description: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  type: 'Cho thuê phòng trọ' | 'Cho thuê nhà ở' | 'Cho thuê căn hộ' | 'Tìm người ở ghép';
  price: number; // đơn vị VND
  area: number; // m²
  postType: 'Tin thường' | 'Tin VIP';
  createdAt?: string;
  updatedAt?: string;
  code: string;
  thumbnail: string;
  images: string[];
  author: {
    name: string;
    phone: string;
    zalo?: string;
    joinedAt: string;
    avatar?: string;
  };
}
