export interface MedicalPackageItem {
  id: string;
  code: string;
  name: string;
  slug: string;
  originalPrice: number;
  price: number;
  description: string;
  targetAudience: 'ALL' | 'STUDENT_ONLY';
  category: 'sinh-vien' | 'tong-quat' | 'chuyen-sau' | 'nguoi-cao-tuoi';
  imageUrl: string;
  details: {
    items: string[];
  };
}

export const INITIAL_PACKAGES: MedicalPackageItem[] = [
  {
    id: 'pkg-student-standard',
    code: 'MED-SV-01',
    name: 'Gói Khám Sức Khỏe Sinh Viên AGU Chuẩn',
    slug: 'kham-suc-khoe-sinh-vien-agu',
    originalPrice: 250000,
    price: 199000,
    description: 'Khám thể lực, thị lực, tai mũi họng, chụp X-quang tim phổi và xét nghiệm máu cơ bản phục vụ nhập học, thực tập và bảo vệ tốt nghiệp.',
    targetAudience: 'STUDENT_ONLY',
    category: 'sinh-vien',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    details: {
      items: [
        'Khám thể lực toàn diện (chiều cao, cân nặng, BMI, huyết áp)',
        'Khám thị lực, thị giác màu và khúc xạ mắt',
        'Khám nội khoa, tai mũi họng, răng hàm mặt, da liễu',
        'Chụp X-quang tim phổi kỹ thuật số (DR)',
        'Tổng phân tích tế bào máu ngoại vi (18 thông số)',
      ],
    },
  },
  {
    id: 'pkg-it-spine',
    code: 'MED-VP-02',
    name: 'Gói Tầm Soát Cột Sống Dân IT & Văn Phòng',
    slug: 'tam-soat-cot-song-dan-it-van-phong',
    originalPrice: 350000,
    price: 250000,
    description: 'Chẩn đoán sớm thoái hóa đốt sống cổ, đau lưng mạn tính, hội chứng ống cổ tay và các bệnh lý cơ xương khớp do ngồi làm việc máy tính kéo dài.',
    targetAudience: 'ALL',
    category: 'chuyen-sau',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    details: {
      items: [
        'Bác sĩ chuyên khoa chấn thương chỉnh hình thăm khám lâm sàng',
        'Chụp X-quang cột sống cổ thẳng - nghiêng',
        'Chụp X-quang cột sống thắt lưng thẳng - nghiêng',
        'Đo tốc độ dẫn truyền thần kinh ngoại biên (tầm soát hội chứng ống cổ tay)',
        'Tư vấn bài tập vật lý trị liệu phục hồi chức năng',
      ],
    },
  },
  {
    id: 'pkg-driver-standard',
    code: 'MED-LX-03',
    name: 'Gói Khám Cấp Giấy Phép Lái Xe Chuẩn Bộ Y Tế',
    slug: 'kham-giay-phep-lai-xe-chuan-byt',
    originalPrice: 400000,
    price: 299000,
    description: 'Khám sức khỏe lái xe các hạng A1, A2, B1, B2, C theo Thông tư liên tịch Bộ Y tế & Bộ Giao thông Vận tải.',
    targetAudience: 'ALL',
    category: 'tong-quat',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    details: {
      items: [
        'Khám tâm thần, thần kinh và kiểm tra phản xạ vận động',
        'Kiểm tra thị lực ban ngày và thị lực trong bóng tối',
        'Xét nghiệm định tính 4 nhóm chất gây nghiện trong nước tiểu (Morphin/Heroin, Amphetamin, Methamphetamin, Cần sa)',
        'Xét nghiệm nồng độ cồn trong máu hoặc hơi thở',
        'Cấp giấy khám sức khỏe lái xe có dán ảnh và đóng dấu giáp lai',
      ],
    },
  },
  {
    id: 'pkg-general-standard',
    code: 'MED-TQ-04',
    name: 'Gói Khám Sức Khỏe Tổng Quát Tiêu Chuẩn',
    slug: 'kham-tong-quat-tieu-chuan',
    originalPrice: 700000,
    price: 590000,
    description: 'Đánh giá chức năng gan, thận, đường huyết, mỡ máu, siêu âm bụng tổng quát và kiểm tra sức khỏe định kỳ hàng năm.',
    targetAudience: 'ALL',
    category: 'tong-quat',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    details: {
      items: [
        'Khám nội tổng quát và tư vấn bệnh sử gia đình',
        'Siêu âm màu ổ bụng tổng quát (gan, mật, tụy, lách, thận, bàng quang)',
        'Xét nghiệm đường huyết lúc đói (Glucose máu)',
        'Định lượng Cholesterol toàn phần và Triglyceride',
        'Đo men gan AST (GOT) và ALT (GPT)',
        'Đo chức năng thận Ure và Creatinine máu',
      ],
    },
  },
  {
    id: 'pkg-cardio-screen',
    code: 'MED-TM-05',
    name: 'Gói Tầm Soát Tim Mạch & Huyết Áp Toàn Diện',
    slug: 'tam-soat-tim-mach-toan-dien',
    originalPrice: 1200000,
    price: 890000,
    description: 'Phát hiện sớm xơ vữa động mạch, rối loạn nhịp tim, thiếu máu cơ tim cục bộ và đánh giá nguy cơ tai biến đột quỵ.',
    targetAudience: 'ALL',
    category: 'chuyen-sau',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    details: {
      items: [
        'Điện tâm đồ (ECG) 12 chuyển đạo ghi nhận nhịp tim lúc nghỉ',
        'Siêu âm tim Doppler màu khảo sát van tim và chức năng co bóp thất trái',
        'Bộ bilan lipid máu chuyên sâu (Cholesterol, Triglyceride, HDL-C, LDL-C)',
        'Xét nghiệm điện giải đồ (Na, K, Cl) kiểm soát huyết áp',
        'Khám chuyên khoa nội tim mạch và lập phác đồ dự phòng',
      ],
    },
  },
  {
    id: 'pkg-digestive-liver',
    code: 'MED-TH-06',
    name: 'Gói Tầm Soát Bệnh Lý Tiêu Hóa & Viêm Gan',
    slug: 'tam-soat-tieu-hoa-viem-gan',
    originalPrice: 1100000,
    price: 750000,
    description: 'Tầm soát viêm gan siêu vi B, C, vi khuẩn dạ dày HP và các bệnh lý đường tiêu hóa phổ biến tại miền Tây Nam Bộ.',
    targetAudience: 'ALL',
    category: 'chuyen-sau',
    imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80',
    details: {
      items: [
        'Siêu âm gan mật tụy độ phân giải cao',
        'Test hơi thở C13 tầm soát vi khuẩn Helicobacter Pylori (HP dạ dày)',
        'Xét nghiệm viêm gan B (HBsAg định tính)',
        'Xét nghiệm viêm gan C (Anti-HCV định tính)',
        'Xét nghiệm men gan chuyên sâu (GGT, AST, ALT)',
      ],
    },
  },
  {
    id: 'pkg-elderly-care',
    code: 'MED-NCT-07',
    name: 'Gói Khám Sức Khỏe Chuyên Sâu Người Cao Tuổi',
    slug: 'kham-chuyen-sau-nguoi-cao-tuoi',
    originalPrice: 1900000,
    price: 1350000,
    description: 'Tầm soát loãng xương, nguy cơ đột quỵ não, bệnh lý tuyến giáp và suy giảm chức năng đa cơ quan ở người cao tuổi.',
    targetAudience: 'ALL',
    category: 'nguoi-cao-tuoi',
    imageUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=800&q=80',
    details: {
      items: [
        'Đo mật độ xương bằng phương pháp DEXA (cột sống & cổ xương đùi)',
        'Siêu âm Doppler động mạch cảnh tầm soát nguy cơ đột quỵ',
        'Xét nghiệm chức năng tuyến giáp (TSH, FT4)',
        'Bộ xét nghiệm chức năng gan, thận, điện giải đồ (Na, K, Cl)',
        'Tổng phân tích nước tiểu và tế bào máu toàn phần',
      ],
    },
  },
  {
    id: 'pkg-cancer-screen',
    code: 'MED-UT-08',
    name: 'Gói Tầm Soát Dấu Ấn Ung Thư Sớm Toàn Diện',
    slug: 'tam-soat-dau-an-ung-thu-co-ban',
    originalPrice: 2400000,
    price: 1600000,
    description: 'Tầm soát sớm các dấu ấn chỉ điểm khối u phổ biến: gan (AFP), phổi (CEA, Cyfra 21-1), đại tràng (CA 19-9), tiền liệt tuyến / buồng trứng.',
    targetAudience: 'ALL',
    category: 'chuyen-sau',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
    details: {
      items: [
        'Định lượng dấu ấn ung thư gan AFP',
        'Định lượng dấu ấn ung thư đường tiêu hóa & phổi CEA',
        'Định lượng dấu ấn ung thư tụy & đại trực tràng CA 19-9',
        'Định lượng Cyfra 21-1 (tầm soát ung thư phổi)',
        'Định lượng PSA toàn phần (Nam) hoặc CA 125 & CA 15-3 (Nữ)',
        'Siêu âm ổ bụng & X-quang tim phổi kiểm tra tổn thương',
      ],
    },
  },
];

export interface HospitalTenant {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  type: 'Bệnh viện Đa khoa' | 'Phòng khám Đa khoa' | 'Trung tâm Y tế';
  area: 'Long Xuyên' | 'Châu Đốc' | 'Tân Châu' | 'Huyện';
}

export const AN_GIANG_HOSPITALS: HospitalTenant[] = [
  {
    id: 'tenant-ag-lx',
    code: 'BV-DK-AG',
    name: 'Bệnh viện Đa khoa Trung tâm An Giang',
    address: '02 Lê Lợi, P. Mỹ Bình, TP. Long Xuyên, Tỉnh An Giang',
    phone: '02963852777',
    type: 'Bệnh viện Đa khoa',
    area: 'Long Xuyên',
  },
  {
    id: 'tenant-chau-doc',
    code: 'BV-CD',
    name: 'Bệnh viện Đa khoa Khu vực Châu Đốc',
    address: 'Khu dân cư P. Vĩnh Mỹ, TP. Châu Đốc, Tỉnh An Giang',
    phone: '02963866388',
    type: 'Bệnh viện Đa khoa',
    area: 'Châu Đốc',
  },
  {
    id: 'tenant-pk-hp',
    code: 'PK-HP-LX',
    name: 'Phòng khám Đa khoa Hạnh Phúc Long Xuyên',
    address: '312/1 Trần Hưng Đạo, P. Mỹ Phước, TP. Long Xuyên, Tỉnh An Giang',
    phone: '02963955588',
    type: 'Phòng khám Đa khoa',
    area: 'Long Xuyên',
  },
  {
    id: 'tenant-pk-sg',
    code: 'PK-SG-LX',
    name: 'Phòng khám Đa khoa Sài Gòn An Giang',
    address: '39B Hà Hoàng Hổ, P. Mỹ Xuyên, TP. Long Xuyên, Tỉnh An Giang',
    phone: '02963943456',
    type: 'Phòng khám Đa khoa',
    area: 'Long Xuyên',
  },
  {
    id: 'tenant-tan-chau',
    code: 'BV-TC',
    name: 'Bệnh viện Đa khoa Khu vực Tân Châu',
    address: 'Đường Nguyễn Tri Phương, TX. Tân Châu, Tỉnh An Giang',
    phone: '02963822233',
    type: 'Bệnh viện Đa khoa',
    area: 'Tân Châu',
  },
  {
    id: 'tenant-thoai-son',
    code: 'TTYT-TS',
    name: 'Trung tâm Y tế Huyện Thoại Sơn',
    address: 'Thị trấn Núi Sập, Huyện Thoại Sơn, Tỉnh An Giang',
    phone: '02963879245',
    type: 'Trung tâm Y tế',
    area: 'Huyện',
  },
  {
    id: 'tenant-cho-moi',
    code: 'TTYT-CM',
    name: 'Trung tâm Y tế Huyện Chợ Mới',
    address: 'Thị trấn Chợ Mới, Huyện Chợ Mới, Tỉnh An Giang',
    phone: '02963883234',
    type: 'Trung tâm Y tế',
    area: 'Huyện',
  },
  {
    id: 'tenant-tri-ton',
    code: 'TTYT-TT',
    name: 'Trung tâm Y tế Huyện Tri Tôn',
    address: 'Thị trấn Tri Tôn, Huyện Tri Tôn, Tỉnh An Giang',
    phone: '02963874115',
    type: 'Trung tâm Y tế',
    area: 'Huyện',
  },
];
