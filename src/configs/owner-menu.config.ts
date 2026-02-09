import {
  HiOutlineSquares2X2,
  HiOutlineRectangleGroup,
  HiOutlineHome,
  HiOutlineBuildingOffice2,
  HiOutlineDocumentText,
  HiOutlineQueueList,
  HiOutlineNewspaper,
} from 'react-icons/hi2';
import { IMenuItem } from './admin-menu.config';
import { MdOutlinePostAdd } from 'react-icons/md';
import { FaUsers } from 'react-icons/fa';

export const OWNER_MENU: IMenuItem[] = [
  {
    title: 'Bảng điều khiển',
    path: '/owner/dashboard',
    icon: HiOutlineSquares2X2,
  },
  {
    title: 'Danh mục BDS',
    path: '/owner/rental-categories',
    icon: HiOutlineQueueList,
  },
  {
    title: 'BDS thuê & bán',
    path: '/owner/rental-post-admin',
    icon: HiOutlineDocumentText,
    submenu: [
      {
        title: 'Toàn bộ bài đăng',
        path: '/owner/rental-post-admin',
      },
      {
        title: 'Mua bán nhà đất',
        path: '/owner/rental-post-admin/0',
      },
      {
        title: 'Căn hộ cho thuê',
        path: '/owner/rental-post-admin/1',
      },
      {
        title: 'Nhà nguyên căn',
        path: '/owner/rental-post-admin/2',
      },
      {
        title: 'Cho thuê mặt bằng',
        path: '/owner/rental-post-admin/3',
      },
    ],
  },

  {
    title: 'Danh mục nội thất',
    path: '/owner/interior-categories',
    icon: HiOutlineRectangleGroup,
  },
  {
    title: 'Nội thất',
    path: '/owner/interiors',
    icon: HiOutlineHome,
  },

  {
    title: 'Dự án bds',
    path: '/owner/real-estate-project',
    icon: HiOutlineBuildingOffice2,
  },

  {
    title: 'Authorization',
    path: '/owner/users',
    icon: FaUsers,
  },
  {
    title: 'OTPs',
    path: '/owner/otps',
    icon: HiOutlineBuildingOffice2,
  },
  {
    title: 'Crawler bản tin',
    path: '/owner/crawler',
    icon: HiOutlineNewspaper,
  },
  {
    title: 'Bản tin/Blog',
    path: '/owner/posts',
    icon: MdOutlinePostAdd,
  },
];
