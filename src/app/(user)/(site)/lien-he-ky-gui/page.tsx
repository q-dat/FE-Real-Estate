'use client';
import { Button } from 'react-daisyui';
import { motion } from 'framer-motion';

const FormInputStyle = 
  "w-full rounded-none border-b border-neutral-200 bg-transparent py-4 text-sm " +
  "outline-none transition-all duration-300 " +
  "focus:border-neutral-900 focus:ring-0 " +
  "placeholder:text-neutral-300 placeholder:font-light";

interface LabelProps {
  title: string;
  required?: boolean;
}

const FormLabel = ({ title, required }: LabelProps) => (
  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
    {title} {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);
export default function PropertyConsignmentPage() {
  return (
    <div className="px-2 pt-mobile-padding-top xl:px-desktop-padding xl:pt-desktop-padding-top">
      <div className="mx-auto max-w-7xl">
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-light tracking-tighter text-neutral-900 xl:text-5xl">
              Ký gửi <span className="text-neutral-400 font-extralight italic">Bất động sản</span>
            </h1>
            <div className="mx-auto mt-4 h-px w-20 bg-neutral-900" />
          </motion.div>
        </header>

        <div className="mx-auto max-w-3xl bg-white pb-24">
          <form className="space-y-12">
            
            {/* Group 1: Thông tin chủ sở hữu */}
            <section>
              <h2 className="mb-8 text-lg font-medium tracking-tight border-l-4 border-neutral-900 pl-4">
                01. Thông tin liên hệ
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <FormLabel title="Họ và tên chủ sở hữu" required />
                  <input type="text" className={FormInputStyle} />
                </div>
                <div>
                  <FormLabel title="Số điện thoại / Zalo" required />
                  <input type="tel" className={FormInputStyle} />
                </div>
              </div>
            </section>

            {/* Group 2: Thông tin bất động sản */}
            <section>
              <h2 className="mb-8 text-lg font-medium tracking-tight border-l-4 border-neutral-900 pl-4">
                02. Chi tiết tài sản
              </h2>
              <div className="space-y-8">
                <div>
                  <FormLabel title="Địa chỉ chi tiết" required />
                  <input type="text" placeholder="Số nhà, tên đường, phường, tỉnh..." className={FormInputStyle} />
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  <div>
                    <FormLabel title="Loại tài sản" />
                    <select className={FormInputStyle}>
                      <option>Đất nền</option>
                      <option>Nhà phố</option>
                      <option>Căn hộ</option>
                    </select>
                  </div>
                  <div>
                    <FormLabel title="Diện tích (m2)" />
                    <input type="text" className={FormInputStyle} />
                  </div>
                  <div>
                    <FormLabel title="Giá mong muốn (VNĐ)" />
                    <input type="text" className={FormInputStyle} />
                  </div>
                </div>
              </div>
            </section>

            {/* Group 3: Hình ảnh & Ghi chú */}
            <section>
              <h2 className="mb-8 text-lg font-medium tracking-tight border-l-4 border-neutral-900 pl-4">
                03. Hình ảnh & Pháp lý
              </h2>
              <div className="rounded-none border-2 border-dashed border-neutral-200 p-10 text-center">
                <p className="text-sm text-neutral-400">Kéo thả hình ảnh hoặc hồ sơ pháp lý vào đây</p>
                <button type="button" className="mt-4 text-xs font-bold uppercase tracking-widest text-primary underline">
                  Chọn tệp tin
                </button>
              </div>
            </section>

            <div className="pt-8">
              <Button className="h-16 w-full rounded-none border-none bg-neutral-900 text-sm font-bold uppercase tracking-[0.3em] text-white transition-all hover:bg-neutral-800">
                Xác nhận ký gửi tài sản
              </Button>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-neutral-400">
                Bằng cách nhấn xác nhận, bạn đồng ý với các Điều khoản bảo mật và <br /> 
                quy trình thẩm định tài sản của chúng tôi.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}