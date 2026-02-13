'use client';
import { Button } from 'react-daisyui';
import { motion } from 'framer-motion';

const FormInputStyle =
  'w-full rounded-none border-b border-neutral-200 bg-transparent py-4 text-sm ' +
  'outline-none transition-all duration-300 ' +
  'focus:border-neutral-900 focus:ring-0 ' +
  'placeholder:text-neutral-300 placeholder:font-light';

interface LabelProps {
  title: string;
  required?: boolean;
}

const FormLabel = ({ title, required }: LabelProps) => (
  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
    {title} {required && <span className="ml-1 text-red-500">*</span>}
  </label>
);
export default function HomeSearchConsultationPage() {
  return (
    <div className="px-2 pt-mobile-padding-top xl:px-desktop-padding xl:pt-desktop-padding-top">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-16 xl:grid-cols-2">
          {/* Section: Content */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center">
            <span className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-neutral-400">Personal Assistant</span>
            <h1 className="mb-6 text-4xl font-light tracking-tighter text-neutral-900 xl:text-6xl">
              Tìm kiếm không gian <br /> <span className="italic text-neutral-400">sống lý tưởng</span>
            </h1>
            <p className="max-w-md font-light leading-relaxed text-neutral-500">
              Để lại thông tin nhu cầu của bạn, đội ngũ chuyên viên của chúng tôi sẽ lọc danh sách những bất động sản phù hợp nhất và gửi đến bạn
              trong vòng 24h.
            </p>
          </motion.div>

          {/* Section: Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-50 p-8 xl:p-12">
            <form className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <FormLabel title="Họ và tên" required />
                  <input type="text" placeholder="Nguyễn Văn A" className={FormInputStyle} />
                </div>
                <div>
                  <FormLabel title="Số điện thoại" required />
                  <input type="tel" placeholder="0909 xxx xxx" className={FormInputStyle} />
                </div>
              </div>

              <div>
                <FormLabel title="Khu vực quan tâm" />
                <select className={FormInputStyle}>
                  <option value="">Chọn Quận/Huyện</option>
                  <option value="q1">Quận 1, TP. HCM</option>
                  <option value="q2">Quận 2, TP. HCM</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <FormLabel title="Ngân sách dự kiến" />
                  <select className={FormInputStyle}>
                    <option value="">Chọn khoảng giá</option>
                    <option value="1-3">1 - 3 Tỷ</option>
                    <option value="3-5">3 - 5 Tỷ</option>
                    <option value="5+">Trên 5 Tỷ</option>
                  </select>
                </div>
                <div>
                  <FormLabel title="Loại hình" />
                  <select className={FormInputStyle}>
                    <option value="apartment">Căn hộ</option>
                    <option value="house">Nhà phố</option>
                    <option value="villa">Biệt thự</option>
                  </select>
                </div>
              </div>

              <div>
                <FormLabel title="Yêu cầu chi tiết" />
                <textarea rows={3} placeholder="Ví dụ: Căn hộ tầng cao, hướng Đông Nam..." className={FormInputStyle} />
              </div>

              <Button className="w-full rounded-none border-none bg-neutral-900 font-bold uppercase tracking-widest text-white hover:bg-neutral-800">
                Gửi yêu cầu tư vấn
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
