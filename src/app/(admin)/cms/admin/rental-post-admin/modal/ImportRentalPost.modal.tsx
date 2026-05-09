'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal } from 'react-daisyui';
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

const EXAMPLE_JSON = [
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
    postType: 'vip1',
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
  if (Array.isArray(parsed)) {
    return parsed.filter(isJsonRecord);
  }

  if (isJsonRecord(parsed) && Array.isArray(parsed.rentalPosts)) {
    return parsed.rentalPosts.filter(isJsonRecord);
  }

  return [];
};

const updateParsedJson = (parsed: unknown, targetArray: JsonRecord[]): JsonRecord[] | JsonRecord | null => {
  if (Array.isArray(parsed)) {
    return targetArray;
  }

  if (isJsonRecord(parsed) && Array.isArray(parsed.rentalPosts)) {
    return {
      ...parsed,
      rentalPosts: targetArray,
    };
  }

  return null;
};

export default function ImportRentalPostModal({ open, onClose, reload, authorId, initialJsonText = '' }: Props) {
  useEscClose(open, onClose);

  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (!initialJsonText.trim()) return;

    setJsonText(initialJsonText);
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

  const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    if (!backdropRef.current) return;

    backdropRef.current.scrollTop = event.currentTarget.scrollTop;
    backdropRef.current.scrollLeft = event.currentTarget.scrollLeft;
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
        <mark className="rounded-[2px] bg-primary/20 text-transparent shadow-[0_0_0_2px_rgba(var(--p),0.2)]">{match}</mark>
        {after}
      </>
    );
  };

  const handleFieldChange = (index: number, field: string, value: string) => {
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      const targetArray = getRentalPostsFromJson(parsed);

      if (targetArray.length === 0 || !targetArray[index]) return;

      const numericFields = ['price', 'area', 'floorNumber', 'bedroomNumber', 'toiletNumber'];
      const finalValue: string | number = numericFields.includes(field) ? (value === '' ? '' : Number(value)) : value;

      const nextArray = targetArray.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        return {
          ...item,
          [field]: finalValue,
        };
      });

      const nextJson = updateParsedJson(parsed, nextArray);
      if (!nextJson) return;

      setJsonText(JSON.stringify(nextJson, null, 2));
    } catch {
      console.warn('Lỗi đồng bộ dữ liệu: JSON hiện tại không hợp lệ');
    }
  };

  const handleArrayChange = (index: number, field: string, text: string) => {
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      const targetArray = getRentalPostsFromJson(parsed);

      if (targetArray.length === 0 || !targetArray[index]) return;

      const arr = text
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);

      const nextArray = targetArray.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        return {
          ...item,
          [field]: arr,
        };
      });

      const nextJson = updateParsedJson(parsed, nextArray);
      if (!nextJson) return;

      setJsonText(JSON.stringify(nextJson, null, 2));
    } catch {
      console.warn('Lỗi đồng bộ mảng: JSON hiện tại không hợp lệ');
    }
  };

  const handleCopyExample = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(EXAMPLE_JSON, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Lỗi khi copy');
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!jsonText.trim()) {
        throw new Error('Vui lòng cung cấp dữ liệu JSON');
      }

      let parsed: unknown;

      try {
        parsed = JSON.parse(jsonText) as unknown;
      } catch {
        throw new Error('Định dạng JSON không hợp lệ.');
      }

      const dataArray = getRentalPostsFromJson(parsed);

      if (dataArray.length === 0) {
        throw new Error('Định dạng yêu cầu phải là Array hoặc Object chứa "rentalPosts"');
      }

      const normalized = dataArray.map((obj, index) => {
        if (!isJsonRecord(obj)) {
          throw new Error(`Bản ghi ${index + 1} lỗi`);
        }

        return {
          ...obj,
          author: authorId._id,
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
          images: getStringArray(obj.images),
          adminImages: getStringArray(obj.adminImages),
          price: getNumber(obj.price),
          area: getNumber(obj.area),
          postType: getString(obj.postType) || 'highlight',
          status: getString(obj.status) || 'active',
        };
      });

      await rentalPostAdminService.importRentalPost(normalized);
      await reload();
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
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

  const labelClass = 'text-[10px] font-bold uppercase tracking-widest text-base-content/60 mb-1.5 block';

  const inputClass =
    'w-full bg-white/60 dark:bg-black/10 border border-base-content/10 focus:border-primary focus:bg-base-100 dark:focus:bg-base-100 outline-none hover:border-primary/40 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-base-content transition-all placeholder:text-base-content/30 shadow-sm focus:ring-0';

  const renderField = (
    idx: number,
    item: JsonRecord,
    field: string,
    label: string,
    options?: {
      type?: string;
      placeholder?: string;
      isTextarea?: boolean;
      rows?: number;
      isArray?: boolean;
    }
  ) => {
    const { type = 'text', placeholder = '', isTextarea = false, rows = 3, isArray = false } = options || {};

    const commonProps = {
      className: `${inputClass} ${isTextarea ? 'resize-none' : ''}`,
      placeholder,
      onFocus: () => setActiveField({ index: idx, key: field }),
      onBlur: () => setActiveField(null),
    };

    const value = item[field];

    return (
      <div className="w-full flex-1">
        <label className={labelClass}>{label}</label>

        {isTextarea ? (
          <textarea
            {...commonProps}
            rows={rows}
            value={isArray ? getStringArray(value).join('\n') : getString(value)}
            onChange={(event) => (isArray ? handleArrayChange(idx, field, event.target.value) : handleFieldChange(idx, field, event.target.value))}
          />
        ) : (
          <input type={type} {...commonProps} value={getString(value)} onChange={(event) => handleFieldChange(idx, field, event.target.value)} />
        )}
      </div>
    );
  };

  const renderSelect = (idx: number, item: JsonRecord, field: string, label: string, options: { value: string; label: string }[]) => (
    <div className="w-full flex-1">
      <label className={labelClass}>{label}</label>

      <select
        className={inputClass}
        value={getString(item[field]) || options[0].value}
        onChange={(event) => handleFieldChange(idx, field, event.target.value)}
        onFocus={() => setActiveField({ index: idx, key: field })}
        onBlur={() => setActiveField(null)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <Modal
      open={open}
      className="flex h-[90dvh] w-full max-w-full flex-col overflow-hidden bg-base-200/95 p-0 shadow-2xl backdrop-blur-2xl sm:rounded-[2rem] lg:max-w-[95dvw] 2xl:max-w-[1500px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="flex flex-shrink-0 items-center justify-between border-b border-base-content/5 bg-base-100/90 px-6 py-4">
        <div>
          <h2 className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-base-content sm:text-2xl">
            <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">Đồng Bộ</span> Bất Động Sản
          </h2>
          <p className="mt-1 hidden text-sm font-medium text-base-content/50 sm:block">
            Sửa trực tiếp trên bảng Xem trước, hệ thống sẽ tự động map vào cấu trúc JSON.
          </p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="hidden border-base-content/10 sm:flex" onClick={handleCopyExample}>
            {copied ? 'Đã lưu mẫu' : 'Copy cấu trúc mẫu'}
          </Button>

          <button type="button" onClick={handleClose} className="btn btn-circle btn-ghost btn-sm bg-base-200/50 hover:bg-base-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-row overflow-hidden">
        <div className="flex h-[90dvh] shrink-0 flex-col border-b border-base-content/5 bg-base-100/40 p-2 lg:h-full lg:w-4/12 lg:shrink lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-6 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-base-300 [&::-webkit-scrollbar]:w-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wide text-base-content/70 sm:text-sm">Trình Biên Tập JSON</h3>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-xl border border-base-content/10 bg-base-100 shadow-inner">
            <div
              ref={backdropRef}
              className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words p-2 font-mono text-xs leading-[1.6] text-transparent sm:text-[13px]"
              aria-hidden="true"
            >
              {renderHighlightedText()}
            </div>

            <textarea
              className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre-wrap break-words bg-transparent p-2 font-mono text-xs leading-[1.6] text-base-content/80 caret-primary outline-none sm:text-[13px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-base-300 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5"
              placeholder="Dán mã JSON hoặc sửa bên Preview..."
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              onScroll={handleScroll}
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="mt-2 flex items-start gap-3 rounded-xl border border-error/20 bg-error/5 p-2 backdrop-blur-sm">
              <div className="shrink-0 rounded-full bg-error/20 p-1.5 text-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="pt-0.5 text-sm font-semibold text-error/90">{error}</p>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto bg-base-200/20 p-2 lg:w-8/12 lg:p-6 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-base-300 [&::-webkit-scrollbar]:w-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/70 sm:text-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success shadow-[0_0_10px_rgba(0,255,0,0.5)]" />
              Chỉnh Sửa Trực Tiếp ({previewData.length})
            </h3>
          </div>

          {previewData.length > 0 ? (
            <div className="flex flex-col gap-6 pb-6">
              {previewData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-5 rounded-3xl border border-base-content/5 bg-base-100 p-6 shadow-xl shadow-base-content/5 transition-all hover:border-primary/20"
                >
                  <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-slate-500/10 bg-slate-500/5 p-5">
                    <div className="absolute left-0 top-0 h-full w-1 bg-slate-500/30" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {renderField(idx, item, 'price', 'Mức giá', {
                        type: 'number',
                        placeholder: 'Nhập mức giá...',
                      })}
                      {renderField(idx, item, 'priceUnit', 'Đơn vị', {
                        placeholder: 'Nhập đơn vị giá...',
                      })}
                      {renderSelect(idx, item, 'postType', 'Loại Tin', [
                        { value: 'highlight', label: 'HIGHLIGHT' },
                        { value: 'vip1', label: 'VIP 1' },
                        { value: 'vip2', label: 'VIP 2' },
                        { value: 'vip3', label: 'VIP 3' },
                        { value: 'normal', label: 'NORMAL' },
                      ])}
                      {renderSelect(idx, item, 'status', 'Trạng Thái', [
                        { value: 'active', label: 'HIỂN THỊ (Active)' },
                        { value: 'hidden', label: 'ĐÃ ẨN (Hidden)' },
                      ])}
                    </div>
                  </div>

                  <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-red-500/10 bg-red-200 p-5">
                    <div className="absolute left-0 top-0 h-full w-1 bg-red-500/30" />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {renderField(idx, item, 'area', 'Diện tích (m²)', {
                        type: 'number',
                        placeholder: 'Nhập diện tích...',
                      })}
                      {renderField(idx, item, 'frontageWidth', 'Ngang (m)', {
                        placeholder: 'Nhập chiều rộng...',
                      })}
                      {renderField(idx, item, 'lotDepth', 'Dài (m)', {
                        placeholder: 'Nhập chiều dài...',
                      })}
                      {renderField(idx, item, 'backSize', 'Nở Hậu (m)', {
                        placeholder: 'Nhập chiều hậu...',
                      })}
                    </div>
                  </div>

                  <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-blue-500/10 bg-blue-500/5 p-5">
                    <div className="absolute left-0 top-0 h-full w-1 bg-blue-500/30" />
                    {renderField(idx, item, 'title', 'Tiêu đề bài đăng', {
                      placeholder: 'Nhập tiêu đề...',
                    })}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {renderField(idx, item, 'categoryName', 'Danh mục', {
                        placeholder: 'Chọn danh mục...',
                      })}
                      {renderField(idx, item, 'propertyType', 'Loại hình', {
                        placeholder: 'Nhập loại hình (Nhà phố, Căn hộ...)',
                      })}
                    </div>
                    {renderField(idx, item, 'description', 'Mô tả chi tiết', {
                      isTextarea: true,
                      rows: 15,
                      placeholder: 'Nhập mô tả...',
                    })}
                  </div>

                  <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-amber-500/10 bg-amber-500/5 p-5">
                    <div className="absolute left-0 top-0 h-full w-1 bg-amber-500/30" />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                      {renderField(idx, item, 'floorNumber', 'Số Tầng', {
                        type: 'number',
                        placeholder: 'Nhập số tầng...',
                      })}
                      {renderField(idx, item, 'bedroomNumber', 'Phòng Ngủ', {
                        type: 'number',
                        placeholder: 'Nhập số phòng ngủ...',
                      })}
                      {renderField(idx, item, 'toiletNumber', 'Wc', {
                        type: 'number',
                        placeholder: 'Nhập số wc...',
                      })}
                      {renderField(idx, item, 'locationType', 'Loại Vị Trí', {
                        placeholder: 'Nhập loại vị trí (Mặt tiền, Hẻm, ...)',
                      })}
                      {renderField(idx, item, 'direction', 'Hướng', {
                        placeholder: 'Nhập hướng...',
                      })}
                      {renderField(idx, item, 'legalStatus', 'Pháp Lý', {
                        placeholder: 'Nhập pháp lý (Sổ hồng, Sổ đỏ, ...)',
                      })}
                      {renderField(idx, item, 'furnitureStatus', 'Nội Thất', {
                        placeholder: 'Nhập nội thất...',
                      })}
                    </div>
                  </div>

                  <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-purple-500/10 bg-purple-500/5 p-5">
                    <div className="absolute left-0 top-0 h-full w-1 bg-purple-500/30" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {renderField(idx, item, 'province', 'Tỉnh / Thành', {
                        placeholder: 'Nhập tỉnh/thành...',
                      })}
                      {renderField(idx, item, 'district', 'Quận / Huyện', {
                        placeholder: 'Nhập quận/huyện...',
                      })}
                      {renderField(idx, item, 'ward', 'Phường / Xã', {
                        placeholder: 'Nhập phường/xã...',
                      })}
                      {renderField(idx, item, 'address', 'Địa chỉ cụ thể', {
                        placeholder: 'Nhập đường/số nhà...',
                      })}
                    </div>
                  </div>

                  <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-rose-500/10 bg-rose-500/5 p-5">
                    <div className="absolute left-0 top-0 h-full w-1 bg-rose-500/30" />
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {renderField(idx, item, 'images', 'Ảnh Hiển Thị (Mỗi link 1 dòng)', {
                        isTextarea: true,
                        isArray: true,
                        rows: 15,
                        placeholder: 'https://...',
                      })}
                      {renderField(idx, item, 'adminImages', 'Ảnh Nội Bộ (Admin Images)', {
                        isTextarea: true,
                        isArray: true,
                        rows: 15,
                        placeholder: 'https://...',
                      })}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {renderField(idx, item, 'youtubeLink', 'Youtube Link', {
                        placeholder: 'https://...',
                      })}
                      {renderField(idx, item, 'videoTitle', 'Tiêu đề Video', {
                        placeholder: 'Tiêu đề...',
                      })}
                      {renderField(idx, item, 'videoDescription', 'Mô tả Video', {
                        placeholder: 'Mô tả...',
                      })}
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-2 lg:grid-cols-2">
                      {renderField(idx, item, 'amenities', 'Tiện ích (Amenities)', {
                        isTextarea: true,
                        rows: 15,
                        placeholder: 'Trường học, Bệnh viện...',
                      })}
                      {renderField(idx, item, 'adminNote', 'Ghi chú kiểm duyệt (Admin Note)', {
                        isTextarea: true,
                        rows: 15,
                        placeholder: 'Thông tin ẩn...',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-base-content/10 bg-base-100/50 p-6 text-center sm:h-[400px] sm:p-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
                <div className="relative rounded-xl border border-base-content/5 bg-base-100 p-5 text-primary shadow-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>

              <h4 className="mb-1 text-lg font-bold text-base-content">Trình Xem Trước Trống</h4>
              <p className="max-w-[300px] text-sm font-medium text-base-content/50">
                Hãy dán mã JSON hợp lệ vào cột bên trái để hiển thị bảng điều khiển chỉnh sửa.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center justify-between gap-4 border-t border-base-content/5 bg-base-100/90 px-6 py-4 backdrop-blur-md sm:justify-end">
        <Button
          variant="outline"
          className="flex-1 rounded-xl border-base-content/10 font-bold hover:bg-base-200 sm:min-w-[130px] sm:flex-none"
          onClick={handleClose}
        >
          Huỷ thao tác
        </Button>

        <Button
          color="primary"
          className="flex-1 rounded-xl font-bold tracking-wide shadow-lg shadow-primary/30 transition-shadow hover:shadow-primary/50 sm:min-w-[160px] sm:flex-none"
          loading={loading}
          onClick={handleImport}
        >
          Xác nhận Import
        </Button>
      </div>
    </Modal>
  );
}
