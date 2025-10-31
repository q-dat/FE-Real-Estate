/**
 * RentalCategory - Danh mục loại hình cho thuê
 */
export interface IRentalCategory {
  _id: string; // id danh mục (ObjectId)
  name: string; // tên hiển thị (vd: "Cho thuê căn hộ")
  description?: string; // mô tả danh mục
  createdAt: string; // ngày tạo danh mục
  updatedAt: string; // ngày cập nhật danh mục
}
