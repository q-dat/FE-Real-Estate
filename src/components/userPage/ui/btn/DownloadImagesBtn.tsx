import React, { useState } from 'react';
import { MdDownload, MdOutlineDownloadDone } from 'react-icons/md';
import CancelBtn from './CancelBtn';
import SubmitBtn from './SubmitBtn';
import { useEscClose } from '@/hooks/useEscClose';
import { Toastify } from '@/helper/Toastify';

interface DownloadImagesBtnProps {
  images: string[];
  filePrefix: string;
}

const DOWNLOAD_DELAY_MS = 500;

const DownloadImagesBtn: React.FC<DownloadImagesBtnProps> = ({ images, filePrefix }) => {
  const [completed, setCompleted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEscClose(isConfirmOpen, () => setIsConfirmOpen(false));

  const fetchAndDownload = async (url: string, filename: string): Promise<void> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Lỗi tải hình ${filename}`);
    }

    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

  const handleDownload = async (): Promise<void> => {
    if (!images.length || isDownloading) return;

    setIsDownloading(true);
    setIsConfirmOpen(false);

    try {
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        const extension = imageUrl.split('.').pop()?.split('?')[0] ?? 'jpg';
        const filename = `Nguonnhagiare.vn_${filePrefix}_${i + 1}.${extension}`;

        await fetchAndDownload(imageUrl, filename);

        if (i < images.length - 1) {
          await delay(DOWNLOAD_DELAY_MS);
        }
      }

      setCompleted(true);
      setTimeout(() => setCompleted(false), 2500);
      Toastify('Đã tải xuống tất cả hình ảnh', 200);
    } catch (error) {
      console.error('Lỗi tải hình ảnh:', error);
      Toastify('Đã xảy ra lỗi trong quá trình tải hình ảnh', 400);
    } finally {
      setIsDownloading(false);
    }
  };

  const buttonIcon = completed ? <MdOutlineDownloadDone size={24} className="text-green-600" /> : <MdDownload size={24} className="text-blue-600" />;

  return (
    <>
      <div className="tooltip tooltip-top tooltip-primary flex w-full flex-col" data-tip={completed ? 'Tải xong' : 'Tải xuống hình ảnh'}>
        <button
          onClick={() => setIsConfirmOpen(true)}
          className="rounded-full border border-primary p-1 focus:outline-none xl:hover:scale-125"
          disabled={isDownloading || completed}
        >
          {isDownloading ? <span className="loading loading-spinner loading-sm rounded-full"></span> : buttonIcon}
        </button>
      </div>

      {/* Modal xác nhận */}
      <input type="checkbox" checked={isConfirmOpen} onChange={() => setIsConfirmOpen(false)} className="modal-toggle" />

      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box relative">
          {/* ESC hint */}
          <div className="absolute right-2 top-2 flex items-center gap-2 text-xs text-base-content/60">
            <span>Thoát</span>
            <kbd className="kbd kbd-xs">ESC</kbd>
          </div>

          <h3 className="text-lg font-semibold">Xác nhận tải nhiều hình ảnh</h3>

          <p className="mt-3 text-sm leading-relaxed">
            Hệ thống sẽ tải lần lượt <strong>{images.length}</strong> hình ảnh. Trình duyệt có thể hiển thị hộp thoại yêu cầu cho phép tải nhiều tệp.
            Vui lòng chọn <strong>Cho phép</strong> để quá trình tải diễn ra đầy đủ.
          </p>

          <div className="modal-action">
            <CancelBtn size="sm" value="Hủy" onClick={() => setIsConfirmOpen(false)} />
            <SubmitBtn size="sm" value="Xác nhận tải" onClick={handleDownload} disabled={isDownloading} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DownloadImagesBtn;
