'use client';
import { useState, useMemo, useRef } from 'react';
import { Button, Modal } from 'react-daisyui';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { IRentalAuthor } from '@/types/rentalAdmin/rentalAdmin.types';
import { useEscClose } from '@/hooks/useEscClose';

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => Promise<void>;
  authorId: IRentalAuthor;
}

const EXAMPLE_JSON = [
  {
    code: '',
    images: ['https://example.com/image1.jpg'],
    title: 'Nhà phố thương mại trung tâm Quận 1',
    description: 'Kết cấu 1 trệt 2 lầu, phù hợp kinh doanh hoặc mở văn phòng.',
    categoryName: 'Bất động sản bán',
    propertyType: 'Nhà phố',
    locationType: 'Mặt tiền',
    direction: 'Đông Nam',
    price: 25.5,
    priceUnit: 'Tỷ',
    area: 100,
    frontageWidth: '5',
    lotDepth: '20',
    backSize: '5',
    floorNumber: 3,
    bedroomNumber: 4,
    toiletNumber: 5,
    legalStatus: 'Sổ hồng riêng',
    furnitureStatus: 'Hoàn thiện cơ bản',
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    address: 'Đường Lê Lợi',
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

export default function ImportRentalPostModal({ open, onClose, reload, authorId }: Props) {
  useEscClose(open, onClose);
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // State quản lý việc bôi đen JSON khi focus
  const [activeField, setActiveField] = useState<{ index: number; key: string } | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Parse JSON an toàn để hiển thị Preview
  const previewData = useMemo(() => {
    try {
      if (!jsonText.trim()) return [];
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).rentalPosts)) {
        return (parsed as any).rentalPosts;
      }
      return [];
    } catch {
      return []; // Trả về rỗng nếu đang gõ sai cú pháp
    }
  }, [jsonText]);

  // Handle Scroll Sync cho Highlighter
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
      backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Render Highlighted Text
  const renderHighlightedText = () => {
    if (!activeField || !jsonText.trim()) return jsonText;
    const searchStr = `"${activeField.key}":`;

    let startIndex = -1;
    for (let i = 0; i <= activeField.index; i++) {
      startIndex = jsonText.indexOf(searchStr, startIndex + 1);
      if (startIndex === -1) break;
    }

    if (startIndex !== -1) {
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
    }
    return jsonText;
  };

  // Xử lý thay đổi trực tiếp từ giao diện Preview -> Đồng bộ ngược JSON
  const handleFieldChange = (index: number, field: string, value: any) => {
    try {
      const parsed = JSON.parse(jsonText);
      let targetArray = [];
      let isWrapper = false;

      if (Array.isArray(parsed)) {
        targetArray = [...parsed];
      } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).rentalPosts)) {
        targetArray = [...(parsed as any).rentalPosts];
        isWrapper = true;
      } else {
        return;
      }

      const numericFields = ['price', 'area', 'floorNumber', 'bedroomNumber', 'toiletNumber'];
      let finalValue = value;
      if (numericFields.includes(field)) {
        finalValue = value === '' ? '' : Number(value);
      }

      targetArray[index] = { ...targetArray[index], [field]: finalValue };
      const newJson = isWrapper ? { ...parsed, rentalPosts: targetArray } : targetArray;

      setJsonText(JSON.stringify(newJson, null, 2));
    } catch (e) {
      console.warn('Lỗi đồng bộ dữ liệu: JSON hiện tại không hợp lệ');
    }
  };

  const handleArrayChange = (index: number, field: string, text: string) => {
    const arr = text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    handleFieldChange(index, field, arr);
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
      if (!jsonText.trim()) throw new Error('Vui lòng cung cấp dữ liệu JSON');

      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        throw new Error('Định dạng JSON không hợp lệ.');
      }

      let dataArray: unknown[] = [];
      if (Array.isArray(parsed)) dataArray = parsed;
      else if (parsed !== null && typeof parsed === 'object' && 'rentalPosts' in parsed && Array.isArray((parsed as any).rentalPosts)) {
        dataArray = (parsed as any).rentalPosts;
      } else throw new Error('Định dạng yêu cầu phải là Array hoặc Object chứa "rentalPosts"');

      if (dataArray.length === 0) throw new Error('Dữ liệu trống.');

      const normalized = dataArray.map((item, index) => {
        if (typeof item !== 'object' || item === null) throw new Error(`Bản ghi ${index + 1} lỗi`);
        const obj = item as any;
        return {
          ...obj,
          author: authorId._id,
          title: String(obj.title || ''),
          description: String(obj.description || ''),
          categoryName: String(obj.categoryName || ''),
          propertyType: String(obj.propertyType || ''),
          locationType: String(obj.locationType || ''),
          direction: String(obj.direction || ''),
          priceUnit: String(obj.priceUnit || ''),
          province: String(obj.province || ''),
          district: String(obj.district || ''),
          ward: String(obj.ward || ''),
          address: String(obj.address || ''),
          images: Array.isArray(obj.images) ? obj.images : [],
          adminImages: Array.isArray(obj.adminImages) ? obj.adminImages : [],
          price: Number(obj.price || 0),
          area: Number(obj.area || 0),
          postType: typeof obj.postType === 'string' && obj.postType ? obj.postType : 'highlight',
          status: typeof obj.status === 'string' && obj.status ? obj.status : 'active',
        };
      });

      await rentalPostAdminService.importRentalPost(normalized);
      await reload();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống');
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

  // Base Classes for Luxury Inputs
  const labelClass = 'text-[10px] font-bold uppercase tracking-widest text-base-content/60 mb-1.5 block';
  const inputClass =
    'w-full bg-white/60 dark:bg-black/10 border border-base-content/10 focus:border-primary focus:bg-base-100 dark:focus:bg-base-100 outline-none hover:border-primary/40 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-base-content transition-all placeholder:text-base-content/30 shadow-sm focus:ring-0';

  // Form Field Render Helpers
  const renderField = (
    idx: number,
    item: any,
    field: string,
    label: string,
    options?: { type?: string; placeholder?: string; isTextarea?: boolean; rows?: number; isArray?: boolean }
  ) => {
    const { type = 'text', placeholder = '', isTextarea = false, rows = 3, isArray = false } = options || {};

    const commonProps = {
      className: `${inputClass} ${isTextarea ? 'resize-none' : ''}`,
      placeholder,
      onFocus: () => setActiveField({ index: idx, key: field }),
      onBlur: () => setActiveField(null),
    };

    return (
      <div className="w-full flex-1">
        <label className={labelClass}>{label}</label>
        {isTextarea ? (
          <textarea
            {...commonProps}
            rows={rows}
            value={isArray ? (Array.isArray(item[field]) ? item[field].join('\n') : '') : item[field] || ''}
            onChange={(e) => (isArray ? handleArrayChange(idx, field, e.target.value) : handleFieldChange(idx, field, e.target.value))}
          />
        ) : (
          <input type={type} {...commonProps} value={item[field] || ''} onChange={(e) => handleFieldChange(idx, field, e.target.value)} />
        )}
      </div>
    );
  };

  const renderSelect = (idx: number, item: any, field: string, label: string, options: { value: string; label: string }[]) => (
    <div className="w-full flex-1">
      <label className={labelClass}>{label}</label>
      <select
        className={inputClass}
        value={item[field] || options[0].value}
        onChange={(e) => handleFieldChange(idx, field, e.target.value)}
        onFocus={() => setActiveField({ index: idx, key: field })}
        onBlur={() => setActiveField(null)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <Modal
      open={open}
      className="flex h-[90vh] w-full max-w-full flex-col overflow-hidden bg-base-200/95 p-0 shadow-2xl backdrop-blur-2xl sm:rounded-[2rem] lg:max-w-[95vw] 2xl:max-w-[1500px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* --- HEADER --- */}
      <div className="z-10 flex flex-shrink-0 items-center justify-between border-b border-base-content/5 bg-base-100/90 px-6 py-4">
        <div>
          <h2 className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-base-content sm:text-2xl">
            <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">Đồng Bộ</span> Bất Động Sản
          </h2>
          <p className="mt-1 hidden text-sm font-medium text-base-content/50 sm:block">
            Sửa trực tiếp trên bảng Xem trước, hệ thống sẽ tự động map (Two-way Sync) vào cấu trúc JSON.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="hidden border-base-content/10 sm:flex" onClick={handleCopyExample}>
            {copied ? 'Đã lưu mẫu' : 'Copy cấu trúc mẫu'}
          </Button>
          <button onClick={handleClose} className="btn btn-circle btn-ghost btn-sm bg-base-200/50 hover:bg-base-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* --- BODY --- */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Lõi Nhập Liệu JSON */}
        <div className="flex h-[35vh] shrink-0 flex-col border-b border-base-content/5 bg-base-100/40 p-4 lg:h-full lg:w-4/12 lg:shrink lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-6 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-base-300 [&::-webkit-scrollbar]:w-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wide text-base-content/70 sm:text-sm">Trình Biên Tập JSON</h3>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-inner">
            {/* Backdrop Highlighter */}
            <div
              ref={backdropRef}
              className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words p-4 font-mono text-[12px] leading-[1.6] text-transparent sm:text-[13px] lg:p-5"
              aria-hidden="true"
            >
              {renderHighlightedText()}
            </div>
            {/* Real Textarea */}
            <textarea
              className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre-wrap break-words bg-transparent p-4 font-mono text-[12px] leading-[1.6] text-base-content/80 caret-primary outline-none sm:text-[13px] lg:p-5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-base-300 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5"
              placeholder="Dán mã JSON hoặc sửa bên Preview..."
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              onScroll={handleScroll}
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-error/20 bg-error/5 p-4 backdrop-blur-sm">
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

        {/* CỘT PHẢI: Live Preview Bảng Điều Khiển */}
        <div className="flex flex-1 flex-col overflow-y-auto bg-base-200/20 p-4 lg:w-8/12 lg:p-6 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-base-300 [&::-webkit-scrollbar]:w-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/70 sm:text-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success shadow-[0_0_10px_rgba(0,255,0,0.5)]" />
              Chỉnh Sửa Trực Tiếp ({previewData.length})
            </h3>
          </div>

          {previewData.length > 0 ? (
            <div className="flex flex-col gap-6 pb-6">
              {previewData.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex flex-col gap-5 rounded-3xl border border-base-content/5 bg-base-100 p-6 shadow-xl shadow-base-content/5 transition-all hover:border-primary/20"
                >
                  {/* Nhóm 1: Nhận diện (Slate) */}
                  <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-500/10 bg-slate-500/5 p-5">
                    <div className="absolute left-0 top-0 h-full w-1 bg-slate-500/30"></div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

                  {/* Nhóm 2: Cơ bản (Blue) */}
                  <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-blue-500/10 bg-blue-500/5 p-5">
                    <div className="absolute left-0 top-0 h-full w-1 bg-blue-500/30"></div>
                    {renderField(idx, item, 'title', 'Tiêu đề bài đăng', { placeholder: 'Nhập tiêu đề...' })}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {renderField(idx, item, 'categoryName', 'Danh mục', { placeholder: 'Chọn danh mục...' })}
                      {renderField(idx, item, 'propertyType', 'Loại hình', { placeholder: 'Nhập loại hình (Nhà phố, Căn hộ...)' })}
                    </div>
                    {renderField(idx, item, 'description', 'Mô tả chi tiết', { isTextarea: true, rows: 10, placeholder: 'Nhập mô tả...' })}
                  </div>

                  {/* Nhóm 3: Giá & Diện tích (Emerald) */}
                  <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5">
                    <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500/30"></div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {renderField(idx, item, 'price', 'Mức giá', { type: 'number', placeholder: 'Nhập mức giá...' })}
                      {renderField(idx, item, 'priceUnit', 'Đơn vị', { placeholder: 'Nhập đơn vị giá...' })}
                      {renderField(idx, item, 'area', 'Diện tích (m²)', { type: 'number', placeholder: 'Nhập diện tích...' })}
                    </div>
                  </div>

                  {/* Nhóm 4: Kỹ thuật (Amber) */}
                  <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-amber-500/10 bg-amber-500/5 p-5">
                    <div className="absolute left-0 top-0 h-full w-1 bg-amber-500/30"></div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                      {renderField(idx, item, 'floorNumber', 'Số Tầng', { type: 'number', placeholder: 'Nhập số tầng...' })}
                      {renderField(idx, item, 'bedroomNumber', 'Phòng Ngủ', { type: 'number', placeholder: 'Nhập số phòng ngủ...' })}
                      {renderField(idx, item, 'toiletNumber', 'Wc', { type: 'number', placeholder: 'Nhập số wc...' })}
                      {renderField(idx, item, 'frontageWidth', 'Ngang (m)', { placeholder: 'Nhập chiều rộng...' })}
                      {renderField(idx, item, 'lotDepth', 'Dài (m)', { placeholder: 'Nhập chiều dài...' })}
                      {renderField(idx, item, 'backSize', 'Nở Hậu (m)', { placeholder: 'Nhập chiều hậu...' })}
                      {renderField(idx, item, 'locationType', 'Loại Vị Trí', { placeholder: 'Nhập loại vị trí (Mặt tiền, Hẻm, ...)' })}
                      {renderField(idx, item, 'direction', 'Hướng', { placeholder: 'Nhập hướng...' })}
                      {renderField(idx, item, 'legalStatus', 'Pháp Lý', { placeholder: 'Nhập pháp lý (Sổ hồng, Sổ đỏ, ...)' })}
                      {renderField(idx, item, 'furnitureStatus', 'Nội Thất', { placeholder: 'Nhập nội thất...' })}
                    </div>
                  </div>

                  {/* Nhóm 5: Địa chỉ (Purple) */}
                  <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-purple-500/10 bg-purple-500/5 p-5">
                    <div className="absolute left-0 top-0 h-full w-1 bg-purple-500/30"></div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {renderField(idx, item, 'province', 'Tỉnh / Thành', { placeholder: 'Nhập tỉnh/thành...' })}
                      {renderField(idx, item, 'district', 'Quận / Huyện', { placeholder: 'Nhập quận/huyện...' })}
                      {renderField(idx, item, 'ward', 'Phường / Xã', { placeholder: 'Nhập phường/xã...' })}
                      {renderField(idx, item, 'address', 'Đường / Số nhà', { placeholder: 'Nhập đường/số nhà...' })}
                    </div>
                  </div>

                  {/* Nhóm 6: Media & Ghi chú (Rose) */}
                  <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-rose-500/10 bg-rose-500/5 p-5">
                    <div className="absolute left-0 top-0 h-full w-1 bg-rose-500/30"></div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {renderField(idx, item, 'images', 'Ảnh Hiển Thị (Mỗi link 1 dòng)', {
                        isTextarea: true,
                        isArray: true,
                        rows: 4,
                        placeholder: 'https://...',
                      })}
                      {renderField(idx, item, 'adminImages', 'Ảnh Nội Bộ (Admin Images)', {
                        isTextarea: true,
                        isArray: true,
                        rows: 4,
                        placeholder: 'https://...',
                      })}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {renderField(idx, item, 'youtubeLink', 'Youtube Link', { placeholder: 'https://...' })}
                      {renderField(idx, item, 'videoTitle', 'Tiêu đề Video', { placeholder: 'Tiêu đề...' })}
                      {renderField(idx, item, 'videoDescription', 'Mô tả Video', { placeholder: 'Mô tả...' })}
                    </div>
                    <div className="grid grid-cols-1 gap-4 pt-2 lg:grid-cols-2">
                      {renderField(idx, item, 'amenities', 'Tiện ích (Amenities)', {
                        isTextarea: true,
                        rows: 3,
                        placeholder: 'Trường học, Bệnh viện...',
                      })}
                      {renderField(idx, item, 'adminNote', 'Ghi chú kiểm duyệt (Admin Note)', {
                        isTextarea: true,
                        rows: 3,
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
                <div className="relative rounded-2xl border border-base-content/5 bg-base-100 p-5 text-primary shadow-xl">
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

      {/* --- FOOTER / ACTIONS --- */}
      <div className="z-10 flex flex-shrink-0 items-center justify-between gap-4 border-t border-base-content/5 bg-base-100/90 px-6 py-4 backdrop-blur-md sm:justify-end">
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
