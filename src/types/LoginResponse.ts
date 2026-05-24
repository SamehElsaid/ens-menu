export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  isNew?: boolean;
  phoneVerificationRequired?: boolean;
  user?: {
    email: string;
    id: number;
    name: string;
    profileImage: string | null;
    role: string;
    phoneNumber?: string | null;
    isPhoneVerified?: boolean;
  };
  [key: string]: unknown;
}