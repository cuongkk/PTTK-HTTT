using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class DbSeeder
{
    public const string DefaultAdminUsername = "admin";
    public const string DefaultAdminPassword = "Admin@123";
    public const string DemoPassword = "Demo@123";

    public static async Task SeedAsync(AppDbContext db)
    {
        await SeedRolesAndPermissionsAsync(db);
        await SeedBranchesAsync(db);
        await SeedUsersAsync(db);
        await SeedSystemParametersAsync(db);
        await SeedRoomsAndBedsAsync(db);
        await SeedServicesAsync(db);
    }

    private static async Task SeedRolesAndPermissionsAsync(AppDbContext db)
    {
        var roles = new[]
        {
            new SystemRole { RoleId = EmployeePosition.SystemAdmin, RoleName = "Quản trị hệ thống", Description = "Toàn quyền quản trị hệ thống" },
            new SystemRole { RoleId = EmployeePosition.Manager, RoleName = "Quản lý", Description = "Quản lý chi nhánh và xác nhận nghiệp vụ" },
            new SystemRole { RoleId = EmployeePosition.Sales, RoleName = "Nhân viên kinh doanh", Description = "Tiếp nhận đăng ký và lập hợp đồng" },
            new SystemRole { RoleId = EmployeePosition.Accountant, RoleName = "Kế toán", Description = "Xử lý thanh toán và đối soát" },
            new SystemRole { RoleId = "khach_hang", RoleName = "Khách hàng", Description = "Người đăng ký và thuê chỗ ở" },
        };
        var permissions = new[]
        {
            new Permission { PermissionId = "quan_ly_nguoi_dung", PermissionName = "Quản lý người dùng" },
            new Permission { PermissionId = "quan_ly_danh_muc", PermissionName = "Quản lý phòng, giường và dịch vụ" },
            new Permission { PermissionId = "tiep_nhan_dang_ky", PermissionName = "Tiếp nhận đăng ký thuê" },
            new Permission { PermissionId = "lap_hop_dong", PermissionName = "Lập hợp đồng" },
            new Permission { PermissionId = "phe_duyet_hop_dong", PermissionName = "Phê duyệt hợp đồng" },
            new Permission { PermissionId = "xac_nhan_thanh_toan", PermissionName = "Xác nhận thanh toán" },
            new Permission { PermissionId = "doi_soat_tra_phong", PermissionName = "Đối soát trả phòng" },
            new Permission { PermissionId = "dang_ky_thue", PermissionName = "Đăng ký thuê phòng" },
        };

        foreach (var item in roles)
            if (!await db.SystemRoles.AnyAsync(x => x.RoleId == item.RoleId)) db.SystemRoles.Add(item);
        foreach (var item in permissions)
            if (!await db.Permissions.AnyAsync(x => x.PermissionId == item.PermissionId)) db.Permissions.Add(item);
        await db.SaveChangesAsync();

        var grants = new Dictionary<string, string[]>
        {
            [EmployeePosition.SystemAdmin] = permissions.Select(x => x.PermissionId).ToArray(),
            [EmployeePosition.Manager] = ["phe_duyet_hop_dong", "doi_soat_tra_phong"],
            [EmployeePosition.Sales] = ["tiep_nhan_dang_ky", "lap_hop_dong"],
            [EmployeePosition.Accountant] = ["xac_nhan_thanh_toan", "doi_soat_tra_phong"],
            ["khach_hang"] = ["dang_ky_thue"],
        };
        foreach (var (roleId, permissionIds) in grants)
            foreach (var permissionId in permissionIds)
                if (!await db.RolePermissions.AnyAsync(x => x.RoleId == roleId && x.PermissionId == permissionId))
                    db.RolePermissions.Add(new RolePermission { RoleId = roleId, PermissionId = permissionId });
        await db.SaveChangesAsync();
    }

    private static async Task SeedBranchesAsync(AppDbContext db)
    {
        var branches = new[]
        {
            new Branch { BranchId = "CN0000001", BranchName = "Chi nhánh Quận 5", Address = "227 Nguyễn Văn Cừ, Phường Chợ Quán, TP.HCM", PhoneNumber = "02838354266", Email = "quan5@homestaydorm.vn" },
            new Branch { BranchId = "CN0000002", BranchName = "Chi nhánh Thủ Đức", Address = "12 Võ Văn Ngân, Phường Thủ Đức, TP.HCM", PhoneNumber = "02837221234", Email = "thuduc@homestaydorm.vn" },
        };
        foreach (var item in branches)
            if (!await db.Branches.AnyAsync(x => x.BranchId == item.BranchId)) db.Branches.Add(item);
        await db.SaveChangesAsync();
    }

    private static async Task SeedUsersAsync(AppDbContext db)
    {
        var employees = new[]
        {
            ("NV00000001", "CN0000001", "Nguyễn Hoàng Admin", "admin", EmployeePosition.SystemAdmin, "admin@homestaydorm.vn", "0901000001", DefaultAdminPassword),
            ("NV00000002", "CN0000001", "Trần Minh Quản", "manager", EmployeePosition.Manager, "manager@homestaydorm.vn", "0901000002", DemoPassword),
            ("NV00000003", "CN0000001", "Lê Thu Sale", "sales", EmployeePosition.Sales, "sales@homestaydorm.vn", "0901000003", DemoPassword),
            ("NV00000004", "CN0000001", "Phạm Ngọc Kế Toán", "accountant", EmployeePosition.Accountant, "accountant@homestaydorm.vn", "0901000004", DemoPassword),
            ("NV00000005", "CN0000002", "Võ Hải Nam", "sales.td", EmployeePosition.Sales, "sales.td@homestaydorm.vn", "0901000005", DemoPassword),
        };
        foreach (var e in employees)
        {
            if (!await db.Employees.AnyAsync(x => x.EmployeeId == e.Item1))
                db.Employees.Add(new Employee { EmployeeId = e.Item1, BranchId = e.Item2, FullName = e.Item3, Position = e.Item5, Email = e.Item6, PhoneNumber = e.Item7, HireDate = new DateOnly(2025, 1, 2), IsActive = true });
            if (!await db.Accounts.AnyAsync(x => x.Username == e.Item4))
                db.Accounts.Add(new Account { AccountId = $"TK{e.Item1[2..]}", Username = e.Item4, PasswordHash = BCrypt.Net.BCrypt.HashPassword(e.Item8), RoleId = e.Item5, EmployeeId = e.Item1, VerifiedEmail = e.Item6, Status = AccountStatus.Active });
        }

        var customers = new[]
        {
            ("KH0000000001", "Nguyễn Gia Bảo", "079203000001", "0912000001", "bao.nguyen@example.com", "Nam", new DateOnly(2003, 5, 12), "customer1"),
            ("KH0000000002", "Trần Thảo My", "079204000002", "0912000002", "my.tran@example.com", "Nữ", new DateOnly(2004, 8, 20), "customer2"),
            ("KH0000000003", "Lê Quốc Anh", "079202000003", "0912000003", "anh.le@example.com", "Nam", new DateOnly(2002, 11, 3), "customer3"),
        };
        foreach (var c in customers)
        {
            if (!await db.Customers.AnyAsync(x => x.CustomerId == c.Item1))
                db.Customers.Add(new Customer { CustomerId = c.Item1, FullName = c.Item2, NationalId = c.Item3, PhoneNumber = c.Item4, Email = c.Item5, Gender = c.Item6, DateOfBirth = c.Item7, Nationality = "Việt Nam", Address = "TP.HCM" });
            if (!await db.Accounts.AnyAsync(x => x.Username == c.Item8))
                db.Accounts.Add(new Account { AccountId = $"TKKH{c.Item1[4..]}", Username = c.Item8, PasswordHash = BCrypt.Net.BCrypt.HashPassword(DemoPassword), RoleId = "khach_hang", CustomerId = c.Item1, VerifiedEmail = c.Item5, Status = AccountStatus.Active });
        }
        await db.SaveChangesAsync();
    }

    private static async Task SeedSystemParametersAsync(AppDbContext db)
    {
        var items = new[]
        {
            new SystemParameter { ParameterId = "tien_coc_so_thang", ParameterName = "Số tháng tiền thuê dùng tính cọc", ParameterGroup = "chinh_sach_coc", Value = "2", DataType = SystemParameterDataType.Number, Description = "Tiền cọc bằng tiền thuê hai tháng nhân số giường thuê." },
            new SystemParameter { ParameterId = "han_thanh_toan_coc", ParameterName = "Thời hạn thanh toán cọc", ParameterGroup = "chinh_sach_coc", Value = "24", DataType = SystemParameterDataType.Number, Description = "Số giờ khách được phép hoàn tất thanh toán cọc." },
            new SystemParameter { ParameterId = "hoan_coc_chua_ky", ParameterName = "Hoàn cọc khi chưa ký hợp đồng", ParameterGroup = "chinh_sach_hoan_coc", Value = "80", DataType = SystemParameterDataType.Number },
            new SystemParameter { ParameterId = "hoan_coc_duoi_6_thang", ParameterName = "Hoàn cọc khi ở dưới 6 tháng", ParameterGroup = "chinh_sach_hoan_coc", Value = "50", DataType = SystemParameterDataType.Number },
            new SystemParameter { ParameterId = "hoan_coc_tren_6_thang", ParameterName = "Hoàn cọc khi ở trên 6 tháng", ParameterGroup = "chinh_sach_hoan_coc", Value = "70", DataType = SystemParameterDataType.Number },
            new SystemParameter { ParameterId = "hoan_coc_dung_han", ParameterName = "Hoàn cọc khi hết hạn hợp đồng", ParameterGroup = "chinh_sach_hoan_coc", Value = "100", DataType = SystemParameterDataType.Number },
        };
        foreach (var item in items)
            if (!await db.SystemParameters.AnyAsync(x => x.ParameterId == item.ParameterId)) db.SystemParameters.Add(item);
        await db.SaveChangesAsync();
    }

    private static async Task SeedRoomsAndBedsAsync(AppDbContext db)
    {
        var rooms = new[]
        {
            new Room { RoomId = "P_Q5_101", BranchId = "CN0000001", RoomName = "Phòng 101", RoomType = RoomType.Shared, Capacity = 4, Area = "Khu A - Nam", RoomPrice = 6000000, HasAirConditioner = true, HasParking = true, Status = RoomBedStatus.Empty },
            new Room { RoomId = "P_Q5_102", BranchId = "CN0000001", RoomName = "Phòng 102", RoomType = RoomType.Shared, Capacity = 4, Area = "Khu A - Nữ", RoomPrice = 6200000, HasAirConditioner = true, HasParking = true, Status = RoomBedStatus.Rented },
            new Room { RoomId = "P_Q5_201", BranchId = "CN0000001", RoomName = "Phòng 201", RoomType = RoomType.Whole, Capacity = 2, Area = "Khu B", RoomPrice = 4500000, HasAirConditioner = true, HasParking = false, Status = RoomBedStatus.Deposited },
            new Room { RoomId = "P_Q5_202", BranchId = "CN0000001", RoomName = "Phòng 202", RoomType = RoomType.Whole, Capacity = 2, Area = "Khu B", RoomPrice = 4200000, HasAirConditioner = false, HasParking = true, Status = RoomBedStatus.Maintenance },
            new Room { RoomId = "P_TD_101", BranchId = "CN0000002", RoomName = "Phòng TD101", RoomType = RoomType.Shared, Capacity = 6, Area = "Khu C - Nam", RoomPrice = 7800000, HasAirConditioner = true, HasParking = true, Status = RoomBedStatus.Empty },
        };
        foreach (var item in rooms)
            if (!await db.Rooms.AnyAsync(x => x.RoomId == item.RoomId)) db.Rooms.Add(item);
        await db.SaveChangesAsync();

        var beds = new List<Bed>();
        foreach (var room in rooms)
            for (short number = 1; number <= room.Capacity; number++)
            {
                var status = room.Status == RoomBedStatus.Empty && number > 1 ? RoomBedStatus.Empty : room.Status;
                if (room.RoomId == "P_Q5_101" && number == 1) status = RoomBedStatus.Rented;
                beds.Add(new Bed { BedId = $"G{room.RoomId.Replace("_", "")}{number}", RoomId = room.RoomId, BedNumber = number, MonthlyRent = room.RoomPrice!.Value / room.Capacity, Status = status });
            }
        foreach (var item in beds)
            if (!await db.Beds.AnyAsync(x => x.BedId == item.BedId)) db.Beds.Add(item);
        await db.SaveChangesAsync();
    }

    private static async Task SeedServicesAsync(AppDbContext db)
    {
        var items = new[]
        {
            new Service { ServiceId = "DV00000001", ServiceName = "Điện sinh hoạt", ServiceType = ServiceType.Electricity, Unit = "kWh", UnitPrice = 4000, Description = "Tính theo chỉ số công tơ hàng tháng" },
            new Service { ServiceId = "DV00000002", ServiceName = "Nước sinh hoạt", ServiceType = ServiceType.Water, Unit = "m3", UnitPrice = 20000, Description = "Tính theo chỉ số đồng hồ nước" },
            new Service { ServiceId = "DV00000003", ServiceName = "Internet WiFi", ServiceType = ServiceType.Wifi, Unit = "phòng/tháng", UnitPrice = 150000 },
            new Service { ServiceId = "DV00000004", ServiceName = "Vệ sinh phòng", ServiceType = ServiceType.Cleaning, Unit = "lần", UnitPrice = 80000 },
            new Service { ServiceId = "DV00000005", ServiceName = "Gửi xe máy", ServiceType = ServiceType.Other, Unit = "xe/tháng", UnitPrice = 100000 },
        };
        foreach (var item in items)
            if (!await db.Services.AnyAsync(x => x.ServiceId == item.ServiceId)) db.Services.Add(item);
        await db.SaveChangesAsync();
    }
}
