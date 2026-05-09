'use client';
import { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiChevronRight, FiCopy, FiDatabase, FiPlus, FiSend, FiTrash2 } from 'react-icons/fi';

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
  _tempId: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSendToImport?: (jsonText: string) => void;
}

type PropertyField = keyof PropertyData;
type JsonRecord = Record<string, unknown>;
type TabStatus = 'pending' | 'done';
type TabStatusMap = Record<string, TabStatus>;

type TextFieldProps = {
  label: string;
  value: string | number;
  copyId: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  accentClass?: string;
};

type TextAreaFieldProps = {
  label: string;
  value: string | number;
  copyId: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accentClass?: string;
  mono?: boolean;
};

const STORAGE_POSTS_KEY = 'NN_TEMP_POSTS_V2';
const STORAGE_STATUS_KEY = 'NN_TEMP_TAB_STATUS_V2';

const PROMPT_TEMPLATE = `Bạn là AI biên tập bất động sản.

Yêu cầu:
- Chỉ sử dụng dữ liệu được cung cấp
- Không suy diễn hoặc thêm thông tin
- Không dùng từ: đầu tư, giữ tiền, phong thủy, kinh doanh nếu không có trong input

Tạo:
1. tiktokTitle (Địa chỉ | Công năng | Diện tích | Giá dạng 17T4)
2. voice (600-999 ký tự, số viết chữ, thay "tỷ" bằng "đồng")
3. facebookPost (ngắn gọn, rõ ràng, đúng dữ liệu)
4. tiktokThumbnailKeys (4 dòng an toàn)

Bóc tách thêm dữ liệu theo cấu trúc sau:
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
}]

QUY TẮC:
1. backSize = 0 nếu bằng frontageWidth.
2. inputData = nguyên văn đoạn text thô ban đầu.
3. adminNote = facebookPost + "\\n\\n=======================\\n" + inputData.
4. tiktokThumbnailKeys: mỗi dòng bắt đầu bằng dấu "+ ".
5. streetName: tên đường.
6. wardDistrict: phường và quận.
7. Giữ văn phong chuẩn mực, trung tính, dễ hiểu.`;

const SYSTEM_JSON_KEYS: Array<keyof PropertyData> = [
  'images',
  'title',
  'description',
  'categoryName',
  'propertyType',
  'locationType',
  'direction',
  'price',
  'priceUnit',
  'area',
  'frontageWidth',
  'lotDepth',
  'backSize',
  'floorNumber',
  'bedroomNumber',
  'toiletNumber',
  'legalStatus',
  'furnitureStatus',
  'province',
  'district',
  'ward',
  'address',
  'amenities',
  'postType',
  'status',
  'adminNote',
];

const createTempId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const isJsonRecord = (value: unknown): value is JsonRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const safeString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return '';
};

const safeNumberOrString = (value: unknown): number | string => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return value;
  return '';
};

const safeImages = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
};

const normalizeThumbnailKeys = (value: string): string => {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith('+') ? line : `+ ${line}`))
    .join('\n');
};

const normalizePropertyData = (item: JsonRecord): PropertyData => {
  const frontageWidth = safeNumberOrString(item.frontageWidth);
  let backSize = safeNumberOrString(item.backSize);

  if (String(backSize) === String(frontageWidth)) {
    backSize = 0;
  }

  const facebookPost = safeString(item.facebookPost);
  const inputData = safeString(item.inputData);
  const adminNote = `${facebookPost || safeString(item.adminNote)}\n\n=======================\n${inputData}`;

  return {
    images: safeImages(item.images),
    title: safeString(item.title),
    description: safeString(item.description),
    categoryName: safeString(item.categoryName) || 'Bất động sản bán',
    propertyType: safeString(item.propertyType),
    locationType: safeString(item.locationType),
    direction: safeString(item.direction),
    price: safeNumberOrString(item.price),
    priceUnit: safeString(item.priceUnit) || 'Tỷ',
    area: safeNumberOrString(item.area),
    frontageWidth,
    lotDepth: safeNumberOrString(item.lotDepth),
    backSize,
    floorNumber: safeNumberOrString(item.floorNumber),
    bedroomNumber: safeNumberOrString(item.bedroomNumber),
    toiletNumber: safeNumberOrString(item.toiletNumber),
    legalStatus: safeString(item.legalStatus),
    furnitureStatus: safeString(item.furnitureStatus),
    province: safeString(item.province),
    district: safeString(item.district),
    ward: safeString(item.ward),
    address: safeString(item.address),
    amenities: safeString(item.amenities),
    postType: safeString(item.postType) || 'highlight',
    status: safeString(item.status) || 'active',
    adminNote,
    fileName: safeString(item.fileName),
    tiktokThumbnailKeys: normalizeThumbnailKeys(safeString(item.tiktokThumbnailKeys)),
    tiktokTitle: safeString(item.tiktokTitle),
    voice: safeString(item.voice),
    facebookPost,
    areaContent: safeString(item.areaContent),
    streetName: safeString(item.streetName),
    wardDistrict: safeString(item.wardDistrict),
    inputData,
    _tempId: safeString(item._tempId) || createTempId(),
  };
};

const getLocalStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
};

const setLocalStorage = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, value);
};

const removeLocalStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
};

export default function ContentGeneratorModal({ open, onClose, onSendToImport }: Props) {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<PropertyData[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tabStatuses, setTabStatuses] = useState<TabStatusMap>({});
  const [jsonPanelPinned, setJsonPanelPinned] = useState(false);
  const [jsonPanelHovered, setJsonPanelHovered] = useState(false);
  const [showLocalTools, setShowLocalTools] = useState(false);
  const [error, setError] = useState('');

  const activeItem = parsedData[activeTab];
  const isJsonPanelExpanded = jsonPanelPinned || jsonPanelHovered || parsedData.length === 0;

  const doneCount = useMemo(() => {
    return parsedData.filter((item) => tabStatuses[item._tempId] === 'done').length;
  }, [parsedData, tabStatuses]);

  useEffect(() => {
    if (!open || isLoaded) return;

    const savedPosts = getLocalStorage(STORAGE_POSTS_KEY);
    const savedStatuses = getLocalStorage(STORAGE_STATUS_KEY);

    if (savedPosts) {
      try {
        const parsed = JSON.parse(savedPosts) as unknown;

        if (Array.isArray(parsed)) {
          const normalized = parsed.filter(isJsonRecord).map(normalizePropertyData);
          setParsedData(normalized);
          setActiveTab(normalized.length > 0 ? normalized.length - 1 : 0);
        }
      } catch {
        setError('Không thể tải dữ liệu đã lưu trong localStorage.');
      }
    }

    if (savedStatuses) {
      try {
        const parsed = JSON.parse(savedStatuses) as unknown;

        if (isJsonRecord(parsed)) {
          const statusMap = Object.entries(parsed).reduce<TabStatusMap>((acc, [key, value]) => {
            if (value === 'done' || value === 'pending') {
              acc[key] = value;
            }

            return acc;
          }, {});

          setTabStatuses(statusMap);
        }
      } catch {
        setTabStatuses({});
      }
    }

    setIsLoaded(true);
  }, [open, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    setLocalStorage(STORAGE_POSTS_KEY, JSON.stringify(parsedData));
  }, [parsedData, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    setLocalStorage(STORAGE_STATUS_KEY, JSON.stringify(tabStatuses));
  }, [tabStatuses, isLoaded]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleCopy = async (text: string | number | string[], fieldId: string) => {
    const value = Array.isArray(text) ? text.join('\n') : String(text ?? '');

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldId);
      window.setTimeout(() => setCopiedField(null), 1200);
    } catch {
      setError('Không thể copy nội dung.');
    }
  };

  const handleParseJson = () => {
    try {
      setError('');

      if (!jsonInput.trim()) {
        setError('Vui lòng dán JSON trước khi tạo tab.');
        return;
      }

      const parsed = JSON.parse(jsonInput) as unknown;
      const dataArray = Array.isArray(parsed) ? parsed : [parsed];

      const processedData = dataArray.filter(isJsonRecord).map(normalizePropertyData);

      if (processedData.length === 0) {
        setError('JSON không có object hợp lệ.');
        return;
      }

      setParsedData((current) => {
        const nextData = [...current, ...processedData];
        setActiveTab(nextData.length - 1);
        return nextData;
      });

      setTabStatuses((current) => {
        const nextStatus = { ...current };

        processedData.forEach((item) => {
          nextStatus[item._tempId] = 'pending';
        });

        return nextStatus;
      });

      setJsonInput('');
    } catch {
      setError('JSON không hợp lệ. Vui lòng kiểm tra dấu ngoặc, dấu phẩy hoặc cấu trúc mảng.');
    }
  };

  const updateField = <K extends PropertyField>(index: number, field: K, value: PropertyData[K]) => {
    setParsedData((current) => {
      const nextData = [...current];
      const currentItem = nextData[index];

      if (!currentItem) return current;

      const nextItem: PropertyData = {
        ...currentItem,
        [field]: value,
      };

      if (field === 'facebookPost' || field === 'inputData') {
        nextItem.adminNote = `${nextItem.facebookPost || ''}\n\n=======================\n${nextItem.inputData || ''}`;
      }

      nextData[index] = nextItem;
      return nextData;
    });
  };

  const removeTab = (index: number) => {
    setParsedData((current) => {
      const item = current[index];
      const nextData = current.filter((_, itemIndex) => itemIndex !== index);

      if (item) {
        setTabStatuses((currentStatuses) => {
          const nextStatuses = { ...currentStatuses };
          delete nextStatuses[item._tempId];
          return nextStatuses;
        });
      }

      setActiveTab((currentActiveTab) => {
        if (nextData.length === 0) return 0;
        if (currentActiveTab >= nextData.length) return nextData.length - 1;
        return currentActiveTab;
      });

      return nextData;
    });
  };

  const toggleTabStatus = (tempId: string) => {
    setTabStatuses((current) => {
      const currentStatus = current[tempId] || 'pending';

      return {
        ...current,
        [tempId]: currentStatus === 'done' ? 'pending' : 'done',
      };
    });
  };

  const clearLocalData = () => {
    const confirmed = window.confirm(
      'Xoá toàn bộ dữ liệu localStorage của workspace này? Hành động này sẽ xoá các tab đã lưu và trạng thái Done/Pending.'
    );

    if (!confirmed) return;

    removeLocalStorage(STORAGE_POSTS_KEY);
    removeLocalStorage(STORAGE_STATUS_KEY);

    setParsedData([]);
    setTabStatuses({});
    setJsonInput('');
    setActiveTab(0);
    setShowLocalTools(false);
    setError('');
  };

  const getSystemJson = (item: PropertyData) => {
    const result = SYSTEM_JSON_KEYS.reduce<Record<string, string | number | string[]>>(
      (acc, key) => {
        const value = item[key];

        if (key === 'images') {
          acc[key] = Array.isArray(value) ? value : [];
          return acc;
        }

        if (typeof value === 'string' || typeof value === 'number') {
          acc[key] = value;
          return acc;
        }

        acc[key] = '';
        return acc;
      },
      { code: '' }
    );

    return [result];
  };

  const systemJsonText = activeItem ? JSON.stringify(getSystemJson(activeItem), null, 2) : '';

  const handleSendToImport = () => {
    if (!activeItem || !systemJsonText.trim()) {
      setError('Không có JSON Admin Export để chuyển sang Import.');
      return;
    }

    if (!onSendToImport) {
      setError('Chưa cấu hình hàm nhận JSON Import ở component cha.');
      return;
    }

    onSendToImport(systemJsonText);
  };

  const renderCopyButton = (fieldId: string, value: string | number | string[]) => {
    const copied = copiedField === fieldId;

    return (
      <button
        type="button"
        onClick={() => void handleCopy(value, fieldId)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-900/80 text-slate-400 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
        title="Copy"
      >
        {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
      </button>
    );
  };

  const TextField = ({ label, value, copyId, onChange, placeholder, type = 'text', accentClass = '' }: TextFieldProps) => {
    return (
      <div className="min-w-0">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</label>
          {renderCopyButton(copyId, value)}
        </div>

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`h-11 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 text-[13px] font-semibold text-slate-100 outline-none transition placeholder:text-slate-600 hover:border-cyan-400/30 focus:border-cyan-400/60 focus:bg-slate-950 focus:ring-4 focus:ring-cyan-400/10 ${accentClass}`}
        />
      </div>
    );
  };

  const TextAreaField = ({ label, value, copyId, onChange, placeholder, accentClass = '', mono = false }: TextAreaFieldProps) => {
    return (
      <div className="min-w-0">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</label>
          {renderCopyButton(copyId, value)}
        </div>

        <textarea
          rows={15}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full resize-none overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/80 p-3 text-[13px] leading-relaxed text-slate-100 outline-none transition placeholder:text-slate-600 hover:border-cyan-400/30 focus:border-cyan-400/60 focus:bg-slate-950 focus:ring-4 focus:ring-cyan-400/10 ${mono ? 'font-mono text-[12px]' : ''} ${accentClass}`}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-xl">
      <div className="flex h-[90dvh] w-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-700/70 bg-slate-950 text-slate-100 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-xs font-black text-cyan-300">
              AI
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-black uppercase tracking-[0.18em] text-slate-100">Workspace Editor</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {parsedData.length} tab · {doneCount} done · {parsedData.length - doneCount} pending
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLocalTools((current) => !current)}
              className="hidden rounded-xl border border-slate-700/70 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-cyan-400/30 hover:bg-slate-800 xl:inline-flex"
            >
              Local tools
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700/70 bg-slate-900 px-3 py-2 text-sm font-black text-slate-300 transition hover:border-cyan-400/30 hover:bg-slate-800"
            >
              Đóng
            </button>
          </div>
        </div>

        {showLocalTools && (
          <div className="shrink-0 border-b border-red-400/20 bg-red-950/40 px-5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-red-200">Vùng thao tác dữ liệu local</p>
                <p className="mt-1 text-xs font-medium text-red-200/70">Chỉ dùng khi cần xoá toàn bộ tab đã lưu và trạng thái Done/Pending.</p>
              </div>

              <button
                type="button"
                onClick={clearLocalData}
                className="inline-flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-400/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-200 transition hover:bg-red-400/20"
              >
                <FiTrash2 />
                Xoá localStorage
              </button>
            </div>
          </div>
        )}

        {error && <div className="shrink-0 border-b border-amber-400/20 bg-amber-950/40 px-5 py-2 text-sm font-semibold text-amber-200">{error}</div>}

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside
            className={`group flex min-h-0 shrink-0 flex-col border-r border-slate-800 bg-slate-950 transition-all duration-300 ${
              isJsonPanelExpanded ? 'w-[390px] xl:w-[460px]' : 'w-[54px]'
            }`}
            onMouseEnter={() => setJsonPanelHovered(true)}
            onMouseLeave={() => setJsonPanelHovered(false)}
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 p-3">
              {isJsonPanelExpanded ? (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">JSON Import</p>
                  <p className="mt-1 text-[11px] text-slate-600">Hover để mở, rời chuột tự thu nếu chưa ghim.</p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setJsonPanelPinned((current) => !current)}
                className="ml-auto flex h-9 min-w-9 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-900 px-2 text-xs font-black text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
              >
                {isJsonPanelExpanded ? jsonPanelPinned ? 'Bỏ ghim' : 'Ghim' : <FiChevronRight />}
              </button>
            </div>

            {isJsonPanelExpanded ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
                <button
                  type="button"
                  onClick={() => void handleCopy(PROMPT_TEMPLATE, 'prompt')}
                  className="w-full rounded-xl bg-cyan-500 px-3 py-2.5 text-xs font-black uppercase tracking-wide text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
                >
                  {copiedField === 'prompt' ? 'Đã copy prompt' : 'Copy prompt mẫu'}
                </button>

                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Dán JSON từ AI</label>
                    {renderCopyButton('json-input', jsonInput)}
                  </div>

                  <textarea
                    value={jsonInput}
                    placeholder="Dán mảng JSON hoặc object JSON..."
                    onChange={(event) => setJsonInput(event.target.value)}
                    spellCheck={false}
                    className="min-h-0 flex-1 resize-none overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 font-mono text-[12px] leading-relaxed text-slate-200 outline-none transition [scrollbar-width:thin] placeholder:text-slate-600 hover:border-cyan-400/30 focus:border-cyan-400/60 focus:bg-slate-950 focus:ring-4 focus:ring-cyan-400/10"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleParseJson}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-xs font-black uppercase tracking-wide text-slate-950 transition hover:bg-cyan-100"
                >
                  <FiPlus />
                  Tạo tab mới
                </button>

                <button
                  type="button"
                  onClick={() => setShowLocalTools((current) => !current)}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-700/70 bg-slate-900 text-xs font-bold uppercase tracking-wide text-slate-400 transition hover:bg-slate-800 xl:hidden"
                >
                  <FiDatabase />
                  Local tools
                </button>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="-rotate-90 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.35em] text-slate-600">JSON Import</p>
              </div>
            )}
          </aside>

          <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-900">
            {parsedData.length > 0 ? (
              <>
                <div className="flex shrink-0 overflow-x-auto border-b border-slate-800 bg-slate-950/80 px-2 pt-2 [scrollbar-width:thin]">
                  {parsedData.map((item, index) => {
                    const status = tabStatuses[item._tempId] || 'pending';
                    const isActive = activeTab === index;
                    const tabLabel = `${item.price || '-'}T - ${item.district || item.wardDistrict || 'Chưa có quận'}`;

                    return (
                      <button
                        key={item._tempId}
                        type="button"
                        onClick={() => setActiveTab(index)}
                        className={`group flex min-w-[180px] items-center justify-between gap-2 rounded-t-xl border-x border-t px-3 py-2 text-left text-[11px] font-black transition ${
                          isActive
                            ? 'border-slate-700 bg-slate-900 text-cyan-300'
                            : 'border-transparent text-slate-500 hover:bg-slate-800/70 hover:text-slate-300'
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate">{tabLabel}</span>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] uppercase ${
                            status === 'done' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'
                          }`}
                        >
                          {status}
                        </span>

                        <FiTrash2
                          className="shrink-0 text-red-300 opacity-0 transition group-hover:opacity-100"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeTab(index);
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                {activeItem ? (
                  <div className="flex min-h-0 flex-1 gap-5 overflow-hidden p-4 xl:p-5">
                    <section className="min-w-0 flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-2xl shadow-black/20 [scrollbar-width:thin] xl:p-5">
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Tab hiện tại</p>
                          <h3 className="mt-1 line-clamp-2 break-words text-lg font-black text-slate-100">{activeItem.title || 'Chưa có tiêu đề'}</h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSendToImport}
                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-cyan-200 transition hover:bg-cyan-400/20"
                          >
                            <FiSend />
                            Gán sang Import
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleTabStatus(activeItem._tempId)}
                            className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-wide transition ${
                              (tabStatuses[activeItem._tempId] || 'pending') === 'done'
                                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20'
                                : 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
                            }`}
                          >
                            {(tabStatuses[activeItem._tempId] || 'pending') === 'done' ? 'Done' : 'Pending'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        <div className="xl:col-span-2">
                          <TextField
                            label="Tiêu đề gốc"
                            value={activeItem.title}
                            copyId="title"
                            onChange={(value) => updateField(activeTab, 'title', value)}
                            accentClass="font-black"
                          />
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 xl:col-span-2">
                          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                            <TextField
                              label="File Name"
                              value={activeItem.fileName}
                              copyId="fileName"
                              onChange={(value) => updateField(activeTab, 'fileName', value)}
                            />

                            <TextField
                              label="Diện tích Format"
                              value={activeItem.areaContent}
                              copyId="areaContent"
                              onChange={(value) => updateField(activeTab, 'areaContent', value)}
                            />

                            <TextField
                              label="Giá"
                              value={activeItem.price}
                              copyId="price"
                              onChange={(value) => updateField(activeTab, 'price', value)}
                              accentClass="font-black text-red-300"
                            />

                            <TextField
                              label="Tên đường"
                              value={activeItem.streetName}
                              copyId="streetName"
                              onChange={(value) => updateField(activeTab, 'streetName', value)}
                              accentClass="font-bold text-cyan-200"
                            />

                            <TextField
                              label="Phường, Quận"
                              value={activeItem.wardDistrict}
                              copyId="wardDistrict"
                              onChange={(value) => updateField(activeTab, 'wardDistrict', value)}
                              accentClass="font-bold text-cyan-200"
                            />
                          </div>
                        </div>

                        <div className="xl:col-span-2">
                          <TextField
                            label="TikTok Title"
                            value={activeItem.tiktokTitle}
                            copyId="tiktokTitle"
                            onChange={(value) => updateField(activeTab, 'tiktokTitle', value)}
                            accentClass="font-black"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-5 xl:col-span-2 xl:grid-cols-2">
                          <TextAreaField
                            label="Facebook Post"
                            value={activeItem.facebookPost}
                            copyId="facebookPost"
                            onChange={(value) => updateField(activeTab, 'facebookPost', value)}
                          />

                          <TextAreaField
                            label="Description"
                            value={activeItem.description}
                            copyId="description"
                            onChange={(value) => updateField(activeTab, 'description', value)}
                          />
                        </div>

                        <TextAreaField
                          label="Thumbnail Keys"
                          value={activeItem.tiktokThumbnailKeys}
                          copyId="tiktokThumbnailKeys"
                          onChange={(value) => updateField(activeTab, 'tiktokThumbnailKeys', value)}
                          accentClass="border-amber-400/20 bg-amber-950/30 font-bold text-amber-100"
                        />

                        <TextAreaField
                          label="Voiceover"
                          value={activeItem.voice}
                          copyId="voice"
                          onChange={(value) => updateField(activeTab, 'voice', value)}
                          accentClass="border-blue-400/20 bg-blue-950/30 text-blue-100"
                        />

                        <div className="xl:col-span-2">
                          <TextAreaField
                            label="Input thô"
                            value={activeItem.inputData}
                            copyId="inputData"
                            mono
                            onChange={(value) => updateField(activeTab, 'inputData', value)}
                            accentClass="border-red-400/20 bg-red-950/30 text-red-100"
                          />
                        </div>

                        <div className="xl:col-span-2">
                          <TextAreaField
                            label="Admin Note"
                            value={activeItem.adminNote}
                            copyId="adminNote"
                            mono
                            onChange={(value) => updateField(activeTab, 'adminNote', value)}
                            accentClass="border-emerald-400/20 bg-emerald-950/30 text-emerald-100"
                          />
                        </div>
                      </div>
                    </section>

                    <aside className="hidden w-[440px] min-w-[440px] flex-col gap-4 xl:flex">
                      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-2xl shadow-black/20">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSendToImport}
                              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
                            >
                              <FiSend />
                              ImportModal
                            </button>
                          </div>
                          <div>{renderCopyButton('system-json', systemJsonText)}</div>
                        </div>

                        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-900/80 p-4 font-mono text-[11px] leading-relaxed text-emerald-300 [scrollbar-width:thin]">
                          {systemJsonText}
                        </pre>
                      </div>
                    </aside>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-500">
                <FiPlus size={46} className="mb-4 text-slate-700" />
                <p className="text-xs font-black uppercase tracking-[0.25em]">Workspace trống</p>
                <p className="mt-2 max-w-[420px] text-sm font-medium leading-6 text-slate-600">
                  Hover vào khung JSON bên trái, dán JSON từ AI rồi bấm tạo tab mới. Dữ liệu sẽ được lưu tự động vào localStorage.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
