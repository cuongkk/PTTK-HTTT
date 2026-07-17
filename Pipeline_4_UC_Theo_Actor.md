# Pipeline thao tác 4 UC theo actor

## UC1 — PHONG_UC1

**Dữ liệu ban đầu:** Phòng ghép 4 giường; giường 1–4 đều `trong`. Khách đăng ký 2 người.

| Bước | Actor | Thao tác |
|---:|---|---|
| 1 | Khách hàng | Chọn `PHONG_UC1`, nhập thông tin và gửi đăng ký thuê cho 2 người. |
| 2 | Sale | Tiếp nhận hồ sơ, kiểm tra phòng có 4 giường trống và xếp lịch xem phòng. |
| 3 | Khách hàng | Mở lịch xem, xem thông tin phòng và xác nhận bắt đầu xem phòng. |
| 4 | Sale | Sau buổi xem, xác nhận khách đã hoàn thành xem phòng. |
| 5 | Khách hàng | Gửi yêu cầu đặt cọc cho 2 giường. |
| 6 | Sale | Rà soát thông tin khách thuê và chuyển hồ sơ cho Quản lý. |
| 7 | Quản lý | Kiểm tra thực tế và xác nhận còn đủ 2 giường trống. |
| 8 | Khách hàng | Xem và xác nhận đồng ý điều kiện thuê, nội quy ký túc xá. |
| 9 | Hệ thống | Tạo phiếu đặt cọc và liên kết giường 1, giường 2 với phiếu cọc. |
| 10 | Kế toán | Tính tiền cọc cho 2 giường và gửi yêu cầu thanh toán cho khách hàng. |
| 11 | Khách hàng | Quét QR, thanh toán và nhấn xác nhận thanh toán thành công. |
| 12 | Kế toán | Kiểm tra minh chứng và xác nhận giao dịch thanh toán cọc. |
| 13 | Hệ thống | Chuyển giường 1–2 sang `da_dat_coc`; giữ giường 3–4 là `trong`. |

**Kết quả:** Giường 1–2 `da_dat_coc`; giường 3–4 `trong`.

---

## UC2 — PHONG_UC2

**Dữ liệu ban đầu:** Nguyên phòng, sức chứa 2 người; phòng và giường 1–2 đều `trong`. Khách đăng ký thuê nguyên phòng.

| Bước | Actor | Thao tác |
|---:|---|---|
| 1 | Khách hàng | Chọn `PHONG_UC2`, nhập thông tin 2 người và gửi đăng ký thuê nguyên phòng. |
| 2 | Sale | Tiếp nhận hồ sơ, kiểm tra nguyên phòng còn trống và xếp lịch xem. |
| 3 | Khách hàng | Mở lịch xem, xem thông tin phòng và xác nhận bắt đầu xem phòng. |
| 4 | Sale | Sau buổi xem, xác nhận khách đã hoàn thành xem phòng. |
| 5 | Khách hàng | Gửi yêu cầu đặt cọc nguyên phòng. |
| 6 | Sale | Rà soát thông tin khách thuê và chuyển hồ sơ cho Quản lý. |
| 7 | Quản lý | Kiểm tra phòng chưa bị giữ chỗ hoặc đặt cọc và xác nhận còn trống. |
| 8 | Khách hàng | Xem và xác nhận đồng ý điều kiện thuê, nội quy ký túc xá. |
| 9 | Hệ thống | Tạo phiếu đặt cọc và liên kết toàn bộ giường 1–2 của nguyên phòng. |
| 10 | Kế toán | Tính tiền cọc nguyên phòng và gửi yêu cầu thanh toán. |
| 11 | Khách hàng | Quét QR, thanh toán và nhấn xác nhận thanh toán thành công. |
| 12 | Kế toán | Kiểm tra minh chứng và xác nhận giao dịch thanh toán cọc. |
| 13 | Hệ thống | Chuyển phòng, giường 1 và giường 2 sang `da_dat_coc`. |

**Kết quả:** `PHONG_UC2` và giường 1–2 đều `da_dat_coc`.

---

## UC3 — PHONG_UC3

**Dữ liệu ban đầu:** Phòng ghép nữ 4 giường; giường 1–2 `da_dat_coc`, giường 3–4 `trong`. Khách nữ đăng ký 2 người.

| Bước | Actor | Thao tác |
|---:|---|---|
| 1 | Khách hàng | Chọn `PHONG_UC3`, nhập thông tin 2 khách nữ và gửi đăng ký thuê. |
| 2 | Sale | Kiểm tra giới tính, nhận thấy giường 3–4 còn trống và xếp lịch xem phòng. |
| 3 | Khách hàng | Mở lịch xem, xem thông tin phòng và xác nhận bắt đầu xem phòng. |
| 4 | Sale | Sau buổi xem, xác nhận khách đã hoàn thành xem phòng. |
| 5 | Khách hàng | Gửi yêu cầu đặt cọc cho 2 giường còn lại. |
| 6 | Sale | Rà soát giới tính, quốc tịch, giấy tờ và chuyển hồ sơ cho Quản lý. |
| 7 | Quản lý | Kiểm tra theo từng giường và xác nhận giường 3–4 vẫn còn trống. |
| 8 | Khách hàng | Xem và xác nhận đồng ý điều kiện thuê, nội quy ký túc xá. |
| 9 | Hệ thống | Chuẩn hóa giới tính thành `Nu`, tạo phiếu cọc và liên kết giường 3–4. |
| 10 | Kế toán | Tính tiền cọc cho giường 3–4 và gửi yêu cầu thanh toán. |
| 11 | Khách hàng | Quét QR, thanh toán và nhấn xác nhận thanh toán thành công. |
| 12 | Kế toán | Kiểm tra minh chứng và xác nhận giao dịch thanh toán cọc. |
| 13 | Hệ thống | Chuyển giường 3–4 sang `da_dat_coc`; giữ giường 1–2 là `da_dat_coc`. |

**Kết quả:** Cả 4 giường của `PHONG_UC3` đều `da_dat_coc`.

---

## UC4 — PHONG_UC4

**Dữ liệu ban đầu:** Phòng ghép 6 giường; giường 1–3 `dang_thue`, giường 4–6 `trong`. Khách đăng ký 2 người.

| Bước | Actor | Thao tác |
|---:|---|---|
| 1 | Khách hàng | Chọn `PHONG_UC4`, nhập thông tin 2 người và gửi đăng ký thuê ở ghép. |
| 2 | Sale | Không chặn theo trạng thái tổng `dang_thue`; kiểm tra còn 3 giường trống và xếp lịch xem. |
| 3 | Khách hàng | Mở lịch xem, xem thông tin phòng và xác nhận bắt đầu xem phòng. |
| 4 | Sale | Sau buổi xem, xác nhận khách đã hoàn thành xem phòng. |
| 5 | Khách hàng | Gửi yêu cầu đặt cọc cho 2 giường. |
| 6 | Sale | Rà soát thông tin khách thuê và chuyển hồ sơ cho Quản lý. |
| 7 | Quản lý | Kiểm tra theo từng giường và xác nhận còn đủ 2 trong 3 giường trống. |
| 8 | Khách hàng | Xem và xác nhận đồng ý điều kiện thuê, nội quy ký túc xá. |
| 9 | Hệ thống | Tạo phiếu đặt cọc và liên kết giường 4, giường 5. |
| 10 | Kế toán | Tính tiền cọc cho 2 giường và gửi yêu cầu thanh toán. |
| 11 | Khách hàng | Quét QR, thanh toán và nhấn xác nhận thanh toán thành công. |
| 12 | Kế toán | Kiểm tra minh chứng và xác nhận giao dịch thanh toán cọc. |
| 13 | Hệ thống | Giữ giường 1–3 `dang_thue`; chuyển giường 4–5 sang `da_dat_coc`; giữ giường 6 `trong`. |

**Kết quả:** Giường 1–3 `dang_thue`; giường 4–5 `da_dat_coc`; giường 6 `trong`.

---

## Luồng trạng thái hồ sơ dùng chung

```text
moi
→ da_xem_phong
→ cho_sale_ra_soat_coc
→ cho_quan_ly_xac_nhan_coc
→ cho_khach_xac_nhan_dieu_kien_coc
→ cho_ke_toan_tinh_tien_coc
→ cho_khach_thanh_toan_coc
→ da_dat_coc
```

