import { ADMIN_MENU } from './admin-menu.config';

export const ADMIN_PAGE_TITLES: Record<string, string> = (() => {
  const map: Record<string, string> = {};

  ADMIN_MENU.forEach((item) => {
    // Page chính
    map[item.path] = item.title;

    // Submenu
    if (item.submenu) {
      item.submenu.forEach((sub) => {
        map[sub.path] = sub.title;
      });
    }
  });

  return map;
})();
