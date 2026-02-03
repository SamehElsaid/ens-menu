export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
    email: string;
    id: number;
    name: string;
    profileImage: string | null;
    role: string;
  };
  [key: string]: unknown;
}