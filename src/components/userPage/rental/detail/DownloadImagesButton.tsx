import React, { useState } from 'react';
import { MdDownload, MdOutlineDownloadDone } from 'react-icons/md';
// import { BsInfoCircle } from 'react-icons/bs';

interface DownloadImagesButtonProps {
  images: string[];
  filePrefix: string;
}

// Độ trễ tối ưu cho việc kích hoạt tải xuống từng cái một
const DOWNLOAD_DELAY_MS = 500;

const DownloadImagesButton: React.FC<DownloadImagesButtonProps> = ({ images, filePrefix }) => {
  const [completed, setCompleted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  //   const [showPromptInfo, setShowPromptInfo] = useState(false); // Trạng thái hiển thị thông báo hướng dẫn

  /**
   * Tải về và kích hoạt click cho tệp duy nhất.
   */
  const fetchAndDownload = async (url: string, filename: string): Promise<void> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Lỗi tải hình ${filename}: ${response.statusText}`);
    }
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Giải phóng Blob URL
    URL.revokeObjectURL(link.href);
  };

  /**
   * Hàm chờ (Delay utility)
   */
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleDownload = async (): Promise<void> => {
    if (!images || images.length === 0 || isDownloading) return;

    setIsDownloading(true);
    // setShowPromptInfo(true); // Bắt đầu hiển thị hướng dẫn

    // Gửi thông báo tùy chỉnh bằng Tiếng Việt trước khi bắt đầu
    // console.log('Thông báo hướng dẫn đã được kích hoạt.');

    try {
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        const fileExtension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
        const filename = `Nguonnhagiare.vn_${filePrefix}_${i + 1}.${fileExtension}`;

        await fetchAndDownload(imageUrl, filename);

        // **QUAN TRỌNG:** Thêm độ trễ để giảm khả năng trình duyệt hiển thị hộp thoại xác nhận
        if (i < images.length - 1) {
          await delay(DOWNLOAD_DELAY_MS);
        }
      }

      setCompleted(true);
      setTimeout(() => setCompleted(false), 2500);
    } catch (error) {
      console.error('Lỗi trong quá trình tải hình ảnh:', error);
      // Có thể dùng thư viện toast (ví dụ: react-hot-toast) để hiển thị thông báo lỗi chuyên nghiệp ở đây
      // Ví dụ: toast.error("Đã xảy ra lỗi khi tải hình. Vui lòng kiểm tra kết nối.");
    } finally {
      setIsDownloading(false);
      // Tắt thông báo hướng dẫn sau khi kết thúc
      //   setTimeout(() => setShowPromptInfo(false), 1000);
    }
  };

  // Logic hiển thị nội dung nút
  const buttonText = completed ? 'Đã tải xong' : isDownloading ? 'Đang tải...' : 'Tải hình ảnh';
  const buttonIcon = completed ? <MdOutlineDownloadDone size={24} className="text-green-600" /> : <MdDownload size={24} className="text-blue-600" />;

  return (
    <div className="flex w-full flex-col gap-2 rounded-full border border-primary xl:hover:scale-125">
      {/* Nút Tải xuống */}
      <button onClick={handleDownload} className="p-1" disabled={isDownloading || completed}>
        {isDownloading && <span className="loading loading-spinner loading-sm rounded-full"></span>}
        {!isDownloading && buttonIcon}
        {/* <span>{buttonText}</span> */}
      </button>

      {/* Thông báo Hướng dẫn Tiếng Việt (Custom Prompt) */}
      {/* {showPromptInfo && (
        <div
          className="alert alert-info flex items-center gap-2 rounded-xl shadow-md transition-all duration-300"
          // Hiển thị thông báo này thay vì chờ thông báo của Chrome
        >
          <BsInfoCircle size={24} className="flex-shrink-0" />
          <span className="text-sm font-medium">
            **Quan trọng:** Trình duyệt có thể hỏi xác nhận để tải nhiều tệp. **Vui lòng chấp nhận** để quá trình tải diễn ra đầy đủ.
          </span>
        </div>
      )} */}
    </div>
  );
};

export default DownloadImagesButton;
