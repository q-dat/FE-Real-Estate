export type OtpType = 'verify_email' | 'reset_password';

export interface OtpItem {
  _id: string;
  email: string;
  type: OtpType;
  isUsed: boolean;
  attempts: number;
  expiresAt: string;
  createdAt: string;
}
