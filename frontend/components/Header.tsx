'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Search, FileText, UserPlus, ShieldPlus, Menu, X, Building2 } from 'lucide-react';

interface HeaderProps {
  onOpenLookup?: () => void;
}

export function Header({ onOpenLookup }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      {/* Top emergency announcement bar */}
      <div className="bg-emerald-700 text-white text-xs sm:text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            <p className="font-medium">
              Cổng Y tế An Giang: Tiếp đón ưu tiên tại quầy cho bệnh nhân đặt lịch trực tuyến
            </p>
          </div>
          <div className="flex items-center gap-4 text-emerald-100 text-xs">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Tổng đài tư vấn: <strong className="text-white">0296.3852.777</strong>
            </span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">Giờ làm việc: 06:30 - 17:00 (Thứ 2 - Chủ Nhật)</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <ShieldPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  MedSaas<span className="text-emerald-600 font-extrabold">.vn</span>
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  An Giang
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Cổng Đặt Lịch Y Tế & Chăm Sóc Sức Khỏe
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <a href="#goi-kham" className="hover:text-emerald-600 transition-colors">
              Gói Khám Y Tế
            </a>
            <a href="#co-so-y-te" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              8 Cơ Sở Y Tế
            </a>
            <a href="#quy-trinh" className="hover:text-emerald-600 transition-colors">
              Quy Trình Khám
            </a>
            <button
              onClick={onOpenLookup}
              className="text-slate-700 hover:text-emerald-600 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              Tra Cứu Phiếu Hẹn
            </button>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onOpenLookup}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-slate-600" />
              Kiểm tra mã đặt lịch
            </button>
            <a
              href="http://localhost:3001/api/docs"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Cộng Tác Viên
            </a>
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Mở menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-700">
            <a
              href="#goi-kham"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700"
            >
              Danh sách Gói Khám Y Tế
            </a>
            <a
              href="#co-so-y-te"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700"
            >
              Mạng lưới 8 Cơ Sở Y Tế An Giang
            </a>
            <a
              href="#quy-trinh"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700"
            >
              Quy Trình Tiếp Nhận Khám
            </a>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenLookup) onOpenLookup();
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Tra Cứu Phiếu Hẹn Điện Tử
            </button>
          </nav>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="tel:02963852777"
              className="w-full py-2.5 px-4 text-center rounded-lg bg-emerald-600 text-white font-medium text-sm flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Gọi Hotline Cấp Cứu: 0296.3852.777
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
