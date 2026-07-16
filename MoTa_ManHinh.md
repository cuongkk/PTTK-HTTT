# Mô tả màn hình Sale

## 1: Hồ sơ đăng ký

Màn hình hiển thị danh sách hồ sơ khách hàng đang chờ Sale xử lý.

Thành phần giao diện:

- Ô tìm kiếm theo tên khách hàng, mã đăng ký, số điện thoại hoặc phòng.
- Bộ lọc theo công việc của hồ sơ.
- Danh sách hồ sơ dạng thẻ.
- Mỗi thẻ hiển thị mã hồ sơ, khách hàng, thông tin liên hệ, phòng, yêu cầu thuê, trạng thái và thao tác phù hợp.
- Nút quay lại trang **Công việc của tôi**.

Từ danh sách này, Sale đi tới 3 màn nghiệp vụ sau.

## 1.1 Phân phòng & Sắp lịch xem phòng

Màn hình dùng để xem yêu cầu của khách và lựa chọn phòng phù hợp.

Thành phần giao diện:

- Thông tin khách hàng và hồ sơ đăng ký.
- Loại phòng, khu vực, số người và khoảng giá mong muốn.
- Ngày dự kiến vào ở và thời hạn thuê.
- Giờ sinh hoạt và các yêu cầu về yên tĩnh, chỗ gửi xe, điều hòa.
- Danh sách phòng có thể lựa chọn.
- Bảng đối chiếu yêu cầu của khách với thông tin từng phòng.
- Trường chọn ngày, giờ xem phòng.
- Trường ghi chú lịch hẹn.
- Nút xác nhận sắp lịch xem phòng.
- Trạng thái **Chờ khách xác nhận** khi lịch chưa được khách xác nhận.
- Nút **Xác nhận đã xem** khi khách đang xem phòng.

## 1.2 Rà soát hồ sơ cọc

Màn hình hiển thị thông tin hồ sơ trước khi chuyển sang bước xác nhận đặt cọc.

Thành phần giao diện:

- Mã hồ sơ.
- Họ tên khách hàng.
- Số điện thoại và email.
- Phòng đã chọn và khu vực.
- Số người đăng ký.
- Giới tính và mức giá mong muốn.
- Ngày đăng ký.
- Thông tin lịch xem phòng đã hoàn thành.
- Nút xác nhận rà soát hồ sơ cọc.

Màn hình không có nút yêu cầu bổ sung và không có nút hủy hồ sơ.

## 1.3 Đối chiếu nhận phòng

Màn hình dùng để Sale xem và đối chiếu danh sách người thuê trước khi xác nhận.

Thành phần giao diện:

- Mã hồ sơ và phòng nhận.
- Số người đăng ký và số người đã khai.
- Danh sách người thuê.
- Họ tên và vai trò của từng người.
- Giới tính và quốc tịch.
- CCCD hoặc giấy tờ tùy thân.
- Loại giấy tờ và ảnh giấy tờ.
- Ngày sinh.
- Nghề nghiệp hoặc trường học.
- Địa chỉ thường trú.
- Danh sách cảnh báo khi hồ sơ còn thiếu hoặc chưa hợp lệ.
- Nút **Đối chiếu nhận phòng**; nút bị khóa khi hồ sơ chưa đủ thông tin.

Màn hình không có nút yêu cầu bổ sung và không có nút hủy hồ sơ.

## 2 Phiếu đặt cọc

Màn hình hiển thị danh sách phiếu đặt cọc liên quan đến công việc và quá trình theo dõi của Sale.

Thành phần giao diện:

- Ô tìm kiếm theo tên khách hàng, mã phiếu cọc hoặc phòng.
- Bảng danh sách phiếu đặt cọc.
- Cột mã phiếu cọc.
- Cột khách hàng và số điện thoại.
- Cột phòng và khu vực.
- Cột số tiền cọc.
- Cột hạn giữ chỗ.
- Cột trạng thái.
- Cột thao tác.
- Trạng thái **Chờ khách thanh toán** đối với phiếu chưa có minh chứng thanh toán.
- Trạng thái **Chờ Kế toán xác nhận** đối với phiếu đã có minh chứng thanh toán.
- Nút **Lập HĐ thuê** khi phiếu cọc đã hoàn thành và hồ sơ đủ điều kiện.
- Nút xem hoặc xử lý phù hợp với trạng thái của phiếu.
- Thông báo khi không có phiếu đặt cọc cần Sale xử lý hoặc theo dõi.

Các phiếu đang chờ khách thanh toán hoặc chờ Kế toán xác nhận chỉ hiển thị để theo dõi, không có thao tác xử lý của Sale.

### 2.1 Lập phiếu đặt cọc

Màn hình hiển thị trực tiếp hợp đồng đặt cọc cùng thông tin người thuê.

Thành phần giao diện:

- Mã hồ sơ đăng ký.
- Khách hàng đại diện, số điện thoại và email.
- Số người ở và phòng đăng ký.
- Danh sách người thuê gồm họ tên, vai trò, giới tính, CCCD hoặc giấy tờ và địa chỉ thường trú.
- Nội dung hợp đồng đặt cọc giữ chỗ.
- Bên nhận đặt cọc và bên đặt cọc.
- Phòng hoặc giường được giữ chỗ.
- Mục đích và thời hạn đặt cọc.
- Trường nhập số tiền cọc.
- Trường chọn hạn thanh toán.
- Nút **Xác nhận lập phiếu đặt cọc**.
- Nút quay lại.

Màn hình không có bước xem trước bản nháp.

## 3 HĐ thuê phòng

Màn hình hiển thị các hồ sơ thuộc công việc của Sale và đã đủ điều kiện lập hợp đồng thuê phòng.

Thành phần giao diện:

- Ô tìm kiếm theo tên khách hàng, mã phiếu cọc hoặc phòng.
- Bảng danh sách hồ sơ đủ điều kiện lập hợp đồng thuê.
- Cột mã phiếu đặt cọc.
- Cột khách hàng và số điện thoại.
- Cột phòng và khu vực.
- Cột số tiền cọc.
- Cột hạn giữ chỗ.
- Trạng thái **Đủ điều kiện lập HĐ thuê**.
- Nút **Lập HĐ thuê** tại từng hồ sơ.
- Thông báo khi không có hồ sơ cần Sale lập hợp đồng thuê.

Màn hình chỉ hiển thị những hồ sơ mà Sale cần thực hiện việc lập hợp đồng thuê.

### 3.1 Lập hợp đồng thuê

Màn hình hiển thị trực tiếp hợp đồng thuê phòng cùng thông tin người thuê và phiếu cọc tham chiếu.

Thành phần giao diện:

- Mã phiếu đặt cọc tham chiếu.
- Mã hồ sơ đăng ký.
- Khách hàng đại diện và số điện thoại.
- Phòng thuê và số người ở.
- Danh sách người thuê gồm họ tên, vai trò, giới tính, CCCD hoặc giấy tờ và địa chỉ thường trú.
- Nội dung hợp đồng thuê phòng.
- Bên cho thuê và bên thuê.
- Phòng hoặc giường thuê.
- Trường chọn ngày bắt đầu nhận phòng.
- Trường chọn thời hạn hợp đồng.
- Trường nhập giá thuê hàng tháng.
- Trường chọn kỳ thanh toán.
- Trường nhập các dịch vụ đi kèm.
- Nút **Xác nhận lập hợp đồng thuê**.
- Nút quay lại.

Màn hình không có bước xem trước bản nháp.

## 4 Trả phòng & Hoàn cọc

Màn hình tập hợp các công việc của Sale liên quan đến kết thúc quá trình thuê phòng.

Thành phần giao diện:

- Ô tìm kiếm theo tên khách hàng, mã hợp đồng, mã phiếu cọc hoặc phòng.
- Khu vực **Xác nhận lịch trả phòng** hiển thị các yêu cầu đang chờ Sale xác nhận lịch.
- Khu vực **Tiếp nhận hoàn cọc** hiển thị các yêu cầu đang chờ Sale tiếp nhận.
- Mỗi dòng hiển thị khách hàng, phòng, thông tin tham chiếu, thời gian yêu cầu, trạng thái và thao tác phù hợp.
- Thông báo riêng tại từng khu vực khi không có công việc cần xử lý.

Khi Sale nhấn nút xử lý, hệ thống mở màn hình con tương ứng thay cho việc xử lý trực tiếp trong danh sách.

### 4.1 Xác nhận lịch trả phòng

Màn hình hiển thị đầy đủ yêu cầu trả phòng để Sale kiểm tra và xác nhận lịch hẹn.

Thành phần giao diện:

- Mã hợp đồng thuê và mã phiếu đặt cọc tham chiếu.
- Họ tên khách hàng và số điện thoại.
- Phòng thuê và khu vực.
- Thời điểm khách gửi yêu cầu trả phòng.
- Ngày, giờ khách dự kiến trả phòng.
- Lý do trả phòng và ghi chú của khách.
- Trạng thái hiện tại của yêu cầu.
- Khối thông tin điều kiện tiếp nhận, giúp Sale nhận biết hồ sơ có đủ điều kiện xác nhận hay không.
- Phần mô tả kết quả sau khi xác nhận lịch.
- Nút **Xác nhận lịch trả phòng**.
- Nút **Quay lại** danh sách Trả phòng & Hoàn cọc.
- Thông báo lỗi và khóa nút xác nhận khi yêu cầu không còn hợp lệ để xử lý.

### 4.2 Tiếp nhận hoàn cọc

Màn hình hiển thị yêu cầu hoàn cọc để Sale kiểm tra trước khi tiếp nhận và chuyển sang bước xử lý tiếp theo.

Thành phần giao diện:

- Mã phiếu đặt cọc.
- Họ tên khách hàng và số điện thoại.
- Phòng liên quan và khu vực.
- Số tiền cọc đã thanh toán.
- Ngày thanh toán cọc.
- Thời điểm khách gửi yêu cầu hoàn cọc.
- Lý do hoàn cọc và ghi chú của khách.
- Trạng thái hiện tại của yêu cầu.
- Khối thông tin điều kiện tiếp nhận, giúp Sale nhận biết yêu cầu có đủ điều kiện xử lý hay không.
- Thông tin chính sách và số tiền hoàn dự kiến để Sale đối chiếu.
- Phần mô tả kết quả sau khi tiếp nhận yêu cầu.
- Nút **Tiếp nhận hoàn cọc**.
- Nút **Quay lại** danh sách Trả phòng & Hoàn cọc.
- Thông báo lỗi và khóa nút tiếp nhận khi yêu cầu không còn hợp lệ để xử lý.
