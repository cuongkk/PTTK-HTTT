# Quy tắc thiết kế sơ đồ 3 lớp

Tài liệu này quy định cách thiết kế sơ đồ 3 lớp cho từng màn hình của hệ thống HomeStay Dorm. Mục tiêu là tạo sơ đồ tối giản, dễ đọc, thống nhất và có thể chỉnh sửa bằng draw.io.

## 1. Cấu trúc bắt buộc

Mỗi màn hình được thiết kế theo ba lớp từ trên xuống dưới:

```text
MH<TenChucNang>
       ↓
<DoiTuongNghiepVu>
       ↓
<DoiTuongNghiepVu>DB
```

Ví dụ:

```text
MHDangKyThue
       ↓
HoSoDangKyThue
       ↓
HoSoDangKyThueDB
```

Không ghi thêm các tiêu đề như:

- `TẦNG GIAO DIỆN (GUI)`
- `TẦNG NGHIỆP VỤ (BUS)`
- `TẦNG DỮ LIỆU (DAO)`
- `THIẾT KẾ KIẾN TRÚC 3 LỚP...`

Không ghi nội dung trên đường nối như `gửi dữ liệu`, `xử lý nghiệp vụ` hoặc `đọc/ghi dữ liệu`.

## 2. Quy tắc đặt tên

- Tên lớp và thuộc tính dùng tiếng Việt không dấu, viết PascalCase.
- Tên phương thức dùng tiếng Việt không dấu, bắt đầu bằng động từ.
- Lớp màn hình có tiền tố `MH`.
- Lớp nghiệp vụ không thêm hậu tố `BUS`.
- Lớp dữ liệu thêm hậu tố `DB`.
- Không dùng hậu tố `DAO`.

Ví dụ đúng:

```text
MHDangKyThue
HoSoDangKyThue
HoSoDangKyThueDB
```

Ví dụ không dùng:

```text
RentalRegistration
HoSoDangKyThueBUS
HoSoDangKyThueDAO
```

## 3. Lớp màn hình

Lớp màn hình mô tả các control người dùng trực tiếp nhìn thấy hoặc thao tác.

### 3.1. Tiền tố control

| Control | Cách đặt tên | Ví dụ |
|---|---|---|
| TextBox | `txt<ThuocTinh>` | `txtSoNguoiDuKienO : TextBox` |
| ComboBox | `cbo<ThuocTinh>` | `cboGioiTinh : ComboBox` |
| DateTimePicker | `dtp<ThuocTinh>` | `dtpNgayDuKienVao : DateTimePicker` |
| CheckBox | `chk<ThuocTinh>` | `chkCanDieuHoa : CheckBox` |
| TextArea | `txt<ThuocTinh>` | `txtYeuCauKhac : TextArea` |
| Button | `btn<ThaoTac>` | `btnDangKyThue : Button` |
| DataGridView | `dgv<NoiDung>` | `dgvDanhSachHoaDon : DataGridView` |
| Label chỉ hiển thị | `lbl<ThuocTinh>` | `lblTrangThai : Label` |

### 3.2. Quy tắc dùng Label

Nếu một nhãn chỉ mô tả cho TextBox, ComboBox, DateTimePicker hoặc control nhập liệu khác thì không liệt kê nhãn đó.

Ví dụ chỉ ghi:

```text
- txtSoNguoiDuKienO : TextBox
```

Không ghi đồng thời:

```text
- lblSoNguoiDuKienO : Label
- txtSoNguoiDuKienO : TextBox
```

Chỉ ghi `lbl... : Label` khi đó là dữ liệu chỉ hiển thị và không có control nhập tương ứng, ví dụ:

```text
- lblMaHoSo : Label
- lblTrangThai : Label
- lblThongBaoKetQua : Label
```

### 3.3. Phương thức màn hình

Chỉ liệt kê các sự kiện hoặc thao tác chính:

```text
+ HienThi()
+ btnDangKyThue_Click()
+ btnQuayLai_Click()
```

Không đưa các hàm kỹ thuật của framework vào sơ đồ.

## 4. Lớp nghiệp vụ

Lớp nghiệp vụ biểu diễn đối tượng chính mà màn hình xử lý. Lớp này gồm hai phần:

1. Các trường dữ liệu nhận từ màn hình hoặc đọc từ cơ sở dữ liệu.
2. Các phương thức kiểm tra và xử lý nghiệp vụ.

### 4.1. Thuộc tính

Thuộc tính phải cover đủ:

- Dữ liệu người dùng nhập trên màn hình.
- Mã định danh cần dùng trong xử lý.
- Trạng thái nghiệp vụ.
- Dữ liệu hệ thống sinh ra và trả về màn hình.

Ví dụ:

```text
HoSoDangKyThue

- MaHoSo : String
- MaKhachHang : String
- SoNguoiDuKienO : Integer
- GioiTinh : String
- KhuVucMongMuon : String
- HinhThucThue : String
- MucGiaToiThieu : Decimal
- MucGiaToiDa : Decimal
- NgayDuKienVao : Date
- ThoiHanThue : Integer
- TrangThai : String
- NgayTao : DateTime
```

Không thêm trường không được màn hình, nghiệp vụ hoặc cơ sở dữ liệu sử dụng.

### 4.2. Phương thức

Phương thức phải thể hiện quy tắc hoặc thao tác nghiệp vụ, không mô tả thao tác giao diện.

Ví dụ:

```text
+ KiemTraThongTin(hoSo : HoSoDangKyThue) : Boolean
+ TaoHoSoDangKy(maTaiKhoan : String, hoSo : HoSoDangKyThue) : String
+ GanNhanVienSale(maHoSo : String) : Boolean
```

Tham số và kiểu trả về phải được ghi rõ.

## 5. Lớp dữ liệu

Lớp dữ liệu có tên bằng tên đối tượng nghiệp vụ cộng hậu tố `DB`:

```text
HoSoDangKyThueDB
```

Lớp này chỉ chứa các phương thức đọc, thêm, cập nhật hoặc xóa dữ liệu. Không đặt quy tắc nghiệp vụ trong lớp DB.

Ví dụ:

```text
+ DocKhachHang(maTaiKhoan : String) : KhachHang
+ ThemHoSoDangKy(hoSo : HoSoDangKyThue) : Boolean
+ ThemNguoiDungTen(thanhVien : ThanhVienThue) : Boolean
+ ThemThongBaoSale(thongBao : ThongBao) : Boolean
```

Khi thêm hoặc cập nhật đối tượng chính, lớp DB nhận trực tiếp đối tượng nghiệp vụ làm tham số.

## 6. Quan hệ giữa các lớp

Chỉ vẽ các quan hệ thật sự cần thiết:

```text
Màn hình → Lớp nghiệp vụ → Lớp DB
```

Quy tắc trình bày:

- Sắp xếp theo chiều dọc.
- Mỗi lớp nằm trong một khối UML có tên, thuộc tính và phương thức.
- Đường nối không cần nhãn.
- Không thêm Controller, Service, DTO, API Client hoặc framework class vào sơ đồ tối giản.
- Chỉ tách thêm lớp nghiệp vụ hoặc lớp DB khi màn hình thật sự làm việc với nhiều đối tượng độc lập.

## 7. Quy tắc màu và định dạng draw.io

- Lớp màn hình: nền xanh nhạt.
- Lớp nghiệp vụ: nền vàng nhạt.
- Lớp dữ liệu: nền cam nhạt.
- Font đề xuất: Times New Roman.
- Tên lớp căn giữa và in đậm.
- Thuộc tính và phương thức căn trái.
- Không dùng bóng đổ hoặc trang trí không cần thiết.
- File đầu ra có định dạng `.drawio` và phải chỉnh sửa được từng khối.

## 8. Mẫu áp dụng cho màn hình mới

```text
MH<TenChucNang>

- txt<ThuocTinh> : TextBox
- cbo<ThuocTinh> : ComboBox
- dtp<ThuocTinh> : DateTimePicker
- chk<ThuocTinh> : CheckBox
- lbl<DuLieuChiHienThi> : Label
- btn<ThaoTac> : Button

+ HienThi()
+ btn<ThaoTac>_Click()


<DoiTuongNghiepVu>

- MaDoiTuong : String
- <ThuocTinhNghiepVu> : <KieuDuLieu>
- TrangThai : String

+ KiemTraThongTin(doiTuong : <DoiTuongNghiepVu>) : Boolean
+ XuLy(doiTuong : <DoiTuongNghiepVu>) : <KieuTraVe>


<DoiTuongNghiepVu>DB

+ DocThongTin(maDoiTuong : String) : <DoiTuongNghiepVu>
+ Them(doiTuong : <DoiTuongNghiepVu>) : Boolean
+ CapNhat(doiTuong : <DoiTuongNghiepVu>) : Boolean
```

## 9. Checklist trước khi hoàn thành

- [ ] Tên lớp và thuộc tính dùng tiếng Việt không dấu.
- [ ] Lớp màn hình có tiền tố `MH`.
- [ ] Lớp nghiệp vụ không có hậu tố `BUS`.
- [ ] Lớp dữ liệu có hậu tố `DB`, không dùng `DAO`.
- [ ] Không liệt kê Label đi kèm control nhập liệu.
- [ ] Label chỉ dùng cho dữ liệu chỉ hiển thị.
- [ ] Lớp nghiệp vụ có đủ dữ liệu nhận vào và trả ra.
- [ ] Phương thức có tham số và kiểu trả về rõ ràng.
- [ ] Lớp DB chỉ chứa thao tác dữ liệu.
- [ ] Không có tiêu đề tầng, tiêu đề sơ đồ hoặc nhãn trên đường nối.
- [ ] Sơ đồ được bố trí theo chiều dọc và tối giản.
- [ ] File `.drawio` mở được và chỉnh sửa được từng thành phần.
