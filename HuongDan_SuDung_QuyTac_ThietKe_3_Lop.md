# Hướng dẫn sử dụng quy tắc thiết kế 3 lớp

Tài liệu này hướng dẫn cách sử dụng file [QuyTac_ThietKe_3_Lop.md](./QuyTac_ThietKe_3_Lop.md) để thiết kế sơ đồ 3 lớp cho nhiều màn hình bằng draw.io, đặc biệt khi làm việc với AI.

## 1. Chuẩn bị danh sách màn hình

Trước khi yêu cầu AI vẽ, cần liệt kê đầy đủ các màn hình thuộc phạm vi thiết kế.

Ví dụ với actor Khách hàng:

```text
1. Đăng ký thuê
2. Xem lịch xem phòng
3. Xem nội quy, giá thuê của phòng/giường
4. Phòng/giường của tôi
5. Yêu cầu đặt cọc
6. Bổ sung hồ sơ nhận phòng
7. Xem và ký hợp đồng
8. Xem biên bản bàn giao
9. Yêu cầu trả phòng
10. Đối soát, thanh toán phát sinh và ký biên bản thanh lý
11. Thanh toán
12. Thông báo
```

Danh sách này giúp:

- Không bỏ sót màn hình.
- Không vẽ trùng chức năng.
- Xác định thứ tự thiết kế.
- Thống nhất cách đặt tên file.
- Biết màn hình nào dùng chung một đối tượng nghiệp vụ.

Nếu chưa chắc danh sách đã đủ, yêu cầu AI đọc đặc tả nghiệp vụ và route hiện tại để đối chiếu trước khi bắt đầu vẽ.

## 2. Chọn từng màn hình để thiết kế

Không nên yêu cầu AI vẽ tất cả màn hình trong một lần ngay từ đầu. Nên làm lần lượt từng màn hình để kiểm tra quy ước và sửa sai sớm.

Với mỗi màn hình, cần cung cấp ít nhất một trong các thông tin sau:

- Tên màn hình.
- Đường dẫn màn hình trên website.
- File frontend cài đặt màn hình.
- Ảnh chụp giao diện.
- Đặc tả use case liên quan.
- Bảng hoặc model dữ liệu liên quan.

Ví dụ:

```text
Thiết kế màn hình Xem lịch xem phòng.
Route hiện tại: /customer/viewings/:scheduleId
Đọc giao diện và backend hiện có để xác định control, dữ liệu và phương thức.
```

## 3. Yêu cầu AI đọc file quy tắc

Trong mỗi yêu cầu thiết kế, phải nhắc AI đọc file:

```text
Tasks/QuyTac_ThietKe_3_Lop.md
```

Không chỉ nói chung chung là “vẽ kiến trúc 3 lớp”, vì AI có thể tự dùng các mẫu `Controller`, `Service`, `Repository`, `DTO`, `BUS` hoặc `DAO` không đúng với quy ước đã chốt.

Mẫu yêu cầu ngắn:

```text
Đọc Tasks/QuyTac_ThietKe_3_Lop.md.
Dựa trên code hiện tại, tạo sơ đồ 3 lớp cho màn hình <Tên màn hình>.
Xuất file draw.io có thể chỉnh sửa.
```

## 4. Quy trình AI cần thực hiện

Khi nhận yêu cầu, AI nên thực hiện theo thứ tự sau:

1. Đọc toàn bộ `Tasks/QuyTac_ThietKe_3_Lop.md`.
2. Đọc màn hình frontend hoặc ảnh giao diện được chỉ định.
3. Đọc service, model và dữ liệu backend liên quan.
4. Xác định các control thật sự xuất hiện trên màn hình.
5. Loại bỏ Label chỉ dùng làm nhãn cho control nhập liệu.
6. Xác định đối tượng nghiệp vụ chính.
7. Liệt kê dữ liệu màn hình gửi xuống và dữ liệu đọc lên.
8. Xác định các phương thức nghiệp vụ.
9. Xác định các phương thức đọc, thêm, cập nhật hoặc xóa dữ liệu.
10. Tạo file `.drawio` theo cấu trúc ba lớp.
11. Kiểm tra XML draw.io hợp lệ.
12. Kiểm tra lại checklist trong file quy tắc.

AI không được tự thêm trường hoặc phương thức chỉ để sơ đồ trông đầy đủ. Mọi nội dung phải có căn cứ từ giao diện, nghiệp vụ, code hoặc cơ sở dữ liệu.

## 5. Mẫu yêu cầu đầy đủ cho AI

```text
Đọc kỹ file Tasks/QuyTac_ThietKe_3_Lop.md.

Thiết kế sơ đồ 3 lớp cho màn hình: <Tên màn hình>.

Nguồn cần đọc:
- Route: <Đường dẫn màn hình>
- Frontend: <Đường dẫn file frontend>
- Backend: <Đường dẫn controller/service liên quan nếu biết>
- Model hoặc bảng dữ liệu: <Tên model/bảng nếu biết>
- Đặc tả: <Đường dẫn file đặc tả nếu có>

Yêu cầu:
- Bám đúng giao diện và nghiệp vụ hiện tại.
- Dùng tên tiếng Việt không dấu.
- Chỉ giữ các control cần thiết.
- Liệt kê dữ liệu nhận xuống và đọc lên trong lớp nghiệp vụ.
- Không dùng hậu tố BUS hoặc DAO.
- Lớp dữ liệu dùng hậu tố DB.
- Không có tiêu đề sơ đồ, tiêu đề tầng hoặc chữ trên đường nối.
- Xuất file ThietKe3Lop_<TenManHinh>.drawio.
- Kiểm tra file draw.io mở được và chỉnh sửa được từng khối.
```

## 6. Ví dụ yêu cầu đã áp dụng

### 6.1. Màn hình Đăng ký thuê

```text
Đọc Tasks/QuyTac_ThietKe_3_Lop.md.
Dựa trên màn hình Đăng ký thuê hiện tại và nghiệp vụ tạo hồ sơ đăng ký thuê,
tạo file ThietKe3Lop_DangKyThue.drawio.
```

Kết quả mong đợi:

```text
MHDangKyThue
      ↓
HoSoDangKyThue
      ↓
HoSoDangKyThueDB
```

### 6.2. Màn hình Xem lịch xem phòng

```text
Đọc Tasks/QuyTac_ThietKe_3_Lop.md.
Dựa trên giao diện danh sách lịch, chi tiết lịch và nghiệp vụ khách xác nhận xem được thông tin phòng,
tạo file ThietKe3Lop_XemLichXemPhong.drawio.
```

Kết quả mong đợi:

```text
MHXemLichXemPhong
        ↓
LichXemPhong
        ↓
LichXemPhongDB
```

## 7. Khi nào cần cung cấp ảnh màn hình

Nên cung cấp ảnh khi:

- Code giao diện quá dài hoặc gồm nhiều component.
- Muốn AI bám đúng những control người dùng thật sự nhìn thấy.
- Màn hình hiện tại khác với đặc tả cũ.
- Có control chỉ xuất hiện theo trạng thái.
- Muốn loại bỏ các thành phần không cần đưa vào sơ đồ.

Khi có cả ảnh và code, AI phải dùng ảnh để xác định bố cục/control hiển thị, đồng thời dùng code và backend để xác định dữ liệu cùng phương thức.

## 8. Cách kiểm tra kết quả

Sau khi AI tạo file, mở bằng [app.diagrams.net](https://app.diagrams.net/) và kiểm tra:

1. Chọn **File → Open From → Device**.
2. Mở file `.drawio` vừa tạo.
3. Kiểm tra từng lớp có thể chọn và chỉnh sửa riêng.
4. Đối chiếu control với giao diện thật.
5. Đối chiếu thuộc tính nghiệp vụ với dữ liệu thật.
6. Đối chiếu phương thức DB với các thao tác dữ liệu thực tế.
7. Kiểm tra không còn tiêu đề hoặc nhãn đường nối thừa.
8. Kiểm tra cách đặt tên thống nhất với các sơ đồ đã hoàn thành.

Nếu có điểm chưa đúng, nên sửa quy tắc hoặc yêu cầu AI cập nhật ngay màn hình mẫu trước, rồi mới tiếp tục các màn hình còn lại.

## 9. Cách làm cho toàn bộ danh sách màn hình

Sau khi hai hoặc ba màn hình đầu đã được duyệt, có thể yêu cầu AI làm lần lượt phần còn lại:

```text
Đọc Tasks/QuyTac_ThietKe_3_Lop.md và danh sách màn hình đã chốt.
Thiết kế lần lượt từng màn hình, mỗi màn hình xuất một file draw.io riêng.
Trước khi tạo file, đọc giao diện, nghiệp vụ và dữ liệu của màn hình đó.
Không gộp nhiều màn hình vào cùng một file nếu chưa được yêu cầu.
```

Quy tắc đặt tên file:

```text
ThietKe3Lop_<TenManHinh>.drawio
```

Ví dụ:

```text
ThietKe3Lop_DangKyThue.drawio
ThietKe3Lop_XemLichXemPhong.drawio
ThietKe3Lop_YeuCauDatCoc.drawio
ThietKe3Lop_ThanhToan.drawio
```

## 10. Nguyên tắc chốt

- Liệt kê và chốt danh sách màn hình trước.
- Thiết kế từng màn hình, không làm hàng loạt khi mẫu chưa được duyệt.
- Luôn yêu cầu đọc file quy tắc trước khi vẽ.
- Luôn đọc giao diện và nghiệp vụ thật của màn hình.
- Mỗi màn hình mặc định xuất một file draw.io riêng.
- Dùng các sơ đồ đã được duyệt làm mẫu trực quan cho sơ đồ tiếp theo.
- Khi quy ước thay đổi, cập nhật file quy tắc trước rồi mới áp dụng cho các màn hình còn lại.
