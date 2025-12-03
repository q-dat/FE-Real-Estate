import './globals.css';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from '@/components/orther/error/ErrorBoundary';
import ScrollToTopButton from '@/components/orther/scrollToTop/ScrollToTopButton';
import ContactForm from '@/components/userPage/ContactForm';
// import NotificationPopup from '@/components/userPage/NotificationPopup';
import { Inter, Roboto_Mono } from 'next/font/google';
import CustomCursor from '@/components/userPage/CustomCursor';
import FooterFC from '@/components/userPage/FooterFC';
import Header from '@/components/userPage/Header';
import { RentalFavoriteProvider } from '@/context/RentalFavoriteContext';
import { homeMetadata } from '@/metadata/homeMetadata';

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
      <head>
        {/* Script Google SWG */}
        {/* <script async type="application/javascript" src="https://news.google.com/swg/js/v1/swg-basic.js"></script>
        <script>
          {`
            (function() {
              try {
                (self.SWG_BASIC = self.SWG_BASIC || []).push(basicSubscriptions => {
                  basicSubscriptions.init({
                    type: "NewsArticle",
                    isPartOfType: ["Product"],
                    isPartOfProductId: "CAowlNO8DA:openaccess",
                    clientOptions: { theme: "light", lang: "vi" }
                  });
                  // Thêm title cho iframe để cải thiện khả năng tiếp cận
                  const iframe = document.querySelector('iframe[src*="news.google.com"]');
                  if (iframe) {
                    iframe.setAttribute('title', 'Dịch vụ đăng ký Google');
                    }
                    });
                    } catch (error) {
                      console.error('SWG initialization failed:', error);
                      }
                      })();
                      `}
        </script> */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <RentalFavoriteProvider>
            <CustomCursor />
            <ToastContainer style={{ marginTop: '80px' }} />
            <div className="flex min-h-screen flex-col bg-primary-white">
              <Header />
              <div className="flex-1 bg-primary-white selection:bg-primary selection:text-white xl:pt-0">{children}</div>
              {/* <NotificationPopup /> */}
              <ScrollToTopButton />
              {/* <NavBottom /> */}
              <ContactForm />
              <FooterFC />
            </div>
          </RentalFavoriteProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
