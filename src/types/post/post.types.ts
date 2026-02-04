import { IPostCategory } from './post-category.types';

export interface IPost {
  _id: string;
  image?: string;
  title: string;
  slug?: string;
  content: string;
  source?: string;
  catalog: IPostCategory;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
