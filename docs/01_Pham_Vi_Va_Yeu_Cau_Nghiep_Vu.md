# 📘 DOC-01: PHẠM VI HỆ THỐNG & ĐẶC TẢ YÊU CẦU NGHIỆP VỤ

> **Dự án:** MedAffiliate SaaS Platform  
> **Tác giả:** Nguyễn Hoàng Uy  
> **Trọng tâm nghiệp vụ:** Phân phối Gói khám Y tế & Động cơ Đối soát Hoa hồng Tự động

---

## 1. ĐỊNH VỊ SẢN PHẨM & RANH GIỚI HỆ THỐNG

### 1.1. Những gì hệ thống THỰC HIỆN (In-Scope)
- **Thương mại điện tử dịch vụ y tế:** Giới thiệu và đặt lịch các gói khám sức khỏe tổng quát, tầm soát chuyên sâu tại phòng khám đa khoa.
- **Mạng lưới tiếp thị liên kết (Affiliate Engine):** Cung cấp công cụ cho Cộng tác viên (CTV) và Nhân viên: Link tracking có gắn mã Cookie, Mã QR chia sẻ nhanh, Mã Voucher giảm giá.
- **Đối soát hoa hồng tự động (Instant Reconciliation):** Tự động tính toán và giải ngân hoa hồng vào ví CTV theo cơ chế lũy tiến ngay khi Lễ tân xác nhận bệnh nhân hoàn tất khám.
- **Ví điện tử & Xoay vòng vốn (Cash-flow Rotation):** Cho phép CTV rút tiền về tài khoản ngân hàng hoặc dùng số dư hoa hồng để mua ngay gói khám mới cho người thân/khách hàng.
- **Kiểm soát đa chi nhánh (Multi-tenancy):** Phân tách và bảo vệ dữ liệu độc lập giữa các cơ sở phòng khám (Long Xuyên, Châu Đốc...).

### 1.2. Những gì hệ thống KHÔNG THỰC HIỆN (Out-of-Scope)
- Không quản lý kho dược phẩm, kiểm kê thuốc vật lý (Pharmacy Inventory) như các phần mềm HIS bệnh viện cồng kềnh.
- Không lưu trữ bệnh án chi tiết hay kết quả chẩn đoán hình ảnh (tránh rủi ro bảo mật y khoa và pháp lý HIPAA).

---

## 2. CÁC TÁC NHÂN HỆ THỐNG (5 ACTORS) & PHÂN QUYỀN RBAC

Hệ thống phân chia 5 vai trò rõ ràng theo nguyên tắc **Phân định trách nhiệm (Separation of Concerns)**:

| STT | Tác nhân (Actor) | Mã Role | Phạm vi Truy cập | Trách nhiệm Cốt lõi |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Quản trị viên** | `SUPER_ADMIN` | Toàn hệ thống (`tenant_id = NULL`) | Quản lý Chi nhánh, tạo gói khám, cấu hình bậc hoa hồng, duyệt lệnh rút tiền, xem báo cáo toàn chuỗi. |
| **2** | **Lễ tân Chi nhánh** | `BRANCH_RECEPTIONIST` | Tại chi nhánh trực thuộc (`WHERE tenant_id = current_tenant`) | Tra cứu mã phiếu khám, bấm **"Xác nhận Hoàn tất Dịch vụ"** để kích hoạt giải ngân hoa hồng. |
| **3** | **Nhân viên Nội bộ** | `INTERNAL_STAFF` | Tại chi nhánh trực thuộc | Bán chéo gói khám, nhận mức hoa hồng cố định (ví dụ: 5%), theo dõi ví thưởng nội bộ. |
| **4** | **Cộng tác viên (CTV)** | `AFFILIATE_PARTNER` | Tự do (Đa chi nhánh) | Tạo link giới thiệu, mã QR, hưởng hoa hồng lũy tiến (10% - 15%), rút tiền hoặc xoay vòng vốn mua gói. |
| **5** | **Khách hàng / Sinh viên** | `CUSTOMER` | Storefront công khai | Xem danh mục gói khám, áp mã giảm giá, đặt lịch giữ chỗ, nhận mã phiếu khám điện tử. |

---

## 3. BỐN QUY TẮC NGHIỆP VỤ BẤT BIẾN (CORE BUSINESS INVARIANTS)

Để đảm bảo hệ thống không bao giờ bị gian lận hoặc sai lệch tài chính, mã nguồn bắt buộc phải tuân thủ 4 quy tắc bất biến sau:

### Quy tắc 1: Cơ chế Hoa hồng Tạm tính (No Fake Orders)
- Khi khách hàng đặt lịch trên Storefront, hoa hồng được ghi nhận ở trạng thái `COMMISSION_PENDING`.
- Tiền **chỉ thực sự chảy vào số dư khả dụng (`balance`)** của CTV khi Lễ tân tại phòng khám bấm xác nhận khách đã đến khám thực tế (`COMPLETED`).
- ➔ *Mục đích:* Triệt tiêu 100% tình trạng CTV tự tạo đơn ảo để chiếm đoạt hoa hồng.

### Quy tắc 2: Công thức Bậc Hoa hồng Lũy tiến (Tiered Commission)
Hoa hồng của CTV tự động nhảy bậc dựa trên tổng số đơn hoàn tất thành công trong tháng:

$$\text{Hoa hồng Thực nhận} = \text{Giá Gói Khám} \times \text{Tỷ lệ Bậc hiện tại (\% prob)}$$

| Bậc (Tier) | Tên Bậc | Điều kiện Đơn Trong Tháng | Tỷ lệ Hoa hồng |
| :---: | :--- | :---: | :---: |
| **Bậc 1** | Khởi động | $1 - 5\text{ đơn}$ | **10%** |
| **Bậc 2** | Tăng tốc | $6 - 15\text{ đơn}$ | **12%** |
| **Bậc 3** | Bứt phá | $\ge 16\text{ đơn}$ | **15%** |

*(Ghi chú: Nhân viên nội bộ hưởng mức cố định 5% bất kể số lượng đơn).*

### Quy tắc 3: Chống Tự Mua Trục Lợi (Self-Referral Fraud Prevention)
- Khi khách hàng nhập mã Voucher hoặc bấm Link tiếp thị, hệ thống đối chiếu Số điện thoại và Email của người đặt với CTV sở hữu mã.
- Nếu phát hiện trùng lặp: Hệ thống chặn áp dụng voucher hoặc gắn cờ `is_self_referral = true` và không trả hoa hồng cho đơn này.

### Quy tắc 4: Toàn vẹn Số dư Ví (Strict Non-negative Balance)
- Số dư khả dụng của ví điện tử không bao giờ được phép âm: $\text{balance} \ge 0$.
- Khi CTV thực hiện rút tiền hoặc xoay vòng mua gói khám: Hệ thống dùng khóa dòng (`Row-level Locking`) kiểm tra điều kiện $\text{balance} \ge \text{amount}$ ngay trong giao dịch CSDL để ngăn chặn triệt để tấn công bấm liên tục (Double Spending).
- Hạn mức rút tiền tối thiểu: $100.000\text{ VNĐ}$ / lệnh.
