'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QueryPaginationProps {
    page: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    visibleCount: number;
}

const LIMIT_OPTIONS = [12, 20, 40, 60, 100];

export default function QueryPagination({ page, limit, hasNextPage, hasPrevPage, visibleCount }: QueryPaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const buildHref = (nextPage: number, nextLimit = limit) => {
        const params = new URLSearchParams(searchParams.toString());

        params.set('page', String(nextPage));
        params.set('limit', String(nextLimit));

        return `${pathname}?${params.toString()}`;
    };

    return (
        <div className="w-full">
            <div className="flex flex-col gap-2 px-2 xl:px-desktop-padding border border-zinc-200 bg-white p-2 shadow-sm xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                    <span className="rounded-lg bg-zinc-100 px-3 py-2">Trang {page}</span>
                    <span className="rounded-lg bg-zinc-100 px-3 py-2">Hiển thị {visibleCount}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    {hasPrevPage ? (
                        <Link
                            href={buildHref(page - 1)}
                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-black text-zinc-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                        >
                            <ChevronLeft size={14} />
                            Trước
                        </Link>
                    ) : (
                        <span className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-black text-zinc-300">
                            <ChevronLeft size={14} />
                            Trước
                        </span>
                    )}

                    <span className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-black text-white">{page}</span>

                    {hasNextPage ? (
                        <Link
                            href={buildHref(page + 1)}
                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-black text-zinc-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                        >
                            Sau
                            <ChevronRight size={14} />
                        </Link>
                    ) : (
                        <span className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-black text-zinc-300">
                            Sau
                            <ChevronRight size={14} />
                        </span>
                    )}

                    <div className="flex h-9 overflow-hidden rounded-lg border border-zinc-200 bg-white">
                        {LIMIT_OPTIONS.map((limitValue) => {
                            const isActive = limitValue === limit;

                            return (
                                <Link
                                    key={limitValue}
                                    href={buildHref(1, limitValue)}
                                    className={`inline-flex items-center px-2 text-[11px] font-black transition ${isActive ? 'bg-primary text-white' : 'text-zinc-600 hover:bg-primary/5 hover:text-primary'
                                        }`}
                                >
                                    {limitValue}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}