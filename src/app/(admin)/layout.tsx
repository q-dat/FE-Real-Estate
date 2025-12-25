export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-theme="mytheme">
      <body>
        <div className="flex-1 bg-primary-white selection:bg-primary selection:text-white">{children}</div>
      </body>
    </html>
  );
}
