import './globals.css';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from '@/components/orther/error/ErrorBoundary';
import ScrollToTopButton from '@/components/orther/scrollToTop/ScrollToTopButton';
import { Inter, Roboto_Mono } from 'next/font/google';
import CustomCursor from '@/components/userPage/CustomCursor';
import { homeMetadata } from '@/metadata/home.metadata';

const geistSans = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // Giảm CLS
});

const geistMono = Roboto_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap', // Giảm CLS
});

export const metadata = homeMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-theme="mytheme">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <CustomCursor />
          <ToastContainer style={{ marginTop: '80px' }} />
          <div className="flex min-h-screen flex-col bg-primary-white">
            <div className="flex-1 bg-primary-white selection:bg-primary selection:text-white xl:pt-0">{children}</div>
            <ScrollToTopButton />
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
