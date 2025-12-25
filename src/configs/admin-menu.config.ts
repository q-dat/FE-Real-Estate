import {
  HiOutlineSquares2X2,
  HiOutlineRectangleGroup,
  HiOutlineHome,
  HiOutlineBuildingOffice2,
  HiOutlineDocumentText,
  HiOutlineQueueList,
} from 'react-icons/hi2';

export interface ISubMenuItem {
  title: string;
  path: string;
}

export interface IMenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  submenu?: ISubMenuItem[];
}

export const ADMIN_MENU: IMenuItem[] = [
  {
    title: 'Bảng điều khiển',
    path: '/cms/admin/dashboard',
    icon: HiOutlineSquares2X2,
  },
  {
    title: 'Danh mục nội thất',
    path: '/cms/admin/interior-categories',
    icon: HiOutlineRectangleGroup,
  },
  {
    title: 'Nội thất',
    path: '/cms/admin/interiors',
    icon: HiOutlineHome,
  },
  {
    title: 'Danh mục cho thuê',
    path: '/cms/admin/rental-categories',
    icon: HiOutlineQueueList,
  },
  {
    title: 'Bài đăng thuê & bán',
    path: '/cms/admin/rental-post-admin',
    icon: HiOutlineDocumentText,
    submenu: [
      {
        title: 'Toàn bộ bài đăng',
        path: '/cms/admin/rental-post-admin',
      },
      {
        title: 'Bài đăng bán',
        path: '/cms/admin/rental-post-admin/sell',
      },
      {
        title: 'Bài đăng cho thuê',
        path: '/cms/admin/rental-post-admin/rent',
      },
    ],
  },
  {
    title: 'Dự án bất động sản',
    path: '/cms/admin/real-estate-project',
    icon: HiOutlineBuildingOffice2,
  },
];
