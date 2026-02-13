'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { IRealEstateProject } from '@/types/realEstateProject/realEstateProject.types';

interface Props {
  project: IRealEstateProject;
}

type TabKey = 'intro' | 'pricing' | 'amenities' | 'address' | 'partner' | 'contact';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'intro', label: 'Giới thiệu' },
  { key: 'pricing', label: 'Bảng giá' },
  { key: 'amenities', label: 'Tiện ích' },
  { key: 'address', label: 'Vị trí' },
  { key: 'partner', label: 'Đối tác' },
  { key: 'contact', label: 'Liên hệ' },
];

export default function ClientRealEstateProjectDetailPage({ project }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('intro');

  return (
    <div className="bg-white pt-mobile-padding-top xl:pt-desktop-padding-top">
      {/* HERO */}
      <section className="border-b bg-gray-50/50 px-4 py-10 xl:px-desktop-padding">
        <h1 className="mb-2 text-2xl font-bold text-slate-800 xl:text-3xl">{project.name}</h1>

        {project.description && <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">{stripHtml(project.description)}</p>}
      </section>

      {/* TABS */}
      <section className="sticky top-0 z-20 border-b bg-white">
        <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 xl:px-desktop-padding">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative whitespace-nowrap py-4 text-sm font-medium transition ${
                activeTab === tab.key ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
            </button>
          ))}
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 py-10 xl:px-desktop-padding">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {activeTab === 'intro' && <ContentBlock html={project.introduction} />}

          {activeTab === 'pricing' && <ContentBlock html={project.pricing} empty="Chưa công bố bảng giá" />}

          {activeTab === 'amenities' && <ContentBlock html={project.amenities} empty="Đang cập nhật tiện ích" />}

          {activeTab === 'address' && <ContentBlock html={project.address} empty="Đang cập nhật vị trí" />}

          {activeTab === 'partner' && (
            <div className="space-y-4 text-sm text-slate-600">
              {project.investor && (
                <p>
                  <strong>Chủ đầu tư:</strong> {project.investor}
                </p>
              )}
              {project.partners && (
                <p>
                  <strong>Đối tác:</strong> {project.partners}
                </p>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4 rounded-md bg-gray-50 p-6 text-sm">
              {project.hotline && <p>Hotline: {project.hotline}</p>}
              {project.email && <p>Email: {project.email}</p>}
              {project.zalo && <p>Zalo: {project.zalo}</p>}
              {project.message && <p className="mt-4 font-medium text-primary">{project.message}</p>}
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}

/* ================= Utils ================= */

function ContentBlock({ html, empty = 'Nội dung đang được cập nhật' }: { html?: string; empty?: string }) {
  if (!html) {
    return <p className="text-sm text-slate-500">{empty}</p>;
  }

  return <div className="prose-slate prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: html }} />;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').slice(0, 200);
}
