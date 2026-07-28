// Loading fallback cấp route cho homepage.
// Shell thật (Header/Banner/category/footer) nằm ở layout/page,
// fallback này chỉ hiển thị khi toàn bộ route chưa sẵn sàng.
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-zinc-100 pt-mobile-padding-top xl:pt-desktop-padding-top">
      <div className="mx-auto max-w-[1700px] px-2 pt-3 xl:px-desktop-padding 2xl:px-8">
        <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-md bg-zinc-100" />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1700px] px-2 py-8 xl:px-desktop-padding xl:py-12 2xl:px-8">
        <div className="mb-10 h-80 animate-pulse rounded-lg bg-zinc-100 xl:mb-14" />
        <div className="mb-10 h-80 animate-pulse rounded-lg bg-zinc-100 xl:mb-14" />
      </div>
    </div>
  );
}
