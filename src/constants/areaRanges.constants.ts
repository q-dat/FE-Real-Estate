export interface AreaRange {
  label: string;
  min?: number;
  max?: number;
}

export const AREA_RANGES: AreaRange[] = [
  { label: 'Tất cả', min: undefined, max: undefined },
  { label: 'Dưới 30m²', min: 0, max: 30 },
  { label: '30 - 50m²', min: 30, max: 50 },
  { label: '50 - 80m²', min: 50, max: 80 },
  { label: '80 - 100m²', min: 80, max: 100 },
  { label: '100 - 150m²', min: 100, max: 150 },
  { label: '150 - 200m²', min: 150, max: 200 },
  { label: '200 - 300m²', min: 200, max: 300 },
  { label: '300 - 500m²', min: 300, max: 500 },
  { label: '500 - 700m²', min: 500, max: 700 },
  { label: '700 - 900m²', min: 700, max: 900 },
  { label: 'Trên 1000m²', min: 1000, max: 9999 },
];
