'use client';
import { useCallback, useState } from 'react';
import { Badge } from 'react-daisyui';
import { PropertyGallery } from './PropertyGallery';

interface Props {
  adminNote?: string;
  adminImages?: string[];
}

const ADMIN_SECTION_ID = 'admin-internal-section';

export default function AdminPostInternalSection({ adminNote, adminImages }: Props) {
  const [open, setOpen] = useState(false);

  // Logic: Nếu không có data thì không render gì cả (Clean render)
  if (!adminNote && (!adminImages || adminImages.length === 0)) return null;
  const handleScrollToAdmin = useCallback(() => {
    const element = document.getElementById(ADMIN_SECTION_ID);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    // auto hide button
    setOpen(false);
  }, []);

  return (
    <>
      {/* COMPONENT 1: STEALTH TRIGGER 
        UI: Dạng thanh dọc ẩn bên trái, hiệu ứng trượt ra khi hover.
        UX: Không chiếm diện tích màn hình, tránh bấm nhầm trên mobile.
      */}
      {adminNote && adminImages && adminImages.length > 0 && (
        <button
          onClick={handleScrollToAdmin}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className={`group fixed left-0 top-1/2 z-50 flex h-24 -translate-y-1/2 cursor-pointer flex-row items-center rounded-r-lg border-y border-r border-neutral bg-neutral/90 text-neutral-content shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 ${open ? 'translate-x-0' : '-translate-x-[85%]'} `}
          aria-label="Scroll to Admin Section"
        >
          {/* Label hiển thị khi hover */}
          <div className="flex flex-1 items-center justify-center px-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="writing-vertical-lr text-xs font-bold tracking-widest text-primary">SYSTEM</span>
          </div>

          {/* Indicator luôn hiển thị (thanh dọc nhỏ) */}
          <div className="flex h-full w-2 flex-col justify-center gap-1 bg-primary/20 p-[2px]">
            {/* CSS-only decorative dots (thay vì icon) */}
            <div className="h-1 w-full animate-pulse rounded-full bg-primary" />
            <div className="h-1 w-full rounded-full bg-primary/50" />
            <div className="h-1 w-full rounded-full bg-primary/50" />
          </div>
        </button>
      )}
      {/* COMPONENT 2: THE "TERMINAL" SECTION
        UI: Phong cách bảo mật, font mono, viền kỹ thuật.
      */}
      <section
        id={ADMIN_SECTION_ID}
        className="mt-12 overflow-hidden rounded-md border-y border-l-4 border-r border-base-300 border-l-primary bg-base-200/50 p-2 shadow-inner"
      >
        {/* Header Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-base-content/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-ping rounded-full bg-error" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-base-content/70">Internal Data Log</h3>
          </div>
          <Badge variant="outline" className="border-primary font-mono text-xs font-bold text-primary">
            RESTRICTED ACCESS
          </Badge>
        </div>

        {/* Content Area - Grid Layout */}
        <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
          {/* Col 1: Note (Hiển thị dạng code block) */}
          {adminNote && (
            <div className="group relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/20 to-transparent opacity-0 blur transition duration-300 group-hover:opacity-100" />
              <div className="relative h-full rounded bg-base-300 p-3 font-mono text-xs leading-relaxed text-base-content/80 shadow-sm">
                {/* Decorative header fake terminal */}
                <div className="mb-2 flex gap-1 opacity-50">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
                <pre className="whitespace-pre-wrap break-words font-sans">{adminNote}</pre>
              </div>
            </div>
          )}

          {/* Col 2: Images (Hiển thị dạng Evidence Grid) */}
          {adminImages && adminImages.length > 0 && (
            <PropertyGallery images={adminImages} />
            // <div className={`grid grid-cols-3 gap-2 ${!adminNote ? 'xl:col-span-2' : ''}`}>
            //   {adminImages.map((src, i) => (
            //     <div
            //       key={i}
            //       className="relative aspect-square overflow-hidden rounded border border-base-content/5 bg-base-100 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_10px_rgba(255,184,107,0.2)]"
            //     >
            //       <Zoom>
            //         <Image
            //           src={src}
            //           alt={`Evidence-${i}`}
            //           fill
            //           className="object-cover grayscale transition-all duration-500 hover:scale-110 hover:grayscale-0"
            //           sizes="(max-width: 768px) 33vw, 20vw"
            //         />
            //       </Zoom>
            //       {/* Overlay index number - Tech feel */}
            //       <div className="pointer-events-none absolute bottom-0 right-0 bg-base-300/80 px-1 font-mono text-[10px] text-base-content backdrop-blur">
            //         {String(i + 1).padStart(2, '0')}
            //       </div>
            //     </div>
            //   ))}
            // </div>
          )}
        </div>
      </section>
    </>
  );
}
