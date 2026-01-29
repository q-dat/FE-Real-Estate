export interface IPostCategory {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
