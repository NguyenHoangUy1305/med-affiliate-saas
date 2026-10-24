'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryTabs, CategoryType } from '../components/CategoryTabs';
import { PackageCard } from '../components/PackageCard';
import { HospitalNetwork } from '../components/HospitalNetwork';
import { BookingModal } from '../components/BookingModal';
import { BookingLookupModal } from '../components/BookingLookupModal';
import { Footer } from '../components/Footer';
import { INITIAL_PACKAGES, MedicalPackageItem } from '../data/packages';
import { Calendar, FileCheck, Award, ArrowRight } from 'lucide-react';

export default function StorefrontHomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('ALL');

  // Modal states
  const [selectedPackageForBooking, setSelectedPackageForBooking] =
    useState<MedicalPackageItem | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  // Filter packages
  const filteredPackages = useMemo(() => {
    return INITIAL_PACKAGES.filter((pkg) => {
      // 1. Category Filter
      if (activeCategory !== 'ALL' && pkg.category !== activeCategory) {
        return false;
      }

      // 2. Search Filter
      if (searchTerm.trim().length > 0) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = pkg.name.toLowerCase().includes(query);
        const matchesDesc = pkg.description.toLowerCase().includes(query);
        const matchesCode = pkg.code.toLowerCase().includes(query);
        const matchesDetails = pkg.details.items.some((item) =>
          item.toLowerCase().includes(query),
        );
        if (!matchesName && !matchesDesc && !matchesCode && !matchesDetails) {
          return false;
        }
      }

      return true;
    });
  }, [activeCategory, searchTerm]);

  // Counts per tab
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType, number> = {
      ALL: INITIAL_PACKAGES.length,
      'sinh-vien': 0,
      'tong-quat': 0,
      'chuyen-sau': 0,
      'nguoi-cao-tuoi': 0,
    };

    INITIAL_PACKAGES.forEach((pkg) => {
      counts[pkg.category] = (counts[pkg.category] || 0) + 1;
    });

    return counts;
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Header Navigation */}
      <Header onOpenLookup={() => setIsLookupOpen(true)} />

      {/* 2. Hero Banner with Quick Search */}
      <HeroBanner
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedArea={selectedArea}
        onAreaChange={setSelectedArea}
      />

      {/* 3. Main Packages Section */}
      <main id="goi-kham" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Section Title & Category Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Gói Khám Chuyên Khoa Niêm Yết
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Danh Mục Gói Khám Y Tế Phổ Biến
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Hiển thị {filteredPackages.length} gói khám phù hợp theo nhu cầu của bạn
            </p>
          </div>

          {/* Category Filter Tabs */}
          <CategoryTabs
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            counts={categoryCounts}
          />
        </div>

        {/* Packages Cards Grid */}
        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onBookNow={(item) => setSelectedPackageForBooking(item)}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy gói khám phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục tất cả gói khám.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('ALL');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Xem tất cả gói khám
            </button>
          </div>
        )}

        {/* 4. Quy trình tiếp nhận 3 bước đơn giản */}
        <section id="quy-trinh" className="mt-20 pt-14 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Quy Trình Tiếp Nhận Đơn Giản
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              3 Bước Đi Khám Nhanh Chóng Không Chờ Đợi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center mb-4 text-base">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Chọn Gói & Đặt Lịch</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lựa chọn gói khám, chi nhánh y tế An Giang gần bạn nhất và ngày giờ bạn muốn đến khám.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs relative">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center mb-4 text-base">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Nhận Mã Phiếu Khám</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hệ thống sinh ngay Mã Phiếu Khám Điện Tử duy nhất (Ví dụ: MED-202610-A9X2) và lưu vào
                hồ sơ.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs relative">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center mb-4 text-base">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Tiếp Đón Ưu Tiên Tại Quầy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Khi đến bệnh viện/phòng khám, chỉ cần đưa mã phiếu cho nhân viên tiếp tân để vào thẳng
                phòng khám.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Hospital Network Section (8 Cơ sở y tế An Giang) */}
      <HospitalNetwork />

      {/* 6. Footer */}
      <Footer />

      {/* Booking Modal Popup */}
      <BookingModal
        pkg={selectedPackageForBooking}
        onClose={() => setSelectedPackageForBooking(null)}
      />

      {/* Booking Lookup Modal Popup */}
      <BookingLookupModal isOpen={isLookupOpen} onClose={() => setIsLookupOpen(false)} />
    </div>
  );
}
