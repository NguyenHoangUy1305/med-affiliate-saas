# 📕 DOC-04: HƯỚNG DẪN KIỂM THỬ & KỊCH BẢN DEMO BẢO VỆ

> **Dự án:** MedAffiliate SaaS Platform  
> **Mục tiêu:** Hướng dẫn kịch bản chạy thử nghiệm thực tế (End-to-End Demo Flow) phục vụ báo cáo hội đồng.

---

## 1. DANH SÁCH TÀI KHOẢN KIỂM THỬ MẶC ĐỊNH (SEED DATA)

Toàn bộ tài khoản thử nghiệm được khởi tạo tự động qua lệnh `npx prisma db seed`:

| Tác nhân (Actor) | Email Đăng nhập | Mật khẩu Mặc định | Chi nhánh (`Tenant`) | Trách nhiệm Demo |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@medsaas.vn` | `Admin@123` | Toàn hệ thống (`NULL`) | Cấu hình chi nhánh, xem biểu đồ doanh thu toàn chuỗi, duyệt rút tiền. |
| **Lễ tân Long Xuyên** | `letan.lx@medsaas.vn` | `Reception@123` | Phòng khám Long Xuyên | Tra cứu phiếu khám và bấm "Xác nhận Hoàn tất Dịch vụ" để nổ hoa hồng. |
| **Lễ tân Châu Đốc** | `letan.cd@medsaas.vn` | `Reception@123` | Chi nhánh Châu Đốc | Chứng minh tính năng cô lập dữ liệu (không xem được đơn Long Xuyên). |
| **Cộng tác viên (CTV)** | `tin.ctv@agu.edu.vn` | `Partner@123` | Tự do (Đa chi nhánh) | Lấy link giới thiệu, tải ảnh mã QR, kiểm tra ví tiền nhảy hoa hồng. |
| **Khách hàng / Sinh viên** | `sv.an@agu.edu.vn` | *Không cần mật khẩu* | Tự chọn khi đặt | Truy cập Storefront đặt gói khám y tế. |

---

## 2. KỊCH BẢN DEMO LIÊN HOÀN 6 BƯỚC (GOLDEN DEMO FLOW)

Khi thuyết trình trước Hội đồng hoặc Giảng viên hướng dẫn, bạn chỉ cần thực hiện đúng 6 bước theo kịch bản này:

```
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│ Bước 1: ADMIN  │ ───► │  Bước 2: CTV   │ ───► │ Bước 3: KHÁCH  │
│  Tạo Gói Khám  │      │  Lấy Link/QR   │      │  Đặt Giữ Chỗ   │
└────────────────┘      └────────────────┘      └───────┬────────┘
                                                        │
┌────────────────┐      ┌────────────────┐              │
│ Bước 6: XOAY VỐN│ ◄─── │ Bước 5: KIỂM TOÁN ◄── Bước 4: LỄ TÂN ┘
│ Dùng Ví Mua Gói│      │ Tiền Nổ Vào Ví │      Duyệt Hoàn Tất
└────────────────┘      └────────────────┘
```

### 📍 Bước 1: Super Admin kiểm tra hệ thống
- Đăng nhập tài khoản `admin@medsaas.vn`.
- Mở danh mục Chi nhánh (Long Xuyên, Châu Đốc).
- Mở danh mục Gói khám: Kiểm tra gói *"Khám Sức Khỏe Tân Sinh Viên"* (Giá 200.000 VNĐ).
- Mở cấu hình Bậc hoa hồng: Bậc 1 (10%), Bậc 2 (12%), Bậc 3 (15%).

### 📍 Bước 2: CTV lấy công cụ tiếp thị (Affiliate Tool)
- Mở cửa sổ trình duyệt thứ 2 (hoặc ẩn danh), đăng nhập bằng tài khoản CTV `tin.ctv@agu.edu.vn`.
- Xem số dư ví ban đầu: `0 VNĐ`.
- Vào mục **Chiến dịch**, bấm tạo mã Voucher `TIN_AGU`.
- Bấm **"Sao chép Link tiếp thị"** hoặc bấm **"Xem mã QR Code"**.

### 📍 Bước 3: Khách hàng / Sinh viên đặt gói khám
- Mở tab trình duyệt mới, dán Link tiếp thị vừa sao chép (hoặc quét mã QR):  
  `http://localhost:3000/packages/kham-suc-khoe-tan-sinh-vien?ref=TIN_AGU`
- Trình duyệt tự động lưu cookie giới thiệu.
- Khách điền thông tin:
  - Bệnh nhân: *Nguyễn Văn An*
  - SĐT: `0901000001`
  - Email: `sv.an@agu.edu.vn`
  - Chọn phòng khám: *Phòng khám Đa khoa Long Xuyên*
  - Ngày hẹn: Ngày mai.
- Bấm **"Xác nhận đặt khám"** ➔ Nhận được **Mã phiếu khám điện tử: `MED-202610-A9X2`**.
- *Giải thích trước Hội đồng:* Lúc này đơn ở trạng thái `PENDING`, hoa hồng ở trạng thái `COMMISSION_PENDING`, ví của CTV vẫn là 0đ (không bị đơn ảo).

### 📍 Bước 4: Lễ tân Chi nhánh xác nhận hoàn tất khám (ACID Reconciliation)
- Đăng nhập bằng tài khoản Lễ tân: `letan.lx@medsaas.vn`.
- Nhập mã phiếu `MED-202610-A9X2` vào ô tìm kiếm ➔ Thông tin bệnh nhân hiện ra ngay.
- Lễ tân bấm nút màu xanh to: **"XÁC NHẬN HOÀN TẤT DỊCH VỤ"**.
- *Điểm nhấn kỹ thuật:* Toàn bộ khối lệnh ACID Transaction kích hoạt: Đơn chuyển `COMPLETED`, tính % bậc hoa hồng, khóa dòng ví, cộng tiền và ghi sổ cái giao dịch.

### 📍 Bước 5: Kiểm toán dòng tiền nổ vào ví CTV
- Quay lại màn hình CTV `tin.ctv@agu.edu.vn` và bấm F5:
- Số dư ví lập tức nhảy từ `0 VNĐ` lên `+20.000 VNĐ` (10% của gói 200k).
- Bảng lịch sử giao dịch hiện rõ: `+20.000 VNĐ - Hoa hồng đơn hàng MED-202610-A9X2`.
- Thanh tiến trình Bậc hoa hồng tăng từ 0 đơn lên 1 đơn.

### 📍 Bước 6: Xoay vòng vốn (Cash-flow Rotation)
- CTV dùng chính số dư hoa hồng vừa kiếm được vào mục **"Mua gói bằng Ví"**.
- Nhập thông tin người thân cần khám, bấm **"Thanh toán bằng số dư Ví"**.
- Tiền trong ví bị trừ ngay tức khắc, hệ thống xuất ngay mã phiếu khám mới.

---

## 3. KIỂM THỬ CÁC CA BIÊN CHỐNG GIAN LẬN (EDGE CASES)

| Tình huống Kiểm thử | Thao tác Thực hiện | Kết quả Kỳ vọng | Đánh giá |
| :--- | :--- | :--- | :---: |
| **Chống Self-referral (Tự mua)** | CTV Tín dùng chính SĐT của mình để đặt gói khám qua mã của mình. | Hệ thống thông báo lỗi hoặc không trả hoa hồng cho đơn này. | ✅ Đạt |
| **Chống Rút tiền Âm (Double-spending)** | Giả lập gửi 2 request bấm Rút tiền cùng một thời điểm với số tiền bằng số dư ví. | Chỉ có 1 request thành công, request thứ 2 bị chặn vì số dư không đủ. | ✅ Đạt |
| **Cô lập Đa chi nhánh** | Lễ tân Châu Đốc cố gắng gõ mã đơn của Chi nhánh Long Xuyên. | Hệ thống báo không tìm thấy đơn (404 Not Found do khác tenant_id). | ✅ Đạt |
| **Ràng buộc Email Sinh viên** | Đặt gói khám sinh viên nhưng nhập email `@gmail.com`. | Hệ thống yêu cầu bắt buộc nhập email có đuôi `@agu.edu.vn`. | ✅ Đạt |
