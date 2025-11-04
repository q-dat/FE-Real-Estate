'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'react-daisyui';
import { FaTrashAlt } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { useEscClose } from '@/hooks/useEscClose';

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function DeleteModal({ open, onClose, onConfirm }: DeleteModalProps) {
  useEscClose(open, onClose); // Hook ESC dùng chung cho mọi modal

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            key="modal"
            onClick={(e) => e.stopPropagation()}
            className="relative w-[90%] max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl sm:w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full bg-gray-100 p-1.5 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
            >
              <MdClose size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-inner">
                <FaTrashAlt size={22} />
              </div>

              <h3 className="text-lg font-semibold text-gray-800">Xác nhận xoá bài đăng</h3>
              <p className="mt-1 text-sm text-gray-600">
                Hành động này sẽ <strong>không thể hoàn tác</strong>. Bạn chắc chắn chứ?
              </p>

              <div className="mt-6 flex w-full justify-center gap-3">
                <Button
                  size="sm"
                  color="ghost"
                  className="rounded-md border border-gray-200 px-5 font-medium text-gray-700 hover:bg-gray-100"
                  onClick={onClose}
                >
                  Hủy
                </Button>
                <Button size="sm" color="error" className="rounded-md px-5 font-medium text-white shadow-md hover:brightness-110" onClick={onConfirm}>
                  Xác nhận xoá
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
