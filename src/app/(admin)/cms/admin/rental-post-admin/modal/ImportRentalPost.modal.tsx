'use client';

import { useState, useMemo } from 'react';
import { Button, Modal } from 'react-daisyui';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { IRentalAuthor } from '@/types/rentalAdmin/rentalAdmin.types';

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
    pricePerM2: 255000000,
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
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFullExample, setShowFullExample] = useState(false);

  // Tự động Parse dữ liệu theo thời gian thực để tạo Preview
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
      return [];
    }
  }, [jsonText]);

  const handleCopyExample = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(EXAMPLE_JSON, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Không thể sao chép vào clipboard');
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!jsonText.trim()) {
        throw new Error('Vui lòng nhập dữ liệu JSON');
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        throw new Error('Định dạng JSON không hợp lệ');
      }

      let dataArray: unknown[] = [];

      if (Array.isArray(parsed)) {
        dataArray = parsed;
      } else if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'rentalPosts' in parsed &&
        Array.isArray((parsed as Record<string, unknown>).rentalPosts)
      ) {
        dataArray = (parsed as Record<string, unknown>).rentalPosts as unknown[];
      } else {
        throw new Error('Dữ liệu phải là Array hoặc Object chứa mảng "rentalPosts"');
      }

      if (dataArray.length === 0) {
        throw new Error('Không tìm thấy dữ liệu bài đăng nào để import');
      }

      const normalized = dataArray.map((item, index) => {
        if (typeof item !== 'object' || item === null) {
          throw new Error(`Dữ liệu tại vị trí ${index} không phải là object hợp lệ`);
        }

        const obj = item as Record<string, unknown>;

        return {
          ...obj,
          author: authorId._id,
          title: String(obj.title || ''),
          description: String(obj.description || ''),
          categoryName: String(obj.categoryName || ''),
          priceUnit: String(obj.priceUnit || ''),
          province: String(obj.province || ''),
          district: String(obj.district || ''),
          address: String(obj.address || ''),
          images: Array.isArray(obj.images) ? obj.images : [],
          price: Number(obj.price || 0),
          area: Number(obj.area || 0),
          postType: typeof obj.postType === 'string' && obj.postType ? obj.postType : 'highlight',
          status: typeof obj.status === 'string' && obj.status ? obj.status : 'active',
        };
      });

      await rentalPostAdminService.importRentalPost(normalized);
      await reload();
      handleClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống khi import';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setJsonText('');
    setError(null);
    setShowFullExample(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      className="flex h-[90vh] max-w-full flex-col overflow-hidden bg-base-100 p-0 shadow-2xl xl:max-w-7xl"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex-shrink-0 border-b border-base-200 bg-base-100/50 p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-base-content">Nhập Dữ Liệu Bất Động Sản Hàng Loạt</h2>
        <p className="mt-1 text-sm text-base-content/70">
          Hỗ trợ định dạng Array JSON hoặc Object từ API phản hồi. Paste JSON để xem preview tự động đầy đủ thông tin.
        </p>
      </div>

      {/* Body */}
      <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden bg-base-200/30 xl:grid-cols-2">
        {/* CỘT TRÁI: Nhập JSON */}
        <div className="flex h-full flex-col overflow-y-auto border-b border-base-200 bg-base-100 p-6 xl:border-b-0 xl:border-r">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-base-content">Dữ liệu JSON của bạn</span>
          </div>
          <textarea
            className="textarea textarea-bordered min-h-[400px] w-full flex-1 resize-none font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Dán mảng JSON hoặc object chứa rentalPosts vào đây..."
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
          />
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 p-3 text-sm font-medium text-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* CỘT PHẢI: Mẫu JSON & Preview Đầy Đủ Chi Tiết */}
        <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
          {/* Box 1: Cấu trúc mẫu JSON */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-base-content">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Cấu trúc JSON Mẫu
              </span>
              <Button size="sm" color={copied ? 'success' : 'ghost'} className="h-8 min-h-8 text-xs font-medium" onClick={handleCopyExample}>
                {copied ? 'Đã sao chép' : 'Sao chép mẫu'}
              </Button>
            </div>
            <div className="relative rounded-lg border border-neutral/20 bg-neutral shadow-inner transition-all duration-300">
              <div className={`overflow-hidden transition-all duration-300 ${showFullExample ? 'max-h-[600px] overflow-y-auto' : 'max-h-[160px]'}`}>
                <pre className="p-4 font-mono text-xs leading-relaxed text-neutral-content">{JSON.stringify(EXAMPLE_JSON, null, 2)}</pre>
              </div>

              {!showFullExample && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 rounded-b-lg bg-gradient-to-t from-neutral to-transparent" />
              )}

              <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2">
                <Button
                  size="sm"
                  className="rounded-full border-neutral-content/20 bg-base-100/10 text-xs text-neutral-content shadow-lg backdrop-blur-md hover:bg-base-100 hover:text-base-content"
                  onClick={() => setShowFullExample(!showFullExample)}
                >
                  {showFullExample ? 'Thu gọn mẫu' : 'Xem thêm mẫu'}
                </Button>
              </div>
            </div>
          </div>

          {/* Box 2: Trực quan hóa dữ liệu CHI TIẾT */}
          <div className="flex min-h-[300px] flex-1 flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-base-content">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Xem trước Dữ liệu Chi tiết ({previewData.length} bản ghi)
              </span>
            </div>

            <div className="flex-1 overflow-y-auto rounded-lg border border-base-300 bg-base-100 p-2 shadow-inner">
              {previewData.length > 0 ? (
                <div className="flex flex-col gap-4 p-2">
                  {previewData.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="group relative flex flex-col gap-3 rounded-xl border border-base-200 bg-base-100 p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                    >
                      {/* Tiêu đề & Label */}
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold leading-snug text-base-content transition-colors group-hover:text-primary">
                          {item.title || '(Chưa có tiêu đề)'}
                        </h4>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {item.postType && (
                            <span className="badge badge-primary badge-outline badge-sm text-[10px] font-bold uppercase">{item.postType}</span>
                          )}
                          {item.status && (
                            <span className={`badge badge-sm text-[10px] ${item.status === 'active' ? 'badge-success text-white' : 'badge-ghost'}`}>
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mô tả */}
                      <p className="line-clamp-3 text-xs text-base-content/70">{item.description || 'Không có mô tả...'}</p>

                      {/* Giá & Diện tích nổi bật */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                        <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2.5 py-1.5 text-success">
                          <span className="text-sm font-bold">{item.price || 0}</span> {item.priceUnit || 'VNĐ'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-info/10 px-2.5 py-1.5 text-info">
                          <span className="text-sm font-bold">{item.area || 0}</span> m²
                        </span>
                        {item.propertyType && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-base-200 px-2.5 py-1.5 text-base-content/80">
                            {item.propertyType} {item.categoryName && `• ${item.categoryName}`}
                          </span>
                        )}
                      </div>

                      {/* Thông số chi tiết dạng Grid */}
                      <div className="grid grid-cols-2 gap-3 rounded-lg bg-base-200/50 p-3 text-xs text-base-content/80 md:grid-cols-3">
                        <div>
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase text-base-content/50">Kết cấu</span>
                          <span className="font-medium">
                            {item.floorNumber ? `${item.floorNumber} Tầng` : '-'} • {item.bedroomNumber ? `${item.bedroomNumber} PN` : '-'} •{' '}
                            {item.toiletNumber ? `${item.toiletNumber} WC` : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase text-base-content/50">Kích thước (Ngang x Dài)</span>
                          <span className="font-medium">
                            {item.frontageWidth || '?'}m x {item.lotDepth || '?'}m {item.backSize ? ` (Nở hậu ${item.backSize}m)` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase text-base-content/50">Vị trí & Hướng</span>
                          <span className="font-medium">
                            {item.locationType || 'Chưa rõ'} • Hướng {item.direction || 'Chưa rõ'}
                          </span>
                        </div>
                        <div>
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase text-base-content/50">Pháp lý</span>
                          <span className="block truncate font-medium" title={item.legalStatus}>
                            {item.legalStatus || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase text-base-content/50">Tình trạng nội thất</span>
                          <span className="block truncate font-medium" title={item.furnitureStatus}>
                            {item.furnitureStatus || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="mb-0.5 block text-[10px] font-semibold uppercase text-base-content/50">Giá / m²</span>
                          <span className="font-medium">{item.pricePerM2 ? item.pricePerM2.toLocaleString() + ' đ' : '-'}</span>
                        </div>
                      </div>

                      {/* Tiện ích bổ sung */}
                      {item.amenities && (
                        <div className="text-xs text-base-content/80">
                          <span className="font-semibold">Tiện ích:</span> {item.amenities}
                        </div>
                      )}

                      {/* Ghi chú Admin */}
                      {item.adminNote && (
                        <div className="rounded-md border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning-content">
                          <span className="mb-1 flex items-center gap-1 font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Admin Note
                          </span>
                          <span className="whitespace-pre-wrap leading-relaxed">{item.adminNote}</span>
                        </div>
                      )}

                      {/* Địa chỉ (Footer Card) */}
                      {(item.address || item.district || item.province || item.ward) && (
                        <div className="mt-1 flex items-start gap-1.5 border-t border-base-200 pt-3 text-xs font-medium text-base-content/60">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 shrink-0 text-error"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="line-clamp-2">
                            {item.address ? `${item.address}, ` : ''}
                            {item.ward ? `${item.ward}, ` : ''}
                            {item.district ? `${item.district}, ` : ''}
                            {item.province}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center opacity-60">
                  <div className="mb-3 rounded-full bg-base-200 p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-base-content/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Chưa có dữ liệu để xem trước</p>
                  <p className="mt-1 text-xs">Dán JSON hợp lệ vào khung bên trái để xem giao diện bản ghi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-base-200 bg-base-100 p-4">
        <Button variant="outline" className="min-w-[120px]" onClick={handleClose}>
          Huỷ thao tác
        </Button>
        <Button color="primary" className="min-w-[140px]" loading={loading} onClick={handleImport}>
          Tiến hành Nhập
        </Button>
      </div>
    </Modal>
  );
}
