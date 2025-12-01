'use client';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { motion } from 'framer-motion';
import { FaLayerGroup, FaPlus, FaPen, FaTrashAlt } from 'react-icons/fa';
import { IRentalCategory } from '@/types/type/rentalCategory/rentalCategory';
import { rentalCategoryService } from '@/services/rentalCategoryService';
import DeleteModal from '../DeleteModal';
import RentalCategoryModal from './RentalCategoryModal';

interface FormState {
  name: string;
  description: string;
  categoryCode: number | '';
}

export default function ClientCategoryAdminPage({ categories: initialCategories }: { categories: IRentalCategory[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editing, setEditing] = useState<IRentalCategory | null>(null);

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    categoryCode: '',
  });

  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<IRentalCategory | null>(null);

  const reload = async () => {
    const data = await rentalCategoryService.getAll();
    setCategories(Array.isArray(data) ? data : []);
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Vui lòng nhập tên danh mục');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());

      if (form.description.trim()) formData.append('description', form.description.trim());

      if (form.categoryCode !== '') {
        formData.append('categoryCode', String(Number(form.categoryCode)));
      }

      if (editing && editing._id) {
        await rentalCategoryService.update(editing._id, formData);
      } else {
        await rentalCategoryService.create(formData);
      }

      await reload();
      setEditing(null);
      setForm({ name: '', description: '', categoryCode: '' });
    } catch (err) {
      console.error('Lỗi khi lưu danh mục:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await rentalCategoryService.delete(deleting._id);
    await reload();
    setDeleting(null);
    setConfirmOpen(false);
  };

  return (
    <div className="pt-mobile-padding-top xl:pt-desktop-padding-top min-h-screen bg-white px-2 text-black scrollbar-hide xl:px-4">
      {/* Header */}
      <div className="mb-5 mt-10 flex items-center justify-between border-b border-gray-200 pb-3">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-black xl:text-xl">
          <FaLayerGroup className="text-primary" /> Quản lý danh mục
        </h1>

        <Button
          size="sm"
          onClick={() => {
            setEditing({ _id: '', name: '', createdAt: '', updatedAt: '', categoryCode: 0 });
            setForm({ name: '', description: '', categoryCode: '' });
          }}
          className="flex items-center gap-2 rounded-md bg-primary text-white"
        >
          <FaPlus /> Thêm
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((cat) => (
          <motion.div
            key={cat._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex cursor-pointer flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:bg-primary hover:shadow-lg"
            onClick={() => {
              setEditing(cat);
              setForm({
                name: cat.name,
                description: cat.description || '',
                categoryCode: typeof cat.categoryCode === 'number' ? cat.categoryCode : '',
              });
            }}
          >
            <div>
              <h2 className="mb-1 text-base font-semibold text-primary group-hover:text-white">{cat.name}</h2>

              {typeof cat.categoryCode === 'number' && <p className="text-xs text-gray-400 group-hover:text-white">Mã: {cat.categoryCode}</p>}

              {cat.description && <p className="line-clamp-2 text-sm text-gray-500 group-hover:text-white">{cat.description}</p>}
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center justify-between text-xs text-primary group-hover:text-white">
              <span>{new Date(cat.createdAt).toLocaleDateString('vi-VN')}</span>

              <div className="flex gap-2">
                {/* EDIT BUTTON */}
                <Button
                  size="xs"
                  color="info"
                  className="rounded-md bg-primary text-white group-hover:bg-white group-hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation(); // chặn mở modal edit từ card
                    setEditing(cat);
                    setForm({
                      name: cat.name,
                      description: cat.description || '',
                      categoryCode: typeof cat.categoryCode === 'number' ? cat.categoryCode : '',
                    });
                  }}
                >
                  <FaPen size={12} />
                </Button>

                {/* DELETE BUTTON */}
                <Button
                  size="xs"
                  color="error"
                  className="rounded-md border bg-black text-white group-hover:border-white group-hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation(); // chặn mở edit khi nhấn delete
                    setDeleting(cat);
                    setConfirmOpen(true);
                  }}
                >
                  <FaTrashAlt size={12} />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <RentalCategoryModal
        open={!!editing}
        editing={editing}
        loading={loading}
        name={form.name}
        description={form.description}
        categoryCode={form.categoryCode}
        onChangeName={(v) => updateField('name', v)}
        onChangeDescription={(v) => updateField('description', v)}
        onChangeCategoryCode={(v) => updateField('categoryCode', v === '' ? '' : Number(v))}
        onClose={() => {
          setEditing(null);
          setForm({ name: '', description: '', categoryCode: '' });
        }}
        onSave={handleSave}
      />

      <DeleteModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmDelete} />
    </div>
  );
}
