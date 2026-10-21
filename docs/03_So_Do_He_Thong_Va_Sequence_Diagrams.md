# 📙 DOC-03: SƠ ĐỒ HỆ THỐNG & BIỂU ĐỒ TUẦN TỰ (SEQUENCE DIAGRAMS)

> **Dự án:** MedAffiliate SaaS Platform  
> **Chuẩn mô hình hóa:** UML & Mermaid Diagrams (Tương thích hiển thị 100% trên GitHub)  

---

## 1. SƠ ĐỒ USE CASE TỔNG QUAN (5 TÁC NHÂN)

Biểu đồ mô tả quyền hạn và các ca sử dụng chính của 5 tác nhân trong hệ sinh thái:

```mermaid
flowchart LR
    subgraph Actors["TÁC NHÂN HỆ THỐNG"]
        Admin(["⚙️ Super Admin"])
        Recept(["🏥 Lễ tân Chi nhánh"])
        Staff(["👨‍⚕️ Nhân viên Nội bộ"])
        CTV(["🤝 Cộng tác viên (CTV)"])
        Customer(["🎓 Khách hàng / Sinh viên"])
    end

    subgraph Storefront["PHÂN HỆ STOREFRONT"]
        UC1(["Xem danh mục Gói khám"])
        UC2(["Áp dụng Voucher / Nhận Cookie"])
        UC3(["Đặt lịch & Nhận Mã phiếu khám"])
        UC4(["Tra cứu trạng thái Phiếu khám"])
    end

    subgraph Affiliate["PHÂN HỆ TIẾP THỊ & VÍ"]
        UC5(["Tạo Mã Voucher & Sinh Link QR"])
        UC6(["Theo dõi Bậc hoa hồng (Tiers)"])
        UC7(["Xem biến động Số dư Ví"])
        UC8(["Xoay vòng vốn (Mua gói bằng Ví)"])
        UC9(["Yêu cầu Rút tiền về Ngân hàng"])
    end

    subgraph Branch["PHÂN HỆ ĐỐI SOÁT CHI NHÁNH"]
        UC10(["Tra cứu Phiếu khám tại Quầy"])
        UC11(["Xác nhận Hoàn tất Dịch vụ (ACID)"])
    end

    subgraph Management["PHÂN HỆ ĐIỀU HÀNH CHUỖI"]
        UC12(["Quản trị Chi nhánh (Tenants)"])
        UC13(["Cấu hình Gói khám & Bậc hoa hồng"])
        UC14(["Phê duyệt Lệnh Rút tiền"])
        UC15(["Báo cáo Doanh thu & Kiểm toán Ví"])
    end

    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4

    CTV --> UC5
    CTV --> UC6
    CTV --> UC7
    CTV --> UC8
    CTV --> UC9

    Staff --> UC5
    Staff --> UC7

    Recept --> UC10
    Recept --> UC11

    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
```

---

## 2. BIỂU ĐỒ TUẦN TỰ 1: ĐẶT LỊCH KHÁM & TẠM TÍNH HOA HỒNG

Mô tả luồng tương tác khi khách hàng quét QR / bấm Link tiếp thị của CTV và đặt gói khám:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách hàng / SV
    participant Web as Next.js Storefront
    participant API as NestJS Orders API
    participant DB as MySQL Database

    Note over Customer,Web: Khách bấm Link tiếp thị có tham số ?ref=UY_AGU50
    Customer->>Web: Truy cập trang chi tiết gói khám (?ref=UY_AGU50)
    Web->>Web: useReferralCookie: Lưu mã 'UY_AGU50' vào Cookie (30 ngày)
    Web-->>Customer: Hiển thị giao diện kèm thông báo "Đã nhận ưu đãi từ CTV"

    Customer->>Web: Điền thông tin đặt lịch & bấm "Xác nhận đặt khám"
    Web->>API: POST /api/v1/orders (Kèm thông tin + Voucher UY_AGU50)
    
    API->>DB: Kiểm tra tính hợp lệ của Voucher & Phòng chống Self-referral
    DB-->>API: Voucher hợp lệ (CTV: Nguyễn Văn Tín)
    
    API->>API: Sinh Mã Phiếu Khám duy nhất (ví dụ: MED-202610-A9X2)
    API->>DB: INSERT INTO orders (Status: PENDING, CommissionStatus: PENDING)
    DB-->>API: Lưu đơn thành công
    
    API-->>Web: Trả về kết quả: Mã phiếu khám + QR Code giữ chỗ
    Web-->>Customer: Hiển thị trang hoàn tất & Hướng dẫn đến phòng khám
```

---

## 3. BIỂU ĐỒ TUẦN TỰ 2: ĐỐI SOÁT LỄ TÂN & NỔ HOA HỒNG (ACID TRANSACTION)

Đây là **trọng tâm nghiệp vụ cốt lõi nhất** của dự án. Đảm bảo hoa hồng giải ngân tức thì nhưng an toàn 100%:

```mermaid
sequenceDiagram
    autonumber
    actor Recept as Lễ tân Chi nhánh
    participant Portal as Reception Web Portal
    participant API as NestJS Reconciliation API
    participant Engine as Tiered Commission Engine
    participant DB as MySQL (ACID Transaction)
    actor CTV as Ví của CTV

    Customer->>Recept: Đến phòng khám, đọc Mã phiếu khám (MED-202610-A9X2)
    Recept->>Portal: Nhập mã phiếu khám tra cứu
    Portal->>API: GET /api/v1/reception/orders/lookup?code=...
    API->>DB: SELECT * FROM orders WHERE booking_code = ... AND tenant_id = current_tenant
    DB-->>API: Trả về thông tin đơn hợp lệ
    API-->>Portal: Hiển thị thông tin bệnh nhân & Nút "Xác nhận Hoàn tất Dịch vụ"

    Recept->>Portal: Bấm nút "XÁC NHẬN HOÀN TẤT DỊCH VỤ"
    Portal->>API: POST /api/v1/reconciliation/confirm-completion (orderId)

    rect rgb(240, 248, 255)
        Note over API,DB: BẮT ĐẦU KHỐI GIAO DỊCH NGUYÊN TỬ (PRISMA.$TRANSACTION)
        API->>DB: 1. UPDATE orders SET status = 'COMPLETED', commission_status = 'PAID'
        
        API->>Engine: 2. Tính toán bậc hoa hồng tháng của CTV
        Engine->>DB: Đếm tổng số đơn hoàn tất của CTV trong tháng
        DB-->>Engine: Tổng 8 đơn -> Thuộc BẬC 2 (12%)
        Engine-->>API: Số tiền hoa hồng = Giá gói * 12% = 60.000 VNĐ

        API->>DB: 3. Khóa dòng Ví CTV (SELECT ... FOR UPDATE)
        API->>DB: 4. UPDATE wallets SET balance = balance + 60.000, total_earned = total_earned + 60.000
        API->>DB: 5. INSERT INTO wallet_transactions (amount: +60.000, type: 'COMMISSION_PAYOUT')
        Note over API,DB: HOÀN TẤT GIAO DỊCH (COMMIT TRANSACTION)
    end

    API-->>Portal: Trả về thông báo thành công (200 OK)
    Portal-->>Recept: Hiển thị tick xanh: "Đã xác nhận & Đã chi hoa hồng thành công"
    Note over CTV: CTV mở điện thoại thấy Số dư Ví nhảy ngay tức khắc!
```

---

## 4. BIỂU ĐỒ TUẦN TỰ 3: XOAY VÒNG DÒNG TIỀN (MUA GÓI BẰNG VÍ)

Mô tả tính năng độc đáo: CTV dùng chính số dư hoa hồng để mua trực tiếp gói khám:

```mermaid
sequenceDiagram
    autonumber
    actor CTV as Cộng tác viên (CTV)
    participant Web as Partner Portal
    participant API as NestJS Wallets API
    participant DB as MySQL (ACID Transaction)

    CTV->>Web: Chọn Gói khám mới & Bấm "Thanh toán bằng Số dư Ví"
    Web->>API: POST /api/v1/wallets/reinvest-package (packageId, patientInfo)

    rect rgb(255, 250, 240)
        Note over API,DB: BẮT ĐẦU ACID TRANSACTION
        API->>DB: 1. Khóa dòng Ví CTV (SELECT * FROM wallets WHERE user_id = ... FOR UPDATE)
        DB-->>API: Số dư ví khả dụng: 350.000 VNĐ (Giá gói: 250.000 VNĐ)
        
        API->>API: Kiểm tra điều kiện: balance >= package_price (HỢP LỆ)
        
        API->>DB: 2. Trừ tiền ví: UPDATE wallets SET balance = balance - 250.000
        API->>DB: 3. Ghi sổ cái: INSERT INTO wallet_transactions (amount: -250.000, type: 'PACKAGE_REINVEST')
        API->>DB: 4. Tạo đơn mới: INSERT INTO orders (Status: 'COMPLETED', PaidVia: 'WALLET')
        Note over API,DB: COMMIT TRANSACTION
    end

    API-->>Web: Trả về Phiếu khám điện tử ngay lập tức
    Web-->>CTV: Hiển thị Mã phiếu khám để trao tay cho người thân/khách hàng
```

---

## 5. BIỂU ĐỒ TUẦN TỰ 4: YÊU CẦU RÚT TIỀN VỀ NGÂN HÀNG & ADMIN PHÊ DUYỆT

Mô tả quy trình kiểm soát dòng tiền và giải ngân thù lao:

```mermaid
sequenceDiagram
    autonumber
    actor CTV as Cộng tác viên (CTV)
    participant Web as Partner Portal
    participant API as NestJS Wallets API
    participant DB as MySQL Database
    actor Admin as Super Admin

    CTV->>Web: Nhập số tiền muốn rút (ví dụ: 500.000 VNĐ) + Số tài khoản ngân hàng
    Web->>API: POST /api/v1/wallets/request-withdrawal
    API->>DB: Kiểm tra: balance >= 500.000 và balance >= 100.000 (Min)
    
    API->>DB: Đóng băng tiền: balance = balance - 500.000, locked_balance = locked_balance + 500.000
    API->>DB: INSERT INTO withdrawal_requests (Status: 'PENDING')
    API-->>Web: Tạo lệnh rút tiền thành công (Chờ kế toán/Admin duyệt)

    Admin->>API: GET /api/v1/admin/withdrawals (Xem danh sách lệnh chờ)
    Admin->>Admin: Thực hiện chuyển khoản ngân hàng qua Internet Banking
    Admin->>API: POST /api/v1/admin/withdrawals/:id/approve (Kèm mã giao dịch NH)
    
    API->>DB: Trừ vĩnh viễn locked_balance: locked_balance = locked_balance - 500.000
    API->>DB: UPDATE withdrawal_requests SET status = 'APPROVED'
    API->>DB: INSERT INTO wallet_transactions (amount: -500.000, type: 'WITHDRAWAL')
    
    API-->>Admin: Phê duyệt hoàn tất
```
