import QueryPagination, {
  type QueryPaginationProps,
} from './QueryPagination';

export default function FixedQueryPagination(
  props: QueryPaginationProps,
) {
  return (
    <>
      <div
        className="h-[10.5rem] xl:h-24"
        aria-hidden="true"
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
        <div
          className="
            mx-auto w-full max-w-[1600px]
            pl-[max(0.5rem,env(safe-area-inset-left))]
            pr-[max(0.5rem,env(safe-area-inset-right))]
            pb-[max(0.5rem,env(safe-area-inset-bottom))]
            xl:px-desktop-padding
            xl:pb-[max(0.75rem,env(safe-area-inset-bottom))]
          "
        >
          <div
            className="
              pointer-events-auto
              overflow-hidden rounded-2xl
              border border-base-300/80
              bg-base-100/95
              shadow-[0_-4px_30px_rgba(0,0,0,0.10)]
              backdrop-blur-xl
              supports-[backdrop-filter]:bg-base-100/85
            "
          >
            <QueryPagination {...props} />
          </div>
        </div>
      </div>
    </>
  );
}