'use client';

import React from 'react';
import { Search, ShieldCheck, Clock, Users, Building, ChevronRight } from 'lucide-react';

interface HeroBannerProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedArea: string;
  onAreaChange: (area: string) => void;
}

export function HeroBanner({
  searchTerm,
  onSearchChange,
  selectedArea,
  onAreaChange,
}: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white pt-10 pb-16 border-b border-slate-200">
      {/* Subtle decorative circles */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-200/25 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium mb-6">
            <Building className="w-4 h-4 text-emerald-600" />
            Liên kết 8 Bệnh viện & Trung tâm Y tế hàng đầu An Giang
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
            Đặt Lịch Khám & Chăm Sóc Sức Khỏe{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Chủ Động Tại An Giang
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Đặt lịch khám nhanh chóng, xem trước danh mục xét nghiệm minh bạch, tiếp đón ưu tiên tại
            quầy tiếp đón và nhận ưu đãi đặc quyền cho sinh viên Đại học An Giang.
          </p>

          {/* Search & Area Filter Bar */}
          <div className="mt-8 bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm gói khám (Sinh viên, Tim mạch, Cột sống, Lái xe...)"
                className="w-full pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="sm:w-56 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3 flex items-center">
              <select
                value={selectedArea}
                onChange={(e) => onAreaChange(e.target.value)}
                aria-label="Chọn khu vực khám y tế"
                className="w-full py-3 px-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
              >
                <option value="ALL">Toàn tỉnh An Giang</option>
                <option value="Long Xuyên">Khu vực TP. Long Xuyên</option>
                <option value="Châu Đốc">Khu vực TP. Châu Đốc</option>
                <option value="Tân Châu">Khu vực TX. Tân Châu</option>
                <option value="Huyện">Các Huyện (Thoại Sơn, Chợ Mới, Tri Tôn)</option>
              </select>
            </div>

            <a
              href="#goi-kham"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              Xem Gói Khám
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* 3 Core Trust Badges */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Tiếp nhận nhanh</p>
                <p className="text-sm font-semibold text-slate-800">Không chờ bốc số</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Giá niêm yết</p>
                <p className="text-sm font-semibold text-slate-800">100% minh bạch</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Đặc quyền sinh viên</p>
                <p className="text-sm font-semibold text-slate-800">Ưu đãi trường AGU</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
