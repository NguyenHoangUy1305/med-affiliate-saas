# 🎯 BẢNG THEO DÕI TIẾN ĐỘ DỰ ÁN MED-AFFILIATE SAAS (30 NGÀY)

> **Dự án Cá nhân — Personal Project**  
> **Tác giả / Nhà phát triển:** Nguyễn Hoàng Uy  
> **Mục tiêu:** Xây dựng hoàn chỉnh từ zero đến hệ sinh thái sẵn sàng triển khai thực tế trong 30 ngày.

---

## 📊 DASHBOARD TIẾN ĐỘ TỔNG QUAN

- **Trạng thái:** 🚀 Đang khởi động (Tuần 1: Nền tảng & CSDL)
- **Tiến độ tổng thể:** `[■□□□□□□□□□] 3% (1/30 Ngày)`
- **Nhánh Git làm việc hàng ngày:** `dev` (Sau mỗi ngày commit: `feat(...)` hoặc `docs(...)`)
- **Nhánh Release bảo vệ:** `main` (Chỉ merge khi hoàn thành mốc tuần)

| Giai đoạn (Tuần) | Mục tiêu Cốt lõi | Thời gian | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Tuần 1 (Ngày 01 - 07)** | Chuẩn hóa Cổng Mạng, Database Schema (Prisma + MySQL), Auth & Multi-tenant RBAC | Ngày 01 – 07 | 🟡 Đang thực hiện |
| **Tuần 2 (Ngày 08 - 14)** | Quản lý Gói Khám, Engine Affiliate (Link, QR, Cookie) & Đặt lịch Khám | Ngày 08 – 14 | ⚪ Chưa bắt đầu |
| **Tuần 3 (Ngày 15 - 21)** | Động cơ Đối soát ACID Hoa hồng Lũy tiến, Ví điện tử, Xoay vòng vốn & Rút tiền | Ngày 15 – 21 | ⚪ Chưa bắt đầu |
| **Tuần 4 (Ngày 22 - 28)** | Báo cáo Doanh thu, Hoàn thiện UI Full Flow (Storefront, CTV, Lễ tân, Admin) | Ngày 22 – 28 | ⚪ Chưa bắt đầu |
| **Nghiệm thu (Ngày 29 - 30)** | Kiểm thử E2E Kịch bản Demo, Triển khai Cloud (Vercel + Cloud DB), Đóng gói | Ngày 29 – 30 | ⚪ Chưa bắt đầu |

---

## 🗓️ CHI TIẾT LỘ TRÌNH TỪNG NGÀY (DAY-BY-DAY ROADMAP)

### 🟢 TUẦN 1: HẠ TẦNG, CƠ SỞ DỮ LIỆU & XÁC THỰC PHÂN QUYỀN (NGÀY 01 – 07)

#### 📍 Ngày 01: Chuẩn hóa Cổng Cấu hình Môi trường & Khắc phục Đảo ngược Port
- [x] Kiểm tra và xác nhận hiện tượng đảo port: Backend chiếm 3000, Frontend bị đẩy sang 3001.
- [x] Tạo file `backend/.env` với `PORT=3001` và sửa `backend/src/main.ts` mặc định nghe `3001`.
- [x] Tạo file `frontend/.env.local` với `NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api/v1"`.
- [x] Tạo file `backend/.env.example` và `frontend/.env.example`.
- [x] Tạo file `infrastructure/docker-compose.yml` để chạy MySQL 8.0 & Adminer (hoặc dùng MySQL XAMPP).
- [ ] Khởi động lại: Đảm bảo `localhost:3000` mở ra Next.js (Frontend), `localhost:3001` mở ra NestJS (Backend).

#### 📍 Ngày 02: Thiết kế Schema Cơ sở Dữ liệu Prisma ORM (8 Bảng Cốt lõi)
- [ ] Cài đặt Prisma vào Backend: `npm install @prisma/client` và `npm install -D prisma`.
- [ ] Khởi tạo Prisma: `npx prisma init`.
- [ ] Định nghĩa các model trong `backend/prisma/schema.prisma`:
  - `Tenant` (Chi nhánh phòng khám: Long Xuyên, Châu Đốc...).
  - `User` (5 Roles: SUPER_ADMIN, BRANCH_RECEPTIONIST, INTERNAL_STAFF, AFFILIATE_PARTNER, CUSTOMER).
  - `MedicalPackage` (Danh mục gói khám y tế).
  - `CommissionTier` (Bậc hoa hồng lũy tiến theo số lượng đơn trong tháng).
- [ ] Định nghĩa tiếp các model giao dịch:
  - `Voucher` (Mã giảm giá, liên kết User sở hữu, số lần dùng, hạn dùng).
  - `Order` (Đơn đặt khám: mã phiếu khám, tenant_id, package_id, affiliate_user_id, status, tổng tiền).
  - `Wallet` (Ví điện tử của CTV/Nhân viên: số dư khả dụng, số dư tạm giữ).
  - `WalletTransaction` (Sổ cái biến động số dư: nổ hoa hồng, xoay vòng mua gói, rút tiền).
- [ ] Chạy migration lần đầu: `npx prisma migrate dev --name init_schema`.

#### 📍 Ngày 03: Viết Script Bơm Dữ liệu Mẫu (Seed Data) Phục vụ Kiểm thử
- [ ] Viết file `backend/prisma/seed.ts`:
  - Tạo 2 Chi nhánh: *Phòng khám Đa khoa Long Xuyên* và *Chi nhánh Châu Đốc*.
  - Tạo 4 tài khoản thử nghiệm băm mật khẩu bằng `bcrypt`:
    - Admin: `admin@medsaas.vn`
    - Lễ tân: `letan.lx@medsaas.vn`
    - CTV: `tin.ctv@agu.edu.vn`
    - Nhân viên: `nhanvien.lx@medsaas.vn`
  - Tạo 3 Gói khám mẫu (Khám sức khỏe SV AGU, Tầm soát tổng quát, Khám tim mạch chuyên sâu).
  - Cấu hình các bậc hoa hồng mẫu: Bậc 1 (1-5 đơn: 10%), Bậc 2 (6-15 đơn: 12%), Bậc 3 (>15 đơn: 15%).
- [ ] Cấu hình `package.json` backend để gọi `ts-node prisma/seed.ts`.
- [ ] Chạy `npx prisma db seed` và kiểm tra dữ liệu bằng Prisma Studio (`npx prisma studio`).

#### 📍 Ngày 04: Xây dựng Module Prisma & Cấu hình Toàn cục Backend (NestJS)
- [ ] Cài đặt các gói tiện ích: `@nestjs/config`, `class-validator`, `class-transformer`, `@nestjs/swagger`.
- [ ] Tạo module `PrismaModule` và `PrismaService` dùng chung toàn hệ thống (`@Global()`).
- [ ] Cấu hình Swagger trong `backend/src/main.ts` tại endpoint `/api/docs`.
- [ ] Cấu hình `ValidationPipe` toàn cục (tự động whitelist và kiểm tra DTO).
- [ ] Cấu hình CORS để cho phép Frontend từ `http://localhost:3000` gọi sang.

#### 📍 Ngày 05: Xây dựng Module Xác thực (Auth Module - JWT & Multi-tenant Role)
- [ ] Cài đặt: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`, `@types/bcrypt`.
- [ ] Tạo `AuthModule`, `AuthService`, `AuthController`.
- [ ] Viết API `POST /api/v1/auth/login`: Xác thực email/password, trả về Access Token JWT chứa `sub`, `role`, `tenantId`.
- [ ] Viết API `POST /api/v1/auth/register-partner`: Cho phép đối tác đăng ký làm CTV, **tự động tạo ngay 1 bản ghi `Wallet` số dư 0 VNĐ** trong cùng một transaction.
- [ ] Viết API `GET /api/v1/auth/me`: Lấy thông tin user hiện tại kèm số dư ví.

#### 📍 Ngày 06: Xây dựng Lớp Bảo vệ 3 Tầng (Guards & Decorators)
- [ ] Tạo `JwtAuthGuard` kiểm tra tính hợp lệ của token.
- [ ] Tạo `RolesGuard` và Decorator `@Roles(...)` để phân quyền RBAC (Role-based Access Control).
- [ ] Tạo `TenantIsolationGuard` và Decorator `@TenantId()` để tự động khóa phạm vi dữ liệu theo đúng chi nhánh của Lễ tân.
- [ ] Viết Custom Decorator `@CurrentUser()` để lấy thông tin người dùng trong Controller.

#### 📍 Ngày 07: Quản trị Đa Chi nhánh (Tenants Module) & Kiểm thử Tuần 1
- [ ] Xây dựng `TenantsModule`:
  - `GET /api/v1/tenants`: Danh sách chi nhánh (công khai cho trang đặt khám chọn chi nhánh).
  - `POST /api/v1/tenants`: Tạo chi nhánh mới (chỉ Super Admin).
- [ ] Viết Unit Test / Postman collection test toàn bộ luồng Auth và Tenant.
- [ ] **Review Tuần 1:** Kiểm tra toàn bộ code hoạt động tốt, commit lên nhánh `dev`, tạo PR merge vào `main`.

---

### 🟡 TUẦN 2: GÓI Y TẾ, AFFILIATE ENGINE & LUỒNG ĐẶT KHÁM (NGÀY 08 – 14)

#### 📍 Ngày 08: Module Gói Khám Y tế (Medical Packages & Tiers)
- [ ] Xây dựng `MedicalPackagesModule`:
  - `GET /api/v1/packages`: Lấy danh sách gói khám đang hoạt động (Public cho Storefront).
  - `GET /api/v1/packages/:slug`: Lấy chi tiết gói khám theo đường dẫn thân thiện.
  - `POST /api/v1/packages`: Tạo mới hoặc cập nhật gói khám (Chỉ Super Admin).
- [ ] Thiết lập bảng cấu hình Bậc hoa hồng (Commission Tiers) liên kết theo từng gói hoặc chung toàn hệ sinh thái.

#### 📍 Ngày 09: Động cơ Sinh Link Affiliate, Mã QR Code & Voucher
- [ ] Cài đặt thư viện QR Code: `npm install qrcode` và `npm install -D @types/qrcode`.
- [ ] Xây dựng `AffiliateModule`:
  - `POST /api/v1/affiliate/vouchers`: CTV tạo mã Voucher cá nhân (ví dụ: `UY_AGU50`).
  - `GET /api/v1/affiliate/my-campaigns`: Danh sách Voucher, Link giới thiệu và ảnh QR của CTV đang đăng nhập.
  - Service tự động tạo chuỗi URL: `http://localhost:3000/packages/kham-suc-khoe-tong-quat?ref=UY_AGU50`.
  - Service xuất ảnh QR dưới dạng Base64 Data URL để hiển thị trực tiếp trên web hoặc tải về in ấn.

#### 📍 Ngày 10: Cơ chế Chống Gian lận (Affiliate Fraud & Abuse Prevention)
- [ ] Viết hàm kiểm tra mã giảm giá: `POST /api/v1/affiliate/validate-voucher`.
- [ ] Xử lý ràng buộc chống Self-referral: Nếu người dùng đặt khám dùng chính SĐT hoặc Email của CTV tạo mã -> Báo lỗi hoặc không tính hoa hồng.
- [ ] Xử lý ràng buộc sinh viên: Nếu gói khám yêu cầu đuôi `@agu.edu.vn`, bắt buộc email khách hàng phải hợp lệ mới cho kích hoạt voucher.
- [ ] Kiểm tra giới hạn số lần sử dụng của Voucher.

#### 📍 Ngày 11: Module Đơn Đặt Khám (Orders Module - Storefront Booking)
- [ ] Xây dựng `OrdersModule`:
  - `POST /api/v1/orders`: Khách hàng tạo phiếu đặt khám.
  - Thu thập thông tin: Tên bệnh nhân, SĐT, Email, Chi nhánh khám (`tenant_id`), Ngày hẹn khám, Mã voucher giới thiệu (`voucher_code`).
  - Sinh **Mã Phiếu Khám Điện Tử duy nhất** (Booking Code, ví dụ: `MED-202610-A9X2`).
  - Trạng thái ban đầu: `PENDING` (Chờ đến khám).
  - Hoa hồng ghi nhận ở trạng thái `COMMISSION_PENDING` (Tạm tính, chưa cộng vào số dư thực tế).

#### 📍 Ngày 12: Thiết lập Giao diện Frontend Storefront (Next.js)
- [ ] Cài đặt thư viện UI cho Frontend: `lucide-react`, `axios`, `clsx`, `tailwind-merge`.
- [ ] Thiết lập Layout Storefront y tế: Header (Logo, Hotline, Đăng ký CTV), Banner, Footer.
- [ ] Tạo Trang chủ Storefront (`frontend/src/app/(storefront)/page.tsx`):
  - Hiển thị danh sách gói khám với hình ảnh, giá gốc, giá ưu đãi.
  - Bộ lọc gói khám theo nhu cầu (Sinh viên, Người lớn tuổi, Tầm soát tim mạch).

#### 📍 Ngày 13: Trang Chi tiết Gói Khám & Cơ chế Lưu Cookie Giới thiệu
- [ ] Xây dựng Hook `useReferralCookie`:
  - Tự động bắt tham số `?ref=...` trên URL khi khách click vào link tiếp thị.
  - Lưu vào Cookie trình duyệt với thời hạn 30 ngày (Last-click attribution).
- [ ] Thiết kế trang Chi tiết gói khám (`/packages/[slug]`):
  - Hiển thị danh mục các xét nghiệm trong gói khám.
  - Hiển thị banner thông báo: *"Bạn đang nhận ưu đãi đặc biệt từ Cộng tác viên..."* nếu có cookie giới thiệu.

#### 📍 Ngày 14: Trang Đặt Khám (Checkout) & Tra cứu Phiếu Khám
- [ ] Thiết kế Form Checkout:
  - Chọn Chi nhánh phòng khám (Long Xuyên / Châu Đốc).
  - Nhập thông tin liên hệ và ngày hẹn.
  - Tự động điền mã giới thiệu từ Cookie (cho phép nhập tay nếu quét QR ngoài quầy).
  - Hiển thị Mã phiếu khám điện tử kèm mã QR sau khi đặt thành công.
- [ ] Thiết kế trang Tra cứu phiếu khám (`/booking-lookup`): Nhập SĐT để xem lịch hẹn.
- [ ] **Review Tuần 2:** Kiểm tra luồng từ Click Link -> Nhận Cookie -> Tạo đơn -> Lưu DB thành công.

---

### 🟠 TUẦN 3: ĐỘNG CƠ ĐỐI SOÁT ACID, VÍ ĐIỆN TỬ & XOAY VÒNG DÒNG TIỀN (NGÀY 15 – 21)

#### 📍 Ngày 15: Module Lễ tân Chi nhánh (Reception Module - Tra cứu & Check-in)
- [ ] Xây dựng API cho Lễ tân:
  - `GET /api/v1/reception/orders`: Lấy danh sách phiếu khám đã đặt tại đúng chi nhánh của lễ tân (`Tenant Isolation`).
  - `GET /api/v1/reception/orders/lookup?code=...`: Tra cứu nhanh theo Mã phiếu khám hoặc SĐT bệnh nhân.

#### 📍 Ngày 16: Động cơ Đối soát Hoa hồng Tự động (Reconciliation Engine with ACID Transaction)
- [ ] Xây dựng API `POST /api/v1/reconciliation/confirm-completion`:
  - Lễ tân bấm nút *"Xác nhận Hoàn tất Dịch vụ Khám"*.
  - Kiểm tra trạng thái đơn: Phải đang là `PENDING`.
  - Chuyển trạng thái đơn sang `COMPLETED`.
  - **Kích hoạt Interactive Transaction (`prisma.$transaction`)**:
    - Bước 1: Đếm tổng số đơn hoàn thành của CTV trong tháng để xác định Bậc hoa hồng (Tier 1, 2 hay 3).
    - Bước 2: Tính số tiền hoa hồng thực nhận = `Giá gói khám * % Bậc hoa hồng`.
    - Bước 3: Khóa dòng (`Row-level Lock`) ví của CTV, cộng tiền vào `balance`.
    - Bước 4: Tạo một bản ghi `WalletTransaction` ghi nhận biến động `COMMISSION_PAYOUT`.
- [ ] Đảm bảo tính Idempotency: Không cho phép xác nhận 2 lần trên 1 đơn hàng.

#### 📍 Ngày 17: Module Ví Điện tử (Wallets Module - Tra cứu & Biến động Số dư)
- [ ] Xây dựng `WalletsModule`:
  - `GET /api/v1/wallets/my-wallet`: Lấy số dư hiện tại của CTV/Nhân viên.
  - `GET /api/v1/wallets/transactions`: Xem lịch sử biến động số dư (sắp xếp mới nhất).
  - `GET /api/v1/wallets/tier-status`: Thống kê doanh số tháng này và số đơn cần đạt để lên bậc hoa hồng tiếp theo.

#### 📍 Ngày 18: Nghiệp vụ Xoay Vòng Vốn (Cash-flow Rotation)
- [ ] Xây dựng API `POST /api/v1/wallets/reinvest-package`:
  - Cho phép CTV dùng trực tiếp số dư ví hoa hồng để mua gói khám mới cho khách hàng hoặc người thân.
  - Thực thi ACID Transaction:
    - Kiểm tra `wallet.balance >= package.price`.
    - Trừ tiền ví ngay lập tức, ghi nhận Transaction `WALLET_PURCHASE`.
    - Sinh đơn hàng `COMPLETED` ngay và cấp Mã phiếu khám điện tử cho CTV trao tay khách.

#### 📍 Ngày 19: Nghiệp vụ Yêu cầu Rút tiền Ngân hàng (Withdrawal Flow)
- [ ] Xây dựng API `POST /api/v1/wallets/request-withdrawal`:
  - CTV gửi lệnh rút tiền: Số tiền muốn rút, Tên ngân hàng, Số tài khoản, Tên chủ thẻ.
  - Kiểm tra điều kiện: Số dư khả dụng $\ge 100.000\text{ VNĐ}$ (`MIN_WITHDRAWAL_AMOUNT`).
  - Đóng băng số tiền rút sang trạng thái `HOLD` (Trừ số dư khả dụng, đưa vào số dư tạm giữ).
- [ ] Xây dựng API cho Admin:
  - `GET /api/v1/admin/withdrawals`: Danh sách các lệnh rút tiền đang chờ duyệt.
  - `POST /api/v1/admin/withdrawals/:id/approve`: Duyệt lệnh (Upload mã giao dịch ngân hàng).
  - `POST /api/v1/admin/withdrawals/:id/reject`: Từ chối lệnh (Hoàn tiền lại vào số dư khả dụng của CTV).

#### 📍 Ngày 20: Kiểm thử E2E Toàn vẹn Dữ liệu Tài chính (ACID & Concurrency Test)
- [ ] Viết kịch bản kiểm thử giả lập gửi 5 request đồng thời bấm rút tiền cùng 1 lúc (Chống Double-spending).
- [ ] Kiểm thử trường hợp lỗi giữa chừng trong transaction: Kiểm tra xem CSDL có tự Rollback số dư ví không.
- [ ] Đo đạc thời gian nổ hoa hồng đảm bảo dưới 500ms.

#### 📍 Ngày 21: Hoàn thiện Giao diện Lễ tân Chi nhánh (Receptionist Web Portal)
- [ ] Thiết kế trang `/portal/reception/check-in`:
  - Ô tìm kiếm mã phiếu khám nhanh (hỗ trợ bấm Enter tra cứu).
  - Hiển thị thông tin bệnh nhân, gói khám, chi nhánh.
  - Nút bấm to, rõ ràng: **"XÁC NHẬN HOÀN TẤT DỊCH VỤ"**.
  - Modal thông báo kết quả: Đã duyệt khám thành công và tự động giải ngân hoa hồng.
- [ ] **Review Tuần 3:** Kiểm tra trọn vẹn luồng cốt lõi: Khách khám -> Lễ tân duyệt -> Nổ hoa hồng vào Ví -> CTV thấy tiền nhảy thời gian thực.

---

### 🔵 TUẦN 4: PORTAL QUẢN TRỊ, BÁO CÁO & HOÀN THIỆN TOÀN BỘ UI (NGÀY 22 – 28)

#### 📍 Ngày 22: Giao diện Không gian Làm việc CTV (Partner Portal)
- [ ] Thiết kế Dashboard CTV (`/portal/partner/dashboard`):
  - Card hiển thị Số dư Ví hoa hồng khả dụng.
  - Thanh tiến trình Bậc hoa hồng (Tier Progress Bar: ví dụ: *"Bạn đã bán 7 đơn, còn 3 đơn nữa để lên Bậc 3 hưởng 15%"*).
  - Biểu đồ số đơn và thu nhập 7 ngày gần nhất.

#### 📍 Ngày 23: Trang Quản lý Chiến dịch CTV (Campaigns & QR Sharing)
- [ ] Thiết kế trang `/portal/partner/campaigns`:
  - Danh sách các Voucher đã tạo.
  - Nút "Tạo Voucher mới".
  - Nút "Sao chép Link tiếp thị".
  - Nút "Mở mã QR Code" và chức năng tải ảnh QR về máy (hỗ trợ CTV in tờ rơi hoặc đăng story Zalo/Facebook).

#### 📍 Ngày 24: Trang Ví Điện tử & Xoay Vòng Vốn Trên Giao diện
- [ ] Thiết kế trang Ví (`/portal/partner/wallet`):
  - Bảng lịch sử giao dịch rõ ràng (màu xanh cho tiền vào, màu đỏ cho tiền rút/mua gói).
  - Form tạo lệnh rút tiền về tài khoản ngân hàng.
- [ ] Thiết kế trang Mua gói bằng Ví (`/portal/partner/reinvest`):
  - Chọn gói khám -> Kiểm tra số dư ví -> Bấm "Thanh toán bằng số dư ví" -> Nhận ngay mã phiếu khám.

#### 📍 Ngày 25: Phân hệ Báo cáo Doanh thu & Quản trị Toàn chuỗi (Reports Module)
- [ ] Xây dựng `ReportsModule` Backend:
  - `GET /api/v1/reports/overview`: Thống kê tổng doanh thu toàn chuỗi, tổng hoa hồng đã chi, số đơn hoàn thành, số CTV đang hoạt động.
  - `GET /api/v1/reports/top-affiliates`: Bảng xếp hạng Top 5 CTV có doanh số cao nhất tháng.
  - `GET /api/v1/reports/revenue-by-tenant`: Doanh thu phân bổ theo từng Chi nhánh phòng khám.

#### 📍 Ngày 26: Giao diện Điều hành Super Admin
- [ ] Thiết kế trang `/portal/admin/analytics`:
  - Bảng số liệu thống kê KPI và biểu đồ doanh thu.
  - Bảng xếp hạng đối tác xuất sắc.
- [ ] Thiết kế trang `/portal/admin/branches`: Quản lý danh sách chi nhánh và cấp tài khoản lễ tân.
- [ ] Thiết kế trang `/portal/admin/packages`: Bật/tắt gói khám, chỉnh sửa giá và bậc hoa hồng.
- [ ] Thiết kế trang `/portal/admin/withdrawals`: Danh sách duyệt tiền và nút xác nhận đã chuyển khoản.

#### 📍 Ngày 27: Hoàn thiện Authentication Frontend & Phân quyền Điều hướng
- [ ] Tạo Trang Đăng nhập chung (`/login`): Tự động phân luồng (Admin vào Admin Portal, Lễ tân vào Reception, CTV vào Partner Dashboard).
- [ ] Tạo Trang Đăng ký Đối tác (`/register-partner`): Form đăng ký làm CTV dành cho sinh viên/nhân viên ngoài.
- [ ] Bảo vệ Route bằng Next.js Middleware: Ngăn chặn tài khoản Lễ tân truy cập vào trang Admin hoặc CTV truy cập trang Check-in.

#### 📍 Ngày 28: Tối ưu Hóa Giao diện, Hiệu ứng & Trải nghiệm Người dùng (UX/UI Polish)
- [ ] Tích hợp thông báo Toast mượt mà khi copy link, áp mã thành công, rút tiền thành công.
- [ ] Thêm Skeleton Loading khi tải dữ liệu từ API.
- [ ] Tối ưu hiển thị responsive hoàn hảo trên điện thoại di động (Mobile First cho Storefront và Partner Portal).
- [ ] **Review Tuần 4:** Kiểm tra tất cả các màn hình hoạt động trơn tru không có lỗi Console.

---

### 🟣 TUẦN VỀ ĐÍCH: KIỂM THỬ E2E, TRIỂN KHAI CLOUD & BẢO VỆ (NGÀY 29 – 30)

#### 📍 Ngày 29: Kịch bản Kiểm thử Toàn diện & Chuẩn bị Demo Hội đồng
- [ ] Chạy lại Script Seed Data sạch: Khởi tạo dữ liệu mẫu hoàn hảo.
- [ ] Thực hiện kịch bản Demo liên hoàn 6 bước trước Hội đồng:
  1. *Bước 1 (Super Admin):* Tạo chi nhánh Long Xuyên và tạo Gói khám SV 199k.
  2. *Bước 2 (CTV Tín):* Đăng nhập lấy Link và mã QR chứa mã giới thiệu.
  3. *Bước 3 (Khách hàng):* Quét QR/Click link trên điện thoại -> Đặt khám giữ chỗ -> Nhận mã phiếu `MED-...`.
  4. *Bước 4 (Lễ tân):* Đăng nhập cổng Lễ tân -> Nhập mã phiếu -> Bấm "Xác nhận Hoàn tất Dịch vụ".
  5. *Bước 5 (Kiểm toán Hệ thống):* Tiền hoa hồng nổ ngay tức khắc vào Ví của CTV Tín theo đúng bậc %.
  6. *Bước 6 (Xoay vòng vốn):* CTV Tín dùng số dư vừa nhận mua ngay một gói tầm soát mới.
- [ ] Chụp lại các màn hình kịch bản để chuẩn bị đưa vào Slide thuyết trình và Cuốn báo cáo tốt nghiệp.

#### 📍 Ngày 30: Triển khai Lên Môi trường Thực tế (Production Deployment) & Đóng gói
- [ ] Cấu hình Backend triển khai lên Cloud (Render / Railway / VPS):
  - Kết nối MySQL Cloud (Aiven / Railway MySQL / PlanetScale).
  - Chạy Prisma Migration trên Production.
- [ ] Cấu hình Vercel cho Frontend:
  - Đảm bảo Root Directory là `frontend`.
  - Cấu hình Environment Variable `NEXT_PUBLIC_API_BASE_URL` trỏ về API Backend trên Cloud.
- [ ] Kiểm tra kết nối HTTPS thực tế trên tên miền Vercel.
- [ ] Đóng gói tài liệu báo cáo: Cập nhật sơ đồ CSDL, tài liệu API Swagger, sẵn sàng bảo vệ đạt điểm tối đa!

---

## 📝 HƯỚNG DẪN CẬP NHẬT TIẾN ĐỘ HÀNG NGÀY

1. Mỗi ngày khi bắt đầu làm việc, mở file này và xem các mục tiêu của ngày tương ứng.
2. Khi hoàn thành xong một việc, đổi `[ ]` thành `[x]`.
3. Commit Git với định dạng chuẩn:
   ```bash
   git add .
   git commit -m "feat(day-X): hoàn thành nhiệm vụ ... theo lộ trình"
   git push origin dev
   ```
4. Khi gặp vấn đề kỹ thuật khó hiểu hoặc lỗi lạ: Trao đổi trực tiếp để được hướng dẫn giải thích cặn kẽ ý tưởng trước khi viết code!
