import { Inter, Poppins } from 'next/font/google';
import localFont from 'next/font/local';

export const satoshi = localFont({
  src: '../styles/Satoshi-Variable.woff2',
  variable: '--font-satoshi',
  weight: '300 900',
  display: 'swap',
  style: 'normal',
});

// export const inter = Inter({
//   variable: '--font-inter',
//   subsets: ['latin'],
// });

export const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});
