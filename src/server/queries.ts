import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';

import { RentalPostAdminModel } from './models/rentalPost';
import { RentalCategoryModel } from './models/rentalCategory';
import { PostModel } from './models/post';
import { PostCategoryModel } from './models/postCategory';
import { InteriorModel } from './models/interior';
import { InteriorCategoryModel } from './models/interiorCategory';
import { RealEstateProjectModel } from './models/realEstateProject';
import { UserModel } from './models/user';

async function db() {
  await connectDB();
}

// Cache các hàm query dùng unstable_cache của Next để tận dụng Data Cache khi deploy.
// (Không wrap ở đây để linh hoạt; các page có thể set revalidate riêng.)
// Tất cả hàm trả về plain object (đã .lean()) để serialize an toàn qua RSC boundary.

// ===================== RENTAL POST =====================
export type RentalPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type RentalPostAdminListResponse = {
  message: string;
  count: number;
  visibleCount: number;
  pagination: RentalPaginationMeta;
  rentalPosts: unknown[];
};

function buildPaginationMeta(page: number, limit: number, total: number) {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export async function getAllRentalPostsAdmin(
  params: Record<string, string | number | undefined> = {}
): Promise<RentalPostAdminListResponse> {
  await db();

  const {
    catalogID,
    categoryCode,
    title,
    code,
    price,
    priceFrom,
    priceTo,
    area,
    areaFrom,
    areaTo,
    frontageWidth,
    lotDepth,
    backSize,
    pricePerM2From,
    pricePerM2To,
    province,
    district,
    ward,
    propertyType,
    locationType,
    direction,
    legalStatus,
    furnitureStatus,
    bedroomNumber,
    toiletNumber,
    floorNumber,
    postType,
    status,
    author,
  } = params;

  const page = Number(params.page ?? 1) || 1;
  const limit = Math.min(Number(params.limit ?? 20) || 20, 100);
  const skip = (page - 1) * limit;

  const filters: Record<string, unknown> = {};

  if (title) filters.title = { $regex: String(title), $options: 'i' };
  if (code) filters.code = { $regex: String(code), $options: 'i' };

  if (priceFrom || priceTo) {
    filters.price = {
      ...(priceFrom && { $gte: Number(priceFrom) }),
      ...(priceTo && { $lte: Number(priceTo) }),
    };
  } else if (price) {
    filters.price = { $lte: Number(price) };
  }

  if (areaFrom || areaTo) {
    filters.area = {
      ...(areaFrom && { $gte: Number(areaFrom) }),
      ...(areaTo && { $lte: Number(areaTo) }),
    };
  } else if (area) {
    filters.area = { $gte: Number(area) };
  }

  if (frontageWidth) filters.frontageWidth = Number(frontageWidth);
  if (lotDepth) filters.lotDepth = Number(lotDepth);
  if (backSize) filters.backSize = Number(backSize);

  if (pricePerM2From || pricePerM2To) {
    filters.pricePerM2 = {
      ...(pricePerM2From && { $gte: Number(pricePerM2From) }),
      ...(pricePerM2To && { $lte: Number(pricePerM2To) }),
    };
  }

  if (province) filters.province = { $regex: String(province), $options: 'i' };
  if (district) {
    const normalized = String(district).trim().toLowerCase();
    filters.$expr = { $eq: [{ $toLower: '$district' }, normalized] };
  }
  if (ward) filters.ward = { $regex: String(ward), $options: 'i' };

  if (propertyType) filters.propertyType = propertyType;
  if (locationType) filters.locationType = locationType;
  if (direction) filters.direction = direction;
  if (legalStatus) filters.legalStatus = legalStatus;
  if (furnitureStatus) filters.furnitureStatus = furnitureStatus;
  if (bedroomNumber) filters.bedroomNumber = Number(bedroomNumber);
  if (toiletNumber) filters.toiletNumber = Number(toiletNumber);
  if (floorNumber) filters.floorNumber = Number(floorNumber);
  if (postType) filters.postType = postType;
  if (status) filters.status = status;
  if (author && mongoose.Types.ObjectId.isValid(String(author))) {
    filters.author = new mongoose.Types.ObjectId(String(author));
  }

  const categoryMatch: Record<string, unknown> = {};
  if (catalogID && mongoose.Types.ObjectId.isValid(String(catalogID))) {
    categoryMatch['category._id'] = new mongoose.Types.ObjectId(String(catalogID));
  }
  if (categoryCode) {
    categoryMatch['category.categoryCode'] = Number(categoryCode);
  }

  const result = await RentalPostAdminModel.aggregate([
    {
      $lookup: {
        from: 'rental-categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      },
    },
    {
      $unwind: {
        path: '$author',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        ...filters,
        ...categoryMatch,
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        'author.password': 0,
        'author.__v': 0,
        'author.createdAt': 0,
        'author.updatedAt': 0,
        'author.role': 0,
        'author.isActive': 0,
        'author.emailVerified': 0,
        'author.lastLoginAt': 0,
        'author.passwordChangedAt': 0,
        'author.emailVerifyOtpAttempts': 0,
        'author.resetPasswordOtpAttempts': 0,
        'author.failedLoginAttempts': 0,
        __v: 0,
      },
    },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalData: [{ $count: 'total' }],
      },
    },
  ]);

  const rentalPosts = (result[0]?.data ?? []).map((d: Record<string, unknown>) => {
    const { _id, ...rest } = d;
    return { _id: String(_id), ...rest };
  });
  const total = result[0]?.totalData?.[0]?.total ?? 0;

  return {
    message: rentalPosts.length ? 'Lấy danh sách bài đăng thành công' : 'Không có bài đăng phù hợp',
    count: total,
    visibleCount: rentalPosts.length,
    pagination: buildPaginationMeta(page, limit, total),
    rentalPosts,
  };
}

export async function getRentalPostAdminById(id: string): Promise<unknown | null> {
  await db();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const post = await RentalPostAdminModel.findById(id)
    .populate({ path: 'category', select: '-createdAt -updatedAt -__v' })
    .populate({
      path: 'author',
      select: '-__v -createdAt -updatedAt -role -isActive -emailVerified -lastLoginAt -passwordChangedAt -password',
      model: UserModel,
    })
    .lean();

  if (!post) return null;
  const { _id, ...rest } = post as Record<string, unknown>;
  return { _id: String(_id), ...rest };
}

export async function getRentalPostAdminByCode(code: string): Promise<unknown | null> {
  await db();
  if (!code) return null;

  const post = await RentalPostAdminModel.findOne({ code: { $regex: String(code), $options: 'i' } })
    .populate({ path: 'category', select: '-createdAt -updatedAt -__v' })
    .populate({
      path: 'author',
      select: '-__v -createdAt -updatedAt -role -isActive -emailVerified -lastLoginAt -passwordChangedAt -password',
      model: UserModel,
    })
    .lean();

  if (!post) return null;
  const { _id, ...rest } = post as Record<string, unknown>;
  return { _id: String(_id), ...rest };
}

// ===================== RENTAL CATEGORY =====================
export async function getAllRentalCategories(): Promise<unknown[]> {
  await db();
  const list = await RentalCategoryModel.find({}).sort({ categoryCode: 1 }).lean();
  return list.map((d) => {
    const { _id, ...rest } = d as Record<string, unknown>;
    return { _id: String(_id), ...rest };
  });
}

// ===================== REAL ESTATE PROJECT =====================
export async function getAllRealEstateProjects(params: Record<string, string> = {}): Promise<{
  message: string;
  count: number;
  projects: unknown[];
}> {
  await db();
  const filters: Record<string, unknown> = {};
  if (params.status) filters.status = params.status;
  if (params.projectType) filters.projectType = params.projectType;
  if (params.investor) filters.investor = params.investor;

  const projects = await RealEstateProjectModel.find(filters).sort({ createdAt: -1 }).lean();
  const mapped = projects.map((d) => {
    const { _id, ...rest } = d as Record<string, unknown>;
    return { _id: String(_id), ...rest };
  });

  return {
    message: mapped.length ? 'Lấy danh sách dự án thành công!' : 'Không có dự án nào!',
    count: mapped.length,
    projects: mapped,
  };
}

export async function getRealEstateProjectById(id: string): Promise<unknown | null> {
  await db();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const p = await RealEstateProjectModel.findById(id).lean();
  if (!p) return null;
  const { _id, ...rest } = p as Record<string, unknown>;
  return { _id: String(_id), ...rest };
}

export async function getRealEstateProjectBySlug(slug: string): Promise<unknown | null> {
  await db();
  if (!slug) return null;
  const p = await RealEstateProjectModel.findOne({ slug }).lean();
  if (!p) return null;
  const { _id, ...rest } = p as Record<string, unknown>;
  return { _id: String(_id), ...rest };
}

// ===================== POST (tin tức) =====================
export async function getAllPosts(params: Record<string, string> = {}): Promise<{
  message: string;
  count: number;
  visibleCount: number;
  posts: unknown[];
}> {
  await db();
  const filters: Record<string, unknown> = {};
  if (params.catalog) filters.catalog = params.catalog;
  if (params.published !== undefined) filters.published = params.published === 'true';

  const posts = await PostModel.find(filters)
    .populate('catalog', '-createdAt -updatedAt -__v')
    .sort({ createdAt: -1 })
    .lean();
  const mapped = posts.map((d) => {
    const { _id, ...rest } = d as Record<string, unknown>;
    return { _id: String(_id), ...rest };
  });

  return {
    message: mapped.length ? 'Lấy danh sách bài viết thành công' : 'Không có bài viết phù hợp',
    count: mapped.length,
    visibleCount: mapped.length,
    posts: mapped,
  };
}

export async function getPostById(id: string): Promise<unknown | null> {
  await db();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const p = await PostModel.findById(id).populate('catalog', '-createdAt -updatedAt -__v').lean();
  if (!p) return null;
  const { _id, ...rest } = p as Record<string, unknown>;
  return { _id: String(_id), ...rest };
}

export async function getPostBySlug(slug: string): Promise<unknown | null> {
  await db();
  if (!slug) return null;
  const p = await PostModel.findOne({ slug })
    .populate('catalog', '-createdAt -updatedAt -__v')
    .lean();
  if (!p) return null;
  const { _id, ...rest } = p as Record<string, unknown>;
  return { _id: String(_id), ...rest };
}

// ===================== POST CATEGORY =====================
export async function getAllPostCategories(): Promise<unknown[]> {
  await db();
  const list = await PostCategoryModel.find({}).sort({ createdAt: -1 }).lean();
  return list.map((d) => {
    const { _id, ...rest } = d as Record<string, unknown>;
    return { _id: String(_id), ...rest };
  });
}

export async function getPostCategoryById(id: string): Promise<unknown | null> {
  await db();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const c = await PostCategoryModel.findById(id).lean();
  if (!c) return null;
  const { _id, ...rest } = c as Record<string, unknown>;
  return { _id: String(_id), ...rest };
}

// ===================== INTERIOR =====================
export async function getAllInteriors(params: Record<string, string> = {}): Promise<unknown[]> {
  await db();
  const filters: Record<string, unknown> = {};
  if (params.category) filters.category = params.category;
  if (params.status) filters.status = params.status;

  const list = await InteriorModel.find(filters)
    .populate('category', '-createdAt -updatedAt -__v')
    .sort({ createdAt: -1 })
    .lean();
  return list.map((d) => {
    const { _id, ...rest } = d as Record<string, unknown>;
    return { _id: String(_id), ...rest };
  });
}

export async function getInteriorById(id: string): Promise<unknown | null> {
  await db();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const p = await InteriorModel.findById(id)
    .populate('category', '-createdAt -updatedAt -__v')
    .lean();
  if (!p) return null;
  const { _id, ...rest } = p as Record<string, unknown>;
  return { _id: String(_id), ...rest };
}

// ===================== INTERIOR CATEGORY =====================
export async function getAllInteriorCategories(): Promise<unknown[]> {
  await db();
  const list = await InteriorCategoryModel.find({}).sort({ categoryCode: 1 }).lean();
  return list.map((d) => {
    const { _id, ...rest } = d as Record<string, unknown>;
    return { _id: String(_id), ...rest };
  });
}

// ===================== SEARCH =====================
// Tìm kiếm gợi ý: projection nội bộ đủ để đối chiếu, response whitelist nhẹ cho Header.
// Quy trình: parse structured fields -> lọc AND -> exact phrase trên title/amenities/
// thuộc tính/vị trí -> fallback token an toàn -> ranking.
import { RentalSearchResult, MatchedAttribute, RENTAL_SEARCH_RESULT_FIELDS, SearchKind } from '@/types/rentalGridItem';
import {
  normalizeSearchText,
  normalizeBase,
  parseStructuredQuery,
  districtMatch,
  buildMatchedAttributes,
  matchAmenities,
  escapeRegex,
} from './searchNormalize';

// Field CHỈ dùng server search (ward/address để ghép address-text,
// legalStatus/furnitureStatus/direction để match attribute) — KHÔNG trả raw xuống client.
const SEARCH_INTERNAL_FIELDS = [
  ...RENTAL_SEARCH_RESULT_FIELDS,
  'description',
  'amenities',
  'ward',
  'address',
  'legalStatus',
  'furnitureStatus',
  'direction',
] as const;
const SEARCH_RESPONSE_PROJECTION = RENTAL_SEARCH_RESULT_FIELDS.join(' ');
const SEARCH_INTERNAL_PROJECTION = SEARCH_INTERNAL_FIELDS.join(' ');

const TEXT_ATTRIBUTE_FIELDS = [
  { key: 'propertyType', type: 'propertyType' },
  { key: 'locationType', type: 'locationType' },
  { key: 'legalStatus', type: 'legalStatus' },
  { key: 'furnitureStatus', type: 'furnitureStatus' },
  { key: 'direction', type: 'direction' },
] as const;

function splitAmenityComponents(value: unknown): string[] {
  if (typeof value !== 'string') return [];

  return value
    .split(/[,;\r\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Tìm theo substring trong từng component amenities.
 * Ví dụ keyword "bao quanh" phải khớp component "bán đảo bao quanh là sông".
 * Giữ lại matchAmenities hiện có để hỗ trợ alias và nhiều tiện ích trong một query.
 */
function matchAmenityComponents(phrase: string, value: unknown): string[] {
  const normalizedPhrase = normalizeSearchText(phrase);
  if (!normalizedPhrase) return [];

  const directMatches = splitAmenityComponents(value).filter((component) =>
    normalizeSearchText(component).includes(normalizedPhrase)
  );
  const aliasMatches = matchAmenities(phrase, value);

  return Array.from(new Set([...directMatches, ...aliasMatches]));
}

function matchTextAttributes(
  phrase: string,
  doc: Record<string, unknown>
): MatchedAttribute[] {
  if (!phrase) return [];

  return TEXT_ATTRIBUTE_FIELDS.flatMap(({ key, type }) => {
    const rawValue = String(doc[key] ?? '').trim();
    if (!rawValue) return [];

    const normalizedValue = normalizeSearchText(rawValue);
    if (!normalizedValue.includes(phrase)) return [];

    return [
      {
        type,
        displayText: rawValue.toUpperCase(),
        matchedText: rawValue,
      },
    ];
  });
}

function dedupeAttributes(attributes: MatchedAttribute[]): MatchedAttribute[] {
  const seen = new Set<string>();

  return attributes.filter((attribute) => {
    const key = `${attribute.type}:${normalizeBase(attribute.displayText)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function containsWholeToken(text: string, token: string): boolean {
  return new RegExp(`(?:^|\\s)${escapeRegex(token)}(?:$|\\s)`, 'i').test(text);
}

function stripDoc(doc: Record<string, unknown>): RentalSearchResult {
  const out: Record<string, unknown> = { _id: String(doc._id) };

  for (const key of RENTAL_SEARCH_RESULT_FIELDS) {
    if (key === '_id') continue;
    if (doc[key] !== undefined) out[key] = doc[key];
  }

  return out as RentalSearchResult;
}

export async function searchRentalPosts(
  rawKeyword: string,
  limit = 8,
  searchType: SearchKind = 'title'
): Promise<RentalSearchResult[]> {
  await db();

  if (searchType === 'code') {
    const code = normalizeBase(rawKeyword).toLowerCase();
    if (!code) return [];

    const docs = await RentalPostAdminModel.find({
      code: new RegExp(`^${escapeRegex(code)}`, 'i'),
      status: { $in: ['active', undefined] },
    })
      .select(SEARCH_RESPONSE_PROJECTION)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    return docs.map((doc) => {
      const result = stripDoc(doc as Record<string, unknown>);
      result.matchSource = 'code';
      result.matchedPhrase = String(doc.code ?? '');
      return result;
    });
  }

  const sq = parseStructuredQuery(rawKeyword);
  if (
    sq.bedroom === undefined &&
    sq.floor === undefined &&
    sq.toilet === undefined &&
    !sq.district &&
    !sq.province &&
    !sq.remaining
  ) {
    return [];
  }

  // Dữ liệu hiện còn nhỏ; sort xác định để kết quả ổn định.
  const docs = await RentalPostAdminModel.find({
    status: { $in: ['active', undefined] },
  })
    .select(SEARCH_INTERNAL_PROJECTION)
    .sort({ _id: -1 })
    .limit(300)
    .lean();

  type Scored = {
    doc: Record<string, unknown>;
    score: number;
    source: RentalSearchResult['matchSource'];
    matchedAttributes?: MatchedAttribute[];
    matched?: string;
  };

  const scored: Scored[] = [];

  for (const rawDoc of docs) {
    const d = rawDoc as Record<string, unknown>;

    // Structured filters luôn kết hợp AND và kiểm tra theo đúng field.
    if (sq.bedroom !== undefined) {
      const value = typeof d.bedroomNumber === 'number'
        ? d.bedroomNumber
        : Number.parseInt(String(d.bedroomNumber ?? ''), 10);
      if (value !== sq.bedroom) continue;
    }

    if (sq.floor !== undefined) {
      const value = typeof d.floorNumber === 'number'
        ? d.floorNumber
        : Number.parseInt(String(d.floorNumber ?? ''), 10);
      if (value !== sq.floor) continue;
    }

    if (sq.toilet !== undefined) {
      const value = typeof d.toiletNumber === 'number'
        ? d.toiletNumber
        : Number.parseInt(String(d.toiletNumber ?? ''), 10);
      if (value !== sq.toilet) continue;
    }

    if (sq.district) {
      const district = normalizeBase(String(d.district ?? ''));
      if (!districtMatch(district, sq.district)) continue;
    }

    if (sq.province) {
      const province = normalizeBase(String(d.province ?? ''));
      if (province !== sq.province) continue;
    }

    const phrase = sq.remaining;
    const title = normalizeSearchText(String(d.title ?? ''));
    const description = normalizeSearchText(String(d.description ?? ''));
    const address = normalizeSearchText(
      [d.address, d.ward, d.district, d.province].filter(Boolean).join(' ')
    );

    const amenityMatches = phrase ? matchAmenityComponents(phrase, d.amenities) : [];
    const textAttributeMatches = phrase ? matchTextAttributes(phrase, d) : [];
    const hasDigit = /\d/.test(phrase);
    const tokens = phrase.split(' ').filter(Boolean);
    const allTokensInOneField = (text: string) =>
      !hasDigit &&
      tokens.length > 1 &&
      tokens.every((token) => containsWholeToken(text, token));

    let score = 0;
    let source: RentalSearchResult['matchSource'] | null = null;
    let matched: string | undefined;

    if (phrase && title.includes(phrase)) {
      score = 100;
      source = 'title';
      matched = phrase;
    } else if (amenityMatches.length > 0) {
      score = 95;
      source = 'amenity';
    } else if (textAttributeMatches.length > 0) {
      score = 90;
      source = 'attribute';
    } else if (phrase && address.includes(phrase)) {
      score = 85;
      source = 'address';
      matched = phrase;
    } else if (phrase && description.includes(phrase)) {
      score = 75;
      source = 'description';
      matched = phrase;
    } else if (phrase && allTokensInOneField(title)) {
      score = 55;
      source = 'title';
    } else if (phrase && allTokensInOneField(description)) {
      score = 40;
      source = 'description';
    } else if (!phrase) {
      score = 95;
      source = 'attribute';
    }

    if (score <= 0 || !source) continue;

    const structuredAttributes = buildMatchedAttributes(sq, d);
    const amenityAttributes: MatchedAttribute[] = amenityMatches.map((component) => ({
      type: 'amenity',
      displayText: component.toUpperCase(),
      matchedText: component,
    }));
    const matchedAttributes = dedupeAttributes([
      ...structuredAttributes,
      ...textAttributeMatches,
      ...amenityAttributes,
    ]);

    scored.push({
      doc: d,
      score,
      source,
      matchedAttributes: matchedAttributes.length > 0 ? matchedAttributes : undefined,
      matched,
    });
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ doc, source, matchedAttributes, matched }) => {
    const result = stripDoc(doc);
    result.matchSource = source;
    result.matchedAttributes = matchedAttributes;
    result.matchedPhrase = matched;
    return result;
  });
}