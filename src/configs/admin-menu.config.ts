import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  FileText 
} from 'lucide-react';

export interface IMenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

export const ADMIN_MENU: IMenuItem[] = [
  {
    title: 'Bảng điều khiển',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Quản lý dự án',
    path: '/admin/projects',
    icon: Building2,
  },
  {
    title: 'Bài viết',
    path: '/admin/posts',
    icon: FileText,
  },
  {
    title: 'Người dùng',
    path: '/admin/users',
    icon: Users,
  },
  {
    title: 'Cài đặt',
    path: '/admin/settings',
    icon: Settings,
  },
];