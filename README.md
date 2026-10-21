# HỆ THỐNG QUẢN LÝ PHÂN PHỐI DỊCH VỤ Y TẾ SỨC KHỎE TÍCH HỢP MẠNG LƯỚI CỘNG TÁC VIÊN VÀ CƠ CHẾ ĐỐI SOÁT HOA HỒNG TỰ ĐỘNG

**ĐỒ ÁN THỰC TẬP TỐT NGHIỆP ĐẠI HỌC — NGÀNH CÔNG NGHỆ THÔNG TIN**

*Đơn vị đào tạo: Khoa Công nghệ Thông tin — Trường Đại học An Giang (ĐHQG-HCM)*

*Định hướng kiến trúc: Multi-Tenant Service SaaS & Automated Affiliate Marketing Engine*

## 📑 MỤC LỤC HỆ THỐNG

 1. [Giới thiệu Tổng quan & Bài toán Nghiệp vụ](#1-giới-thiệu-tổng-quan--bài-toán-nghiệp-vụ)

 2. [Các Tác nhân Hệ thống (5 Actors)](#2-các-tác-nhân-hệ-thống-5-actors)

 3. [Kiến trúc & Công nghệ (Tech Stack Rationale)](#3-kiến-trúc--công-nghệ-tech-stack-rationale)

 4. [Cấu trúc Monorepo Chi tiết (Source Code Structure)](#4-cấu-trúc-monorepo-chi-tiết-source-code-structure)

 5. [Yêu cầu Môi trường & Cài đặt (Prerequisites)](#5-yêu-cầu-môi-trường--cài-đặt-prerequisites)

 6. [Hướng dẫn Thiết lập Môi trường Phát triển (Quick Start)](#6-hướng-dẫn-thiết-lập-môi-trường-phát-triển-quick-start)

 7. [Quy chuẩn Phát triển & Đóng góp Mã nguồn (Git Flow)](#7-quy-chuẩn-phát-triển--đóng-góp-mã-nguồn-git-flow)

 8. [Bảo mật, Toàn vẹn Tài chính & Quản lý Biến môi trường](#8-bảo-mật-toàn-vẹn-tài-chính--quản-lý-biến-môi-trường)

 9. [Tài liệu Nghiệp vụ & Kỹ thuật Liên quan](#9-tài-liệu-nghiệp-vụ--kỹ-thuật-liên-quan)

10. [Hướng dẫn Cài đặt & Khởi chạy Toàn diện (Development Setup)](#10-hướng-dẫn-cài-đặt--khởi-chạy-toàn-diện-development-setup)

## 1. Giới thiệu Tổng quan & Bài toán Nghiệp vụ

### 1.1. Bối cảnh Thực tiễn

Trong bối cảnh chuyển đổi số ngành y tế và chăm sóc sức khỏe dự phòng tại địa phương (đặc biệt là nhu cầu khám sức khỏe đầu khóa cho sinh viên, tầm soát chuyên sâu tại các phòng khám đa khoa và bệnh viện khu vực An Giang), công tác phân phối các gói dịch vụ y tế đang gặp phải 4 điểm nghẽn vận hành lớn:

* **Quản lý mạng lưới cộng tác viên (CTV) thủ công:** Các phòng khám triển khai đội ngũ nhân viên kinh doanh và CTV giới thiệu khách hàng nhưng ghi nhận doanh số qua bảng tính Excel, tin nhắn Zalo hoặc phiếu giấy, dẫn đến sai sót, thất lạc nguồn giới thiệu và tranh chấp hoa hồng.

* **Độ trễ đối soát & Đứt gãy dòng tiền:** Quá trình xác minh khách hàng đã thực sự đến phòng khám sử dụng dịch vụ hay chưa diễn ra rời rạc giữa bộ phận Lễ tân và Kế toán, khiến CTV phải chờ đợi đối soát cuối tháng mới nhận được thù lao, làm giảm động lực bán hàng.

* **Nguy cơ gian lận tiếp thị (Affiliate Fraud & Abuse):** Thiếu cơ chế kỹ thuật để kiểm soát mã giảm giá dùng một lần, giới hạn đối tượng thụ hưởng (ví dụ: gói ưu đãi chỉ dành cho sinh viên có email `@agu.edu.vn`), hoặc kiểm soát hành vi tự mua trục lợi hoa hồng kép (`Self-referral`).

* **Phân mảnh dữ liệu giữa các cơ sở/chi nhánh:** Khi hệ thống mở rộng ra nhiều phòng khám hoặc chi nhánh trực thuộc, việc thiếu một nền tảng phần mềm dạng dịch vụ (Multi-tenant SaaS) khiến dữ liệu khách hàng, lịch hẹn và quỹ hoa hồng bị chồng chéo, thiếu tính cô lập và bảo mật.

### 1.2. Định vị Sản phẩm

Hệ thống được định vị chuẩn xác là **MedAffiliate SaaS Platform (Nền tảng SaaS Phân phối Gói Dịch vụ Y tế & Đối soát Hoa hồng Tiếp thị Liên kết Tự động)**:

* **Không phải là phần mềm quản lý kho dược phẩm vật lý (HIS/Pharmacy Inventory):** Loại bỏ hoàn toàn sự phức tạp cồng kềnh của kiểm kê thuốc vật lý để tập trung 100% vào thương mại điện tử dịch vụ (Service E-commerce) và kỹ thuật tài chính số (Fintech/Wallet Engine).

* **Không phải là trang web đặt lịch khám thông thường:** Hệ thống tích hợp sâu động cơ **Affiliate Marketing đa công cụ** (Tracking URL tự động lưu Cookie, Mã QR Code chốt sale trực tiếp, Voucher thông minh) cùng **Cơ chế Hoa hồng Lũy tiến theo Cấp bậc (Tiered Commission)**.

* **Trọng tâm cốt lõi:** Quản trị đa chi nhánh (Multi-tenant Isolation), đối soát hoa hồng tức thì dựa trên giao dịch cơ sở dữ liệu nguyên tử (ACID Database Transactions) ngay khi Lễ tân xác nhận hoàn tất khám, và hỗ trợ **Luân chuyển dòng tiền (Cash-flow Rotation)** cho phép CTV dùng chính số dư ví hoa hồng để tái đầu tư/mua tiếp các gói khám mới.

```
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │               NỀN TẢNG QUẢN TRỊ ĐA CHI NHÁNH (MED-AFFILIATE SAAS)            │
 │        Cấu hình Gói Y tế  •  Bậc Hoa hồng Lũy tiến  •  Kiểm toán Ví          │
 └──────────────────────────────────────┬───────────────────────────────────────┘
                                        │
          ┌─────────────────────────────┼─────────────────────────────┐
          ▼                             ▼                             ▼
┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
│  NHÂN VIÊN & CTV  │         │ KHÁCH HÀNG / SV   │         │ LỄ TÂN CHI NHÁNH  │
│ (AFFILIATE AGENT) │         │ (PATIENT/STUDENT) │         │  (RECEPTIONIST)   │
└─────────┬─────────┘         └─────────┬─────────┘         └─────────┬─────────┘
          │                             │                             │
          ├─ 1. Sinh Link / QR / Mã ───►│                             │
          │                             ├─ 2. Đặt gói & Giữ chỗ ─────►│
          │                             │     (Hoa hồng Tạm tính)     │
          │                             │                             │
          │◄────────── 3. Xác nhận Hoàn tất Khám (ACID Transaction) ──┘
          │               Giải ngân vào Ví & Xoay vòng Dòng tiền

```

## 2. Các Tác nhân Hệ thống (5 Actors)

Hệ thống được phân quyền nghiêm ngặt với 5 tác nhân nghiệp vụ riêng biệt, đảm bảo nguyên tắc phân chia trách nhiệm (Separation of Concerns) và cô lập dữ liệu theo từng chi nhánh (`tenant_id`):

| Tác nhân (Actor) | Biểu tượng | Phạm vi Nghiệp vụ & Trách nhiệm Cốt lõi | 
| ----- | ----- | ----- | 
| **Quản trị viên Hệ thống**  *(Super Admin)* | ⚙️ | \- Quản trị danh mục các Chi nhánh / Phòng khám trực thuộc (`Tenants`) trên toàn nền tảng.  \- Thiết lập danh mục Gói dịch vụ y tế chuẩn và cấu hình **Ma trận Bậc Hoa hồng Lũy tiến** (`Commission Tiers`).  \- Phê duyệt hoặc từ chối các lệnh yêu cầu rút tiền mặt (`Withdrawal Requests`) từ Ví của CTV.  \- Giám sát biểu đồ doanh thu toàn chuỗi và tra cứu Nhật ký kiểm toán dòng tiền (`System Audit & Wallet Logs`). | 
| **Quản lý / Lễ tân Chi nhánh**  *(Branch Receptionist)* | 🏥 | \- Chỉ truy cập và thao tác trên dữ liệu đơn đặt khám thuộc đúng chi nhánh của mình (`Tenant Isolation`).  \- Tra cứu nhanh Mã phiếu khám điện tử hoặc Số điện thoại khi bệnh nhân/sinh viên đến quầy.  \- Xác nhận trạng thái **"Hoàn thành dịch vụ" (`COMPLETED`)** — thao tác kích hoạt động cơ tự động giải ngân hoa hồng vào Ví CTV.  \- Theo dõi thống kê lượt khám thực tế trong ngày tại cơ sở. | 
| **Nhân viên Nội bộ**  *(Internal Staff)* | 👨‍⚕️ | \- Nhân sự chính thức của phòng khám (đã có lương cứng), tham gia bán chéo (Cross-selling) gói dịch vụ.  \- Khởi tạo mã giới thiệu, Link Affiliate và mã QR cá nhân.  \- Hưởng mức hoa hồng thưởng cố định (`Fixed Staff Commission Rate`) trên mỗi đơn hoàn tất, cộng dồn vào Ví nội bộ để đối soát thưởng cuối tháng. | 
| **Cộng tác viên / Đại lý**  *(Affiliate Partner / CTV)* | 🤝 | \- Đối tác bán hàng tự do bên ngoài (không hưởng lương cứng, thu nhập 100% theo hiệu suất).  \- Sở hữu bộ công cụ tiếp thị: **Tracking Link tự động gắn Cookie**, **QR Code** và **Mã Voucher**.  \- Hưởng cơ chế **Hoa hồng Lũy tiến** (bán càng nhiều gói trong tháng, tỷ lệ $\%$ hoa hồng tự động nhảy bậc cao hơn).  \- Quản lý **Ví điện tử (`Wallet`)**: Rút tiền về ngân hàng hoặc **Xoay vòng dòng tiền** (dùng số dư hoa hồng mua trực tiếp gói khám mới cho khách hàng/người thân). | 
| **Khách hàng / Sinh viên**  *(Customer / Student)* | 🎓 | \- Truy cập giao diện Storefront tối giản để tra cứu thông tin chi tiết các gói khám sức khỏe.  \- Đặt mua gói khám qua Link giới thiệu, quét QR hoặc nhập mã Voucher để nhận ưu đãi giảm giá trực tiếp.  \- Nhận **Mã phiếu khám điện tử (`Booking Code`)** để sử dụng tại chi nhánh đã chọn.  \- Chuyển đổi vai trò chỉ với 1 cú nhấp chuột (*"Đăng ký trở thành Cộng tác viên"*) sau khi trải nghiệm dịch vụ. | 

## 3. Kiến trúc & Công nghệ (Tech Stack Rationale)

### 3.1. Mô hình Kiến trúc: Modular Monolith & Logical Multi-Tenancy

Dự án được xây dựng theo mô hình **Modular Monolith** kết hợp tổ chức mã nguồn dạng **Monorepo** và cơ chế phân tách dữ liệu đa chi nhánh (**Logical Multi-tenancy**). Đây là quyết định kiến trúc chiến lược dựa trên các phân tích kỹ thuật:

1. **Ranh giới Miền Nghiệp vụ Rõ ràng (Clear Bounded Contexts):** Các module nghiệp vụ (`Auth`, `Tenants`, `MedicalPackages`, `Affiliate`, `Orders`, `Wallets`, `Reconciliation`, `AuditLog`) được đóng gói độc lập theo phân tầng (`Controllers - Services - DTOs - Entities`). Các module giao tiếp qua Service Interface công khai, nghiêm cấm sửa đổi trực tiếp số dư bảng `wallets` từ bên ngoài `WalletService`.

2. **Đảm bảo Tính Toàn vẹn Giao dịch Tài chính (ACID Transactions):** Khác với Microservices phải xử lý bài toán giao dịch phân tán phức tạp (Saga Pattern / 2PC) dễ gây lệch tiền, kiến trúc Modular Monolith trên cùng một CSDL quan hệ cho phép sử dụng **Database Transaction nguyên tử** kết hợp khóa dòng (**Row-level Locking `SELECT ... FOR UPDATE`**) khi cộng/trừ tiền hoa hồng.

3. **Khả năng Mở rộng Bền vững (Evolutionary Path):** Thiết kế chia tách rõ các module giúp hệ thống dễ dàng tách riêng `AffiliateModule` hoặc `WalletModule` thành các Microservices độc lập khi quy mô giao dịch tăng cao trong tương lai.

### 3.2. Bảng Tổng hợp Công nghệ Cốt lõi

| Tầng Hệ thống | Công nghệ / Thư viện | Phiên bản | Vai trò & Lý do Lựa chọn (Rationale) | 
| ----- | ----- | ----- | ----- | 
| **Cơ chế Mã nguồn** | Monorepo Architecture | Standard | Quản lý đồng nhất Backend, Frontend, Docs và Docker Infrastructure trên cùng một kho lưu trữ GitHub. | 
| **Backend Core** | Node.js & NestJS | 20 LTS / 10.x | Framework Backend cấp doanh nghiệp với TypeScript thuần nhất, hỗ trợ Dependency Injection (DI), Guards và Interceptors mạnh mẽ. | 
| **ORM / Data Access** | Prisma ORM | 5.x | ORM hiện đại cung cấp Type-safety tuyệt đối từ Schema đến Controller, hỗ trợ Interactive Transactions (`prisma.$transaction`) cực kỳ an toàn cho Ví điện tử. | 
| **Database** | MySQL | 8.0 (InnoDB) | Hệ quản trị CSDL quan hệ chuẩn mực, hỗ trợ tuân thủ nghiêm ngặt chuẩn ACID, khóa dòng chống Race Condition và tối ưu hóa truy vấn. | 
| **Frontend Core** | Next.js (App Router) | 14.x / 15.x | Framework React hiện đại hỗ trợ cả Server-Side Rendering (tối ưu SEO cho trang Storefront bán gói khám) và Client Components mượt mà cho trang Portal quản trị. | 
| **Ngôn ngữ Lập trình** | TypeScript | 5.x | Đảm bảo tính nhất quán kiểu dữ liệu tĩnh (Static Typing) xuyên suốt từ câu lệnh tính hoa hồng Backend đến giao diện Frontend. | 
| **State & API Cache** | TanStack Query (v5) | 5.x | Quản lý Server State, đồng bộ số dư Ví theo thời gian thực, tự động Refetch khi trạng thái đơn khám thay đổi. | 
| **Styling & UI Kit** | Tailwind CSS & Shadcn UI | 3.4.x / Latest | Xây dựng giao diện chuẩn thẩm mỹ y tế hiện đại, tích hợp sẵn bảng dữ liệu (Data Table), biểu đồ và hộp thoại (Dialog) tốc độ cao. | 
| **Affiliate & QR Engine** | `qrcode` & Cookie Tracking | Latest | Tự động sinh mã QR Code chuẩn вектор/Base64 và cơ chế lưu vết mã giới thiệu (`?ref=`) vào HTTP Cookie/LocalStorage. | 
| **Xác thực & Bảo mật** | JWT & BCrypt | \- | Xác thực phi trạng thái qua JWT chứa thông tin `role` và `tenant_id`, kiểm soát truy cập đa tầng qua Guards. | 
| **API Documentation** | Swagger / OpenAPI 3.0 | \- | Tự động sinh tài liệu API tương tác trực tiếp (`/api/docs`), hỗ trợ kiểm thử toàn bộ luồng đặt hàng và đối soát. | 
| **Đóng gói Môi trường** | Docker & Docker Compose | v2+ | Khởi tạo tức thì cụm dịch vụ CSDL MySQL 8.0 và công cụ quản trị phpMyAdmin/Adminer chỉ với một câu lệnh. | 

## 4. Cấu trúc Monorepo Chi tiết (Source Code Structure)

Dự án được tổ chức theo chuẩn Monorepo với cấu trúc phân cấp chặt chẽ, thể hiện rõ trách nhiệm của từng thư mục và tệp mã nguồn:

```
med-affiliate-saas/
├── .env.example                                      # Tệp mẫu khai báo biến môi trường chuẩn cho toàn bộ hệ thống
├── .gitignore                                        # Quy tắc loại trừ tệp nhạy cảm (.env), node_modules và build cache
├── README.md                                         # Bản đồ kiến trúc, tài liệu tổng quan và hướng dẫn vận hành dự án
│
├── infrastructure/                                   # HẠ TẦNG DEVOPS & CONTAINER HÓA CỤM DỊCH VỤ DỮ LIỆU
│   ├── docker-compose.yml                            # Kịch bản khởi chạy container môi trường Dev (MySQL 8.0 & Adminer)
│   └── docker/                                       # Tài nguyên và scripts cấu hình chi tiết cho container
│       └── mysql/                                    # Cấu hình hệ quản trị cơ sở dữ liệu MySQL 8.0
│           ├── init.sql                              # Kịch bản SQL thiết lập bảng mã UTF8MB4 và cấu hình múi giờ +07:00
│           └── my.cnf                                # Tham số tối ưu hóa InnoDB Transaction Isolation (REPEATABLE-READ)
│
├── backend/                                          # PHÂN HỆ BACKEND — KIẾN TRÚC MODULAR MONOLITH (NESTJS + PRISMA)
│   ├── package.json                                  # Quản lý dependencies, scripts chạy dev, build, migrate, seed và test
│   ├── tsconfig.json                                 # Cấu hình TypeScript compiler, path aliases (@/...) cho Backend
│   ├── nest-cli.json                                 # Cấu hình công cụ dòng lệnh NestJS CLI và Swagger plugin
│   ├── .env.example                                  # Biến môi trường mẫu cục bộ dành riêng cho dịch vụ Backend
│   ├── prisma/                                       # TẦNG DỮ LIỆU & ÁNH XẠ CSDL QUAN HỆ (PRISMA ORM)
│   │   ├── schema.prisma                             # Định nghĩa toàn bộ Models (Tenants, Users, Packages, Tiers, Vouchers, Orders, Wallets...)
│   │   ├── migrations/                               # Lịch sử các bước di chuyển cấu trúc CSDL sinh ra bởi Prisma Migrate
│   │   └── seed.ts                                   # Script bơm dữ liệu mẫu (Chi nhánh Long Xuyên/Châu Đốc, Gói khám, CTV, Đơn mẫu)
│   ├── test/                                         # KIỂM THỬ HỆ THỐNG BACKEND
│   │   ├── wallet-reconciliation.e2e-spec.ts         # Kịch bản kiểm thử E2E luồng nổ hoa hồng tự động và chống lệch số dư Ví
│   │   └── jest-e2e.json                             # Cấu hình môi trường thực thi kiểm thử Jest cho E2E
│   └── src/                                          # MÃ NGUỒN CHÍNH THỨC CỦA BACKEND ỨNG DỤNG
│       ├── main.ts                                   # Điểm khởi động (Bootstrap): CORS, ValidationPipe, Swagger Setup
│       ├── app.module.ts                             # Root Module liên kết toàn bộ module nghiệp vụ và hạ tầng dùng chung
│       │
│       ├── common/                                   # CÁC THÀNH PHẦN DÙNG CHUNG XUYÊN SUỐT BACKEND
│       │   ├── constants/                            # Định nghĩa hằng số hệ thống, Role enums, Order/Transaction status
│       │   ├── decorators/                           # Custom Decorators: @CurrentUser(), @Roles(), @TenantId(), @Public()
│       │   ├── filters/                              # Xử lý ngoại lệ tập trung: HttpExceptionFilter, PrismaExceptionFilter
│       │   ├── guards/                               # Lớp bảo vệ 3 tầng: JwtAuthGuard, RolesGuard (RBAC), TenantIsolationGuard
│       │   ├── interceptors/                         # Biến đổi dữ liệu: TransformInterceptor, FinancialAuditInterceptor
│       │   └── pipes/                                # Tiện ích kiểm tra dữ liệu đầu vào: CustomValidationPipe
│       │
│       ├── config/                                   # QUẢN TRỊ CẤU HÌNH BIẾN MÔI TRƯỜNG TẬP TRUNG
│       │   ├── app.config.ts                         # Đọc và chuẩn hóa cấu hình chung từ process.env
│       │   ├── database.config.ts                    # Tham số kết nối CSDL MySQL 8.0 và Connection Pool
│       │   └── affiliate.config.ts                   # Cấu hình chính sách chống Self-referral và hạn mức rút tiền tối thiểu
│       │
│       ├── infrastructure/                           # DỊCH VỤ LIÊN KẾT HẠ TẦNG
│       │   ├── prisma/                               # Đóng gói Prisma Client dưới dạng NestJS Service và Global Module
│       │   │   ├── prisma.service.ts                 # Service mở rộng PrismaClient xử lý kết nối và Transaction helpers
│       │   │   └── prisma.module.ts                  # Module Provider toàn cục cho PrismaService
│       │   └── qrcode/                               # Đóng gói tiện ích sinh mã QR Code cho Link tiếp thị
│       │       ├── qrcode.service.ts                 # Nghiệp vụ xuất chuỗi ảnh QR Base64/DataURL từ Affiliate Tracking Link
│       │       └── qrcode.module.ts                  # Module xuất bản QrCodeService
│       │
│       └── modules/                                  # 8 PHÂN HỆ NGHIỆP VỤ CỐT LÕI (MODULAR DOMAIN CONTEXTS)
│           │                                         # Mỗi module tuân thủ Clean Layered Architecture:
│           │                                         # ├── controllers/ (Presentation: Nhận Request, trả Response, Swagger)
│           │                                         # ├── services/    (Application: Xử lý Business Logic, ACID Transaction)
│           │                                         # ├── dto/         (Input/Output Data Transfer Objects + Class Validator)
│           │                                         # └── interfaces/  (Domain Types & Contracts)
│           ├── auth/                                 # Module 01: Xác thực JWT, đăng nhập, đăng ký CTV kèm khởi tạo Ví tự động
│           ├── tenants/                              # Module 02: Quản lý Đa chi nhánh/Phòng khám và phân bổ nhân sự cơ sở
│           ├── medical-packages/                     # Module 03: Quản trị Gói khám y tế và cấu hình Bậc hoa hồng lũy tiến (Tiers)
│           ├── affiliate/                            # Module 04: Sinh mã Voucher, Tracking Link, QR Code và thống kê lượt Click
│           ├── orders/                               # Module 05: Đặt mua gói khám, kiểm duyệt ràng buộc (@agu.edu.vn, Self-referral)
│           ├── reconciliation/                       # Module 06: Đối soát hoàn tất khám & Động cơ tính toán nổ hoa hồng tự động
│           ├── wallets/                              # Module 07: Quản lý số dư Ví, lịch sử biến động, Xoay vòng mua gói & Rút tiền
│           └── reports/                              # Module 08: Báo cáo doanh thu đa chi nhánh, bảng xếp hạng CTV xuất sắc
│
├── frontend/                                         # PHÂN HỆ FRONTEND — NEXT.JS APP ROUTER + TAILWIND CSS + SHADCN UI
│   ├── package.json                                  # Quản lý dependencies UI: Next.js, React, TanStack Query, Tailwind, Lucide
│   ├── tsconfig.json                                 # Cấu hình TypeScript compiler cho Next.js
│   ├── next.config.mjs                               # Cấu hình Next.js: Image domains, Redirects và Environment Variables
│   ├── tailwind.config.ts                            # Thiết lập Design System: Bảng màu Y tế (Medical Teal/Blue), Typography
│   ├── postcss.config.js                             # Cấu hình PostCSS nạp Tailwind CSS
│   ├── public/                                       # Tài nguyên tĩnh công khai (Logo phòng khám, Minh họa gói khám, Favicon)
│   └── src/                                          # MÃ NGUỒN CHÍNH THỨC CỦA GIAO DIỆN CLIENT (NEXT.JS APP ROUTER)
│       ├── app/                                      # CẤU TRÚC ĐỊNH TUYẾN PHÂN NHÓM (ROUTE GROUPS)
│       │   ├── layout.tsx                            # Root Layout nạp Providers (QueryClient, Auth, Toast) và Fonts
│       │   ├── globals.css                           # Nhập Tailwind Directives và biến màu Shadcn UI
│       │   │
│       │   ├── (storefront)/                         # [PHÂN HỆ 1] GIAO DIỆN KHÁCH HÀNG / SINH VIÊN ĐẶT GÓI KHÁM
│       │   │   ├── layout.tsx                        # Bố cục Storefront: Header thanh lịch, Banner ưu đãi, Footer
│       │   │   ├── page.tsx                          # Trang chủ: Danh sách Gói khám sức khỏe nổi bật & Bộ lọc theo nhu cầu
│       │   │   ├── packages/[slug]/page.tsx          # Chi tiết gói khám (Tự động bắt ?ref= lưu Cookie & báo giảm giá trực tiếp)
│       │   │   ├── checkout/page.tsx                 # Form đặt lịch khám, chọn Chi nhánh, kiểm tra Voucher & xuất Mã phiếu khám
│       │   │   └── booking-lookup/page.tsx           # Tra cứu trạng thái Phiếu khám điện tử bằng SĐT và Mã đơn
│       │   │
│       │   ├── (auth)/                               # GIAO DIỆN XÁC THỰC NGƯỜI DÙNG
│       │   │   ├── login/page.tsx                    # Đăng nhập tập trung cho Admin, Lễ tân, Nhân viên và CTV
│       │   │   └── register-partner/page.tsx         # Trang đăng ký trở thành Cộng tác viên phân phối gói y tế
│       │   │
│       │   └── (portal)/                             # [PHÂN HỆ 2] GIAO DIỆN QUẢN TRỊ ĐA VAI TRÒ (PROTECTED PORTAL)
│       │       ├── layout.tsx                        # Dashboard Layout: Sidebar động theo Role, Hiển thị số dư Ví trên Header
│       │       ├── partner/                          # Không gian làm việc của Cộng tác viên (Affiliate) & Nhân viên (Staff)
│       │       │   ├── dashboard/page.tsx            # Thống kê thu nhập, Thanh tiến trình nhảy bậc hoa hồng (Tier Progress)
│       │       │   ├── campaigns/page.tsx            # Kho chiến dịch: Nút tạo Mã Voucher, Copy Tracking Link & Tải ảnh QR Code
│       │       │   ├── wallet/page.tsx               # Quản lý Ví điện tử: Biến động số dư, Lệnh rút tiền ngân hàng
│       │       │   └── reinvest/page.tsx             # Xoay vòng dòng tiền: Dùng trực tiếp số dư Ví để mua gói khám mới
│       │       ├── reception/                        # Không gian làm việc của Lễ tân Chi nhánh
│       │       │   ├── check-in/page.tsx             # Quét/Tìm mã Phiếu khám & Nút "Xác nhận Hoàn tất Khám" (Kích hoạt nổ hoa hồng)
│       │       │   └── appointments/page.tsx         # Danh sách bệnh nhân hẹn khám tại chi nhánh trong ngày
│       │       └── admin/                            # Không gian điều hành của Super Admin
│       │           ├── analytics/page.tsx            # Biểu đồ doanh thu toàn chuỗi, tỷ lệ chi trả hoa hồng
│       │           ├── branches/page.tsx             # Quản lý danh sách Chi nhánh (Tenants) và tài khoản Lễ tân
│       │           ├── packages/page.tsx             # Quản lý Gói khám và thiết lập công thức Bậc hoa hồng lũy tiến
│       │           └── withdrawals/page.tsx          # Duyệt lệnh rút tiền của CTV và tải lên chứng từ chuyển khoản
│       │
│       ├── components/                               # THÀNH PHẦN GIAO DIỆN TÁI SỬ DỤNG
│       │   ├── ui/                                   # Các phần tử Shadcn UI: Button, Card, Dialog, Table, Progress, Badge
│       │   ├── affiliate/                            # Component đặc thù: QrCodeModal, ReferralTrackerBanner, TierProgressBar
│       │   └── wallet/                               # Component tài chính: WalletBalanceCard, TransactionHistoryTable
│       │
│       ├── hooks/                                    # CUSTOM REACT HOOKS
│       │   ├── useAuth.ts                            # Quản lý trạng thái đăng nhập và phân quyền hiển thị theo Role
│       │   ├── useReferralCookie.ts                  # Hook tự động bóc tách tham số ?ref= trên URL và lưu trữ bền vững
│       │   └── useWallet.ts                          # Hook truy vấn số dư Ví và thực hiện giao dịch xoay vòng vốn
│       │
│       ├── services/                                 # TẦNG KẾT NỐI API (AXIOS CLIENT)
│       │   ├── apiClient.ts                          # Cấu hình Axios tự động gắn JWT Bearer Token và xử lý lỗi tập trung
│       │   └── endpoints.ts                          # Khai báo toàn bộ hằng số RESTful API Endpoints
│       │
│       └── types/                                    # ĐỊNH NGHĨA KIỂU DỮ LIỆU ĐỒNG BỘ VỚI BACKEND
│           ├── package.types.ts                      # Interface Gói khám và Bậc hoa hồng (CommissionTier)
│           ├── order.types.ts                        # Interface Đơn đặt khám và Trạng thái đối soát
│           └── wallet.types.ts                       # Interface Ví điện tử, Loại biến động số dư và Lệnh rút tiền
│
└── docs/                                             # HỒ SƠ TÀI LIỆU KỸ THUẬT & NGHIỆP VỤ CỦA ĐỒ ÁN
    ├── System_Scope_and_Business_Rules.md            # Đặc tả phạm vi hệ thống và các quy tắc nghiệp vụ Affiliate/Ví bất biến
    ├── Database_Schema_Specification.md              # Đặc tả chi tiết 8 bảng CSDL cốt lõi, khóa ngoại và chỉ mục
    ├── Sequence_Diagrams_Reconciliation.md           # Sơ đồ tuần tự luồng Đặt lịch, Đối soát ACID Transaction và Xoay vòng Ví
    └── API_Testing_Guide_Postman.md                  # Tài liệu kịch bản kiểm thử các ca biên (Edge Cases) trên Postman

```

## 5. Yêu cầu Môi trường & Cài đặt (Prerequisites)

Trước khi tiến hành thiết lập dự án, môi trường máy trạm của lập trình viên cần đáp ứng tối thiểu các công cụ sau:

| Công cụ / Nền tảng | Phiên bản Khuyến nghị | Mục đích Sử dụng | 
| ----- | ----- | ----- | 
| **Node.js** | `>= 20.x LTS` (tối thiểu `18.x`) | Môi trường thực thi JavaScript/TypeScript cho cả NestJS và Next.js. | 
| **NPM / PNPM** | `>= 9.x` | Trình quản lý gói thư viện phụ thuộc. | 
| **MySQL Server** | `>= 8.0` (XAMPP hoặc Docker) | Hệ quản trị CSDL quan hệ hỗ trợ InnoDB ACID Transactions. | 
| **Docker Desktop** | `>= 24.x` *(Tùy chọn)* | Khởi chạy nhanh MySQL 8.0 và Adminer thông qua Docker Compose. | 
| **Git** | `>= 2.40.x` | Hệ thống quản lý phiên bản mã nguồn phân tán. | 
| **Postman** | Latest | Công cụ kiểm thử trực tiếp các API đặt khám và đối soát hoa hồng. | 

> **Note:** Khuyến nghị cài đặt tiện ích mở rộng **Prisma**, **ESLint** và **Tailwind CSS IntelliSense** trên Visual Studio Code để tối ưu hóa tốc độ gõ code và bắt lỗi kiểu dữ liệu tức thì.

## 6. Hướng dẫn Thiết lập Môi trường Phát triển (Quick Start)

Thực hiện lần lượt theo 3 bước tuần tự dưới đây để triển khai toàn bộ hệ thống từ mã nguồn:

### 🚀 Bước 1: Khởi động Cơ sở Dữ liệu MySQL 8.0 (Qua Docker hoặc XAMPP)

Bạn có thể sử dụng trực tiếp MySQL trong XAMPP (tạo database tên `med_affiliate_saas`) hoặc khởi chạy tự động qua Docker Compose:

```
# 1. Di chuyển vào thư mục hạ tầng từ thư mục gốc
cd infrastructure

# 2. Khởi chạy container MySQL 8.0 và Adminer chạy ngầm (-d)
docker compose up -d

# 3. Kiểm tra trạng thái hoạt động của các container
docker compose ps

```

**Thông tin truy cập dịch vụ cơ sở dữ liệu mặc định:**

* **MySQL 8.0:**

  * Địa chỉ kết nối: `localhost:3306`

  * Tên CSDL (Database): `med_affiliate_saas`

  * Tên đăng nhập (User): `root`

  * Mật khẩu (Password): `rootpassword` *(hoặc để trống nếu dùng XAMPP mặc định)*

* **Adminer / phpMyAdmin (Giao diện Quản trị DB trên Web):**

  * Địa chỉ truy cập: `http://localhost:8080`

### ⚙️ Bước 2: Thiết lập và Khởi chạy Phân hệ Backend (NestJS API)

Mở một cửa sổ Terminal mới tại thư mục gốc của dự án:

```
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt toàn bộ thư viện dependencies
npm install

# 3. Thiết lập biến môi trường cục bộ
cp .env.example .env

# 4. Thực thi Prisma Migration để khởi tạo cấu trúc 8 bảng cốt lõi trong MySQL
npx prisma migrate dev --name init_med_affiliate_schema

# 5. Khởi tạo dữ liệu mẫu ban đầu (Seed Data cho kiểm thử và Demo hội đồng)
npx prisma db seed

# 6. Khởi chạy Backend ở chế độ phát triển (Watch Mode)
npm run start:dev

```

Sau khi khởi chạy thành công:

* **Backend API Base URL:** `http://localhost:3001/api/v1`

* **Tài liệu Swagger / OpenAPI Tương tác Trực tiếp:** `http://localhost:3001/api/docs`

### 🎨 Bước 3: Thiết lập và Khởi chạy Phân hệ Frontend (Next.js App Router)

Mở thêm một cửa sổ Terminal độc lập thứ hai:

```
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các gói giao diện và client dependencies
npm install

# 3. Thiết lập biến môi trường Frontend
cp .env.example .env.local

# 4. Khởi chạy Next.js Development Server
npm run dev

```

Sau khi Next.js khởi chạy thành công:

* **Giao diện Storefront (Khách hàng / Sinh viên đặt khám):** `http://localhost:3000`

* **Giao diện Quản trị & Ví Cộng tác viên (Portal):** `http://localhost:3000/login`

### 🔑 Danh sách Tài khoản Kiểm thử Mặc định (Seed Data)

Hệ thống đã nạp sẵn 5 tài khoản đại diện cho 5 tác nhân nghiệp vụ để phục vụ công tác chạy thử và bảo vệ đồ án:

| Vai trò Hệ thống (Role) | Địa chỉ Email Đăng nhập | Mật khẩu Mặc định | Chi nhánh (`Tenant`) | Ghi chú Trách nhiệm Kiểm thử | 
| ----- | ----- | ----- | ----- | ----- | 
| **Super Admin** | `admin@medsaas.vn` | `Admin@123` | Toàn hệ thống (`NULL`) | Tạo gói khám, cấu hình bậc hoa hồng, duyệt lệnh rút tiền. | 
| **Branch Receptionist** | `letan.lx@medsaas.vn` | `Reception@123` | Chi nhánh Long Xuyên | Tra cứu phiếu khám, bấm "Hoàn tất khám" để nổ hoa hồng. | 
| **Internal Staff** | `nhanvien.lx@medsaas.vn` | `Staff@123` | Chi nhánh Long Xuyên | Bán chéo gói khám, nhận mức hoa hồng thưởng cố định $5\%$. | 
| **Affiliate Partner (CTV)** | `tin.ctv@agu.edu.vn` | `Partner@123` | Tự do (Đa chi nhánh) | Tạo Link/QR Code, hưởng hoa hồng lũy tiến $10\% \rightarrow 15\%$, xoay vòng Ví. | 
| **Student / Customer** | `sv.test@agu.edu.vn` | *Không cần ĐN* | Chọn khi đặt khám | Đặt mua gói khám qua Link giới thiệu, nhận ưu đãi giảm giá. | 

## 7. Quy chuẩn Phát triển & Đóng góp Mã nguồn (Git Flow)

Để đảm bảo tính nhất quán, dễ dàng truy vết lịch sử làm việc và bảo vệ mã nguồn trong suốt 15 tuần thực hiện đồ án, dự án áp dụng quy chuẩn quản lý phiên bản sau:

### 7.1. Chiến lược Phân nhánh (Branching Strategy)

```
       (hotfix/*)
           ▲
           │
main ──────┴─────────────────────────────────● (Release / Defense-Ready v1.0.0)
             ▲
             │ (Pull Request / Self-Review)
develop ─────┴─────────────●─────────────────
               ▲           ▲
               │           │
feature/* ─────┴───────────┘

```

* `main`: Nhánh ổn định cao nhất, chứa mã nguồn hoàn chỉnh sẵn sàng để mang đi chấm điểm / bảo vệ. Tuyệt đối không code trực tiếp trên `main`.

* `develop`: Nhánh tích hợp chính qua từng Sprint (từ Sprint 1 đến Sprint 6).

* `feature/<sprint>-<tên-module>`: Nhánh phát triển từng tính năng cụ thể. Ví dụ: `feature/s2-auth-multitenant`, `feature/s3-affiliate-qrcode`, `feature/s4-wallet-transaction`.

* `fix/<tên-lỗi>`: Nhánh sửa lỗi phát sinh trong quá trình kiểm thử. Ví dụ: `fix/self-referral-validation`.

### 7.2. Quy chuẩn Thông điệp Commit (Conventional Commits)

Mỗi commit bắt buộc tuân thủ định dạng `<type>(<scope>): <subject>`:

* **Các loại tiền tố (`Type`):**

  * `feat`: Bổ sung tính năng mới (API hoặc màn hình giao diện).

  * `fix`: Sửa lỗi logic tính toán hoa hồng, lỗi giao diện hoặc ràng buộc dữ liệu.

  * `docs`: Cập nhật tệp `README.md`, sơ đồ CSDL hoặc tài liệu báo cáo.

  * `refactor`: Tái cấu trúc code sạch hơn mà không làm thay đổi hành vi nghiệp vụ.

  * `test`: Bổ sung kịch bản kiểm thử tự động hoặc cập nhật dữ liệu `seed.ts`.

  * `chore`: Cập nhật thư viện `package.json`, cấu hình Prisma hoặc Docker.

* **Ví dụ mẫu chuẩn trong dự án:**

  * `feat(affiliate): generate tracking url and base64 qr code for voucher`

  * `feat(reconciliation): implement acid transaction for tiered commission payout`

  * `feat(wallet): allow purchasing medical package using available wallet balance`

  * `fix(orders): block self-referral voucher usage when fraud rule is enabled`

  * `docs(readme): add complete monorepo architecture and setup guide`

## 8. Bảo mật, Toàn vẹn Tài chính & Quản lý Biến môi trường

### 8.1. Nguyên tắc An toàn Thông tin Bất biến

> **Caution:** Tuyệt đối không đẩy tệp `.env`, `.env.local` hoặc bất kỳ khóa bí mật nào (`DATABASE_URL`, `JWT_SECRET`) lên kho lưu trữ GitHub.

Mọi tệp chứa cấu hình nhạy cảm đều đã được khai báo loại trừ trong `.gitignore`. Khi clone dự án sang máy tính mới, lập trình viên chỉ cần sao chép từ tệp `.env.example` và điền thông số cục bộ.

### 8.2. Danh mục Biến Môi trường Cốt lõi

Tệp `backend/.env.example` định nghĩa các thông số chuẩn hóa cho hệ thống:

| Tên Biến Môi trường | Kiểu Dữ liệu | Giá trị Mặc định (Local Dev) | Mục đích & Giải thích Nghiệp vụ | 
| ----- | ----- | ----- | ----- | 
| `NODE_ENV` | `string` | `development` | Chế độ thực thi ứng dụng (`development` / `production`). | 
| `PORT` | `number` | `3001` | Cổng lắng nghe HTTP Requests của Backend NestJS. | 
| `DATABASE_URL` | `string` | `mysql://root:rootpassword@localhost:3306/med_affiliate_saas` | Chuỗi URI kết nối định danh tới MySQL 8.0 qua Prisma ORM. | 
| `JWT_SECRET` | `string` | `super_secret_jwt_med_saas_agu_2026` | Khóa bí mật dùng để ký và xác thực JSON Web Token. | 
| `JWT_EXPIRES_IN` | `string` | `7d` | Thời hạn hiệu lực của phiên đăng nhập. | 
| `FRONTEND_URL` | `string` | `http://localhost:3000` | Đường dẫn gốc dùng để ghép thành Affiliate Tracking Link và cấu hình CORS. | 
| `ALLOW_SELF_REFERRAL` | `boolean` | `false` | Cấu hình cho phép (`true`) hoặc chặn (`false`) CTV tự nhập mã của chính mình. | 
| `MIN_WITHDRAWAL_AMOUNT` | `number` | `100000` | Hạn mức số dư tối thiểu ($100.000\text{ VNĐ}$) để CTV được phép tạo lệnh rút tiền. | 

### 8.3. Cơ chế Bảo mật Đa tầng & Chống Gian lận Tài chính (Core Technical Highlights)

1. **Đảm bảo Tính Toàn vẹn Dữ liệu Tài chính (Financial Data Integrity):**

   * Toàn bộ quá trình chuyển trạng thái đơn khám sang `COMPLETED`, tính toán bậc hoa hồng, cộng tiền vào bảng `wallets` và ghi sổ cái `wallet_transactions` được thực thi bên trong khối **Interactive Transaction (`prisma.$transaction`)**. Nếu bất kỳ bước nào gặp sự cố, toàn bộ giao dịch sẽ tự động `Rollback`, đảm bảo không bao giờ xảy ra hiện tượng lệch tiền hoặc cộng hoa hồng lặp 2 lần (Idempotency).

   * Khi CTV thực hiện rút tiền hoặc dùng số dư Ví để mua gói khám xoay vòng, hệ thống kiểm tra điều kiện số dư khả dụng $\text{balance} \ge \text{amount}$ ngay trong giao dịch khóa dòng để ngăn chặn tấn công **Double Spending** (bấm rút tiền liên tục nhiều lần cùng lúc).

2. **Cơ chế Chống Gian lận Tiếp thị Liên kết (Affiliate Fraud Prevention):**

   * **Cơ chế Hoa hồng Tạm tính (`Pending Commission`):** Khi sinh viên đặt lịch trên web, hoa hồng chỉ được ghi nhận ở trạng thái tạm tính. Tiền chỉ thực sự chảy vào số dư khả dụng (`Available Balance`) khi Lễ tân tại phòng khám xác nhận khách đã đến khám và thanh toán thực tế, triệt tiêu hoàn toàn hành vi tạo đơn hàng ảo.

   * **Kiểm soát Tự mua (`Self-Referral Detection`):** Hệ thống đối chiếu định danh (Số điện thoại / Email / User ID) của người đặt khám với chủ sở hữu mã Voucher. Nếu phát hiện trùng khớp, hệ thống sẽ chặn giao dịch hoặc gắn cờ `is_self_referral = true` tùy theo cấu hình quản trị.

   * **Ràng buộc Đối tượng Mục tiêu (`Targeted Domain Validation`):** Hỗ trợ cấu hình các gói khám ưu đãi đặc thù chỉ cho phép áp dụng mã giảm giá khi khách hàng xác thực bằng địa chỉ email sinh viên trường (`@agu.edu.vn`).

3. **Cô lập Dữ liệu Đa Chi nhánh (`Logical Multi-Tenant Isolation`):**

   * Thông qua `TenantIsolationGuard` và Custom Decorator `@TenantId()`, mọi truy vấn đơn hàng và lịch hẹn của tài khoản cấp Chi nhánh đều tự động đính kèm điều kiện lọc `WHERE tenant_id = current_user.tenant_id`, ngăn chặn tuyệt đối việc Chi nhánh A xem hoặc xác nhận nhầm phiếu khám của Chi nhánh B.

## 9. Tài liệu Nghiệp vụ & Kỹ thuật Liên quan

Dự án đi kèm bộ hồ sơ thiết kế kỹ thuật phục vụ trực tiếp cho việc viết cuốn báo cáo tốt nghiệp tại thư mục `/docs`:

* 📘 **Đặc tả Quy tắc Nghiệp vụ & Công thức Hoa hồng (`System_Scope_and_Business_Rules.md`):** Trình bày chi tiết công thức toán học tính hoa hồng lũy tiến theo bậc doanh số tháng và quy trình xoay vòng dòng tiền trong Ví.

* 📗 **Đặc tả Cơ sở Dữ liệu Quan hệ (`Database_Schema_Specification.md`):** Chi tiết cấu trúc 8 bảng dữ liệu (`tenants`, `users`, `medical_packages`, `commission_tiers`, `vouchers`, `orders`, `wallets`, `wallet_transactions`), giải thích các khóa ngoại và ràng buộc toàn vẹn.

* 📙 **Sơ đồ Tuần tự & Luồng Dữ liệu (`Sequence_Diagrams_Reconciliation.md`):** Các sơ đồ Use Case, Activity Diagram và Sequence Diagram vẽ sẵn bằng mã PlantUML/Mermaid để đưa vào báo cáo.

* 📕 **Hướng dẫn Kiểm thử Kịch bản Bảo vệ (`API_Testing_Guide_Postman.md`):** Danh sách các bước chạy Demo trực tiếp trước giảng viên hướng dẫn (từ lúc CTV lấy mã QR $\rightarrow$ Sinh viên đặt gói $\rightarrow$ Lễ tân duyệt khám $\rightarrow$ Tiền nổ vào Ví $\rightarrow$ CTV dùng tiền Ví mua gói khám mới).

## 10. Hướng dẫn Cài đặt & Khởi chạy Toàn diện (Development Setup)

### 10.1. Cấu hình Mẫu Tối thiểu cho Backend (`backend/.env`)

```
NODE_ENV=development
PORT=3001

# Kết nối Cơ sở dữ liệu MySQL 8.0
DATABASE_URL="mysql://root:rootpassword@localhost:3306/med_affiliate_saas"

# Cấu hình JWT Authentication
JWT_SECRET="super_secret_jwt_med_saas_agu_2026"
JWT_EXPIRES_IN="7d"

# Cấu hình Hệ thống Affiliate & Ví điện tử
FRONTEND_URL="http://localhost:3000"
ALLOW_SELF_REFERRAL=false
MIN_WITHDRAWAL_AMOUNT=100000

```

### 10.2. Cấu hình Mẫu Tối thiểu cho Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

```

### 10.3. Bảng Kiểm tra Vận hành Thử nghiệm (Verification Checklist)

Sau khi khởi chạy đầy đủ các dịch vụ, bạn có thể kiểm tra nhanh toàn bộ hệ thống qua bảng đối chiếu sau:

| Phân hệ Dịch vụ | Địa chỉ Truy cập (URL) | Nội dung Kiểm tra & Nghiệm thu | 
| ----- | ----- | ----- | 
| **Storefront (Web Khách hàng)** | `http://localhost:3000` | Hiển thị danh sách gói khám y tế, thử truy cập kèm `?ref=TIN_AG50` để kiểm tra thông báo tự động áp mã giảm giá. | 
| **Partner & Admin Portal** | `http://localhost:3000/login` | Đăng nhập bằng tài khoản CTV (`tin.ctv@agu.edu.vn`), kiểm tra màn hình lấy mã QR Code và số dư Ví hoa hồng. | 
| **Backend REST API** | `http://localhost:3001/api/v1/health` | Trả về JSON `{ "status": "ok", "database": "connected" }`. | 
| **Swagger OpenAPI Docs** | `http://localhost:3001/api/docs` | Giao diện thử nghiệm trực tiếp toàn bộ API của 8 modules nghiệp vụ. | 
| **Quản trị CSDL (Adminer/phpMyAdmin)** | `http://localhost:8080` | Kiểm tra trực quan dữ liệu nhảy trong bảng `orders`, `wallets` và `wallet_transactions` sau khi bấm duyệt khám. | 

**ĐỒ ÁN TỐT NGHIỆP ĐẠI HỌC — KHOA CÔNG NGHỆ THÔNG TIN — TRƯỜNG ĐẠI HỌC AN GIANG (ĐHQG-HCM)**

*Sinh viên thực hiện: Nguyễn Hoàng Uy (MSSV: DTH235812 — Lớp: DH24TH3)*

*Giảng viên định hướng chuyên môn: TS. Huỳnh Phước Hải*

*Bản quyền tài liệu và mã nguồn thuộc về Tác giả © 2026.*