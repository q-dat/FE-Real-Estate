// Loading boundary cho trang chi tiết bất động sản.
// Giữ nguyên khung layout (không CLS), chỉ hiển thị skeleton nhẹ.
// Không dùng client JS, không animation nặng.

export default function RentalPostDetailLoading() {
  return (
    <main className="w-full bg-white px-2 pt-mobile-padding-top xl:pt-desktop-padding-top">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />

      <div className="mt-4 text-black xl:px-desktop-padding">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          <div className="flex flex-col gap-6 xl:col-span-8">
            {/* Tiêu đề */}
            <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" />

            {/* Gallery */}
            <div className="aspect-video w-full animate-pulse rounded-xl bg-slate-200" />

            {/* Thông tin chính */}
            <div className="space-y-3">
              <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="h-24 w-full animate-pulse rounded bg-slate-100" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            </div>
          </div>

          <aside className="xl:col-span-4">
            <div className="sticky top-24 flex flex-col gap-5">
              <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-xl bg-amber-100" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
