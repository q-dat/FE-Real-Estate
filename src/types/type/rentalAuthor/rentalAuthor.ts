/**
 * RentalAuthor - Người đăng bài
 */
export interface IRentalAuthor {
  _id: string; // id người dùng (ObjectId)
  userCode: string; // mã định danh người dùng trên hệ thống (vd: "USER-000123")
  name: string; // tên hiển thị
  phone: string; // số điện thoại liên hệ
  zalo?: string; // liên kết Zalo (nếu có)
  avatar?: string; // URL ảnh đại diện
  accountBalance: number; // số dư tài khoản hiện tại (VNĐ)
  joinedAt: string; // ngày tham gia hệ thống
  role: 'user' | 'admin'; // phân quyền tài khoản
  isVerified: boolean; // tài khoản đã xác minh hay chưa
}
