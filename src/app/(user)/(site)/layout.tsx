'use client';
import { useEffect, useState } from 'react';
import ContactForm from '@/components/userPage/ContactForm';
import Header from '@/components/userPage/Header';
import FooterFC from '@/components/userPage/FooterFC';
import { RentalFavoriteProvider } from '@/context/RentalFavoriteContext';
import { MeResponse } from '@/types/auth/auth.types';
import { authService } from '@/services/auth/auth.service';
import { UserAuthProvider } from '@/context/UserAuthContext';
import { ACCESS_TOKEN_KEY } from '@/app/(auth)';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeResponse['data'] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchMe = async () => {
      const token = localStorage.getItem(`${ACCESS_TOKEN_KEY}`);
      if (!token) return;

      try {
        const res = await authService.me(token);
        if (!cancelled) {
          setUser(res.data);
        }
      } catch {
        if (!cancelled) setUser(null);
      }
    };

    fetchMe();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RentalFavoriteProvider>
      <UserAuthProvider>
        <div className="flex min-h-screen flex-col bg-primary-white">
          <Header user={user!} />
          <main className="flex-1 bg-primary-white selection:bg-primary selection:text-white">{children}</main>
          {/* <NavBottom /> */}
          <ContactForm />
          <FooterFC />
        </div>
      </UserAuthProvider>
    </RentalFavoriteProvider>
  );
}
