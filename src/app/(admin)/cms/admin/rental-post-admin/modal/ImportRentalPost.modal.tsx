'use client';

import { useState } from 'react';
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
    postedAt: '2026-04-11T00:00:00.000Z',
    expiredAt: '2026-05-11T00:00:00.000Z',
  },
];

export default function ImportRentalPostModal({ open, onClose, reload, authorId }: Props) {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

      // Hoạch định dữ liệu: hỗ trợ cả Array thuần hoặc Object chứa mảng rentalPosts
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

        // Ép kiểu (Type Coercion) các trường bắt buộc theo Backend Controller để tránh Crash
        return {
          ...obj,

          // Fix định danh người thao tác từ hệ thống Frontend
          author: authorId._id,

          // Bắt buộc chuỗi (String)
          title: String(obj.title || ''),
          description: String(obj.description || ''),
          categoryName: String(obj.categoryName || ''),
          priceUnit: String(obj.priceUnit || ''),
          province: String(obj.province || ''),
          district: String(obj.district || ''),
          address: String(obj.address || ''),

          // Bắt buộc mảng (Array)
          images: Array.isArray(obj.images) ? obj.images : [],

          // Bắt buộc số (Number)
          price: Number(obj.price || 0),
          area: Number(obj.area || 0),

          // Enum Fallback an toàn
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
    onClose();
  };

  return (
    <Modal
      open={open}
      className="max-w-full overflow-hidden bg-base-100 p-0 xl:max-w-6xl"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="border-b border-base-200 p-6">
        <h2 className="text-xl font-bold text-base-content">Nhập Dữ Liệu Bài Đăng Hàng Loạt</h2>
        <p className="mt-1 text-sm text-base-content/70">Hỗ trợ định dạng Array JSON hoặc Object từ API phản hồi.</p>
      </div>

      <div className="grid grid-cols-1 gap-0 xl:grid-cols-2">
        <div className="border-b border-base-200 bg-base-100 p-6 xl:border-b-0 xl:border-r">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-base-content">Dữ liệu JSON của bạn</span>
          </div>
          <textarea
            className="textarea textarea-bordered h-[400px] w-full resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Dán mảng JSON hoặc object chứa rentalPosts vào đây..."
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
          />
          {error && <div className="mt-3 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">{error}</div>}
        </div>

        <div className="bg-base-200/50 p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-base-content">Cấu trúc mẫu hợp lệ</span>
            <Button size="sm" color={copied ? 'success' : 'ghost'} className="h-8 min-h-8 text-xs font-medium" onClick={handleCopyExample}>
              {copied ? 'Đã sao chép' : 'Sao chép mẫu'}
            </Button>
          </div>
          <div className="h-[400px] overflow-auto rounded-lg bg-neutral p-4 text-neutral-content">
            <pre className="font-mono text-xs leading-relaxed">{JSON.stringify(EXAMPLE_JSON, null, 2)}</pre>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-base-200 bg-base-100 p-4">
        <Button variant="outline" onClick={handleClose}>
          Huỷ thao tác
        </Button>
        <Button color="primary" loading={loading} onClick={handleImport}>
          Tiến hành Nhập
        </Button>
      </div>
    </Modal>
  );
}
