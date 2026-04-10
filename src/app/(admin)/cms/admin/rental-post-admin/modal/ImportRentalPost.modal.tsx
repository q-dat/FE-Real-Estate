'use client';
import { useState } from 'react';
import { Button, Modal } from 'react-daisyui';
import { rentalPostAdminService } from '@/services/rental/rentalPostAdmin.service';
import { IRentalAuthor } from '@/types/rentalAdmin/rentalAdmin.types';

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => Promise<void>;
  authorId: IRentalAuthor;
}

export default function ImportRentalPostModal({ open, onClose, reload, authorId }: Props) {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);

      /* PARSE */
      let parsed: unknown;

      try {
        parsed = JSON.parse(jsonText);
      } catch {
        throw new Error('JSON không hợp lệ');
      }

      if (!Array.isArray(parsed)) {
        throw new Error('JSON phải là array');
      }

      /* NORMALIZE */
      const normalized = parsed.map((item, index) => {
        if (typeof item !== 'object' || item === null) {
          throw new Error(`Item ${index} không hợp lệ`);
        }

        const obj = item as Record<string, unknown>;

        return {
          ...obj,

          // FIX QUAN TRỌNG
          author: authorId._id,

          // FORCE primitive (tránh crash UI)
          title: String(obj.title || ''),
          province: String(obj.province || ''),
          district: String(obj.district || ''),
          ward: String(obj.ward || ''),

          price: Number(obj.price || 0),
          area: Number(obj.area || 0),
        };
      });

      /* CALL API */
      const res = await rentalPostAdminService.importRentalPost(normalized);

      console.log('IMPORT SUCCESS:', res);

      await reload();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Import failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      className="max-w-2xl"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Modal.Header className="text-lg font-bold">Import JSON Bài đăng</Modal.Header>

      <Modal.Body className="space-y-4">
        <textarea
          className="textarea textarea-bordered h-64 w-full font-mono text-sm"
          placeholder="Paste JSON array vào đây..."
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />

        {error && <div className="text-sm text-red-500">{error}</div>}
      </Modal.Body>

      <Modal.Actions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button color="primary" loading={loading} onClick={handleImport}>
          Import
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
