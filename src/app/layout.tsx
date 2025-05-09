'use client';
import './globals.css';
import { ThemeProvider } from '@/components/theme-providers';
import { Space_Grotesk } from 'next/font/google';
import { useState, useEffect } from 'react';
import Loader from '@/components/ui/Loader2';
import SidebarLayout from '@/components/layout/SidebarLayout'; // Import SidebarLayout

const inter = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '700'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const timeout = setTimeout(() => setLoading(false), 1500);
  //   return () => clearTimeout(timeout);
  // }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {/* {loading ? (
          <Loader />
        ) : ( */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div >
              {/* Sidebar is now included in the RootLayout */}
              <SidebarLayout children= {children}/> {/* Pass the children to SidebarLayout */}
            </div>
          </ThemeProvider>
        {/* )} */}
      </body>
    </html>
  );
}
