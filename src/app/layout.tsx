import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Super Mario PDF Quiz Game',
  description: 'Transform any PDF into an exciting Super Mario-style quiz adventure! Upload your PDF and play through AI-generated questions with classic Mario game mechanics.',
  keywords: 'quiz, game, PDF, education, Mario, AI, interactive learning',
  authors: [{ name: 'Super Mario Quiz Game' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&family=Inter:wght@400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}