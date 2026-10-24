'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, Calendar, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import { MedicalPackageItem } from '../data/packages';

interface PackageCardProps {
  pkg: MedicalPackageItem;
  onBookNow: (pkg: MedicalPackageItem) => void;
}

export function PackageCard({ pkg, onBookNow }: PackageCardProps) {
  const [showFullDetails, setShowFullDetails] = useState(false);

  // Format currency
  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const discountPercent = Math.round(
    ((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100,
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Package Header Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <Image
          src={pkg.imageUrl}
          alt={pkg.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {pkg.targetAudience === 'STUDENT_ONLY' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md">
              <GraduationCap className="w-3.5 h-3.5" />
              Đặc quyền SV AGU
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/70 text-white backdrop-blur-xs">
              Mọi độ tuổi
            </span>
          )}
        </div>

        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-md">
            Tiết kiệm {discountPercent}%
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="text-xs text-emerald-200 font-mono font-semibold">{pkg.code}</p>
          <h3 className="text-base font-bold text-white line-clamp-1 drop-shadow-xs">{pkg.name}</h3>
        </div>
      </div>

      {/* Package Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
            {pkg.description}
          </p>

          {/* Included tests/procedures list */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Danh mục khám & xét nghiệm:
            </p>
            <ul className="space-y-1.5">
              {(showFullDetails ? pkg.details.items : pkg.details.items.slice(0, 3)).map(
                (item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ),
              )}
            </ul>

            {pkg.details.items.length > 3 && (
              <button
                type="button"
                onClick={() => setShowFullDetails(!showFullDetails)}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 mt-2 transition-colors cursor-pointer"
              >
                {showFullDetails ? (
                  <>
                    Thu gọn bớt <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Xem thêm {pkg.details.items.length - 3} danh mục khác{' '}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Pricing & Booking action */}
        <div className="pt-4 border-t border-slate-100 mt-2">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <p className="text-[11px] text-slate-400">Giá niêm yết</p>
              <p className="text-xs text-slate-400 line-through">
                {formatVnd(pkg.originalPrice)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-emerald-600 font-medium">Giá ưu đãi đặt trước</p>
              <p className="text-xl font-extrabold text-emerald-600">
                {formatVnd(pkg.price)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onBookNow(pkg)}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            Đặt Lịch Ngay
          </button>
        </div>
      </div>
    </div>
  );
}
