import ContactForm from '@/components/userPage/ContactForm';
import FooterFC from '@/components/userPage/FooterFC';
import Header from '@/components/userPage/Header';
import { RentalFavoriteProvider } from '@/context/RentalFavoriteContext';
import { homeMetadata } from '@/metadata/homeMetadata';

export const metadata = homeMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <RentalFavoriteProvider>
        <div className="flex min-h-screen flex-col bg-primary-white">
          <Header />
          <div className="flex-1 bg-primary-white selection:bg-primary selection:text-white xl:pt-0">{children}</div>
          {/* <NavBottom /> */}
          <ContactForm />
          <FooterFC />
        </div>
      </RentalFavoriteProvider>
    </div>
  );
}
