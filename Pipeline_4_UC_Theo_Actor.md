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

**Dữ liệu seed để bắt đầu demo:** hồ sơ `HSUC20000001` của `customer1` đã hoàn thành xem `PHONG_UC2`, trạng thái `da_xem_phong`. Actor thao tác tiếp theo là **Khách hàng**, bắt đầu tại bước 5.

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

**Dữ liệu ban đầu:** Phòng ghép nữ 4 giường; giường 1–2 `da_dat_coc`, giường 3–4 `trong`. Hồ sơ `HSUC30000001` của `customer2` đã thanh toán cọc cho giường 1–2 và chưa có hợp đồng. Actor thao tác đầu tiên của UC3 là **Khách hàng**.

| Bước | Actor | Thao tác |
|---:|---|---|
| 1 | Khách hàng | Mở `PHONG_UC3` trong tab phòng đã cọc, bổ sung hồ sơ chính thức của 2 người ở và gửi kiểm tra. |
| 2 | Sale | Đối chiếu hồ sơ nhận phòng với đăng ký, phiếu cọc và danh sách người ở; chuyển Quản lý kiểm tra điều kiện lưu trú. |
| 3 | Quản lý | Kiểm tra CCCD, giới tính nữ, số người/số giường và điều kiện lưu trú của từng thành viên. |
| 4 | Hệ thống | Nếu đạt, chuyển hồ sơ sang `du_dieu_kien_nhan_phong`; nếu không đạt, trả lại lý do để bổ sung. |
| 5 | Sale | Lập hợp đồng thuê cho `PHONG_UC3`, liên kết đúng phiếu cọc và giường 1–2; trạng thái hợp đồng `cho_ky`. |
| 6 | Khách hàng | Xem nội dung hợp đồng, nội quy, danh sách người ở và ký xác nhận. |
| 7 | Kế toán | Lập khoản thu nhận phòng đầu kỳ và gửi yêu cầu thanh toán cho khách. |
| 8 | Khách hàng | Thanh toán khoản nhận phòng và gửi minh chứng. |
| 9 | Kế toán | Xác nhận giao dịch nhận phòng hợp lệ. |
| 10 | Quản lý | Lập biên bản bàn giao, ghi chỉ số điện nước và hiện trạng tài sản. |
| 11 | Khách hàng | Kiểm tra và xác nhận biên bản bàn giao. |
| 12 | Hệ thống | Chuyển hợp đồng sang `hieu_luc`, giường 1–2 sang `dang_thue`; giường 3–4 vẫn `trong`. |

**Kết quả:** Hợp đồng của `customer2` có hiệu lực; giường 1–2 `dang_thue`, giường 3–4 vẫn `trong`.

### UC3 — triển khai bước 10: Bàn giao nhận phòng

- Quản lý vào menu **Bàn giao nhận phòng** (`/manager/handovers`).
- Danh sách chỉ gồm hợp đồng `cho_xac_nhan_ban_giao` chưa có biên bản.
- Quản lý nhập hiện trạng phòng, chỉ số điện/nước đầu kỳ, ghi chú và kiểm tra danh sách tài sản, sau đó bấm **Lập biên bản và gửi Khách xác nhận**.
- Hệ thống tạo `HandoverReport` và các chi tiết tài sản; hợp đồng vẫn giữ `cho_xac_nhan_ban_giao`.
- Khách hàng mở biên bản từ Phòng của tôi và xác nhận. Khi đó hệ thống mới chuyển hợp đồng sang `hieu_luc` và giường thuê sang `dang_thue`.

---

## UC4 — PHONG_UC4

**Dữ liệu ban đầu:** Phòng ghép nam 6 giường; giường 1–3 `dang_thue`, giường 4–6 `trong`. `customer3` có hợp đồng `HDUC40000001` đang `hieu_luc`, phiếu cọc hoàn thành và biên bản bàn giao. Actor thao tác đầu tiên của UC4 là **Khách hàng**.

| Bước | Actor | Thao tác |
|---:|---|---|
| 1 | Khách hàng | Mở `PHONG_UC4` trong tab đang thuê, chọn ngày dự kiến trả phòng, nhập lý do và gửi yêu cầu. |
| 2 | Sale | Tiếp nhận yêu cầu, đối chiếu hợp đồng và xác nhận lịch kiểm tra trả phòng. |
| 3 | Quản lý | Kiểm tra hiện trạng phòng, giường 1–3, tài sản, chìa khóa và chỉ số điện nước cuối kỳ. |
| 4 | Hệ thống | Lập biên bản trả phòng và chuyển dữ liệu sang Kế toán đối soát. |
| 5 | Kế toán | Tính tỷ lệ hoàn cọc, điện nước, dịch vụ, bồi thường/khấu trừ và số tiền hoàn hoặc thu thêm. |
| 6 | Khách hàng | Xem toàn bộ biên bản và bảng đối soát; xác nhận kết quả. |
| 7a | Kế toán | Nếu phải hoàn tiền, lập chứng từ chi và xác nhận đã hoàn cọc. |
| 7b | Khách hàng | Nếu phải thu thêm, thanh toán khoản phát sinh và gửi minh chứng. |
| 8 | Kế toán | Xác nhận giao dịch cuối cùng và hoàn tất đối soát. |
| 9 | Hệ thống | Thanh lý hợp đồng, giải phóng giường 1–3 về `trong`; giường 4–6 vẫn `trong`. |

**Kết quả:** Hợp đồng `HDUC40000001` được thanh lý và toàn bộ 6 giường của `PHONG_UC4` là `trong`.

---

## UCHoanTien — Hoàn tiền cọc trước ký hợp đồng

**Dữ liệu seed:** Phòng `UCHoanTien` (`PHONG_UCHT`) của `customer1` đã có phiếu cọc `DCUCHT000001`, mức cọc 3.000.000 VNĐ, trạng thái `hoan_thanh`. Khách hàng là actor bắt đầu demo.

| Bước | Actor | Thao tác |
|---:|---|---|
| 1 | Khách hàng | Mở `UCHoanTien` trong Phòng của tôi, nhập lý do và gửi yêu cầu hoàn cọc. |
| 2 | Sale | Kiểm tra hồ sơ, phiếu cọc và lý do hoàn cọc; chuyển Quản lý xác nhận điều kiện, phiếu sang `dang_xac_nhan_hoan_coc`. |
| 3 | Quản lý | Xác nhận điều kiện hoàn cọc; chuyển phiếu sang `cho_doi_soat_hoan_coc` cho Kế toán. |
| 4 | Kế toán | Mở **Lập đối soát**, tính tỷ lệ/số tiền hoàn 2.400.000 VNĐ (80%) và gửi kết quả cho khách. |
| 5 | Khách hàng | Xác nhận thông tin nhận tiền, chuyển phiếu sang `cho_hoan_tien`. |
| 6 | Kế toán | Mở **Hoàn cọc**, thực hiện chi hoàn và tạo chứng từ. |
| 7 | Hệ thống | Chuyển phiếu sang `da_hoan_coc` và giải phóng phòng/giường. |

---

## Luồng trạng thái hồ sơ UC2

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

## Luồng hoàn cọc trước ký hợp đồng

```text
Khách hàng gửi yêu cầu hoàn cọc → cho_tiep_nhan_hoan_coc
Sale kiểm tra hồ sơ, phiếu cọc và lý do; chuyển Quản lý → dang_xac_nhan_hoan_coc
Quản lý xác nhận điều kiện hoàn cọc → cho_doi_soat_hoan_coc
Kế toán tính số tiền hoàn và gửi Khách xác nhận → cho_khach_xac_nhan_hoan_coc
Khách xác nhận thông tin nhận tiền → cho_hoan_tien
Kế toán chi hoàn → da_hoan_coc
```

Sale luôn xử lý trước Quản lý; Kế toán chỉ nhận hồ sơ sau khi Quản lý xác nhận điều kiện hoàn cọc.
