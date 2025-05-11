import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // Correct import for Geist Sans from its own package
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = GeistSans({
  subsets: ['latin'],
  variable: '--font-geist-sans', // Define CSS variable for Tailwind
});

export const metadata: Metadata = {
  title: 'Fridge Feast',
  description: 'Generate delicious recipes from ingredients you already have!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="font-sans antialiased"> {/* Use font-sans which will pick up --font-geist-sans if configured in tailwind.config.ts */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
