import { PrismaClient, Role, OrderStatus, CommissionStatus, TransactionType, WithdrawalStatus, PaymentMethod, TargetAudience } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Hàm chuẩn hóa chuỗi để so sánh họ tên tiếng Việt
function normalizeVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '');
}

interface ParsedStudent {
  mssv: string;
  hoLot: string;
  ten: string;
  fullName: string;
  maLop: string;
  sdt: string;
  email: string;
}

function parseXlsFile(filePath: string): ParsedStudent[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] Không tìm thấy file: ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf16le');
  const rows: ParsedStudent[] = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch: RegExpExecArray | null;

  while ((trMatch = trRegex.exec(content)) !== null) {
    const rowHtml = trMatch[1];
    if (rowHtml.includes('<th')) continue;

    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let tdMatch: RegExpExecArray | null;
    const cells: string[] = [];

    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      const text = tdMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      cells.push(text);
    }

    if (cells.length >= 5) {
      const mssv = cells[1];
      const hoLot = cells[2];
      const ten = cells[3];
      const maLop = cells[4];
      const rawSdt = cells[6] ? cells[6].trim() : '';
      const email = cells[7] ? cells[7].trim() : (mssv ? `${mssv.toLowerCase()}@agu.edu.vn` : '');
      const fullName = `${hoLot} ${ten}`.trim();

      // Giả lập số điện thoại hợp lệ nếu sinh viên chưa có trong file
      const sdt = rawSdt || `0981${mssv.replace(/\D/g, '').padEnd(6, '0').slice(0, 6)}`;

      if (mssv && hoLot && ten) {
        rows.push({ mssv, hoLot, ten, fullName, maLop, sdt, email });
      }
    }
  }

  return rows;
}

async function main() {
  console.log('🚀 [SEED] Bắt đầu khởi tạo dữ liệu cho hệ thống MedAffiliate SaaS...');

  // 1. Dọn dẹp dữ liệu cũ (Clean Slate theo thứ tự phụ thuộc khóa ngoại)
  console.log('🧹 [1/8] Xóa dữ liệu cũ...');
  await prisma.walletTransaction.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.order.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.medicalPackage.deleteMany();
  await prisma.commissionTier.deleteMany();
  await prisma.tenant.deleteMany();

  // 2. Hash mật khẩu chung cho tất cả tài khoản
  console.log('🔐 [2/8] Tạo mật khẩu mã hóa chuẩn (MedSaas@2026)...');
  const commonPasswordHash = await bcrypt.hash('MedSaas@2026', 10);

  // 3. Khởi tạo 8 Bệnh viện & Phòng khám tại An Giang (Tenants)
  console.log('🏥 [3/8] Khởi tạo 8 Chi nhánh Y tế tại tỉnh An Giang...');
  const tenantsData = [
    {
      code: 'BV-AG-LX',
      name: 'Bệnh viện Đa khoa Trung tâm An Giang',
      address: '60 Ung Văn Khiêm, P. Mỹ Phước, TP. Long Xuyên, Tỉnh An Giang',
      phone: '02963834646',
    },
    {
      code: 'BV-CD',
      name: 'Bệnh viện Đa khoa Khu vực Châu Đốc',
      address: 'Đường Lê Lợi, P. Châu Phú B, TP. Châu Đốc, Tỉnh An Giang',
      phone: '02963562708',
    },
    {
      code: 'PK-HP-LX',
      name: 'Phòng khám Đa khoa Hạnh Phúc Long Xuyên',
      address: '312/1 Trần Hưng Đạo, P. Mỹ Phước, TP. Long Xuyên, Tỉnh An Giang',
      phone: '02963955588',
    },
    {
      code: 'PK-SG-LX',
      name: 'Phòng khám Đa khoa Sài Gòn An Giang',
      address: '39B Hà Hoàng Hổ, P. Mỹ Xuyên, TP. Long Xuyên, Tỉnh An Giang',
      phone: '02963943456',
    },
    {
      code: 'BV-TC',
      name: 'Bệnh viện Đa khoa Khu vực Tân Châu',
      address: 'Đường Nguyễn Tri Phương, TX. Tân Châu, Tỉnh An Giang',
      phone: '02963822233',
    },
    {
      code: 'TTYT-TS',
      name: 'Trung tâm Y tế Huyện Thoại Sơn',
      address: 'Thị trấn Núi Sập, Huyện Thoại Sơn, Tỉnh An Giang',
      phone: '02963879245',
    },
    {
      code: 'TTYT-CM',
      name: 'Trung tâm Y tế Huyện Chợ Mới',
      address: 'Thị trấn Chợ Mới, Huyện Chợ Mới, Tỉnh An Giang',
      phone: '02963883234',
    },
    {
      code: 'TTYT-TT',
      name: 'Trung tâm Y tế Huyện Tri Tôn',
      address: 'Thị trấn Tri Tôn, Huyện Tri Tôn, Tỉnh An Giang',
      phone: '02963874115',
    },
  ];

  const tenantMap = new Map<string, string>();
  for (const t of tenantsData) {
    const created = await prisma.tenant.create({ data: t });
    tenantMap.set(t.code, created.id);
  }

  // 4. Khởi tạo 3 Bậc Hoa hồng (Commission Tiers)
  console.log('📈 [4/8] Thiết lập 3 Bậc hoa hồng đa cấp...');
  await prisma.commissionTier.createMany({
    data: [
      {
        tierLevel: 1,
        name: 'Đồng (Bronze)',
        minOrders: 1,
        maxOrders: 5,
        commissionRate: 0.1000, // 10%
      },
      {
        tierLevel: 2,
        name: 'Bạc (Silver)',
        minOrders: 6,
        maxOrders: 15,
        commissionRate: 0.1200, // 12%
      },
      {
        tierLevel: 3,
        name: 'Vàng (Gold)',
        minOrders: 16,
        maxOrders: null,
        commissionRate: 0.1500, // 15%
      },
    ],
  });

  // 5. Khởi tạo 8 Gói khám sức khỏe thực tế
  console.log('🩺 [5/8] Khởi tạo 8 Gói khám sức khỏe & tầm soát y khoa...');
  const packagesData = [
    {
      code: 'MED-SV-01',
      name: 'Gói Khám Sức Khỏe Sinh Viên Đại Học An Giang',
      slug: 'kham-suc-khoe-sinh-vien-agu',
      originalPrice: 350000,
      price: 199000,
      description: 'Gói khám toàn diện dành riêng cho sinh viên AGU: khám thể lực, đo thị lực, X-quang phổi kỹ thuật số, công thức máu và nước tiểu 10 thông số.',
      targetAudience: TargetAudience.STUDENT_ONLY,
      details: {
        items: [
          'Khám nội khoa tổng quát & đo sinh hiệu',
          'Kiểm tra thị lực mắt & đo khúc xạ',
          'Chụp X-quang tim phổi thẳng kỹ thuật số',
          'Xét nghiệm tổng phân tích tế bào máu ngoại vi (24 thông số)',
          'Xét nghiệm tổng phân tích nước tiểu (10 thông số)'
        ]
      }
    },
    {
      code: 'MED-IT-02',
      name: 'Gói Tầm Soát Hội Chứng Cột Sống & Thị Lực IT/Văn Phòng',
      slug: 'tam-soat-cot-song-thi-luc-it-van-phong',
      originalPrice: 450000,
      price: 250000,
      description: 'Tầm soát chuyên sâu thoái hóa đốt sống cổ, lưng, hội chứng ống cổ tay và tật khúc xạ mắt cho kỹ sư phần mềm và nhân viên văn phòng.',
      targetAudience: TargetAudience.ALL,
      details: {
        items: [
          'Khám chuyên khoa mắt, soi đáy mắt, đo nhãn áp',
          'Chụp X-quang cột sống cổ tư thế thẳng & nghiêng',
          'Chụp X-quang cột sống thắt lưng',
          'Khám kiểm tra vận động khớp cổ tay và phản xạ gân cơ'
        ]
      }
    },
    {
      code: 'MED-TT-03',
      name: 'Gói Khám Cấp Giấy Phép Lái Xe & Hồ Sơ Đi Làm',
      slug: 'kham-cap-giay-phep-lai-xe-di-lam',
      originalPrice: 400000,
      price: 299000,
      description: 'Khám theo đúng mẫu Thông tư Bộ Y tế, có xét nghiệm 4 chất gây nghiện và nồng độ cồn trong máu, trả kết quả nhanh chóng.',
      targetAudience: TargetAudience.ALL,
      details: {
        items: [
          'Khám lâm sàng đa chuyên khoa (Mắt, TMH, RHM, Thần kinh, Cơ xương khớp)',
          'Xét nghiệm ma túy 4 chất (Morphin/Heroin, Amphetamin, Methamphetamin, Cần sa)',
          'Đo nồng độ cồn trong hơi thở/máu',
          'Cấp giấy chứng nhận sức khỏe hợp lệ toàn quốc'
        ]
      }
    },
    {
      code: 'MED-TQ-04',
      name: 'Gói Khám Sức Khỏe Tổng Quát Tiêu Chuẩn',
      slug: 'kham-tong-quat-tieu-chuan-dinh-ky',
      originalPrice: 900000,
      price: 590000,
      description: 'Đánh giá chức năng gan thận, đường huyết, tim mạch và tầm soát bệnh lý nội khoa định kỳ hàng năm.',
      targetAudience: TargetAudience.ALL,
      details: {
        items: [
          'Khám nội tổng quát, tư vấn chế độ dinh dưỡng',
          'Siêu âm màu ổ bụng tổng quát (Gan, mật, tụy, thận, lách, bàng quang)',
          'Đo điện tim đồ kỹ thuật số (ECG)',
          'Xét nghiệm đường máu đói (Glucose)',
          'Xét nghiệm men gan (AST, ALT), chức năng thận (Urea, Creatinine)'
        ]
      }
    },
    {
      code: 'MED-TM-05',
      name: 'Gói Tầm Soát Tim Mạch & Huyết Áp Người Lớn Tuổi',
      slug: 'tam-soat-tim-mach-huyet-ap',
      originalPrice: 1300000,
      price: 890000,
      description: 'Chuyên sâu tầm soát nguy cơ xơ vữa động mạch, nhồi máu cơ tim, rối loạn lipid máu và tăng huyết áp.',
      targetAudience: TargetAudience.ALL,
      details: {
        items: [
          'Siêu âm tim Doppler màu khảo sát van tim và chức năng tâm thu',
          'Đo điện tim đồ ECG 12 chuyển đạo',
          'Bộ mỡ máu 4 chỉ số (Cholesterol toàn phần, Triglyceride, HDL-C, LDL-C)',
          'Định lượng Acid Uric tầm soát bệnh Gout',
          'Khám và tư vấn cùng Bác sĩ Chuyên khoa Tim mạch'
        ]
      }
    },
    {
      code: 'MED-TH-06',
      name: 'Gói Tầm Soát Bệnh Lý Tiêu Hóa & Viêm Gan',
      slug: 'tam-soat-tieu-hoa-viem-gan',
      originalPrice: 1100000,
      price: 750000,
      description: 'Tầm soát viêm gan siêu vi B, C, vi khuẩn dạ dày HP và các bệnh lý đường tiêu hóa phổ biến.',
      targetAudience: TargetAudience.ALL,
      details: {
        items: [
          'Siêu âm gan mật tụy độ phân giải cao',
          'Test hơi thở C13 tầm soát vi khuẩn Helicobacter Pylori (HP dạ dày)',
          'Xét nghiệm viêm gan B (HBsAg định tính)',
          'Xét nghiệm viêm gan C (Anti-HCV định tính)',
          'Xét nghiệm men gan chuyên sâu (GGT, AST, ALT)'
        ]
      }
    },
    {
      code: 'MED-NCT-07',
      name: 'Gói Khám Sức Khỏe Chuyên Sâu Người Cao Tuổi',
      slug: 'kham-chuyen-sau-nguoi-cao-tuoi',
      originalPrice: 1900000,
      price: 1350000,
      description: 'Tầm soát loãng xương, nguy cơ đột quỵ não, bệnh lý tuyến giáp và suy giảm chức năng đa cơ quan ở người cao tuổi.',
      targetAudience: TargetAudience.ALL,
      details: {
        items: [
          'Đo mật độ xương bằng phương pháp DEXA (cột sống & cổ xương đùi)',
          'Siêu âm Doppler động mạch cảnh tầm soát nguy cơ đột quỵ',
          'Xét nghiệm chức năng tuyến giáp (TSH, FT4)',
          'Bộ xét nghiệm chức năng gan, thận, điện giải đồ (Na, K, Cl)',
          'Tổng phân tích nước tiểu và tế bào máu toàn phần'
        ]
      }
    },
    {
      code: 'MED-UT-08',
      name: 'Gói Tầm Soát Dấu Ấn Ung Thư Sớm Toàn Diện',
      slug: 'tam-soat-dau-an-ung-thu-co-ban',
      originalPrice: 2400000,
      price: 1600000,
      description: 'Tầm soát sớm các dấu ấn chỉ điểm khối u phổ biến: gan (AFP), phổi (CEA, Cyfra 21-1), đại tràng (CA 19-9), tiền liệt tuyến / buồng trứng.',
      targetAudience: TargetAudience.ALL,
      details: {
        items: [
          'Định lượng dấu ấn ung thư gan AFP',
          'Định lượng dấu ấn ung thư đường tiêu hóa & phổi CEA',
          'Định lượng dấu ấn ung thư tụy & đại trực tràng CA 19-9',
          'Định lượng Cyfra 21-1 (tầm soát ung thư phổi không tế bào nhỏ)',
          'Định lượng PSA toàn phần (Nam) hoặc CA 125 & CA 15-3 (Nữ)',
          'Siêu âm ổ bụng & X-quang tim phổi kiểm tra tổn thương'
        ]
      }
    },
  ];

  const packagesMap = new Map<string, any>();
  for (const pkg of packagesData) {
    const created = await prisma.medicalPackage.create({ data: pkg });
    packagesMap.set(pkg.code, created);
  }

  // 6. Khởi tạo 14 Tài khoản Nhân sự Cốt lõi (Roles Đặc Biệt)
  console.log('👥 [6/8] Khởi tạo 14 Tài khoản Nhân sự Cốt lõi (Admin, Lễ tân, CTV, Nhân viên)...');

  // Danh sách tên 14 người cần loại khỏi danh sách sinh viên khách hàng
  const excludedNamesList = [
    'Nguyễn Hoàng Uy',
    'Trần Quang Toàn',
    'Tạ Nguyễn Thanh Tín',
    'Tạ Nguyễn Thành Tín',
    'Thái Vĩnh Nghi',
    'Trần Đăng Khoa',
    'Võ Văn Tỷ',
    'Phó Bảo Phong',
    'Võ Hoàng Quân',
    'Nguyễn Văn Trọng Phúc',
    'Nguyễn Văn Chí Hạo',
    'Nguyễn Văn Chí Hào',
    'Trương Trung Kiên',
    'Nguyễn Ngọc Tài',
    'Lê Đăng Khoa',
    'Tạ Hồng Quân',
  ];

  // 6.1. Super Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'nguyenhoanguy@medsaas.vn',
      fullName: 'Nguyễn Hoàng Uy',
      phone: '0901234567',
      role: Role.SUPER_ADMIN,
      passwordHash: commonPasswordHash,
      isActive: true,
    },
  });

  // 6.2. Lễ tân chi nhánh
  const toanReceptionist = await prisma.user.create({
    data: {
      tenantId: tenantMap.get('BV-AG-LX'),
      email: 'tranquangtoan@medsaas.vn',
      fullName: 'Trần Quang Toàn',
      phone: '0912345601',
      role: Role.BRANCH_RECEPTIONIST,
      passwordHash: commonPasswordHash,
      isActive: true,
    },
  });

  const tinReceptionist = await prisma.user.create({
    data: {
      tenantId: tenantMap.get('BV-CD'),
      email: 'tanguyenthanhtin@medsaas.vn',
      fullName: 'Tạ Nguyễn Thanh Tín',
      phone: '0912345602',
      role: Role.BRANCH_RECEPTIONIST,
      passwordHash: commonPasswordHash,
      isActive: true,
    },
  });

  // 6.3. Cộng tác viên (Affiliate Partners) với Ví hoa hồng & Voucher
  const ctvList = [
    {
      email: 'thaivinhnghi@medsaas.vn',
      fullName: 'Thái Vĩnh Nghi',
      phone: '0922334455',
      voucherCode: 'NGHI10',
      initialEarned: 2850000,
      initialBalance: 1850000,
    },
    {
      email: 'trandangkhoa@medsaas.vn',
      fullName: 'Trần Đăng Khoa',
      phone: '0933445566',
      voucherCode: 'KHOA10',
      initialEarned: 1420000,
      initialBalance: 1420000,
    },
    {
      email: 'vovanty@medsaas.vn',
      fullName: 'Võ Văn Tỷ',
      phone: '0944556677',
      voucherCode: 'TY10',
      initialEarned: 890000,
      initialBalance: 890000,
    },
  ];

  const ctvUserMap = new Map<string, any>();
  const voucherMap = new Map<string, string>();

  for (const ctv of ctvList) {
    const user = await prisma.user.create({
      data: {
        email: ctv.email,
        fullName: ctv.fullName,
        phone: ctv.phone,
        role: Role.AFFILIATE_PARTNER,
        passwordHash: commonPasswordHash,
        isActive: true,
        wallet: {
          create: {
            balance: ctv.initialBalance,
            lockedBalance: 0,
            totalEarned: ctv.initialEarned,
          },
        },
      },
      include: { wallet: true },
    });

    ctvUserMap.set(ctv.email, user);

    // Tạo Voucher độc quyền cho CTV
    const voucher = await prisma.voucher.create({
      data: {
        affiliateUserId: user.id,
        code: ctv.voucherCode,
        discountValue: 20000, // Giảm 20.000đ trực tiếp cho người đặt
        maxUsage: 200,
        usedCount: 0,
        isActive: true,
      },
    });

    voucherMap.set(ctv.voucherCode, voucher.id);
  }

  // 6.4. Nhân viên nội bộ (Internal Staff)
  const staffList = [
    { email: 'phobaophong@medsass.vn', fullName: 'Phó Bảo Phong', phone: '0955667781' },
    { email: 'vohoangquan@medsaas.vn', fullName: 'Võ Hoàng Quân', phone: '0955667782' },
    { email: 'nguyenvantrongphuc@medsaas.vn', fullName: 'Nguyễn Văn Trọng Phúc', phone: '0955667783' },
    { email: 'nguyenvanchihao@medsaas.vn', fullName: 'Nguyễn Văn Chí Hạo', phone: '0955667784' },
    { email: 'truongtrungkien@medsaas.vn', fullName: 'Trương Trung Kiên', phone: '0955667785' },
    { email: 'nguyenngoctai@medsass.vn', fullName: 'Nguyễn Ngọc Tài', phone: '0955667786' },
    { email: 'ledangkhoa@medsaas.vn', fullName: 'Lê Đăng Khoa', phone: '0955667787' },
    { email: 'tahongquan@medsaas.vn', fullName: 'Tạ Hồng Quân', phone: '0955667788' },
  ];

  const staffUserMap = new Map<string, any>();
  for (const s of staffList) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        fullName: s.fullName,
        phone: s.phone,
        role: Role.INTERNAL_STAFF,
        passwordHash: commonPasswordHash,
        isActive: true,
        wallet: {
          create: {
            balance: 0,
            lockedBalance: 0,
            totalEarned: 0,
          },
        },
      },
      include: { wallet: true },
    });
    staffUserMap.set(s.email, user);
  }

  // 7. Đọc danh sách Sinh viên CNTT từ 3 file XLS (th1.xls, th2.xls, th3.xls)
  console.log('🎓 [7/8] Đọc và lọc danh sách Sinh viên CNTT Đại học An Giang...');
  const rootDir = path.resolve(process.cwd(), '..');
  const filePaths = [
    path.join(rootDir, 'th1.xls'),
    path.join(rootDir, 'th2.xls'),
    path.join(rootDir, 'th3.xls'),
    path.join(process.cwd(), 'th1.xls'), // Dự phòng nếu cwd đang ở root
    path.join(process.cwd(), 'th2.xls'),
    path.join(process.cwd(), 'th3.xls'),
  ];

  const loadedFiles = new Set<string>();
  let rawStudents: ParsedStudent[] = [];

  for (const fp of filePaths) {
    const base = path.basename(fp);
    if (!loadedFiles.has(base) && fs.existsSync(fp)) {
      loadedFiles.add(base);
      const parsed = parseXlsFile(fp);
      console.log(`   + Nạp ${parsed.length} sinh viên từ file ${base}`);
      rawStudents = rawStudents.concat(parsed);
    }
  }

  // Lọc bỏ 14 người có tên ở trên khỏi danh sách sinh viên khách hàng
  const excludedNormalized = excludedNamesList.map(normalizeVietnamese);
  const eligibleStudents = rawStudents.filter((s) => {
    const norm = normalizeVietnamese(s.fullName);
    return !excludedNormalized.includes(norm);
  });

  console.log(`   => Tổng sinh viên sau khi loại trừ 14 nhân sự cốt lõi: ${eligibleStudents.length} bạn.`);

  // Seed các sinh viên này thành User role CUSTOMER
  console.log('   => Tạo tài khoản CUSTOMER cho sinh viên...');
  const createdStudents: any[] = [];
  for (const s of eligibleStudents) {
    const studentUser = await prisma.user.create({
      data: {
        email: s.email,
        fullName: s.fullName,
        phone: s.sdt,
        role: Role.CUSTOMER,
        passwordHash: commonPasswordHash,
        isActive: true,
      },
    });
    createdStudents.push({ ...studentUser, mssv: s.mssv, maLop: s.maLop });
  }

  // 8. Mô phỏng Đơn hàng (Orders) & Giao dịch ví (Transactions)
  console.log('🛒 [8/8] Sinh 75 đơn hàng mô phỏng thực tế (70% COMPLETED, 20% PENDING, 10% CANCELLED)...');

  const tenantIds = Array.from(tenantMap.values());
  const packageList = Array.from(packagesMap.values());
  const ctvNghi = ctvUserMap.get('thaivinhnghi@medsaas.vn');
  const ctvKhoa = ctvUserMap.get('trandangkhoa@medsaas.vn');
  const ctvTy = ctvUserMap.get('vovanty@medsaas.vn');

  const activeCtvs = [
    { user: ctvNghi, weight: 0.50, voucherCode: 'NGHI10' }, // 50% đơn giới thiệu
    { user: ctvKhoa, weight: 0.30, voucherCode: 'KHOA10' }, // 30% đơn giới thiệu
    { user: ctvTy, weight: 0.20, voucherCode: 'TY10' },     // 20% đơn giới thiệu
  ];

  const now = new Date();
  const totalOrdersToCreate = 75;

  let orderCountNghi = 0;
  let orderCountKhoa = 0;
  let orderCountTy = 0;

  for (let i = 0; i < totalOrdersToCreate; i++) {
    const student = createdStudents[i % createdStudents.length];
    const tenantId = tenantIds[i % tenantIds.length];

    // Chọn gói khám: 60% chọn gói Sinh viên, 40% chọn các gói khác
    const isStudentPkg = i % 10 < 6;
    const selectedPkg = isStudentPkg
      ? packagesMap.get('MED-SV-01')
      : packageList[i % packageList.length];

    // Xác định CTV giới thiệu
    const randCtv = Math.random();
    let chosenCtv = activeCtvs[0];
    if (randCtv < 0.50) {
      chosenCtv = activeCtvs[0]; // Nghi
      orderCountNghi++;
    } else if (randCtv < 0.80) {
      chosenCtv = activeCtvs[1]; // Khoa
      orderCountKhoa++;
    } else {
      chosenCtv = activeCtvs[2]; // Tỷ
      orderCountTy++;
    }

    const voucherId = voucherMap.get(chosenCtv.voucherCode);
    const discount = 20000;
    const pkgPrice = Number(selectedPkg.price);
    const finalAmount = Math.max(0, pkgPrice - discount);

    // Tỉ lệ hoa hồng: Tính theo bậc của CTV (10% - 15%)
    const commissionRate = isStudentPkg ? 0.12 : 0.10;
    const commissionAmount = Math.round(finalAmount * commissionRate);

    // Xác định trạng thái đơn
    // 70% Completed (trong 30 ngày qua), 20% Pending (hôm nay hoặc sắp tới), 10% Cancelled
    let status: OrderStatus = OrderStatus.COMPLETED;
    let commissionStatus: CommissionStatus = CommissionStatus.PAID;
    let completedAt: Date | null = null;
    let confirmedByUserId: string | null = null;

    // Thời gian tạo đơn rải đều trong 30 ngày qua
    const daysAgo = Math.floor(Math.random() * 28) + 1;
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    let appointmentDate = new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000);

    const statusRoll = (i % 10);
    if (statusRoll < 7) {
      // 70% COMPLETED
      status = OrderStatus.COMPLETED;
      commissionStatus = CommissionStatus.PAID;
      completedAt = new Date(appointmentDate.getTime() + 2 * 60 * 60 * 1000);
      confirmedByUserId = (i % 2 === 0) ? toanReceptionist.id : tinReceptionist.id;
    } else if (statusRoll < 9) {
      // 20% PENDING (Lễ tân có thể check-in trực tiếp khi demo)
      status = OrderStatus.PENDING;
      commissionStatus = CommissionStatus.PENDING;
      appointmentDate = new Date(now.getTime() + ((i % 3) + 1) * 24 * 60 * 60 * 1000);
    } else {
      // 10% CANCELLED
      status = OrderStatus.CANCELLED;
      commissionStatus = CommissionStatus.CANCELLED;
    }

    const bookingCode = `BK-${String(i + 1).padStart(4, '0')}-${student.mssv ? student.mssv.slice(-4) : 'AGU'}`;

    const order = await prisma.order.create({
      data: {
        bookingCode,
        tenantId,
        packageId: selectedPkg.id,
        affiliateUserId: chosenCtv.user.id,
        voucherId,
        confirmedByUserId,
        patientName: student.fullName,
        patientPhone: student.phone,
        patientEmail: student.email,
        appointmentDate,
        totalAmount: finalAmount,
        discountAmount: discount,
        commissionAmount,
        status,
        commissionStatus,
        paymentMethod: (i % 3 === 0) ? PaymentMethod.VIETQR : PaymentMethod.AT_COUNTER,
        completedAt,
        createdAt,
      },
    });

    // Nếu đơn đã hoàn thành, ghi nhận giao dịch hoa hồng cho ví CTV
    if (status === OrderStatus.COMPLETED && chosenCtv.user.wallet) {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: chosenCtv.user.id },
      });

      if (wallet) {
        const balanceBefore = Number(wallet.balance);
        const balanceAfter = balanceBefore + commissionAmount;

        await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: balanceAfter,
            totalEarned: Number(wallet.totalEarned) + commissionAmount,
          },
        });

        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: commissionAmount,
            balanceBefore,
            balanceAfter,
            type: TransactionType.COMMISSION_PAYOUT,
            referenceId: order.bookingCode,
            note: `Hoa hồng giới thiệu gói ${selectedPkg.name} cho bệnh nhân ${student.fullName}`,
            createdAt: completedAt || new Date(),
          },
        });
      }
    }
  }

  // 9. Tạo 2 Lệnh rút tiền mẫu (Withdrawal Requests)
  console.log('💳 Tạo các yêu cầu rút tiền mẫu để kiểm thử tính năng Admin duyệt chi...');
  if (ctvNghi && ctvNghi.wallet) {
    // 1 lệnh đã duyệt thành công 1.000.000đ
    await prisma.withdrawalRequest.create({
      data: {
        userId: ctvNghi.id,
        amount: 1000000,
        bankName: 'MB Bank (Ngân hàng Quân Đội)',
        accountNumber: '0922334455888',
        accountHolder: 'THAI VINH NGHI',
        status: WithdrawalStatus.APPROVED,
        adminNote: 'Đã chuyển khoản qua Napas247',
        transactionCode: 'FT261021987654',
      },
    });

    // 1 lệnh đang chờ duyệt 500.000đ
    await prisma.withdrawalRequest.create({
      data: {
        userId: ctvNghi.id,
        amount: 500000,
        bankName: 'MB Bank (Ngân hàng Quân Đội)',
        accountNumber: '0922334455888',
        accountHolder: 'THAI VINH NGHI',
        status: WithdrawalStatus.PENDING,
      },
    });
  }

  if (ctvKhoa && ctvKhoa.wallet) {
    // 1 lệnh đang chờ duyệt 300.000đ
    await prisma.withdrawalRequest.create({
      data: {
        userId: ctvKhoa.id,
        amount: 300000,
        bankName: 'Vietcombank An Giang',
        accountNumber: '0151000998877',
        accountHolder: 'TRAN DANG KHOA',
        status: WithdrawalStatus.PENDING,
      },
    });
  }

  console.log('\n======================================================');
  console.log('✅ [HOÀN TẤT SEED DỮ LIỆU THỰC TẾ]');
  console.log(`- 8 Chi nhánh Y tế (Tenants) An Giang`);
  console.log(`- 8 Gói khám sức khỏe & tầm soát`);
  console.log(`- 3 Bậc hoa hồng đa cấp (10% - 12% - 15%)`);
  console.log(`- 14 Nhân sự cốt lõi:`);
  console.log(`  + Admin: nguyenhoanguy@medsaas.vn`);
  console.log(`  + Lễ tân: tranquangtoan@medsaas.vn, tanguyenthanhtin@medsaas.vn`);
  console.log(`  + CTV: thaivinhnghi@medsaas.vn, trandangkhoa@medsaas.vn, vovanty@medsaas.vn`);
  console.log(`  + Nhân viên: 8 tài khoản nội bộ`);
  console.log(`- ${createdStudents.length} Sinh viên CNTT AGU (khách hàng/bệnh nhân đặt khám)`);
  console.log(`- 75 Đơn hàng mô phỏng lịch sử 30 ngày (doanh thu, hoa hồng, check-in)`);
  console.log(`- 3 Yêu cầu rút tiền mẫu (1 APPROVED, 2 PENDING)`);
  console.log(`- Mật khẩu đăng nhập mặc định: MedSaas@2026`);
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi thực thi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
