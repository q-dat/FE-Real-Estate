import { IPostCategory } from './post-category';

export interface IPost {
  _id: string;
  image?: string;
  title: string;
  slug?: string;
  content: string;
  catalog: IPostCategory;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
