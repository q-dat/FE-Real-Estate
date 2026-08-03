'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaImages, FaPlus } from 'react-icons/fa';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiEdit3,
  FiFilm,
  FiGrid,
  FiHome,
  FiLock,
  FiMapPin,
  FiTrash2,
  FiUploadCloud,
} from 'react-icons/fi';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { IRentalAuthor, IRentalPostAdmin } from '@/types/rentalAdmin/rentalAdmin.types';
import RentalPostAdminModal from './modal/RentalPostAdmin.modal';
import type { RentalPaginationMeta } from '@/types/rentalAdmin/rentalPagination.types';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { formatCurrency } from '@/utils/formatCurrency.utils';
import DeleteModal from '../../../../../components/adminPage/modal/Delete.modal';
import AdminInternalModal from './modal/AdminInternal.modal';
import { useAdminAuth } from '@/context/AdminAuthContext';
import ImportRentalPostModal from './modal/ImportRentalPost.modal';
import ContentGeneratorModal from './modal/ContentGenerator';
import TimeAgo from '@/components/orther/timeAgo/TimeAgo';

interface Props {
  posts: IRentalPostAdmin[];
  categories: { _id: string; name: string }[];
  categoryCode?: number;
}

type PostStatusTone = {
  label: string;
  className: string;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const DEFAULT_PAGINATION: RentalPaginationMeta = {
  page: DEFAULT_PAGE,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const getPostStatusTone = (status?: string): PostStatusTone => {
  if (status === 'active') {
    return {
      label: 'Đang hiển thị',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
  }

  if (status === 'pending') {
    return {
      label: 'Chờ duyệt',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  if (status === 'hidden') {
    return {
      label: 'Đã ẩn',
      className: 'border-neutral-200 bg-neutral-100 text-neutral-600',
    };
  }

  return {
    label: status || 'Không rõ',
    className: 'border-red-200 bg-red-50 text-red-700',
  };
};

const getPostTypeTone = (postType?: string): string => {
  if (postType === 'highlight') return 'border-primary/15 bg-primary/5 text-primary';
  if (postType?.startsWith('vip')) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-neutral-200 bg-neutral-50 text-neutral-600';
};

const getThumbnail = (post: IRentalPostAdmin): string => {
  return post.images?.[0] || '/no-image.png';
};

const getAreaText = (post: IRentalPostAdmin): string => {
  if (!post.area) return 'Chưa cập nhật';

  if (post.frontageWidth && post.lotDepth) {
    return `${post.area} m² · ${post.frontageWidth} x ${post.lotDepth}`;
  }

  return `${post.area} m²`;
};

const getLocationText = (post: IRentalPostAdmin): string => {
  const parts = [post.ward, post.district, post.province].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Chưa cập nhật vị trí';
};

const getDisplayDate = (date?: string | Date): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();

  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
};

const getSafeNumberParam = (value: string | null, fallback: number): number => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

export default function ClientRentalPostAdminPage({ posts: initialPosts, categories, categoryCode }: Props) {
  const { user } = useAdminAuth();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchTitle = searchParams.get('title') || undefined;
  const pageParam = getSafeNumberParam(searchParams.get('page'), DEFAULT_PAGE);
  const limitParam = getSafeNumberParam(searchParams.get('limit'), DEFAULT_LIMIT);

  const authorRef: IRentalAuthor = { _id: user.id };

  const [posts, setPosts] = useState<IRentalPostAdmin[]>(initialPosts);
  const [pagination, setPagination] = useState<RentalPaginationMeta>({
    ...DEFAULT_PAGINATION,
    page: pageParam,
    limit: limitParam,
    total: initialPosts.length,
    totalPages: initialPosts.length > 0 ? Math.ceil(initialPosts.length / limitParam) : 0,
    hasPrevPage: pageParam > 1,
    hasNextPage: initialPosts.length >= limitParam,
  });

  const [isLoading, setIsLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editingPost, setEditingPost] = useState<IRentalPostAdmin | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalPost, setInternalPost] = useState<IRentalPostAdmin | null>(null);

  const [openContentGenerator, setOpenContentGenerator] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  const activeCount = useMemo(() => {
    return posts.filter((post) => post.status === 'active').length;
  }, [posts]);

  const hiddenCount = useMemo(() => {
    return posts.filter((post) => post.status === 'hidden').length;
  }, [posts]);

  const pendingCount = useMemo(() => {
    return posts.filter((post) => post.status === 'pending').length;
  }, [posts]);

  const pageNumbers = useMemo(() => {
    const totalPages = pagination.totalPages || 1;
    const currentPage = pagination.page || 1;
    const pages: number[] = [];

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [pagination.page, pagination.totalPages]);

  const updatePaginationQuery = (nextPage: number, nextLimit = pagination.limit || limitParam) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('page', String(nextPage));
    params.set('limit', String(nextLimit));

    router.push(`${pathname}?${params.toString()}`);
  };

  const reload = async () => {
    try {
      setIsLoading(true);

      const data = await rentalPostAdminService.getMyPosts({
        categoryCode,
        title: searchTitle,
        page: pageParam,
        limit: limitParam,
      });

      setPosts(data.rentalPosts);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Lỗi tải danh sách bài đăng:', error);
      setPosts([]);
      setPagination({
        ...DEFAULT_PAGINATION,
        page: pageParam,
        limit: limitParam,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [categoryCode, searchTitle, pageParam, limitParam]);

  const handleSendContentJsonToImport = (jsonText: string) => {
    setImportJsonText(jsonText);
    setOpenContentGenerator(false);
    setImportOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      await rentalPostAdminService.delete(deletingId);
      await reload();
    } catch (error) {
      console.error('Lỗi xóa bài đăng:', error);
    } finally {
      setConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setOpenModal(true);
  };

  const openEditModal = (post: IRentalPostAdmin) => {
    setEditingPost(post);
    setOpenModal(true);
  };

  const closeAllModals = () => {
    setOpenModal(false);
    setEditingPost(null);
    setConfirmOpen(false);
    setDeletingId(null);
    setInternalOpen(false);
    setInternalPost(null);
    setOpenContentGenerator(false);
    setImportOpen(false);
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (key === 'escape') {
        closeAllModals();
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;

      if (key === 'i') {
        event.preventDefault();
        setImportOpen(true);
        return;
      }

      if (key === 'm') {
        event.preventDefault();
        setOpenContentGenerator(true);
        return;
      }

      if (key === 't') {
        event.preventDefault();
        openCreateModal();
      }
    };

    window.addEventListener('keydown', handleShortcut);

    return () => {
      window.removeEventListener('keydown', handleShortcut);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-neutral-100">
      <div className="border-b border-neutral-200 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="px-2 py-2 xl:px-4">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/5 text-primary">
                  <FiHome size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Portfolio Admin</p>

                  <h1 className="truncate text-lg font-black tracking-tight text-neutral-950 xl:text-2xl">Quản lý bất động sản</h1>
                </div>

                <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-black text-neutral-700">
                  {pagination.total}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 xl:flex xl:items-center xl:gap-2">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-neutral-400">Active</p>
                <p className="text-sm font-black text-emerald-700">{activeCount}</p>
              </div>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-neutral-400">Pending</p>
                <p className="text-sm font-black text-amber-700">{pendingCount}</p>
              </div>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-neutral-400">Hidden</p>
                <p className="text-sm font-black text-neutral-700">{hiddenCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 xl:flex xl:items-center xl:gap-2">
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary xl:px-3"
                title="Import JSON - phím I"
              >
                <FiUploadCloud size={14} />
                IMPORT / I
              </button>

              <button
                type="button"
                onClick={() => setOpenContentGenerator(true)}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary xl:px-3"
                title="Media - phím M"
              >
                <FiFilm size={14} />
                MEDIA / M
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary px-2 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-primary/90 xl:px-4"
                title="Thêm mới - phím T"
              >
                <FaPlus size={12} />
                THÊM / T
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="px-2 py-2">
        <div className="mb-3 rounded-xl border border-neutral-200 bg-white p-2 shadow-sm">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid grid-cols-3 gap-1.5 xl:flex xl:items-center xl:gap-2">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-neutral-400">Tổng bài</p>
                <p className="text-sm font-black text-neutral-950">{pagination.total}</p>
              </div>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-neutral-400">Trang hiện tại</p>
                <p className="text-sm font-black text-primary">
                  {pagination.page}/{pagination.totalPages || 1}
                </p>
              </div>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-neutral-400">Đang hiển thị</p>
                <p className="text-sm font-black text-neutral-950">{posts.length}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={!pagination.hasPrevPage || isLoading}
                onClick={() => updatePaginationQuery(1)}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-black text-neutral-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 xl:px-3"
              >
                <FiChevronsLeft size={14} />
                Đầu
              </button>

              <button
                type="button"
                disabled={!pagination.hasPrevPage || isLoading}
                onClick={() => updatePaginationQuery(Math.max(1, pagination.page - 1))}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-black text-neutral-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 xl:px-3"
              >
                <FiChevronLeft size={14} />
                Trước
              </button>

              <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
                {pageNumbers[0] && pageNumbers[0] > 1 ? (
                  <span className="px-2 text-xs font-black text-neutral-400">...</span>
                ) : null}

                {pageNumbers.map((pageNumber) => {
                  const isActive = pageNumber === pagination.page;

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      disabled={isLoading}
                      onClick={() => updatePaginationQuery(pageNumber)}
                      className={`h-8 min-w-8 rounded-md px-2 text-xs font-black transition ${isActive ? 'bg-primary text-white shadow-sm' : 'bg-white text-neutral-700 hover:bg-primary/5 hover:text-primary'
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {pageNumbers[pageNumbers.length - 1] && pageNumbers[pageNumbers.length - 1] < pagination.totalPages ? (
                  <span className="px-2 text-xs font-black text-neutral-400">...</span>
                ) : null}
              </div>

              <button
                type="button"
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => updatePaginationQuery(pagination.page + 1)}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-black text-neutral-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 xl:px-3"
              >
                Sau
                <FiChevronRight size={14} />
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage || isLoading}
                onClick={() => updatePaginationQuery(pagination.totalPages || 1)}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-black text-neutral-700 transition hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 xl:px-3"
              >
                Cuối
                <FiChevronsRight size={14} />
              </button>

              <select
                value={pagination.limit}
                disabled={isLoading}
                onChange={(event) => updatePaginationQuery(1, Number(event.target.value))}
                className="h-9 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-bold text-neutral-700 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <option value={12}>12 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={40}>40 / trang</option>
                <option value={60}>60 / trang</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[40dvh] items-center justify-center">
            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-black text-neutral-700 shadow-sm">
              Đang tải dữ liệu...
            </div>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-4 xl:gap-3 2xl:grid-cols-5">
            {posts.map((post) => {
              const thumbnail = getThumbnail(post);
              const statusTone = getPostStatusTone(post.status);
              const postTypeClassName = getPostTypeTone(post.postType);
              const imagesCount = post.images?.length || 0;

              return (
                <article
                  key={post._id}
                  className="group overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:border-primary/20 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => openEditModal(post)}
                    className="relative block aspect-[4/3] w-full overflow-hidden bg-neutral-100 text-left"
                  >
                    <Image
                      src={thumbnail}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, 100vw"
                      unoptimized
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    <div className="absolute left-2 top-2 flex max-w-[calc(100%-4rem)] flex-wrap gap-1">
                      {post.postType ? (
                        <span className={`rounded-md border px-1.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${postTypeClassName}`}>
                          {post.postType}
                        </span>
                      ) : null}

                      {post.status ? (
                        <span className={`rounded-md border px-1.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${statusTone.className}`}>
                          {statusTone.label}
                        </span>
                      ) : null}
                    </div>

                    {imagesCount > 0 ? (
                      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-1 text-white backdrop-blur-sm">
                        <FaImages size={10} />
                        <span className="text-[10px] font-black">{imagesCount}</span>
                      </div>
                    ) : null}

                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <p className="mb-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/70">CODE: {post.code || 'N/A'}</p>

                          <div className="inline-flex max-w-full rounded-md bg-white px-2 py-1 shadow-sm">
                            <span className="truncate text-sm font-black text-primary">
                              {formatCurrency(post.price)} {post.priceUnit}
                            </span>
                          </div>
                        </div>

                        <span className="rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold text-white ring-1 ring-white/20 backdrop-blur-sm">
                          {post.propertyType || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 backdrop-blur-[1px] transition group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-950 shadow-sm">
                        <FiEdit3 size={13} />
                        Chỉnh sửa
                      </span>
                    </div>
                  </button>

                  <div className="flex min-h-[260px] flex-col p-2">
                    <button type="button" onClick={() => openEditModal(post)} className="text-left">
                      <h2 className="text-[14px] font-black leading-snug text-neutral-950 transition hover:text-primary">
                        {post.title}
                      </h2>
                    </button>

                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      <div className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1.5">
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400">Diện tích</p>
                        <p className="truncate text-[11px] font-bold text-neutral-800">{getAreaText(post)}</p>
                      </div>

                      <div className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1.5">
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400">Loại vị trí</p>
                        <p className="truncate text-[11px] font-bold text-neutral-800">{post.locationType || 'Chưa cập nhật'}</p>
                      </div>
                    </div>

                    <div className="mt-2 rounded-md border border-neutral-200 bg-white px-2 py-1.5">
                      <p className="mb-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400">
                        <FiMapPin size={11} />
                        Vị trí
                      </p>
                      <p className="line-clamp-2 text-[11px] font-medium leading-relaxed text-neutral-600">{getLocationText(post)}</p>
                    </div>

                    {post.address ? (
                      <div className="mt-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1.5">
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400">Địa chỉ</p>
                        <p className="truncate text-[11px] font-medium text-neutral-600">{post.address}</p>
                      </div>
                    ) : null}

                    <div className="mt-auto pt-2">
                      <div className="grid grid-cols-2 gap-1.5 border-t border-neutral-100 pt-2">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400">Cập nhật</p>
                          <p className="text-[11px] font-bold text-red-600">
                            <TimeAgo date={post.updatedAt} />
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400">Ngày tạo</p>
                          <p className="text-[11px] font-bold text-neutral-700">{getDisplayDate(post.createdAt)}</p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(post)}
                          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-primary bg-primary text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-primary/90"
                        >
                          <FiEdit3 size={13} />
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setInternalPost(post);
                            setInternalOpen(true);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
                          title="Tài liệu nội bộ"
                        >
                          <FiLock size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(post._id);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
                          title="Xóa tài sản"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[60dvh] items-center justify-center">
            <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/5 text-primary">
                <FiGrid size={22} />
              </div>

              <h2 className="text-base font-black text-neutral-950">Chưa có bài đăng</h2>

              <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
                Tạo bài đăng mới hoặc import dữ liệu JSON để bắt đầu quản lý danh sách bất động sản.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportOpen(true)}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  IMPORT / I
                </button>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="rounded-md border border-primary bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-primary/90"
                >
                  THÊM / T
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <AdminInternalModal open={internalOpen} onClose={() => setInternalOpen(false)} post={internalPost} reload={reload} />

      <RentalPostAdminModal
        key={editingPost?._id ?? 'create'}
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingPost(null);
        }}
        editingPost={editingPost}
        categories={categories}
        reload={reload}
        authorId={authorRef}
      />

      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />

      <ContentGeneratorModal
        open={openContentGenerator}
        onClose={() => setOpenContentGenerator(false)}
        onSendToImport={handleSendContentJsonToImport}
      />

      <ImportRentalPostModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        reload={reload}
        authorId={authorRef}
        initialJsonText={importJsonText}
      />
    </div>
  );
}