'use client';
import { useState } from 'react';
import { Button, Badge } from 'react-daisyui';
import { motion } from 'framer-motion';
import { FaPlus, FaPen, FaTrashAlt, FaBuilding } from 'react-icons/fa';
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

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between rounded-md bg-white/80 shadow backdrop-blur">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <FaBuilding className="text-primary" /> Quản lý dự án BĐS
          </h1>
          <p className="text-sm text-gray-500">Tổng số: {projects.length}</p>
        </div>

        <Button
          size="sm"
          color="primary"
          onClick={() => {
            setEditingItem(null);
            setOpenModal(true);
          }}
        >
          <FaPlus /> Thêm mới
        </Button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {projects.map((p) => (
          <div
            key={p._id}
            className="group relative rounded-md border bg-white p-4 shadow xl:hover:shadow-lg"
            onClick={() => {
              setEditingItem(p);
              setOpenModal(true);
            }}
          >
            {/* Content */}
            <div>
              <h3 className="mb-1 line-clamp-2 font-semibold text-slate-800">{p.name}</h3>

              <p className="line-clamp-3 text-xs text-slate-500">{p.description ? 'Đã có nội dung chi tiết' : 'Chưa có nội dung'}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {p.status && <Badge color="info">{p.status}</Badge>}
                {p.projectType && <Badge>{p.projectType}</Badge>}
              </div>
            </div>

            <div className="absolute right-2 top-2 hidden gap-2 group-hover:flex">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingItem(p);
                  setOpenModal(true);
                }}
              >
                <FaPen />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(p._id);
                }}
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
      </motion.div>

      {openModal && <RealEstateProjectModal open={openModal} editingItem={editingItem} onClose={() => setOpenModal(false)} reload={reload} />}

      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  );
}
