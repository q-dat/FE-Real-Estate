import { IInteriorCategory } from '../interiorsCategory/interiorsCategory';

export interface IInterior {
  _id: string;
  name: string;
  category: IInteriorCategory;
  images: string;
  thumbnails?: string[];
  status?: string;
  description?: string;
}
