import type { Metadata } from 'next';
import LocalFont from 'next/font/local';

import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

import './globals.css';

const fontSans = LocalFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  variable: '--font-sans',
});

const BASE = process.env.DOMAIN_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Quasarzone Hot Deal Discord Bot',
  description:
    '퀘이사존 핫딜 게시판에 새 글이 올라오면 디스코드로 알려주는 디스코드 알림 봇 입니다. 디스코드 서버의 원하는 채널에 WebHook URL 생성후 등록하면 해당 채널에 새 글이 자동으로 전송됩니다.',
  openGraph: {
    images: '/og.png',
  },
  metadataBase: new URL(BASE),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko'>
      <body
        className={cn(
          'bg-background mx-auto min-h-screen max-w-screen-md p-4 font-sans antialiased',
          fontSans.variable,
        )}
      >
        {children}
        <Toaster position='bottom-center' richColors />
      </body>
    </html>
  );
}
