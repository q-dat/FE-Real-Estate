import aliases from '@/data/property-abbreviations.json';
import { MatchedAttribute } from '@/types/rentalGridItem';

// Chuẩn hóa văn bản cho search:
// - bỏ dấu (NFD + strip)
// - lowercase
// - collapse khoảng trắng
// - chuẩn hóa token viết tắt BĐS (theo file JSON, áp dụng token boundary)

interface AliasEntry {
  canonical: string;
  variants: string[];
}

const ALIAS_LIST = (aliases as { aliases: AliasEntry[] }).aliases;

// Map variant (đã normalize) -> canonical (đã normalize)
const VARIANT_MAP: Record<string, string> = {};
for (const entry of ALIAS_LIST) {
  const canon = normalizeBase(entry.canonical);
  for (const v of entry.variants) {
    const nv = normalizeBase(v);
    if (nv) VARIANT_MAP[nv] = canon;
  }
}

// Chỉ normalize cơ bản (dấu + case + space), không expand alias.
export function normalizeBase(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Expand các token viết tắt thành dạng chuẩn.
// Xử lý số tổng quát: "6pn" / "6 pn" -> "6 phòng ngủ"; "2pn" -> "2 phòng ngủ".
export function expandAlias(term: string): string {
  const base = normalizeBase(term);
  if (!base) return '';
  const tokens = base.split(' ').filter(Boolean);
  const expanded = tokens.map((tok) => {
    // Số + alias liền: 6pn, 2pn, 12pn ...
    const m = tok.match(/^(\d+)([a-z]+)$/);
    if (m) {
      const num = m[1];
      const rest = m[2];
      const mapped = VARIANT_MAP[rest];
      if (mapped) return `${num} ${mapped}`;
      return tok;
    }
    // Alias đơn: pn, mt, wc, hxh ...
    const mapped = VARIANT_MAP[tok];
    if (mapped) return mapped;
    return tok;
  });
  return expanded.join(' ');
}

// Chuẩn hóa đầy đủ: base + expand alias. Dùng cho cả keyword, title, description.
export function normalizeSearchText(input: string): string {
  return expandAlias(normalizeBase(input));
}

// Escape ký tự đặc biệt của regex.
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Map structured field -> (label hiển thị, giá trị đã normalize để highlight).
// Parse keyword thành các điều kiện có cấu trúc + phần text còn lại.
// Không để số đứng độc lập gây nhiễu.

export interface StructuredQuery {
  bedroom?: number;
  floor?: number;
  toilet?: number;
  district?: string; // đã normalize, ví dụ "quan 1"
  province?: string;
  remaining: string; // text còn lại để tìm title/address/desc
}

// So sánh district chính xác theo token boundary.
// "quan 1" KHÔNG khớp "quan 10"/"quan 11"/"quan 12".
function districtMatch(normDistrict: string, target: string): boolean {
  const t = normalizeBase(target);
  // Chuẩn hóa "quan 1" -> so sánh từng token
  const norm = normDistrict.trim();
  if (norm === t) return true;
  // Cho phép "q1" / "q 1" / "quan 1" các biến thể
  const variants = [norm, norm.replace(/\s+/g, ''), `q ${norm.split(' ').pop()}`];
  return variants.includes(t) || t === `q${norm.split(' ').pop()}`;
}

// Parse một chuỗi thành structured query.
export function parseStructuredQuery(rawKeyword: string): StructuredQuery {
  const norm = normalizeSearchText(rawKeyword); // đã bỏ dấu + expand alias
  const result: StructuredQuery = { remaining: norm };

  let working = norm;

  // 1. {số} phòng ngủ / {số} pn (đã expand thành "5 phòng ngủ")
  const bedMatch = working.match(/(\d+)\s*(phong ngu|phong ngu)/);
  if (bedMatch) {
    result.bedroom = parseInt(bedMatch[1], 10);
    working = working.replace(bedMatch[0], ' ');
  }

  // 2. {số} tầng
  const floorMatch = working.match(/(\d+)\s*(tang)/);
  if (floorMatch) {
    result.floor = parseInt(floorMatch[1], 10);
    working = working.replace(floorMatch[0], ' ');
  }

  // 3. {số} wc / nhà vệ sinh
  const toiletMatch = working.match(/(\d+)\s*(nha ve sinh|wc)/);
  if (toiletMatch) {
    result.toilet = parseInt(toiletMatch[1], 10);
    working = working.replace(toiletMatch[0], ' ');
  }

  // 4. quận {số} / q{số} / q {số}
  const distMatch = working.match(/(quan|q)\s*(\d+)/);
  if (distMatch) {
    result.district = `quan ${distMatch[2]}`;
    working = working.replace(distMatch[0], ' ');
  }

  // 5. tỉnh/thành (hcm, ha noi, ...)
  const provMatch = working.match(/(ho chi minh|hcm|ha noi|hai phong|da nang|binh duong|dong nai)/);
  if (provMatch) {
    result.province = provMatch[1];
    working = working.replace(provMatch[0], ' ');
  }

  result.remaining = working.replace(/\s+/g, ' ').trim();
  return result;
}

// Tạo matchedAttributes hoàn chỉnh từ doc (chỉ các field LIÊN QUAN keyword).
// Backend tạo displayText (uppercase, chuẩn hóa), frontend chỉ render.
const toUpper = (s: string) => s.toUpperCase();

// sq: điều kiện đã parse. doc: document gốc (lấy field value thực tế).
export function buildMatchedAttributes(
  sq: StructuredQuery,
  doc: Record<string, unknown>
): MatchedAttribute[] {
  const out: MatchedAttribute[] = [];

  if (sq.bedroom !== undefined && doc.bedroomNumber === sq.bedroom) {
    out.push({ type: 'bedroom', displayText: `${sq.bedroom} PHÒNG NGỦ`, matchedText: `${sq.bedroom} PHÒNG NGỦ` });
  }
  if (sq.floor !== undefined && doc.floorNumber === sq.floor) {
    out.push({ type: 'floor', displayText: `${sq.floor} TẦNG`, matchedText: `${sq.floor} TẦNG` });
  }
  if (sq.toilet !== undefined && doc.toiletNumber === sq.toilet) {
    out.push({ type: 'toilet', displayText: `${sq.toilet} WC`, matchedText: `${sq.toilet} WC` });
  }
  if (sq.district) {
    const num = sq.district.replace('quan ', '').trim();
    out.push({ type: 'district', displayText: `QUẬN ${num}`, matchedText: `QUẬN ${num}` });
  }
  if (sq.province) {
    out.push({ type: 'province', displayText: toUpper(String(doc.province ?? sq.province)), matchedText: toUpper(String(doc.province ?? sq.province)) });
  }

  return out;
}

// Tách post.amenities (string) thành các component logic.
// Không hard-code danh sách tiện ích. Giữ nguyên gốc để hiển thị.
export function splitAmenities(raw: unknown): string[] {
  if (!raw) return [];
  return String(raw)
    .split(/[;\n\r]/) // dấu chấm phẩy, xuống dòng
    .flatMap((part) => part.split(',')) // dấu phẩy
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// Tìm tiện ích khớp keyword (đã normalize + alias expansion) trong amenities gốc.
// Không phân biệt hoa/thường, dấu, khoảng trắng, alias (mt -> mặt tiền).
// Trả các component gốc đã khớp (dùng làm displayText/matchedText).
export function matchAmenities(
  rawKeyword: string,
  rawAmenities: unknown
): string[] {
  const components = splitAmenities(rawAmenities);
  if (components.length === 0) return [];
  // Mỗi tiện ích keyword (theo dấu phẩy/space) cần khớp ít nhất 1 component.
  const keywords = rawKeyword
    .split(/[,;]/)
    .map((k) => normalizeSearchText(k))
    .filter((k) => k.length > 0);
  if (keywords.length === 0) return [];

  const matched: string[] = [];
  for (const comp of components) {
    const normComp = normalizeSearchText(comp);
    if (keywords.some((k) => normComp.includes(k) || k.includes(normComp))) {
      matched.push(comp);
    }
  }
  return matched;
}

export { districtMatch };
