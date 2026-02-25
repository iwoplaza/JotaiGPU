import { Inter, Afacad } from 'next/font/google';
import { Provider } from '@/components/provider';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const afacad = Afacad({
  subsets: ['latin'],
  variable: '--font-afacad',
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${inter.variable} ${afacad.variable} ${inter.className}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
