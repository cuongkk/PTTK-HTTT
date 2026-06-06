import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Toggle } from "../ui/toggle";
import { Slider } from "../ui/slider";
import { Settings, Clock3, Percent, ShieldCheck, BellRing, Save } from "lucide-react";

export function SystemSettings() {
  const policies = [
    { title: "Tỷ lệ hoàn cọc", description: "Chọn phần trăm được hoàn lại khi chấm dứt hợp đồng.", value: "70%", icon: Percent },
    { title: "Thời gian miễn phí thanh toán", description: "Trì hoãn thanh toán trong bao lâu trước khi trạng thái quá hạn được kích hoạt.", value: "24 giờ", icon: Clock3 },
    { title: "SLA phê duyệt tài khoản", description: "Tự động nâng cấp các yêu cầu đang chờ nếu chúng vượt quá SLA.", value: "48 giờ", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3">Cấu hình thông số hệ thống</Badge>
          <h1 className="text-3xl font-bold text-slate-900">Thiết lập hệ thống</h1>
          <p className="mt-2 text-slate-600">
            Duy trì các cài đặt toàn cầu ảnh hưởng đến vận hành, bao gồm tỷ lệ hoàn cọc, cửa sổ thanh toán, và SLA phê duyệt.
          </p>
        </div>
        <Button className="w-fit">
          <Save className="h-4 w-4" />
          Lưu thay đổ<i></i>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {policies.map((policy) => {
          const Icon = policy.icon;
          return (
            <Card key={policy.title} className="shadow-sm border-slate-200/80">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-purple-50 p-3 text-purple-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline">Hoạt động</Badge>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{policy.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{policy.description}</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">{policy.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="shadow-sm border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-slate-900">Trình chỉnh sửa chính sách</CardTitle>
            <CardDescription>Điều chỉnh các thông số toàn cầu được thay đổi thường xuyên.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Tỷ lệ hoàn cọc</label>
                <span className="text-sm text-slate-500">70%</span>
              </div>
              <Slider defaultValue={[70]} max={100} step={10} />
              <p className="text-xs text-slate-500">Được sử dụng khi tính toán số tiền được hoàn lại sau khi chấm dứt hợp đồng.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Thời gian chờ thanh toán</label>
                <Input defaultValue="24" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Thời gian tự động nâng cấp</label>
                <Input defaultValue="48" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline">Xem trước ảnh hưởng</Button>
              <Button>Cam kết chính sách</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-slate-900">Công tắc vận hành</CardTitle>
            <CardDescription>Bật hoặc tắt các tính năng xuyên module mà không cần triển khai lại.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Email cảnh báo thanh toán quá hạn", description: "Thông báo cho bộ phận kế toán và liên hệ người thuê.", enabled: true },
              { label: "Audit trail cho thay đổi phòng", description: "Ghi lại nhật ký vĩnh viễn cho các cập nhật phòng và giường.", enabled: true },
              { label: "Khóa bảo trì cho phòng trống", description: "Chặn đặt phòng khi một phòng được đánh dấu đang bảo trì.", enabled: false },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-slate-500" />
                    <h4 className="font-medium text-slate-900">{item.label}</h4>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </div>
                <Toggle pressed={item.enabled} aria-label={item.label} />
              </div>
            ))}

            <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
              <div className="flex items-center gap-2 font-medium">
                <BellRing className="h-4 w-4" />
                Nhắc nhở xem xét thay đổi
              </div>
              <p className="mt-1 text-blue-800">
                Mọi cập nhật chính sách đều được ghi lại để kiểm toán và có thể được xem xét bởi quản trị viên hệ thống.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
