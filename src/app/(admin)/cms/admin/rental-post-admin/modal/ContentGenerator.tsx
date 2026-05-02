'use client';
import React, { useState, useEffect } from 'react';
import { FiCopy, FiCheck, FiTrash2, FiPlus } from 'react-icons/fi';

interface PropertyData {
    images: string[];
    title: string;
    description: string;
    categoryName: string;
    propertyType: string;
    locationType: string;
    direction: string;
    price: number | string;
    priceUnit: string;
    area: number | string;
    frontageWidth: number | string;
    lotDepth: number | string;
    backSize: number | string;
    floorNumber: number | string;
    bedroomNumber: number | string;
    toiletNumber: number | string;
    legalStatus: string;
    furnitureStatus: string;
    province: string;
    district: string;
    ward: string;
    address: string;
    amenities: string;
    postType: string;
    status: string;
    adminNote: string;
    fileName: string;
    tiktokThumbnailKeys: string;
    tiktokTitle: string;
    voice: string;
    facebookPost: string;
    areaContent: string;
    streetName: string;
    wardDistrict: string;
    inputData: string;
    _tempId: string; // Biến nội bộ để quản lý Tab
}

const PROMPT_TEMPLATE = `Bạn là một chuyên gia bóc tách dữ liệu BĐS. Hãy đọc thông tin thô và trả về MẢNG JSON 1 object.
QUY TẮC:
1. backSize = 0 nếu bằng frontageWidth.
2. inputData = Nguyên văn đoạn text thô ban đầu khách cung cấp.
3. adminNote = (Nội dung facebookPost tự viết) + "\\n\\n" + inputData.
4. tiktokThumbnailKeys: Mỗi dòng bắt đầu bằng dấu "+ ".
5. streetName: Tên đường (VD: Đường Số 1).
6. wardDistrict: Phường và Quận (VD: Phường 1, Gò Vấp).

Cấu trúc trả về:
[{
  "images": [],
  "title": "...",
  "description": "...",
  "categoryName": "Bất động sản bán",
  "propertyType": "Nhà phố",
  "locationType": "...",
  "direction": "",
  "price": 0,
  "priceUnit": "Tỷ",
  "area": 0,
  "frontageWidth": 0,
  "lotDepth": 0,
  "backSize": 0,
  "floorNumber": 0,
  "bedroomNumber": 0,
  "toiletNumber": 0,
  "legalStatus": "...",
  "furnitureStatus": "...",
  "province": "...",
  "district": "...",
  "ward": "...",
  "address": "...",
  "amenities": "...",
  "postType": "highlight",
  "status": "active",
  "adminNote": "...",
  "fileName": "...",
  "tiktokThumbnailKeys": "...",
  "tiktokTitle": "...",
  "voice": "...",
  "facebookPost": "...",
  "areaContent": "...",
  "streetName": "...",
  "wardDistrict": "...",
  "inputData": "..."
}]`;

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function ContentGeneratorModal({ open, onClose }: Props) {
    const [jsonInput, setJsonInput] = useState('');
    const [parsedData, setParsedData] = useState<PropertyData[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (open && !isLoaded) {
            const savedData = localStorage.getItem('NN_TEMP_POSTS');
            if (savedData) {
                try {
                    const data = JSON.parse(savedData) as PropertyData[];
                    setParsedData(data);
                    setActiveTab(data.length > 0 ? data.length - 1 : 0);
                } catch (e) {
                    console.error("Lỗi khi tải dữ liệu từ LocalStorage", e);
                }
            }
            setIsLoaded(true);
        }
    }, [open, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('NN_TEMP_POSTS', JSON.stringify(parsedData));
        }
    }, [parsedData, isLoaded]);

    if (!open) return null;

    const handleParseJson = () => {
        try {
            if (!jsonInput.trim()) return;
            let data = JSON.parse(jsonInput);
            if (!Array.isArray(data)) data = [data];

            const processedData: PropertyData[] = data.map((item: PropertyData) => {
                const processedItem = { ...item };
                if (processedItem.backSize === processedItem.frontageWidth) processedItem.backSize = 0;

                if (processedItem.tiktokThumbnailKeys) {
                    processedItem.tiktokThumbnailKeys = processedItem.tiktokThumbnailKeys
                        .split('\n')
                        .filter((l) => l.trim() !== "")
                        .map((line) => line.trim().startsWith('+') ? line : `+ ${line}`)
                        .join('\n');
                }
                processedItem.adminNote = `${processedItem.facebookPost || ''}\n\n=======================\n${processedItem.inputData || ''}`;
                return {
                    ...processedItem,
                    _tempId: Date.now() + Math.random().toString(36).substring(7)
                };
            });

            setParsedData(prev => [...prev, ...processedData]);
            setJsonInput('');
            setActiveTab(parsedData.length);
        } catch (err) {
            console.error("JSON không hợp lệ");
        }
    };

    const handleCopy = (text: string | number, fieldId: string) => {
        navigator.clipboard.writeText(text.toString());
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const updateField = (index: number, field: keyof PropertyData, value: string | number) => {
        const newData = [...parsedData];
        (newData[index][field] as any) = value;

        if (field === 'facebookPost' || field === 'inputData') {
            newData[index].adminNote = `${newData[index].facebookPost || ''}\n\n=======================\n${newData[index].inputData || ''}`;
        }
        setParsedData(newData);
    };

    const removeTab = (index: number) => {
        const newData = parsedData.filter((_, i) => i !== index);
        setParsedData(newData);
        if (activeTab >= newData.length) setActiveTab(Math.max(0, newData.length - 1));
    };

    const getSystemJson = (item: PropertyData) => {
        const allowedKeys = [
            "images", "title", "description", "categoryName", "propertyType",
            "locationType", "direction", "price", "priceUnit", "area", "frontageWidth",
            "lotDepth", "backSize", "floorNumber", "bedroomNumber", "toiletNumber",
            "legalStatus", "furnitureStatus", "province", "district", "ward",
            "address", "amenities", "postType", "status", "adminNote"
        ];
        const result: Record<string, any> = { code: "" };
        allowedKeys.forEach(key => {
            result[key] = (item as any)[key] || (key === "images" ? [] : "");
        });
        return [result];
    };

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md">
            <div className="flex h-[95dvh] w-[98vw] flex-col overflow-hidden rounded-xl bg-neutral-100 shadow-2xl ring-1 ring-white/20">

                {/* Header */}
                <div className="flex flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 text-white font-black text-xs">AI</div>
                        <h2 className="text-[15px] font-bold uppercase tracking-widest text-neutral-900">Workspace Editor</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setParsedData([])} className="text-[11px] font-bold text-red-500 hover:underline">Xóa Local</button>
                        <button onClick={onClose} className="rounded-full bg-neutral-100 p-2 text-neutral-500 hover:bg-neutral-200">✕</button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Left: Input Area */}
                    <div className="flex w-[350px] flex-col border-r border-neutral-200 bg-white p-5">
                        <button onClick={() => handleCopy(PROMPT_TEMPLATE, 'prompt')} className="mb-4 w-full rounded bg-blue-600 py-2 text-[11px] font-bold text-white hover:bg-blue-700 shadow-md">
                            {copiedField === 'prompt' ? 'Đã Copy Prompt!' : 'Copy Prompt Mẫu'}
                        </button>
                        <textarea
                            className="flex-1 resize-none rounded-md border border-neutral-200 bg-neutral-50 p-4 text-[11px] font-mono focus:bg-white focus:outline-none"
                            placeholder="Dán JSON từ AI..."
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                        />
                        <button onClick={handleParseJson} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-neutral-900 text-[12px] font-bold uppercase text-white hover:bg-primary transition-colors">
                            <FiPlus /> Tạo Tab Mới
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex flex-1 flex-col bg-[#F3F4F6]">
                        {parsedData.length > 0 ? (
                            <>
                                {/* Tabs List */}
                                <div className="flex overflow-x-auto border-b border-neutral-200 bg-neutral-200 px-2 pt-2 scrollbar-hide shadow-inner">
                                    {parsedData.map((item, idx) => (
                                        <div key={item._tempId} className={`group flex min-w-[120px] cursor-pointer items-center justify-between rounded-t-md border-x border-t px-3 py-2 text-[11px] font-bold transition-all ${activeTab === idx ? 'bg-white text-primary shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' : 'text-neutral-500 hover:bg-neutral-300'}`} onClick={() => setActiveTab(idx)}>
                                            <span className="truncate">{item.price}T - {item.district}</span>
                                            <FiTrash2 className="ml-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); removeTab(idx); }} />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-1 overflow-hidden p-6 gap-6">
                                    {/* Editor Form */}
                                    <div className="flex-1 overflow-y-auto space-y-6 rounded-xl bg-white p-6 shadow-sm border border-neutral-100 scrollbar-thin">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className="text-[10px] font-bold uppercase text-neutral-400">Tiêu đề gốc</label>
                                                <input className="w-full border-b py-2 font-bold text-neutral-900 outline-none focus:border-primary" value={parsedData[activeTab].title || ''} onChange={(e) => updateField(activeTab, 'title', e.target.value)} />
                                            </div>

                                            <div className="col-span-2 space-y-4 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                                                <div className="flex gap-6">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold uppercase text-neutral-400">File Name</label>
                                                        <div className="flex items-center gap-2 border-b border-neutral-200 py-1">
                                                            <input className="w-full bg-transparent outline-none text-[13px]" value={parsedData[activeTab].fileName || ''} onChange={(e) => updateField(activeTab, 'fileName', e.target.value)} />
                                                            <button onClick={() => handleCopy(parsedData[activeTab].fileName, 'fn')}>{copiedField === 'fn' ? <FiCheck className="text-green-500" /> : <FiCopy className="text-neutral-400 hover:text-primary" />}</button>
                                                        </div>
                                                    </div>
                                                    <div className="w-px bg-neutral-200"></div>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold uppercase text-neutral-400">Diện tích Format</label>
                                                        <div className="flex items-center gap-2 border-b border-neutral-200 py-1">
                                                            <input className="w-full bg-transparent outline-none text-[13px]" value={parsedData[activeTab].areaContent || ''} onChange={(e) => updateField(activeTab, 'areaContent', e.target.value)} />
                                                            <button onClick={() => handleCopy(parsedData[activeTab].areaContent, 'ac')}>{copiedField === 'ac' ? <FiCheck className="text-green-500" /> : <FiCopy className="text-neutral-400 hover:text-primary" />}</button>
                                                        </div>
                                                    </div>
                                                    <div className="w-px bg-neutral-200"></div>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold uppercase text-neutral-400">Giá (Price)</label>
                                                        <div className="flex items-center gap-2 border-b border-neutral-200 py-1">
                                                            <input className="w-full bg-transparent outline-none text-[13px] font-bold text-red-600" value={parsedData[activeTab].price || ''} onChange={(e) => updateField(activeTab, 'price', e.target.value)} />
                                                            <button onClick={() => handleCopy(parsedData[activeTab].price, 'pr')}>{copiedField === 'pr' ? <FiCheck className="text-green-500" /> : <FiCopy className="text-neutral-400 hover:text-primary" />}</button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-6 border-t border-neutral-200 pt-4">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold uppercase text-neutral-400">Tên Đường</label>
                                                        <div className="flex items-center gap-2 border-b border-neutral-200 py-1">
                                                            <input className="w-full bg-transparent outline-none text-[13px] text-blue-700 font-semibold" value={parsedData[activeTab].streetName || ''} onChange={(e) => updateField(activeTab, 'streetName', e.target.value)} />
                                                            <button onClick={() => handleCopy(parsedData[activeTab].streetName, 'sn')}>{copiedField === 'sn' ? <FiCheck className="text-green-500" /> : <FiCopy className="text-neutral-400 hover:text-primary" />}</button>
                                                        </div>
                                                    </div>
                                                    <div className="w-px bg-neutral-200"></div>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold uppercase text-neutral-400">Phường, Quận</label>
                                                        <div className="flex items-center gap-2 border-b border-neutral-200 py-1">
                                                            <input className="w-full bg-transparent outline-none text-[13px] text-blue-700 font-semibold" value={parsedData[activeTab].wardDistrict || ''} onChange={(e) => updateField(activeTab, 'wardDistrict', e.target.value)} />
                                                            <button onClick={() => handleCopy(parsedData[activeTab].wardDistrict, 'wd')}>{copiedField === 'wd' ? <FiCheck className="text-green-500" /> : <FiCopy className="text-neutral-400 hover:text-primary" />}</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="text-[10px] font-bold uppercase text-neutral-400">Tiktok Title</label>
                                                <div className="flex items-center gap-2 border-b py-1">
                                                    <input className="w-full py-1 outline-none font-bold text-[13px]" value={parsedData[activeTab].tiktokTitle || ''} onChange={(e) => updateField(activeTab, 'tiktokTitle', e.target.value)} />
                                                    <button onClick={() => handleCopy(parsedData[activeTab].tiktokTitle, 'tt')}>{copiedField === 'tt' ? <FiCheck className="text-green-500" /> : <FiCopy className="text-neutral-400 hover:text-primary" />}</button>
                                                </div>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="text-[10px] font-bold uppercase text-neutral-400">Facebook Post</label>
                                                <textarea className="w-full h-80 rounded-lg border border-neutral-200 p-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-primary shadow-inner" value={parsedData[activeTab].facebookPost || ''} onChange={(e) => updateField(activeTab, 'facebookPost', e.target.value)} />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-neutral-400">Thumbnail Keys (+)</label>
                                                <textarea className="w-full h-80 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-yellow-400 shadow-inner" value={parsedData[activeTab].tiktokThumbnailKeys || ''} onChange={(e) => updateField(activeTab, 'tiktokThumbnailKeys', e.target.value)} />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-neutral-400">Voiceover</label>
                                                <textarea className="w-full h-80 rounded-lg border border-blue-200 bg-blue-50 p-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-inner" value={parsedData[activeTab].voice || ''} onChange={(e) => updateField(activeTab, 'voice', e.target.value)} />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="text-[10px] font-bold uppercase text-red-500">Input thô (Gốc)</label>
                                                <textarea className="w-full h-80 rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-red-400 shadow-inner" value={parsedData[activeTab].inputData || ''} onChange={(e) => updateField(activeTab, 'inputData', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar Right: System JSON Export */}
                                    <div className="w-[450px] flex flex-col gap-4">
                                        <div className="flex-1 flex flex-col rounded-xl bg-white p-5 shadow-sm border border-neutral-100 overflow-hidden">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-[10px] font-bold uppercase text-neutral-400">JSON Xuất Hệ Thống</label>
                                                <button onClick={() => handleCopy(JSON.stringify(getSystemJson(parsedData[activeTab]), null, 2), 'sys')} className="bg-neutral-900 text-white px-4 py-1.5 rounded text-[10px] font-bold hover:bg-primary transition-colors">
                                                    {copiedField === 'sys' ? 'ĐÃ COPY JSON' : 'COPY JSON'}
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto rounded-lg bg-neutral-900 p-4 text-[11px] font-mono text-green-400 scrollbar-thin shadow-inner">
                                                <pre>{JSON.stringify(getSystemJson(parsedData[activeTab]), null, 2)}</pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center text-neutral-400">
                                <FiPlus size={48} className="mb-4 text-neutral-200" />
                                <p className="text-[12px] font-bold uppercase tracking-widest">Trống</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}