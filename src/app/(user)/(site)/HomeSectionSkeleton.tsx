// Skeleton riêng cho từng section danh sách homepage.
// Giữ đúng kích thước layout (không CLS), chỉ animate opacity nhẹ.
const CardSkeleton = () => (
  <div className="flex min-h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
    <div className="aspect-[1.22/1] w-full animate-pulse bg-zinc-100 xl:aspect-[4/3] 2xl:aspect-[1.18/1]" />
    <div className="flex flex-1 flex-col gap-2.5 p-2.5 xl:p-3">
      <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
      <div className="h-8 w-full animate-pulse rounded bg-zinc-50" />
      <div className="grid grid-cols-2 gap-1.5">
        <div className="h-10 animate-pulse rounded-md bg-zinc-50" />
        <div className="h-10 animate-pulse rounded-md bg-zinc-50" />
        <div className="h-10 animate-pulse rounded-md bg-zinc-50" />
        <div className="h-10 animate-pulse rounded-md bg-zinc-50" />
      </div>
    </div>
  </div>
);

export default function HomeSectionSkeleton() {
  return (
    <section className="mb-10 xl:mb-14">
      <div className="mb-3 flex items-end justify-between rounded-lg border border-zinc-200 bg-white px-3 py-3 shadow-sm xl:mb-4">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-100" />
          <div className="h-7 w-48 animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-md bg-zinc-100" />
      </div>

      <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-3 xl:gap-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
