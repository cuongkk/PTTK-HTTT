# Phân công – Phần Phân tích nghiệp vụ (30%)

## Đồ án CSC12004 – HomeStay Dorm | Nhóm 5 người

---

## Yêu cầu cần nộp (30 điểm)

| #   | Sản phẩm                       | Mô tả                                    |
| --- | ------------------------------ | ---------------------------------------- |
| 1   | **Use Case Diagram** nghiệp vụ | Sơ đồ tổng thể 4 UC + 4 Actor            |
| 2   | **Đặc tả Use Case** nghiệp vụ  | Luồng chính + luồng thay thế cho từng UC |
| 3   | **Activity Diagram**           | Sơ đồ hoạt động cho từng UC              |

---

## Phân công theo Use Case

> Chiến lược: **1 người – 1 Use Case** (đặc tả + activity diagram).  
> Người 1 (leader) đảm nhiệm thêm UC Diagram tổng thể.  
> Người 5 chuyên tổng hợp, review và viết phần giới thiệu hệ thống.

---

### 👑 Người 1 – Nhóm trưởng + UC2: Đặt cọc & Xác nhận thuê

**Sản phẩm chính:**

- [ ] Vẽ **Use Case Diagram nghiệp vụ tổng thể**
  - 4 Actor: Khách hàng, Sale, Quản lý, Kế toán
  - 4 Use Case chính trong system boundary
  - Đường nối Actor – UC đúng chuẩn UML
- [ ] **Đặc tả UC2** – Đặt cọc & Xác nhận thuê

| Mục            | Nội dung                                            |
| -------------- | --------------------------------------------------- |
| Actor          | Khách hàng, Sale, Quản lý, Kế toán                  |
| Mục tiêu       | Xác nhận giữ chỗ phòng/giường bằng tiền cọc         |
| Tiền điều kiện | Khách đã xem phòng và quyết định đặt cọc (UC1)      |
| Hậu điều kiện  | Cọc ghi nhận hệ thống, phòng/giường bị khóa         |
| Luồng chính    | 15 bước (từ xác nhận thuê → ghi nhận hệ thống)      |
| Luồng thay thế | Phòng đã cọc; khách không TT trong 24h; TT thay đổi |

- [ ] Vẽ **Activity Diagram UC2** (bao gồm nhánh: phòng hết, quá hạn 24h, xác nhận thất bại)

**Điều phối thêm:**

- [ ] Thống nhất **template đặc tả** cho cả nhóm dùng (tuần 1)
- [ ] Review sản phẩm của NV2, NV3, NV4 trước khi tổng hợp

---

### 👤 Người 2 – UC1: Đăng ký thuê & Xem phòng

**Sản phẩm chính:**

- [ ] **Đặc tả UC1** – Đăng ký thuê & Xem phòng

| Mục            | Nội dung                                                                          |
| -------------- | --------------------------------------------------------------------------------- |
| Actor          | Khách hàng, Nhân viên Sale                                                        |
| Mục tiêu       | Tiếp nhận nhu cầu, tìm phòng phù hợp, dẫn khách xem phòng                         |
| Tiền điều kiện | Khách hàng có nhu cầu thuê phòng/giường                                           |
| Hậu điều kiện  | Khách đã xem phòng và đưa ra quyết định                                           |
| Luồng chính    | 10 bước (liên hệ → cung cấp TT → kiểm tra phòng → lịch xem → tư vấn → quyết định) |
| Luồng thay thế | Không có phòng phù hợp; hẹn xem lại; điều chỉnh tiêu chí                          |

- [ ] Vẽ **Activity Diagram UC1** (bao gồm nhánh: không có phòng, hẹn lại, điều chỉnh tiêu chí)

---

### 👤 Người 3 – UC3: Nhận phòng & Ký hợp đồng

**Sản phẩm chính:**

- [ ] **Đặc tả UC3** – Nhận phòng & Ký hợp đồng

| Mục            | Nội dung                                                                |
| -------------- | ----------------------------------------------------------------------- |
| Actor          | Khách hàng, Sale, Quản lý, Kế toán                                      |
| Mục tiêu       | Hoàn tất thủ tục pháp lý, bàn giao phòng chính thức                     |
| Tiền điều kiện | Khách đã đặt cọc thành công (UC2)                                       |
| Hậu điều kiện  | Hợp đồng ký xong, tiền đầu kỳ thu xong, phòng bàn giao                  |
| Luồng chính    | 14 bước (đến nhận phòng → kiểm tra → ký HĐ → thanh toán → bàn giao)     |
| Luồng thay thế | Cá nhân không đạt điều kiện; thành viên nhóm không đạt; không đồng ý HĐ |

> **Lưu ý riêng:** Cần đặc tả rõ nhánh **thuê nhóm** (bước 5: thu thập thành viên, loại người không đủ điều kiện, kiểm tra số giường còn đủ không)

- [ ] Vẽ **Activity Diagram UC3** (bao gồm nhánh: cá nhân/nhóm không đạt, loại thành viên)

---

### 👤 Người 4 – UC4: Trả phòng & Hoàn cọc

**Sản phẩm chính:**

- [ ] **Đặc tả UC4** – Trả phòng & Hoàn cọc

| Mục            | Nội dung                                                                     |
| -------------- | ---------------------------------------------------------------------------- |
| Actor          | Khách hàng, Sale, Quản lý, Kế toán                                           |
| Mục tiêu       | Kết thúc hợp đồng, đối soát chi phí, hoàn trả tiền cọc                       |
| Tiền điều kiện | Khách đang cư trú theo hợp đồng (UC3)                                        |
| Hậu điều kiện  | HĐ thanh lý, tiền cọc xử lý xong, phòng/giường = Trống                       |
| Luồng chính    | 14 bước (đăng ký trả → kiểm tra phòng → tính hoàn cọc → đối soát → thanh lý) |
| Luồng thay thế | Không đồng ý đối soát; chi phí > cọc được hoàn; không có chi phí phát sinh   |

> **Lưu ý riêng:** Cần mô tả rõ **bảng tỷ lệ hoàn cọc** và **logic khấu trừ** trong đặc tả

| Trường hợp                  | Tỷ lệ hoàn cơ bản |
| --------------------------- | :---------------: |
| Chưa ký hợp đồng            |      **80%**      |
| Đã ký HĐ, lưu trú < 6 tháng |      **50%**      |
| Đã ký HĐ, lưu trú > 6 tháng |      **70%**      |
| Hết hạn hợp đồng            |     **100%**      |

- [ ] Vẽ **Activity Diagram UC4** (bao gồm 4 nhánh tỷ lệ hoàn + nhánh dư/thiếu tiền)

---

### 👤 Người 5 – Tổng hợp & Phần giới thiệu hệ thống

> Người 5 không phụ trách UC riêng, thay vào đó đảm bảo **chất lượng và tính nhất quán** của toàn bộ phần nghiệp vụ.

**Sản phẩm chính:**

- [ ] Viết **phần giới thiệu hệ thống** trong báo cáo:
  - Ngữ cảnh nghiệp vụ (tóm tắt từ đề bài)
  - Mô tả 4 Actor và vai trò của từng người
  - Tổng quan 4 giai đoạn vòng đời thuê phòng
- [ ] Viết **bảng tổng hợp Use Case** và mối liên hệ giữa các UC (`<<include>>`, `<<extend>>` nếu có)
- [ ] **Review** đặc tả của NV2, NV3, NV4:
  - Kiểm tra đủ bước chính / bước thay thế
  - Kiểm tra nhất quán Actor – hành động
  - Kiểm tra tiền/hậu điều kiện đúng logic
- [ ] **Chuẩn hóa format** toàn bộ sản phẩm nghiệp vụ (font, heading, cách viết bước)
- [ ] **Merge** tất cả vào file báo cáo phần nghiệp vụ

---

## Lịch thực hiện – Phần nghiệp vụ

| Tuần       | Công việc                                          | Ai làm             |
| ---------- | -------------------------------------------------- | ------------------ |
| **Tuần 1** | Họp nhóm, đọc đề, thống nhất template đặc tả UC    | Cả nhóm (NV1 dẫn)  |
| **Tuần 2** | NV1 vẽ UC Diagram tổng thể; NV2/3/4 bắt đầu đặc tả | NV1, NV2, NV3, NV4 |
| **Tuần 3** | Hoàn thiện đặc tả + Activity Diagram               | NV2, NV3, NV4      |
| **Tuần 4** | NV1 review; NV5 tổng hợp + chuẩn hóa               | NV1, NV5           |

---

## Template đặc tả Use Case (dùng chung cho NV1–4)

```
USE CASE: [Tên UC]
────────────────────────────────────────────────────
Mã UC            : UC[X]
Tên đầy đủ       : [...]
Actor chính      : [...]
Actor phụ        : [...]
Mục tiêu         : [Một câu mô tả mục đích]
Tiền điều kiện   : [Điều kiện phải thỏa trước khi bắt đầu]
Hậu điều kiện    : [Trạng thái hệ thống sau khi hoàn thành]

LUỒNG CHÍNH
  Bước 1 : [Actor] – [Hành động cụ thể]
  Bước 2 : [Actor] – [Hành động cụ thể]
  ...

LUỒNG THAY THẾ
  [Xa] Nếu [điều kiện phát sinh ở bước X]:
       → [Hành động xử lý]
       → [Kết quả / bước tiếp theo]

LUỒNG NGOẠI LỆ
  [EX1] [Mô tả tình huống lỗi / bất thường]
        → [Cách hệ thống xử lý]

RÀNG BUỘC NGHIỆP VỤ
  - [Quy tắc nghiệp vụ quan trọng liên quan]
```

---

## Checklist nghiệm thu phần nghiệp vụ

| Hạng mục                                      | NV phụ trách | Hoàn thành |
| --------------------------------------------- | ------------ | :--------: |
| Use Case Diagram tổng thể (4 UC + 4 Actor)    | NV1          |     ☐      |
| Đặc tả UC1 (đủ luồng chính + thay thế)        | NV2          |     ☐      |
| Activity Diagram UC1                          | NV2          |     ☐      |
| Đặc tả UC2 (đủ luồng chính + thay thế)        | NV1          |     ☐      |
| Activity Diagram UC2                          | NV1          |     ☐      |
| Đặc tả UC3 (đủ luồng chính + thay thế + nhóm) | NV3          |     ☐      |
| Activity Diagram UC3                          | NV3          |     ☐      |
| Đặc tả UC4 (đủ luồng chính + bảng tỷ lệ hoàn) | NV4          |     ☐      |
| Activity Diagram UC4                          | NV4          |     ☐      |
| Phần giới thiệu hệ thống + Actor              | NV5          |     ☐      |
| Review & chuẩn hóa toàn bộ                    | NV5          |     ☐      |
