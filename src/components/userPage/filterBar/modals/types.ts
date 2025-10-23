export interface BaseLocationModalProps {
  onClose: () => void;
  onSelect?: (value: { province: string; district: string }) => void;
}
export interface BasePropertyTypeModalProps {
  onClose: () => void;
  onSelect?: (value: string) => void; 
}