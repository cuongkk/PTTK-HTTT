# Cấu trúc cơ sở dữ liệu hiện tại

Tài liệu mô tả schema SQL Server được Backend sử dụng sau migration `SynchronizeFullHomestaySchema`. Hiện có **31 bảng ứng dụng**, chưa tính bảng lịch sử migration `__EFMigrationsHistory` do EF Core tự quản lý.

## Quy ước

- `PK`: khóa chính.
- `FK`: khóa ngoại.
- `UQ`: ràng buộc/index duy nhất.
- `NULL`: được phép để trống.
- `NOT NULL`: bắt buộc có dữ liệu.
- Các kiểu `nvarchar` được dùng để lưu Unicode tiếng Việt trên SQL Server.

# 1. `chi_nhanh`

Lưu thông tin các chi nhánh HomeStay Dorm.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_chi_nhanh` | `nvarchar(10)` | PK, NOT NULL | Mã chi nhánh |
| `ten_chi_nhanh` | `nvarchar(100)` | NOT NULL | Tên chi nhánh |
| `dia_chi` | `nvarchar(200)` | NOT NULL | Địa chỉ chi nhánh |
| `so_dien_thoai` | `nvarchar(15)` | NULL | Số điện thoại liên hệ |
| `email` | `nvarchar(100)` | NULL | Email chi nhánh |

Quan hệ:

- Một chi nhánh có nhiều phòng.
- Một chi nhánh có nhiều nhân viên.

# 2. `phong`

Lưu danh mục và điều kiện của từng phòng.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_phong` | `nvarchar(10)` | PK, NOT NULL | Mã phòng |
| `ma_chi_nhanh` | `nvarchar(10)` | FK, NOT NULL | Chi nhánh quản lý phòng |
| `ten_phong` | `nvarchar(50)` | NOT NULL | Tên/số phòng |
| `loai_phong` | `nvarchar(30)` | NOT NULL | `nguyen_can` hoặc `ghep` |
| `suc_chua` | `smallint` | NOT NULL, `> 0` | Số người/giường tối đa |
| `khu_vuc` | `nvarchar(50)` | NULL | Khu, dãy hoặc phân khu |
| `gia_phong` | `decimal(12,2)` | NULL | Giá thuê nguyên phòng/tháng |
| `tang` | `smallint` | NULL | Tầng của phòng |
| `dien_tich_m2` | `decimal(6,2)` | NULL | Diện tích phòng theo m² |
| `mo_ta` | `nvarchar(max)` | NULL | Mô tả chi tiết phòng |
| `gioi_tinh_cho_phep` | `nvarchar(20)` | NULL | `nam`, `nu`, `khong_gioi_han` hoặc chính sách tương ứng |
| `yeu_cau_yen_tinh` | `bit` | NOT NULL, mặc định `0` | Phòng/khu ưu tiên người có sinh hoạt yên tĩnh |
| `gio_gioi_nghiem` | `time` | NULL | Giờ giới nghiêm nếu áp dụng |
| `co_dieu_hoa` | `bit` | NOT NULL, mặc định `0` | Phòng có điều hòa |
| `co_gui_xe` | `bit` | NOT NULL, mặc định `0` | Có hỗ trợ gửi xe |
| `trang_thai` | `nvarchar(20)` | NOT NULL | `trong`, `da_dat_coc`, `dang_thue`, `bao_tri` |
| `ngay_cap_nhat` | `datetime2` | NULL | Thời điểm cập nhật gần nhất |
| `ma_nguoi_sua` | `nvarchar(12)` | FK, NULL | Tài khoản cập nhật gần nhất |

Khóa ngoại:

- `ma_chi_nhanh` → `chi_nhanh.ma_chi_nhanh`, không cho xóa chi nhánh khi còn phòng.
- `ma_nguoi_sua` → `tai_khoan.ma_tai_khoan`, đặt `NULL` khi tài khoản bị xóa.

Index:

- `idx_phong_cn(ma_chi_nhanh, trang_thai)`.

# 3. `giuong`

Lưu từng giường thuộc một phòng ở ghép hoặc dùng để biểu diễn sức chứa của phòng.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_giuong` | `nvarchar(12)` | PK, NOT NULL | Mã giường |
| `ma_phong` | `nvarchar(10)` | FK, NOT NULL | Phòng chứa giường |
| `so_thu_tu` | `smallint` | NOT NULL | Số thứ tự giường trong phòng |
| `gia_thue_thang` | `decimal(12,2)` | NOT NULL, `> 0` | Giá thuê giường/tháng |
| `trang_thai` | `nvarchar(20)` | NOT NULL | `trong`, `da_dat_coc`, `dang_thue`, `bao_tri` |
| `ngay_cap_nhat` | `datetime2` | NULL | Thời điểm cập nhật |
| `ma_nguoi_sua` | `nvarchar(12)` | FK, NULL | Tài khoản cập nhật |

Ràng buộc:

- `ma_phong` → `phong.ma_phong`, không cho xóa phòng khi còn giường.
- `ma_nguoi_sua` → `tai_khoan.ma_tai_khoan`.
- UQ `(ma_phong, so_thu_tu)`: không trùng số giường trong một phòng.

Index:

- `idx_giuong_tt(trang_thai)`.
- `idx_giuong_phong(ma_phong)`.

# 4. `hinh_anh_phong`

Lưu một hoặc nhiều hình ảnh của phòng.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_hinh_anh` | `nvarchar(12)` | PK, NOT NULL | Mã hình ảnh |
| `ma_phong` | `nvarchar(10)` | FK, NOT NULL | Phòng liên quan |
| `duong_dan` | `nvarchar(500)` | NOT NULL | URL hoặc đường dẫn ảnh |
| `mo_ta` | `nvarchar(200)` | NULL | Chú thích ảnh |
| `thu_tu_hien_thi` | `smallint` | NOT NULL | Thứ tự ảnh trong giao diện |
| `la_anh_dai_dien` | `bit` | NOT NULL, mặc định `0` | Ảnh đại diện của phòng |

Quan hệ:

- `ma_phong` → `phong.ma_phong`.
- Xóa phòng sẽ xóa các ảnh liên quan.

Index:

- `idx_hinhanh_phong_thutu(ma_phong, thu_tu_hien_thi)`.

# 5. `tien_nghi`

Danh mục tiện nghi có thể gắn cho phòng.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_tien_nghi` | `nvarchar(20)` | PK, NOT NULL | Mã tiện nghi |
| `ten_tien_nghi` | `nvarchar(100)` | NOT NULL, UQ | Tên tiện nghi |
| `mo_ta` | `nvarchar(300)` | NULL | Mô tả tiện nghi |
| `is_active` | `bit` | NOT NULL, mặc định `1` | Tiện nghi còn được sử dụng trong danh mục |

Seed hiện có: WiFi, tủ cá nhân, bàn học, nệm và nước nóng.

# 6. `phong_tien_nghi`

Bảng liên kết nhiều-nhiều giữa phòng và tiện nghi.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_phong` | `nvarchar(10)` | PK, FK, NOT NULL | Phòng |
| `ma_tien_nghi` | `nvarchar(20)` | PK, FK, NOT NULL | Tiện nghi |
| `so_luong` | `smallint` | NOT NULL, mặc định `1` | Số lượng tiện nghi trong phòng |
| `ghi_chu` | `nvarchar(200)` | NULL | Ghi chú tình trạng/vị trí |

Khóa chính ghép:

- `(ma_phong, ma_tien_nghi)`.

Quan hệ:

- Xóa phòng sẽ xóa liên kết tiện nghi.
- Không cho xóa tiện nghi khi vẫn còn phòng sử dụng.

# 7. `nhan_vien`

Lưu nhân viên của các chi nhánh.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_nv` | `nvarchar(10)` | PK, NOT NULL | Mã nhân viên |
| `ma_chi_nhanh` | `nvarchar(10)` | FK, NULL | Chi nhánh làm việc |
| `ho_ten` | `nvarchar(100)` | NOT NULL | Họ tên |
| `so_dien_thoai` | `nvarchar(15)` | NULL | Số điện thoại |
| `email` | `nvarchar(100)` | NULL, UQ | Email |
| `vai_tro` | `nvarchar(20)` | NOT NULL | `sale`, `quan_ly`, `ke_toan`, `system_admin` |
| `ngay_vao_lam` | `date` | NULL | Ngày bắt đầu làm việc |
| `is_active` | `bit` | NOT NULL, mặc định `1` | Nhân viên còn hoạt động |

Quan hệ:

- `ma_chi_nhanh` → `chi_nhanh.ma_chi_nhanh`; khi xóa chi nhánh thì đặt `NULL`.
- Một nhân viên có tối đa một tài khoản.

# 8. `khach_hang`

Lưu hồ sơ định danh của khách hàng.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_kh` | `nvarchar(12)` | PK, NOT NULL | Mã khách hàng |
| `ho_ten` | `nvarchar(100)` | NOT NULL | Họ tên |
| `cccd` | `nvarchar(20)` | NOT NULL, UQ | CCCD/giấy tờ định danh |
| `so_dien_thoai` | `nvarchar(15)` | NOT NULL | Số điện thoại |
| `email` | `nvarchar(100)` | NULL | Email |
| `gioi_tinh` | `nvarchar(3)` | NULL | Giới tính |
| `quoc_tich` | `nvarchar(50)` | NOT NULL, mặc định `Việt Nam` | Quốc tịch |
| `ngay_sinh` | `date` | NULL | Ngày sinh |
| `dia_chi` | `nvarchar(200)` | NULL | Địa chỉ |
| `ngay_tao` | `datetime2` | NOT NULL, mặc định UTC hiện tại | Ngày tạo hồ sơ |

Quan hệ:

- Một khách hàng có tối đa một tài khoản.

# 9. `vai_tro_he_thong`

Danh mục vai trò dùng để phân quyền tài khoản.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_vai_tro` | `nvarchar(30)` | PK, NOT NULL | Mã vai trò |
| `ten_vai_tro` | `nvarchar(100)` | NOT NULL | Tên vai trò |
| `mo_ta` | `nvarchar(max)` | NULL | Mô tả phạm vi vai trò |

Seed hiện có: quản trị hệ thống, quản lý, Sale, kế toán và khách hàng.

# 10. `quyen_he_thong`

Danh mục quyền thao tác trong hệ thống.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_quyen` | `nvarchar(50)` | PK, NOT NULL | Mã quyền |
| `ten_quyen` | `nvarchar(100)` | NOT NULL | Tên quyền |
| `mo_ta` | `nvarchar(max)` | NULL | Mô tả quyền |

# 11. `vai_tro_quyen`

Bảng liên kết nhiều-nhiều giữa vai trò và quyền.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_vai_tro` | `nvarchar(30)` | PK, FK, NOT NULL | Vai trò |
| `ma_quyen` | `nvarchar(50)` | PK, FK, NOT NULL | Quyền |

Khóa chính ghép:

- `(ma_vai_tro, ma_quyen)`.

Khi xóa vai trò hoặc quyền, liên kết tương ứng được xóa theo.

# 12. `tai_khoan`

Lưu thông tin xác thực của nhân viên hoặc khách hàng.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_tai_khoan` | `nvarchar(12)` | PK, NOT NULL | Mã tài khoản |
| `ten_dang_nhap` | `nvarchar(50)` | NOT NULL, UQ | Tên đăng nhập |
| `mat_khau_hash` | `nvarchar(255)` | NOT NULL | Mật khẩu đã băm |
| `ma_vai_tro` | `nvarchar(30)` | FK, NOT NULL | Vai trò hệ thống |
| `ma_nv` | `nvarchar(10)` | FK, NULL, UQ | Chủ tài khoản là nhân viên |
| `ma_kh` | `nvarchar(12)` | FK, NULL, UQ | Chủ tài khoản là khách hàng |
| `email_xac_thuc` | `nvarchar(100)` | NULL | Email đã dùng xác thực |
| `trang_thai` | `nvarchar(20)` | NOT NULL | `kich_hoat`, `khoa`, `vo_hieu_hoa` |
| `lan_dang_nhap_cuoi` | `datetime2` | NULL | Lần đăng nhập gần nhất |
| `ngay_tao` | `datetime2` | NOT NULL, mặc định UTC hiện tại | Ngày tạo tài khoản |
| `ngay_cap_nhat` | `datetime2` | NULL | Ngày cập nhật |
| `ma_nguoi_tao` | `nvarchar(12)` | FK tự tham chiếu, NULL | Tài khoản tạo tài khoản này |
| `reset_token_hash` | `nvarchar(255)` | NULL | Token đặt lại mật khẩu đã băm |
| `reset_token_het_han` | `datetime2` | NULL | Hạn dùng token đặt lại mật khẩu |

Ràng buộc chủ sở hữu:

- Phải có đúng một trong hai trường `ma_nv` hoặc `ma_kh`.
- Không được đồng thời là tài khoản nhân viên và tài khoản khách hàng.

# 13. `tham_so_he_thong`

Lưu các chính sách có thể cấu hình mà không cần sửa code.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_tham_so` | `nvarchar(50)` | PK, NOT NULL | Mã tham số |
| `ten_tham_so` | `nvarchar(100)` | NOT NULL | Tên hiển thị |
| `nhom_tham_so` | `nvarchar(50)` | NOT NULL | Nhóm chính sách |
| `gia_tri` | `nvarchar(max)` | NOT NULL | Giá trị được lưu dạng chuỗi |
| `kieu_du_lieu` | `nvarchar(20)` | NOT NULL | `string`, `number`, `boolean`, `json`, `time` |
| `mo_ta` | `nvarchar(max)` | NULL | Mô tả ý nghĩa |
| `is_active` | `bit` | NOT NULL, mặc định `1` | Tham số đang áp dụng |
| `ngay_cap_nhat` | `datetime2` | NULL | Ngày cập nhật |
| `ma_nguoi_sua` | `nvarchar(12)` | FK, NULL | Tài khoản cập nhật |

Index:

- `idx_thamso_nhom(nhom_tham_so, is_active)`.

# 14. `dich_vu`

Danh mục dịch vụ và đơn giá.

| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `ma_dich_vu` | `nvarchar(12)` | PK, NOT NULL | Mã dịch vụ |
| `ten_dich_vu` | `nvarchar(100)` | NOT NULL, UQ | Tên dịch vụ |
| `loai_dich_vu` | `nvarchar(30)` | NOT NULL | `dien`, `nuoc`, `wifi`, `ve_sinh`, `khac` |
| `don_vi_tinh` | `nvarchar(30)` | NOT NULL | kWh, m³, phòng/tháng, lần... |
| `don_gia` | `decimal(12,2)` | NOT NULL, `>= 0` | Đơn giá |
| `mo_ta` | `nvarchar(max)` | NULL | Mô tả dịch vụ |
| `is_active` | `bit` | NOT NULL, mặc định `1` | Dịch vụ đang áp dụng |
| `ngay_cap_nhat` | `datetime2` | NULL | Ngày cập nhật |
| `ma_nguoi_sua` | `nvarchar(12)` | FK, NULL | Tài khoản cập nhật |

Index:

- `uq_dichvu_ten(ten_dich_vu)`.
- `idx_dichvu_loai(loai_dich_vu, is_active)`.

# 15. `tai_san`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_tai_san` | `nvarchar(12)` | PK, mã tài sản |
| `ma_phong` | `nvarchar(10)` | FK → `phong`, NOT NULL |
| `ten_tai_san` | `nvarchar(100)` | NOT NULL |
| `mo_ta` | `nvarchar(max)` | NULL |
| `tinh_trang` | `nvarchar(50)` | Mặc định `tot` |

# 16. `ho_so_dang_ky`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_ho_so` | `nvarchar(12)` | PK |
| `ma_kh` | `nvarchar(12)` | FK → `khach_hang`, NOT NULL |
| `ma_sale` | `nvarchar(10)` | FK → `nhan_vien`, NULL |
| `so_nguoi` | `smallint` | NOT NULL, > 0 |
| `thoi_gian_du_kien_thue` | `date` | Ngày dự kiến vào ở |
| `thoi_han_thue_thang` | `smallint` | Số tháng dự kiến thuê |
| `khu_vuc_mong_muon` | `nvarchar(100)` | Khu vực mong muốn |
| `loai_phong_mong_muon` | `nvarchar(30)` | Nguyên phòng/ở ghép |
| `gia_toi_thieu` | `decimal(12,2)` | Giá tối thiểu |
| `gia_toi_da` | `decimal(12,2)` | Giá tối đa |
| `gioi_tinh` | `nvarchar(20)` | Giới tính khách/nhóm |
| `gio_giac_sinh_hoat` | `nvarchar(200)` | Yêu cầu giờ giấc |
| `yeu_cau_yen_tinh` | `bit` | Mặc định `0` |
| `yeu_cau_gui_xe` | `bit` | Mặc định `0` |
| `yeu_cau_dieu_hoa` | `bit` | Mặc định `0` |
| `yeu_cau_khac` | `nvarchar(max)` | Yêu cầu khác |
| `trang_thai` | `nvarchar(20)` | `moi`, `da_xem_phong`, `da_dat_coc`, `huy` |
| `ngay_tao` | `datetime2` | Mặc định UTC hiện tại |

# 17. `lich_xem_phong`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_lich` | `nvarchar(12)` | PK |
| `ma_ho_so` | `nvarchar(12)` | FK → `ho_so_dang_ky`, NOT NULL |
| `ma_sale` | `nvarchar(10)` | FK → `nhan_vien`, NOT NULL |
| `ngay_gio_hen` | `datetime2` | Ngày giờ xem phòng |
| `trang_thai` | `nvarchar(20)` | `sap_den`, `hoan_thanh`, `huy` |
| `ghi_chu` | `nvarchar(max)` | NULL |

# 18. `lich_xem_phong_phong`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_lich` | `nvarchar(12)` | PK, FK → `lich_xem_phong` |
| `ma_phong` | `nvarchar(10)` | PK, FK → `phong` |

Biểu diễn quan hệ nhiều-nhiều: một lịch có thể xem nhiều phòng và một phòng có thể xuất hiện trong nhiều lịch.

# 19. `phieu_dat_coc`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_coc` | `nvarchar(12)` | PK |
| `ma_ho_so` | `nvarchar(12)` | FK → `ho_so_dang_ky` |
| `ma_sale` | `nvarchar(10)` | FK → `nhan_vien` |
| `ma_quan_ly` | `nvarchar(10)` | FK → `nhan_vien`, NULL |
| `so_tien_coc` | `decimal(12,2)` | > 0 |
| `ngay_lap` | `datetime2` | Mặc định UTC hiện tại |
| `han_thanh_toan` | `datetime2` | Hạn thanh toán 24 giờ |
| `ngay_thanh_toan` | `datetime2` | NULL |
| `trang_thai` | `nvarchar(20)` | `cho_thanh_toan`, `hoan_thanh`, `het_han`, `huy` |

# 20. `dat_coc_giuong`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_coc` | `nvarchar(12)` | PK, FK → `phieu_dat_coc` |
| `ma_giuong` | `nvarchar(12)` | PK, FK → `giuong` |

# 21. `hop_dong_thue`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_hop_dong` | `nvarchar(12)` | PK |
| `ma_coc` | `nvarchar(12)` | FK → `phieu_dat_coc`, UQ |
| `ma_kh` | `nvarchar(12)` | FK → `khach_hang` |
| `ma_sale` | `nvarchar(10)` | FK → `nhan_vien` |
| `ma_phong` | `nvarchar(10)` | FK → `phong` |
| `so_giuong_thue` | `smallint` | NOT NULL |
| `gia_thue_thang` | `decimal(12,2)` | NOT NULL |
| `ky_thanh_toan` | `nvarchar(20)` | Mặc định `hang_thang` |
| `ngay_ky` | `date` | NOT NULL |
| `ngay_bat_dau` | `date` | NOT NULL |
| `ngay_ket_thuc` | `date` | NULL |
| `trang_thai` | `nvarchar(20)` | `hieu_luc`, `het_han`, `thanh_ly` |

# 22. `thanh_vien_thue`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_tv` | `nvarchar(12)` | PK |
| `ma_kh` | `nvarchar(12)` | FK → `khach_hang`, NULL |
| `ma_hop_dong` | `nvarchar(12)` | FK → `hop_dong_thue`, NULL |
| `ho_ten` | `nvarchar(100)` | NOT NULL |
| `cccd` | `nvarchar(20)` | NULL |
| `gioi_tinh` | `nvarchar(3)` | `Nam`, `Nu` hoặc NULL |
| `ngay_sinh` | `date` | NULL |
| `dat_dieu_kien` | `bit` | Mặc định `1` |
| `ghi_chu` | `nvarchar(max)` | NULL |

# 23. `bien_ban_ban_giao`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_bb` | `nvarchar(12)` | PK |
| `ma_hop_dong` | `nvarchar(12)` | FK → `hop_dong_thue`, UQ |
| `ma_quan_ly` | `nvarchar(10)` | FK → `nhan_vien` |
| `ngay_ban_giao` | `date` | NOT NULL |
| `tinh_trang_phong` | `nvarchar(max)` | NULL |
| `chi_so_dien_dau` | `decimal(12,2)` | Chỉ số điện lúc bàn giao |
| `chi_so_nuoc_dau` | `decimal(12,2)` | Chỉ số nước lúc bàn giao |
| `ghi_chu` | `nvarchar(max)` | NULL |

# 24. `chi_tiet_ban_giao`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_bb` | `nvarchar(12)` | PK, FK → `bien_ban_ban_giao` |
| `ma_tai_san` | `nvarchar(12)` | PK, FK → `tai_san` |
| `so_luong` | `smallint` | Mặc định `1` |
| `tinh_trang` | `nvarchar(50)` | NULL |
| `ghi_chu` | `nvarchar(max)` | NULL |

# 25. `bang_doi_soat`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_doi_soat` | `nvarchar(12)` | PK |
| `ma_hop_dong` | `nvarchar(12)` | FK → `hop_dong_thue`, UQ |
| `ma_ke_toan` | `nvarchar(10)` | FK → `nhan_vien` |
| `ma_quan_ly` | `nvarchar(10)` | FK → `nhan_vien`, NULL |
| `ngay_lap` | `date` | NOT NULL |
| `ty_le_hoan` | `decimal(5,2)` | 50, 70, 80 hoặc 100 |
| `so_tien_coc_goc` | `decimal(12,2)` | NOT NULL |
| `so_tien_hoan_co_ban` | `decimal(12,2)` | NOT NULL |
| `tong_khau_tru` | `decimal(12,2)` | Mặc định `0` |
| `so_tien_hoan` | `decimal(12,2)` | NULL |
| `so_tien_thu_them` | `decimal(12,2)` | NULL |
| `trang_thai` | `nvarchar(20)` | `cho_xac_nhan`, `da_xac_nhan`, `hoan_tat` |

# 26. `chi_phi_phat_sinh`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_chi_phi` | `nvarchar(12)` | PK |
| `ma_doi_soat` | `nvarchar(12)` | FK → `bang_doi_soat` |
| `loai_chi_phi` | `nvarchar(30)` | `no_tien_thue`, `dien_nuoc`, `hu_hong`, `phat_vi_pham`, `khac` |
| `so_tien` | `decimal(12,2)` | >= 0 |
| `mo_ta` | `nvarchar(max)` | NULL |

# 27. `bien_ban_tra_phong`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_bb_tra` | `nvarchar(12)` | PK |
| `ma_doi_soat` | `nvarchar(12)` | FK → `bang_doi_soat`, UQ |
| `ma_quan_ly` | `nvarchar(10)` | FK → `nhan_vien` |
| `ngay_tra` | `date` | NOT NULL |
| `tinh_trang_phong` | `nvarchar(max)` | NULL |
| `chi_so_dien_cuoi` | `decimal(12,2)` | Chỉ số điện khi trả |
| `chi_so_nuoc_cuoi` | `decimal(12,2)` | Chỉ số nước khi trả |
| `da_thu_khoa` | `bit` | Mặc định `0` |
| `ghi_chu` | `nvarchar(max)` | NULL |

# 28. `hoa_don`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_hoa_don` | `nvarchar(12)` | PK |
| `ma_kh` | `nvarchar(12)` | FK → `khach_hang` |
| `ma_ke_toan` | `nvarchar(10)` | FK → `nhan_vien`, NULL |
| `ma_coc` | `nvarchar(12)` | FK → `phieu_dat_coc`, NULL |
| `ma_hop_dong` | `nvarchar(12)` | FK → `hop_dong_thue`, NULL |
| `ma_doi_soat` | `nvarchar(12)` | FK → `bang_doi_soat`, NULL |
| `loai_hoa_don` | `nvarchar(20)` | `tien_coc`, `tien_thue`, `dich_vu`, `hoan_coc`, `thu_them` |
| `loai_chung_tu` | `nvarchar(10)` | `thu` hoặc `chi` |
| `tong_tien` | `decimal(12,2)` | NOT NULL |
| `phuong_thuc` | `nvarchar(20)` | `tien_mat` hoặc `chuyen_khoan` |
| `ten_ngan_hang` | `nvarchar(100)` | NULL |
| `so_tai_khoan` | `nvarchar(50)` | NULL |
| `chu_tai_khoan` | `nvarchar(100)` | NULL |
| `ma_giao_dich` | `nvarchar(100)` | NULL |
| `anh_minh_chung` | `nvarchar(max)` | NULL |
| `ngay_lap` | `datetime2` | Mặc định UTC hiện tại |
| `ngay_thanh_toan` | `datetime2` | NULL |
| `trang_thai` | `nvarchar(20)` | `cho_thanh_toan`, `da_thanh_toan`, `huy` |
| `ky_thanh_toan` | `date` | Kỳ thuê nếu là tiền thuê |
| `ghi_chu` | `nvarchar(max)` | NULL |

# 29. `chi_tiet_hoa_don_dich_vu`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_hoa_don` | `nvarchar(12)` | PK, FK → `hoa_don` |
| `ma_dich_vu` | `nvarchar(12)` | PK, FK → `dich_vu` |
| `so_luong` | `decimal(12,2)` | > 0 |
| `don_gia` | `decimal(12,2)` | >= 0 |
| `thanh_tien` | `decimal(12,2)` | >= 0 |
| `ghi_chu` | `nvarchar(max)` | NULL |

# 30. `nhat_ky_quan_tri`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_nk` | `nvarchar(12)` | PK |
| `ma_nguoi_thuc` | `nvarchar(12)` | FK → `tai_khoan`, NOT NULL |
| `ma_doi_tuong` | `nvarchar(12)` | FK → `tai_khoan`, NULL |
| `loai_hanh_dong` | `nvarchar(30)` | Loại thao tác quản trị |
| `gia_tri_cu` | `nvarchar(max)` | JSON/text trước thay đổi |
| `gia_tri_moi` | `nvarchar(max)` | JSON/text sau thay đổi |
| `thoi_diem` | `datetime2` | Mặc định UTC hiện tại |
| `ghi_chu` | `nvarchar(max)` | NULL |

# 31. `thong_bao`

| Trường | Kiểu | Ràng buộc/ý nghĩa |
|---|---|---|
| `ma_thong_bao` | `nvarchar(12)` | PK |
| `ma_nguoi_gui` | `nvarchar(12)` | FK → `tai_khoan`, NULL nghĩa là hệ thống gửi |
| `ma_nguoi_nhan` | `nvarchar(12)` | FK → `tai_khoan`, NOT NULL |
| `tieu_de` | `nvarchar(200)` | NOT NULL |
| `noi_dung` | `nvarchar(max)` | NOT NULL |
| `ngay_tao` | `datetime2` | Mặc định UTC hiện tại |
| `da_doc` | `bit` | Mặc định `0` |
| `ngay_doc` | `datetime2` | NULL |

# 32. Tổng quan quan hệ

```text
chi_nhanh
├── phong
│   ├── giuong
│   ├── tai_san
│   ├── hinh_anh_phong
│   └── phong_tien_nghi ── tien_nghi
└── nhan_vien ── tai_khoan

khach_hang ── ho_so_dang_ky ── lich_xem_phong ── lich_xem_phong_phong ── phong
ho_so_dang_ky ── phieu_dat_coc ── dat_coc_giuong ── giuong
phieu_dat_coc ── hop_dong_thue ── thanh_vien_thue
hop_dong_thue ── bien_ban_ban_giao ── chi_tiet_ban_giao ── tai_san
hop_dong_thue ── bang_doi_soat ── chi_phi_phat_sinh
bang_doi_soat ── bien_ban_tra_phong
khach_hang ── hoa_don ── chi_tiet_hoa_don_dich_vu ── dich_vu
khach_hang ── tai_khoan
tai_khoan ── vai_tro_he_thong ── vai_tro_quyen ── quyen_he_thong
tai_khoan ── tham_so_he_thong (người sửa)
tai_khoan ── dich_vu (người sửa)
tai_khoan ── nhat_ky_quan_tri
tai_khoan ── thong_bao
```

# 33. Nội dung thêm/chỉnh so với `homestay_dorm.sql`

## 33.1. Giữ nguyên về nghiệp vụ

- Giữ đủ toàn bộ 28 bảng trong script PostgreSQL.
- Giữ tên bảng và tên cột tiếng Việt không dấu.
- Giữ khóa chính, khóa ngoại, unique, check constraint và trạng thái chính.
- Giữ công thức nghiệp vụ cọc, tỷ lệ hoàn, loại hóa đơn và loại chi phí.

## 33.2. Chuyển đổi kỹ thuật PostgreSQL → SQL Server

- `CHAR/VARCHAR` → `nvarchar` để lưu Unicode ổn định.
- `BOOLEAN` → `bit`.
- `NUMERIC` → `decimal`.
- `TIMESTAMP` → `datetime2` vì `timestamp` của SQL Server có nghĩa khác PostgreSQL.
- `CURRENT_TIMESTAMP` → `SYSUTCDATETIME()`.
- `ON UPDATE CASCADE` không được EF Core/SQL Server triển khai như PostgreSQL; ID là khóa ổn định và không cập nhật.
- Một số `ON DELETE SET NULL` được đổi thành `NO ACTION` tại quan hệ có nguy cơ multiple cascade path, đặc biệt hóa đơn và thông báo người gửi.
- Index có điều kiện PostgreSQL được biểu diễn bằng filtered index của SQL Server khi phù hợp.

## 33.3. Ba bảng bổ sung ngoài script

- `hinh_anh_phong`.
- `tien_nghi`.
- `phong_tien_nghi`.

Ba bảng này phục vụ màn tra cứu/hiển thị phòng và không thay thế bảng nào trong script.

## 33.4. Trường bổ sung vào `phong`

- `tang`.
- `dien_tich_m2`.
- `mo_ta`.
- `gioi_tinh_cho_phep`.
- `yeu_cau_yen_tinh`.
- `gio_gioi_nghiem`.

## 33.5. Trường bổ sung vào `ho_so_dang_ky`

Script gốc chỉ có số người, ngày dự kiến và yêu cầu khác. Để bám đề, bổ sung:

- `thoi_han_thue_thang`.
- `khu_vuc_mong_muon`.
- `loai_phong_mong_muon`.
- `gia_toi_thieu`, `gia_toi_da`.
- `gioi_tinh`.
- `gio_giac_sinh_hoat`.
- `yeu_cau_yen_tinh`.
- `yeu_cau_gui_xe`.
- `yeu_cau_dieu_hoa`.

## 33.6. Trường bổ sung cho bàn giao/trả phòng

- `bien_ban_ban_giao`: `chi_so_dien_dau`, `chi_so_nuoc_dau`.
- `bien_ban_tra_phong`: `chi_so_dien_cuoi`, `chi_so_nuoc_cuoi`.

Các trường này phục vụ đối chiếu điện nước đầu/cuối kỳ.

## 33.7. Trường bổ sung cho thông báo

- `ngay_tao`.
- `da_doc`.
- `ngay_doc`.

Thông báo chỉ để khách đọc; không thêm `action_url` hay liên kết điều hướng nghiệp vụ.
