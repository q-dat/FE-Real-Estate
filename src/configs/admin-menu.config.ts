import { HiOutlineDocumentText } from 'react-icons/hi2';

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
    title: 'BDS thuê & bán',
    path: '/cms/admin/rental-post-admin',
    icon: HiOutlineDocumentText,
    submenu: [
      {
        title: 'Toàn bộ bài đăng',
        path: '/cms/admin/rental-post-admin',
      },
      {
        title: 'Mua bán nhà đất',
        path: '/cms/admin/rental-post-admin/0',
      },
      {
        title: 'Căn hộ cho thuê',
        path: '/cms/admin/rental-post-admin/1',
      },
      {
        title: 'Nhà nguyên căn',
        path: '/cms/admin/rental-post-admin/2',
      },
      {
        title: 'Cho thuê mặt bằng',
        path: '/cms/admin/rental-post-admin/3',
      },
    ],
  },
];
