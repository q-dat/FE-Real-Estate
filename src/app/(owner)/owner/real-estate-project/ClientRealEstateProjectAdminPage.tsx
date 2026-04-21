'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit3, FiTrash2, FiBriefcase, FiMapPin } from 'react-icons/fi';
import DeleteModal from '../../../../components/adminPage/modal/Delete.modal';
import { IRealEstateProject } from '@/types/realEstateProject/realEstateProject.types';
import { realEstateProjectService } from '@/services/real-estate-project/realEstateProject.service';
import RealEstateProjectModal from './modal/RealEstateProject.modal';

interface Props {
  projects: IRealEstateProject[];
}

export default function ClientRealEstateProjectAdminPage({ projects: initial }: Props) {
  const [projects, setProjects] = useState<IRealEstateProject[]>(initial);
  const [editingItem, setEditingItem] = useState<IRealEstateProject | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = async () => {
    const data = await realEstateProjectService.getAll();
    setProjects(Array.isArray(data) ? data : []);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await realEstateProjectService.delete(deletingId);
    await reload();
    setConfirmOpen(false);
    setDeletingId(null);
  };

  // Framer Motion variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen w-full bg-[#FCFCFC]">
      {/* HEADER: Minimalist Editorial */}
      <div className="sticky top-0 z-20 flex flex-col gap-4 border-b border-neutral-200/60 bg-[#FCFCFC]/80 px-4 pb-5 pt-6 backdrop-blur-xl sm:px-6 md:flex-row md:items-end md:justify-between xl:px-8">
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">Real Estate Development</span>
          <h1 className="text-2xl font-light tracking-tight text-neutral-900 xl:text-3xl">
            Quản lý Dự án
            <span className="ml-3 inline-flex items-center justify-center rounded-full bg-neutral-100 px-2.5 py-0.5 align-middle text-xs font-medium text-neutral-500">
              {projects.length}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingItem(null);
              setOpenModal(true);
            }}
            className="group flex h-10 items-center gap-2 rounded-none bg-neutral-900 px-6 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-neutral-900/10 transition-all hover:bg-primary hover:shadow-primary/20"
          >
            <FiPlus size={14} className="transition-transform group-hover:rotate-90" />
            Thêm dự án
          </button>
        </div>
      </div>

      {/* BODY: Typographic Grid Layout */}
      <div className="p-4 sm:p-6 xl:p-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          {projects.map((p) => (
            <motion.div
              key={p._id}
              onClick={() => {
                setEditingItem(p);
                setOpenModal(true);
              }}
              className="group relative flex min-h-[220px] cursor-pointer flex-col overflow-hidden rounded-sm border border-neutral-200/60 bg-white shadow-sm transition-all duration-500 hover:border-neutral-300 hover:shadow-2xl hover:shadow-neutral-900/5"
            >
              {/* Highlight Top Border */}
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-neutral-200 to-transparent transition-colors duration-500 group-hover:from-primary/60"></div>

              <div className="flex flex-1 flex-col p-6">
                {/* Meta Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {p.status ? (
                      <span className="rounded-sm bg-neutral-100 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-700">
                        {p.status}
                      </span>
                    ) : (
                      <span className="rounded-sm bg-neutral-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                        No Status
                      </span>
                    )}
                    {p.projectType && (
                      <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                        <span className="inline-block h-1 w-1 rounded-full bg-neutral-300"></span>
                        {p.projectType}
                      </span>
                    )}
                  </div>
                  <FiBriefcase size={14} className="text-neutral-300 transition-colors duration-300 group-hover:text-primary" />
                </div>

                {/* Title & Description */}
                <h3 className="mb-2 line-clamp-2 text-[17px] font-medium leading-snug tracking-tight text-neutral-900 transition-colors duration-300 group-hover:text-primary">
                  {p.name}
                </h3>

                <p className="mb-6 line-clamp-3 text-[12px] leading-relaxed text-neutral-500">
                  {p.description || 'Hồ sơ dự án chưa được cập nhật nội dung chi tiết. Vui lòng bổ sung thêm thông tin.'}
                </p>

                {/* Footer Actions */}
                <div className="mt-auto flex items-end justify-between border-t border-neutral-100 pt-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    <FiMapPin size={12} />
                    <span>REF: {p._id.slice(-6)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex translate-y-2 transform items-center gap-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(p);
                        setOpenModal(true);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-transparent bg-neutral-50 text-neutral-500 transition-all hover:bg-neutral-900 hover:text-white"
                      title="Chỉnh sửa dự án"
                    >
                      <FiEdit3 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p._id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-transparent bg-neutral-50 text-neutral-400 transition-all hover:bg-red-50 hover:text-red-600"
                      title="Xóa dự án"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* MODALS */}
      {openModal && <RealEstateProjectModal open={openModal} editingItem={editingItem} onClose={() => setOpenModal(false)} reload={reload} />}

      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  );
}
