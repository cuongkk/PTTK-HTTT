using Backend.Models;
using Backend.Utilities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class DbSeeder
{
    public const string DefaultAdminUsername = "admin";
    public const string DefaultAdminPassword = "Admin@123";

    public static async Task SeedAsync(AppDbContext db)
    {
        await SeedRolesAsync(db);
        await SeedDefaultAdminAsync(db);
        await SeedSystemParametersAsync(db);
        await SeedDefaultBranchAsync(db);
    }

    private static async Task SeedRolesAsync(AppDbContext db)
    {
        var roles = new[]
        {
            new SystemRole { RoleId = EmployeePosition.SystemAdmin, RoleName = "Quản trị hệ thống", Description = "Toàn quyền quản trị hệ thống" },
            new SystemRole { RoleId = EmployeePosition.Manager, RoleName = "Quản lý", Description = "Quản lý chi nhánh" },
            new SystemRole { RoleId = EmployeePosition.Sales, RoleName = "Sale", Description = "Nhân viên kinh doanh" },
            new SystemRole { RoleId = EmployeePosition.Accountant, RoleName = "Kế toán", Description = "Nhân viên kế toán" },
            new SystemRole { RoleId = "khach_hang", RoleName = "Khách hàng", Description = "Tài khoản khách hàng" },
        };

        foreach (var role in roles)
        {
            var exists = await db.SystemRoles.AnyAsync(r => r.RoleId == role.RoleId);
            if (!exists)
            {
                db.SystemRoles.Add(role);
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedDefaultAdminAsync(AppDbContext db)
    {
        var adminExists = await db.Accounts.AnyAsync(a => a.Username == DefaultAdminUsername);
        if (adminExists)
        {
            return;
        }

        var employeeId = IdGenerator.Generate("NV", 10);
        var employee = new Employee
        {
            EmployeeId = employeeId,
            FullName = "System Administrator",
            Position = EmployeePosition.SystemAdmin,
            IsActive = true,
            HireDate = DateOnly.FromDateTime(DateTime.UtcNow),
        };

        var account = new Account
        {
            AccountId = IdGenerator.Generate("TK", 12),
            Username = DefaultAdminUsername,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(DefaultAdminPassword),
            RoleId = EmployeePosition.SystemAdmin,
            EmployeeId = employeeId,
            Status = AccountStatus.Active,
        };

        db.Employees.Add(employee);
        db.Accounts.Add(account);
        await db.SaveChangesAsync();
    }

    private static async Task SeedSystemParametersAsync(AppDbContext db)
    {
        var parameters = new[]
        {
            new SystemParameter
            {
                ParameterId = "ty_le_hoan_coc",
                ParameterName = "Tỷ lệ hoàn cọc",
                ParameterGroup = "chinh_sach_coc",
                Value = "70",
                DataType = SystemParameterDataType.Number,
                Description = "Phần trăm được hoàn lại khi chấm dứt hợp đồng.",
            },
            new SystemParameter
            {
                ParameterId = "thoi_gian_mien_phi_tt",
                ParameterName = "Thời gian miễn phí thanh toán",
                ParameterGroup = "chinh_sach_thanh_toan",
                Value = "24",
                DataType = SystemParameterDataType.Number,
                Description = "Số giờ trì hoãn thanh toán trước khi trạng thái quá hạn được kích hoạt.",
            },
            new SystemParameter
            {
                ParameterId = "sla_phe_duyet_tk",
                ParameterName = "SLA phê duyệt tài khoản",
                ParameterGroup = "chinh_sach_tai_khoan",
                Value = "48",
                DataType = SystemParameterDataType.Number,
                Description = "Số giờ trước khi yêu cầu tài khoản đang chờ được tự động nâng cấp.",
            },
            new SystemParameter
            {
                ParameterId = "canh_bao_qua_han",
                ParameterName = "Email cảnh báo thanh toán quá hạn",
                ParameterGroup = "cong_tac_van_hanh",
                Value = "true",
                DataType = SystemParameterDataType.Boolean,
                Description = "Thông báo cho bộ phận kế toán và liên hệ người thuê khi quá hạn.",
            },
            new SystemParameter
            {
                ParameterId = "audit_trail_phong",
                ParameterName = "Audit trail cho thay đổi phòng",
                ParameterGroup = "cong_tac_van_hanh",
                Value = "true",
                DataType = SystemParameterDataType.Boolean,
                Description = "Ghi lại nhật ký vĩnh viễn cho các cập nhật phòng và giường.",
            },
            new SystemParameter
            {
                ParameterId = "khoa_bao_tri",
                ParameterName = "Khóa bảo trì cho phòng trống",
                ParameterGroup = "cong_tac_van_hanh",
                Value = "false",
                DataType = SystemParameterDataType.Boolean,
                Description = "Chặn đặt phòng khi một phòng được đánh dấu đang bảo trì.",
            },
        };

        foreach (var parameter in parameters)
        {
            var exists = await db.SystemParameters.AnyAsync(p => p.ParameterId == parameter.ParameterId);
            if (!exists)
            {
                db.SystemParameters.Add(parameter);
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedDefaultBranchAsync(AppDbContext db)
    {
        const string defaultBranchId = "CN0000001";
        var exists = await db.Branches.AnyAsync(b => b.BranchId == defaultBranchId);
        if (exists)
        {
            return;
        }

        db.Branches.Add(new Branch
        {
            BranchId = defaultBranchId,
            BranchName = "Chi nhánh trung tâm",
            Address = "Đang cập nhật",
        });

        await db.SaveChangesAsync();
    }
}
