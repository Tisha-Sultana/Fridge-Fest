import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// The GeistSans object imported from 'geist/font/sans' is already configured.
// It's not a function to be called. We use its .variable property directly.

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
    <html lang="en" className={GeistSans.variable}> {/* Use GeistSans.variable directly */}
      <body className="font-sans antialiased"> {/* font-sans uses the CSS variable defined by GeistSans.variable */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
