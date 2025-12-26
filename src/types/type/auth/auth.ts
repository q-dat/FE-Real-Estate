export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  avatar?: File;
  phoneNumber?: string;
  zaloNumber?: string;
}

export interface AuthResponse {
  message: string;
  data: {
    id: string;
    email: string;
    role: 'admin' | 'user';
    avatar?: string;
    token?: string;
  };
}

export interface ProfileResponse {
  message: string;
  data: {
    id: string;
    email: string;
    avatar?: string;
    phoneNumber?: string;
    zaloNumber?: string;
  };
}
export interface MeResponse {
  message: string;
  data: {
    id: string;
    email: string;
    role: 'admin' | 'user';
    avatar?: string;
  };
}
