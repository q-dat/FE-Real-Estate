'use client';

import {
    type ChangeEvent,
    type FocusEvent,
    type FormEvent,
    type KeyboardEvent,
    useEffect,
    useState,
    useTransition,
} from 'react';
import Link from 'next/link';
import {
    usePathname,
    useRouter,
    useSearchParams,
} from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

import { RENTAL_LIMIT_OPTIONS } from '@/constants/rentalPagination';
import type {
    RentalPaginationMeta,
} from '@/types/rentalAdmin/rentalPagination.types';

export type QueryPaginationProps =
    RentalPaginationMeta & {
        visibleCount: number;
    };

const navigationClassName = `
  inline-flex h-10 min-w-10 shrink-0
  items-center justify-center gap-1
  rounded-xl border border-base-300
  bg-base-100 px-2
  text-xs font-extrabold text-base-content/70
  shadow-sm transition duration-200
  hover:-translate-y-0.5
  hover:border-primary/40
  hover:bg-primary/5
  hover:text-primary
  active:translate-y-0
  xl:px-3
`;

const disabledNavigationClassName = `
  inline-flex h-10 min-w-10 shrink-0
  cursor-not-allowed
  items-center justify-center gap-1
  rounded-xl border border-base-300/70
  bg-base-200/50 px-2
  text-xs font-extrabold text-base-content/30
  xl:px-3
`;

export default function QueryPagination({
    page,
    limit,
    total,
    totalPages,
    visibleCount,
    hasNextPage,
    hasPrevPage,
}: QueryPaginationProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isInputOpen, setIsInputOpen] =
        useState(false);

    const [inputValue, setInputValue] =
        useState(String(page));

    const [isPending, startTransition] =
        useTransition();

    const normalizedTotalPages = Math.max(
        totalPages,
        1,
    );

    const normalizedPage = Math.min(
        Math.max(page, 1),
        normalizedTotalPages,
    );

    const firstVisibleItem =
        visibleCount > 0
            ? (normalizedPage - 1) * limit + 1
            : 0;

    const lastVisibleItem =
        visibleCount > 0
            ? Math.min(
                firstVisibleItem + visibleCount - 1,
                total,
            )
            : 0;

    useEffect(() => {
        setInputValue(String(normalizedPage));
        setIsInputOpen(false);
    }, [normalizedPage]);

    const buildHref = (
        nextPage: number,
        nextLimit = limit,
    ): string => {
        const params = new URLSearchParams(
            searchParams.toString(),
        );

        params.set('page', String(nextPage));
        params.set('limit', String(nextLimit));

        return `${pathname}?${params.toString()}`;
    };

    const closeInput = (): void => {
        setInputValue(String(normalizedPage));
        setIsInputOpen(false);
    };

    const handleInputChange = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        const numericValue =
            event.target.value.replace(/\D/g, '');

        setInputValue(numericValue);
    };

    const handleJump = (
        event?: FormEvent<HTMLFormElement>,
    ): void => {
        event?.preventDefault();

        const parsedValue = Number.parseInt(
            inputValue,
            10,
        );

        const targetPage = Number.isFinite(parsedValue)
            ? Math.min(
                Math.max(parsedValue, 1),
                normalizedTotalPages,
            )
            : normalizedPage;

        setInputValue(String(targetPage));
        setIsInputOpen(false);

        if (targetPage === normalizedPage) {
            return;
        }

        startTransition(() => {
            router.push(buildHref(targetPage));
        });
    };

    const handleKeyDown = (
        event: KeyboardEvent<HTMLInputElement>,
    ): void => {
        if (event.key !== 'Escape') {
            return;
        }

        event.preventDefault();
        closeInput();
    };

    const handleFormBlur = (
        event: FocusEvent<HTMLFormElement>,
    ): void => {
        const nextFocusedElement =
            event.relatedTarget;

        if (
            nextFocusedElement instanceof Node &&
            event.currentTarget.contains(
                nextFocusedElement,
            )
        ) {
            return;
        }

        closeInput();
    };

    return (
        <nav
            className="w-full p-2.5 xl:px-4 xl:py-3"
            aria-label="Phân trang danh sách bài đăng"
        >
            <div
                className="
          flex flex-col gap-2.5
          xl:flex-row xl:items-center
          xl:justify-between xl:gap-4
        "
            >
                <div className="flex min-w-0 items-center justify-between gap-3 xl:justify-start">
                    <div className="flex min-w-0 items-center gap-2">
                        <span
                            className="
                inline-flex h-8 shrink-0
                items-center rounded-full
                bg-primary/10 px-3
                text-xs font-extrabold
                tabular-nums text-primary
              "
                        >
                            Trang {normalizedPage}/
                            {normalizedTotalPages}
                        </span>

                        <span
                            className="
                truncate text-xs font-semibold
                text-base-content/55
              "
                        >
                            {visibleCount > 0
                                ? `${firstVisibleItem}–${lastVisibleItem} trên ${total} tin`
                                : `0 trên ${total} tin`}
                        </span>
                    </div>

                    <span
                        className="
              shrink-0 text-[10px] font-bold
              uppercase tracking-[0.12em]
              text-base-content/35
              xl:hidden
            "
                    >
                        Phân trang
                    </span>
                </div>

                <div
                    className="
            grid min-w-0
            grid-cols-[auto_minmax(0,1fr)_auto]
            items-center gap-2
            xl:flex xl:justify-end
          "
                >
                    {hasPrevPage && normalizedPage > 1 ? (
                        <Link
                            href={buildHref(normalizedPage - 1)}
                            prefetch={false}
                            className={navigationClassName}
                            aria-label={`Đi đến trang ${normalizedPage - 1
                                }`}
                        >
                            <ChevronLeft
                                size={16}
                                strokeWidth={2.5}
                                aria-hidden="true"
                            />

                            <span className="hidden xl:inline">
                                Trước
                            </span>
                        </Link>
                    ) : (
                        <span
                            className={
                                disabledNavigationClassName
                            }
                            aria-disabled="true"
                        >
                            <ChevronLeft
                                size={16}
                                strokeWidth={2.5}
                                aria-hidden="true"
                            />

                            <span className="hidden xl:inline">
                                Trước
                            </span>
                        </span>
                    )}

                    {isInputOpen ? (
                        <form
                            onSubmit={handleJump}
                            onBlur={handleFormBlur}
                            className="
                flex h-10 min-w-0
                items-center overflow-hidden
                rounded-xl
                border border-primary/35
                bg-primary/5 shadow-inner
                transition duration-200
                focus-within:border-primary/60
                focus-within:bg-primary/[0.07]
                xl:w-auto
              "
                        >
                            <span
                                className="
                  shrink-0 pl-3
                  text-[10px] font-extrabold
                  uppercase tracking-[0.1em]
                  text-primary/70
                "
                            >
                                Trang
                            </span>

                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onFocus={(event) => {
                                    event.currentTarget.select();
                                }}
                                autoFocus
                                autoComplete="off"
                                aria-label="Nhập số trang cần chuyển đến"
                                className="
                  h-full min-w-0 flex-1
                  bg-transparent px-2
                  text-center text-sm
                  font-black tabular-nums
                  text-base-content
                  caret-primary outline-none
                  xl:w-14 xl:flex-none
                "
                            />

                            <span
                                className="
                  shrink-0 pr-2
                  text-xs font-bold
                  tabular-nums
                  text-base-content/40
                "
                            >
                                /{normalizedTotalPages}
                            </span>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="
                  h-full shrink-0
                  border-l border-primary/20
                  bg-primary px-3
                  text-xs font-black
                  text-primary-content
                  transition duration-200
                  hover:bg-primary/90
                  disabled:cursor-wait
                  disabled:opacity-60
                "
                            >
                                {isPending ? 'Đang đi' : 'Đi'}
                            </button>
                        </form>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setInputValue(
                                    String(normalizedPage),
                                );
                                setIsInputOpen(true);
                            }}
                            title="Nhấn để nhập số trang"
                            className="
                inline-flex h-10 min-w-0
                items-center justify-center
                gap-1.5 rounded-xl
                border border-base-300
                bg-base-200/60 px-3
                text-sm font-black
                tabular-nums
                text-base-content/75
                shadow-sm
                transition duration-200
                hover:border-primary/35
                hover:bg-primary/5
                hover:text-primary
                active:scale-[0.98]
                xl:min-w-24
              "
                        >
                            <span>{normalizedPage}</span>

                            <span className="text-base-content/25">
                                /
                            </span>

                            <span>
                                {normalizedTotalPages}
                            </span>
                        </button>
                    )}

                    {hasNextPage &&
                        normalizedPage < normalizedTotalPages ? (
                        <Link
                            href={buildHref(normalizedPage + 1)}
                            prefetch={false}
                            className={navigationClassName}
                            aria-label={`Đi đến trang ${normalizedPage + 1
                                }`}
                        >
                            <span className="hidden xl:inline">
                                Sau
                            </span>

                            <ChevronRight
                                size={16}
                                strokeWidth={2.5}
                                aria-hidden="true"
                            />
                        </Link>
                    ) : (
                        <span
                            className={
                                disabledNavigationClassName
                            }
                            aria-disabled="true"
                        >
                            <span className="hidden xl:inline">
                                Sau
                            </span>

                            <ChevronRight
                                size={16}
                                strokeWidth={2.5}
                                aria-hidden="true"
                            />
                        </span>
                    )}

                    <div
                        className="
              col-span-3 flex min-w-0
              items-center gap-2
              border-t border-base-300/60
              pt-2
              xl:col-auto xl:border-t-0
              xl:pt-0
            "
                    >
                        <span
                            className="
                shrink-0 text-[11px]
                font-bold
                text-base-content/45
              "
                        >
                            Mỗi trang
                        </span>

                        <div
                            className="
                flex h-10 min-w-0 flex-1
                items-center gap-1
                overflow-x-auto
                rounded-xl
                bg-base-200/70 p-1
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
                xl:flex-none
              "
                        >
                            {RENTAL_LIMIT_OPTIONS.map(
                                (limitValue) => {
                                    const isActive =
                                        limitValue === limit;

                                    if (isActive) {
                                        return (
                                            <span
                                                key={limitValue}
                                                aria-current="true"
                                                className="
                          inline-flex h-8
                          min-w-10 shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-primary px-2
                          text-xs font-black
                          tabular-nums
                          text-primary-content
                          shadow-sm
                        "
                                            >
                                                {limitValue}
                                            </span>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={limitValue}
                                            href={buildHref(
                                                1,
                                                limitValue,
                                            )}
                                            prefetch={false}
                                            aria-label={`Hiển thị ${limitValue} tin mỗi trang`}
                                            className="
                        inline-flex h-8
                        min-w-10 shrink-0
                        items-center
                        justify-center
                        rounded-lg px-2
                        text-xs font-extrabold
                        tabular-nums
                        text-base-content/55
                        transition duration-200
                        hover:bg-base-100
                        hover:text-primary
                      "
                                        >
                                            {limitValue}
                                        </Link>
                                    );
                                },
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}