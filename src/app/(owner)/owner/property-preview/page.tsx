'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type PropertyImage = {
  id?: string;
  image?: string;
  medium?: string;
  thumb?: string;
};

type PropertyItem = {
  id: string;
  title: string;
  description: string;
  avatar?: string;
  images?: PropertyImage[];
  area?: number;
  attribute?: string[];
  published?: number;
  modified?: number;
  price?: {
    value?: number;
    absolute?: number;
  };
  additional?: {
    floor?: number;
    front?: number;
    room?: number;
    toilet?: number;
  };
  location?: {
    address?: string;
    street?: string;
    ward?: string;
    district?: string;
    province?: string;
  };
  zoneGroup?: string;
};

type SortType =
  | 'publishedDesc'
  | 'publishedAsc'
  | 'modifiedDesc'
  | 'modifiedAsc'
  | 'priceDesc'
  | 'priceAsc'
  | 'areaDesc'
  | 'areaAsc'
  | 'unitPriceDesc'
  | 'unitPriceAsc'
  | 'floorDesc'
  | 'floorAsc';

type FilterForm = {
  keyword: string;
  expert: string;
  roomText: string;
  priceFrom: string;
  priceTo: string;
  unitPriceFrom: string;
  unitPriceTo: string;
  floorFrom: string;
  floorTo: string;
  publishedFrom: string;
  publishedTo: string;
  modifiedFrom: string;
  modifiedTo: string;
  sort: SortType;
};

const STORAGE_KEY = 'property_preview_json_data';

const EMPTY_FILTER: FilterForm = {
  keyword: '',
  expert: '',
  roomText: '',
  priceFrom: '',
  priceTo: '',
  unitPriceFrom: '',
  unitPriceTo: '',
  floorFrom: '',
  floorTo: '',
  publishedFrom: '',
  publishedTo: '',
  modifiedFrom: '',
  modifiedTo: '',
  sort: 'publishedDesc',
};

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

const toNumber = (value: string): number | null => {
  const normalized = value.trim().replace(',', '.');

  if (!normalized) return null;

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
};

const toStartTimestamp = (value: string): number | null => {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return null;

  return Math.floor(date.getTime() / 1000);
};

const toEndTimestamp = (value: string): number | null => {
  if (!value) return null;

  const date = new Date(`${value}T23:59:59`);

  if (Number.isNaN(date.getTime())) return null;

  return Math.floor(date.getTime() / 1000);
};

const normalize = (value: string): string => {
  return value.trim().toLowerCase();
};

const formatDate = (timestamp?: number): string => {
  if (!timestamp) return 'Đang cập nhật';

  return new Date(timestamp * 1000).toLocaleDateString('vi-VN');
};

const formatPrice = (value?: number): string => {
  if (!Number.isFinite(value)) return 'Đang cập nhật';

  return `${Number(value).toLocaleString('vi-VN')} tỷ`;
};

const getImage = (item: PropertyItem): string => {
  return item.images?.[0]?.medium || item.images?.[0]?.image || item.avatar || '/no-image.png';
};

const getUnitPrice = (item: PropertyItem): number | null => {
  const price = item.price?.value;
  const area = item.area;

  if (!price || !area || area <= 0) return null;

  return (price * 1000) / area;
};

const inRange = (value: number | null, from: number | null, to: number | null): boolean => {
  if (value === null) return from === null && to === null;
  if (from !== null && value < from) return false;
  if (to !== null && value > to) return false;

  return true;
};

const inDateRange = (value: number | undefined, from: number | null, to: number | null): boolean => {
  if (!value) return from === null && to === null;
  if (from !== null && value < from) return false;
  if (to !== null && value > to) return false;

  return true;
};

const parseJson = (raw: string): PropertyItem[] => {
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('JSON phải là một mảng dữ liệu.');
  }

  const validItems = parsed.filter((item): item is PropertyItem => {
    if (!item || typeof item !== 'object') return false;

    const property = item as Partial<PropertyItem>;

    return typeof property.id === 'string' && typeof property.title === 'string' && typeof property.description === 'string';
  });

  if (validItems.length === 0) {
    throw new Error('Không tìm thấy dữ liệu bất động sản hợp lệ.');
  }

  return validItems;
};

const sortItems = (items: PropertyItem[], sort: SortType): PropertyItem[] => {
  return [...items].sort((a, b) => {
    const priceA = a.price?.value || 0;
    const priceB = b.price?.value || 0;
    const areaA = a.area || 0;
    const areaB = b.area || 0;
    const floorA = a.additional?.floor || 0;
    const floorB = b.additional?.floor || 0;
    const unitA = getUnitPrice(a) || 0;
    const unitB = getUnitPrice(b) || 0;

    if (sort === 'publishedDesc') return (b.published || 0) - (a.published || 0);
    if (sort === 'publishedAsc') return (a.published || 0) - (b.published || 0);
    if (sort === 'modifiedDesc') return (b.modified || 0) - (a.modified || 0);
    if (sort === 'modifiedAsc') return (a.modified || 0) - (b.modified || 0);
    if (sort === 'priceDesc') return priceB - priceA;
    if (sort === 'priceAsc') return priceA - priceB;
    if (sort === 'areaDesc') return areaB - areaA;
    if (sort === 'areaAsc') return areaA - areaB;
    if (sort === 'unitPriceDesc') return unitB - unitA;
    if (sort === 'unitPriceAsc') return unitA - unitB;
    if (sort === 'floorDesc') return floorB - floorA;
    if (sort === 'floorAsc') return floorA - floorB;

    return 0;
  });
};

export default function PropertyPreviewPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftFilter, setDraftFilter] = useState<FilterForm>(EMPTY_FILTER);
  const [appliedFilter, setAppliedFilter] = useState<FilterForm>(EMPTY_FILTER);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed = parseJson(saved);

      setJsonInput(saved);
      setItems(parsed);
      setSelectedId(parsed[0]?.id || null);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = normalize(appliedFilter.keyword);
    const expert = normalize(appliedFilter.expert);
    const roomText = normalize(appliedFilter.roomText);

    const priceFrom = toNumber(appliedFilter.priceFrom);
    const priceTo = toNumber(appliedFilter.priceTo);
    const unitPriceFrom = toNumber(appliedFilter.unitPriceFrom);
    const unitPriceTo = toNumber(appliedFilter.unitPriceTo);
    const floorFrom = toNumber(appliedFilter.floorFrom);
    const floorTo = toNumber(appliedFilter.floorTo);

    const publishedFrom = toStartTimestamp(appliedFilter.publishedFrom);
    const publishedTo = toEndTimestamp(appliedFilter.publishedTo);
    const modifiedFrom = toStartTimestamp(appliedFilter.modifiedFrom);
    const modifiedTo = toEndTimestamp(appliedFilter.modifiedTo);

    const matched = items.filter((item) => {
      const fullText = normalize(
        [item.title, item.description, item.location?.address, item.location?.street, item.zoneGroup].filter(Boolean).join(' ')
      );

      const expertText = normalize(`${item.title} ${item.description}`);
      const unitPrice = getUnitPrice(item);

      if (keyword && !fullText.includes(keyword)) return false;
      if (expert && !expertText.includes(expert)) return false;
      if (roomText && !normalize(item.description).includes(roomText)) return false;

      if (!inRange(item.price?.value || null, priceFrom, priceTo)) return false;
      if (!inRange(unitPrice, unitPriceFrom, unitPriceTo)) return false;
      if (!inRange(item.additional?.floor || null, floorFrom, floorTo)) return false;

      if (!inDateRange(item.published, publishedFrom, publishedTo)) return false;
      if (!inDateRange(item.modified, modifiedFrom, modifiedTo)) return false;

      return true;
    });

    return sortItems(matched, appliedFilter.sort);
  }, [items, appliedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const paginatedItems = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;

    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize, totalPages]);

  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedId) || paginatedItems[0] || null;
  }, [items, selectedId, paginatedItems]);

  const handleImport = () => {
    try {
      const parsed = parseJson(jsonInput);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      setItems(parsed);
      setSelectedId(parsed[0]?.id || null);
      setPage(1);
      setMessage(`Đã import ${parsed.length.toLocaleString('vi-VN')} tin.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'JSON không hợp lệ.';

      setMessage(errorMessage);
    }
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilter(draftFilter);
    setPage(1);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setJsonInput('');
    setItems([]);
    setSelectedId(null);
    setDraftFilter(EMPTY_FILTER);
    setAppliedFilter(EMPTY_FILTER);
    setPage(1);
    setMessage('');
  };

  const updateFilter = <K extends keyof FilterForm>(key: K, value: FilterForm[K]) => {
    setDraftFilter((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <main className="min-h-screen bg-neutral-100 p-2 text-neutral-950">
      <section className="sticky top-0 z-20 mb-2 rounded-lg border border-neutral-200 bg-white/95 p-2 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Nguồn Nhà Giá Rẻ</p>
            <h1 className="text-xl font-black">Preview JSON bất động sản</h1>
          </div>

          <div className="grid grid-cols-3 gap-1.5 xl:flex">
            <Stat label="Tổng" value={items.length.toLocaleString('vi-VN')} />
            <Stat label="Đang lọc" value={filteredItems.length.toLocaleString('vi-VN')} />
            <Stat label="Trang" value={`${page}/${totalPages}`} />
          </div>
        </div>
      </section>

      <section className="mb-2 rounded-lg border border-neutral-200 bg-white p-2 shadow-sm">
        <div className="mb-2 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-base font-black">Import JSON data</h2>
            <p className="text-xs font-medium text-neutral-500">Dán JSON array vào đây, bấm import để lưu localStorage và xem preview.</p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 xl:flex">
            <button
              type="button"
              onClick={handleImport}
              className="h-10 rounded-md bg-primary px-3 text-xs font-black uppercase tracking-[0.14em] text-white"
            >
              Import
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="h-10 rounded-md border border-red-100 bg-red-50 px-3 text-xs font-black uppercase tracking-[0.14em] text-red-600"
            >
              Xóa
            </button>
          </div>
        </div>

        <textarea
          value={jsonInput}
          onChange={(event) => setJsonInput(event.target.value)}
          placeholder="Dán JSON data vào đây..."
          spellCheck={false}
          className="h-40 w-full resize-y rounded-md border border-neutral-200 bg-neutral-950 p-2 font-mono text-xs leading-6 text-white outline-none focus:border-primary"
        />

        {message ? <p className="mt-2 rounded-md border border-neutral-200 bg-neutral-50 p-2 text-sm font-bold text-neutral-700">{message}</p> : null}
      </section>

      {items.length > 0 ? (
        <form onSubmit={handleSearch} className="mb-2 rounded-lg border border-neutral-200 bg-white p-2 shadow-sm">
          <div className="grid gap-2 xl:grid-cols-4">
            <Field label="Tìm kiếm tổng">
              <input
                value={draftFilter.keyword}
                onChange={(event) => updateFilter('keyword', event.target.value)}
                placeholder="Tiêu đề, mô tả, vị trí..."
                className="input input-sm input-bordered w-full bg-neutral-50"
              />
            </Field>

            <Field label="Số / tên chuyên gia">
              <input
                value={draftFilter.expert}
                onChange={(event) => updateFilter('expert', event.target.value)}
                placeholder="Ví dụ: Hương, INa, 093..."
                className="input input-sm input-bordered w-full bg-neutral-50"
              />
            </Field>

            <Field label="Số phòng trong mô tả">
              <input
                value={draftFilter.roomText}
                onChange={(event) => updateFilter('roomText', event.target.value)}
                placeholder="Ví dụ: 4PN hoặc 4 phòng"
                className="input input-sm input-bordered w-full bg-neutral-50"
              />
            </Field>

            <Field label="Sắp xếp">
              <select
                value={draftFilter.sort}
                onChange={(event) => updateFilter('sort', event.target.value as SortType)}
                className="select select-bordered select-sm w-full bg-neutral-50"
              >
                <option value="publishedDesc">Ngày đăng mới nhất</option>
                <option value="publishedAsc">Ngày đăng cũ nhất</option>
                <option value="modifiedDesc">Ngày cập nhật mới nhất</option>
                <option value="modifiedAsc">Ngày cập nhật cũ nhất</option>
                <option value="priceDesc">Giá cao đến thấp</option>
                <option value="priceAsc">Giá thấp đến cao</option>
                <option value="areaDesc">Diện tích lớn đến nhỏ</option>
                <option value="areaAsc">Diện tích nhỏ đến lớn</option>
                <option value="unitPriceDesc">Đơn giá cao đến thấp</option>
                <option value="unitPriceAsc">Đơn giá thấp đến cao</option>
                <option value="floorDesc">Số tầng cao đến thấp</option>
                <option value="floorAsc">Số tầng thấp đến cao</option>
              </select>
            </Field>

            <RangeField
              label="Giá tiền"
              from={draftFilter.priceFrom}
              to={draftFilter.priceTo}
              suffix="tỷ"
              onFrom={(value) => updateFilter('priceFrom', value)}
              onTo={(value) => updateFilter('priceTo', value)}
            />

            <RangeField
              label="Đơn giá diện tích"
              from={draftFilter.unitPriceFrom}
              to={draftFilter.unitPriceTo}
              suffix="tr/m²"
              onFrom={(value) => updateFilter('unitPriceFrom', value)}
              onTo={(value) => updateFilter('unitPriceTo', value)}
            />

            <RangeField
              label="Số tầng"
              from={draftFilter.floorFrom}
              to={draftFilter.floorTo}
              suffix="tầng"
              onFrom={(value) => updateFilter('floorFrom', value)}
              onTo={(value) => updateFilter('floorTo', value)}
            />

            <Field label="Số tin mỗi trang">
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="select select-bordered select-sm w-full bg-neutral-50"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} tin
                  </option>
                ))}
              </select>
            </Field>

            <DateRangeField
              label="Ngày đăng"
              from={draftFilter.publishedFrom}
              to={draftFilter.publishedTo}
              onFrom={(value) => updateFilter('publishedFrom', value)}
              onTo={(value) => updateFilter('publishedTo', value)}
            />

            <DateRangeField
              label="Ngày cập nhật"
              from={draftFilter.modifiedFrom}
              to={draftFilter.modifiedTo}
              onFrom={(value) => updateFilter('modifiedFrom', value)}
              onTo={(value) => updateFilter('modifiedTo', value)}
            />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 xl:flex xl:justify-end">
            <button
              type="button"
              onClick={() => {
                setDraftFilter(EMPTY_FILTER);
                setAppliedFilter(EMPTY_FILTER);
                setPage(1);
              }}
              className="h-10 rounded-md border border-neutral-300 bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-neutral-700"
            >
              Xóa lọc
            </button>

            <button type="submit" className="h-10 rounded-md bg-primary px-4 text-xs font-black uppercase tracking-[0.14em] text-white">
              Tìm kiếm
            </button>
          </div>
        </form>
      ) : null}

      {items.length > 0 ? (
        <section className="grid gap-2 xl:grid-cols-[1fr_420px]">
          <div className="space-y-2">
            <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-2 shadow-sm xl:flex-row xl:items-center xl:justify-between">
              <p className="text-xs font-bold text-neutral-600">
                Hiển thị {paginatedItems.length} / {filteredItems.length.toLocaleString('vi-VN')} tin
              </p>

              <div className="grid grid-cols-4 gap-1.5 xl:flex">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(1)}
                  className="h-9 rounded-md border border-neutral-200 px-2 text-xs font-black disabled:opacity-40"
                >
                  Đầu
                </button>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="h-9 rounded-md border border-neutral-200 px-2 text-xs font-black disabled:opacity-40"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="h-9 rounded-md border border-neutral-200 px-2 text-xs font-black disabled:opacity-40"
                >
                  Sau
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(totalPages)}
                  className="h-9 rounded-md border border-neutral-200 px-2 text-xs font-black disabled:opacity-40"
                >
                  Cuối
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
              {paginatedItems.map((item) => {
                const unitPrice = getUnitPrice(item);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`overflow-hidden rounded-lg border bg-white text-left shadow-sm transition hover:border-primary ${
                      selectedId === item.id ? 'border-primary ring-2 ring-primary/10' : 'border-neutral-200'
                    }`}
                  >
                    <div className="relative aspect-[4/3] bg-neutral-100">
                      <Image
                        src={getImage(item)}
                        alt={item.title}
                        fill
                        unoptimized
                        sizes="(min-width: 1280px) 25vw, 100vw"
                        className="object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                      <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
                        <span className="rounded-md bg-white px-2 py-1 text-sm font-black text-primary">{formatPrice(item.price?.value)}</span>

                        <span className="rounded-md bg-black/50 px-2 py-1 text-xs font-bold text-white">{item.area || 0} m²</span>
                      </div>
                    </div>

                    <div className="p-2">
                      <h2 className="line-clamp-2 min-h-[40px] text-sm font-black leading-snug">
                        {item.location?.address || item.location?.street || item.title}
                      </h2>

                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        <SmallBox label="Tầng" value={`${item.additional?.floor || 'N/A'}`} />
                        <SmallBox label="Đơn giá" value={unitPrice ? `${unitPrice.toFixed(1)} tr/m²` : 'N/A'} />
                      </div>

                      <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-neutral-500">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="xl:sticky xl:top-[86px] xl:h-[calc(100dvh-96px)]">
            {selectedItem ? (
              <div className="h-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                <div className="max-h-full overflow-y-auto p-2">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-neutral-100">
                    <Image src={getImage(selectedItem)} alt={selectedItem.title} fill unoptimized sizes="420px" className="object-cover" />
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(selectedItem.attribute || []).map((item) => (
                      <span key={item} className="rounded-md border border-primary/15 bg-primary/5 px-2 py-1 text-[10px] font-black text-primary">
                        {item}
                      </span>
                    ))}
                  </div>

                  <h2 className="mt-2 text-xl font-black leading-tight">
                    {selectedItem.location?.address || selectedItem.location?.street || selectedItem.title}
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-neutral-600">{selectedItem.title}</p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <DetailBox label="Giá" value={formatPrice(selectedItem.price?.value)} />
                    <DetailBox label="Diện tích" value={`${selectedItem.area || 0} m²`} />
                    <DetailBox label="Ngang" value={`${selectedItem.additional?.front || 'N/A'}m`} />
                    <DetailBox label="Số tầng" value={`${selectedItem.additional?.floor || 'N/A'}`} />
                    <DetailBox label="Ngày đăng" value={formatDate(selectedItem.published)} />
                    <DetailBox label="Ngày cập nhật" value={formatDate(selectedItem.modified)} />
                  </div>

                  <div className="mt-3 rounded-md border border-neutral-200 bg-neutral-50 p-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Vị trí</p>
                    <p className="mt-1 text-sm font-bold text-neutral-800">
                      {[selectedItem.location?.street, selectedItem.location?.address, selectedItem.zoneGroup].filter(Boolean).join(', ') ||
                        'Đang cập nhật'}
                    </p>
                  </div>

                  <div className="mt-3 rounded-md border border-neutral-200 bg-white p-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">Mô tả gốc</p>
                    <div className="mt-2 whitespace-pre-line text-sm font-medium leading-7 text-neutral-700">{selectedItem.description}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
                <p className="text-sm font-bold text-neutral-600">Chọn một tin để xem chi tiết.</p>
              </div>
            )}
          </aside>
        </section>
      ) : null}
    </main>
  );
}

type CommonProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: CommonProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</span>
      {children}
    </label>
  );
}

type RangeFieldProps = {
  label: string;
  suffix: string;
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
};

function RangeField({ label, suffix, from, to, onFrom, onTo }: RangeFieldProps) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>

      <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
        <input
          value={from}
          onChange={(event) => onFrom(event.target.value)}
          placeholder="Từ"
          inputMode="decimal"
          className="input input-sm input-bordered w-full bg-neutral-50"
        />

        <input
          value={to}
          onChange={(event) => onTo(event.target.value)}
          placeholder="Đến"
          inputMode="decimal"
          className="input input-sm input-bordered w-full bg-neutral-50"
        />

        <div className="flex h-8 items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 text-[10px] font-black text-neutral-500">
          {suffix}
        </div>
      </div>
    </div>
  );
}

type DateRangeFieldProps = {
  label: string;
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
};

function DateRangeField({ label, from, to, onFrom, onTo }: DateRangeFieldProps) {
  return (
    <div className="xl:col-span-2">
      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>

      <div className="grid grid-cols-2 gap-1.5">
        <input
          type="date"
          value={from}
          onChange={(event) => onFrom(event.target.value)}
          className="input input-sm input-bordered w-full bg-neutral-50"
        />

        <input type="date" value={to} onChange={(event) => onTo(event.target.value)} className="input input-sm input-bordered w-full bg-neutral-50" />
      </div>
    </div>
  );
}

type TextBoxProps = {
  label: string;
  value: string;
};

function Stat({ label, value }: TextBoxProps) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1.5">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-neutral-400">{label}</p>
      <p className="text-sm font-black text-neutral-900">{value}</p>
    </div>
  );
}

function SmallBox({ label, value }: TextBoxProps) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1.5">
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>
      <p className="truncate text-xs font-bold text-neutral-800">{value}</p>
    </div>
  );
}

function DetailBox({ label, value }: TextBoxProps) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-neutral-900">{value}</p>
    </div>
  );
}
