export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  profile: {
    avatar?: File;
    displayName?: string;
    username?: string;
    aboutMe?: string;
    instagram?: string;
    messenger?: string;
    facebook?: string;
    viberNumber?: string;
    phoneNumber?: string;
    zaloNumber?: string;
  };
}

export interface AuthResponse {
  message: string;
  data: {
    id: string;
    email: string;
    role: 'admin' | 'user';
    profile: { avatar?: string };
    token?: string;
  };
}

export interface ProfileResponse {
  message: string;
  data: {
    id: string;
    email: string;
    profile: {
      avatar?: string;
      displayName?: string;
      username?: string;
      aboutMe?: string;
      instagram?: string;
      messenger?: string;
      facebook?: string;
      viberNumber?: string;
      phoneNumber?: string;
      zaloNumber?: string;
    };
  };
}
export interface MeResponse {
  message: string;
  data: {
    id: string;
    email: string;
    role: 'admin' | 'user';
    profile: {
      avatar?: string;
      displayName?: string;
      username?: string;
      aboutMe?: string;
      instagram?: string;
      messenger?: string;
      facebook?: string;
      viberNumber?: string;
      phoneNumber?: string;
      zaloNumber?: string;
    };
  };
}
