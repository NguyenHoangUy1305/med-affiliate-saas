'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, MapPin, Mail, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                MedSaas<span className="text-emerald-400">.vn</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cổng dịch vụ y tế điện tử kết nối các bệnh viện và phòng khám uy tín tại tỉnh An Giang.
              Giải pháp hỗ trợ người dân và sinh viên tiếp cận dịch vụ chăm sóc sức khỏe chủ động,
              minh bạch và tiện lợi.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Tiếp đón ưu tiên tại quầy cơ sở y tế</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Dịch Vụ Khám Chữa Bệnh
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="#goi-kham" className="hover:text-emerald-400 transition-colors">
                  Khám sức khỏe sinh viên AGU
                </a>
              </li>
              <li>
                <a href="#goi-kham" className="hover:text-emerald-400 transition-colors">
                  Khám sức khỏe cấp bằng lái xe
                </a>
              </li>
              <li>
                <a href="#goi-kham" className="hover:text-emerald-400 transition-colors">
                  Khám tổng quát định kỳ
                </a>
              </li>
              <li>
                <a href="#goi-kham" className="hover:text-emerald-400 transition-colors">
                  Tầm soát tim mạch & tiểu đường
                </a>
              </li>
              <li>
                <a href="#goi-kham" className="hover:text-emerald-400 transition-colors">
                  Tầm soát dấu ấn ung thư sớm
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Healthcare Network in An Giang */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Chi Nhánh Y Tế An Giang
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• BV Đa khoa Trung tâm An Giang (Long Xuyên)</li>
              <li>• BV Đa khoa Khu vực Châu Đốc (Châu Đốc)</li>
              <li>• PK Đa khoa Hạnh Phúc (Long Xuyên)</li>
              <li>• PK Đa khoa Sài Gòn An Giang (Long Xuyên)</li>
              <li>• BV Đa khoa Khu vực Tân Châu (Tân Châu)</li>
              <li>• TTYT Thoại Sơn, Chợ Mới, Tri Tôn</li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Hỗ Trợ & Khẩn Cấp
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>TP. Long Xuyên, Tỉnh An Giang</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hotline y tế: 0296.3852.777</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>hotro@medsaas.vn</span>
              </p>
              <div className="pt-2">
                <a
                  href="http://localhost:3001/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Cổng Tài Liệu API Backend
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 MedSaas An Giang. Dự án Nền tảng Dịch vụ Y tế & Tiếp thị Tiếp tân Y khoa.</p>
          <p className="flex items-center gap-1">
            Phát triển bởi <strong className="text-slate-400">Nguyễn Hoàng Uy</strong> với{' '}
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> vì sức khỏe cộng
            đồng An Giang.
          </p>
        </div>
      </div>
    </footer>
  );
}
