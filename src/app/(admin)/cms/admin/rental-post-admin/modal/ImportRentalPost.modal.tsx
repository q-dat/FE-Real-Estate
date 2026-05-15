'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FiCheck, FiCopy, FiDatabase, FiFileText, FiSend, FiX } from 'react-icons/fi';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { IRentalAuthor } from '@/types/rentalAdmin/rentalAdmin.types';
import { useEscClose } from '@/hooks/useEscClose';

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => Promise<void>;
  authorId: IRentalAuthor;
  initialJsonText?: string;
}

type JsonRecord = Record<string, unknown>;

type ActiveField = {
  index: number;
  key: string;
};

const EXAMPLE_JSON: JsonRecord[] = [
  {
    code: '',
    images: [''],
    title: 'Nhà phố thương mại trung tâm Quận 1',
    description: 'Kết cấu 1 trệt 2 lầu, phù hợp kinh doanh hoặc mở văn phòng.',
    categoryName: 'Bất động sản bán',
    propertyType: 'Nhà phố',
    locationType: 'Mặt tiền',
    direction: 'Đông Nam',
    price: 25.5,
    priceUnit: 'Tỷ',
    area: 100,
    frontageWidth: 5,
    lotDepth: 20,
    backSize: 5,
    floorNumber: 3,
    bedroomNumber: 4,
    toiletNumber: 5,
    legalStatus: 'Sổ hồng riêng',
    furnitureStatus: 'Hoàn thiện cơ bản',
    province: 'Thành phố Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    address: 'Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    amenities: 'Thang máy, hầm để xe',
    youtubeLink: '',
    videoTitle: '',
    videoDescription: '',
    postType: 'highlight',
    status: 'active',
    adminNote: 'Khách hàng VIP, cần duyệt ưu tiên',
    adminImages: [],
  },
];

const isJsonRecord = (value: unknown): value is JsonRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const getString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return '';
};

const getNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;

  if (typeof value === 'string') {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  return 0;
};

const getStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
};

const getRentalPostsFromJson = (parsed: unknown): JsonRecord[] => {
  if (Array.isArray(parsed)) return parsed.filter(isJsonRecord);

  if (isJsonRecord(parsed) && Array.isArray(parsed.rentalPosts)) {
    return parsed.rentalPosts.filter(isJsonRecord);
  }

  return [];
};

const updateParsedJson = (parsed: unknown, targetArray: JsonRecord[]): JsonRecord[] | JsonRecord | null => {
  if (Array.isArray(parsed)) return targetArray;

  if (isJsonRecord(parsed) && Array.isArray(parsed.rentalPosts)) {
    return {
      ...parsed,
      rentalPosts: targetArray,
    };
  }

  return null;
};

const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export default function ImportRentalPostModal({ open, onClose, reload, authorId, initialJsonText = '' }: Props) {
  useEscClose(open, onClose);

  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<ActiveField | null>(null);

  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    if (initialJsonText.trim()) {
      setJsonText(initialJsonText);
    }

    setError(null);
    setActiveField(null);
  }, [open, initialJsonText]);

  const previewData = useMemo<JsonRecord[]>(() => {
    try {
      if (!jsonText.trim()) return [];

      const parsed = JSON.parse(jsonText) as unknown;
      return getRentalPostsFromJson(parsed);
    } catch {
      return [];
    }
  }, [jsonText]);

  if (!open) return null;

  const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    if (!highlightRef.current) return;

    highlightRef.current.scrollTop = event.currentTarget.scrollTop;
    highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
  };

  const renderHighlightedText = () => {
    if (!activeField || !jsonText.trim()) return jsonText;

    const searchStr = `"${activeField.key}":`;
    let startIndex = -1;

    for (let i = 0; i <= activeField.index; i += 1) {
      startIndex = jsonText.indexOf(searchStr, startIndex + 1);
      if (startIndex === -1) break;
    }

    if (startIndex === -1) return jsonText;

    let endOfLine = jsonText.indexOf('\n', startIndex);
    if (endOfLine === -1) endOfLine = jsonText.length;

    const before = jsonText.substring(0, startIndex);
    const match = jsonText.substring(startIndex, endOfLine);
    const after = jsonText.substring(endOfLine);

    return (
      <>
        {before}
        <mark className="rounded bg-cyan-400 text-transparent shadow-[0_0_0_2px_rgba(34,211,238,0.2)]">{match}</mark>
        {after}
      </>
    );
  };

  const setSyncedJson = (nextArray: JsonRecord[]) => {
    const parsed = JSON.parse(jsonText) as unknown;
    const nextJson = updateParsedJson(parsed, nextArray);

    if (!nextJson) return;

    setJsonText(JSON.stringify(nextJson, null, 2));
  };

  const handleFieldChange = (index: number, field: string, value: string) => {
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      const targetArray = getRentalPostsFromJson(parsed);

      if (!targetArray[index]) return;

      const numericFields = ['price', 'area', 'frontageWidth', 'lotDepth', 'backSize', 'floorNumber', 'bedroomNumber', 'toiletNumber'];
      const finalValue: string | number = numericFields.includes(field) ? (value === '' ? '' : Number(value)) : value;

      const nextArray = targetArray.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        return {
          ...item,
          [field]: finalValue,
        };
      });

      setSyncedJson(nextArray);
    } catch {
      setError('JSON hiện tại không hợp lệ, chưa thể đồng bộ trường.');
    }
  };

  const handleArrayChange = (index: number, field: string, text: string) => {
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      const targetArray = getRentalPostsFromJson(parsed);

      if (!targetArray[index]) return;

      const arrayValue = text
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);

      const nextArray = targetArray.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        return {
          ...item,
          [field]: arrayValue,
        };
      });

      setSyncedJson(nextArray);
    } catch {
      setError('JSON hiện tại không hợp lệ, chưa thể đồng bộ danh sách.');
    }
  };

  const handleCopy = async (key: string, value: string) => {
    const ok = await copyText(value);

    if (!ok) {
      setError('Không thể copy nội dung.');
      return;
    }

    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1200);
  };

  const handleCopyExample = async () => {
    await handleCopy('example', JSON.stringify(EXAMPLE_JSON, null, 2));
  };

  const handleFormatJson = () => {
    try {
      if (!jsonText.trim()) return;

      const parsed = JSON.parse(jsonText) as unknown;
      setJsonText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch {
      setError('JSON không hợp lệ, chưa thể format.');
    }
  };

  const handlePasteExample = () => {
    setJsonText(JSON.stringify(EXAMPLE_JSON, null, 2));
    setError(null);
    setActiveField(null);
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!jsonText.trim()) {
        throw new Error('Vui lòng cung cấp dữ liệu JSON.');
      }

      let parsed: unknown;

      try {
        parsed = JSON.parse(jsonText) as unknown;
      } catch {
        throw new Error('Định dạng JSON không hợp lệ.');
      }

      const dataArray = getRentalPostsFromJson(parsed);

      if (dataArray.length === 0) {
        throw new Error('Định dạng yêu cầu phải là Array hoặc Object chứa "rentalPosts".');
      }

      const normalized = dataArray.map((obj, index) => {
        if (!isJsonRecord(obj)) {
          throw new Error(`Bản ghi ${index + 1} không hợp lệ.`);
        }

        return {
          ...obj,
          author: authorId._id,
          code: getString(obj.code),
          title: getString(obj.title),
          description: getString(obj.description),
          categoryName: getString(obj.categoryName),
          propertyType: getString(obj.propertyType),
          locationType: getString(obj.locationType),
          direction: getString(obj.direction),
          priceUnit: getString(obj.priceUnit),
          province: getString(obj.province),
          district: getString(obj.district),
          ward: getString(obj.ward),
          address: getString(obj.address),
          amenities: getString(obj.amenities),
          youtubeLink: getString(obj.youtubeLink),
          videoTitle: getString(obj.videoTitle),
          videoDescription: getString(obj.videoDescription),
          legalStatus: getString(obj.legalStatus),
          furnitureStatus: getString(obj.furnitureStatus),
          adminNote: getString(obj.adminNote),
          images: getStringArray(obj.images),
          adminImages: getStringArray(obj.adminImages),
          price: getNumber(obj.price),
          area: getNumber(obj.area),
          frontageWidth: getNumber(obj.frontageWidth),
          lotDepth: getNumber(obj.lotDepth),
          backSize: getNumber(obj.backSize),
          floorNumber: getNumber(obj.floorNumber),
          bedroomNumber: getNumber(obj.bedroomNumber),
          toiletNumber: getNumber(obj.toiletNumber),
          postType: getString(obj.postType) || 'highlight',
          status: getString(obj.status) || 'active',
        };
      });

      await rentalPostAdminService.importRentalPost(normalized);
      await reload();
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi hệ thống.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setJsonText('');
    setError(null);
    setActiveField(null);
    onClose();
  };

  const labelClass = 'mb-1.5 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500';

  const inputClass =
    'h-11 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 text-[13px] font-semibold text-slate-100 outline-none transition placeholder:text-slate-600 hover:border-cyan-400/30 focus:border-cyan-400/60 focus:bg-slate-950 focus:ring-4 focus:ring-cyan-400/10';

  const textareaClass =
    'w-full resize-y rounded-xl border border-slate-700/80 bg-slate-950/80 p-3 text-[13px] leading-relaxed text-slate-100 outline-none transition placeholder:text-slate-600 hover:border-cyan-400/30 focus:border-cyan-400/60 focus:bg-slate-950 focus:ring-4 focus:ring-cyan-400/10';

  const renderField = (
    idx: number,
    item: JsonRecord,
    field: string,
    label: string,
    options?: {
      type?: 'text' | 'number';
      placeholder?: string;
      isTextarea?: boolean;
      rows?: number;
      isArray?: boolean;
    }
  ) => {
    const { type = 'text', placeholder = '', isTextarea = false, rows = 3, isArray = false } = options || {};
    const value = item[field];

    return (
      <div className="min-w-0">
        <label className={labelClass}>{label}</label>

        {isTextarea ? (
          <textarea
            rows={rows}
            value={isArray ? getStringArray(value).join('\n') : getString(value)}
            placeholder={placeholder}
            onFocus={() => setActiveField({ index: idx, key: field })}
            onBlur={() => setActiveField(null)}
            onChange={(event) => (isArray ? handleArrayChange(idx, field, event.target.value) : handleFieldChange(idx, field, event.target.value))}
            className={textareaClass}
          />
        ) : (
          <input
            type={type}
            value={getString(value)}
            placeholder={placeholder}
            onFocus={() => setActiveField({ index: idx, key: field })}
            onBlur={() => setActiveField(null)}
            onChange={(event) => handleFieldChange(idx, field, event.target.value)}
            className={inputClass}
          />
        )}
      </div>
    );
  };

  const renderSelect = (idx: number, item: JsonRecord, field: string, label: string, options: { value: string; label: string }[]) => {
    return (
      <div className="min-w-0">
        <label className={labelClass}>{label}</label>

        <select
          value={getString(item[field]) || options[0]?.value}
          onChange={(event) => handleFieldChange(idx, field, event.target.value)}
          onFocus={() => setActiveField({ index: idx, key: field })}
          onBlur={() => setActiveField(null)}
          className={inputClass}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-950 text-slate-100">
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl shadow-black/10">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</h3>
        </div>

        {children}
      </section>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-xl">
      <div className="flex h-[90dvh] w-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-700/70 bg-slate-950 text-slate-100 shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <FiDatabase />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-black uppercase tracking-[0.18em] text-slate-100">Import Workspace</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {previewData.length} bản ghi · đồng bộ form với JSON editor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyExample}
              className="hidden rounded-xl border border-slate-700/70 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-400/30 hover:bg-slate-800 xl:inline-flex"
            >
              {copiedKey === 'example' ? 'Đã copy mẫu' : 'Copy mẫu'}
            </button>

            <button
              type="button"
              onClick={handlePasteExample}
              className="hidden rounded-xl border border-slate-700/70 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-400/30 hover:bg-slate-800 xl:inline-flex"
            >
              Dán mẫu
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-900 text-slate-300 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
            >
              <FiX />
            </button>
          </div>
        </header>

        {error ? <div className="shrink-0 border-b border-amber-400/20 bg-amber-950/40 px-5 py-2 text-sm font-semibold text-amber-200">{error}</div> : null}

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="hidden min-h-0 w-[420px] shrink-0 flex-col border-r border-slate-800 bg-slate-950 lg:flex xl:w-[500px]">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-800 p-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">JSON Editor</p>
                <p className="mt-1 text-[11px] text-slate-600">Dán JSON, sửa JSON hoặc chỉnh từ form preview.</p>
              </div>

              <button
                type="button"
                onClick={handleFormatJson}
                className="rounded-xl border border-slate-700/70 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-400/30 hover:bg-slate-800"
              >
                Format
              </button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden p-4">
              <div className="relative h-full overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/70">
                <div
                  ref={highlightRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words p-4 font-mono text-[12px] leading-relaxed text-transparent"
                >
                  {renderHighlightedText()}
                </div>

                <textarea
                  value={jsonText}
                  placeholder="Dán mảng JSON hoặc object chứa rentalPosts..."
                  onChange={(event) => setJsonText(event.target.value)}
                  onScroll={handleScroll}
                  spellCheck={false}
                  className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre-wrap break-words bg-transparent p-4 font-mono text-[12px] leading-relaxed text-slate-200 caret-cyan-300 outline-none [scrollbar-width:thin] placeholder:text-slate-600"
                />
              </div>
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-900">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <FiFileText className="text-cyan-300" />
                <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-slate-400">Preview & Edit</p>
              </div>

              <button
                type="button"
                onClick={() => void handleCopy('json', jsonText)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-400/30 hover:bg-slate-800"
              >
                {copiedKey === 'json' ? <FiCheck /> : <FiCopy />}
                JSON
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:thin] xl:p-5">
              {previewData.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {previewData.map((item, idx) => (
                    <article key={idx} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-2xl shadow-black/10">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Bản ghi {idx + 1}</p>
                          <h3 className="mt-1 line-clamp-2 break-words text-lg font-black text-slate-100">
                            {getString(item.title) || 'Chưa có tiêu đề'}
                          </h3>
                        </div>

                        <div className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-black text-slate-400">
                          {getString(item.district) || 'Chưa có quận'} · {getString(item.price) || '-'} {getString(item.priceUnit)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <Section title="Thông tin chính">
                          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                            {renderField(idx, item, 'code', 'Mã bài')}
                            {renderField(idx, item, 'price', 'Mức giá', { type: 'number' })}
                            {renderField(idx, item, 'priceUnit', 'Đơn vị giá')}
                            {renderSelect(idx, item, 'postType', 'Loại tin', [
                              { value: 'highlight', label: 'Highlight' },
                              { value: 'vip1', label: 'VIP 1' },
                              { value: 'vip2', label: 'VIP 2' },
                              { value: 'vip3', label: 'VIP 3' },
                              { value: 'normal', label: 'Normal' },
                            ])}
                            {renderSelect(idx, item, 'status', 'Trạng thái', [
                              { value: 'active', label: 'Hiển thị' },
                              { value: 'pending', label: 'Chờ duyệt' },
                              { value: 'hidden', label: 'Đã ẩn' },
                              { value: 'expired', label: 'Hết hạn' },
                            ])}
                          </div>
                        </Section>

                        <Section title="Nội dung">
                          <div className="grid grid-cols-1 gap-4">
                            {renderField(idx, item, 'title', 'Tiêu đề')}
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                              {renderField(idx, item, 'categoryName', 'Danh mục')}
                              {renderField(idx, item, 'propertyType', 'Loại hình')}
                            </div>
                            {renderField(idx, item, 'description', 'Mô tả', { isTextarea: true, rows: 12 })}
                          </div>
                        </Section>

                        <Section title="Diện tích & công năng">
                          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                            {renderField(idx, item, 'area', 'Diện tích', { type: 'number' })}
                            {renderField(idx, item, 'frontageWidth', 'Ngang', { type: 'number' })}
                            {renderField(idx, item, 'lotDepth', 'Dài', { type: 'number' })}
                            {renderField(idx, item, 'backSize', 'Nở hậu', { type: 'number' })}
                            {renderField(idx, item, 'floorNumber', 'Số tầng', { type: 'number' })}
                            {renderField(idx, item, 'bedroomNumber', 'Phòng ngủ', { type: 'number' })}
                            {renderField(idx, item, 'toiletNumber', 'WC', { type: 'number' })}
                          </div>
                        </Section>

                        <Section title="Vị trí & pháp lý">
                          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                            {renderField(idx, item, 'province', 'Tỉnh / Thành')}
                            {renderField(idx, item, 'district', 'Quận / Huyện')}
                            {renderField(idx, item, 'ward', 'Phường / Xã')}
                            {renderField(idx, item, 'address', 'Địa chỉ')}
                            {renderField(idx, item, 'locationType', 'Loại vị trí')}
                            {renderField(idx, item, 'direction', 'Hướng')}
                            {renderField(idx, item, 'legalStatus', 'Pháp lý')}
                            {renderField(idx, item, 'furnitureStatus', 'Nội thất')}
                          </div>
                        </Section>

                        <Section title="Hình ảnh & media">
                          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            {renderField(idx, item, 'images', 'Ảnh hiển thị', {
                              isTextarea: true,
                              isArray: true,
                              rows: 10,
                              placeholder: 'Mỗi link một dòng...',
                            })}
                            {renderField(idx, item, 'adminImages', 'Ảnh nội bộ', {
                              isTextarea: true,
                              isArray: true,
                              rows: 10,
                              placeholder: 'Mỗi link một dòng...',
                            })}
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                            {renderField(idx, item, 'youtubeLink', 'Youtube link')}
                            {renderField(idx, item, 'videoTitle', 'Tiêu đề video')}
                            {renderField(idx, item, 'videoDescription', 'Mô tả video')}
                          </div>
                        </Section>

                        <Section title="Ghi chú">
                          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            {renderField(idx, item, 'amenities', 'Tiện ích', { isTextarea: true, rows: 8 })}
                            {renderField(idx, item, 'adminNote', 'Ghi chú admin', { isTextarea: true, rows: 8 })}
                          </div>
                        </Section>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[55dvh] items-center justify-center">
                  <div className="max-w-md rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                      <FiFileText />
                    </div>

                    <h3 className="text-base font-black text-slate-100">Chưa có dữ liệu preview</h3>

                    <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                      Dán JSON vào khung bên trái để kiểm tra và chỉnh sửa trước khi import.
                    </p>

                    <button
                      type="button"
                      onClick={handlePasteExample}
                      className="mt-4 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-950 transition hover:bg-cyan-300 lg:hidden"
                    >
                      Dán mẫu JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-slate-800 bg-slate-950/95 px-5 py-4 backdrop-blur-xl xl:flex-row xl:items-center xl:justify-between">
          <div className="text-xs font-medium text-slate-500">
            Sẵn sàng import <span className="font-black text-slate-200">{previewData.length}</span> bản ghi.
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="h-11 rounded-xl border border-slate-700/70 bg-slate-900 px-4 text-xs font-black uppercase tracking-wide text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Huỷ
            </button>

            <button
              type="button"
              onClick={handleImport}
              disabled={loading || previewData.length === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 text-xs font-black uppercase tracking-wide text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiSend />
              {loading ? 'Đang import...' : 'Import dữ liệu'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}