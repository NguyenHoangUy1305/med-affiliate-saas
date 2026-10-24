'use client';

import React from 'react';

export type CategoryType = 'ALL' | 'sinh-vien' | 'tong-quat' | 'chuyen-sau' | 'nguoi-cao-tuoi';

interface CategoryTabsProps {
  activeCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  counts: Record<CategoryType, number>;
}

export function CategoryTabs({
  activeCategory,
  onSelectCategory,
  counts,
}: CategoryTabsProps) {
  const tabs: { key: CategoryType; label: string }[] = [
    { key: 'ALL', label: 'Tất Cả Gói Khám' },
    { key: 'sinh-vien', label: 'Sinh Viên AGU' },
    { key: 'tong-quat', label: 'Tổng Quát & Lái Xe' },
    { key: 'chuyen-sau', label: 'Tầm Soát Chuyên Sâu' },
    { key: 'nguoi-cao-tuoi', label: 'Người Cao Tuổi' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeCategory === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onSelectCategory(tab.key)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              isActive
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-emerald-700/60 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {counts[tab.key] || 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
