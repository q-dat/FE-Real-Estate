export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // tách dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '') // xoá dấu
    .replace(/đ/g, 'd') // chuyển đ → d
    .replace(/[^a-z0-9\s-]/g, '') // bỏ ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-') // thay khoảng trắng bằng dấu "-"
    .replace(/-+/g, '-'); // gộp nhiều dấu "-"
}
