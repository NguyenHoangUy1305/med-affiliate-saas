'use client';

import React from 'react';
import { MapPin, Phone, Building2, CheckCircle2 } from 'lucide-react';
import { AN_GIANG_HOSPITALS } from '../data/packages';

export function HospitalNetwork() {
  return (
    <section id="co-so-y-te" className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            Mạng Lưới Y Tế An Giang
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            8 Cơ Sở Y Tế Uy Tín Tiếp Nhận Khám
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Hệ thống liên kết trực tiếp với các bệnh viện đa khoa tuyến tỉnh, phòng khám đạt chuẩn và
            trung tâm y tế các huyện để phục vụ người dân thuận tiện nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {AN_GIANG_HOSPITALS.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {hospital.type}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {hospital.area}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2 leading-snug">
                  {hospital.name}
                </h3>

                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{hospital.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <a
                      href={`tel:${hospital.phone}`}
                      className="text-emerald-700 font-medium hover:underline"
                    >
                      {hospital.phone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đang tiếp nhận
                </span>
                <span>06:30 - 17:00</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
