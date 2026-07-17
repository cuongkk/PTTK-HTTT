# Dữ liệu demo trạng thái phòng theo actor

## 1. Nguyên tắc

`phong.trang_thai` chỉ có bốn giá trị:

```text
trong
da_dat_coc
cho_hoan_coc
dang_thue
```

Các trường hợp hiển thị chi tiết được xác định bằng cách kết hợp phòng với hồ sơ, lịch xem, phiếu cọc, hợp đồng và yêu cầu trả phòng. Mỗi phòng demo dưới đây đại diện cho đúng một tổ hợp dữ liệu và một actor cần hành động tiếp theo.

## 2. Nhóm phòng trống và xem phòng

| Phòng     | Trạng thái phòng | Dữ liệu liên quan                       | Trường hợp hiển thị          | Actor tiếp theo | Hành động và kết quả                                                                 |
| --------- | ---------------- | --------------------------------------- | ---------------------------- | --------------- | ------------------------------------------------------------------------------------ |
| `PHONG_1` | `trong`          | Không có hồ sơ/lịch                     | Chưa có khách đăng ký        | Khách hàng      | Gửi đăng ký → tạo hồ sơ `moi`                                                        |
| `PHONG_2` | `trong`          | Hồ sơ `moi`, chưa có lịch               | Khách vừa đăng ký            | Sale            | Tiếp nhận và tạo lịch xem `sap_den`                                                  |
| `PHONG_3` | `trong`          | Hồ sơ `moi`, lịch `sap_den`             | Chờ khách xác nhận lịch      | Khách hàng      | Xác nhận thông tin phòng → lịch `dang_xem`                                           |
| `PHONG_4` | `trong`          | Hồ sơ `moi`, lịch `dang_xem`            | Khách và Sale đang xem phòng | Sale            | Xác nhận khách đã xem xong → lịch `hoan_thanh`, hồ sơ `da_xem_phong`                 |
| `PHONG_5` | `trong`          | Hồ sơ `da_xem_phong`, lịch `hoan_thanh` | Sale đã xác nhận xem xong    | Khách hàng      | Gửi yêu cầu cọc → hồ sơ `cho_sale_ra_soat_coc`                                       |

Phòng vẫn `trong` trong cả bốn trường hợp. Chỉ sau khi Kế toán xác nhận tiền cọc, phòng mới chuyển `da_dat_coc`.

## 3. Nhóm phòng đã đặt cọc và hoàn cọc

Nhóm này chưa có hợp đồng. Trạng thái chi tiết nằm trực tiếp trong `phieu_dat_coc.trang_thai`.

| Phòng      | Trạng thái phòng | Phiếu cọc                     | Trường hợp hiển thị       | Actor tiếp theo | Hành động và kết quả                                                |
| ---------- | ---------------- | ----------------------------- | ------------------------- | --------------- | ------------------------------------------------------------------- |
| `PHONG_19` | `da_dat_coc`     | `hoan_thanh`                  | Đã cọc, chưa yêu cầu hoàn | Khách hàng      | Yêu cầu hoàn → phiếu `cho_tiep_nhan_hoan_coc`, phòng `cho_hoan_coc` |
| `PHONG_20` | `cho_hoan_coc`   | `cho_tiep_nhan_hoan_coc`      | Yêu cầu mới               | Sale            | Tiếp nhận → `dang_xac_nhan_hoan_coc`                                |
| `PHONG_21` | `cho_hoan_coc`   | `dang_xac_nhan_hoan_coc`      | Chờ xác nhận điều kiện    | Quản lý         | Xác nhận → `cho_doi_soat_hoan_coc`                                  |
| `PHONG_22` | `cho_hoan_coc`   | `cho_doi_soat_hoan_coc`       | Chờ tính tiền hoàn        | Kế toán         | Tính tỷ lệ/số tiền → `cho_khach_xac_nhan_hoan_coc`                  |
| `PHONG_23` | `cho_hoan_coc`   | `cho_khach_xac_nhan_hoan_coc` | Có kết quả hoàn cọc       | Khách hàng      | Xác nhận thông tin nhận tiền → `cho_hoan_tien`                      |
| `PHONG_24` | `cho_hoan_coc`   | `cho_hoan_tien`               | Chờ chuyển tiền           | Kế toán         | Chuyển tiền → `da_hoan_coc`, phòng `trong`                          |
| `PHONG_25` | `trong`          | `da_hoan_coc`                 | Hoàn cọc hoàn tất         | Không có        | Kết thúc luồng; phòng được đăng ký lại                              |
| `PHONG_26` | `da_dat_coc`     | `huy`                         | Khách đã hủy yêu cầu hoàn | Khách hàng      | Có thể tiếp tục thuê hoặc gửi yêu cầu hoàn mới                      |

Lưu ý: `cho_hoan_tien` nghĩa là hệ thống phải trả tiền cho khách, vì vậy actor chuyển tiền là **Kế toán**. Trường hợp **Khách hàng thanh toán tiền cọc** thuộc pipeline UC2 dưới đây và dùng `phieu_dat_coc = cho_thanh_toan`.

## 4. Nhóm UC2 - Yêu cầu và thanh toán đặt cọc

Nhóm này bổ sung các trạng thái từ lúc khách yêu cầu đặt cọc đến khi phòng thực sự chuyển từ `trong` sang `da_dat_coc`.

| Phòng demo đề xuất | Trạng thái phòng | Hồ sơ                      | Phiếu cọc/thanh toán                 | Trường hợp hiển thị                     | Actor tiếp theo | Hành động và kết quả                                                                                |
| ------------------ | ---------------- | -------------------------- | ------------------------------------ | --------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| `PHONG_5`          | `trong`          | `da_xem_phong`             | Chưa có                              | Đã xem nhưng chưa yêu cầu cọc           | Khách hàng      | Gửi yêu cầu → hồ sơ `cho_sale_ra_soat_coc`                                                          |
| `PHONG_6`          | `trong`          | `cho_sale_ra_soat_coc`     | Chưa có                              | Yêu cầu cọc mới                         | Sale            | Rà soát → hồ sơ `cho_quan_ly_xac_nhan_coc`                                                          |
| `PHONG_7`          | `trong`          | `cho_quan_ly_xac_nhan_coc` | Chưa có                              | Sale đã rà soát, chờ kiểm tra chỗ trống | Quản lý         | Xác nhận phòng còn trống → hồ sơ `cho_khach_xac_nhan_dieu_kien_coc`                                  |
| `PHONG_42`         | `trong`          | `cho_khach_xac_nhan_dieu_kien_coc` | Chưa có                       | Điều kiện thuê đã được rà soát           | Khách hàng      | Xem và đồng ý điều kiện thuê, nội quy → hồ sơ `cho_ke_toan_tinh_tien_coc`                             |
| `PHONG_43`         | `trong`          | `cho_ke_toan_tinh_tien_coc` | Chưa có                             | Khách đã xác nhận tuân thủ                | Kế toán         | Tính tiền cọc, lập yêu cầu thanh toán → hồ sơ `cho_khach_thanh_toan_coc`, phiếu `cho_thanh_toan`     |
| `PHONG_44`         | `trong`          | `cho_khach_thanh_toan_coc` | Chưa có                              | Đủ điều kiện nhưng chưa có phiếu cọc      | Sale            | Lập phiếu đặt cọc và thời hạn giữ chỗ → phiếu `cho_thanh_toan`                                      |
| `PHONG_8`          | `trong`          | `cho_khach_thanh_toan_coc` | `cho_thanh_toan`, chưa có minh chứng | Phiếu cọc đã lập                        | Khách hàng      | Thanh toán và tải minh chứng → hồ sơ `cho_ke_toan_xac_nhan_coc`                                     |
| `PHONG_9`          | `trong`          | `cho_ke_toan_xac_nhan_coc` | `cho_thanh_toan`, đã có minh chứng   | Khách đã thanh toán                     | Kế toán         | Đối chiếu → phiếu `hoan_thanh`, hồ sơ `da_dat_coc`, phòng `da_dat_coc`                              |
| `PHONG_10`         | `da_dat_coc`     | `da_dat_coc`               | `hoan_thanh`                         | Đặt cọc hoàn tất                        | Khách hàng      | Tiếp tục UC3 hoặc yêu cầu hoàn cọc                                                                  |

Quy tắc quan trọng:

```text
Khách tải minh chứng chưa làm phòng thành da_dat_coc.
Chỉ khi Kế toán xác nhận tiền cọc:
→ phieu_dat_coc = hoan_thanh
→ ho_so_dang_ky = da_dat_coc
→ phong = da_dat_coc
```

## 5. Nhóm UC3 - Xác nhận thuê và nhận phòng

Nhóm này bắt đầu khi phòng đã `da_dat_coc` nhưng chưa có hợp đồng hiệu lực.

| Phòng demo đề xuất | Trạng thái phòng | Hồ sơ                           | Hợp đồng/hóa đơn                                                                   | Trường hợp hiển thị                   | Actor tiếp theo | Hành động và kết quả                                        |
| ------------------ | ---------------- | ------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------- | --------------- | ----------------------------------------------------------- |
| `PHONG_11`         | `da_dat_coc`     | `da_dat_coc`                    | Chưa có hợp đồng                                                                   | Chưa bổ sung hồ sơ nhận phòng         | Khách hàng      | Bổ sung danh sách người ở → `cho_sale_doi_chieu_nhan_phong` |
| `PHONG_12`         | `da_dat_coc`     | `cho_sale_doi_chieu_nhan_phong` | Chưa có                                                                            | Hồ sơ vừa được gửi                    | Sale            | Đối chiếu → hồ sơ `cho_quan_ly_duyet_nhan_phong`            |
| `PHONG_13`         | `da_dat_coc`     | `cho_quan_ly_duyet_nhan_phong`  | Chưa có                                                                            | Chờ duyệt điều kiện lưu trú           | Quản lý         | Duyệt → hồ sơ `du_dieu_kien_nhan_phong`                     |
| `PHONG_14`         | `da_dat_coc`     | `du_dieu_kien_nhan_phong`       | Chưa có                                                                            | Đủ điều kiện lập hợp đồng             | Sale            | Lập hợp đồng chứa phòng, giá, dịch vụ và nội quy            |
| `PHONG_15`         | `da_dat_coc`     | `du_dieu_kien_nhan_phong`       | Hợp đồng chờ ký                                                                    | Có hợp đồng                           | Khách hàng      | Nhập tên ký hợp đồng                                        |
| `PHONG_16`         | `da_dat_coc`     | `du_dieu_kien_nhan_phong`       | Đã ký, hóa đơn `cho_thanh_toan`                                                    | Chờ khoản nhận phòng                  | Khách hàng      | Thanh toán tiền thuê kỳ đầu/dịch vụ và tải minh chứng       |
| `PHONG_17`         | `da_dat_coc`     | `du_dieu_kien_nhan_phong`       | Hóa đơn `cho_thanh_toan`, đã có minh chứng                                         | Khách đã thanh toán                   | Kế toán         | Xác nhận khoản thu → hợp đồng `hieu_luc`, phòng `dang_thue` |
| `PHONG_18`         | `da_dat_coc`     | Đã hoàn tất hồ sơ               | Hợp đồng `cho_xac_nhan_ban_giao`, hóa đơn `da_thanh_toan`, đã có biên bản bàn giao | Chờ khách xem và ký biên bản bàn giao | Khách hàng      | Ký biên bản → chính thức nhận phòng                         |
| `PHONG_41`         | `dang_thue`      | Đã hoàn tất                     | Hợp đồng `hieu_luc`, hóa đơn `da_thanh_toan`, đã xác nhận bàn giao                 | Đang thuê bình thường                 | Khách hàng      | Sử dụng phòng hoặc bắt đầu UC4 khi muốn trả                 |

Trong UC3, hành động cuối của khách sau khi ký là **thanh toán**. Phòng chỉ chuyển `dang_thue` sau khi Kế toán xác nhận khoản thu.

## 6. Nhóm phòng đang thuê và trả phòng

Nhóm này có hợp đồng. Ngày khách đề xuất và ngày Sale xác nhận được lưu trong `yeu_cau_tra_phong`.

| Phòng      | Trạng thái phòng | Hợp đồng                 | Yêu cầu trả phòng    | Actor tiếp theo | Hành động và kết quả                                                           |
| ---------- | ---------------- | ------------------------ | -------------------- | --------------- | ------------------------------------------------------------------------------ |
| `PHONG_27` | `dang_thue`      | `hieu_luc`               | Không có             | Khách hàng      | Chọn ngày trả → tạo yêu cầu `cho_tiep_nhan`, hợp đồng `cho_tra_phong`          |
| `PHONG_28` | `dang_thue`      | `cho_tra_phong`          | `cho_tiep_nhan`      | Sale            | Xác nhận lịch → yêu cầu `da_xac_nhan_lich`, hợp đồng `cho_kiem_tra_tra_phong`  |
| `PHONG_29` | `dang_thue`      | `cho_kiem_tra_tra_phong` | `da_xac_nhan_lich`   | Quản lý         | Chờ đúng lịch rồi kiểm tra hiện trạng                                          |
| `PHONG_30` | `dang_thue`      | `cho_kiem_tra_tra_phong` | `cho_kiem_tra`       | Quản lý         | Lập biên bản → yêu cầu `da_kiem_tra`, hợp đồng `cho_doi_soat`                  |
| `PHONG_31` | `dang_thue`      | `cho_doi_soat`           | `da_kiem_tra`        | Quản lý         | Chuyển biên bản cho Kế toán → yêu cầu `cho_doi_soat`                           |
| `PHONG_32` | `dang_thue`      | `cho_doi_soat`           | `cho_doi_soat`       | Kế toán         | Lập đối soát → hai trạng thái `cho_khach_xac_nhan`                             |
| `PHONG_33` | `dang_thue`      | `cho_khach_xac_nhan`     | `cho_khach_xac_nhan` | Khách hàng      | Xác nhận hiện trạng/số tiền → yêu cầu `cho_hoan_tien`, hợp đồng `cho_hoan_coc` |
| `PHONG_34` | `dang_thue`      | `cho_hoan_coc`           | `cho_hoan_tien`      | Kế toán         | Hoàn tiền/thu thêm → yêu cầu `hoan_tat`, hợp đồng `thanh_ly`, phòng `trong`    |
| `PHONG_35` | `trong`          | `thanh_ly`               | `hoan_tat`           | Không có        | Kết thúc luồng; phòng được đăng ký lại                                         |
| `PHONG_36` | `dang_thue`      | `hieu_luc`               | `huy`                | Khách hàng      | Tiếp tục thuê hoặc gửi lịch trả phòng mới                                      |

### Ba trường hợp tài chính cuối UC4

Sau khi khách xác nhận bảng hiện trạng/đối soát, actor tiếp theo phụ thuộc kết quả tài chính:

| Phòng demo đề xuất | Kết quả đối soát                                                         | Hóa đơn                                                 | Actor tiếp theo | Hành động và kết quả                                                                |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------- |
| `PHONG_37`         | `so_tien_hoan > 0`; yêu cầu `cho_hoan_tien`; hợp đồng `cho_hoan_coc`     | Hóa đơn `hoan_coc`, chứng từ chi chờ thực hiện          | Kế toán         | Chuyển tiền cho khách → hóa đơn `da_thanh_toan`, hợp đồng `thanh_ly`, phòng `trong` |
| `PHONG_38`         | `so_tien_thu_them > 0`; yêu cầu `cho_hoan_tien`; hợp đồng `cho_hoan_coc` | Hóa đơn `thu_them = cho_thanh_toan`, chưa có minh chứng | Khách hàng      | Thanh toán khoản phát sinh và tải minh chứng                                        |
| `PHONG_39`         | Yêu cầu `cho_hoan_tien`; hợp đồng `cho_hoan_coc`                         | Hóa đơn `thu_them = cho_thanh_toan` + minh chứng        | Kế toán         | Xác nhận tiền → hóa đơn `da_thanh_toan`, hợp đồng `thanh_ly`, phòng `trong`         |
| `PHONG_40`         | Yêu cầu `cho_doi_soat`; hợp đồng `cho_doi_soat`; đối soát `da_xac_nhan`  | Không phát sinh giao dịch                               | Kế toán         | Xác nhận hoàn tất → hợp đồng `thanh_ly`, phòng `trong`                              |

## Bốn phòng mốc dùng để chuẩn bị demo theo UC

| Mã phòng | Khu vực | Hình thức | Giường và trạng thái | Mục đích |
|---|---|---|---|---|
| `PHONG_UC1` | Quận 5 | Ở ghép, 4 giường | 4 giường `trong` | UC1 - Đăng ký thuê và xem phòng |
| `PHONG_UC2` | Quận 5 | Nguyên phòng, sức chứa 2 | 2 vị trí `trong`; hồ sơ `HSUC20000001` đã xem phòng | UC2 - Đặt cọc và xác nhận thuê |
| `PHONG_UC3` | Thủ Đức | Ở ghép, 4 giường | Giường 1-2 `da_dat_coc` bởi phiếu `DCUC30000001`; giường 3-4 `trong` | UC3 - Ký hợp đồng và nhận phòng |
| `PHONG_UC4` | Thủ Đức | Ở ghép, 6 giường | Giường 1-3 `dang_thue` theo hợp đồng `HDUC40000001`; giường 4-6 `trong` | UC4 - Trả phòng, đối soát và hoàn cọc |

Phân biệt rõ:

```text
Hoàn cọc: Kế toán chuyển tiền cho Khách hàng.
Thu thêm: Khách hàng thanh toán cho hệ thống, sau đó Kế toán xác nhận.
```

## 7. Mức độ cover 4 UC

| UC                                | Các trạng thái đã được mô tả trong tài liệu                                                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UC1 - Đăng ký thuê và xem phòng   | Chưa có hồ sơ → hồ sơ mới → lịch sắp đến → Sale xác nhận đã xem                                                                                                        |
| UC2 - Yêu cầu đặt cọc             | Khách yêu cầu → Sale rà soát → Quản lý xác nhận chỗ → Khách thanh toán → Kế toán xác nhận → phòng đã cọc                                                               |
| UC3 - Xác nhận thuê và nhận phòng | Khách bổ sung hồ sơ → Sale đối chiếu → Quản lý duyệt → Sale lập hợp đồng → Khách ký/thanh toán → Kế toán xác nhận → phòng đang thuê; kèm nhánh hoàn cọc trước hợp đồng |
| UC4 - Trả phòng và thanh lý       | Khách chọn ngày → Sale xác nhận lịch → Quản lý kiểm tra → Kế toán đối soát → Khách xác nhận → hoàn cọc/thu thêm/không phát sinh → thanh lý                             |

## 8. Quy tắc lọc công việc theo actor

### Khách hàng

- Lịch `hoan_thanh` + hồ sơ `da_xem_phong` + phòng `trong`: được yêu cầu đặt cọc.
- Phòng `da_dat_coc` + phiếu cọc `hoan_thanh` + chưa có hợp đồng: được yêu cầu hoàn cọc hoặc tiếp tục UC3.
- Phiếu cọc `cho_khach_xac_nhan_hoan_coc`: được xác nhận số tiền hoàn.
- Hợp đồng `hieu_luc` + chưa có yêu cầu trả phòng: được chọn ngày trả.
- Hợp đồng và yêu cầu `cho_khach_xac_nhan`: được xem, xác nhận hiện trạng và đối soát.

### Sale

Không lọc công việc Sale chỉ bằng một trạng thái của một bảng. Mỗi chức năng phải truy vấn đủ các lớp dữ liệu liên quan để vừa xác định đúng bản ghi cần xử lý, vừa có đủ thông tin hiển thị trên màn hình.

| Chức năng Sale | Các bảng phải ghép | Điều kiện lấy đúng công việc |
|---|---|---|
| Tiếp nhận đăng ký, sắp lịch xem | `ho_so_dang_ky` → `khach_hang`; `LEFT JOIN lich_xem_phong` → `lich_xem_phong_phong` → `phong` | Hồ sơ `moi` và **không có** lịch chưa hủy: hiện nút sắp lịch. Hồ sơ `moi` và lịch mới nhất là `sap_den` hoặc `dang_xem`: hiện lịch và nút hoàn thành/hủy; không tạo lịch trùng. |
| Rà soát yêu cầu đặt cọc | `ho_so_dang_ky` → `khach_hang` → `lich_xem_phong` → `lich_xem_phong_phong` → `phong`; `LEFT JOIN phieu_dat_coc` | Hồ sơ `cho_sale_ra_soat_coc`, có lịch `hoan_thanh`, phòng còn `trong` và chưa có phiếu cọc còn hiệu lực. Sau rà soát chuyển hồ sơ sang `cho_quan_ly_xac_nhan_coc`. |
| Lập phiếu đặt cọc | `ho_so_dang_ky` → lịch xem → phòng; `LEFT JOIN phieu_dat_coc` → `dat_coc_giuong`; `LEFT JOIN hop_dong_thue` | Hồ sơ đã qua bước xác nhận điều kiện và đang ở `cho_khach_thanh_toan_coc`, chưa có phiếu cọc còn hiệu lực, chưa có hợp đồng; phòng/giường vẫn phù hợp. |
| Đối chiếu hồ sơ nhận phòng | `ho_so_dang_ky` → `khach_hang` → `thanh_vien_thue`; `JOIN phieu_dat_coc` → `dat_coc_giuong` → `giuong` → `phong`; `LEFT JOIN hop_dong_thue` | Hồ sơ `cho_sale_doi_chieu_nhan_phong`, phiếu cọc `hoan_thanh`, số thành viên bằng `so_nguoi`, đúng một người đứng tên, đủ giấy tờ và chưa có hợp đồng. |
| Lập hợp đồng thuê | `ho_so_dang_ky` → `khach_hang` → `thanh_vien_thue`; `JOIN phieu_dat_coc` → giường/phòng; `LEFT JOIN hop_dong_thue` | Hồ sơ `du_dieu_kien_nhan_phong`, phiếu cọc `hoan_thanh`, phòng `da_dat_coc`, chưa có hợp đồng cho phiếu cọc đó. Không xác định phòng chỉ từ trạng thái hồ sơ. |
| Tiếp nhận hoàn cọc trước hợp đồng | `phieu_dat_coc` → `ho_so_dang_ky` → `khach_hang`; `JOIN dat_coc_giuong` → `giuong` → `phong`; `LEFT JOIN hop_dong_thue` | Phiếu cọc `cho_tiep_nhan_hoan_coc`, phòng `cho_hoan_coc` và **không có** hợp đồng. Sau tiếp nhận chuyển phiếu sang `dang_xac_nhan_hoan_coc`. |
| Xác nhận lịch trả phòng | `hop_dong_thue` → `khach_hang` → `phong`; `JOIN yeu_cau_tra_phong`; `LEFT JOIN bien_ban_tra_phong` | Hợp đồng `cho_tra_phong`, yêu cầu trả phòng mới nhất `cho_tiep_nhan` và chưa có biên bản kiểm tra hoàn tất. Sau xác nhận chuyển yêu cầu sang `da_xac_nhan_lich`, hợp đồng sang `cho_kiem_tra_tra_phong`. |

Quy tắc lấy bản ghi liên quan:

- Với lịch xem và yêu cầu trả phòng, lấy bản ghi mới nhất chưa `huy`, không dùng tùy ý bản ghi đầu tiên.
- Dùng `NOT EXISTS` để kiểm tra “chưa có lịch”, “chưa có phiếu cọc” hoặc “chưa có hợp đồng”; không suy ra chỉ từ trạng thái hồ sơ.
- Khi truy vấn danh sách Sale, vẫn phải trả về khách hàng, phòng/giường, lịch hẹn, phiếu cọc và hợp đồng tương ứng để giao diện quyết định đúng nút hành động.
- Điều kiện trạng thái dùng để xác định bước nghiệp vụ; quan hệ giữa các bảng dùng để xác nhận bản ghi thực sự đủ điều kiện xử lý.

### Quản lý

- Hồ sơ `cho_quan_ly_xac_nhan_coc`: xác nhận phòng/giường còn phù hợp để lập phiếu cọc.
- Hồ sơ `cho_quan_ly_duyet_nhan_phong`: duyệt điều kiện người ở.
- Phiếu cọc `dang_xac_nhan_hoan_coc`: xác nhận điều kiện hoàn.
- Yêu cầu trả phòng đã có lịch: kiểm tra hiện trạng và lập biên bản.

### Kế toán

- Hồ sơ `cho_ke_toan_xac_nhan_coc` + hóa đơn có minh chứng: xác nhận tiền cọc.
- Phiếu cọc `cho_doi_soat_hoan_coc`: tính khoản hoàn.
- Phiếu cọc `cho_hoan_tien`: thực hiện hoàn tiền.
- Hợp đồng `cho_doi_soat`: lập bảng đối soát.
- Hợp đồng `cho_hoan_coc`: hoàn tiền hoặc xác nhận thu thêm và thanh lý.
