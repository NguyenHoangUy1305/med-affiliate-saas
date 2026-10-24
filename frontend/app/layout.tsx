import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MedSaas An Giang - Cổng Đặt Lịch Y Tế & Chăm Sóc Sức Khỏe Trực Tuyến',
  description:
    'Nền tảng đặt lịch khám và tầm soát sức khỏe liên kết 8 Bệnh viện & Trung tâm Y tế hàng đầu tỉnh An Giang. Ưu tiên tiếp đón tại quầy, chi phí niêm yết minh bạch, bảo mật thông tin hồ sơ y tế.',
  keywords: [
    'khám bệnh An Giang',
    'bệnh viện đa khoa trung tâm An Giang',
    'đặt lịch khám Châu Đốc',
    'khám sức khỏe sinh viên AGU',
    'MedSaas An Giang',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800">{children}</body>
    </html>
  );
}
